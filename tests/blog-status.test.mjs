import assert from "node:assert/strict";
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
  assert.equal(result.simulatedRun.slug, "areti-monastery-mirabello-crete");
  assert.equal(result.overlap[0].slug, "areti-monastery-mirabello-crete");
  assert.equal(result.overlap[0].assessment.level, "duplicate");
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
