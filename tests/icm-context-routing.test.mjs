import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '..');
const auditScript = path.join(repoRoot, 'scripts', 'context', 'validate-icm.mjs');

function write(root, relative, content) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'icm-audit-'));
  write(root, 'CLAUDE.md', '# Workspace Identity\n\nRead `CONTEXT.md` after this file.\n');
  write(root, 'CONTEXT.md', '# Repository Context Router\n\n| Task | Load next |\n| --- | --- |\n| I18N | `.agents/workspaces/i18n/CONTEXT.md` |\n');
  write(root, '.agents/workspaces/i18n/CONTEXT.md', '# I18N Router\n\n| Task | Stage |\n| --- | --- |\n| Example | `stages/01_example/CONTEXT.md` |\n');
  write(
    root,
    '.agents/workspaces/i18n/stages/01_example/CONTEXT.md',
    '# Stage 01 — Example\n\n## Inputs\n\n| Layer | Source |\n| --- | --- |\n| L3 | `.agents/skills/example/SKILL.md` |\n| L4 | `src/example.ts` |\n\n## Process\n\nDo one job.\n\n## Outputs\n\n- report\n\n## Verify\n\nRun checks.\n\n## Stop conditions\n\nStop on failure.\n',
  );
  write(root, '.agents/skills/example/SKILL.md', '# Example Skill\n');
  write(root, 'src/example.ts', 'export const example = true;\n');
  fs.mkdirSync(path.join(root, 'src', 'pages'), { recursive: true });
  return root;
}

function runAudit(root) {
  return spawnSync(process.execPath, [auditScript, '--root', root], {
    encoding: 'utf8',
    cwd: repoRoot,
  });
}

function withFixture(fn) {
  const root = makeFixture();
  try {
    return fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

test('ICM audit accepts a layered fixture with live routers, stage contract, L3 and L4 inputs', () => {
  withFixture((root) => {
    const result = runAudit(root);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /ICM context audit passed/);
  });
});

test('ICM audit rejects a stage missing a required contract section', () => {
  withFixture((root) => {
    const stage = path.join(root, '.agents/workspaces/i18n/stages/01_example/CONTEXT.md');
    fs.writeFileSync(stage, fs.readFileSync(stage, 'utf8').replace('## Verify\n\nRun checks.\n\n', ''), 'utf8');
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing required section: ## Verify/);
  });
});

test('ICM audit rejects a dead routed stage reference', () => {
  withFixture((root) => {
    write(root, '.agents/workspaces/i18n/CONTEXT.md', '# I18N Router\n\n| Task | Stage |\n| --- | --- |\n| Missing | `stages/99_missing/CONTEXT.md` |\n');
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /dead routed reference/);
    assert.match(result.stderr, /stages\/99_missing\/CONTEXT\.md/);
  });
});

test('ICM audit rejects a dead Layer 3 skill reference', () => {
  withFixture((root) => {
    const stage = path.join(root, '.agents/workspaces/i18n/stages/01_example/CONTEXT.md');
    fs.writeFileSync(stage, fs.readFileSync(stage, 'utf8').replace('.agents/skills/example/SKILL.md', '.agents/skills/missing/SKILL.md'), 'utf8');
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /dead routed reference/);
    assert.match(result.stderr, /\.agents\/skills\/missing\/SKILL\.md/);
  });
});

test('ICM audit rejects Layer 4 material imported globally from CLAUDE.md', () => {
  withFixture((root) => {
    write(root, '.ai/memory/current-task.md', '# Current task\n');
    write(root, 'CLAUDE.md', '# Workspace Identity\n\nRead `CONTEXT.md`.\n\n@.ai/memory/current-task.md\n');
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Layer 4 material imported globally/);
  });
});

test('ICM audit rejects Markdown under src/pages', () => {
  withFixture((root) => {
    write(root, 'src/pages/CONTEXT.md', '# Internal instructions\n');
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Markdown under src\/pages becomes a public route/);
  });
});

test('ICM audit reports oversized structural context as a warning without hiding valid structure', () => {
  withFixture((root) => {
    write(root, 'CLAUDE.md', `# Workspace Identity\n\nRead \`CONTEXT.md\`.\n\n${'x'.repeat(12_100)}\n`);
    const result = runAudit(root);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stderr, /ICM context audit warnings/);
    assert.match(result.stderr, /CLAUDE\.md is .*review whether context should be split/);
  });
});

test('ICM audit accepts the repository control plane', () => {
  const result = runAudit(repoRoot);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
