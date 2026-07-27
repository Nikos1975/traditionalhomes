---
name: blog-publication
description: Prepare an approved blog draft for controlled publication, with human merge authority and no automatic publication.
---

# Blog Publication

## Purpose

Publish one already reviewed draft through verifiable local, preview, pull-request, and production gates. This skill never publishes, marks a pull request ready, or merges without the required human decision.

## Entry Conditions

- Recorded manual editorial approval and draft content already reviewed.
- Verified claims only, confirmed image ownership or licence, and complete attribution.
- Confirmed publication timing, current `origin/main` fetched, and a clean dedicated publication branch or worktree.
- Exact approved file scope and a documented typecheck baseline.
- An unpublished article with `draft: true`, a topic brief, and claims record.

## Required Reading

Read in this repository-approved order:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `BLOG_ORCHESTRATOR.md`
4. `.ai/brand/website-brand-style-guide.md`
5. `.ai/prompts/blog-editorial-system.md`
6. This `.agents/skills/blog-publication/SKILL.md`
7. `docs/operations/blog-production.md`
8. The article topic brief
9. `source-notes.md`
10. `sources.json`
11. `claims.json`
12. `run-summary.json`, where present
13. The final approved article
14. Related articles
15. The image rights and attribution record
16. The index, sitemap, and `public/robots.txt` implementation relevant to publication

## Allowed File Scope

Only the approved article draft-state change, separately approved publication-blocker fixes, and the required `docs/agent-handoff-notes.md` entry. Do not change article scope, claims, research packets, sources, images, routes, sitemap configuration, deployment configuration, or unrelated files. Stop on any unexpected file.

## Ordered Procedure

1. **Preflight.** Run `git fetch origin`; verify the base is current; inspect worktrees and working-tree status; do not disturb unrelated local work; confirm exact allowed files, recorded approval, verified claims, image rights, attribution, and publication timing.
2. **Publication-state change.** Change only `draft: true` to `draft: false`. Do not expand the article, recover sources, change claims or research packets, or change images unless a genuine publication blocker has separate approval.
3. **Clean dependency installation.** Run `npm ci`. Treat a real dependency-installation failure as a blocker. Do not modify package files merely to bypass an environmental problem.
4. **Local validation.** Run one command at a time:

   ```powershell
   npm run blog:validate -- <article-path>
   node --test
   npm run typecheck
   npm run build
   npm run seo:links
   git diff --check
   ```

   Require the article validator, full Node tests, build, generated-link validation, and diff check to pass. Complete a typecheck-baseline comparison: the baseline must not worsen and no changed file may introduce a diagnostic.
5. **Generated route verification.** In generated output, complete generated route verification and blog-index verification: the article route exists, appears on `/blog/`, and is not excluded as a draft. Verify canonical URL, title, and meta description against the approved frontmatter; verify the hero loads, image alt and caption render, linked credit and licence/source URL render, internal article links resolve, and no public draft marker appears.
6. **XML sitemap verification.** Confirm `dist/sitemap-index.xml` exists, references each generated child XML sitemap, and the child XML sitemap contains the exact canonical article URL once. Confirm unpublished draft routes remain absent and `public/robots.txt` references `https://traditional-homes.gr/sitemap-index.xml`. Do not manually edit generated sitemap XML; Astro generates it during build.
7. **Local viewport review.** Review the generated public route at 390 × 844, 1440 × 900, and 1920 × 1080. Confirm no hero distortion, the approved subject remains visible, title/hero and body copy render correctly, caption/credit/source links are usable, and there is no horizontal overflow or console errors. Confirm one hero image request and no duplicate hero preload.
8. **Handoff documentation.** Add one concise factual publication note to `docs/agent-handoff-notes.md` stating the route, manual approval, image and attribution status, completed validation, preview status, remaining merge approval, and any excluded or deferred material. Do not claim checks that were not completed.
9. **Commit and push.** Commit only exact approved publication paths and the handoff note, then push the dedicated publication branch. Do not push directly to `main`.
10. **Draft publication PR.** Open a draft publication pull request that states the article and route, exact changes, manual-approval status, image-rights status, validation results, known typecheck baseline, generated-route result, sitemap result, pending checks, and no automatic publication or merge.
11. **Cloudflare Pages preview.** Wait for and inspect the Cloudflare Pages preview, the active deployment authority. Verify route and blog index, canonical/title/description, hero/alt/caption/credit, internal links, sitemap route, viewport checks, no console errors or horizontal overflow, one hero image request, and no duplicate preload. A known obsolete Cloudflare Workers build failure is non-blocking only when Cloudflare Pages succeeds, the Pages preview is correct, the Workers failure is confirmed as that obsolete integration, and there is no production Pages failure. Investigate unknown Workers failures.
12. **PR validation evidence.** Post one concise PR comment with the headings `## Final Validation`, `## Generated Route`, `## Sitemap XML`, `## Viewport Review`, `## Cloudflare Pages Preview`, `## Typecheck Baseline`, `## Exact Changed Files`, and `## Merge Readiness`.
13. **Human merge gate.** Do not merge automatically. After every check passes, require explicit user approval after checks before merging; confirm the PR head SHA has not changed unexpectedly and no unexpected files entered the PR; mark the PR ready for review; squash-merge only after explicit approval. Never use plain `--force`.
14. **Production verification.** After merge and production deployment, verify the canonical production route returns production HTTP 200; the article appears on `/blog/`; production sitemap-index and child sitemap contain the article; canonical, title, and description are correct; hero, alt, caption, and linked credit render; internal article links return successful responses; no draft exclusion remains; and no production console or rendering issue is visible. Record preview verification and production verification separately.

## Required Human Decisions

- Recorded manual editorial approval before the draft-state change.
- Approval of publication timing, exact file scope, and the draft publication PR.
- Explicit post-check merge approval before marking the PR ready and squash-merging.

## Validation

- Local validator, full Node tests, typecheck-baseline comparison, build, generated-link validation, and `git diff --check` pass.
- Generated route, blog-index, sitemap-index/child XML, robots sitemap reference, metadata, image attribution, links, and viewport/network checks pass.
- Cloudflare Pages preview passes before final PR evidence; production HTTP and sitemap verification pass after merge.

## Stop Conditions

Stop on any failed publication gate. Stop for missing approval; stale or unclear base; dirty or conflicting worktree; unexpected files; unsupported or unreviewed claims; missing topic brief or claims record; unclear image rights; incomplete attribution; failed `npm ci`; failed validator or tests; worsened typecheck baseline; failed build, generated-link check, or diff check; missing generated route, blog-index entry, or sitemap entry; duplicate sitemap URL; broken canonical, metadata, image credit, or links; failed viewport review; console errors; duplicate hero request or preload; failed Cloudflare Pages preview; missing explicit merge approval; or production verification failure. No automatic publication. No automatic merge.

## Commit and PR Rules

Use only the dedicated publication branch and exact approved paths. Open and keep the publication PR as a draft until all checks and the explicit human merge gate are satisfied. Do not push directly to `main`, force-push, auto-merge, or auto-publish.

## Required Final Report

Report approvals, exact file scope, draft-state change, dependency-install result, every validation and generated-output result, XML sitemap and robots result, viewport/network and Pages-preview results, PR validation evidence, merge approval still needed, and separate production verification after merge.
