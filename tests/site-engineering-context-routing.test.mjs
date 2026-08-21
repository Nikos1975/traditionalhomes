import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

const workspacePath = '.agents/workspaces/site-engineering/CONTEXT.md';
const implementationPath = '.agents/workspaces/site-engineering/stages/01_implementation/CONTEXT.md';
const debuggingPath = '.agents/workspaces/site-engineering/stages/02_debugging/CONTEXT.md';
const siteEngineeringRoute = '`.agents/workspaces/site-engineering/CONTEXT.md`';
const i18nRoute = '`.agents/workspaces/i18n/CONTEXT.md`';

function tableRows(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith('|') && line.trim().endsWith('|'))
    .map((line) => line.trim().split('|').slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 2 && !cells.every((cell) => /^-+$/.test(cell)));
}

function inputRows(stageMarkdown, layer) {
  return tableRows(stageMarkdown).filter((cells) => cells[0] === layer);
}

function backtickRef(cell) {
  const match = cell.match(/`([^`]+)`/);
  return match ? match[1] : null;
}

test('root router sends general Astro/UI/site implementation to the site-engineering workspace', () => {
  const rows = tableRows(read('CONTEXT.md'));
  const row = rows.find((cells) => /Astro\/UI\/site implementation/.test(cells[0]));

  assert.ok(row, 'root CONTEXT.md has no site implementation route');
  assert.equal(row[1], siteEngineeringRoute);
  for (const surface of [
    /shared UI behavior/,
    /Tailwind\/CSS/,
    /client-side behavior/,
    /forms/,
    /non-i18n routes/,
    /image-delivery integration/,
  ]) {
    assert.match(row[0], surface);
  }
});

test('root router sends build/runtime/type debugging to the site-engineering workspace', () => {
  const router = read('CONTEXT.md');
  const row = tableRows(router).find((cells) => /debugging/i.test(cells[0]) && /^Build/.test(cells[0]));

  assert.ok(row, 'root CONTEXT.md has no debugging route');
  assert.equal(row[1], siteEngineeringRoute);
  assert.match(row[0], /Windows cache and repeat-failure handling/);

  // The playbook is now stable Layer 3 inside the workspace, not a root route target.
  assert.doesNotMatch(router, /repeated-failures-playbook/);
  assert.match(read('AGENTS.md'), /`\.agents\/workspaces\/site-engineering\/CONTEXT\.md`/);
});

test('i18n work still routes to the i18n workspace and is not duplicated in site engineering', () => {
  const i18nRows = tableRows(read('CONTEXT.md')).filter((cells) => /Multilingual|localization|locale SEO/.test(cells[0]));

  assert.ok(i18nRows.length >= 2, 'root CONTEXT.md lost its multilingual routes');
  for (const row of i18nRows) assert.equal(row[1], i18nRoute);

  const owner = tableRows(read(workspacePath)).find((cells) => /Multilingual translation/.test(cells[0]));
  assert.ok(owner, 'site-engineering workspace does not name the i18n owner');
  assert.equal(owner[1], i18nRoute);

  for (const stage of [read(implementationPath), read(debuggingPath)]) {
    assert.doesNotMatch(stage, /hreflang/i);
    assert.doesNotMatch(stage, /\btranslat/i);
  }
});

test('editorial and research work still routes to the blog orchestrator', () => {
  const row = tableRows(read('CONTEXT.md')).find((cells) => /Blog post, area\/village guide/.test(cells[0]));

  assert.ok(row, 'root CONTEXT.md lost its editorial route');
  assert.equal(row[1], '`BLOG_ORCHESTRATOR.md`');

  const owner = tableRows(read(workspacePath)).find((cells) => /Blog\/guide research, drafting/.test(cells[0]));
  assert.ok(owner, 'site-engineering workspace does not name the editorial owner');
  assert.equal(owner[1], '`BLOG_ORCHESTRATOR.md`');

  for (const stage of [read(implementationPath), read(debuggingPath)]) {
    assert.doesNotMatch(stage, /\bdraft\b/i);
  }
});

test('property-fact authority stays outside the site-engineering workspace', () => {
  const row = tableRows(read('CONTEXT.md')).find((cells) => /^Property facts/.test(cells[0]));

  assert.ok(row, 'root CONTEXT.md lost its property-fact route');
  assert.match(row[1], /\.agents\/workspaces\/property-content\/CONTEXT\.md/);
  assert.doesNotMatch(row[1], /site-engineering/);

  const workspace = read(workspacePath);
  const owner = tableRows(workspace).find((cells) => /Property factual authority/.test(cells[0]));
  assert.ok(owner, 'site-engineering workspace does not name the property-fact owner');
  assert.match(owner[1], /`docs\/architecture\/source-of-truth\.md`/);
  assert.match(owner[1], /`src\/inventory\/inventory\.json`/);

  assert.match(workspace, /Consuming a fact, a media rule or an i18n contract is allowed\. Becoming its authority is not\./);
  assert.match(workspace, /Property facts are not invented in components/);
  assert.match(workspace, /translation resources are not factual stores/);
  assert.match(workspace, /article research evidence is not copied into components/);
  assert.match(workspace, /A source-of-truth conflict is a stop condition/);
});

test('SEO/content-intelligence, social publication and deployment operations are not absorbed', () => {
  const rows = tableRows(read(workspacePath));

  for (const subject of [
    /Deployment, Cloudflare account\/DNS\/redirect administration/,
  ]) {
    const row = rows.find((cells) => subject.test(cells[0]));
    assert.ok(row, `site-engineering workspace does not disclaim ${subject}`);
    assert.match(row[1], /no ICM workspace yet/);
  }

  // Social publication now has an owner. Naming it is still a disclaimer: site
  // engineering consumes nothing from it and never publishes to a platform.
  const socialRow = rows.find((cells) => /Social publication preparation/.test(cells[0]));
  assert.ok(socialRow, 'site-engineering workspace does not disclaim social publication');
  assert.match(socialRow[1], /`\.agents\/workspaces\/social-publishing\/CONTEXT\.md`/);
  assert.match(socialRow[1], /never publishes to a social platform/);

  // SEO/content intelligence now has an owner. Naming it is still a disclaimer,
  // not an absorption: an SEO recommendation never authorizes engineering work here.
  const seoRow = rows.find((cells) => /Search Console analysis/.test(cells[0]));
  assert.ok(seoRow, 'site-engineering workspace does not disclaim SEO/content intelligence');
  assert.match(seoRow[1], /`\.agents\/workspaces\/seo-content-intelligence\/CONTEXT\.md`/);
  assert.match(seoRow[1], /not an authorization to implement it here/);

  assert.match(
    read('CONTEXT.md'),
    /it does not absorb SEO\/content-intelligence, social publication, or deployment operations/,
  );
});

test('the workspace classifies the request and routes exactly one bounded stage at a time', () => {
  const workspace = read(workspacePath);

  assert.match(workspace, /Route one stage at a time/);
  assert.match(workspace, /A request has one primary class\./);
  assert.match(workspace, /Implementation and debugging are separate mental modes\./);

  const classes = tableRows(workspace).filter((cells) => /^[A-D] —/.test(cells[0]));
  assert.equal(classes.length, 4);
  assert.equal(classes[0][2], '`stages/01_implementation/CONTEXT.md`');
  assert.equal(classes[1][2], '`stages/02_debugging/CONTEXT.md`');
  assert.match(classes[2].join(' '), /docs\/architecture\//);
  assert.match(classes[2].join(' '), /no implementation is authorized yet/);
  assert.match(classes[3].join(' '), /route to the owner below and stop/);

  const stageRefs = [...new Set([...workspace.matchAll(/`stages\/([^/`]+)\/CONTEXT\.md`/g)].map((match) => match[1]))];
  assert.deepEqual(stageRefs.sort(), ['01_implementation', '02_debugging']);

  const stageDir = path.join(rootDir, '.agents', 'workspaces', 'site-engineering', 'stages');
  assert.deepEqual(fs.readdirSync(stageDir).sort(), ['01_implementation', '02_debugging']);
});

test('both stages declare a full contract with Layer 3 and Layer 4 inputs that resolve', () => {
  for (const stagePath of [implementationPath, debuggingPath]) {
    const stage = read(stagePath);

    for (const heading of ['Inputs', 'Process', 'Outputs', 'Verify', 'Stop conditions']) {
      assert.match(stage, new RegExp(`^## ${heading}$`, 'm'), `${stagePath} is missing ## ${heading}`);
    }

    const layer3 = inputRows(stage, 'L3');
    const layer4 = inputRows(stage, 'L4');
    assert.ok(layer3.length >= 3, `${stagePath} declares too few Layer 3 references`);
    assert.ok(layer4.length >= 4, `${stagePath} declares too few Layer 4 inputs`);

    for (const row of layer3) {
      const ref = backtickRef(row[1]);
      assert.ok(ref, `${stagePath} Layer 3 row is not a repository path: ${row[1]}`);
      assert.ok(fs.existsSync(path.join(rootDir, ref)), `${stagePath} Layer 3 reference does not exist: ${ref}`);
    }
  }
});

test('the debugging stage keeps the repeated-failures playbook as stable Layer 3 guidance', () => {
  const stage = read(debuggingPath);
  const playbook = 'docs/operations/repeated-failures-playbook.md';

  assert.ok(
    inputRows(stage, 'L3').some((row) => backtickRef(row[1]) === playbook),
    'the debugging stage does not declare the playbook as Layer 3',
  );
  assert.match(stage, new RegExp(`follow \`${playbook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\``));
  assert.ok(fs.existsSync(path.join(rootDir, playbook)));
});

test('neither stage loads all of src, all of tests, or all of docs', () => {
  for (const stagePath of [implementationPath, debuggingPath]) {
    const stage = read(stagePath);

    assert.match(stage, /Do not load all of `src\/`, all of `tests\/`, or all of `docs\/`/);
    assert.match(stage, /selected at task time as Layer 4/);
    assert.doesNotMatch(stage, /`src\/\*\*`|`tests\/\*\*`|`docs\/\*\*`/);

    for (const row of inputRows(stage, 'L4')) {
      assert.match(
        row.join(' '),
        /\b(exact|exactly|only)\b/i,
        `${stagePath} declares an unbounded Layer 4 input: ${row.join(' | ')}`,
      );
    }
  }

  assert.match(read(workspacePath), /Select exact affected files at task time\./);
});

test('the debugging contract reproduces and classifies before it edits anything', () => {
  const stage = read(debuggingPath);
  const order = [
    /Reproduce the failure exactly as reported before reading source\./,
    /Reduce it to the smallest failing case/,
    /Classify the failure as a source failure or an environment failure before editing anything\./,
    /make the smallest in-scope fix at the cause/,
    /Rerun the exact failing test, then the affected test family\./,
    /Rerun the regression gate appropriate to what actually changed\./,
  ];

  let cursor = -1;
  for (const step of order) {
    const index = stage.search(step);
    assert.ok(index > cursor, `debugging contract step out of order: ${step}`);
    cursor = index;
  }
});

test('an environment lock can never authorize a source edit', () => {
  const stage = read(debuggingPath);

  assert.match(stage, /Never edit source, rename an asset, or commit generated output to clear an environment lock\./);
  assert.match(stage, /If the lock survives the playbook response, stop and report it\./);
  assert.match(stage, /an environment lock that survives the playbook response/);
  assert.match(read(workspacePath), /An environment or generated-output lock never authorizes a source edit\./);
});

test('unrelated diagnostics and unrelated code stay out of scope', () => {
  assert.match(read(workspacePath), /Do not normalize unrelated diagnostics/);
  assert.match(read(workspacePath), /No speculative refactor, no rename sweep/);

  const implementation = read(implementationPath);
  assert.match(implementation, /compare the diagnostics against the branch-base baseline/);
  assert.match(implementation, /pre-existing diagnostics stay as they are and unrelated ones must not be repaired here/);
  assert.match(implementation, /Do not redesign the surrounding area, refactor unrelated code, or repair unrelated diagnostics/);

  const debugging = read(debuggingPath);
  assert.match(debugging, /unrelated pre-existing diagnostics stay unrepaired/);
  assert.match(debugging, /do not repair unrelated defects found on the way/);
});

test('merge, deploy, publication and force push stay prohibited in the whole workspace', () => {
  const workspace = read(workspacePath);

  assert.match(
    workspace,
    /No merge, deploy, publication, push, force push or destructive cleanup is authorized by completing a stage\./,
  );
  assert.match(workspace, /only from explicitly staged paths after an exact changed-file review/);

  for (const stagePath of [implementationPath, debuggingPath]) {
    assert.match(read(stagePath), /any requested merge, deploy, publication, push or force push/);
  }
});

test('the repository control plane still passes the ICM audit with site engineering active', () => {
  const result = spawnSync(process.execPath, [path.join(rootDir, 'scripts', 'context', 'validate-icm.mjs'), '--root', rootDir], {
    encoding: 'utf8',
    cwd: rootDir,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /ICM context audit passed/);
});
