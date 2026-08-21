import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { buildInventory } from '../scripts/content-intelligence/inventory.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(rootDir, relativePath));

const workspacePath = '.agents/workspaces/seo-content-intelligence/CONTEXT.md';
const evidenceStagePath = '.agents/workspaces/seo-content-intelligence/stages/01_evidence/CONTEXT.md';
const analysisStagePath = '.agents/workspaces/seo-content-intelligence/stages/02_analysis/CONTEXT.md';
const recommendationStagePath = '.agents/workspaces/seo-content-intelligence/stages/03_recommendation/CONTEXT.md';
const stagePaths = [evidenceStagePath, analysisStagePath, recommendationStagePath];
const seoRoute = '`.agents/workspaces/seo-content-intelligence/CONTEXT.md`';

// The Phase 11 proof material is the repository's own deterministic production inventory and
// redirect map. No Search Console evidence is fabricated here: the acquisition, aggregation and
// scoring behaviours already have their own tests, and this file proves routing and ownership.
const proofGuideRoute = '/en/guide/mavrikiano/';
const proofArticleRoute = '/en/blog/mavrikiano-distances-and-guide/';
const proofLegacyUrl = '/index.php/en/elounda';
const proofDraftRoute = '/en/blog/elounda-guide-style-1/';

function tableRows(markdown) {
  return markdown
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith('|') && line.trim().endsWith('|'))
    .map((line) => line.trim().split('|').slice(1, -1).map((cell) => cell.trim()))
    .filter((cells) => cells.length >= 2 && !cells.every((cell) => /^-+$/.test(cell)));
}

const inputRows = (markdown, layer) => tableRows(markdown).filter((cells) => cells[0] === layer);
const backtickRef = (cell) => (cell.match(/`([^`]+)`/) ?? [])[1] ?? null;

let inventoryPromise;
const productionInventory = () => (inventoryPromise ??= buildInventory({ rootDir, includeDrafts: true }));

test('the root router sends Search Console acquisition and SEO analysis to the SEO workspace', () => {
  const rows = tableRows(read('CONTEXT.md'));
  const seoRow = rows.find((cells) => /Search Console acquisition/.test(cells[0]));

  assert.ok(seoRow, 'root CONTEXT.md has no SEO/content-intelligence route');
  assert.equal(seoRow[1], seoRoute);
  for (const subject of [
    /SEO performance analysis/,
    /query\/page analysis/,
    /SEO opportunity scoring/,
    /content-gap or content-overlap analysis/,
    /SEO recommendation planning/,
    /reassessing an older SEO report against current evidence/,
  ]) assert.match(seoRow[0], subject, `the root SEO route does not cover ${subject}`);

  assert.match(read('AGENTS.md'), /`\.agents\/workspaces\/seo-content-intelligence\/CONTEXT\.md`/);
  assert.ok(exists(workspacePath));
});

test('the root router keeps every existing owner and adds no second SEO authority', () => {
  const rows = tableRows(read('CONTEXT.md'));

  for (const row of rows.filter((cells) => /Multilingual/.test(cells[0]))) {
    assert.equal(row[1], '`.agents/workspaces/i18n/CONTEXT.md`');
  }
  assert.ok(rows.some((cells) => cells[1] === '`BLOG_ORCHESTRATOR.md`'));
  assert.ok(rows.some((cells) => cells[1] === '`.agents/workspaces/property-content/CONTEXT.md`'));
  assert.ok(rows.some((cells) => cells[1] === '`.agents/workspaces/site-engineering/CONTEXT.md`'));
  assert.equal(rows.filter((cells) => cells[1] === seoRoute).length, 1, 'SEO work must have exactly one root route');

  assert.match(
    read('CONTEXT.md'),
    /Google Search Console is the authoritative source for current organic-search performance\. SEO evidence may recommend a change; it never authorizes the change, and an older SEO report is never current truth\./,
  );
});

test('the workspace routes one bounded stage at a time and separates the permission boundary', () => {
  const workspace = read(workspacePath);
  const rows = tableRows(workspace);

  const evidenceRow = rows.find((cells) => /^Acquire, import, inspect or validate Search Console evidence/.test(cells[0]));
  assert.ok(evidenceRow, 'no evidence route');
  assert.equal(evidenceRow[1], '`stages/01_evidence/CONTEXT.md`');

  const analysisRow = rows.find((cells) => /^Turn already-validated evidence into reproducible findings/.test(cells[0]));
  assert.ok(analysisRow, 'no analysis route');
  assert.equal(analysisRow[1], '`stages/02_analysis/CONTEXT.md`');

  const recommendationRow = rows.find((cells) => /^Convert verified findings into bounded, reviewable recommendations/.test(cells[0]));
  assert.ok(recommendationRow, 'no recommendation route');
  assert.equal(recommendationRow[1], '`stages/03_recommendation/CONTEXT.md`');

  assert.match(workspace, /Route one stage at a time/);
  assert.match(workspace, /SEO evidence may recommend a change\. It does not authorize the change\./);

  const stageDir = path.join(rootDir, '.agents', 'workspaces', 'seo-content-intelligence', 'stages');
  assert.deepEqual(fs.readdirSync(stageDir).sort(), ['01_evidence', '02_analysis', '03_recommendation']);
});

test('evidence acquisition is a separate permission boundary from analysis and recommendation', () => {
  assert.match(
    read(workspacePath),
    /Stage 01 is the only stage that may use credentials, reach the network, or write anything at all, and it writes only to the approved evidence location\. Stage 02 writes nothing and reads validated evidence only\. Stage 03 produces a recommendation record and never implements it\./,
  );

  const evidence = read(evidenceStagePath);
  assert.match(evidence, /This stage does not interpret evidence, does not recommend an editorial or technical action, and does not touch the site\./);
  assert.match(evidence, /Stop\. Interpretation belongs to Stage 02\./);
  assert.match(evidence, /no interpretation, no opportunity list and no recommendation/);
  assert.match(evidence, /Persist only to the approved evidence location\. Write nothing to `src\/`, `public\/`, `docs\/` or tracked data\./);

  assert.match(read(analysisStagePath), /Output findings and stop\. Do not proceed to recommendation unless Stage 03 is explicitly requested\./);
  assert.match(read(workspacePath), /Evidence, analysis and recommendation are separate mental modes\./);
});

test('validated Search Console evidence is the authority for current organic performance', () => {
  const workspace = read(workspacePath);
  const authorityRow = tableRows(workspace).find((cells) => /^Current organic query and page performance$/.test(cells[0]));

  assert.ok(authorityRow, 'the workspace declares no performance authority');
  assert.match(authorityRow[1], /Google Search Console/);
  assert.match(authorityRow[2], /`data\/content-intelligence\/search-console\/processed\/`/);
  assert.ok(exists('data/content-intelligence/search-console/processed'));

  assert.match(
    workspace,
    /Intuition, generic SEO advice, keyword tools alone, older reports, model estimates, content length, title wording and search-result snippets are not\./,
  );
  assert.match(workspace, /External SERP or keyword research may supplement first-party evidence; it never overwrites it\./);
  assert.match(read(analysisStagePath), /Confirm the evidence is validated Stage 01 evidence and that the datasets are compatible\./);
});

test('every stage declares a full contract whose Layer 3 references resolve', () => {
  for (const stagePath of stagePaths) {
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

  // L3 is stable methodology and policy only; current evidence never appears there.
  for (const stagePath of stagePaths) {
    for (const row of inputRows(read(stagePath), 'L3')) {
      const ref = backtickRef(row[1]);
      assert.doesNotMatch(ref, /^data\/content-intelligence\//, `${stagePath} declares generated evidence as Layer 3: ${ref}`);
    }
  }

  assert.equal(backtickRef(inputRows(read(evidenceStagePath), 'L3')[0][1]), 'docs/content-intelligence/search-console.md');
});

test('Layer 4 evidence selection is exact and no stage loads everything', () => {
  for (const stagePath of stagePaths) {
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

    assert.match(stage, /Do not load/, `${stagePath} does not bound its context`);
    assert.match(stage, /all of `docs\/`/, `${stagePath} does not exclude the whole docs tree`);
    assert.match(stage, /all of `tests\/`/, `${stagePath} does not exclude the whole test tree`);
    assert.match(stage, /every processed dataset/, `${stagePath} does not exclude every processed dataset`);
    assert.match(stage, /every article/, `${stagePath} does not exclude every article`);
  }

  assert.match(
    read(analysisStagePath),
    /A controlled sitewide analysis still names one compatible dataset set and one production inventory\./,
  );
});

test('a recommendation cannot edit production content and must name an owning workspace', () => {
  const recommendation = read(recommendationStagePath);

  assert.match(recommendation, /This stage is recommendation-only\. It implements nothing\./);
  assert.match(recommendation, /no content, route, redirect, metadata, translation or fact change/);
  assert.match(recommendation, /Name exactly one owning workspace and stop; do not restate its procedure\./);
  assert.match(recommendation, /Approval is a human act, and an approved recommendation is executed by its owner under its own contract\./);
  assert.match(recommendation, /a request to implement the recommendation inside this stage/);

  assert.match(
    read(workspacePath),
    /Do not modify production source, content, translations, inventory, routes, redirects or SEO algorithms from this workspace\./,
  );

  for (const part of [
    'evidence',
    'finding',
    'recommended action',
    'confidence',
    'risk and downside',
    'owning implementation workspace',
    'whether human approval is required',
  ]) assert.ok(recommendation.includes(part), `the recommendation form is missing: ${part}`);
});

test('approved implementations route to the workspace that owns them', () => {
  const rows = tableRows(read(recommendationStagePath));
  const owner = (pattern) => {
    const row = rows.find((cells) => pattern.test(cells[0]));
    assert.ok(row, `no implementation route for ${pattern}`);
    return row[1];
  };

  assert.match(owner(/Revise, consolidate or audit an existing article or guide/), /`BLOG_ORCHESTRATOR\.md`/);
  assert.match(owner(/Revise, consolidate or audit an existing article or guide/), /`\.agents\/workspaces\/editorial-research\/CONTEXT\.md`/);
  assert.match(owner(/Research a genuinely new article/), /`BLOG_ORCHESTRATOR\.md`/);
  assert.equal(owner(/^Property page content$/), '`.agents/workspaces/property-content/CONTEXT.md`');
  assert.match(owner(/A change to a property fact/), /fact-correction stage, on an explicit authoritative correction only/);
  assert.match(owner(/Route, component, template, title and meta implementation, canonical or redirect implementation/), /`\.agents\/workspaces\/site-engineering\/CONTEXT\.md`/);
  assert.match(owner(/Localized SEO, hreflang, locale canonical and sitemap infrastructure/), /`\.agents\/workspaces\/i18n\/CONTEXT\.md`/);
  assert.match(owner(/Deployment, Cloudflare account, DNS and edge redirect administration/), /no ICM workspace yet/);
  assert.ok(!rows.some((cells) => /social/i.test(cells[0]) && !/no ICM workspace yet/.test(cells[1])));
});

test('property facts stay with property content and cannot be created by SEO', () => {
  const workspace = read(workspacePath);
  const factRow = tableRows(workspace).find((cells) => /^Property capacity, amenities, distances and constraints$/.test(cells[0]));

  assert.ok(factRow, 'the workspace does not place property facts');
  assert.match(factRow[2], /`\.agents\/workspaces\/property-content\/CONTEXT\.md`/);
  assert.match(factRow[2], /`src\/inventory\/inventory\.json`/);
  assert.match(
    workspace,
    /No SEO-only fact creation\. SEO analysis never invents a distance, amenity, price, opening hour, historical claim or local fact\./,
  );

  // The property workspace now names this owner and still refuses SEO as factual evidence.
  const disclaimer = tableRows(read('.agents/workspaces/property-content/CONTEXT.md'))
    .find((cells) => /Search Console analysis/.test(cells[0]));
  assert.ok(disclaimer);
  assert.match(disclaimer[1], /`\.agents\/workspaces\/seo-content-intelligence\/CONTEXT\.md`/);
  assert.match(disclaimer[1], /never evidence of a property fact/);
  assert.match(
    read('.agents/workspaces/property-content/stages/03_fact_correction/CONTEXT.md'),
    /not an inference, a search result, an SEO recommendation, or prose that merely disagrees/,
  );
});

test('technical SEO implementation stays with site engineering', () => {
  const engineeringRow = tableRows(read(workspacePath))
    .find((cells) => /^Route, component, template, title\/meta implementation, canonical or redirect implementation$/.test(cells[0]));

  assert.ok(engineeringRow, 'the workspace does not name the site-engineering owner');
  assert.equal(engineeringRow[1], '`.agents/workspaces/site-engineering/CONTEXT.md`');

  const disclaimer = tableRows(read('.agents/workspaces/site-engineering/CONTEXT.md'))
    .find((cells) => /Search Console analysis/.test(cells[0]));
  assert.ok(disclaimer);
  assert.match(disclaimer[1], /`\.agents\/workspaces\/seo-content-intelligence\/CONTEXT\.md`/);
  assert.match(disclaimer[1], /an SEO recommendation is not an authorization to implement it here/);
});

test('localized SEO stays with i18n', () => {
  const i18nRow = tableRows(read(workspacePath))
    .find((cells) => /^Localized SEO, hreflang, locale canonical and sitemap infrastructure, localized titles and meta$/.test(cells[0]));

  assert.ok(i18nRow, 'the workspace does not name the i18n owner');
  assert.equal(i18nRow[1], '`.agents/workspaces/i18n/CONTEXT.md`');
  assert.ok(exists('.agents/workspaces/i18n/CONTEXT.md'));
});

test('no redirect and no new URL is authorized automatically', () => {
  const workspace = read(workspacePath);

  assert.match(
    workspace,
    /No automatic redirect\. A 301 requires Search Console evidence, indexation and canonical evidence where relevant, backlink evidence where relevant, a preservation analysis, and a statement of what content would be lost or retained\./,
  );
  assert.match(
    workspace,
    /No automatic new URL\. A new article or page URL requires evidence that existing content does not already satisfy the intent, that overlap has been reviewed, and that the angle is materially distinct\./,
  );

  assert.match(read(analysisStagePath), /A redirect is never concluded without explicit evidence\./);
  assert.match(read(analysisStagePath), /Imperfect wording is not a reason for a new URL\./);
  assert.match(read(recommendationStagePath), /a new URL without reviewed overlap, a redirect without preservation analysis/);
});

test('length is not a diagnosis and keyword volume needs a named source', () => {
  const workspace = read(workspacePath);

  assert.match(
    workspace,
    /No thin-content claim from length alone\. A short page is not thin\. Judge intent, query coverage, entities, headings, uniqueness, internal links and evidence together\./,
  );
  assert.match(workspace, /No keyword-volume claim without an actual approved data source behind it\./);
  assert.match(workspace, /No generic SEO checklist as evidence\./);
  assert.match(
    workspace,
    /Preserve current success\. An established ranking page is not substantially rewritten because a different theoretical structure looks cleaner\./,
  );

  const analysis = read(analysisStagePath);
  assert.match(analysis, /Low clicks alone do not prove a page needs rewriting\./);
  assert.match(analysis, /High impressions alone do not prove a new article is needed\./);
  assert.match(analysis, /Content length is not a diagnosis\./);
  assert.match(analysis, /no keyword-volume claim appears without a named data source/);
  assert.match(analysis, /a request to assert search volume without a source/);
});

test('multiple ranking URLs are an observation, never automatic cannibalization', () => {
  const workspace = read(workspacePath);

  assert.match(workspace, /Multiple ranking URLs are an observation, not a diagnosis\./);
  for (const category of [
    'same intent or duplicate',
    'partially overlapping',
    'supporting article',
    'pillar and support',
    'same geography but different intent',
    'historical versus practical',
    'property versus destination content',
  ]) assert.ok(workspace.includes(category), `the workspace cannot classify overlap as: ${category}`);
  assert.match(
    workspace,
    /Overlap alone never means delete, merge, redirect, rewrite or noindex, and it blocks a new article only where the repository's own overlap rules support that conclusion\./,
  );

  assert.match(
    read(analysisStagePath),
    /Treat multiple ranking URLs as an observation\. Record the observed ranking routes; do not label it cannibalization, and do not treat topical similarity alone as Search Console evidence of anything\./,
  );

  // The contract matches the analyser the repository already ships, rather than restating it.
  const analyser = read('scripts/content-intelligence/gsc-analysis.mjs');
  assert.match(analyser, /MULTIPLE_RANKING_URLS/);
  assert.match(analyser, /NO_MULTI_URL_EVIDENCE/);
  assert.match(analyser, /Topical similarity only; this is not Search Console evidence of cannibalization\./);
});

test('historical SEO reports are evidence inputs, not current performance truth', () => {
  const workspace = read(workspacePath);

  assert.match(
    workspace,
    /A historical or third-party SEO report is an evidence input to be reassessed, never current truth\./,
  );
  assert.match(
    workspace,
    /A redirecting legacy URL never becomes the recommended page because an old report names it, and a draft article never becomes a production target\./,
  );

  const analysis = read(analysisStagePath);
  const reassessRow = inputRows(analysis, 'L4').find((cells) => /historical SEO report being reassessed/.test(cells[1]));
  assert.ok(reassessRow, 'the analysis stage cannot reassess an older report');
  assert.equal(backtickRef(reassessRow[1]), 'docs/seo/elounda-pillar-plan.md');
  assert.ok(exists('docs/seo/elounda-pillar-plan.md'));
  assert.match(analysis, /classify it as still supported, no longer supported, never evidenced, or untestable with the evidence at hand/);
  assert.match(read(recommendationStagePath), /Withdraw stale recommendations explicitly\./);

  // The existing plan already defers exactly the decisions this workspace refuses to automate.
  const plan = read('docs/seo/elounda-pillar-plan.md');
  for (const deferred of ['No new Elounda travel-guide URL', 'No redirects', 'No canonical changes', 'No article consolidation']) {
    assert.ok(plan.includes(deferred), `the historical plan no longer defers: ${deferred}`);
  }
});

test('merge, deploy, publication and force push stay prohibited across the workspace', () => {
  assert.match(read(workspacePath), /No merge, deploy, publication, push or force push is authorized by completing a stage\./);
  for (const stagePath of stagePaths) {
    assert.match(read(stagePath), /any requested merge, deploy, publication, push or force push/);
  }
});

test('credentials and private evidence never enter tracked context or reports', () => {
  const workspace = read(workspacePath);

  assert.match(
    workspace,
    /Search Console credentials, tokens and account identifiers are operational inputs\. They never enter a Markdown context file, a report, a commit or a pull request\./,
  );
  assert.match(workspace, /are private local evidence\. Do not paste them into tracked documentation\./);
  assert.match(read(evidenceStagePath), /Confirm no credential, token or account identifier appears in any output, report or file this stage produced\./);

  // The generated evidence locations the contract points at are ignored by Git.
  const ignore = read('.gitignore');
  for (const ignored of [
    'data/content-intelligence/search-console/raw/*',
    'data/content-intelligence/search-console/processed/*',
    'data/content-intelligence/search-console/analysis.json',
    'data/content-intelligence/search-console/analysis.md',
  ]) assert.ok(ignore.includes(ignored), `generated SEO evidence is not private: ${ignored}`);
});

test('the workspace consumes the existing production route inventory instead of a second SEO truth', async () => {
  const workspace = read(workspacePath);
  const routeRow = tableRows(workspace).find((cells) => /^Which URLs are production, draft, redirecting or non-production$/.test(cells[0]));

  assert.ok(routeRow, 'the workspace declares no route authority');
  assert.match(routeRow[2], /`scripts\/content-intelligence\/inventory\.mjs`/);
  assert.match(routeRow[2], /`public\/_redirects`/);

  const inventory = await productionInventory();
  const published = new Map(inventory.sitePages.filter((page) => page.published).map((page) => [page.route, page]));

  // Live production URL and canonical route for the proof subject.
  assert.ok(published.has(proofGuideRoute), `${proofGuideRoute} is not a production route`);
  assert.equal(published.get(proofGuideRoute).type, 'destination-guide');
  assert.equal(published.get(proofGuideRoute).seoEligible, true);

  // A second production page covering the same geography with a different intent.
  assert.ok(published.has(proofArticleRoute), `${proofArticleRoute} is not a production route`);
  assert.equal(published.get(proofArticleRoute).type, 'blog');

  // Draft content is not a production target.
  assert.equal(published.has(proofDraftRoute), false, 'a draft guide style became a production route');
  const draft = inventory.sitePages.find((page) => page.route === proofDraftRoute);
  assert.ok(draft, `${proofDraftRoute} is missing from the inventory`);
  assert.equal(draft.draft, true);
  assert.equal(draft.seoEligible, false);

  // A redirecting legacy URL resolves to its production target and is not itself a page.
  const redirect = inventory.redirects.find((item) => item.from === `${proofLegacyUrl}/` || item.from === proofLegacyUrl);
  assert.ok(redirect, `${proofLegacyUrl} is not in the redirect map`);
  assert.equal(redirect.status, 301);
  assert.ok(published.has(redirect.to), `${redirect.to} is not a production route`);
  assert.equal(published.has(redirect.from), false, 'a redirecting legacy URL is also a production route');

  assert.match(
    read(analysisStagePath),
    /Classify each as live production URL, canonical URL, redirecting legacy URL, non-production URL, draft content or alternate locale URL/,
  );
  assert.match(read(analysisStagePath), /Let the analyser decide the primary ranking page for a query\. Do not hand-pick one/);
});

test('the repository control plane still passes the ICM audit with the SEO workspace active', () => {
  const result = spawnSync(process.execPath, [path.join(rootDir, 'scripts', 'context', 'validate-icm.mjs'), '--root', rootDir], {
    encoding: 'utf8',
    cwd: rootDir,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /ICM context audit passed/);
});
