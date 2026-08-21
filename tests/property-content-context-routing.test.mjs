import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(rootDir, relativePath));

const workspacePath = '.agents/workspaces/property-content/CONTEXT.md';
const contentStagePath = '.agents/workspaces/property-content/stages/01_content/CONTEXT.md';
const auditStagePath = '.agents/workspaces/property-content/stages/02_factual_audit/CONTEXT.md';
const correctionStagePath = '.agents/workspaces/property-content/stages/03_fact_correction/CONTEXT.md';
const propertyRoute = '`.agents/workspaces/property-content/CONTEXT.md`';
const inventoryPath = 'src/inventory/inventory.json';

// The Phase 10 proof property. Its facts are read, never asserted as literals,
// so this file can never become a second place where property facts are stored.
const proofSlug = 'margarita';
const proofContentPath = `src/content/houses/${proofSlug}.md`;

function tableRows(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith('|') && line.trim().endsWith('|'))
    .map((line) => line.trim().split('|').slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 2 && !cells.every((cell) => /^-+$/.test(cell)));
}

const inputRows = (markdown, layer) => tableRows(markdown).filter((cells) => cells[0] === layer);
const backtickRef = (cell) => (cell.match(/`([^`]+)`/) ?? [])[1] ?? null;
const inventory = () => JSON.parse(read(inventoryPath));
const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const numberPattern = (value) => (numberWords[value] ? `(?:${value}|${numberWords[value]})` : `${value}`);

test('root router sends property-fact and property-content work to the property-content workspace', () => {
  const rows = tableRows(read('CONTEXT.md'));

  const factRow = rows.find((cells) => /^Property facts/.test(cells[0]));
  assert.ok(factRow, 'root CONTEXT.md has no property-fact route');
  assert.equal(factRow[1], propertyRoute);
  assert.match(factRow[0], /factual correction/);
  assert.match(factRow[0], /audit against the canonical inventory/);

  const copyRow = rows.find((cells) => /^Property page copy/.test(cells[0]));
  assert.ok(copyRow, 'root CONTEXT.md has no property-copy route');
  assert.equal(copyRow[1], propertyRoute);

  // The general editorial-copy route must no longer claim property-page copy.
  const editorialRow = rows.find((cells) => /^Website\/home\/collection/.test(cells[0]));
  assert.ok(editorialRow, 'root CONTEXT.md lost its general editorial-copy route');
  assert.match(editorialRow[0], /not property-specific/);
  assert.match(read('AGENTS.md'), /`\.agents\/workspaces\/property-content\/CONTEXT\.md`/);
  assert.match(read('CONTEXT.md'), /Property facts have one authority/);
});

test('the workspace routes one bounded stage at a time and separates the permission boundary', () => {
  const workspace = read(workspacePath);
  const rows = tableRows(workspace);

  const contentRow = rows.find((cells) => /^Bounded change to property prose/.test(cells[0]));
  assert.ok(contentRow, 'no bounded property-content route');
  assert.equal(contentRow[1], '`stages/01_content/CONTEXT.md`');

  const auditRow = rows.find((cells) => /investigate a suspected contradiction, or audit a property page/.test(cells[0]));
  assert.ok(auditRow, 'no property factual-audit route');
  assert.equal(auditRow[1], '`stages/02_factual_audit/CONTEXT.md`');

  const correctionRow = rows.find((cells) => /^Change a canonical structured fact itself/.test(cells[0]));
  assert.ok(correctionRow, 'no canonical fact-correction route');
  assert.equal(correctionRow[1], '`stages/03_fact_correction/CONTEXT.md`');
  assert.match(correctionRow[0], /explicit authoritative correction/);

  assert.match(workspace, /Route one stage at a time/);
  assert.match(workspace, /Stage 01 may never write to the factual record/);
  assert.match(workspace, /Stage 02 writes nothing at all by default/);
  assert.match(workspace, /Stage 03 is the only stage allowed to change canonical facts/);

  const stageDir = path.join(rootDir, '.agents', 'workspaces', 'property-content', 'stages');
  assert.deepEqual(fs.readdirSync(stageDir).sort(), ['01_content', '02_factual_audit', '03_fact_correction']);
});

test('property translation stays with i18n and renderer defects stay with site engineering', () => {
  const rows = tableRows(read(workspacePath));

  const i18nRow = rows.find((cells) => /Translating an existing property page/.test(cells[0]));
  assert.ok(i18nRow, 'the workspace does not name the i18n owner');
  assert.equal(i18nRow[1], '`.agents/workspaces/i18n/CONTEXT.md`');
  assert.match(i18nRow[0], /locale rendering a fact differently from the English master/);

  const engineeringRow = rows.find((cells) => /displaying the wrong canonical value/.test(cells[0]));
  assert.ok(engineeringRow, 'the workspace does not name the site-engineering owner');
  assert.equal(engineeringRow[1], '`.agents/workspaces/site-engineering/CONTEXT.md`');

  assert.match(
    read(workspacePath),
    /A translation mismatch is an i18n task and a renderer showing a wrong value is site engineering; neither is a canonical fact change\./,
  );

  // The i18n and site-engineering routes themselves are untouched.
  const rootRows = tableRows(read('CONTEXT.md'));
  for (const row of rootRows.filter((cells) => /Multilingual/.test(cells[0]))) {
    assert.equal(row[1], '`.agents/workspaces/i18n/CONTEXT.md`');
  }
  assert.ok(rootRows.some((cells) => cells[1] === '`.agents/workspaces/site-engineering/CONTEXT.md`'));
});

test('SEO and content intelligence cannot redefine a property fact', () => {
  const seoRow = tableRows(read(workspacePath)).find((cells) => /Search Console analysis/.test(cells[0]));

  assert.ok(seoRow, 'the workspace does not disclaim SEO/content intelligence');
  assert.match(seoRow[1], /`\.agents\/workspaces\/seo-content-intelligence\/CONTEXT\.md`/);
  assert.match(seoRow[1], /never evidence of a property fact/);
  assert.match(read(correctionStagePath), /not an inference, a search result, an SEO recommendation, or prose that merely disagrees/);
});

test('property facts have one declared canonical authority', () => {
  const workspace = read(workspacePath);
  const authorityRow = tableRows(workspace).find((cells) => /^Factual authority$/.test(cells[0]));

  assert.ok(authorityRow, 'the workspace declares no factual authority');
  assert.match(authorityRow[2], new RegExp(`\`${inventoryPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\``));
  assert.match(authorityRow[2], /one record per stable slug/);
  assert.ok(exists(inventoryPath));

  const units = inventory();
  assert.ok(Array.isArray(units) && units.length > 0);
  for (const unit of units) assert.equal(typeof unit.slug, 'string');

  // The architecture reference still says the same thing.
  const sourceOfTruth = read('docs/architecture/source-of-truth.md');
  assert.match(sourceOfTruth, /`src\/inventory\/inventory\.json` is the factual property source/);
  assert.match(sourceOfTruth, /Markdown content is narrative copy only/);

  assert.match(workspace, /facts have one authority; presentation may consume facts but must not become a second factual database/);
});

test('property prose is separated from factual authority and is not a structured store', () => {
  const workspace = read(workspacePath);
  const contentRow = tableRows(workspace).find((cells) => /^Property content$/.test(cells[0]));

  assert.ok(contentRow, 'the workspace does not place property content');
  assert.match(contentRow[2], /`src\/content\/houses\/`/);
  assert.match(contentRow[2], /`src\/content\/villa\/`/);
  assert.match(
    workspace,
    /may carry narrative detail that has no structured counterpart, but it never overrides the factual record/,
  );

  // The proof property's content file carries prose plus schema frontmatter only.
  const frontmatter = read(proofContentPath).match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(frontmatter, `${proofContentPath} has no frontmatter`);
  const keys = frontmatter[1]
    .split(/\r?\n/)
    .filter((line) => line.trim() && !/^\s/.test(line))
    .map((line) => line.split(':')[0].trim());
  assert.deepEqual(keys.sort(), ['slug', 'summary', 'title']);
});

test('translation resources and presentation mappings cannot become factual authority', () => {
  assert.match(read(workspacePath), /Locale resources and presentation mappings are never factual authority\./);
  assert.match(read(workspacePath), /the default locale always renders the factual value verbatim/);

  const presentation = read('src/i18n/inventory-display.ts');
  assert.match(presentation, /This module owns nothing factual/);
  assert.match(presentation, /not a second inventory/);
});

test('every stage declares a full contract with Layer 3 references that resolve', () => {
  for (const stagePath of [contentStagePath, auditStagePath, correctionStagePath]) {
    const stage = read(stagePath);

    for (const heading of ['Inputs', 'Process', 'Outputs', 'Verify', 'Stop conditions']) {
      assert.match(stage, new RegExp(`^## ${heading}$`, 'm'), `${stagePath} is missing ## ${heading}`);
    }

    const layer3 = inputRows(stage, 'L3');
    assert.ok(layer3.length >= 3, `${stagePath} declares too few Layer 3 references`);
    for (const row of layer3) {
      const ref = backtickRef(row[1]);
      assert.ok(ref, `${stagePath} Layer 3 row is not a repository path: ${row[1]}`);
      assert.ok(exists(ref), `${stagePath} Layer 3 reference does not exist: ${ref}`);
    }
  }

  // Editorial guidance belongs to the prose stage; the audit stage leads with the architecture.
  assert.ok(inputRows(read(contentStagePath), 'L3').some((row) => backtickRef(row[1]) === '.ai/prompts/website-editorial-system.md'));
  assert.equal(backtickRef(inputRows(read(auditStagePath), 'L3')[0][1]), 'docs/architecture/source-of-truth.md');
});

test('Layer 4 inputs are narrow and never load every property at once', () => {
  for (const stagePath of [contentStagePath, auditStagePath, correctionStagePath]) {
    const stage = read(stagePath);
    const layer4 = inputRows(stage, 'L4');
    assert.ok(layer4.length >= 4, `${stagePath} declares too few Layer 4 inputs`);

    for (const row of layer4) {
      assert.match(
        row.join(' '),
        /\b(exact|exactly|only)\b/i,
        `${stagePath} declares an unbounded Layer 4 input: ${row.join(' | ')}`,
      );
    }

    // Each stage anchors on one property's record plus one exact content or representation surface.
    assert.match(stage, /`src\/inventory\/inventory\.json`/);
  }

  assert.match(
    read(contentStagePath),
    /Do not load all of `src\/inventory\/`, every property Markdown file, all translations, all components, all tests or all of `docs\/`\./,
  );
  assert.match(read(auditStagePath), /Do not audit every property at once\./);
});

test('the factual audit is evidence-first and read-only by default', () => {
  const stage = read(auditStagePath);

  assert.match(stage, /Read-only by default/);
  assert.match(stage, /this stage does not edit content or data/);
  assert.match(stage, /Read the factual record first, before any prose\./);
  assert.match(stage, /Report without editing\./);
  assert.match(stage, /no file change by default/);
  assert.match(stage, /Do not convert an audit into a rewrite\./);

  for (const classification of [
    'consistent',
    'presentation difference only',
    'missing from presentation',
    'stale presentation value',
    'canonical source conflict',
    'unsupported claim',
    'unclear authority requiring a human decision',
  ]) {
    assert.ok(stage.includes(classification), `the audit stage cannot classify: ${classification}`);
  }
});

test('a canonical conflict stops instead of being reconciled silently', () => {
  assert.match(
    read(workspacePath),
    /When two plausible authoritative records disagree, stop and report the conflict\. Do not reconcile it silently in one copy\./,
  );
  assert.match(read(auditStagePath), /A genuine canonical source conflict stops here and is never resolved automatically\./);
  assert.match(read(contentStagePath), /do not edit either to match the other/);
  assert.match(read(correctionStagePath), /two authoritative records disagreeing/);

  // Known duplication is documented rather than migrated.
  assert.match(read(workspacePath), /Known duplication is documented, not migrated/);
  assert.ok(exists('docs/audits/repo-structure-audit-2026-06-09.md'));
});

test('unsupported facts cannot be introduced and qualifiers cannot be dropped', () => {
  const workspace = read(workspacePath);

  assert.match(workspace, /Never invent a property fact, and never infer a missing dimension, distance, capacity or amenity\./);
  assert.match(workspace, /Never convert an approximate fact into an exact one\./);
  for (const qualifier of ['approximately', 'nearby', 'on request', 'shared', 'private', 'external', 'not step-free']) {
    assert.ok(workspace.includes(qualifier), `the workspace does not protect the qualifier: ${qualifier}`);
  }
  assert.match(workspace, /Never drop a limitation to improve promotional copy, and never turn traditional or authentic positioning into luxury language\./);

  const stage = read(contentStagePath);
  assert.match(stage, /never invented and never sharpened/);
  assert.match(stage, /Preserve every qualifier and limitation\. If the change would drop one, stop\./);
  assert.match(stage, /any change that would touch `src\/inventory\/inventory\.json`/);
});

test('merge, deploy, publication and force push stay prohibited across the workspace', () => {
  assert.match(read(workspacePath), /No merge, deploy, publication, push or force push is authorized by completing a stage\./);
  for (const stagePath of [contentStagePath, auditStagePath, correctionStagePath]) {
    assert.match(read(stagePath), /any requested merge, deploy, publication, push or force push/);
  }
});

test('the proof property routes from the root router to an exact record and an exact content file', () => {
  const factRow = tableRows(read('CONTEXT.md')).find((cells) => /^Property facts/.test(cells[0]));
  assert.equal(factRow[1], propertyRoute);

  const auditRow = tableRows(read(workspacePath)).find((cells) => /audit a property page/.test(cells[0]));
  assert.equal(auditRow[1], '`stages/02_factual_audit/CONTEXT.md`');

  const stage = read(auditStagePath);
  assert.match(stage, /only that property's record in `src\/inventory\/inventory\.json`/);
  assert.match(stage, /only that property's exact English master content file/);

  const record = inventory().find((unit) => unit.slug === proofSlug);
  assert.ok(record, `${proofSlug} has no canonical record`);
  assert.ok(exists(proofContentPath), `${proofContentPath} does not exist`);
  assert.equal(record.type, 'house');
});

test('the proof property English master does not contradict its canonical record', () => {
  const record = inventory().find((unit) => unit.slug === proofSlug);
  const text = read(proofContentPath);

  assert.match(text, new RegExp(`${record.areaSqm}\\s*m²`), 'the stated area does not match the record');
  assert.match(text, new RegExp(`${numberPattern(record.sleeps)}\\s+guests`, 'i'), 'the stated capacity does not match the record');
  assert.match(text, new RegExp(`${numberPattern(record.bedrooms)}[- ]bedroom`, 'i'), 'the stated bedroom count does not match the record');

  if (record.pool === 'none') {
    assert.doesNotMatch(text, /\b(?:private|shared) pool\b|pool terrace|with a pool\b/i, 'the content claims a pool the record does not have');
  }

  // Parking: the record's distance and its "shared" qualifier both survive in prose.
  const parkingDistance = record.parking.match(/(\d+)\s*m\b/);
  assert.ok(parkingDistance, 'the record does not state a parking distance');
  assert.match(text, new RegExp(`${parkingDistance[1]}\\s*m\\b`), 'the content drops the parking distance');
  assert.match(text, /approximately|about|~/i, 'the content drops the approximation qualifier');
  if (/shared/i.test(record.parking)) assert.match(text, /shared/i, 'the content drops the shared-parking qualifier');

  // Every hard constraint in the record is still visible in the prose.
  const constraintEvidence = [
    { constraint: /not step-free/i, evidence: /not step-free/i },
    { constraint: /internal stairs/i, evidence: /internal stairs/i },
    { constraint: /bathroom accessed via the courtyard/i, evidence: /bathroom is (?:also )?accessed (?:from|via) th(?:e|is) courtyard/i },
  ];
  assert.ok(record.hardConstraints.length > 0);
  for (const constraint of record.hardConstraints) {
    const rule = constraintEvidence.find((candidate) => candidate.constraint.test(constraint));
    assert.ok(rule, `no evidence rule covers the hard constraint: ${constraint}`);
    assert.match(text, rule.evidence, `the content drops the limitation: ${constraint}`);
  }
});

test('the repository control plane still passes the ICM audit with property content active', () => {
  const result = spawnSync(process.execPath, [path.join(rootDir, 'scripts', 'context', 'validate-icm.mjs'), '--root', rootDir], {
    encoding: 'utf8',
    cwd: rootDir,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /ICM context audit passed/);
});
