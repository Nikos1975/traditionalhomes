# Property Content Workspace Router

This workspace owns property facts and property-facing content for the houses and the villa. Route one stage at a time and load only that stage's declared Layer 3 references and Layer 4 working material.

The rule the workspace exists to enforce: facts have one authority; presentation may consume facts but must not become a second factual database.

## Ownership model

| Layer | What it owns | Where it lives |
| --- | --- | --- |
| Factual authority | capacity, bedrooms, bathrooms, area, floors, stairs, pool, view, parking, pets, wifi, kitchen, amenities, hard constraints, booking identifiers and per-property relations | `src/inventory/inventory.json`, one record per stable slug |
| Supporting structured authority | geo/map metadata and display tags, gallery order, shared UI copy, official groups, recommendation-only pairings | `src/data/locations.ts`, `src/data/gallery.json`, `src/data/siteCopy.json`, `src/inventory/groups.json`, `src/inventory/suggested-pairings.json` |
| Property content | English master prose and practical information, and its localizations | `src/content/houses/`, `src/content/villa/` |
| Presentation | renderers, components, SEO formatters and locale presentation mappings | `src/components/`, `src/i18n/inventory-display.ts` and equivalents |

Property content may express a canonical fact naturally, and may carry narrative detail that has no structured counterpart, but it never overrides the factual record. Presentation owns nothing factual: `src/i18n/inventory-display.ts` states this for locale rendering, and the default locale always renders the factual value verbatim.

## Route the task

| Requested outcome | Stage |
| --- | --- |
| Bounded change to property prose, practical information or property-facing presentation text, where the underlying facts are already established | `stages/01_content/CONTEXT.md` |
| Compare one property's factual record with its representations, investigate a suspected contradiction, or audit a property page | `stages/02_factual_audit/CONTEXT.md` |
| Change a canonical structured fact itself, on an explicit authoritative correction | `stages/03_fact_correction/CONTEXT.md` |

Three stages, because the permission boundary is the point of this workspace: Stage 01 may never write to the factual record, Stage 02 writes nothing at all by default, and Stage 03 is the only stage allowed to change canonical facts and cannot start without an explicit authoritative correction.

## Domains this workspace does not own

| Subject | Owner |
| --- | --- |
| Translating an existing property page, localized route behavior, or a locale rendering a fact differently from the English master | `.agents/workspaces/i18n/CONTEXT.md` |
| A renderer, component, layout or route displaying the wrong canonical value | `.agents/workspaces/site-engineering/CONTEXT.md` |
| Blog posts, village and area guides, historical articles and their research | `BLOG_ORCHESTRATOR.md` |
| Home, collection and location editorial copy that is not property-specific | `.ai/brand/website-brand-style-guide.md` with `.ai/prompts/website-editorial-system.md` |
| Search Console analysis, topic scoring, content-gap analysis, editorial SEO planning | `.agents/workspaces/seo-content-intelligence/CONTEXT.md`; such a recommendation is never evidence of a property fact |
| Ownership or architecture design decisions with no content editing authorized | the relevant file under `docs/architecture/` |

## Shared invariants

- Identify the property by its stable slug, never by a translated or displayed name.
- Never invent a property fact, and never infer a missing dimension, distance, capacity or amenity.
- Never convert an approximate fact into an exact one. Preserve qualifiers exactly: approximately, nearby, on request, shared, private, external, not step-free.
- Never drop a limitation to improve promotional copy, and never turn traditional or authentic positioning into luxury language.
- A translation mismatch is an i18n task and a renderer showing a wrong value is site engineering; neither is a canonical fact change.
- Locale resources and presentation mappings are never factual authority. Adding a value there without the factual record does nothing.
- Do not modify any property other than the one in scope.
- When two plausible authoritative records disagree, stop and report the conflict. Do not reconcile it silently in one copy.
- Known duplication is documented, not migrated: `docs/audits/repo-structure-audit-2026-06-09.md` already records where property facts are echoed outside the factual record. A data migration is a separate approved task.
- No merge, deploy, publication, push or force push is authorized by completing a stage.

## Known drift to record rather than repair

`.ai/prompts/website-editorial-system.md` names its structured sources as `inventory.json`, `locations.json` and `locationCopy.json`; the implemented files are `src/inventory/inventory.json`, `src/data/locations.ts` and `src/data/siteCopy.json`. The legacy `inventory copy.json` beside the factual record is an unreferenced backup, not an authority. Record such drift in the stage report; do not silently rewrite the reference or the data.

## Review boundaries

Auditing and editing are separate mental modes. Stage 02 produces a classified finding list and stops; it does not become a rewrite. Stage 01 does not become a factual correction because prose disagrees with the record. Stage 03 does not become a broad data refactor because one field was wrong.
