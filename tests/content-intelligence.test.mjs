import assert from "node:assert/strict";
import test from "node:test";

import { scoreTopic } from "../scripts/content-intelligence/scoring.mjs";
import { assertMonth } from "../scripts/content-intelligence/utils.mjs";
import { deriveRoute } from "../scripts/content-intelligence/inventory.mjs";
import { createVideoPlan } from "../scripts/content-intelligence/video-plan.mjs";
import { loadConfig } from "../scripts/content-intelligence/config.mjs";
import { buildInventory } from "../scripts/content-intelligence/inventory.mjs";
import { discoverTopics } from "../scripts/content-intelligence/discovery.mjs";
import { runContentCli } from "../scripts/content-intelligence/cli.mjs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

test("scoring uses a 100-point weighted total and records evidence penalties", () => {
  const result = scoreTopic({
    scores: { localRelevance: 5, evidenceStrength: 2, seasonalFit: 4, existingContentGap: 5, visualAvailability: 4, operationalStability: 4 },
    penalties: { evidence: 12, duplication: 0 },
  }, {
    weights: { localRelevance: 25, evidenceStrength: 20, seasonalFit: 15, existingContentGap: 20, visualAvailability: 10, operationalStability: 10 },
  });

  assert.equal(result.baseScore, 81);
  assert.equal(result.editorialPriorityScore, 69);
  assert.match(result.explanation, /evidence penalty/i);
});

test("configuration validates brand vocabulary and 100-point scoring", async () => {
  const config = await loadConfig(process.cwd());
  assert.ok(config.brand.prohibitedLanguage.includes("hidden gem"));
  assert.equal(Object.values(config.scoring.weights).reduce((a, b) => a + b, 0), 100);
});

test("inventory sorting, drafts, discovery penalties and warnings are deterministic", async () => {
  const config = await loadConfig(process.cwd());
  const all = await buildInventory({ rootDir: process.cwd(), includeDrafts: true });
  const published = await buildInventory({ rootDir: process.cwd(), includeDrafts: false });
  assert.ok(all.articles.some((article) => article.draft));
  assert.ok(published.articles.every((article) => !article.draft));
  assert.deepEqual(all, await buildInventory({ rootDir: process.cwd(), includeDrafts: true }));
  const candidates = discoverTopics({ inventory: all, rules: config.scoring, month: 9 });
  assert.ok(candidates.some((item) => item.penalties.duplication > 0 && item.duplicateOrOverlap));
  assert.ok(candidates.some((item) => item.operationalVolatilityWarning));
  assert.ok(candidates.some((item) => item.archivalVisualRequirement));
});

test("invalid paths and status are safe and read-only", async () => {
  assert.throws(() => assertMonth("../9"));
  await assert.rejects(createVideoPlan({ rootDir: process.cwd(), slug: "../escape" }), /kebab-case/);
  const inventoryFile = path.join(process.cwd(), "data", "content-intelligence", "inventory.json");
  const before = (await stat(inventoryFile)).mtimeMs;
  const status = await runContentCli({ command: "status", argv: ["--json"], rootDir: process.cwd() });
  assert.ok(status.inventory.articleFingerprints["spinalonga-why-fortified-changing-uses"]);
  assert.equal((await stat(inventoryFile)).mtimeMs, before);
});

test("content intelligence never imports network, LLM, or social publishing code", async () => {
  const source = await Promise.all(["cli.mjs", "config.mjs", "discovery.mjs", "inventory.mjs", "scoring.mjs", "seasonal.mjs", "video-plan.mjs"].map((name) => readFile(path.join(process.cwd(), "scripts", "content-intelligence", name), "utf8")));
  assert.doesNotMatch(source.join("\n"), /\bfetch\b|node:(http|https)|social\/|social:publish|openai|anthropic|curl|wget/i);
});

test("configuration errors identify malformed scoring fields", async () => {
  const { validateScoringRules } = await import("../scripts/content-intelligence/schemas.mjs");
  assert.throws(() => validateScoringRules({ weights: { localRelevance: 99 } }, "fixture.json"), /total 100/);
});

test("slug and generated output paths reject traversal", async () => {
  const { assertSlug, contentPath } = await import("../scripts/content-intelligence/utils.mjs");
  assert.equal(assertSlug("valid-article-slug"), "valid-article-slug");
  for (const value of ["../article", "C:/article", "/article", "article/../x"]) assert.throws(() => assertSlug(value));
  assert.throws(() => contentPath(process.cwd(), "..", "escape"));
});

test("seasonal plan provides every editorial category and volatile warning", async () => {
  const config = await loadConfig(process.cwd()); const inventory = await buildInventory({ rootDir: process.cwd() });
  const { seasonalPlan } = await import("../scripts/content-intelligence/seasonal.mjs");
  const plan = seasonalPlan({ inventory, calendar: config.seasonal, month: 9, candidates: discoverTopics({ inventory, rules: config.scoring, month: 9 }) });
  for (const key of ["resurface existing article", "update existing article", "finish draft", "research next", "video candidate", "practical seasonal content"]) assert.ok(key in plan.recommendations);
  assert.match(JSON.stringify(plan), /Current verification required before publication\./);
});

test("video-plan source fingerprint is stable and human review cannot be disabled", async () => {
  const first = await createVideoPlan({ rootDir: process.cwd(), slug: "spinalonga-why-fortified-changing-uses" });
  const second = await createVideoPlan({ rootDir: process.cwd(), slug: "spinalonga-why-fortified-changing-uses" });
  assert.equal(first.sourceFingerprint, second.sourceFingerprint);
  assert.equal(first.publicationReadiness.requiresHumanReview, true);
  assert.doesNotMatch(JSON.stringify(first), /voice-over script/i);
});

test("video-plan status keeps qualified claims distinct from verified facts", async () => {
  const plan = await createVideoPlan({ rootDir: process.cwd(), slug: "spinalonga-why-fortified-changing-uses" });
  const transfer = plan.longFormPlan.find((item) => item.heading === "The first transfers in 1904");
  assert.equal(transfer.claimStatus, "qualified fact");
  assert.match(transfer.uncertaintyWording, /do not add precision/i);
});

test("status detects a stale video plan without changing source files", async () => {
  const planPath = path.join(process.cwd(), "data", "content-intelligence", "video-plans", "spinalonga-why-fortified-changing-uses.json");
  const original = await readFile(planPath, "utf8");
  const altered = JSON.parse(original); altered.sourceFingerprint = "0".repeat(64);
  const { writeFile } = await import("node:fs/promises"); await writeFile(planPath, `${JSON.stringify(altered, null, 2)}\n`);
  try { const status = await runContentCli({ command: "status", argv: [], rootDir: process.cwd() }); assert.ok(status.stalePlans.includes("spinalonga-why-fortified-changing-uses")); } finally { await writeFile(planPath, original); }
});

test("generated video plans reject malformed human-review records", async () => {
  const { validateVideoPlan } = await import("../scripts/content-intelligence/schemas.mjs");
  assert.throws(() => validateVideoPlan({ articleSlug: "x", sourceFingerprint: "a", publicationReadiness: { requiresHumanReview: false } }, "fixture.json"), /requiresHumanReview/);
});

test("month validation rejects values outside the calendar", () => {
  assert.throws(() => assertMonth(0), /1 to 12/);
  assert.throws(() => assertMonth(13), /1 to 12/);
  assert.equal(assertMonth("9"), 9);
});

test("inventory derives the canonical English article route", () => {
  assert.equal(deriveRoute("spinalonga-why-fortified-changing-uses"), "/en/blog/spinalonga-why-fortified-changing-uses/");
});

test("Spinalonga video plan preserves modern-context and credit safeguards", async () => {
  const plan = await createVideoPlan({ rootDir: process.cwd(), slug: "spinalonga-why-fortified-changing-uses" });
  assert.equal(plan.publicationReadiness.requiresHumanReview, true);
  assert.match(JSON.stringify(plan.visualEvidenceRegister), /Modern context only/);
  assert.match(plan.youtubeMetadata.imageCreditBlock, /Nikos Pasparakis/);
  assert.match(JSON.stringify(plan.longFormPlan), /qualified fact/);
});
