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
| Astro/UI/site implementation, shared UI behavior, Tailwind/CSS, client-side behavior, forms, non-i18n routes, image-delivery integration | `.agents/workspaces/site-engineering/CONTEXT.md` |
| Build, runtime, browser, type or test-regression debugging, including Windows cache and repeat-failure handling | `.agents/workspaces/site-engineering/CONTEXT.md` |
| Architecture/source-of-truth/media/slug decision with no implementation or content editing authorized yet | the relevant file under `docs/architecture/` |

## Routing rules

- Choose one primary route. Supporting validation does not create a second workflow.
- For mixed multilingual work, run infrastructure first, stop at its review boundary, then run translation.
- Do not load all of `docs/`, `.ai/`, `.agents/skills/`, or historical handoff material by default.
- If the task does not fit a route cleanly, inspect the smallest relevant architecture/operations reference and stop if scope remains ambiguous.
- Property facts have one authority; content, translations, components and SEO analysis consume them and never redefine them.
- Site engineering consumes property facts, media rules and i18n contracts but never becomes their authority; it does not absorb SEO/content-intelligence, social publication, or deployment operations.
- Existing project-local publication and approval controls remain authoritative and must not be bypassed by this router.
