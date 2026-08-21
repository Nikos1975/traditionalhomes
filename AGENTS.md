# Agent Wrapper

`CLAUDE.md` is the Layer 0 project identity and global-invariant file.

After reading it, read `CONTEXT.md` and route the task before loading detailed instructions.

## Important routes

- Multilingual translation or Astro i18n infrastructure: `.agents/workspaces/i18n/CONTEXT.md`.
- Blog, guide, historical article, blog audit, publication, article visual-plan, or blog-image work: `BLOG_ORCHESTRATOR.md`.
- Property facts, property-page copy, factual corrections and property audits: `.agents/workspaces/property-content/CONTEXT.md`.
- Editorial work: use the exact brand/editorial source selected by `CONTEXT.md`.
- General Astro/UI/site implementation and build, runtime, browser, type or regression debugging: `.agents/workspaces/site-engineering/CONTEXT.md`.
- Search Console evidence, SEO performance/overlap/content-gap analysis and SEO recommendation planning: `.agents/workspaces/seo-content-intelligence/CONTEXT.md`.

Do not load unrelated skills, the entire docs tree, `.ai/memory/current-task.md`, or the full historical `docs/agent-handoff-notes.md` by default.

Project-local safety, publication, merge, deploy, source-of-truth, and validation controls take precedence over generic/external workflows.
