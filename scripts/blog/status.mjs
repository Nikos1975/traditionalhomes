#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import { compareAgainstArticles } from "./lib/overlap.mjs";
import { createRunRecord } from "./lib/run-state.mjs";
import { validateBlogArticle } from "../validate-blog-article.mjs";
import { argumentValue, parseNamedArgs } from "./lib/cli-args.mjs";

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function parseArticle(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  const frontmatter = match?.[1] ?? "";
  const value = (key) => {
    const field =
      frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, "m"))?.[1]?.trim() ??
      "";
    return field.replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2");
  };
  return {
    title: value("title"),
    description: value("description"),
    draft: value("draft") === "true",
    body: match ? source.slice(match[0].length) : source,
  };
}

async function walkForSourceNotes(directory) {
  if (!(await exists(directory))) return [];
  const matches = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const child = path.join(directory, entry.name);
    if (entry.isDirectory()) matches.push(...(await walkForSourceNotes(child)));
    else if (entry.name === "source-notes.md") matches.push(child);
  }
  return matches;
}

async function locateResearch(rootDir, slug, articleText) {
  const canonical = path.join(rootDir, "docs", "research", "blog", slug);
  if (await exists(canonical)) return canonical;
  const candidates = await walkForSourceNotes(
    path.join(rootDir, "docs", "research"),
  );
  const articleTerms = new Set(
    articleText.toLowerCase().match(/[a-z]{5,}/g) ?? [],
  );
  let best = null;
  for (const file of candidates) {
    const content = (await readFile(file, "utf8")).toLowerCase();
    const score = [...articleTerms].filter((term) =>
      content.includes(term),
    ).length;
    if (!best || score > best.score)
      best = { directory: path.dirname(file), score };
  }
  return best?.score > 0 ? best.directory : null;
}

export async function inspectBlogStatus({
  rootDir,
  slug,
  simulateRun = false,
}) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? ""))
    throw new Error("slug must be lowercase kebab-case.");
  const articlePath = path.join(
    rootDir,
    "src",
    "content",
    "blog",
    `${slug}.md`,
  );
  if (!(await exists(articlePath))) {
    return {
      slug,
      exists: false,
      publicationActionNeeded: false,
      message: `No article exists for ${slug}.`,
    };
  }

  const articleSource = await readFile(articlePath, "utf8");
  const article = parseArticle(articleSource);
  const blogDir = path.dirname(articlePath);
  const articles = [];
  for (const name of await readdir(blogDir)) {
    if (!name.endsWith(".md")) continue;
    const source = await readFile(path.join(blogDir, name), "utf8");
    const parsed = parseArticle(source);
    articles.push({
      slug: path.basename(name, ".md"),
      text: `${parsed.title}\n${parsed.description}\n${parsed.body}`,
    });
  }
  const candidate = `${article.title}\n${article.description}\n${article.body}`;
  const validation = await validateBlogArticle({ rootDir, articlePath });
  const result = {
    slug,
    exists: true,
    draft: article.draft,
    publicationActionNeeded: article.draft,
    message: article.draft
      ? "Article is an unpublished draft."
      : "Article is already published; no publication action is needed.",
    researchDirectory: await locateResearch(rootDir, slug, candidate),
    overlap: compareAgainstArticles({ candidate, articles }),
    validation: {
      errors: validation.errors,
      warnings: validation.warnings ?? [],
      image: validation.image ?? null,
    },
  };
  if (simulateRun) {
    const baseCommit = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: rootDir,
      encoding: "utf8",
    }).trim();
    result.simulatedRun = createRunRecord({
      topic: article.title,
      slug,
      baseCommit,
      now: new Date(0),
      entropy: "simulated",
    });
    result.simulatedRun.simulated = true;
  }
  return result;
}

export function parseStatusArgs(argv, env = process.env) {
  const { args, positional } = parseNamedArgs(argv, env);
  return {
    slug: argumentValue(args, positional, "slug", 0),
    simulateRun: args.simulate === true || args.simulate === "true",
  };
}

async function runCli() {
  const args = parseStatusArgs(process.argv.slice(2));
  if (!args.slug)
    throw new Error("Usage: npm run blog:status -- --slug <slug> [--simulate]");
  const result = await inspectBlogStatus({ rootDir: process.cwd(), ...args });
  console.log(JSON.stringify(result, null, 2));
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
