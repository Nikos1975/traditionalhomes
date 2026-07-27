import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const modes = {
  "new-article": ".agents/skills/blog-research-article/SKILL.md",
  "revise-draft": ".agents/skills/blog-revise-draft/SKILL.md",
  audit: ".agents/skills/blog-content-audit/SKILL.md",
  publication: ".agents/skills/blog-publication/SKILL.md",
  "image-only": ".agents/skills/traditional-homes-image-pipeline/SKILL.md",
};

async function readRepositoryFile(relativePath) {
  return readFile(path.join(rootDir, relativePath), "utf8");
}

test("all blog modes route to one existing canonical skill", async () => {
  const orchestrator = await readRepositoryFile("BLOG_ORCHESTRATOR.md");
  for (const [mode, skill] of Object.entries(modes)) {
    assert.ok(orchestrator.includes(`| \`${mode}\` |`));
    assert.match(orchestrator, new RegExp(skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    await readRepositoryFile(skill);
  }
});

test("the orchestrator keeps manual approval and no-auto-publication controls", async () => {
  const orchestrator = await readRepositoryFile("BLOG_ORCHESTRATOR.md");
  assert.match(orchestrator, /manual editorial approval/i);
  assert.match(orchestrator, /no automatic publication/i);
  assert.match(orchestrator, /no automatic merge/i);
});

test("publication procedure includes every required gate", async () => {
  const skill = await readRepositoryFile(".agents/skills/blog-publication/SKILL.md");
  for (const gate of [
    /recorded manual editorial approval/i,
    /draft content already reviewed/i,
    /image ownership.*licen[cs]e.*attribution/i,
    /dedicated publication branch/i,
    /exact file scope/i,
    /draft: false/i,
    /npm run blog:validate/i,
    /node --test/i,
    /typecheck-baseline comparison/i,
    /npm run build/i,
    /npm run seo:links/i,
    /route, blog-index, and sitemap verification/i,
    /mobile and desktop review/i,
    /Cloudflare Pages preview/i,
    /publication pull request/i,
    /production verification after merge/i,
    /stop on any failed publication gate/i,
    /no automatic merge/i,
  ]) {
    assert.match(skill, gate);
  }
});

test("audit is read-only by default and revise-draft preserves draft status", async () => {
  const audit = await readRepositoryFile(".agents/skills/blog-content-audit/SKILL.md");
  const revise = await readRepositoryFile(".agents/skills/blog-revise-draft/SKILL.md");
  assert.match(audit, /read-only operation by default/i);
  assert.match(audit, /no edits without a new explicit approval/i);
  assert.match(revise, /research packet read before editing/i);
  assert.match(revise, /draft: true preserved/i);
  assert.match(revise, /no source recovery or article expansion unless requested/i);
});

test("there is no duplicate competing blog mode skill", async () => {
  const skillDirectories = await readdir(path.join(rootDir, ".agents", "skills"), {
    withFileTypes: true,
  });
  const names = skillDirectories
    .filter((entry) => entry.isDirectory() && entry.name.startsWith("blog-"))
    .map((entry) => entry.name)
    .sort();
  assert.deepEqual(names, [
    "blog-content-audit",
    "blog-publication",
    "blog-research-article",
    "blog-revise-draft",
  ]);
});
