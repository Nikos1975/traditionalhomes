import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import {
  appendCommandLog,
  advanceRun,
  createRunRecord,
  initializeRunFiles,
  loadRun,
  markRunBlocked,
  resumeBlockedRun,
  saveRun,
  saveTransientChecks,
} from "../scripts/blog/lib/run-state.mjs";
import {
  assessOverlap,
  compareAgainstArticles,
} from "../scripts/blog/lib/overlap.mjs";
import {
  assertOnlyAllowedChanges,
  parsePorcelainStatus,
} from "../scripts/blog/lib/git-scope.mjs";
import { scaffoldBlogRun } from "../scripts/blog/scaffold.mjs";

const NOW = new Date("2026-07-22T12:34:56.000Z");

async function writeArticle(rootDir, slug, title) {
  const blogDir = path.join(rootDir, "src", "content", "blog");
  await mkdir(blogDir, { recursive: true });
  await writeFile(
    path.join(blogDir, `${slug}.md`),
    `---\ntitle: "${title}"\ndescription: "Fixture article."\ndraft: false\n---\n\nFixture body.\n`,
  );
}

async function snapshotTree(rootDir, current = rootDir) {
  const snapshot = {};
  for (const entry of await readdir(current, { withFileTypes: true })) {
    const entryPath = path.join(current, entry.name);
    const relative = path.relative(rootDir, entryPath).replaceAll("\\", "/");
    if (entry.isDirectory()) {
      snapshot[`${relative}/`] = "directory";
      Object.assign(snapshot, await snapshotTree(rootDir, entryPath));
    } else {
      snapshot[relative] = await readFile(entryPath, "utf8");
    }
  }
  return snapshot;
}

test("creates an immutable run identity and records the base commit", () => {
  const run = createRunRecord({
    topic: "Parking in Mavrikiano",
    slug: "parking-in-mavrikiano",
    baseCommit: "a".repeat(40),
    now: NOW,
    entropy: "7f3a91",
  });

  assert.equal(run.runId, "20260722T123456Z-parking-in-mavrikiano-7f3a91");
  assert.equal(run.state, "initialized");
  assert.deepEqual(run.completedStates, ["initialized"]);
  assert.equal(run.baseCommit, "a".repeat(40));
  assert.equal(run.createdAt, NOW.toISOString());
  assert.equal(run.updatedAt, NOW.toISOString());
});

test("rejects unsafe run-id entropy and unsafe scaffold slugs", async () => {
  assert.throws(
    () =>
      createRunRecord({
        topic: "A topic",
        slug: "a-topic",
        baseCommit: "a".repeat(40),
        now: NOW,
        entropy: "../escape",
      }),
    /entropy must contain only lowercase letters and numbers/,
  );
  const rootDir = await mkdtemp(
    path.join(os.tmpdir(), "blog-scaffold-unsafe-"),
  );
  await assert.rejects(
    scaffoldBlogRun({
      rootDir,
      topic: "Unsafe",
      slug: "../unsafe",
      baseCommit: "a".repeat(40),
      now: NOW,
      statusEntries: [],
    }),
    /slug must be lowercase kebab-case/,
  );
});

test("run schema requires the immutable identity and state fields", async () => {
  const schemaPath = path.resolve(
    import.meta.dirname,
    "..",
    "scripts",
    "blog",
    "schemas",
    "run.schema.json",
  );
  const schema = JSON.parse(await readFile(schemaPath, "utf8"));
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  for (const field of [
    "schemaVersion",
    "runId",
    "topic",
    "slug",
    "baseCommit",
    "state",
    "completedStates",
    "createdAt",
    "updatedAt",
  ]) {
    assert.ok(schema.required.includes(field), `${field} must be required`);
  }
  assert.ok(schema.properties.state.enum.includes("blocked"));
  assert.equal(schema.additionalProperties, false);
});

test("persists run files once and resumes without overwriting command history", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "blog-run-"));
  const run = createRunRecord({
    topic: "Parking in Mavrikiano",
    slug: "parking-in-mavrikiano",
    baseCommit: "b".repeat(40),
    now: NOW,
    entropy: "123abc",
  });

  await initializeRunFiles({ rootDir, run });
  const commandLog = path.join(
    rootDir,
    ".blog-runs",
    run.runId,
    "command-log.json",
  );
  await writeFile(
    commandLog,
    JSON.stringify([{ command: "preserve me" }], null, 2),
  );

  const resumed = await initializeRunFiles({ rootDir, run, resume: true });
  const commands = JSON.parse(await readFile(commandLog, "utf8"));

  assert.equal(resumed.resumed, true);
  assert.deepEqual(commands, [{ command: "preserve me" }]);
  await assert.rejects(
    initializeRunFiles({ rootDir, run }),
    /Refusing to overwrite existing run directory/,
  );
});

test("records sanitized command results and replaceable transient checks", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "blog-run-log-"));
  const run = createRunRecord({
    topic: "A topic",
    slug: "a-topic",
    baseCommit: "9".repeat(40),
    now: NOW,
    entropy: "abc123",
  });
  await initializeRunFiles({ rootDir, run });
  await appendCommandLog({
    rootDir,
    runId: run.runId,
    entry: { name: "blog:validate", status: "passed", at: NOW.toISOString() },
  });
  await saveTransientChecks({
    rootDir,
    runId: run.runId,
    checks: { validator: "passed" },
  });
  assert.deepEqual(
    JSON.parse(
      await readFile(
        path.join(rootDir, ".blog-runs", run.runId, "command-log.json"),
        "utf8",
      ),
    ),
    [{ name: "blog:validate", status: "passed", at: NOW.toISOString() }],
  );
  assert.deepEqual(
    JSON.parse(
      await readFile(
        path.join(rootDir, ".blog-runs", run.runId, "transient-checks.json"),
        "utf8",
      ),
    ),
    { validator: "passed" },
  );
  await assert.rejects(
    appendCommandLog({
      rootDir,
      runId: run.runId,
      entry: { name: "unsafe", token: "secret" },
    }),
    /Sensitive command-log field is not allowed: token/,
  );
});

test("advances only through valid states and preserves the immutable run id", () => {
  const run = createRunRecord({
    topic: "A topic",
    slug: "a-topic",
    baseCommit: "c".repeat(40),
    now: NOW,
    entropy: "abcdef",
  });
  const advanced = advanceRun(
    run,
    "overlap-checked",
    new Date("2026-07-22T12:40:00.000Z"),
  );
  assert.equal(advanced.runId, run.runId);
  assert.equal(advanced.state, "overlap-checked");
  assert.deepEqual(advanced.completedStates, [
    "initialized",
    "overlap-checked",
  ]);
  assert.throws(
    () => advanceRun(advanced, "drafted", NOW),
    /Invalid run transition/,
  );
});

test("records a clear blocked state without losing completed work", () => {
  const run = createRunRecord({
    topic: "A topic",
    slug: "a-topic",
    baseCommit: "d".repeat(40),
    now: NOW,
    entropy: "abcdef",
  });
  const blocked = markRunBlocked(
    run,
    "Working tree contains unrelated changes.",
    NOW,
  );
  assert.equal(blocked.state, "blocked");
  assert.equal(
    blocked.blocked.reason,
    "Working tree contains unrelated changes.",
  );
  assert.deepEqual(blocked.completedStates, ["initialized"]);
});

test("restores a blocked run to its previous state without losing completed work", () => {
  const run = advanceRun(
    createRunRecord({
      topic: "A topic",
      slug: "a-topic",
      baseCommit: "d".repeat(40),
      now: NOW,
      entropy: "abcdef",
    }),
    "overlap-checked",
    new Date("2026-07-22T12:35:00.000Z"),
  );
  const blocked = markRunBlocked(
    run,
    "Research source unavailable.",
    new Date("2026-07-22T12:36:00.000Z"),
  );
  const resumed = resumeBlockedRun(
    blocked,
    new Date("2026-07-22T12:37:00.000Z"),
  );

  assert.equal(resumed.state, "overlap-checked");
  assert.equal(resumed.blocked, null);
  assert.deepEqual(resumed.completedStates, run.completedStates);
  assert.equal(resumed.updatedAt, "2026-07-22T12:37:00.000Z");
});

test("rejects invalid blocked-run recovery", () => {
  const run = createRunRecord({
    topic: "A topic",
    slug: "a-topic",
    baseCommit: "d".repeat(40),
    now: NOW,
    entropy: "abcdef",
  });
  assert.throws(
    () => resumeBlockedRun(run, NOW),
    /Run must be blocked before it can be resumed/,
  );
  assert.throws(
    () =>
      resumeBlockedRun(
        {
          ...markRunBlocked(run, "Blocked.", NOW),
          blocked: {
            reason: "Blocked.",
            previousState: "invented",
            at: NOW.toISOString(),
          },
        },
        NOW,
      ),
    /Invalid blocked previous state: invented/,
  );
});

test("classifies overlap as a decision aid and blocks only near duplicates", () => {
  assert.equal(assessOverlap(0.1).level, "low");
  assert.equal(assessOverlap(0.4).level, "medium");
  assert.equal(assessOverlap(0.7).requiresDistinctAngle, true);
  assert.equal(assessOverlap(0.96).blocked, true);

  const matches = compareAgainstArticles({
    candidate: "Moni Aretiou historic monastery inland from Elounda",
    articles: [
      {
        slug: "same",
        text: "Moni Aretiou historic monastery inland from Elounda",
      },
      {
        slug: "narrower",
        text: "Practical parking notes for villages inland from Elounda",
      },
    ],
  });
  assert.equal(matches[0].slug, "same");
  assert.equal(matches[0].assessment.level, "duplicate");
});

test("parses git status and rejects unrelated changes", () => {
  const entries = parsePorcelainStatus(
    " M scripts/blog/scaffold.mjs\n?? notes.txt\n",
  );
  assert.deepEqual(entries, [
    { status: " M", path: "scripts/blog/scaffold.mjs" },
    { status: "??", path: "notes.txt" },
  ]);
  assert.throws(
    () => assertOnlyAllowedChanges(entries, ["scripts/blog/"]),
    /Unrelated changed files detected:[\s\S]*notes\.txt/,
  );
});

test("rejects a rename whose source path is outside the allowed scope", () => {
  const entries = parsePorcelainStatus(
    "R  src/pages/index.astro -> scripts/blog/index.astro\n",
  );
  assert.equal(entries[0].originalPath, "src/pages/index.astro");
  assert.throws(
    () => assertOnlyAllowedChanges(entries, ["scripts/blog/"]),
    /src\/pages\/index\.astro/,
  );
});

test("scaffolds local operational state and durable research without overwriting files", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "blog-scaffold-"));
  await mkdir(path.join(rootDir, "src", "content", "blog"), {
    recursive: true,
  });
  const result = await scaffoldBlogRun({
    rootDir,
    topic: "Parking in Mavrikiano",
    slug: "parking-in-mavrikiano",
    now: NOW,
    entropy: "654321",
    baseCommit: "e".repeat(40),
    statusEntries: [],
  });

  assert.equal(result.run.state, "initialized");
  assert.equal(
    await loadRun({ rootDir, runId: result.run.runId }).then((run) => run.slug),
    "parking-in-mavrikiano",
  );
  assert.match(
    await readFile(
      path.join(
        rootDir,
        "docs",
        "research",
        "blog",
        "parking-in-mavrikiano",
        "topic-brief.md",
      ),
      "utf8",
    ),
    /Parking in Mavrikiano/,
  );

  await assert.rejects(
    scaffoldBlogRun({
      rootDir,
      topic: "Parking in Mavrikiano",
      slug: "parking-in-mavrikiano",
      now: NOW,
      entropy: "654322",
      baseCommit: "e".repeat(40),
      statusEntries: [],
    }),
    /Duplicate or near-exact overlap/,
  );
});

test("compares a proposed topic before scaffolding and reports low overlap", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "blog-scaffold-low-"));
  await writeArticle(
    rootDir,
    "crete-walking-routes",
    "Walking routes in Crete",
  );
  const existingResearch = path.join(
    rootDir,
    "docs",
    "research",
    "elounda",
    "historic-olive-harvests",
  );
  await mkdir(existingResearch, { recursive: true });
  await writeFile(path.join(existingResearch, "source-notes.md"), "# Notes\n");

  const result = await scaffoldBlogRun({
    rootDir,
    topic: "Traditional weaving techniques",
    slug: "traditional-weaving-techniques",
    now: NOW,
    entropy: "111111",
    baseCommit: "1".repeat(40),
    statusEntries: [],
  });

  assert.equal(result.overlap.level, "low");
  assert.equal(result.overlap.action, "continue");
  assert.deepEqual(
    new Set(result.overlap.matches.map((match) => match.kind)),
    new Set(["article", "research"]),
  );
  assert.equal(result.run.checks.preScaffoldOverlap.level, "low");
});

test("blocks a near-exact duplicate before making any filesystem change", async () => {
  const rootDir = await mkdtemp(
    path.join(os.tmpdir(), "blog-scaffold-duplicate-"),
  );
  await writeArticle(rootDir, "parking-in-mavrikiano", "Parking in Mavrikiano");
  const before = await snapshotTree(rootDir);

  await assert.rejects(
    scaffoldBlogRun({
      rootDir,
      topic: "Parking in Mavrikiano",
      slug: "parking-near-mavrikiano",
      now: NOW,
      entropy: "222222",
      baseCommit: "2".repeat(40),
      statusEntries: [],
    }),
    /Duplicate or near-exact overlap/,
  );

  assert.deepEqual(await snapshotTree(rootDir), before);
});

test("blocks high overlap without a distinct angle before creating files", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "blog-scaffold-high-"));
  await writeArticle(
    rootDir,
    "mavrikiano-parking-notes",
    "Parking in Mavrikiano village practical access notes",
  );
  const before = await snapshotTree(rootDir);

  await assert.rejects(
    scaffoldBlogRun({
      rootDir,
      topic: "Parking in Mavrikiano village practical access guide",
      slug: "mavrikiano-practical-access-guide",
      now: NOW,
      entropy: "333333",
      baseCommit: "3".repeat(40),
      statusEntries: [],
    }),
    /High overlap requires --distinct-angle/,
  );

  assert.deepEqual(await snapshotTree(rootDir), before);
});

test("warns and continues for medium overlap", async () => {
  const rootDir = await mkdtemp(
    path.join(os.tmpdir(), "blog-scaffold-medium-"),
  );
  await writeArticle(
    rootDir,
    "mavrikiano-access-notes",
    "Parking in Mavrikiano village access notes",
  );

  const result = await scaffoldBlogRun({
    rootDir,
    topic: "Parking in Mavrikiano village arrival details",
    slug: "mavrikiano-arrival-details",
    now: NOW,
    entropy: "343434",
    baseCommit: "3".repeat(40),
    statusEntries: [],
  });

  assert.equal(result.overlap.level, "medium");
  assert.equal(result.overlap.action, "warn");
  assert.equal(result.run.distinctAngle, null);
});

test("high overlap with a distinct angle proceeds and records the explanation", async () => {
  const rootDir = await mkdtemp(
    path.join(os.tmpdir(), "blog-scaffold-high-angle-"),
  );
  await writeArticle(
    rootDir,
    "mavrikiano-parking-notes",
    "Parking in Mavrikiano village practical access notes",
  );
  const distinctAngle =
    "Focus only on step-free arrival options for mobility-limited visitors.";

  const result = await scaffoldBlogRun({
    rootDir,
    topic: "Parking in Mavrikiano village practical access guide",
    slug: "mavrikiano-practical-access-guide",
    distinctAngle,
    now: NOW,
    entropy: "444444",
    baseCommit: "4".repeat(40),
    statusEntries: [],
  });

  assert.equal(result.overlap.level, "high");
  assert.equal(result.overlap.action, "continue-with-distinct-angle");
  assert.equal(result.run.distinctAngle, distinctAngle);
  assert.equal(
    (await loadRun({ rootDir, runId: result.run.runId })).distinctAngle,
    distinctAngle,
  );
  assert.match(
    await readFile(
      path.join(
        rootDir,
        "docs",
        "research",
        "blog",
        "mavrikiano-practical-access-guide",
        "topic-brief.md",
      ),
      "utf8",
    ),
    new RegExp(distinctAngle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
  );
});

test("scaffold resumes an existing run without overwriting user-edited research", async () => {
  const rootDir = await mkdtemp(
    path.join(os.tmpdir(), "blog-scaffold-resume-"),
  );
  await mkdir(path.join(rootDir, "src", "content", "blog"), {
    recursive: true,
  });
  const created = await scaffoldBlogRun({
    rootDir,
    topic: "A topic",
    slug: "a-topic",
    now: NOW,
    entropy: "777777",
    baseCommit: "7".repeat(40),
    statusEntries: [],
  });
  const brief = path.join(
    rootDir,
    "docs",
    "research",
    "blog",
    "a-topic",
    "topic-brief.md",
  );
  await writeFile(brief, "User-edited brief.\n");
  const resumed = await scaffoldBlogRun({
    rootDir,
    resumeRunId: created.run.runId,
    statusEntries: [
      { status: " M", path: "docs/research/blog/a-topic/topic-brief.md" },
    ],
  });
  assert.equal(resumed.resumed, true);
  assert.equal(await readFile(brief, "utf8"), "User-edited brief.\n");
  await assert.rejects(
    scaffoldBlogRun({
      rootDir,
      resumeRunId: created.run.runId,
      statusEntries: [{ status: " M", path: "src/pages/index.astro" }],
    }),
    /Unrelated changed files detected/,
  );
});

test("scaffold resume restores and persists a blocked run's previous state", async () => {
  const rootDir = await mkdtemp(
    path.join(os.tmpdir(), "blog-scaffold-resume-blocked-"),
  );
  await mkdir(path.join(rootDir, "src", "content", "blog"), {
    recursive: true,
  });
  const created = await scaffoldBlogRun({
    rootDir,
    topic: "A topic",
    slug: "a-topic",
    now: NOW,
    entropy: "888888",
    baseCommit: "8".repeat(40),
    statusEntries: [],
  });
  await saveRun({
    rootDir,
    run: markRunBlocked(
      created.run,
      "Paused for review.",
      new Date("2026-07-22T12:35:00.000Z"),
    ),
  });

  const resumed = await scaffoldBlogRun({
    rootDir,
    resumeRunId: created.run.runId,
    statusEntries: [],
    now: new Date("2026-07-22T12:36:00.000Z"),
  });

  assert.equal(resumed.run.state, "initialized");
  assert.equal(resumed.run.blocked, null);
  assert.equal(
    (await loadRun({ rootDir, runId: created.run.runId })).updatedAt,
    "2026-07-22T12:36:00.000Z",
  );
});

test("scaffold refuses dirty working trees before creating files", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "blog-scaffold-dirty-"));
  await assert.rejects(
    scaffoldBlogRun({
      rootDir,
      topic: "A topic",
      slug: "a-topic",
      now: NOW,
      entropy: "654323",
      baseCommit: "f".repeat(40),
      statusEntries: [{ status: " M", path: "src/pages/index.astro" }],
    }),
    /Working tree must be clean/,
  );
});
