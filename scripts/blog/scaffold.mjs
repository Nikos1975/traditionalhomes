#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
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
  resumeBlockedRun,
  saveRun,
} from "./lib/run-state.mjs";
import { argumentValue, parseNamedArgs } from "./lib/cli-args.mjs";
import { compareProposedTopic } from "./lib/overlap.mjs";

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function templateFiles(topic, slug, runId, distinctAngle) {
  return {
    "topic-brief.md": `# Objective\n\n- Topic: ${topic}\n- Slug: \`${slug}\`\n\n# Task Mode\n\n- Initial mode: new-article\n\n# Intended Reader\n\n- \n\n# Article Type\n\n- \n\n# Angle and Geographic Scope\n\n- Distinct angle: ${distinctAngle ?? ""}\n- Geographic scope: \n\n# Questions and Claims to Investigate\n\n- \n\n# Facts Supplied by Nikos\n\n- \n\n# Source Requirements\n\n- \n\n# Claims That Must Not Be Published Without Verification\n\n- \n\n# Editorial Interpretation\n\nFor historical or cultural articles, complete this after claim review and before drafting. For other article types, use only when relevant.\n\n- Central human question: \n- Historical life cycle: \n- Main actors and practical activity: \n- Physical setting and constraints: \n- What changed: \n- What survives today: \n- Wider comparison, if useful: \n- One-sentence thesis: \n- Narrative architecture: \n\n# Image Plan and Rights\n\n- Owned-image location, licence, permission, attribution, and crop approval: \n\n# Required Internal Links\n\n- \n\n# Target Article Path\n\n- \`src/content/blog/${slug}.md\`\n\n# Deliverables\n\n- \n\n# Manual Approval Gates\n\n- Editorial approval is required before publication.\n\n# Explicit Exclusions\n\n- \n\n# Current Status\n\n- Topic brief scaffolded; research has not started.\n\n# Next Allowed Action\n\n- Complete the topic brief, then research and record sources and claims.\n`,
    "source-notes.md":
      "# Source Notes\n\n| Claim | Supporting source | URL | Status | Reasoning |\n| --- | --- | --- | --- | --- |\n",
    "sources.json": "[]\n",
    "claims.json": "[]\n",
    "run-summary.json": `${JSON.stringify({ schemaVersion: 1, runId, slug, status: "initialized" }, null, 2)}\n`,
  };
}

function articleTitle(source) {
  const frontmatter =
    source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1] ?? "";
  const title = frontmatter.match(/^title:\s*(.*)$/m)?.[1]?.trim() ?? "";
  return title.replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2");
}

async function collectArticles(rootDir) {
  const blogDir = path.join(rootDir, "src", "content", "blog");
  if (!(await exists(blogDir))) return [];
  const articles = [];
  for (const entry of await readdir(blogDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    articles.push({
      slug: path.basename(entry.name, ".md"),
      title: articleTitle(
        await readFile(path.join(blogDir, entry.name), "utf8"),
      ),
    });
  }
  return articles;
}

async function collectResearchTopics(rootDir) {
  const researchRoot = path.join(rootDir, "docs", "research");
  if (!(await exists(researchRoot))) return [];
  const topics = [];

  async function walk(directory) {
    const entries = await readdir(directory, { withFileTypes: true });
    if (entries.some((entry) => entry.isFile())) {
      topics.push({
        name: path.basename(directory),
        path: path.relative(rootDir, directory).replaceAll("\\", "/"),
      });
    }
    for (const entry of entries) {
      if (entry.isDirectory()) await walk(path.join(directory, entry.name));
    }
  }

  await walk(researchRoot);
  return topics;
}

function overlapDecision(matches, distinctAngle) {
  const topMatch = matches[0] ?? null;
  const level = topMatch?.assessment.level ?? "low";
  if (level === "duplicate") {
    throw new Error(
      `Duplicate or near-exact overlap with ${topMatch.slug ?? topMatch.path}.`,
    );
  }
  if (level === "high" && !distinctAngle?.trim()) {
    throw new Error(
      `High overlap requires --distinct-angle "<explanation>" (closest match: ${topMatch.slug ?? topMatch.path}).`,
    );
  }
  return {
    level,
    action:
      level === "medium"
        ? "warn"
        : level === "high"
          ? "continue-with-distinct-angle"
          : "continue",
    matches,
  };
}

export async function scaffoldBlogRun({
  rootDir,
  topic,
  slug,
  distinctAngle,
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
    if (run.state !== "blocked") return { run, researchDir, resumed: true };
    const resumedRun = resumeBlockedRun(run, now);
    await saveRun({ rootDir, run: resumedRun });
    return { run: resumedRun, researchDir, resumed: true };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? ""))
    throw new Error("slug must be lowercase kebab-case.");
  assertCleanWorkingTree(statusEntries);
  const overlap = overlapDecision(
    compareProposedTopic({
      topic,
      slug,
      articles: await collectArticles(rootDir),
      researchTopics: await collectResearchTopics(rootDir),
    }),
    distinctAngle,
  );
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

  const run = createRunRecord({
    topic,
    slug,
    distinctAngle,
    baseCommit,
    now,
    entropy,
  });
  run.checks.preScaffoldOverlap = overlap;
  await initializeRunFiles({ rootDir, run });
  await mkdir(path.dirname(researchDir), { recursive: true });
  await mkdir(researchDir, { recursive: false });
  for (const [name, content] of Object.entries(
    templateFiles(run.topic, slug, run.runId, run.distinctAngle),
  )) {
    await writeFile(path.join(researchDir, name), content, { flag: "wx" });
  }
  return { run, researchDir, overlap };
}

export function parseScaffoldArgs(argv, env = process.env) {
  const { args, positional } = parseNamedArgs(argv, env);
  if ("resume" in args)
    return { resume: argumentValue(args, positional, "resume", 0) };
  const result = {};
  const topic = argumentValue(args, positional, "topic", 0);
  const slug = argumentValue(args, positional, "slug", 1);
  const distinctAngle = argumentValue(args, positional, "distinct-angle", 2);
  if (topic) result.topic = topic;
  if (slug) result.slug = slug;
  if (distinctAngle) result.distinctAngle = distinctAngle;
  return result;
}

async function runCli() {
  const args = parseScaffoldArgs(process.argv.slice(2));
  if (!args.resume && (!args.topic || !args.slug))
    throw new Error(
      'Usage: npm run blog:scaffold -- --topic "<topic>" --slug <slug> [--distinct-angle "<explanation>"] OR --resume <run-id>',
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
    distinctAngle: args.distinctAngle,
    baseCommit,
    statusEntries,
    resumeRunId: args.resume,
  });
  console.log(
    `${result.resumed ? "Resumed" : "Created"} run ${result.run.runId}`,
  );
  if (result.overlap) {
    const closest = result.overlap.matches[0];
    const closestSummary = closest
      ? `; closest ${closest.kind} ${closest.slug ?? closest.path} at ${closest.score.toFixed(3)}`
      : "; no existing comparison targets";
    const message = `Overlap: ${result.overlap.level} (${result.overlap.action})${closestSummary}`;
    if (result.overlap.action === "warn") console.warn(`WARNING: ${message}`);
    else console.log(message);
  }
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
