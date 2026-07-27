---
name: blog-publication
description: Prepare a human-approved blog draft for controlled publication review without automatic merge or publication.
---

# Blog Publication

## Purpose

Move a reviewed draft through final validation and a publication pull request. Publishing remains a human-approved action; this skill never auto-merges.

## Entry Conditions

- Recorded manual editorial approval and draft content already reviewed.
- Confirmed image ownership or licence and attribution.
- An existing research packet, verified claims record, and an unpublished draft.
- A dedicated publication branch based on current `origin/main` and an exact approved file scope.

## Required Reading

1. `AGENTS.md`, `CLAUDE.md`, `BLOG_ORCHESTRATOR.md`, and `docs/operations/blog-production.md`.
2. The approved draft, topic brief, source notes, sources, claims, run summary, and final editorial approval record.
3. Image ownership/licence and attribution records, related articles, and the relevant index/sitemap implementation.

## Allowed File Scope

Only the approved article frontmatter/body, its approved public image and attribution references, required tests or validation fixes, and required handoff documentation. Stop if the diff contains unrelated content, research packets, routes, or deployment changes.

## Ordered Procedure

1. Confirm recorded manual editorial approval, reviewed draft content, verified claims, image ownership/licence and attribution, dedicated publication branch, and exact file scope.
2. Change only the approved draft-state field from `draft: true` to `draft: false`; do not revise article scope or recover sources during publication.
3. Run `npm run blog:validate -- <article-path>`.
4. Run `node --test`, then compare `npm run typecheck` against the recorded typecheck baseline, run `npm run build`, and run `npm run seo:links`.
5. Complete route, blog-index, and sitemap verification in generated output. Review the generated article on mobile and desktop.
6. Deploy or inspect the Cloudflare Pages preview and verify the approved route, metadata, image, index, and sitemap there.
7. Open a publication pull request with the exact approved scope. Do not merge automatically; merge requires the user's explicit approval after the checks.
8. After the human-approved merge, perform production verification of the route, blog index, sitemap, metadata, images, and links; report any discrepancy immediately.

## Required Human Decisions

- Recorded manual editorial approval before draft-state change.
- Approval of final file scope, publication timing, and the publication pull request.
- Explicit user approval after checks before merging; no automatic merge.

## Validation

- Article validation, repository tests, typecheck-baseline comparison, build, and generated-link validation pass.
- Route, blog-index, sitemap, mobile and desktop review, and Cloudflare Pages preview are verified.
- Production verification after merge is recorded separately from preview validation.

## Stop Conditions

Stop on any failed publication gate: absent approval, unreviewed draft, unsupported claim, missing image ownership/licence or attribution, branch/scope mismatch, failed validation, missing generated output, failed preview, or missing explicit merge approval. No automatic publication and no automatic merge.

## Commit and PR Rules

Use only the dedicated publication branch. Stage exact approved paths, commit only after all pre-PR gates pass, and open the publication PR. Do not merge or publish automatically.

## Required Final Report

Report approval records, exact file scope, draft-state change, all validation results, route/index/sitemap and device-review results, preview result, publication PR, merge approval still needed, and production verification after merge.
