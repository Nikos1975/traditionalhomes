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

const stageContext = (title, extra = '') =>
  `# ${title}\n\n## Inputs\n\n| Layer | Source |\n| --- | --- |\n| L3 | \`docs/operations/blog-production.md\` |\n| L4 | \`docs/research/blog/example-topic/research-dossier.md\` |\n\n${extra}## Process\n\nDo one job.\n\n## Outputs\n\n- report\n\n## Verify\n\nRun checks.\n\n## Stop conditions\n\nStop on failure.\n`;

const topicContract = `# Topic Research Contract — Example

Owned by \`.agents/workspaces/example-research/stages/01_research/CONTEXT.md\`.

## Scope

One bounded question.

## Inputs

| Layer | Source |
| --- | --- |
| L3 | \`docs/operations/blog-production.md\` |
| L4 | \`docs/research/blog/example-topic/research-dossier.md\` |

## Source priority

1. Primary records.

## Open verification targets

See \`docs/research/blog/example-topic/research-dossier.md\`.

## Exclusions

No visitor logistics.

## Outputs

- updated dossier

## Review gate

\`research-only\` stops at Stage 01: this contract must not draft article prose.

## Stop conditions

Stop on unexpected files.
`;

function write(root, relative, content) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, 'utf8');
}

function read(root, relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}

function makeFixture() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'icm-topic-'));
  write(root, 'CLAUDE.md', '# Workspace Identity\n\nRead `CONTEXT.md` after this file.\n');
  write(
    root,
    'CONTEXT.md',
    '# Repository Context Router\n\n| Task | Load next |\n| --- | --- |\n| Research | `.agents/workspaces/example-research/CONTEXT.md` |\n',
  );
  write(
    root,
    '.agents/workspaces/example-research/CONTEXT.md',
    '# Research Router\n\n| Task | Stage |\n| --- | --- |\n| Research | `stages/01_research/CONTEXT.md` |\n| Drafting | `stages/02_drafting/CONTEXT.md` |\n',
  );
  write(
    root,
    '.agents/workspaces/example-research/stages/01_research/CONTEXT.md',
    stageContext(
      'Stage 01 — Research',
      'Load a registered contract listed in `.agents/workspaces/example-research/stages/01_research/topic-contexts.md`.\n\n',
    ),
  );
  write(root, '.agents/workspaces/example-research/stages/02_drafting/CONTEXT.md', stageContext('Stage 02 — Drafting'));
  write(
    root,
    '.agents/workspaces/example-research/stages/01_research/topic-contexts.md',
    '# Registered topic research contexts\n\n| Topic slug | Topic contract |\n| --- | --- |\n| example-topic | `docs/research/blog/example-topic/CONTEXT.md` |\n',
  );
  write(root, 'docs/operations/blog-production.md', '# Blog Production Run Foundation\n');
  write(root, 'docs/research/blog/example-topic/CONTEXT.md', topicContract);
  write(root, 'docs/research/blog/example-topic/research-dossier.md', '# Dossier\n');

  // Unregistered research material: inert Layer 4, deliberately malformed as a contract.
  write(
    root,
    'docs/research/blog/other-topic/CONTEXT.md',
    '# Other topic\n\nRoutes to `.agents/workspaces/example-research/stages/02_drafting/CONTEXT.md` and cites `notes.md` plus `docs/research/blog/other-topic/missing.md`.\n',
  );
  write(root, 'docs/research/blog/other-topic/source-notes.md', '# Notes\n');

  fs.mkdirSync(path.join(root, 'src', 'pages'), { recursive: true });
  return root;
}

function runAudit(root) {
  return spawnSync(process.execPath, [auditScript, '--root', root], { encoding: 'utf8', cwd: repoRoot });
}

function withFixture(fn) {
  const root = makeFixture();
  try {
    return fn(root);
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

const topicPath = 'docs/research/blog/example-topic/CONTEXT.md';

test('ICM audit accepts a stage that routes into a registered topic contract', () => {
  withFixture((root) => {
    const result = runAudit(root);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.match(result.stdout, /ICM context audit passed/);
  });
});

test('ICM audit leaves unregistered research folders out of the active control plane', () => {
  withFixture((root) => {
    const other = read(root, 'docs/research/blog/other-topic/CONTEXT.md');
    assert.match(other, /missing\.md/);
    const result = runAudit(root);
    assert.equal(result.status, 0, result.stderr || result.stdout);
    assert.doesNotMatch(result.stderr, /other-topic/);
  });
});

test('ICM audit rejects a dead reference inside a registered topic contract', () => {
  withFixture((root) => {
    write(root, topicPath, topicContract.replace('research-dossier.md`.\n', 'missing-dossier.md`.\n'));
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /dead routed reference/);
    assert.match(result.stderr, /example-topic\/missing-dossier\.md/);
  });
});

test('ICM audit rejects a registered topic contract that is missing a required section', () => {
  withFixture((root) => {
    write(root, topicPath, topicContract.replace('## Exclusions\n\nNo visitor logistics.\n\n', ''));
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /missing required topic-contract section: ## Exclusions/);
  });
});

test('ICM audit requires a topic contract to declare Layer 3 and Layer 4 inputs', () => {
  withFixture((root) => {
    write(root, topicPath, topicContract.replace('| L3 | `docs/operations/blog-production.md` |\n', ''));
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Inputs do not declare Layer 3 references/);
  });

  withFixture((root) => {
    write(root, topicPath, topicContract.replace('| L4 | `docs/research/blog/example-topic/research-dossier.md` |\n', ''));
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Inputs do not declare Layer 4 working material/);
  });
});

test('ICM audit rejects phantom relative evidence in a topic contract', () => {
  withFixture((root) => {
    write(root, topicPath, `${topicContract}\nAlso load \`source-notes.md\`.\n`);
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /references a bare filename instead of a repository-root-relative path/);
  });
});

test('ICM audit stops a topic contract from routing research-only work into drafting', () => {
  withFixture((root) => {
    write(
      root,
      topicPath,
      `${topicContract}\nContinue in \`.agents/workspaces/example-research/stages/02_drafting/CONTEXT.md\`.\n`,
    );
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /routes outside its owning stage/);
    assert.match(result.stderr, /02_drafting/);
  });
});

test('ICM audit requires a topic contract to keep research-only out of drafting', () => {
  withFixture((root) => {
    write(root, topicPath, topicContract.replace('`research-only` stops at Stage 01: this contract must not draft article prose.', 'Continue as needed.'));
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /does not keep research-only work out of article drafting/);
  });
});

test('ICM audit requires a topic contract to name the stage that owns it', () => {
  withFixture((root) => {
    write(root, topicPath, topicContract.replace('Owned by `.agents/workspaces/example-research/stages/01_research/CONTEXT.md`.\n', ''));
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /does not name the stage contract that owns it/);
  });
});

test('ICM audit rejects a topic registry that no stage contract routes to', () => {
  withFixture((root) => {
    write(root, '.agents/workspaces/example-research/stages/01_research/CONTEXT.md', stageContext('Stage 01 — Research'));
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /topic-context registry is not routed by its stage contract/);
  });
});

test('ICM audit rejects topic research material pulled into the global control plane', () => {
  withFixture((root) => {
    write(
      root,
      'CONTEXT.md',
      `${read(root, 'CONTEXT.md')}\nAlways load \`docs/research/blog/example-topic/research-dossier.md\`.\n`,
    );
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /topic research material referenced from the global control plane/);
    assert.match(result.stderr, /CONTEXT\.md ->/);
  });
});

test('ICM audit rejects a topic contract placed under src/pages', () => {
  withFixture((root) => {
    write(
      root,
      '.agents/workspaces/example-research/stages/01_research/topic-contexts.md',
      '# Registered topic research contexts\n\n| Topic slug | Topic contract |\n| --- | --- |\n| example | `src/pages/research/example/CONTEXT.md` |\n',
    );
    write(root, 'src/pages/research/example/CONTEXT.md', topicContract);
    const result = runAudit(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Markdown under src\/pages becomes a public route/);
  });
});

// --- repository control plane -------------------------------------------------

const registryPath = '.agents/workspaces/editorial-research/stages/01_research/topic-contexts.md';
const stagePath = '.agents/workspaces/editorial-research/stages/01_research/CONTEXT.md';
const spinalongaContract = 'docs/research/blog/spinalonga-multiple-lives/CONTEXT.md';

const readRepo = (relative) => fs.readFileSync(path.join(repoRoot, relative), 'utf8');

function walkResearchContexts(dir, root, found = []) {
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkResearchContexts(full, root, found);
    else if (entry.name === 'CONTEXT.md') found.push(path.relative(root, full).split(path.sep).join('/'));
  }
  return found;
}

test('Stage 01 routes optionally into a registered topic-local contract', () => {
  const stage = readRepo(stagePath);

  assert.match(stage, /## Topic-local research context/);
  assert.match(stage, /docs\/research\/blog\/<slug>\/CONTEXT\.md/);
  assert.match(stage, new RegExp(registryPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(stage, /A missing contract is not a failure/);
  assert.match(stage, /`research-only` still stops at this stage/);
  assert.match(stage, /\| L2\.5 \|/);
});

test('the topic registry lists the Spinalonga research project', () => {
  const registry = readRepo(registryPath);

  assert.match(registry, new RegExp(spinalongaContract.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(registry, /Do not register a single-run or small topic/);
  assert.match(registry, /inert Layer 4 material/);
});

test('every topic contract under docs/research is registered by a stage', () => {
  const onDisk = walkResearchContexts(path.join(repoRoot, 'docs', 'research'), repoRoot).sort();
  const registry = readRepo(registryPath);

  assert.deepEqual(onDisk, [spinalongaContract]);
  for (const contract of onDisk) assert.ok(registry.includes(contract), `${contract} is not registered`);
});

test('the Spinalonga contract declares its scope, inputs and review gate', () => {
  const contract = readRepo(spinalongaContract);

  for (const heading of [
    'Scope',
    'Inputs',
    'Source priority',
    'Open verification targets',
    'Exclusions',
    'Outputs',
    'Review gate',
    'Stop conditions',
  ]) {
    assert.match(contract, new RegExp(`^## ${heading}$`, 'm'), `missing ## ${heading}`);
  }

  assert.match(contract, /\| L3 \|/);
  assert.match(contract, /\| L4 \|/);
  assert.match(contract, new RegExp(stagePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(contract, /`research-only` stops at Stage 01/);
  assert.match(contract, /must not draft, rewrite or edit article prose/);
  assert.doesNotMatch(contract, /02_drafting/);
});

test('the Spinalonga contract points only at evidence that exists', () => {
  const contract = readRepo(spinalongaContract);
  const refs = [...contract.matchAll(/`([^`\r\n]+)`/g)].map((match) => match[1].trim());
  const repoRefs = refs.filter((ref) => /^(?:\.agents|docs|\.ai|src|scripts|tests|public|functions)\//.test(ref));

  assert.ok(repoRefs.length >= 15, `expected the contract to route to its evidence, saw ${repoRefs.length} paths`);
  for (const ref of repoRefs) {
    assert.ok(fs.existsSync(path.join(repoRoot, ref)), `dead reference in topic contract: ${ref}`);
  }
});

test('the Spinalonga contract routes to evidence instead of restating it', () => {
  const contract = readRepo(spinalongaContract);

  assert.ok(contract.length < 8_000, `topic contract grew to ${contract.length} characters`);
  for (const register of [
    'docs/research/blog/spinalonga-multiple-lives/claim-verification-register.md',
    'docs/research/blog/spinalonga-multiple-lives/contradiction-register.md',
    'docs/research/blog/spinalonga-multiple-lives/unresolved-questions.md',
    'docs/research/blog/spinalonga-multiple-lives/image-rights-register.md',
  ]) {
    assert.ok(contract.includes(register), `${register} is not routed`);
  }

  // Evidence stays in Layer 4: the contract must not carry S-numbered source rows.
  assert.doesNotMatch(contract, /\|\s*S\d{2}\s*\|/);
});

test('the published article stays read-only in the research contract', () => {
  const contract = readRepo(spinalongaContract);

  assert.match(contract, /src\/content\/blog\/spinalonga-why-fortified-changing-uses\.md/);
  assert.match(contract, /read-only/);
  assert.match(contract, /separate approved editorial task/);
});

test('topic research evidence stays out of the global control plane', () => {
  for (const file of ['CLAUDE.md', 'AGENTS.md', 'CONTEXT.md', 'BLOG_ORCHESTRATOR.md']) {
    const refs = [...readRepo(file).matchAll(/`([^`\r\n]+)`/g)].map((match) => match[1].trim());
    for (const ref of refs) {
      assert.doesNotMatch(ref, /^docs\/research\/.+/, `${file} imports topic research material: ${ref}`);
    }
  }
});

test('the topic contract is not a public Astro route', () => {
  assert.ok(!spinalongaContract.startsWith('src/pages/'));
  assert.ok(!fs.existsSync(path.join(repoRoot, 'src', 'pages', 'research')));

  const collections = readRepo('src/content.config.ts');
  assert.doesNotMatch(collections, /docs\/research/);
});

test('the repository control plane still passes the ICM audit with topic routing active', () => {
  const result = runAudit(repoRoot);
  assert.equal(result.status, 0, result.stderr || result.stdout);
});
