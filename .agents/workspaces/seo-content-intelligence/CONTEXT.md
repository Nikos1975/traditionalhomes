# SEO and Content Intelligence Workspace Router

This workspace owns Search Console evidence, SEO analysis and SEO recommendation for the production site. Route one stage at a time and load only that stage's declared Layer 3 references and Layer 4 working material.

The rule the workspace exists to enforce: SEO evidence may recommend a change. It does not authorize the change.

## Authority model

| Question | Authority | Where it lives |
| --- | --- | --- |
| Current organic query and page performance | Google Search Console, acquired or imported through the repository tooling | validated datasets under `data/content-intelligence/search-console/processed/` |
| Whether evidence is valid and safely combinable | property, export shape, dimensions, provenance and evidence period, enforced by the analyser rather than restated here | `docs/content-intelligence/search-console.md`, `scripts/content-intelligence/gsc-analysis.mjs` |
| Which URLs are production, draft, redirecting or non-production | the deterministic site inventory and the exact redirect records | `scripts/content-intelligence/inventory.mjs`, `public/_redirects` |
| Property capacity, amenities, distances and constraints | the canonical property record | `.agents/workspaces/property-content/CONTEXT.md` with `src/inventory/inventory.json` |
| Evidence standards, qualified wording and the human editorial gate | editorial policy | `docs/content-intelligence/editorial-policy.md` |

Google Search Console is the authoritative source for current organic-search performance. Intuition, generic SEO advice, keyword tools alone, older reports, model estimates, content length, title wording and search-result snippets are not. External SERP or keyword research may supplement first-party evidence; it never overwrites it. A historical or third-party SEO report is an evidence input to be reassessed, never current truth.

## Route the task

| Requested outcome | Stage |
| --- | --- |
| Acquire, import, inspect or validate Search Console evidence, establish a baseline, or decide whether two datasets can safely be combined | `stages/01_evidence/CONTEXT.md` |
| Turn already-validated evidence into reproducible findings: query and page ownership, overlap, gap support, or whether an older SEO report still matches current evidence | `stages/02_analysis/CONTEXT.md` |
| Convert verified findings into bounded, reviewable recommendations and name the workspace that would own each implementation | `stages/03_recommendation/CONTEXT.md` |

Three stages, because each one is a real permission boundary. Stage 01 is the only stage that may use credentials, reach the network, or write anything at all, and it writes only to the approved evidence location. Stage 02 writes nothing and reads validated evidence only. Stage 03 produces a recommendation record and never implements it.

## Decision safeguards

- No automatic new URL. A new article or page URL requires evidence that existing content does not already satisfy the intent, that overlap has been reviewed, and that the angle is materially distinct.
- No automatic redirect. A 301 requires Search Console evidence, indexation and canonical evidence where relevant, backlink evidence where relevant, a preservation analysis, and a statement of what content would be lost or retained.
- No thin-content claim from length alone. A short page is not thin. Judge intent, query coverage, entities, headings, uniqueness, internal links and evidence together.
- No SEO-only fact creation. SEO analysis never invents a distance, amenity, price, opening hour, historical claim or local fact. Facts stay with their owner.
- No keyword-volume claim without an actual approved data source behind it.
- No generic SEO checklist as evidence. Generic advice may be context; it is never proof of a defect on this site.
- Preserve current success. An established ranking page is not substantially rewritten because a different theoretical structure looks cleaner.

## Overlap is a decision aid

Multiple ranking URLs are an observation, not a diagnosis. Classify overlap as same intent or duplicate, partially overlapping, supporting article, pillar and support, same geography but different intent, historical versus practical, or property versus destination content. Overlap alone never means delete, merge, redirect, rewrite or noindex, and it blocks a new article only where the repository's own overlap rules support that conclusion.

## Domains this workspace does not own

| Subject | Owner |
| --- | --- |
| Writing, revising, consolidating or auditing an article or guide, and researching a genuinely new one | `BLOG_ORCHESTRATOR.md` with `.agents/workspaces/editorial-research/CONTEXT.md` |
| Property page content, and any change to a property fact | `.agents/workspaces/property-content/CONTEXT.md` |
| Route, component, template, title/meta implementation, canonical or redirect implementation | `.agents/workspaces/site-engineering/CONTEXT.md` |
| Localized SEO, hreflang, locale canonical and sitemap infrastructure, localized titles and meta | `.agents/workspaces/i18n/CONTEXT.md` |
| Deployment, Cloudflare account, DNS and edge redirect administration | no ICM workspace yet; stop and report |
| Social publication workflows | no ICM workspace yet; stop and report |

Consuming a fact, a route or an editorial contract is allowed. Becoming its authority is not.

## Shared invariants

- Name the exact Search Console property and the exact evidence period before any claim about performance. Unstated coverage is a stop condition, not a default.
- Never restate acquisition, compatibility or aggregation logic here. The tooling enforces it; this workspace routes to it.
- Search Console credentials, tokens and account identifiers are operational inputs. They never enter a Markdown context file, a report, a commit or a pull request.
- Raw exports, processed datasets and generated analysis under `data/content-intelligence/search-console/` are private local evidence. Do not paste them into tracked documentation.
- Distinguish evidence from interpretation in every output. An observation and a conclusion are never written as the same sentence.
- A redirecting legacy URL never becomes the recommended page because an old report names it, and a draft article never becomes a production target.
- Do not modify production source, content, translations, inventory, routes, redirects or SEO algorithms from this workspace. Record a suspected tooling defect instead of repairing it here.
- No merge, deploy, publication, push or force push is authorized by completing a stage.

## Review boundaries

Evidence, analysis and recommendation are separate mental modes. Stage 01 does not interpret what it acquired. Stage 02 stops at findings and does not slide into recommending implementation unless Stage 03 is explicitly requested. Stage 03 hands an approved recommendation to its owning workspace and stops there.
