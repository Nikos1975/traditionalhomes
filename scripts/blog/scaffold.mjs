#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import {
  assertCleanWorkingTree,
  assertOnlyAllowedChanges,
  parsePorcelainStatus,
} from "./lib/git-scope.mjs";
import {
  createRunRecord,
  initializeRunFiles,
  loadRun,
} from "./lib/run-state.mjs";
import { argumentValue, parseNamedArgs } from "./lib/cli-args.mjs";

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function templateFiles(topic, slug, runId) {
  return {
    "topic-brief.md": `# Topic Brief: ${topic}\n\n- Slug: \`${slug}\`\n- Intended reader:\n- Distinct angle:\n- Questions to investigate:\n- Required internal links:\n- Owned-image location and permission:\n`,
    "source-notes.md":
      "# Source Notes\n\n| Claim | Supporting source | URL | Status | Reasoning |\n| --- | --- | --- | --- | --- |\n",
    "sources.json": "[]\n",
    "claims.json": "[]\n",
    "run-summary.json": `${JSON.stringify({ schemaVersion: 1, runId, slug, status: "initialized" }, null, 2)}\n`,
  };
}

export async function scaffoldBlogRun({
  rootDir,
  topic,
  slug,
  baseCommit,
  statusEntries,
  now = new Date(),
  entropy,
  resumeRunId,
}) {
  if (resumeRunId) {
    const run = await loadRun({ rootDir, runId: resumeRunId });
    const allowed = [
      `docs/research/blog/${run.slug}/`,
      `src/content/blog/${run.slug}.md`,
      `src/assets/blog-source/${run.slug}/`,
      `public/images/blog/${run.slug}/`,
    ];
    assertOnlyAllowedChanges(statusEntries, allowed);
    const researchDir = path.join(
      rootDir,
      "docs",
      "research",
      "blog",
      run.slug,
    );
    if (!(await exists(researchDir)))
      throw new Error(
        `BLOCKED: Run ${resumeRunId} is missing its durable research directory.`,
      );
    return { run, researchDir, resumed: true };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? ""))
    throw new Error("slug must be lowercase kebab-case.");
  assertCleanWorkingTree(statusEntries);
  const articlePath = path.join(
    rootDir,
    "src",
    "content",
    "blog",
    `${slug}.md`,
  );
  const researchDir = path.join(rootDir, "docs", "research", "blog", slug);
  if (await exists(articlePath))
    throw new Error(
      `Refusing to overwrite existing article: ${path.relative(rootDir, articlePath)}`,
    );
  if (await exists(researchDir))
    throw new Error(
      `Refusing to overwrite existing research directory: ${path.relative(rootDir, researchDir)}`,
    );

  const run = createRunRecord({ topic, slug, baseCommit, now, entropy });
  await initializeRunFiles({ rootDir, run });
  await mkdir(path.dirname(researchDir), { recursive: true });
  await mkdir(researchDir, { recursive: false });
  for (const [name, content] of Object.entries(
    templateFiles(run.topic, slug, run.runId),
  )) {
    await writeFile(path.join(researchDir, name), content, { flag: "wx" });
  }
  return { run, researchDir };
}

export function parseScaffoldArgs(argv, env = process.env) {
  const { args, positional } = parseNamedArgs(argv, env);
  if ("resume" in args)
    return { resume: argumentValue(args, positional, "resume", 0) };
  const result = {};
  const topic = argumentValue(args, positional, "topic", 0);
  const slug = argumentValue(args, positional, "slug", 1);
  if (topic) result.topic = topic;
  if (slug) result.slug = slug;
  return result;
}

async function runCli() {
  const args = parseScaffoldArgs(process.argv.slice(2));
  if (!args.resume && (!args.topic || !args.slug))
    throw new Error(
      'Usage: npm run blog:scaffold -- --topic "<topic>" --slug <slug> OR --resume <run-id>',
    );
  const rootDir = process.cwd();
  const statusEntries = parsePorcelainStatus(
    execFileSync("git", ["status", "--porcelain"], {
      cwd: rootDir,
      encoding: "utf8",
    }),
  );
  const baseCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: rootDir,
    encoding: "utf8",
  }).trim();
  const result = await scaffoldBlogRun({
    rootDir,
    topic: args.topic,
    slug: args.slug,
    baseCommit,
    statusEntries,
    resumeRunId: args.resume,
  });
  console.log(
    `${result.resumed ? "Resumed" : "Created"} run ${result.run.runId}`,
  );
  console.log(`Research: ${path.relative(rootDir, result.researchDir)}`);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  runCli().catch((error) => {
    console.error(`BLOCKED: ${error.message}`);
    process.exitCode = 1;
  });
}
