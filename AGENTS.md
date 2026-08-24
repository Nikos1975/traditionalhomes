# Agent wrapper

Use `CLAUDE.md` as the canonical project instruction file.

For repository architecture, context loading, folder/workspace/stage design, and reusable workflow organization, always apply ICM reasoning from `.agents/skills/icm-workspace-architect/ICM_RULES.md`. Do not force a fixed folder tree.

For every blog post, area guide, village guide, historical article, blog revision, blog audit, publication, or blog-image task, read `BLOG_ORCHESTRATOR.md` before researching, drafting, editing, validating, processing media, or publishing.

For all multilingual work, follow docs/i18n/00_I18N_MASTER_PLAN.md before changing routes, pages, or translation files.

When structural routes, sections, components, data flows, or user-facing flows change, follow the documentation update rules in `CLAUDE.md`.

See `docs/operations/agent-operating-model.md` and `docs/operations/repeated-failures-playbook.md` for process rules and known failure handling.

For editorial work:
- `.ai/brand/website-brand-style-guide.md` is the shared tone source
- property pages / homepage / collection copy use `.ai/prompts/website-editorial-system.md`
- blog posts / area guides / village guides use `.ai/prompts/blog-editorial-system.md`

Area guides follow the blog editorial system unless the task is explicitly property-page copy.

Do not duplicate these rules locally unless explicitly requested.
