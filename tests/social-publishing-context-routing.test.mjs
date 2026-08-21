import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

import { assertNoSensitiveFields } from '../scripts/social/draft-schema.mjs';
import { createFixtureDrafts } from '../scripts/social/generators/fixture.mjs';
import { assertLedger, createPreparedLedger } from '../scripts/social/publication-ledger.mjs';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

const workspaceDir = '.agents/workspaces/social-publishing';
const workspacePath = `${workspaceDir}/CONTEXT.md`;
const preparePath = `${workspaceDir}/stages/01_prepare/CONTEXT.md`;
const approvalPath = `${workspaceDir}/stages/02_approval/CONTEXT.md`;
const livePublishPath = `${workspaceDir}/stages/03_live_publish/CONTEXT.md`;
const reconcilePath = `${workspaceDir}/stages/04_reconcile/CONTEXT.md`;
const stagePaths = [preparePath, approvalPath, livePublishPath, reconcilePath];
const socialRoute = '`.agents/workspaces/social-publishing/CONTEXT.md`';
const policyPath = 'docs/operations/social-publication.md';

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

function rootSocialRows() {
  return tableRows(read('CONTEXT.md')).filter((cells) => cells[1] === socialRoute);
}

const article = {
  slug: 'published-article',
  title: 'Published Article',
  description: 'A clear article description.',
  canonicalUrl: 'https://traditional-homes.gr/en/blog/published-article/',
  heroImageUrl: 'https://traditional-homes.gr/images/blog/hero.webp',
  heroImageAlt: 'A quiet view',
  excerpt: 'A calm first paragraph.',
  publicationDate: '2026-07-27',
};

function ledgerWithState(state) {
  const ledger = createPreparedLedger({
    article,
    fingerprint: 'a'.repeat(64),
    drafts: createFixtureDrafts(article),
  });
  ledger.platforms.facebook.state = state;
  return ledger;
}

test('the root router sends social preparation, drafts and publication status to the social workspace', () => {
  const row = tableRows(read('CONTEXT.md')).find((cells) => /^Social publication preparation/.test(cells[0]));

  assert.ok(row, 'root CONTEXT.md has no social preparation route');
  assert.equal(row[1], socialRoute);
  for (const surface of [/platform drafts/, /social publication status/, /already-published article/]) {
    assert.match(row[0], surface);
  }
});

test('the root router sends explicit approval, live publication and reconciliation to the social workspace', () => {
  const row = tableRows(read('CONTEXT.md')).find((cells) => /^Explicit approval, live publication/.test(cells[0]));

  assert.ok(row, 'root CONTEXT.md has no social publication route');
  assert.equal(row[1], socialRoute);
  assert.match(row[0], /reconciliation of an unknown social publication outcome/);

  assert.match(
    read('CONTEXT.md'),
    /Social publication has one owner\. Preparation, approval, live publication and reconciliation are separate permissions there, and completing one never authorizes the next\./,
  );
  assert.match(read('AGENTS.md'), /`\.agents\/workspaces\/social-publishing\/CONTEXT\.md`/);
});

test('the root router does not send article drafting, revision or research to the social workspace', () => {
  const editorial = tableRows(read('CONTEXT.md')).find((cells) => /Blog post, area\/village guide/.test(cells[0]));

  assert.ok(editorial, 'root CONTEXT.md lost its editorial route');
  assert.equal(editorial[1], '`BLOG_ORCHESTRATOR.md`');

  for (const cells of rootSocialRows()) {
    assert.doesNotMatch(cells[0], /\bdraft(?:ing)? an article\b|\brevision\b|\bresearch\b|\baudit\b/i);
  }
});

test('the workspace routes exactly one bounded stage at a time', () => {
  const workspace = read(workspacePath);

  assert.match(workspace, /Route one stage at a time/);
  assert.match(workspace, /One article, one ledger, one platform, one stage per run\./);
  assert.match(workspace, /completing one stage never authorizes the next/);

  const stageRefs = [...new Set([...workspace.matchAll(/`stages\/([^/`]+)\/CONTEXT\.md`/g)].map((match) => match[1]))];
  assert.deepEqual(stageRefs.sort(), ['01_prepare', '02_approval', '03_live_publish', '04_reconcile']);
  assert.deepEqual(
    fs.readdirSync(path.join(rootDir, workspaceDir, 'stages')).sort(),
    ['01_prepare', '02_approval', '03_live_publish', '04_reconcile'],
  );

  assert.match(workspace, /Four stages, because each one is a different permission class\./);
  assert.match(workspace, /Reading status is the read-only entry to Stage 01, not a fifth stage/);
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
      assert.ok(fs.existsSync(path.join(rootDir, ref)), `${stagePath} Layer 3 reference does not exist: ${ref}`);
    }

    assert.ok(
      layer3.some((row) => backtickRef(row[1]) === policyPath),
      `${stagePath} does not declare the social publication policy as Layer 3`,
    );
  }
});

test('every stage keeps Layer 4 exact and narrow instead of loading the whole domain', () => {
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

    assert.match(stage, /Do not load every ledger/);
    assert.doesNotMatch(stage, /`scripts\/social\/\*\*`|`tests\/\*\*`|`docs\/\*\*`|`data\/social-publications\/\*\*`/);
  }

  assert.match(read(preparePath), /Do not load every ledger under `data\/social-publications\/`, every article under `src\/content\/blog\/`, all of `scripts\/social\/`, all of `tests\/` or all of `docs\/`\./);
  assert.match(read(workspacePath), /Never load every ledger, every article, all of `scripts\/social\/`, all of `tests\/` or all of `docs\/`\./);
});

test('preparation neither approves nor publishes', () => {
  const stage = read(preparePath);

  assert.match(stage, /This stage does not approve anything, does not reach the network, and does not publish\./);
  assert.match(stage, /Stop\. Approval belongs to Stage 02, and nothing in this stage authorizes it\./);
  assert.match(stage, /no approval, no publication, no recommendation to publish/);
  assert.match(stage, /A request to show status runs the status command, reports it and stops/);
  assert.match(read(workspacePath), /Preparation is not approval\./);
});

test('approval is explicit, platform-specific and reaches no network', () => {
  const stage = read(approvalPath);

  assert.match(stage, /Approval is a local decision\. It reaches no network, sends nothing to Meta, and publishes nothing\./);
  assert.match(stage, /Approval is never inferred from an earlier message, from a prepared state, or from the fact that another platform was approved\./);
  assert.match(stage, /Approving both Facebook and Instagram requires the user to ask for both, and it remains two explicit approvals of two separate records\./);
  assert.match(stage, /Stop\. Publication belongs to Stage 03, and an approval never authorizes it\./);
  assert.match(read(workspacePath), /Approval is not publication\./);
});

test('an approval is bound to the current article fingerprint and goes stale when content changes', () => {
  assert.match(read(approvalPath), /its fingerprint equals the current article fingerprint/);
  assert.match(read(approvalPath), /the approval is stale by design\. Return to Stage 01, prepare again/);
  assert.match(read(approvalPath), /Never re-point an old approval at new content\./);
  assert.match(read(livePublishPath), /its fingerprint equals the current article fingerprint/);
  assert.match(
    read(workspacePath),
    /Changed article content makes an existing approval stale, and a stale record is prepared again before it can be approved again\./,
  );

  // The behavioural proof stays where it already lives.
  assert.match(
    read('tests/social-publisher.test.mjs'),
    /changed article content preserves prior approved and published platform fingerprints as stale/,
  );
});

test('live publication requires explicit publication intent and never happens by default', () => {
  const workspace = read(workspacePath);
  const stage = read(livePublishPath);

  assert.match(workspace, /NO LIVE PUBLICATION BY DEFAULT\./);
  assert.match(
    workspace,
    /A request to prepare a post, draft platform copy, show publication status, or approve a prepared draft never routes into Stage 03\./,
  );
  assert.match(stage, /NO LIVE PUBLICATION BY DEFAULT\./);
  assert.match(stage, /it runs only when the user explicitly asks for publication/);
  assert.match(stage, /An implied, inferred or batched publication request is a stop condition\./);
  assert.match(stage, /Publish one platform\. A second platform is a second explicit request\./);
});

test('the live stage names the existing publisher gates instead of restating weaker ones', () => {
  const stage = read(livePublishPath);
  const publisher = read('scripts/social/publisher.mjs');

  for (const name of [
    'SOCIAL_LIVE_PUBLISHING',
    'META_GRAPH_VERSION',
    'META_PAGE_ID',
    'META_IG_USER_ID',
    'META_PAGE_ACCESS_TOKEN',
    'META_IG_ACCESS_TOKEN',
  ]) {
    assert.ok(stage.includes(name), `the live stage does not name the ${name} gate`);
    assert.ok(publisher.includes(name), `the publisher no longer requires ${name}`);
  }

  assert.match(stage, /Let the publisher own the remote sequence, including the Instagram container, its bounded polling and its single `media_publish`\./);
  assert.match(stage, /Do not create a second container, do not extend the polling budget, and do not call publish after a container has failed\./);
  assert.match(stage, /an attempt to weaken a gate, a media rule, the polling bound or the redaction rules/);
  assert.match(read(workspacePath), /Never weaken a gate, a media check, the polling bound or the redaction rules to make a publication proceed\./);
});

test('an unknown outcome is preserved and can never be retried by republishing', () => {
  const workspace = read(workspacePath);
  const stage = read(livePublishPath);

  assert.match(workspace, /An unknown publication result is not permission to retry\./);
  assert.match(
    workspace,
    /`unknown` is not failure, is not approval, and is not permission to publish again\. It is resolved only by Stage 04, and it is never downgraded to a failure state to make a retry possible\./,
  );
  assert.match(stage, /A received HTTP rejection is a definite failure; an unprovable outcome is `unknown` and may already exist remotely\./);
  assert.match(stage, /Do not rerun the command after any outcome\./);
  assert.match(stage, /an attempt to retry after a failure or an `unknown`/);
  assert.match(read(reconcilePath), /Never downgrade `unknown` to a failure state, and never clear it, to make a retry possible\./);

  // The behavioural proofs stay where they already live.
  const liveTests = read('tests/social-live-publisher.test.mjs');
  assert.match(liveTests, /records an ambiguous Facebook POST as unknown without retrying it/);
  assert.match(liveTests, /blocks repeated live publishing after unknown or published state/);
});

test('reconciliation resolves an unknown record with evidence and never creates a publication', () => {
  const stage = read(reconcilePath);

  assert.match(stage, /It may never create a Facebook post, an Instagram container or an Instagram media publication\./);
  assert.match(stage, /Reconciliation performs reads only, and no step of this stage may create or publish anything\./);
  assert.match(stage, /Without a candidate, the ledger is returned unchanged and nothing is fetched or written\./);
  assert.match(stage, /Keep `unknown` when the evidence is absent, unverifiable or contradictory\./);
  assert.match(stage, /no publication was created by this stage/);

  assert.match(
    read('tests/social-live-publisher.test.mjs'),
    /reconciles a confirmed remote Facebook publication without creating a post/,
  );
});

test('reconciliation verifies remote identity and ownership and fails closed', () => {
  const stage = read(reconcilePath);

  assert.match(stage, /The returned ID must equal the candidate ID/);
  assert.match(stage, /a Facebook post that carries an originating Page must match the configured Page/);
  assert.match(stage, /Instagram media must carry an owner object whose numeric ID equals the configured account/);
  assert.match(stage, /A matching username is not ownership, and missing, null, scalar or non-numeric owner data fails closed\./);
  assert.match(stage, /a supplied remote ID without explicit confirmation/);

  const liveTests = read('tests/social-live-publisher.test.mjs');
  assert.match(liveTests, /rejects confirmed Instagram media from a different owner even when the username matches/);
  assert.match(liveTests, /fails closed for missing, null, scalar, or malformed Instagram owners/);
});

test('Facebook and Instagram records stay independent and a published record stays immutable', () => {
  const workspace = read(workspacePath);

  assert.match(
    workspace,
    /Facebook and Instagram records are independent\. Preparing or approving one platform never changes another platform's state\./,
  );
  assert.match(
    workspace,
    /A `published` record is terminal, and its remote publication ID, publication timestamp and recorded fingerprint are never rewritten\./,
  );
  assert.match(read(preparePath), /An approved, publishing, published, failed or unknown platform record is carried forward unchanged/);
  assert.match(read(approvalPath), /no other platform record changed, that no `published` record was touched/);
  assert.match(read(livePublishPath), /Confirm exactly one platform record changed and that the other platform is unchanged\./);

  const publisherTests = read('tests/social-publisher.test.mjs');
  assert.match(publisherTests, /a published platform is immutable without blocking another platform update/);
  assert.match(publisherTests, /prepare preserves an approved platform record while refreshing other prepared drafts/);
});

test('the contracts use the publication states the implementation actually accepts', () => {
  const contracts = [read(workspacePath), ...stagePaths.map(read), read(policyPath)].join('\n');
  const declared = new Set(
    [...contracts.matchAll(/`(prepared|approved|publishing|published|failed|unknown)`/g)].map((match) => match[1]),
  );

  assert.ok(declared.size >= 5, 'the contracts name too few publication states to describe the state machine');
  for (const state of declared) {
    assert.doesNotThrow(() => assertLedger(ledgerWithState(state)), `the implementation rejects the documented state: ${state}`);
  }
  assert.throws(() => assertLedger(ledgerWithState('reconciling')), /invalid facebook state/i);
});

test('the contracts route the commands the repository actually exposes', () => {
  const scripts = JSON.parse(read('package.json')).scripts;
  const commands = {
    'social:status': preparePath,
    'social:prepare': preparePath,
    'social:approve': approvalPath,
    'social:publish': livePublishPath,
    'social:reconcile': reconcilePath,
  };

  for (const [command, stagePath] of Object.entries(commands)) {
    assert.ok(scripts[command], `package.json no longer exposes ${command}`);
    assert.ok(read(stagePath).includes(`npm run ${command}`), `${stagePath} does not route ${command}`);
  }

  // A stage never routes a command that belongs to a higher permission class.
  assert.ok(!read(preparePath).includes('npm run social:approve'));
  assert.ok(!read(preparePath).includes('npm run social:publish'));
  assert.ok(!read(approvalPath).includes('npm run social:publish'));
  assert.ok(!read(reconcilePath).includes('npm run social:publish'));
});

test('credentials cannot enter the tracked control plane or a tracked ledger', () => {
  const tracked = [workspacePath, ...stagePaths, policyPath, 'CONTEXT.md', 'AGENTS.md'];
  const valuePattern = /(?:ACCESS_TOKEN|_SECRET|PASSWORD|Bearer)\s*[:=]\s*["']?[A-Za-z0-9_\-.]{8,}/;

  for (const relativePath of tracked) {
    const text = read(relativePath);
    assert.doesNotMatch(text, valuePattern, `${relativePath} appears to carry a credential value`);
  }

  assert.match(
    read(workspacePath),
    /They never enter a context file, a ledger, a draft, a test fixture, a report, a commit or a pull request\./,
  );
  assert.match(read(livePublishPath), /Report names only\. Never read, echo, log, quote or commit a value\./);

  const ledgerDir = path.join(rootDir, 'data', 'social-publications');
  for (const entry of fs.readdirSync(ledgerDir)) {
    if (!entry.endsWith('.json')) continue;
    const ledger = JSON.parse(fs.readFileSync(path.join(ledgerDir, entry), 'utf8'));
    assert.doesNotThrow(() => assertNoSensitiveFields(ledger), `tracked ledger carries a sensitive field: ${entry}`);
  }
});

test('article correction, property facts, SEO and localization keep their owners', () => {
  const rows = tableRows(read(workspacePath));
  const owner = (pattern) => {
    const row = rows.find((cells) => pattern.test(cells[0]));
    assert.ok(row, `the social workspace does not name an owner for ${pattern}`);
    return row[row.length - 1];
  };

  assert.match(owner(/Writing, revising, correcting or auditing the article/), /`BLOG_ORCHESTRATOR\.md`/);
  assert.match(owner(/Writing, revising, correcting or auditing the article/), /`\.agents\/workspaces\/editorial-research\/CONTEXT\.md`/);
  assert.match(owner(/^Property facts and property-page content$/), /`\.agents\/workspaces\/property-content\/CONTEXT\.md`/);
  assert.match(owner(/Search Console evidence, SEO analysis and SEO recommendation/), /`\.agents\/workspaces\/seo-content-intelligence\/CONTEXT\.md`/);
  assert.match(owner(/Localized routes, hreflang/), /`\.agents\/workspaces\/i18n\/CONTEXT\.md`/);
  assert.match(owner(/Route, component, template and site implementation/), /`\.agents\/workspaces\/site-engineering\/CONTEXT\.md`/);

  assert.match(read(workspacePath), /Consuming a published article, a fact or a media rule is allowed\. Becoming its authority is not\./);
  assert.match(read(workspacePath), /A weak social post is never repaired by editing the website article from here\./);
  assert.match(read(preparePath), /Report a weak draft; do not repair it by editing the website article\./);
  assert.match(read(preparePath), /a request to correct the article from here/);
});

test('deployment stays outside the social workspace and other workspaces route social work here', () => {
  const deployment = tableRows(read(workspacePath)).find((cells) => /^Deployment, Cloudflare account/.test(cells[0]));

  assert.ok(deployment, 'the social workspace does not disclaim deployment');
  assert.match(deployment[1], /no ICM workspace yet; stop and report/);

  for (const otherWorkspace of [
    '.agents/workspaces/site-engineering/CONTEXT.md',
    '.agents/workspaces/seo-content-intelligence/CONTEXT.md',
  ]) {
    const row = tableRows(read(otherWorkspace)).find((cells) => /Social publication preparation/.test(cells[0]));
    assert.ok(row, `${otherWorkspace} does not route social publication to its owner`);
    assert.match(row[1], /`\.agents\/workspaces\/social-publishing\/CONTEXT\.md`/);
  }
});

test('no stage authorizes a merge, a deploy, a push or a force push', () => {
  assert.match(
    read(workspacePath),
    /No merge, deploy, push, force push or destructive cleanup is authorized by completing a stage, and completing one stage never authorizes the next\./,
  );

  for (const stagePath of stagePaths) {
    assert.match(read(stagePath), /any requested merge, deploy, (?:publication, )?push or force push/);
  }

  assert.match(
    read(workspacePath),
    /Do not modify `scripts\/social\/`, `src\/`, `functions\/`, `public\/` beyond the one generated Instagram derivative/,
  );
});

test('the repository control plane still passes the ICM audit with social publishing active', () => {
  const result = spawnSync(process.execPath, [path.join(rootDir, 'scripts', 'context', 'validate-icm.mjs'), '--root', rootDir], {
    encoding: 'utf8',
    cwd: rootDir,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /ICM context audit passed/);
});
