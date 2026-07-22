import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
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
    /Refusing to overwrite existing research directory/,
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
