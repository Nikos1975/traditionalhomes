import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(rootDir, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(rootDir, relativePath));

const workspaceDir = '.agents/workspaces/operations-deployment';
const workspacePath = `${workspaceDir}/CONTEXT.md`;
const inspectPath = `${workspaceDir}/stages/01_inspect/CONTEXT.md`;
const preparePath = `${workspaceDir}/stages/02_prepare/CONTEXT.md`;
const applyPath = `${workspaceDir}/stages/03_apply/CONTEXT.md`;
const verifyPath = `${workspaceDir}/stages/04_verify/CONTEXT.md`;
const stagePaths = [inspectPath, preparePath, applyPath, verifyPath];
const operationsRoute = '`.agents/workspaces/operations-deployment/CONTEXT.md`';
const policyPath = 'docs/operations/deployment-operations.md';

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

function backtickRefs(cell) {
  return [...cell.matchAll(/`([^`]+)`/g)].map((match) => match[1]);
}

// 1. The root control plane routes operational and Cloudflare work to this workspace.
test('the root router sends Cloudflare inspection, deployment preparation and deployment execution here', () => {
  const rows = tableRows(read('CONTEXT.md'));

  const inspectRow = rows.find((cells) => /^Inspect Cloudflare configuration or deployment state/.test(cells[0]));
  assert.ok(inspectRow, 'root CONTEXT.md has no operational inspection route');
  assert.equal(inspectRow[1], operationsRoute);
  for (const surface of [/prepare a deployment or Cloudflare configuration change/, /diagnose a Cloudflare Pages operational issue/]) {
    assert.match(inspectRow[0], surface);
  }

  const applyRow = rows.find((cells) => /^Deploy an approved revision/.test(cells[0]));
  assert.ok(applyRow, 'root CONTEXT.md has no deployment execution route');
  assert.equal(applyRow[1], operationsRoute);
  for (const surface of [/update approved Cloudflare production configuration/, /verify a completed production deployment/]) {
    assert.match(applyRow[0], surface);
  }

  assert.match(
    read('CONTEXT.md'),
    /Deployment and Cloudflare operations have one owner\. Inspecting, preparing, applying and verifying are separate permissions there, and no production mutation is ever inferred from a review, a prepared change, a passing test, a successful build or a merged commit\./,
  );

  const agents = read('AGENTS.md');
  assert.ok(agents.includes(operationsRoute), 'AGENTS.md does not name the operations workspace');
  assert.match(agents, /Deployment and Cloudflare mutations require an exact explicit authorization and are never inferred\./);
});

// 2. A source-code cause is never absorbed into operations.
test('application-source defects stay with site engineering', () => {
  const owner = tableRows(read(workspacePath)).find((cells) =>
    /^Astro, component, layout, route and client-side defects/.test(cells[0]),
  );
  assert.ok(owner, 'the operations workspace does not disclaim source-code engineering');
  assert.match(owner[1], /`\.agents\/workspaces\/site-engineering\/CONTEXT\.md`/);
  assert.match(owner[0], /source-code engineering under `functions\/`/);

  assert.match(
    read(workspacePath),
    /A deployment problem whose cause is source code routes from Stage 01 to `\.agents\/workspaces\/site-engineering\/CONTEXT\.md`, and a change that workspace produces is deployable only after a separate explicit deployment authorization\./,
  );
  assert.match(read(inspectPath), /Route a source-code cause to `\.agents\/workspaces\/site-engineering\/CONTEXT\.md`/);
  assert.match(read(inspectPath), /Classify the cause: operational configuration, deployment state, or application source code\./);

  // Site engineering keeps its own root route.
  const debugRow = tableRows(read('CONTEXT.md')).find((cells) => /^Build, runtime, browser, type or test-regression debugging/.test(cells[0]));
  assert.ok(debugRow);
  assert.equal(debugRow[1], '`.agents/workspaces/site-engineering/CONTEXT.md`');
});

// 3. The workspace routes exactly one bounded stage at a time.
test('the workspace routes one stage at a time and every routed stage exists', () => {
  const workspace = read(workspacePath);

  assert.match(workspace, /Route one stage at a time/);
  assert.match(workspace, /One request, one exact operation, one environment, one stage per run\./);
  assert.match(workspace, /INSPECT is not PREPARE is not APPLY is not VERIFY\./);

  const routed = tableRows(workspace)
    .flatMap((cells) => backtickRefs(cells[cells.length - 1]))
    .filter((ref) => ref.startsWith('stages/'));

  assert.deepEqual(routed, [
    'stages/01_inspect/CONTEXT.md',
    'stages/02_prepare/CONTEXT.md',
    'stages/03_apply/CONTEXT.md',
    'stages/04_verify/CONTEXT.md',
  ]);

  for (const ref of routed) assert.ok(exists(`${workspaceDir}/${ref}`), `routed stage is missing: ${ref}`);

  const stageDirs = fs.readdirSync(path.join(rootDir, workspaceDir, 'stages')).sort();
  assert.deepEqual(stageDirs, ['01_inspect', '02_prepare', '03_apply', '04_verify']);
});

// 4. Inspection is read-only.
test('the inspect stage is read-only and cannot touch production', () => {
  const inspect = read(inspectPath);

  assert.match(inspect, /This stage is READ ONLY\./);
  assert.match(
    inspect,
    /It may not edit production, deploy, change Cloudflare, change DNS, change environment variables, purge cache, restart a service, modify a route or publish anything\./,
  );
  assert.match(inspect, /Do not reproduce it by triggering a production action\./);
  assert.match(inspect, /A diagnosis is not a change, and it is not authorization for one\./);
  assert.match(inspect, /Confirm nothing was written/);
  assert.match(inspect, /the exact next owner or stage/);
});

// 5. Preparation is local only and never becomes deployment permission.
test('the prepare stage makes local changes only and is never deployment authorization', () => {
  const prepare = read(preparePath);

  assert.match(prepare, /This stage makes LOCAL REPOSITORY CHANGES ONLY\./);
  assert.match(
    prepare,
    /No Cloudflare API mutation, no production deployment, no DNS mutation, no environment-variable mutation, and no secret value committed\./,
  );
  assert.match(prepare, /A locally prepared change is NEVER authorization to deploy\./);
  assert.match(prepare, /Write the exact command that would later apply the change, and hold it unexecuted for approval\./);
  assert.match(prepare, /an explicit statement that nothing was applied, deployed or pushed/);
  assert.match(prepare, /an attempt to treat a prepared change or a green build as deployment permission/);
});

// 6. Application requires an exact explicit production authorization.
test('the apply stage requires explicit authorization for one exact production mutation', () => {
  const apply = read(applyPath);

  assert.match(apply, /NO PRODUCTION MUTATION BY DEFAULT\./);
  assert.match(
    apply,
    /"fix this", "prepare this", "check this", "commit this" and "tests passed" DO NOT authorize a deployment or a Cloudflare change\./,
  );
  assert.match(apply, /A previous build, test, commit or merge is never carried forward as permission\./);
  assert.match(apply, /Require explicit user intent for the exact mutation, in the user's own words\./);
  assert.match(apply, /Require the exact target and environment\./);
  assert.match(apply, /Require the exact approved revision or the exact approved configuration value set\./);
  assert.match(apply, /Re-check repository and configuration state immediately before acting\./);
  assert.match(apply, /Never broaden one approval into a second Cloudflare change, and never combine unrelated production operations in one run\./);
  assert.match(apply, /Do not repeat the operation because the result was unclear\./);
  assert.match(apply, /Record the exact observable result/);
});

// 7. Verification never repairs.
test('the verify stage cannot silently repair, redeploy or reconfigure', () => {
  const verify = read(verifyPath);

  assert.match(verify, /Verification must not silently repair a failure\./);
  assert.match(verify, /Do not repair, redeploy, roll back or reconfigure\./);
  assert.match(verify, /require fresh explicit authorization before any further application\./);
  assert.match(verify, /Confirm the verification itself changed nothing/);
  assert.match(verify, /Confirm a local build or a passing test was never reported as production evidence\./);
  assert.match(verify, /no aggregate claim that hides a failing check/);
});

// 8. DNS, security and environment mutations need an exact explicit scope.
test('DNS, security, environment and lifecycle mutations are never implicit', () => {
  const neverImplicit = [
    'a DNS change',
    'a nameserver change',
    'Pages project deletion',
    'domain removal',
    'environment-variable deletion',
    'secret disclosure',
    'a cache purge',
    'a WAF or security-rule change',
    'a Turnstile change',
    'a deployment',
    'a rollback',
    'a production restart or reconfiguration',
  ];

  const workspace = read(workspacePath);
  assert.match(workspace, /These are never implicit and each requires an exact explicit request:/);
  for (const item of neverImplicit) {
    assert.ok(workspace.includes(item), `the workspace does not disclaim: ${item}`);
  }

  const policy = read(policyPath);
  assert.match(policy, /Each of the following requires an exact explicit request and is never performed as a side effect of another task:/);

  assert.match(
    read(preparePath),
    /a request to change DNS, nameservers, WAF or security rules, Turnstile, environment variables or the Pages project itself/,
  );
  assert.match(
    read(applyPath),
    /Confirm no DNS record, nameserver, Pages project, domain binding, WAF or security rule, Turnstile setting or unrelated environment variable was touched\./,
  );
});

// 9. Secrets cannot enter tracked context.
test('secret values cannot enter the tracked control plane', () => {
  const tracked = [workspacePath, ...stagePaths, policyPath, 'CONTEXT.md', 'AGENTS.md'];
  const valuePattern = /(?:ACCESS_TOKEN|API_TOKEN|_SECRET|SECRET_KEY|PASSWORD|Bearer)\s*[:=]\s*["']?[A-Za-z0-9_\-.]{8,}/;

  for (const relativePath of tracked) {
    assert.doesNotMatch(read(relativePath), valuePattern, `${relativePath} appears to carry a credential value`);
  }

  assert.match(
    read(workspacePath),
    /Variable names may be documented; values never enter a context file, documentation, a test, a fixture, a commit, a report or captured command output\. Report names only\./,
  );
  assert.match(read(policyPath), /values are never read back, echoed, logged, quoted or committed\./);
  for (const stagePath of stagePaths) {
    assert.match(read(stagePath), /names only, with no values|Report names only|no secret value/i, `${stagePath} has no secret rule`);
  }
});

// 10. Every other ICM workspace keeps its ownership.
test('SEO, i18n, property, editorial and social ownership stay intact', () => {
  const rows = tableRows(read(workspacePath));
  const owner = (pattern) => {
    const row = rows.find((cells) => pattern.test(cells[0]));
    assert.ok(row, `the operations workspace does not name an owner for ${pattern}`);
    return row[row.length - 1];
  };

  assert.match(owner(/^Search Console evidence, SEO analysis and SEO recommendation$/), /`\.agents\/workspaces\/seo-content-intelligence\/CONTEXT\.md`/);
  assert.match(owner(/^Localized routes, hreflang/), /`\.agents\/workspaces\/i18n\/CONTEXT\.md`/);
  assert.match(owner(/^Property facts and property-page content$/), /`\.agents\/workspaces\/property-content\/CONTEXT\.md`/);
  assert.match(owner(/^Article research, drafting, revision, audit and publication$/), /`BLOG_ORCHESTRATOR\.md`/);
  assert.match(owner(/^Article research, drafting, revision, audit and publication$/), /`\.agents\/workspaces\/editorial-research\/CONTEXT\.md`/);
  assert.match(owner(/^Social publication preparation, approval, live publication and reconciliation$/), /`\.agents\/workspaces\/social-publishing\/CONTEXT\.md`/);

  assert.match(read(workspacePath), /Operating a deployment is allowed\. Becoming the authority on what is deployed is not\./);

  // The workspaces that used to disclaim deployment now name this owner instead of stopping.
  for (const otherWorkspace of [
    '.agents/workspaces/site-engineering/CONTEXT.md',
    '.agents/workspaces/seo-content-intelligence/CONTEXT.md',
    '.agents/workspaces/seo-content-intelligence/stages/03_recommendation/CONTEXT.md',
    '.agents/workspaces/social-publishing/CONTEXT.md',
  ]) {
    const text = read(otherWorkspace);
    const row = tableRows(text).find((cells) => /^Deployment, Cloudflare/.test(cells[0]));
    assert.ok(row, `${otherWorkspace} does not route deployment to its owner`);
    assert.match(row[1], /`\.agents\/workspaces\/operations-deployment\/CONTEXT\.md`/);
    assert.doesNotMatch(text, /no ICM workspace yet/, `${otherWorkspace} still claims deployment has no ICM owner`);
  }
});

// 11. Declared Layer 3 references resolve.
test('every declared Layer 3 reference resolves and every stage names the operations policy', () => {
  for (const stagePath of stagePaths) {
    const rows = inputRows(read(stagePath), 'L3');
    assert.ok(rows.length >= 2, `${stagePath} declares too few Layer 3 references`);

    const refs = rows.flatMap((cells) => backtickRefs(cells[1]));
    assert.ok(refs.includes(policyPath), `${stagePath} does not declare ${policyPath}`);
    for (const ref of refs) assert.ok(exists(ref), `${stagePath} declares a dead Layer 3 reference: ${ref}`);
  }

  assert.ok(exists(policyPath), 'the operations policy document is missing');
  assert.match(read(policyPath), /The ICM owner of this material is `\.agents\/workspaces\/operations-deployment\/CONTEXT\.md`\./);
});

// 12. Layer 4 stays narrow.
test('Layer 4 material stays narrow and no stage loads a whole tree', () => {
  for (const stagePath of stagePaths) {
    const rows = inputRows(read(stagePath), 'L4');
    assert.ok(rows.length >= 2 && rows.length <= 5, `${stagePath} declares ${rows.length} Layer 4 entries`);

    for (const cells of rows) {
      assert.match(cells[1], /\bexact\b|\bone\b/, `${stagePath} declares an unbounded Layer 4 entry: ${cells[1]}`);
      for (const ref of backtickRefs(cells[1])) {
        assert.ok(!ref.endsWith('/'), `${stagePath} declares a whole directory as Layer 4: ${ref}`);
        assert.ok(exists(ref), `${stagePath} declares a dead Layer 4 reference: ${ref}`);
      }
    }

    assert.match(read(stagePath), /Do not (?:load|sweep)/, `${stagePath} does not bound its working set`);
  }

  assert.match(
    read(workspacePath),
    /Never load all of `src\/`, all of `tests\/`, all of `docs\/`, every Cloudflare surface or the whole deployment history\./,
  );
});

// 13. Merge, push and force push are never implicit.
test('no stage authorizes a merge, a deploy, a push or a force push', () => {
  assert.match(
    read(workspacePath),
    /No merge, deploy, push, force push or destructive cleanup is authorized by completing a stage, and completing one stage never authorizes the next\./,
  );

  for (const stagePath of stagePaths) {
    assert.match(read(stagePath), /any requested merge, deploy, push or force push/, `${stagePath} does not stop on a merge or push request`);
  }

  assert.match(
    read(workspacePath),
    /Do not modify `src\/`, `functions\/`, `public\/`, `scripts\/` or `data\/` from this workspace to prove a control-plane point\./,
  );
});

// 14. The control plane itself authorizes no production mutation.
test('the control plane carries no executable deployment path of its own', () => {
  const scripts = JSON.parse(read('package.json')).scripts;
  const deployScripts = Object.keys(scripts).filter((name) => /deploy|wrangler|publish:site/i.test(name));
  assert.deepEqual(deployScripts, [], `package.json exposes an unexpected deployment script: ${deployScripts.join(', ')}`);

  for (const configFile of ['wrangler.toml', 'wrangler.json', 'wrangler.jsonc']) {
    assert.ok(!exists(configFile), `unexpected Cloudflare deployment configuration: ${configFile}`);
  }

  for (const relativePath of [workspacePath, ...stagePaths, policyPath, 'CONTEXT.md', 'AGENTS.md']) {
    assert.doesNotMatch(
      read(relativePath),
      /npm run deploy|wrangler (?:pages )?deploy|npx wrangler/,
      `${relativePath} carries an executable deployment command`,
    );
  }

  assert.match(
    read(workspacePath),
    /Do not invent a Cloudflare capability, a deployment command, an environment variable or a configuration file this repository does not have\./,
  );
});

// 15. The audit still passes with the operations workspace active.
test('the repository control plane still passes the ICM audit with operations and deployment active', () => {
  const result = spawnSync(process.execPath, [path.join(rootDir, 'scripts', 'context', 'validate-icm.mjs'), '--root', rootDir], {
    encoding: 'utf8',
    cwd: rootDir,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);
  assert.match(result.stdout, /ICM context audit passed/);
});
