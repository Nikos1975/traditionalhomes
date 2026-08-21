import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, '..');
const auditScript = path.join(repoRoot, 'scripts', 'context', 'validate-icm.mjs');

const POLICY = 'docs/operations/edit-source-principle.md';
const ROUTER = 'CONTEXT.md';
const HANDOFF = 'docs/handoff/current.md';

function read(relative) {
  return fs.readFileSync(path.join(repoRoot, relative), 'utf8');
}

function sentencesMatching(text, pattern) {
  return text
    .split(/\r?\n/)
    .filter((line) => pattern.test(line));
}

test('the edit-source policy exists at the routed operations path', () => {
  assert.ok(fs.existsSync(path.join(repoRoot, POLICY)), `${POLICY} is missing`);
});

test('the root router carries the principle without becoming the policy', () => {
  const router = read(ROUTER);
  assert.ok(router.includes(POLICY), `${ROUTER} does not route to ${POLICY}`);
  assert.match(router, /derived|generated/i);
  assert.match(router, /edit source/i);

  const routed = sentencesMatching(router, new RegExp(POLICY.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.ok(routed.length <= 2, 'the router repeats the edit-source policy instead of routing to it');
  assert.ok(router.length <= 8_000, `${ROUTER} is ${router.length} characters; keep it a router`);
});

test('the policy distinguishes source from derived output', () => {
  const policy = read(POLICY);
  for (const label of [
    /authoritative source/i,
    /authored source/i,
    /derived|generated/i,
    /local evidence/i,
    /build|cache/i,
  ]) {
    assert.match(policy, label);
  }
  assert.match(policy, /EDIT SOURCE\s*(?:!=|≠|=\/=)\s*EDIT DERIVED OUTPUT/i);
});

test('generated output is not the repair surface for its own source', () => {
  const policy = read(POLICY);
  assert.match(policy, /never the repair surface|not the repair surface/i);
  assert.match(policy, /\b(?:do not|never|forbidden)\b[^.\n]*hand-edit|hand-edit[^.\n]*\b(?:forbidden|never)\b/i);
});

test('an unknown edit source fails closed', () => {
  const policy = read(POLICY);
  assert.match(policy, /##\s*Fail-Closed Rule/i);
  assert.match(policy, /stop and report/i);
  assert.match(policy, /cannot be established/i);
  assert.match(read(ROUTER), /stop and report/i);
});

test('the policy creates no second factual or workflow authority', () => {
  const policy = read(POLICY);
  assert.match(policy, /no (?:factual|new) authority|creates no factual authority/i);
  assert.match(policy, /registry/i);
  assert.match(policy, /method/i);

  for (const forbidden of ['edit-source.json', 'generators.json']) {
    assert.ok(!fs.existsSync(path.join(repoRoot, forbidden)), `${forbidden} duplicates existing authorities`);
    assert.ok(!fs.existsSync(path.join(repoRoot, 'data', forbidden)), `data/${forbidden} duplicates existing authorities`);
  }
});

test('property factual authority remains src/inventory/inventory.json', () => {
  const policy = read(POLICY);
  assert.match(policy, /src\/inventory\/inventory\.json/);
  assert.ok(fs.existsSync(path.join(repoRoot, 'src', 'inventory', 'inventory.json')));
  assert.match(read('CLAUDE.md'), /src\/inventory\/inventory\.json/);
  assert.match(read(ROUTER), /Property facts have one authority/i);
});

test('local ICM provenance stays evidence, not a repository edit source', () => {
  const policy = read(POLICY);
  assert.match(policy, /\.agent\/icm/);
  assert.match(policy, /(?:untracked|local evidence)/i);
  assert.match(policy, /never an\s+edit source|not an\s+edit source/i);
  assert.match(read('.gitignore'), /^\.agent\/$/m);
});

test('build and cache products cannot become edit sources', () => {
  const policy = read(POLICY);
  assert.match(policy, /build/i);
  assert.match(policy, /cache/i);
  assert.match(policy, /never (?:edited|an edit source)/i);
});

test('identifying an edit source grants no merge permission', () => {
  assert.match(read(POLICY), /##\s*Permission Boundary[\s\S]*merge/i);
});

test('identifying an edit source grants no push permission', () => {
  assert.match(read(POLICY), /##\s*Permission Boundary[\s\S]*push/i);
});

test('identifying an edit source grants no deployment permission', () => {
  assert.match(read(POLICY), /##\s*Permission Boundary[\s\S]*deploy/i);
});

test('identifying an edit source grants no publication permission', () => {
  assert.match(read(POLICY), /##\s*Permission Boundary[\s\S]*publication/i);
});

test('the policy declares a decision procedure rather than a file database', () => {
  const policy = read(POLICY);
  assert.match(policy, /##\s*Decision Procedure/i);
  const steps = policy
    .split(/\r?\n/)
    .filter((line) => /^\d+\.\s+/.test(line.trim()));
  assert.ok(steps.length >= 6, 'the decision procedure has too few steps to be usable');
});

test('the current handoff records Phase 17 and the edit-source principle', () => {
  const handoff = read(HANDOFF);
  const phase = /Current validated phase:[^\n]*Phase\s+(\d+)/.exec(handoff);
  assert.ok(phase, 'the handoff does not name a current validated phase');
  assert.equal(phase[1], '17');
  assert.match(handoff, /edit-source/i);
  assert.ok(handoff.includes(POLICY), 'the handoff does not name the edit-source policy');
});

test('no Phase 18 roadmap is introduced', () => {
  for (const file of [HANDOFF, ROUTER, POLICY]) {
    assert.doesNotMatch(read(file), /Phase\s+18/i, `${file} invents a Phase 18`);
  }
});

test('the ICM context audit still passes with the edit-source policy in place', () => {
  const result = spawnSync(process.execPath, [auditScript, '--root', repoRoot], {
    encoding: 'utf8',
    cwd: repoRoot,
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /ICM context audit passed/);
});
