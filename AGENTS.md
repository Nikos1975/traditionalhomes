# Agent wrapper

Use `CLAUDE.md` as the canonical project instruction file.

For repository architecture, context loading, folder/workspace/stage design, and reusable workflow organization, follow the ICM route in `CLAUDE.md`. Do not force a fixed folder tree.

## Task routing

- Blog posts, area guides, village guides, historical articles, blog revisions, blog audits, publication, and blog-image work: read `BLOG_ORCHESTRATOR.md`, then only the routed skill and required references.
- Multilingual work: read `docs/i18n/00_I18N_MASTER_PLAN.md` before changing routes, pages, or translation files.
- Editorial work: use `.ai/brand/website-brand-style-guide.md` plus the one relevant editorial system: `.ai/prompts/website-editorial-system.md` for property/homepage/collection copy, or `.ai/prompts/blog-editorial-system.md` for blog/guide content.
- Process, commit, build, or debugging work: read `docs/operations/agent-operating-model.md` only when the task needs those rules. Read `docs/operations/repeated-failures-playbook.md` only after a matching failure or known failure class appears.
- Historical task context: search `docs/agent-handoff-notes.md` for the exact topic, slug, PR, or failure. Do not read the whole handoff archive by default.

When structural routes, sections, components, data flows, or user-facing flows change, follow the documentation update rules in `CLAUDE.md`.

Area guides follow the blog editorial system unless the task is explicitly property-page copy.

Do not duplicate these rules locally unless explicitly requested.
