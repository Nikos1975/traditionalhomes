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
    /verified claims only/i,
    /image ownership.*licen[cs]e.*attribution/i,
    /confirmed publication timing/i,
    /current .*origin\/main.*fetched/i,
    /clean dedicated publication branch or worktree/i,
    /dedicated publication branch/i,
    /exact file scope/i,
    /draft: false/i,
    /npm ci/i,
    /npm run blog:validate/i,
    /full Node tests/i,
    /typecheck-baseline comparison/i,
    /npm run build/i,
    /npm run seo:links/i,
    /git diff --check/i,
    /generated route verification/i,
    /blog-index verification/i,
    /sitemap-index.*child XML/i,
    /robots\.txt.*sitemap/i,
    /canonical.*title.*description/i,
    /image alt.*caption.*linked credit/i,
    /390 × 844/i,
    /1440 × 900/i,
    /1920 × 1080/i,
    /one hero image request/i,
    /no duplicate hero preload/i,
    /console errors.*horizontal overflow/i,
    /Cloudflare Pages preview/i,
    /known obsolete.*Workers.*non-blocking/i,
    /docs\/agent-handoff-notes\.md/i,
    /publication pull request/i,
    /## Final Validation/i,
    /explicit user approval after checks before merging/i,
    /squash-merge only after explicit approval/i,
    /production HTTP 200/i,
    /production sitemap-index.*child sitemap/i,
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
