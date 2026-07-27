---
name: blog-revise-draft
description: Revise an existing research-backed blog draft within an approved narrow scope while preserving its draft status.
---

# Blog Revise Draft

## Purpose

Make only approved revisions to an existing unpublished blog draft. This procedure does not publish, recover missing sources, or expand the article.

## Entry Conditions

- An existing article with `draft: true` and an exact approved revision scope.
- An existing topic brief and available research packet for the article.
- A dedicated working branch and a clean or explicitly scoped working tree.

## Required Reading

1. `AGENTS.md`, `CLAUDE.md`, and `BLOG_ORCHESTRATOR.md`.
2. `.ai/brand/website-brand-style-guide.md` and `.ai/prompts/blog-editorial-system.md`.
3. The article, its topic brief, `source-notes.md`, `sources.json`, and `claims.json`.
4. Relevant linked or closely related articles and `docs/operations/blog-production.md`.

## Allowed File Scope

Only the approved draft article, directly required tests or validator fixes, and required handoff documentation. Do not alter publication state, unrelated articles, research packets, public images, routes, or deployment files without new explicit approval.

## Ordered Procedure

1. Confirm the exact approved revision scope and record the baseline article frontmatter, including `draft: true`.
2. Ensure research packet read before editing; map every factual change to an existing verified claim and omit unsupported wording.
3. Make the smallest editorial or factual correction that satisfies the approved scope.
4. Preserve `draft: true`; keep the diff narrow and do not change image rights, attribution, or publication timing unless separately approved.
5. Run `npm run blog:validate -- <article-path>` and review the exact diff.
6. Run the repository tests required by the change, then `npm run typecheck` and `npm run build` when applicable. Compare typecheck output with the recorded baseline.

## Required Human Decisions

- Approval of the exact revision scope.
- Approval before any change to draft state, image rights, article scope, source recovery, or publication timing.

## Validation

- The verified-claim mapping supports every factual change.
- draft: true preserved.
- Article validation passes and the diff stays within the allowed file scope.
- Required repository checks do not introduce typecheck diagnostics beyond baseline.

## Stop Conditions

Stop for a missing research packet, unsupported factual change, unclear approval scope, a request for source recovery or article expansion, altered draft status, unexpected files, or any failed validation gate. No source recovery or article expansion unless requested.

## Commit and PR Rules

Use a dedicated branch and stage exact approved paths only. A revision PR remains a draft unless a human explicitly directs otherwise. Never auto-merge or publish.

## Required Final Report

Report the approved scope, files read and changed, verified-claim mapping, confirmation that `draft: true` preserved, validation results, remaining approval needed, and next allowed action.
