import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '..');
const auditScript = path.join(repoRoot, 'scripts', 'context', 'validate-icm.mjs');

const CURRENT = 'docs/handoff/current.md';
const ARCHIVE = 'docs/agent-handoff-notes.md';

function read(relative) {
  return fs.readFileSync(path.join(repoRoot, relative), 'utf8');
}

test('the current handoff exists at the routed path', () => {
  assert.ok(fs.existsSync(path.join(repoRoot, CURRENT)), `${CURRENT} is missing`);
});

test('the control plane routes agents to the current handoff', () => {
  for (const file of ['CLAUDE.md', 'CONTEXT.md', 'AGENTS.md']) {
    assert.ok(read(file).includes(CURRENT), `${file} does not reference ${CURRENT}`);
  }
});

test('the historical archive stays available but is not automatic startup context', () => {
  const archive = read(ARCHIVE);
  assert.match(archive, /Historical archive\. Do not load by default\./);
  assert.ok(archive.includes(CURRENT), 'the archive does not point at the current handoff');

  assert.match(read('CLAUDE.md'), /Do not automatically load[^\n]*docs\/agent-handoff-notes\.md/);
  assert.match(read('AGENTS.md'), /not startup context|Do not load[^\n]*docs\/agent-handoff-notes\.md/);

  for (const file of ['CLAUDE.md', 'AGENTS.md', 'CONTEXT.md']) {
    for (const line of read(file).split(/\r?\n/)) {
      if (!/^\s*@/.test(line)) continue;
      assert.doesNotMatch(line, /docs\/(?:agent-handoff-notes\.md|handoff\/current\.md)/, `${file} imports handoff material globally: ${line.trim()}`);
    }
  }
});

test('the current handoff is continuity, not an execution authority', () => {
  const current = read(CURRENT);
  assert.match(current, /not\*{0,2}\s*an execution authority/i);
  assert.match(current, /CONTEXT\.md/);
  assert.match(current, /authoritative/i);
  assert.match(read('CONTEXT.md'), /never overrides this router or a workspace stage contract/);
});

test('the current handoff lists every active ICM workspace owner', () => {
  const current = read(CURRENT);
  const workspacesRoot = path.join(repoRoot, '.agents', 'workspaces');
  const owners = fs
    .readdirSync(workspacesRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  assert.ok(owners.length > 0, 'no workspace routers found');
  for (const owner of owners) {
    assert.ok(current.includes(`.agents/workspaces/${owner}/CONTEXT.md`), `current handoff does not list owner: ${owner}`);
  }
  assert.ok(current.includes('BLOG_ORCHESTRATOR.md'), 'current handoff does not name the editorial entry point');
});

test('the current handoff documents the preserved working-tree modifications', () => {
  const current = read(CURRENT);
  for (const file of ['data/content-intelligence/inventory.json', 'data/content-intelligence/inventory.md']) {
    assert.ok(current.includes(file), `current handoff does not document ${file}`);
  }
  assert.match(current, /Do not stage, restore, regenerate, overwrite, revert or commit them/);
});

test('the current handoff documents the critical permission boundaries', () => {
  const current = read(CURRENT);
  const boundaries = [
    /Research is not drafting/i,
    /recommendation is not an implementation/i,
    /Prepare, approve and publish/i,
    /Inspect, prepare, apply and verify/i,
    /source bug is not a deployment permission/i,
    /No merge, deploy, publish/i,
    /Secrets/i,
  ];
  for (const boundary of boundaries) {
    assert.match(current, boundary);
  }
});

test('the current handoff records known diagnostics without authorizing opportunistic repair', () => {
  const current = read(CURRENT);
  for (const file of [
    'src/components/UnitCard.astro',
    'src/components/booking/BookingHandoffForm.astro',
    'src/pages/en/guide/mavrikiano.astro',
  ]) {
    assert.ok(current.includes(file), `current handoff does not record the known diagnostic in ${file}`);
  }
  assert.match(current, /Do not repair these opportunistically/i);
  assert.match(current, /fail 0/i);
});

test('the current handoff stays small enough to load routinely', () => {
  const current = read(CURRENT);
  assert.ok(current.length <= 12_000, `current handoff is ${current.length} characters; keep it under 12000`);
  const lines = current.split(/\r?\n/).length;
  assert.ok(lines <= 300, `current handoff is ${lines} lines; keep it at or under 300`);
  assert.ok(current.length * 4 < read(ARCHIVE).length, 'the current handoff is no longer clearly smaller than the historical archive');
});

test('the resume procedure loads exactly one bounded workspace', () => {
  const current = read(CURRENT);
  assert.match(current, /## Resume Procedure/);
  assert.match(current, /exactly one workspace owner/i);
  assert.match(current, /Load only that workspace router and its one routed stage contract/i);
  assert.match(current, /focused tests/i);
  assert.match(current, /Stop at every review, approval and permission gate/i);
});

test('the ICM context audit still passes with the current handoff in place', () => {
  const result = spawnSync(process.execPath, [auditScript, '--root', repoRoot], {
    encoding: 'utf8',
    cwd: repoRoot,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /ICM context audit passed/);
});
