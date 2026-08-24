import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '..');
const cli = path.join(repoRoot, 'scripts', 'pr-preflight.mjs');

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
}

function git(cwd, ...args) {
  return run('git', args, cwd);
}

function write(root, relative, content) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

function commit(root, relative, content, message, { force = false } = {}) {
  write(root, relative, content);
  git(root, 'add', ...(force ? ['--force'] : []), '--', relative);
  git(root, 'commit', '-m', message);
}

function fixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'traditional-homes-pr-preflight-'));
  test.after(() => fs.rmSync(root, { recursive: true, force: true }));

  const remote = path.join(root, 'origin.git');
  const seed = path.join(root, 'seed');
  const worktree = path.join(root, 'worktree');

  fs.mkdirSync(seed);
  git(root, 'init', '--bare', remote);
  git(seed, 'init', '--initial-branch=main');
  git(seed, 'config', 'user.name', 'Preflight Test');
  git(seed, 'config', 'user.email', 'preflight@example.invalid');
  write(seed, 'package.json', `${JSON.stringify({ name: 'elounda-traditional-homes', private: true }, null, 2)}\n`);
  write(seed, '.gitignore', 'dist/\n.agent/\n.claude/\n.codex/\n');
  write(seed, 'docs/commit-plan/groups/99-excluded-local-workflow.txt', '.agent/\n.claude/\n.codex/\n');
  write(seed, 'README.md', '# Fixture\n');
  git(seed, 'add', '--', 'package.json', '.gitignore', 'docs/commit-plan/groups/99-excluded-local-workflow.txt', 'README.md');
  git(seed, 'commit', '-m', 'initial main');
  git(seed, 'remote', 'add', 'origin', remote);
  git(seed, 'push', '--set-upstream', 'origin', 'main');
  git(remote, 'symbolic-ref', 'HEAD', 'refs/heads/main');

  git(root, 'clone', remote, worktree);
  git(worktree, 'config', 'user.name', 'Preflight Test');
  git(worktree, 'config', 'user.email', 'preflight@example.invalid');
  git(worktree, 'switch', '-c', 'codex/preflight-fixture');

  return { remote, seed, worktree };
}

function preflight(root, args = []) {
  return spawnSync(process.execPath, [cli, '--root', root, ...args], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
}

test('passes a clean one-commit branch and reports exact PR scope separately from staged scope', () => {
  const { worktree } = fixture();
  commit(worktree, 'intended.txt', 'intended\n', 'one intended change');

  const result = preflight(worktree);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /^REPO\s+elounda-traditional-homes @ /m);
  assert.match(result.stdout, /^BASE\s+origin\/main @ [0-9a-f]{12}$/m);
  assert.match(result.stdout, /^BRANCH\s+codex\/preflight-fixture$/m);
  assert.match(result.stdout, /^AHEAD\s+1$/m);
  assert.match(result.stdout, /^BEHIND\s+0$/m);
  assert.match(result.stdout, /^FILES\s+1$/m);
  assert.match(result.stdout, /^STAGED\s+0$/m);
  assert.match(result.stdout, /^DIRTY\s+no$/m);
  assert.match(result.stdout, /^PROTECTED\s+no$/m);
  assert.match(result.stdout, /^DIFFCHECK\s+pass$/m);
  assert.match(result.stdout, /^PR_FILE\s+intended\.txt$/m);
  assert.match(result.stdout, /^STAGED_CMD\s+git diff --cached$/m);
  assert.match(result.stdout, /^PR_DIFF\s+git diff origin\/main\.\.\.HEAD$/m);
  assert.match(result.stdout, /PR PREFLIGHT: PASS\s*$/);
});

test('passes a clean multi-commit branch when no expected ahead count is supplied', () => {
  const { worktree } = fixture();
  commit(worktree, 'first.txt', 'first\n', 'first feature commit');
  commit(worktree, 'second.txt', 'second\n', 'second feature commit');

  const result = preflight(worktree);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /^AHEAD\s+2$/m);
  assert.match(result.stdout, /^FILES\s+2$/m);
  assert.match(result.stdout, /PR PREFLIGHT: PASS\s*$/);
});

test('--expected-ahead 1 rejects a clean two-commit branch', () => {
  const { worktree } = fixture();
  commit(worktree, 'first.txt', 'first\n', 'first feature commit');
  commit(worktree, 'second.txt', 'second\n', 'second feature commit');

  const result = preflight(worktree, ['--expected-ahead', '1']);

  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /^AHEAD\s+2$/m);
  assert.match(result.stdout, /^ERROR\s+AHEAD_EXPECTED_COUNT\b/m);
  assert.match(result.stdout, /expected exactly 1 commit\(s\) ahead of origin\/main, found 2/);
  assert.match(result.stdout, /PR PREFLIGHT: FAIL\s*$/);
});

test('--expected-ahead 2 accepts a clean two-commit branch', () => {
  const { worktree } = fixture();
  commit(worktree, 'first.txt', 'first\n', 'first feature commit');
  commit(worktree, 'second.txt', 'second\n', 'second feature commit');

  const result = preflight(worktree, ['--expected-ahead', '2']);

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /^AHEAD\s+2$/m);
  assert.match(result.stdout, /PR PREFLIGHT: PASS\s*$/);
});

test('requires at least one commit ahead when --expected-ahead is omitted', () => {
  const { worktree } = fixture();

  const result = preflight(worktree);

  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /^AHEAD\s+0$/m);
  assert.match(result.stdout, /^ERROR\s+AHEAD_REQUIRED\b/m);
});

test('--expected-ahead accepts only positive integers', () => {
  const { worktree } = fixture();
  commit(worktree, 'feature.txt', 'feature\n', 'feature commit');

  for (const invalid of ['0', '-1', '1.5', 'not-a-number']) {
    const result = preflight(worktree, ['--expected-ahead', invalid]);
    assert.notEqual(result.status, 0, `accepted --expected-ahead ${invalid}`);
    assert.match(result.stdout, /^ERROR\s+USAGE\b/m);
    assert.match(result.stdout, /--expected-ahead must be a positive integer/);
  }
});

test('reports staged changes independently and fails a dirty worktree', () => {
  const { worktree } = fixture();
  commit(worktree, 'committed.txt', 'committed\n', 'committed PR file');
  write(worktree, 'staged.txt', 'staged but not committed\n');
  git(worktree, 'add', '--', 'staged.txt');

  const result = preflight(worktree);

  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /^FILES\s+1$/m);
  assert.match(result.stdout, /^STAGED\s+1$/m);
  assert.match(result.stdout, /^DIRTY\s+yes$/m);
  assert.match(result.stdout, /^PR_FILE\s+committed\.txt$/m);
  assert.doesNotMatch(result.stdout, /^PR_FILE\s+staged\.txt$/m);
  assert.match(result.stdout, /^ERROR\s+WORKTREE_DIRTY\b/m);
});

test('fetches current origin/main and fails when the branch is behind', () => {
  const { seed, worktree } = fixture();
  commit(worktree, 'feature.txt', 'feature\n', 'feature commit');
  commit(seed, 'base-update.txt', 'new base\n', 'advance main');
  git(seed, 'push', 'origin', 'main');

  const result = preflight(worktree);

  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /^AHEAD\s+1$/m);
  assert.match(result.stdout, /^BEHIND\s+1$/m);
  assert.match(result.stdout, /^ERROR\s+BEHIND_MAIN\b/m);
});

test('detects ignored or explicitly excluded files in the actual PR diff', () => {
  const { worktree } = fixture();
  commit(worktree, 'dist/generated.html', '<p>generated</p>\n', 'force generated output', { force: true });

  const result = preflight(worktree);

  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /^PROTECTED\s+yes$/m);
  assert.match(result.stdout, /^PROTECTED_FILE\s+dist\/generated\.html$/m);
  assert.match(result.stdout, /^ERROR\s+PROTECTED_FILES\b/m);
});

test('runs git diff --check against origin/main...HEAD and fails whitespace errors', () => {
  const { worktree } = fixture();
  commit(worktree, 'bad.txt', 'trailing whitespace  \n', 'introduce whitespace error');

  const result = preflight(worktree);

  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /^DIFFCHECK\s+fail$/m);
  assert.match(result.stdout, /^ERROR\s+DIFF_CHECK\b/m);
  assert.match(result.stdout, /bad\.txt:1: trailing whitespace/);
});

test('fails closed when repository identity does not match Traditional Homes', () => {
  const { worktree } = fixture();
  commit(worktree, 'package.json', `${JSON.stringify({ name: 'wrong-repository', private: true }, null, 2)}\n`, 'wrong identity');

  const result = preflight(worktree);

  assert.notEqual(result.status, 0);
  assert.match(result.stdout, /^ERROR\s+REPOSITORY_IDENTITY\b/m);
  assert.match(result.stdout, /PR PREFLIGHT: FAIL\s*$/);
});

test('package.json exposes the preflight through the repository script convention', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(repoRoot, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts['pr:preflight'], 'node scripts/pr-preflight.mjs');
});
