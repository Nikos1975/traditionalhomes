import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { validateVisualPlan } from "../.agents/skills/traditional-homes-article-visual-plan/scripts/validate-visual-plan.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const commit = "7eb305538dc540ae53dfea13d866177034fff0ea";

function plan({
  status = "draft",
  decision = "visuals-proposed",
  textOnlyReason = "Not applicable",
  sourceClass = "owned",
  visualType = "photograph",
  rightsStatus = "approved",
  documentaryStatus = "documentary",
  approvalState = "proposed",
  blockers = "None",
  caption = "Spinalonga seen from the Elounda coast.",
  proposed = 1,
  approved = 0,
  blocked = 0,
  generationAuthorized = "no",
  includeVisual = true,
} = {}) {
  const visual = includeVisual
    ? `
### Visual 1: Spinalonga from the coast

| Field | Value |
| --- | --- |
| Visual ID | VIS-01 |
| Placement anchor | ## The island and the bay |
| Information purpose | Shows the island's position relative to the Elounda coast. |
| Visual type | ${visualType} |
| Source class | ${sourceClass} |
| Source path or URL | src/assets/blog-source/spinalonga/hero.jpg |
| Evidence or claim source | docs/research/blog/spinalonga-multiple-lives/claim-verification-register.md |
| Rights status | ${rightsStatus} |
| Owner or licensor | Anemos EPE |
| Permission record | docs/research/blog/spinalonga-multiple-lives/image-rights-register.md |
| Attribution | Not required |
| Modification and crop permission | Crop allowed after focal-point review |
| Documentary status | ${documentaryStatus} |
| Destination role | inline |
| Proposed output path | public/images/blog/spinalonga/hero-1600.webp |
| Processing profile | blog-hero |
| Crop and focal point | Preserve the full island silhouette and coastline relationship |
| Alt text draft | Spinalonga island seen across the water from the Elounda coast |
| Caption draft | ${caption} |
| Approval state | ${approvalState} |
| Blockers | ${blockers} |
`
    : "";

  return `# Article Visual Plan

## Plan Metadata

| Field | Value |
| --- | --- |
| Article slug | spinalonga |
| Article path | src/content/blog/spinalonga.md |
| Research folder | docs/research/blog/spinalonga-multiple-lives/ |
| Plan status | ${status} |
| Plan decision | ${decision} |
| Prepared from commit | ${commit} |
| Prepared date | 2026-08-16 |
| Text-only reason | ${textOnlyReason} |

## Visual Strategy

Use only visuals that clarify geography or documented material.

## Rights and Evidence Preconditions

Use the claim and image-rights registers in the research packet.

## Proposed Visuals
${visual}
## Exclusions

Exclude decorative resort imagery and unsupported historical reconstruction.

## Approval Summary

| Field | Value |
| --- | --- |
| Proposed visuals | ${proposed} |
| Approved visuals | ${approved} |
| Blocked visuals | ${blocked} |
| Rights review complete | no |
| Evidence review complete | no |
| Crop review complete | no |
| Article edits authorized | no |
| Image generation authorized | ${generationAuthorized} |
| Image processing authorized | no |
| Publication authorized | no |

## Next Allowed Action

Request plan approval before any downstream image work.
`;
}

test("the skill has portable frontmatter and a planning-only boundary", async () => {
  const skill = await readFile(
    path.join(rootDir, ".agents/skills/traditional-homes-article-visual-plan/SKILL.md"),
    "utf8",
  );
  const frontmatter = skill.split("---")[1];
  const keys = [...frontmatter.matchAll(/^([a-z][a-z-]*):/gm)].map((match) => match[1]);
  assert.deepEqual(keys, ["name", "description"]);
  assert.match(skill, /Produce or validate a visual-plan\.md only/);
  assert.match(skill, /must not:\n\n- generate or edit an image/);
  assert.match(skill, /Plan approval does not authorize generation, processing, insertion, publication/);
});

test("validates a representative proposed documentary photograph plan", () => {
  const result = validateVisualPlan(plan(), { expectedSlug: "spinalonga" });
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.deepEqual(result.summary, {
    slug: "spinalonga",
    planStatus: "draft",
    planDecision: "visuals-proposed",
    proposed: 1,
    approved: 0,
    blocked: 0,
  });
});

test("accepts an explicit text-only decision without inventing a visual quota", () => {
  const result = validateVisualPlan(
    plan({
      decision: "text-only",
      textOnlyReason: "The article is short and no available visual adds verified information.",
      includeVisual: false,
      proposed: 0,
    }),
  );
  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.summary.proposed, 0);
});

test("rejects generated imagery labelled as documentary evidence", () => {
  const result = validateVisualPlan(
    plan({
      sourceClass: "generated",
      visualType: "generated-illustration",
      documentaryStatus: "documentary",
      caption: "Historic Spinalonga.",
    }),
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /generated sources cannot be labelled documentary|must never be labelled documentary/);
  assert.match(result.errors.join("\n"), /explicit caption disclosure/);
});

test("rejects an approved plan with unresolved rights or blockers", () => {
  const result = validateVisualPlan(
    plan({
      status: "approved",
      rightsStatus: "blocked",
      approvalState: "blocked",
      blockers: "Licence terms have not been verified.",
      blocked: 1,
    }),
  );
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /approved plan requires Approval state "approved"/);
  assert.match(result.errors.join("\n"), /approved plan cannot retain blocked rights/);
  assert.match(result.errors.join("\n"), /approved plan cannot retain blockers/);
});

test("the plan cannot authorize generation or other downstream actions", () => {
  const result = validateVisualPlan(plan({ generationAuthorized: "yes" }));
  assert.equal(result.ok, false);
  assert.match(result.errors.join("\n"), /"Image generation authorized" must remain "no"/);
});
