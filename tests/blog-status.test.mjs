import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

import { inspectBlogStatus } from "../scripts/blog/status.mjs";

const rootDir = path.resolve(import.meta.dirname, "..");

test("inspects Moni Aretiou as an already-published read-only fixture", async () => {
  const result = await inspectBlogStatus({
    rootDir,
    slug: "areti-monastery-mirabello-crete",
    simulateRun: true,
  });

  assert.equal(result.exists, true);
  assert.equal(result.draft, false);
  assert.equal(result.publicationActionNeeded, false);
  assert.equal(result.simulatedRun.simulated, true);
  assert.equal(result.simulatedRun.run.slug, "areti-monastery-mirabello-crete");
  assert.equal(result.selfMatch.slug, "areti-monastery-mirabello-crete");
  assert.equal(result.selfMatch.assessment.level, "duplicate");
  assert.equal(
    result.overlap.some(
      (match) => match.slug === "areti-monastery-mirabello-crete",
    ),
    false,
  );
  assert.match(
    result.researchDirectory.replaceAll("\\", "/"),
    /docs\/research\/elounda\/moni-aretiou$/,
  );
  assert.deepEqual(result.validation.errors, []);
  assert.deepEqual(result.validation.warnings, []);
  assert.equal(result.validation.image, null);
  assert.equal("body" in result.validation, false);
  assert.equal("frontmatter" in result.validation, false);
});

test("simulated status metadata stays outside the schema-compatible run", async () => {
  const result = await inspectBlogStatus({
    rootDir,
    slug: "areti-monastery-mirabello-crete",
    simulateRun: true,
  });
  const schema = JSON.parse(
    await readFile(
      path.join(rootDir, "scripts", "blog", "schemas", "run.schema.json"),
      "utf8",
    ),
  );
  const run = result.simulatedRun.run;

  assert.equal(schema.additionalProperties, false);
  assert.deepEqual(
    Object.keys(run).filter((key) => !(key in schema.properties)),
    [],
  );
  assert.deepEqual(
    schema.required.filter((key) => !(key in run)),
    [],
  );
  assert.equal("simulated" in run, false);
});

test("status reports a missing article without creating a run", async () => {
  const result = await inspectBlogStatus({
    rootDir,
    slug: "does-not-exist",
    simulateRun: true,
  });
  assert.deepEqual(result, {
    slug: "does-not-exist",
    exists: false,
    publicationActionNeeded: false,
    message: "No article exists for does-not-exist.",
  });
});

test("status rejects a path-like slug before reading outside the blog directory", async () => {
  await assert.rejects(
    inspectBlogStatus({
      rootDir,
      slug: "../../package",
      simulateRun: true,
    }),
    /slug must be lowercase kebab-case/,
  );
});
