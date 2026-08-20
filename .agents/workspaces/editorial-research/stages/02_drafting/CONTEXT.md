# Stage 02 — Drafting

One job: turn a reviewed research packet into a reviewable unpublished article draft. Do not perform open-ended research or publication work in this stage.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `.agents/skills/blog-research-article/SKILL.md` | canonical article-drafting procedure and validation |
| L3 | `.ai/brand/website-brand-style-guide.md` | public voice and positioning |
| L3 | `.ai/prompts/blog-editorial-system.md` | article structure and editorial rules |
| L3 | `docs/operations/blog-production.md` | run state, scope and draft safeguards |
| L3 | `src/content.config.ts` | allowed article frontmatter contract |
| L4 | reviewed topic brief and exact research packet | factual/substantive source for the draft |
| L4 | verified/qualified claims register and bibliography | evidence boundary |
| L4 | exact related articles required for overlap/internal-link decisions | site-context boundary |
| L4 | approved owned/licensed image material when present | article media only within documented rights |

## Process

1. Confirm Stage 01 is complete or that an equivalent reviewed research packet already exists.
2. Read only the exact packet, related pages and references required by the topic.
3. Map each substantive article section to supported claims before drafting.
4. Draft from verified claims. Use qualified claims only with the same qualification; omit rejected/unresolved claims.
5. Preserve the topic's geographic scope and distinct angle. Do not widen the piece into generic destination history.
6. Follow the site's calm, factual, non-promotional voice; no luxury framing, hype or booking pressure.
7. Keep new articles `draft: true` until manual approval.
8. Add sources/image credits where required and only use media with clear rights/attribution status.
9. Run the canonical article validation and repository checks required by the routed skill.
10. Review the exact diff and keep the change inside the approved article/research scope.

## Outputs

- one research-backed article draft at the approved target path;
- only directly required supporting research/validation updates;
- concise stage report with evidence packet used, claim/section mapping, files changed, validation results, unresolved items and next allowed action.

## Verify

Run the checks required by `.agents/skills/blog-research-article/SKILL.md`, including article validation, relevant tests, typecheck comparison to baseline, build and exact diff review. Confirm `draft: true`, required sources, internal links and media rights.

## Stop conditions

Stop if the research packet is missing/incomplete, a material claim lacks support, new open-ended research is required, the draft would expand beyond the approved angle, image rights are unclear, draft state changes unexpectedly, unrelated files appear, validation worsens, or merge/publication/deployment is requested without explicit approval. Route new evidence work back to Stage 01.
