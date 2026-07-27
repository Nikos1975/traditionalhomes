import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { scaffoldBlogRun } from "../scripts/blog/scaffold.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REQUIRED_HEADINGS = [
  "# Objective",
  "# Task Mode",
  "# Intended Reader",
  "# Article Type",
  "# Angle and Geographic Scope",
  "# Questions and Claims to Investigate",
  "# Facts Supplied by Nikos",
  "# Source Requirements",
  "# Claims That Must Not Be Published Without Verification",
  "# Image Plan and Rights",
  "# Required Internal Links",
  "# Target Article Path",
  "# Deliverables",
  "# Manual Approval Gates",
  "# Explicit Exclusions",
  "# Current Status",
  "# Next Allowed Action",
];

async function readRepositoryFile(relativePath) {
  return readFile(path.join(rootDir, relativePath), "utf8");
}

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const child = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await markdownFiles(child)));
    if (entry.isFile() && entry.name.endsWith(".md")) files.push(child);
  }
  return files;
}

test("blog entry-point instructions require the persistent orchestrator", async () => {
  for (const file of ["AGENTS.md", "CLAUDE.md"]) {
    assert.match(await readRepositoryFile(file), /BLOG_ORCHESTRATOR\.md/);
  }
  const skill = await readRepositoryFile(".agents/skills/blog-research-article/SKILL.md");
  const requiredReading = skill.slice(skill.indexOf("## Required reading"), skill.indexOf("## Topic brief"));
  assert.match(requiredReading, /BLOG_ORCHESTRATOR\.md/);
  assert.match(requiredReading, /^- `BLOG_ORCHESTRATOR\.md`/m);
});

test("the orchestrator routes every mode to a canonical skill and retains manual stops", async () => {
  const orchestrator = await readRepositoryFile("BLOG_ORCHESTRATOR.md");
  for (const file of [
    "AGENTS.md",
    "CLAUDE.md",
    "docs/operations/blog-production.md",
    ".agents/skills/blog-research-article/SKILL.md",
    ".agents/skills/blog-revise-draft/SKILL.md",
    ".agents/skills/blog-content-audit/SKILL.md",
    ".agents/skills/blog-publication/SKILL.md",
    ".agents/skills/traditional-homes-image-pipeline/SKILL.md",
  ]) {
    assert.match(orchestrator, new RegExp(file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  for (const mode of ["new-article", "revise-draft", "audit", "publication", "image-only"]) {
    assert.match(orchestrator, new RegExp(`\\b${mode}\\b`));
  }
  assert.match(orchestrator, /no automatic publication/i);
  assert.match(orchestrator, /no automatic merge/i);
  assert.match(orchestrator, /manual editorial approval/i);
});

test("the orchestrator keeps detailed research procedure in the routed skill", async () => {
  const orchestrator = await readRepositoryFile("BLOG_ORCHESTRATOR.md");
  assert.doesNotMatch(orchestrator, /## Staged research-record reads/);
  assert.doesNotMatch(orchestrator, /### Draft article requirements/);
  assert.doesNotMatch(orchestrator, /### Publication candidate requirements/);
});

test("subordinate workflow activities do not require a second initial mode", async () => {
  const orchestrator = await readRepositoryFile("BLOG_ORCHESTRATOR.md");
  assert.match(orchestrator, /Choose the mode that matches the requested primary outcome\./);
  assert.match(orchestrator, /Supporting activities such as claim review, validation, and image processing do not create a second mode\./);
  assert.match(orchestrator, /Stop only when the outcome is genuinely ambiguous\./);
});

test("new topic briefs contain the required orchestration headings", async (t) => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "blog-orchestrator-"));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  await mkdir(path.join(workspace, "src", "content", "blog"), { recursive: true });
  const result = await scaffoldBlogRun({
    rootDir: workspace,
    topic: "A practical village guide",
    slug: "practical-village-guide",
    baseCommit: "a".repeat(40),
    statusEntries: [],
    entropy: "briefheadings",
  });
  const brief = await readFile(path.join(result.researchDir, "topic-brief.md"), "utf8");
  for (const heading of REQUIRED_HEADINGS) assert.match(brief, new RegExp(`^${heading}$`, "m"));
});

test("resuming a run preserves an edited topic brief", async (t) => {
  const workspace = await mkdtemp(path.join(os.tmpdir(), "blog-orchestrator-resume-"));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  await mkdir(path.join(workspace, "src", "content", "blog"), { recursive: true });
  const created = await scaffoldBlogRun({
    rootDir: workspace,
    topic: "A focused village guide",
    slug: "focused-village-guide",
    baseCommit: "a".repeat(40),
    statusEntries: [],
    entropy: "briefresume",
  });
  const briefPath = path.join(created.researchDir, "topic-brief.md");
  await writeFile(briefPath, "# User-edited brief\n");
  await scaffoldBlogRun({
    rootDir: workspace,
    resumeRunId: created.run.runId,
    statusEntries: [{ status: " M", path: "docs/research/blog/focused-village-guide/topic-brief.md" }],
  });
  assert.equal(await readFile(briefPath, "utf8"), "# User-edited brief\n");
});

test("no Markdown file exists under src/pages", async () => {
  assert.deepEqual(await markdownFiles(path.join(rootDir, "src", "pages")), []);
});
