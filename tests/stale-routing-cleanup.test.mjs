import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

// Phase 15 cleanup guard. It asserts structural agreement between the current
// router, the current workspaces, the current handoff and the supporting docs.
// It deliberately avoids asserting complete sentences: wording may change,
// ownership and reachability may not.

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '..');
const auditScript = path.join(repoRoot, 'scripts', 'context', 'validate-icm.mjs');

const ARCHIVE = 'docs/agent-handoff-notes.md';
const CURRENT = 'docs/handoff/current.md';

const CONTROL_PLANE = ['CLAUDE.md', 'CONTEXT.md', 'AGENTS.md', 'BLOG_ORCHESTRATOR.md'];

// Documents that carry current routing statements.
const ROUTING_SURFACES = [
  ...CONTROL_PLANE,
  CURRENT,
  'README.md',
  'docs/codex-5-3-router.md',
  'docs/operations/agent-operating-model.md',
];

// Every current (non-archive) document Phase 15 treats as active reference material.
const ACTIVE_DOCS = [
  ...ROUTING_SURFACES,
  'docs/operations/repeated-failures-playbook.md',
  'docs/operations/deployment-operations.md',
  'docs/operations/social-publication.md',
  'docs/operations/blog-lifecycle.md',
  'docs/operations/blog-production.md',
  ...fs
    .readdirSync(path.join(repoRoot, '.agents', 'workspaces'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `.agents/workspaces/${entry.name}/CONTEXT.md`),
];

function read(relative) {
  return fs.readFileSync(path.join(repoRoot, relative), 'utf8');
}

function exists(relative) {
  return fs.existsSync(path.join(repoRoot, relative));
}

function lines(relative) {
  return read(relative).split(/\r?\n/);
}

function workspaceOwners() {
  return fs
    .readdirSync(path.join(repoRoot, '.agents', 'workspaces'), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

const WORKSPACE_REF = /\.agents\/workspaces\/([a-z0-9-]+)\/CONTEXT\.md/;

// domain marker -> the only workspace allowed to own it
const DOMAIN_OWNERS = [
  ['social', /social (publication|publishing|post|posts|campaign|draft)/i, 'social-publishing'],
  ['deployment', /Cloudflare|deployment|deploy\b/i, 'operations-deployment'],
  [
    'seo',
    /Search Console|SEO (performance|evidence|analysis|opportunity|recommendation)|content-gap|content-overlap/i,
    'seo-content-intelligence',
  ],
  ['property', /property fact|property facts|canonical inventory|property-page/i, 'property-content'],
  ['site engineering', /Astro\/UI|site implementation|regression debugging|runtime, browser/i, 'site-engineering'],
];

test('every active workspace owner is reachable from current routing', () => {
  const owners = workspaceOwners();
  assert.ok(owners.length > 0, 'no workspace routers found');

  const routing = [read('CONTEXT.md'), read('AGENTS.md'), read('BLOG_ORCHESTRATOR.md'), read(CURRENT)].join('\n');
  for (const owner of owners) {
    const routerPath = `.agents/workspaces/${owner}/CONTEXT.md`;
    assert.ok(exists(routerPath), `${routerPath} is missing`);
    assert.ok(routing.includes(routerPath), `no current routing surface reaches workspace: ${owner}`);
  }
});

test('no current document claims an existing workspace is absent', () => {
  const absence = /no ICM workspace|has no ICM|no dedicated workspace|does not have an ICM|not yet routed/i;
  for (const doc of ACTIVE_DOCS) {
    for (const [index, line] of lines(doc).entries()) {
      assert.doesNotMatch(line, absence, `${doc}:${index + 1} still claims an ICM owner is missing: ${line.trim()}`);
    }
  }
});

for (const [domain, marker, owner] of DOMAIN_OWNERS) {
  test(`current routing does not route ${domain} work outside ${owner}`, () => {
    for (const doc of ROUTING_SURFACES) {
      for (const [index, line] of lines(doc).entries()) {
        const match = WORKSPACE_REF.exec(line);
        if (!match || !marker.test(line)) continue;
        assert.equal(
          match[1],
          owner,
          `${doc}:${index + 1} routes ${domain} work to ${match[1]} instead of ${owner}`,
        );
      }
    }
  });
}

test('the historical handoff stays archive-only', () => {
  assert.match(read(ARCHIVE), /Historical archive\. Do not load by default\./);
  assert.match(read('CLAUDE.md'), /Do not automatically load[^\n]*docs\/agent-handoff-notes\.md/);
  assert.match(read('AGENTS.md'), /not startup context|Do not load[^\n]*docs\/agent-handoff-notes\.md/);

  for (const doc of ACTIVE_DOCS) {
    const docLines = lines(doc);
    for (const [index, line] of docLines.entries()) {
      if (!/^\s*Read (first|these)/i.test(line)) continue;
      const block = docLines.slice(index, index + 8).join('\n');
      assert.ok(
        !block.includes('agent-handoff-notes'),
        `${doc}:${index + 1} lists the historical archive as required startup reading`,
      );
    }
  }
});

test('the current handoff stays reference-only', () => {
  const current = read(CURRENT);
  assert.match(current, /not\*{0,2}\s*an execution authority/i);
  assert.match(read('CONTEXT.md'), /never overrides this router or a workspace stage contract/);
  assert.match(read('AGENTS.md'), /Reference only/i);
});

test('no dead active CONTEXT, skill or docs reference remains', () => {
  const reference = /(?:\.agents\/[A-Za-z0-9_./[\]-]*?(?:CONTEXT|SKILL)\.md|docs\/[A-Za-z0-9_./-]+\.md)/g;
  const dead = [];
  for (const doc of ACTIVE_DOCS) {
    for (const match of read(doc).matchAll(reference)) {
      if (!exists(match[0])) dead.push(`${doc} -> ${match[0]}`);
    }
  }
  assert.deepEqual(dead, [], `dead documentary references: ${dead.join(', ')}`);
});

test('the current startup and resume path is consistent', () => {
  assert.match(read('CLAUDE.md'), /CONTEXT\.md/);
  assert.ok(read('AGENTS.md').includes('CONTEXT.md'), 'AGENTS.md does not route to CONTEXT.md');

  const current = read(CURRENT);
  const claudeAt = current.indexOf('CLAUDE.md');
  const contextAt = current.indexOf('CONTEXT.md', claudeAt);
  const handoffAt = current.indexOf(CURRENT, contextAt);
  assert.ok(claudeAt >= 0 && contextAt > claudeAt && handoffAt > contextAt, 'resume order is not CLAUDE -> CONTEXT -> current handoff');

  const operatingModel = read('docs/operations/agent-operating-model.md');
  assert.match(operatingModel, /\|\s*`CONTEXT\.md`\s*\|\s*Yes\s*\|/, 'the operating model does not treat CONTEXT.md as always-read');
});

test('no second execution authority is introduced', () => {
  for (const doc of ['docs/operations/agent-operating-model.md', 'docs/codex-5-3-router.md']) {
    assert.match(read(doc), /not (a routing or |an )?execution authority/i, `${doc} does not disclaim execution authority`);
  }

  const stageHeading = /^##+\s*(Inputs|Process|Outputs|Verify|Stop conditions)\s*$/gim;
  for (const doc of ACTIVE_DOCS) {
    if (doc.startsWith('.agents/workspaces/')) continue;
    const sections = new Set([...read(doc).matchAll(stageHeading)].map((match) => match[1].toLowerCase()));
    assert.ok(sections.size < 4, `${doc} reproduces a stage contract (${[...sections].join(', ')})`);
  }
});

test('the ICM context audit passes after the cleanup', () => {
  const result = spawnSync(process.execPath, [auditScript, '--root', repoRoot], { encoding: 'utf8', cwd: repoRoot });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /ICM context audit passed/);
});
