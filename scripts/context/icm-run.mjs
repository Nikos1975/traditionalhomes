#!/usr/bin/env node

// Local ICM run provenance.
//
// PROVENANCE IS NOT AUTHORITY. A run record documents what a local run observed:
// who/what ran, on which branch and base, in which workspace and stage, which
// files were touched, which commands were run, which validation results were
// observed and which permissions were not granted. It never authorizes an edit,
// merge, push, deployment or publication.
//
// Run material is written only beneath `.agent/icm/`, which is untracked.

import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const defaultRoot = path.resolve(scriptDir, '../..');

export const SCHEMA_VERSION = 1;
export const RUN_STATUSES = ['created', 'running', 'blocked', 'completed'];
export const RESULTS = ['pass', 'fail', 'blocked', 'not-run'];
export const RUN_ID_PATTERN = /^[0-9]{8}T[0-9]{6}Z-[0-9a-f]{6}$/;

// Identity is immutable once a run exists. `currentCommit`, `status`,
// `changedFiles`, `commands`, `permissionBoundary` and `notes` are observational
// and may accumulate.
export const IMMUTABLE_FIELDS = [
  'schemaVersion',
  'runId',
  'createdAt',
  'repository',
  'branch',
  'baseCommit',
  'workspace',
  'stage',
  'task',
];

export const NOT_AUTHORIZED_BY_PROVENANCE = [
  'merge',
  'push',
  'force push',
  'deployment',
  'Cloudflare mutation',
  'publication',
  'social publishing',
];

// --------------------------------------------------------------------------
// Secret boundary. Small and fail-closed: credential material is refused,
// obvious key/token shapes are redacted before anything is persisted.
// --------------------------------------------------------------------------

const REFUSED_SECRET_PATTERNS = [
  /-----BEGIN [A-Z0-9 ]*PRIVATE KEY-----/,
  /\bAKIA[0-9A-Z]{16}\b/,
];

function redactSecrets(value) {
  let out = String(value);
  out = out.replace(/\b(bearer)\s+[A-Za-z0-9._~+/=-]{8,}/gi, '$1 [redacted]');
  out = out.replace(
    /\b(authorization|api[_-]?key|apikey|secret|token|password|passwd|pwd|cookie|credential)([a-z0-9_-]*)\s*([:=])\s*("?)[^\s"']+\4/gi,
    '$1$2$3 [redacted]',
  );
  out = out.replace(/\bsk-[A-Za-z0-9._-]{16,}/g, '[redacted]');
  out = out.replace(/\bgh[pousr]_[A-Za-z0-9]{16,}/g, '[redacted]');
  out = out.replace(/\bgithub_pat_[A-Za-z0-9_]{20,}/g, '[redacted]');
  out = out.replace(/\bxox[abposr]-[A-Za-z0-9-]{10,}/g, '[redacted]');
  return out;
}

export function sanitizeText(value, label = 'value') {
  const text = String(value ?? '');
  for (const pattern of REFUSED_SECRET_PATTERNS) {
    if (pattern.test(text)) {
      throw new Error(`refusing to record credential material in ${label}`);
    }
  }
  return redactSecrets(text);
}

// --------------------------------------------------------------------------
// Write boundary. Nothing is ever written outside `<root>/.agent/icm`.
// --------------------------------------------------------------------------

export function provenanceRoot(root) {
  return path.join(path.resolve(root), '.agent', 'icm');
}

export function assertSafeRunId(runId) {
  if (typeof runId !== 'string' || !RUN_ID_PATTERN.test(runId)) {
    throw new Error(`unsafe run id: ${String(runId)}`);
  }
  return runId;
}

function assertInside(base, target) {
  const relative = path.relative(base, target);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`refusing to write outside .agent/icm: ${target}`);
  }
  return target;
}

export function runDirectory(root, runId) {
  assertSafeRunId(runId);
  const base = provenanceRoot(root);
  return assertInside(base, path.join(base, 'runs', runId));
}

export function runArtifactPath(root, runId, name) {
  if (typeof name !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/i.test(name) || name.includes('..')) {
    throw new Error(`unsafe artifact name: ${String(name)}`);
  }
  const directory = runDirectory(root, runId);
  return assertInside(provenanceRoot(root), path.join(directory, name));
}

function writeFileAtomic(file, contents) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${randomBytes(4).toString('hex')}`;
  try {
    fs.writeFileSync(temporary, contents, { encoding: 'utf8', mode: 0o600 });
    fs.renameSync(temporary, file);
  } catch (error) {
    // Some mounted filesystems refuse rename/unlink. Fall back to a direct write
    // rather than leaving the run record unwritten.
    try {
      fs.rmSync(temporary, { force: true });
    } catch {
      /* ignore */
    }
    if (error?.code === 'ENOENT' || error?.code === 'EPERM' || error?.code === 'EACCES' || error?.code === 'EXDEV') {
      fs.writeFileSync(file, contents, 'utf8');
      return;
    }
    throw error;
  }
}

// --------------------------------------------------------------------------
// Run records
// --------------------------------------------------------------------------

function compactTimestamp(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function generateRunId(now = new Date(), entropy) {
  const suffix = entropy ?? randomBytes(3).toString('hex');
  const runId = `${compactTimestamp(now)}-${suffix}`;
  return assertSafeRunId(runId);
}

function gitValue(root, args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) return null;
  const value = (result.stdout ?? '').trim();
  return value.length ? value : null;
}

function normalizeChangedFile(value) {
  const text = sanitizeText(value, 'changed file').trim().replace(/\\/g, '/');
  if (!text) throw new Error('changed file must not be empty');
  if (path.posix.isAbsolute(text) || /^[A-Za-z]:/.test(text)) {
    throw new Error(`changed file must be repository-relative: ${text}`);
  }
  if (text.split('/').includes('..')) {
    throw new Error(`changed file must not traverse: ${text}`);
  }
  return text;
}

export function createRunRecord({
  repository,
  branch = null,
  baseCommit = null,
  currentCommit = null,
  workspace,
  stage,
  task,
  protectedFiles = [],
  notes = [],
  now = new Date(),
  runId,
}) {
  if (!workspace?.trim()) throw new Error('--workspace is required');
  if (!stage?.trim()) throw new Error('--stage is required');
  if (!task?.trim()) throw new Error('--task is required');
  const timestamp = now.toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    runId: runId ? assertSafeRunId(runId) : generateRunId(now),
    createdAt: timestamp,
    updatedAt: timestamp,
    repository: sanitizeText(repository ?? 'unknown', 'repository'),
    branch: branch ? sanitizeText(branch, 'branch') : null,
    baseCommit: baseCommit ? sanitizeText(baseCommit, 'base commit') : null,
    currentCommit: currentCommit ? sanitizeText(currentCommit, 'current commit') : null,
    workspace: sanitizeText(workspace.trim(), 'workspace'),
    stage: sanitizeText(stage.trim(), 'stage'),
    task: sanitizeText(task.trim(), 'task'),
    status: 'created',
    changedFiles: [],
    commands: [],
    validationSummary: summarizeValidation([]),
    protectedFiles: protectedFiles.map(normalizeChangedFile),
    permissionBoundary: {
      provenanceIsNotAuthority: true,
      notAuthorizedByThisRecord: [...NOT_AUTHORIZED_BY_PROVENANCE],
      notGranted: [],
      observedAuthorizedActions: [],
    },
    notes: notes.map((note) => sanitizeText(note, 'note')),
  };
}

export function summarizeValidation(commands) {
  const summary = { recorded: commands.length, pass: 0, fail: 0, blocked: 0, 'not-run': 0 };
  for (const entry of commands) {
    if (Object.prototype.hasOwnProperty.call(summary, entry.result)) summary[entry.result] += 1;
  }
  // Results are only ever counted from commands that were actually recorded.
  summary.evidence = commands.length ? 'observed' : 'none recorded';
  return summary;
}

export function assertIdentityUnchanged(previous, next) {
  for (const field of IMMUTABLE_FIELDS) {
    if (JSON.stringify(previous[field]) !== JSON.stringify(next[field])) {
      throw new Error(`run identity is immutable: ${field}`);
    }
  }
  return next;
}

export function loadRun(root, runId) {
  const file = runArtifactPath(root, runId, 'run.json');
  if (!fs.existsSync(file)) throw new Error(`no such run: ${runId}`);
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

export function renderReport(run) {
  const lines = [];
  lines.push(`# ICM run ${run.runId}`);
  lines.push('');
  lines.push('Provenance is not authority. This record documents what one local run');
  lines.push('observed. It authorizes nothing.');
  lines.push('');
  lines.push('## Identity');
  lines.push('');
  lines.push(`- Repository: ${run.repository}`);
  lines.push(`- Branch: ${run.branch ?? 'unrecorded'}`);
  lines.push(`- Base commit: ${run.baseCommit ?? 'unrecorded'}`);
  lines.push(`- Current commit: ${run.currentCommit ?? 'unrecorded'}`);
  lines.push(`- Workspace: ${run.workspace}`);
  lines.push(`- Stage: ${run.stage}`);
  lines.push(`- Task: ${run.task}`);
  lines.push(`- Status: ${run.status}`);
  lines.push(`- Created: ${run.createdAt}`);
  lines.push(`- Updated: ${run.updatedAt}`);
  lines.push('');
  lines.push('## Changed files');
  lines.push('');
  if (run.changedFiles.length) for (const file of run.changedFiles) lines.push(`- ${file}`);
  else lines.push('- none recorded');
  lines.push('');
  lines.push('## Protected files');
  lines.push('');
  if (run.protectedFiles.length) for (const file of run.protectedFiles) lines.push(`- ${file}`);
  else lines.push('- none recorded');
  lines.push('');
  lines.push('## Commands and validation observations');
  lines.push('');
  lines.push('Only commands that were actually run and recorded appear here. A result is');
  lines.push('an observation; nothing is inferred and no unrun check is reported as passing.');
  lines.push('');
  if (run.commands.length) {
    lines.push('| Command | Result | Summary | Recorded at |');
    lines.push('| --- | --- | --- | --- |');
    for (const entry of run.commands) {
      lines.push(`| ${entry.command} | ${entry.result} | ${entry.summary ?? ''} | ${entry.recordedAt} |`);
    }
  } else {
    lines.push('- none recorded');
  }
  lines.push('');
  const summary = run.validationSummary;
  lines.push(
    `Validation evidence: ${summary.evidence} (recorded ${summary.recorded}, pass ${summary.pass}, fail ${summary.fail}, blocked ${summary.blocked}, not-run ${summary['not-run']}).`,
  );
  lines.push('');
  lines.push('## Permission boundary');
  lines.push('');
  lines.push('This record does NOT authorize:');
  lines.push('');
  for (const item of run.permissionBoundary.notAuthorizedByThisRecord) lines.push(`- ${item}`);
  lines.push('');
  lines.push('Recording an action is not granting permission. Where an action below is');
  lines.push('listed as observed, it happened under separate explicit authorization and is');
  lines.push('reported here as a fact only.');
  lines.push('');
  lines.push('Permissions not granted for this run:');
  lines.push('');
  if (run.permissionBoundary.notGranted.length) {
    for (const item of run.permissionBoundary.notGranted) lines.push(`- ${item}`);
  } else {
    lines.push('- none recorded');
  }
  lines.push('');
  lines.push('Observed authorized actions:');
  lines.push('');
  if (run.permissionBoundary.observedAuthorizedActions.length) {
    for (const item of run.permissionBoundary.observedAuthorizedActions) lines.push(`- ${item}`);
  } else {
    lines.push('- none recorded');
  }
  lines.push('');
  lines.push('## Notes');
  lines.push('');
  if (run.notes.length) for (const note of run.notes) lines.push(`- ${note}`);
  else lines.push('- none recorded');
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function persist(root, run) {
  writeFileAtomic(runArtifactPath(root, run.runId, 'run.json'), `${JSON.stringify(run, null, 2)}\n`);
  writeFileAtomic(runArtifactPath(root, run.runId, 'report.md'), renderReport(run));
  return run;
}

// --------------------------------------------------------------------------
// Commands
// --------------------------------------------------------------------------

function parseArgs(argv) {
  const options = { _: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith('--')) {
      options._.push(arg);
      continue;
    }
    const key = arg.slice(2);
    const value = argv[index + 1];
    if (value === undefined || value.startsWith('--')) {
      options[key] = true;
      continue;
    }
    if (options[key] === undefined) options[key] = value;
    else if (Array.isArray(options[key])) options[key].push(value);
    else options[key] = [options[key], value];
    index += 1;
  }
  return options;
}

function list(value) {
  if (value === undefined || value === true) return [];
  return Array.isArray(value) ? value : [value];
}

function resolveRoot(options) {
  return options.root && options.root !== true ? path.resolve(options.root) : defaultRoot;
}

export function commandCreate(options) {
  const root = resolveRoot(options);
  const run = createRunRecord({
    repository: options.repository && options.repository !== true ? options.repository : path.basename(root),
    branch: options.branch && options.branch !== true ? options.branch : gitValue(root, ['branch', '--show-current']),
    baseCommit: options.base && options.base !== true ? options.base : gitValue(root, ['rev-parse', 'HEAD']),
    currentCommit: options.commit && options.commit !== true ? options.commit : gitValue(root, ['rev-parse', 'HEAD']),
    workspace: options.workspace === true ? '' : options.workspace,
    stage: options.stage === true ? '' : options.stage,
    task: options.task === true ? '' : options.task,
    protectedFiles: list(options.protected),
    notes: list(options.note),
    runId: options['run-id'] && options['run-id'] !== true ? options['run-id'] : undefined,
  });

  const directory = runDirectory(root, run.runId);
  if (fs.existsSync(path.join(directory, 'run.json'))) {
    throw new Error(`run already exists and is never overwritten: ${run.runId}`);
  }
  fs.mkdirSync(directory, { recursive: true });
  persist(root, run);
  return run;
}

export function commandRecord(options) {
  const root = resolveRoot(options);
  const runId = options.run === true ? undefined : options.run;
  const previous = loadRun(root, assertSafeRunId(runId));
  const next = JSON.parse(JSON.stringify(previous));

  if (previous.status === 'completed') {
    throw new Error(`run ${previous.runId} is completed and is not reopened`);
  }

  const command = options.command && options.command !== true ? options.command : null;
  if (command) {
    const result = options.result === true ? undefined : options.result;
    if (!RESULTS.includes(result)) {
      throw new Error(`--result must be one of: ${RESULTS.join(', ')} (results are observed, never assumed)`);
    }
    next.commands.push({
      command: sanitizeText(command, 'command'),
      result,
      summary: options.summary && options.summary !== true ? sanitizeText(options.summary, 'summary') : null,
      recordedAt: new Date().toISOString(),
    });
  }

  for (const file of list(options['changed-file'])) {
    const normalized = normalizeChangedFile(file);
    if (!next.changedFiles.includes(normalized)) next.changedFiles.push(normalized);
  }
  for (const note of list(options.note)) next.notes.push(sanitizeText(note, 'note'));
  for (const item of list(options['not-granted'])) {
    next.permissionBoundary.notGranted.push(sanitizeText(item, 'permission'));
  }
  for (const item of list(options['observed-authorized'])) {
    next.permissionBoundary.observedAuthorizedActions.push(sanitizeText(item, 'observed action'));
  }
  if (options.commit && options.commit !== true) {
    next.currentCommit = sanitizeText(options.commit, 'current commit');
  }

  if (options.status && options.status !== true) {
    if (!RUN_STATUSES.includes(options.status)) {
      throw new Error(`--status must be one of: ${RUN_STATUSES.join(', ')}`);
    }
    next.status = options.status;
  } else if (next.status === 'created') {
    next.status = 'running';
  }

  next.validationSummary = summarizeValidation(next.commands);
  next.updatedAt = new Date().toISOString();
  assertIdentityUnchanged(previous, next);
  return persist(root, next);
}

export function commandComplete(options) {
  const root = resolveRoot(options);
  const runId = options.run === true ? undefined : options.run;
  const previous = loadRun(root, assertSafeRunId(runId));
  if (previous.status === 'completed') {
    throw new Error(`run ${previous.runId} is already completed`);
  }
  const next = JSON.parse(JSON.stringify(previous));
  const status = options.status && options.status !== true ? options.status : 'completed';
  if (!['completed', 'blocked'].includes(status)) {
    throw new Error('--status for complete must be completed or blocked');
  }
  next.status = status;
  for (const note of list(options.note)) next.notes.push(sanitizeText(note, 'note'));
  if (options.commit && options.commit !== true) {
    next.currentCommit = sanitizeText(options.commit, 'current commit');
  }
  next.validationSummary = summarizeValidation(next.commands);
  next.updatedAt = new Date().toISOString();
  assertIdentityUnchanged(previous, next);
  return persist(root, next);
}

export function commandStatus(options) {
  // Read-only. This never writes to `.agent/icm/`.
  const root = resolveRoot(options);
  const runId = options.run === true ? undefined : options.run;
  return loadRun(root, assertSafeRunId(runId));
}

const USAGE = `Usage:
  node scripts/context/icm-run.mjs create --workspace <name> --stage <name> --task "<text>" [--root <dir>] [--base <sha>] [--commit <sha>] [--branch <name>] [--protected <path>]... [--note "<text>"]...
  node scripts/context/icm-run.mjs record --run <id> [--command "<cmd>" --result pass|fail|blocked|not-run] [--summary "<text>"] [--changed-file <path>]... [--not-granted "<text>"]... [--observed-authorized "<text>"]... [--status running|blocked] [--commit <sha>] [--note "<text>"]...
  node scripts/context/icm-run.mjs complete --run <id> [--status completed|blocked] [--note "<text>"]...
  node scripts/context/icm-run.mjs status --run <id> [--json]

Run material is written only beneath .agent/icm/, which is untracked.
Provenance is not authority: a record never authorizes merge, push, force push,
deployment, Cloudflare mutation, publication or social publishing.
`;

function main(argv) {
  const [command, ...rest] = argv;
  const options = parseArgs(rest);
  if (!command || command === '--help' || command === '-h' || options.help) {
    console.log(USAGE);
    return 0;
  }
  const handlers = {
    create: commandCreate,
    record: commandRecord,
    complete: commandComplete,
    status: commandStatus,
  };
  const handler = handlers[command];
  if (!handler) {
    console.error(`unknown command: ${command}\n\n${USAGE}`);
    return 2;
  }
  const run = handler(options);
  if (options.json) {
    console.log(JSON.stringify(run, null, 2));
  } else {
    console.log(`${command}: ${run.runId} (${run.status})`);
    console.log(`  ${path.join('.agent', 'icm', 'runs', run.runId)}`);
    console.log('  provenance is not authority: this record authorizes nothing.');
  }
  return 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    process.exit(main(process.argv.slice(2)));
  } catch (error) {
    console.error(`icm-run: ${error.message}`);
    process.exit(1);
  }
}
