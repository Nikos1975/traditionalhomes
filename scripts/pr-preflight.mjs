import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const EXPECTED_REPOSITORY = 'elounda-traditional-homes';
const BASE = 'origin/main';
const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function parseArgs(argv) {
  let root = scriptRoot;

  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === '--root' && argv[index + 1]) {
      root = path.resolve(argv[index + 1]);
      index += 1;
      continue;
    }
    throw new Error(`usage: node scripts/pr-preflight.mjs [--root <worktree>]`);
  }

  return { root };
}

function git(root, args, { input } = {}) {
  return spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    input,
    maxBuffer: 64 * 1024 * 1024,
  });
}

function value(result) {
  return result.stdout.trim();
}

function zeroSeparated(text) {
  return text.split('\0').filter(Boolean);
}

function samePath(left, right) {
  const normalize = (entry) => path.resolve(entry).replaceAll('\\', '/').toLowerCase();
  return normalize(left) === normalize(right);
}

function matchesExcludedPath(file, excluded) {
  const normalized = file.replaceAll('\\', '/');
  return excluded.some((entry) => {
    const candidate = entry.replaceAll('\\', '/').replace(/^\.\//, '');
    return candidate.endsWith('/') ? normalized.startsWith(candidate) : normalized === candidate;
  });
}

function excludedPaths(root) {
  const source = path.join(root, 'docs', 'commit-plan', 'groups', '99-excluded-local-workflow.txt');
  if (!fs.existsSync(source)) return [];
  return fs
    .readFileSync(source, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
}

function protectedFiles(root, prFiles) {
  if (prFiles.length === 0) return [];

  const ignored = git(root, ['check-ignore', '--no-index', '-z', '--stdin'], {
    input: `${prFiles.join('\0')}\0`,
  });
  const ignoredFiles = ignored.status === 0 ? zeroSeparated(ignored.stdout) : [];
  const excluded = excludedPaths(root);
  const explicitlyExcluded = prFiles.filter((file) => matchesExcludedPath(file, excluded));

  return [...new Set([...ignoredFiles, ...explicitlyExcluded])].sort();
}

function printFailure(errors) {
  for (const [code, message] of errors) console.log(`ERROR     ${code} ${message}`);
  console.log('');
  console.log('PR PREFLIGHT: FAIL');
  process.exitCode = 1;
}

function main() {
  let root;
  try {
    ({ root } = parseArgs(process.argv.slice(2)));
  } catch (error) {
    printFailure([['USAGE', error.message]]);
    return;
  }

  const errors = [];
  const topLevelResult = git(root, ['rev-parse', '--show-toplevel']);
  if (topLevelResult.status !== 0) {
    console.log(`REPO      unknown @ ${root}`);
    printFailure([['WORKTREE_IDENTITY', 'not inside a Git worktree']]);
    return;
  }

  const topLevel = value(topLevelResult);
  let repositoryName = 'unknown';
  try {
    repositoryName = JSON.parse(fs.readFileSync(path.join(topLevel, 'package.json'), 'utf8')).name ?? 'unknown';
  } catch {
    // The identity check below fails closed.
  }

  console.log(`REPO      ${repositoryName} @ ${topLevel}`);
  if (!samePath(root, topLevel)) {
    errors.push(['WORKTREE_IDENTITY', `--root must be the worktree root: ${topLevel}`]);
  }
  if (repositoryName !== EXPECTED_REPOSITORY) {
    errors.push(['REPOSITORY_IDENTITY', `expected package name ${EXPECTED_REPOSITORY}`]);
  }

  const gitDirResult = git(root, ['rev-parse', '--path-format=absolute', '--git-dir']);
  const commonDirResult = git(root, ['rev-parse', '--path-format=absolute', '--git-common-dir']);
  const worktreeKind =
    gitDirResult.status === 0 && commonDirResult.status === 0 && samePath(value(gitDirResult), value(commonDirResult))
      ? 'primary'
      : 'linked';
  console.log(`WORKTREE  ${worktreeKind} @ ${topLevel}`);

  const originResult = git(root, ['remote', 'get-url', 'origin']);
  const origin = originResult.status === 0 ? value(originResult) : 'missing';
  console.log(`ORIGIN    ${origin}`);
  if (originResult.status !== 0) errors.push(['ORIGIN_MISSING', 'remote origin is required']);

  if (originResult.status === 0) {
    const fetchResult = git(root, ['fetch', '--quiet', 'origin', 'main']);
    if (fetchResult.status !== 0) {
      const detail = (fetchResult.stderr || fetchResult.stdout).trim().split(/\r?\n/)[0] || 'fetch failed';
      errors.push(['FETCH_MAIN', detail]);
    }
  }

  const baseResult = git(root, ['rev-parse', '--verify', `${BASE}^{commit}`]);
  if (baseResult.status !== 0) {
    console.log(`BASE      ${BASE} @ missing`);
    errors.push(['BASE_MISSING', `${BASE} is not a commit`]);
    printFailure(errors);
    return;
  }
  const baseSha = value(baseResult);
  console.log(`BASE      ${BASE} @ ${baseSha.slice(0, 12)}`);

  const branchResult = git(root, ['symbolic-ref', '--quiet', '--short', 'HEAD']);
  const branch = branchResult.status === 0 ? value(branchResult) : 'DETACHED';
  console.log(`BRANCH    ${branch}`);
  if (branch === 'DETACHED') errors.push(['BRANCH_DETACHED', 'HEAD must be on a named branch']);
  if (branch === 'main') errors.push(['BRANCH_MAIN', 'run from a PR branch, not main']);

  const countsResult = git(root, ['rev-list', '--left-right', '--count', `${BASE}...HEAD`]);
  let behind = Number.NaN;
  let ahead = Number.NaN;
  if (countsResult.status === 0) {
    [behind, ahead] = value(countsResult)
      .split(/\s+/)
      .map((entry) => Number.parseInt(entry, 10));
  }
  console.log(`AHEAD     ${Number.isInteger(ahead) ? ahead : 'error'}`);
  console.log(`BEHIND    ${Number.isInteger(behind) ? behind : 'error'}`);
  if (!Number.isInteger(ahead) || !Number.isInteger(behind)) {
    errors.push(['DIVERGENCE_COUNT', `could not compare ${BASE}...HEAD`]);
  } else {
    if (ahead !== 1) errors.push(['AHEAD_EXPECTED_ONE', `expected exactly 1 commit ahead of ${BASE}, found ${ahead}`]);
    if (behind !== 0) errors.push(['BEHIND_MAIN', `branch is ${behind} commit(s) behind ${BASE}`]);
  }

  const prFilesResult = git(root, [
    'diff',
    '--name-only',
    '--diff-filter=ACDMRTUXB',
    '-z',
    `${BASE}...HEAD`,
  ]);
  const prFiles = prFilesResult.status === 0 ? zeroSeparated(prFilesResult.stdout) : [];
  if (prFilesResult.status !== 0) errors.push(['PR_DIFF', `git diff ${BASE}...HEAD failed`]);

  const stagedResult = git(root, ['diff', '--cached', '--name-only', '--diff-filter=ACDMRTUXB', '-z']);
  const stagedFiles = stagedResult.status === 0 ? zeroSeparated(stagedResult.stdout) : [];
  if (stagedResult.status !== 0) errors.push(['STAGED_DIFF', 'git diff --cached failed']);

  const statusResult = git(root, ['status', '--porcelain=v1', '-z', '--untracked-files=all']);
  const dirty = statusResult.status !== 0 || statusResult.stdout.length > 0;

  const protectedInPr = protectedFiles(root, prFiles);
  const diffCheckResult = git(root, ['diff', '--check', `${BASE}...HEAD`]);
  const diffCheckPass = diffCheckResult.status === 0;

  console.log(`FILES     ${prFiles.length}`);
  console.log(`STAGED    ${stagedFiles.length}`);
  console.log(`DIRTY     ${dirty ? 'yes' : 'no'}`);
  console.log(`PROTECTED ${protectedInPr.length > 0 ? 'yes' : 'no'}`);
  console.log(`DIFFCHECK ${diffCheckPass ? 'pass' : 'fail'}`);
  console.log(`STAGED_CMD git diff --cached`);
  console.log(`PR_DIFF   git diff ${BASE}...HEAD`);

  for (const file of prFiles) console.log(`PR_FILE   ${file}`);
  for (const file of protectedInPr) console.log(`PROTECTED_FILE ${file}`);
  if (!diffCheckPass) {
    const detail = `${diffCheckResult.stdout}${diffCheckResult.stderr}`.trim();
    if (detail) console.log(detail);
  }

  if (prFiles.length === 0) errors.push(['PR_EMPTY', `git diff ${BASE}...HEAD contains no files`]);
  if (dirty) errors.push(['WORKTREE_DIRTY', 'commit or remove staged, unstaged, and untracked changes']);
  if (protectedInPr.length > 0) {
    errors.push(['PROTECTED_FILES', `${protectedInPr.length} ignored or explicitly excluded path(s) are in the PR diff`]);
  }
  if (!diffCheckPass) errors.push(['DIFF_CHECK', `git diff --check ${BASE}...HEAD failed`]);

  console.log('');
  if (errors.length > 0) {
    printFailure(errors);
    return;
  }
  console.log('PR PREFLIGHT: PASS');
}

main();
