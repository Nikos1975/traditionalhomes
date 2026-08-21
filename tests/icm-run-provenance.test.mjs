import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '..');
const cli = path.join(repoRoot, 'scripts', 'context', 'icm-run.mjs');
const auditScript = path.join(repoRoot, 'scripts', 'context', 'validate-icm.mjs');

function tempRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'icm-run-'));
  test.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}

function run(root, args) {
  return spawnSync(process.execPath, [cli, ...args, '--root', root], { encoding: 'utf8', cwd: repoRoot });
}

function createRun(root, extra = []) {
  const result = run(root, [
    'create',
    '--workspace',
    'site-engineering',
    '--stage',
    '01_implementation',
    '--task',
    'phase 16 fixture run',
    '--branch',
    'chore/example',
    '--base',
    'a'.repeat(40),
    '--commit',
    'b'.repeat(40),
    ...extra,
  ]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const runId = /create: (\S+)/.exec(result.stdout)?.[1];
  assert.ok(runId, `no run id in output: ${result.stdout}`);
  return runId;
}

function readRun(root, runId) {
  return JSON.parse(fs.readFileSync(path.join(root, '.agent', 'icm', 'runs', runId, 'run.json'), 'utf8'));
}

function readReport(root, runId) {
  return fs.readFileSync(path.join(root, '.agent', 'icm', 'runs', runId, 'report.md'), 'utf8');
}

test('a run is created only beneath .agent/icm', () => {
  const root = tempRoot();
  const runId = createRun(root);

  assert.ok(fs.existsSync(path.join(root, '.agent', 'icm', 'runs', runId, 'run.json')));
  assert.ok(fs.existsSync(path.join(root, '.agent', 'icm', 'runs', runId, 'report.md')));

  const topLevel = fs.readdirSync(root);
  assert.deepEqual(topLevel, ['.agent'], `run wrote outside .agent: ${topLevel.join(', ')}`);
});

test('the generated run id is filesystem safe and immutable in shape', () => {
  const root = tempRoot();
  const runId = createRun(root);
  assert.match(runId, /^[0-9]{8}T[0-9]{6}Z-[0-9a-f]{6}$/);
  assert.ok(!/[\s/\\:*?"<>|]/.test(runId), `unsafe run id characters: ${runId}`);
  assert.equal(readRun(root, runId).runId, runId);
});

test('run identity cannot be rewritten by a later record', () => {
  const root = tempRoot();
  const runId = createRun(root);
  const before = readRun(root, runId);

  const result = run(root, ['record', '--run', runId, '--note', 'later observation']);
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const after = readRun(root, runId);
  for (const field of ['schemaVersion', 'runId', 'createdAt', 'repository', 'branch', 'baseCommit', 'workspace', 'stage', 'task']) {
    assert.deepEqual(after[field], before[field], `identity field changed: ${field}`);
  }
});

test('branch, base commit and current commit provenance are recorded', () => {
  const root = tempRoot();
  const runId = createRun(root);
  const record = readRun(root, runId);

  assert.equal(record.branch, 'chore/example');
  assert.equal(record.baseCommit, 'a'.repeat(40));
  assert.equal(record.currentCommit, 'b'.repeat(40));

  const report = readReport(root, runId);
  assert.match(report, /Branch: chore\/example/);
  assert.match(report, new RegExp(`Base commit: ${'a'.repeat(40)}`));
});

test('workspace, stage and task provenance are recorded', () => {
  const root = tempRoot();
  const runId = createRun(root);
  const record = readRun(root, runId);

  assert.equal(record.workspace, 'site-engineering');
  assert.equal(record.stage, '01_implementation');
  assert.equal(record.task, 'phase 16 fixture run');

  const report = readReport(root, runId);
  assert.match(report, /Workspace: site-engineering/);
  assert.match(report, /Stage: 01_implementation/);
});

test('validation evidence is recorded and never invented', () => {
  const root = tempRoot();
  const runId = createRun(root);

  const fresh = readRun(root, runId);
  assert.deepEqual(fresh.commands, []);
  assert.equal(fresh.validationSummary.evidence, 'none recorded');
  assert.equal(fresh.validationSummary.pass, 0);
  assert.match(readReport(root, runId), /none recorded/);

  const missingResult = run(root, ['record', '--run', runId, '--command', 'npm run context:audit']);
  assert.equal(missingResult.status, 1);
  assert.match(missingResult.stderr, /--result must be one of/);

  const invented = run(root, ['record', '--run', runId, '--command', 'npm run build', '--result', 'probably-fine']);
  assert.equal(invented.status, 1);

  const recorded = run(root, [
    'record',
    '--run',
    runId,
    '--command',
    'npm run context:audit',
    '--result',
    'pass',
    '--summary',
    'ICM context audit passed',
  ]);
  assert.equal(recorded.status, 0, recorded.stderr || recorded.stdout);

  const after = readRun(root, runId);
  assert.equal(after.commands.length, 1);
  assert.equal(after.commands[0].result, 'pass');
  assert.equal(after.validationSummary.pass, 1);
  assert.equal(after.validationSummary.evidence, 'observed');
});

test('traversal and unsafe run ids are refused', () => {
  const root = tempRoot();
  for (const unsafe of ['../escape', '..', 'a/b', '20260101T000000Z-../x', 'not-a-run-id', '20260101T000000Z-ZZZZZZ']) {
    const result = run(root, ['status', '--run', unsafe]);
    assert.equal(result.status, 1, `accepted unsafe run id: ${unsafe}`);
    assert.match(result.stderr, /unsafe run id|no such run/);
  }

  const created = run(root, [
    'create',
    '--workspace',
    'w',
    '--stage',
    's',
    '--task',
    't',
    '--run-id',
    '../../escape',
  ]);
  assert.equal(created.status, 1);
  assert.match(created.stderr, /unsafe run id/);
});

test('writes outside .agent/icm are refused', async () => {
  const root = tempRoot();
  const module = await import(pathToFileURL(cli).href);

  assert.throws(() => module.runArtifactPath(root, module.generateRunId(), '../../run.json'), /unsafe artifact name/);
  assert.throws(() => module.runArtifactPath(root, module.generateRunId(), '/etc/passwd'), /unsafe artifact name/);
  assert.throws(() => module.runDirectory(root, '../outside'), /unsafe run id/);

  const runId = module.generateRunId();
  const artifact = module.runArtifactPath(root, runId, 'run.json');
  const relative = path.relative(path.join(root, '.agent', 'icm'), artifact);
  assert.ok(!relative.startsWith('..') && !path.isAbsolute(relative), `artifact escaped .agent/icm: ${artifact}`);
});

test('an existing run is never overwritten silently', () => {
  const root = tempRoot();
  const runId = createRun(root);
  const before = fs.readFileSync(path.join(root, '.agent', 'icm', 'runs', runId, 'run.json'), 'utf8');

  const duplicate = run(root, [
    'create',
    '--workspace',
    'other-workspace',
    '--stage',
    '99_other',
    '--task',
    'overwrite attempt',
    '--run-id',
    runId,
  ]);
  assert.equal(duplicate.status, 1);
  assert.match(duplicate.stderr, /never overwritten|already exists/);

  const after = fs.readFileSync(path.join(root, '.agent', 'icm', 'runs', runId, 'run.json'), 'utf8');
  assert.equal(after, before);
});

test('obvious secrets are redacted or refused', () => {
  const root = tempRoot();
  const runId = createRun(root);

  const redacted = run(root, [
    'record',
    '--run',
    runId,
    '--command',
    'curl -H "Authorization: Bearer abcdef1234567890abcdef"',
    '--result',
    'not-run',
    '--note',
    'api_key=abcdef1234567890 and token: ghp_abcdefghijklmnopqrstuvwxyz012345',
  ]);
  assert.equal(redacted.status, 0, redacted.stderr || redacted.stdout);

  const raw = fs.readFileSync(path.join(root, '.agent', 'icm', 'runs', runId, 'run.json'), 'utf8');
  const report = readReport(root, runId);
  for (const text of [raw, report]) {
    assert.ok(!text.includes('abcdef1234567890abcdef'), 'a bearer token was persisted');
    assert.ok(!text.includes('ghp_abcdefghijklmnopqrstuvwxyz012345'), 'a github token was persisted');
    assert.match(text, /\[redacted\]/);
  }

  const refused = run(root, [
    'record',
    '--run',
    runId,
    '--note',
    'pasted key material: -----BEGIN RSA PRIVATE KEY----- MIIEow==',
  ]);
  assert.equal(refused.status, 1);
  assert.match(refused.stderr, /credential material/);
});

test('generated provenance material is ignored by git', () => {
  const ignored = spawnSync('git', ['check-ignore', '-q', '.agent/icm/runs/example/run.json'], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  assert.equal(ignored.status, 0, '.agent/icm is not gitignored');

  const tracked = spawnSync('git', ['ls-files', '--', '.agent'], { cwd: repoRoot, encoding: 'utf8' });
  assert.equal(tracked.status, 0, tracked.stderr);
  assert.equal(tracked.stdout.trim(), '', `provenance material is tracked: ${tracked.stdout}`);
});

test('the report states that provenance is not authorization', () => {
  const root = tempRoot();
  const runId = createRun(root);
  const report = readReport(root, runId);

  assert.match(report, /Provenance is not authority/i);
  assert.match(report, /This record does NOT authorize:/);
  assert.match(report, /Recording an action is not granting permission/i);
});

test('no merge, push, deployment or publication permission is granted', () => {
  const root = tempRoot();
  const runId = createRun(root);
  const report = readReport(root, runId);
  const record = readRun(root, runId);

  for (const action of ['merge', 'push', 'force push', 'deployment', 'Cloudflare mutation', 'publication', 'social publishing']) {
    assert.ok(record.permissionBoundary.notAuthorizedByThisRecord.includes(action), `missing boundary: ${action}`);
    assert.ok(report.includes(`- ${action}`), `report does not withhold: ${action}`);
  }
  assert.equal(record.permissionBoundary.provenanceIsNotAuthority, true);
  assert.deepEqual(record.permissionBoundary.observedAuthorizedActions, []);

  const observed = run(root, ['record', '--run', runId, '--observed-authorized', 'merge performed under explicit authorization']);
  assert.equal(observed.status, 0, observed.stderr || observed.stdout);
  const after = readRun(root, runId);
  assert.deepEqual(after.permissionBoundary.observedAuthorizedActions, ['merge performed under explicit authorization']);
  assert.ok(after.permissionBoundary.notAuthorizedByThisRecord.includes('merge'), 'recording an action removed the boundary');
});

test('status is a read-only operation', () => {
  const root = tempRoot();
  const runId = createRun(root);
  const runFile = path.join(root, '.agent', 'icm', 'runs', runId, 'run.json');
  const reportFile = path.join(root, '.agent', 'icm', 'runs', runId, 'report.md');
  const before = [fs.readFileSync(runFile, 'utf8'), fs.readFileSync(reportFile, 'utf8')];
  const beforeMtimes = [fs.statSync(runFile).mtimeMs, fs.statSync(reportFile).mtimeMs];

  const result = run(root, ['status', '--run', runId]);
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, new RegExp(runId));

  assert.deepEqual([fs.readFileSync(runFile, 'utf8'), fs.readFileSync(reportFile, 'utf8')], before);
  assert.deepEqual([fs.statSync(runFile).mtimeMs, fs.statSync(reportFile).mtimeMs], beforeMtimes);
});

test('complete records a terminal status without reopening the run', () => {
  const root = tempRoot();
  const runId = createRun(root);

  const completed = run(root, ['complete', '--run', runId, '--note', 'phase 16 fixture complete']);
  assert.equal(completed.status, 0, completed.stderr || completed.stdout);
  assert.equal(readRun(root, runId).status, 'completed');

  const again = run(root, ['complete', '--run', runId]);
  assert.equal(again.status, 1);
  assert.match(again.stderr, /already completed/);
});

test('the ICM context audit still passes with the provenance helper in place', () => {
  const result = spawnSync(process.execPath, [auditScript, '--root', repoRoot], { encoding: 'utf8', cwd: repoRoot });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /ICM context audit passed/);
});
