# Repository Context Router

Route the task before loading detailed project context. Load only the selected route plus the exact Layer 3 references and Layer 4 working files named there.

| Primary task | Load next |
| --- | --- |
| Multilingual translation, localization, locale SEO copy, visible-language QA | `.agents/workspaces/i18n/CONTEXT.md` |
| Multilingual routes, shared renderers, locale-aware components, canonical/hreflang/sitemap/llms infrastructure | `.agents/workspaces/i18n/CONTEXT.md` |
| Blog post, area/village guide, historical article, blog revision, content audit, publication, article visual plan, or blog image work | `BLOG_ORCHESTRATOR.md` |
| Property facts, factual correction, or property-page audit against the canonical inventory | `.agents/workspaces/property-content/CONTEXT.md` |
| Property page copy, practical property information, or property-facing presentation text | `.agents/workspaces/property-content/CONTEXT.md` |
| Website/home/collection/location editorial copy that is not property-specific | `.ai/brand/website-brand-style-guide.md` and `.ai/prompts/website-editorial-system.md` |
| General blog/guide editorial judgment | `.ai/brand/website-brand-style-guide.md` and `.ai/prompts/blog-editorial-system.md` |
| Search Console acquisition, SEO performance analysis, query/page analysis, SEO opportunity scoring, content-gap or content-overlap analysis, SEO recommendation planning, or reassessing an older SEO report against current evidence | `.agents/workspaces/seo-content-intelligence/CONTEXT.md` |
| Social publication preparation, platform drafts, or social publication status for an already-published article | `.agents/workspaces/social-publishing/CONTEXT.md` |
| Explicit approval, live publication, or reconciliation of an unknown social publication outcome | `.agents/workspaces/social-publishing/CONTEXT.md` |
| Astro/UI/site implementation, shared UI behavior, Tailwind/CSS, client-side behavior, forms, non-i18n routes, image-delivery integration | `.agents/workspaces/site-engineering/CONTEXT.md` |
| Build, runtime, browser, type or test-regression debugging, including Windows cache and repeat-failure handling | `.agents/workspaces/site-engineering/CONTEXT.md` |
| Inspect Cloudflare configuration or deployment state, prepare a deployment or Cloudflare configuration change, or diagnose a Cloudflare Pages operational issue | `.agents/workspaces/operations-deployment/CONTEXT.md` |
| Deploy an approved revision, update approved Cloudflare production configuration, or verify a completed production deployment | `.agents/workspaces/operations-deployment/CONTEXT.md` |
| Architecture/source-of-truth/media/slug decision with no implementation or content editing authorized yet | the relevant file under `docs/architecture/` |

## Routing rules

- Choose one primary route. Supporting validation does not create a second workflow.
- For mixed multilingual work, run infrastructure first, stop at its review boundary, then run translation.
- Do not load all of `docs/`, `.ai/`, `.agents/skills/`, or historical handoff material by default.
- If the task does not fit a route cleanly, inspect the smallest relevant architecture/operations reference and stop if scope remains ambiguous.
- Property facts have one authority; content, translations, components and SEO analysis consume them and never redefine them.
- Google Search Console is the authoritative source for current organic-search performance. SEO evidence may recommend a change; it never authorizes the change, and an older SEO report is never current truth.
- Site engineering consumes property facts, media rules and i18n contracts but never becomes their authority; it does not absorb SEO/content-intelligence, social publication, or deployment operations.
- Social publication has one owner. Preparation, approval, live publication and reconciliation are separate permissions there, and completing one never authorizes the next.
- Deployment and Cloudflare operations have one owner. Inspecting, preparing, applying and verifying are separate permissions there, and no production mutation is ever inferred from a review, a prepared change, a passing test, a successful build or a merged commit.
- Existing project-local publication and approval controls remain authoritative and must not be bypassed by this router.
- Before editing a requested artifact, determine whether it is the authoritative edit source or a derived/generated product. If derived, route the edit to the owning source and use the existing derivation path; do not hand-edit the product to repair its source. If the edit source cannot be established, stop and report. See `docs/operations/edit-source-principle.md`.

## Current continuity

Current repository state — baseline, working-tree preservation, active owners, known diagnostics and planned work — is recorded in `docs/handoff/current.md`. Read it for continuity, not for authorization: it routes no task and never overrides this router or a workspace stage contract.

Local run provenance is written by `scripts/context/icm-run.mjs` into the untracked
directory .agent/icm/. Those records are local evidence only: they document what a
run observed and never authorize an edit, merge, push, deployment or publication.

`docs/agent-handoff-notes.md` is the historical archive. It is not startup context and is loaded only when a specific historical question requires it.
