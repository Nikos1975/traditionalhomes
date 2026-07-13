# Codex Prompt: I18N Foundation

Repo:
`D:\_projects\_traditional-homes`

Goal:
Implement the Stage 1 i18n foundation without changing current public behavior.

Before editing:

- Read `AGENTS.md`.
- Read `CLAUDE.md`.
- Read `docs/i18n/00_I18N_MASTER_PLAN.md`.
- Read `docs/i18n/02_ROUTE_AND_FILE_STRUCTURE.md`.
- Inspect the current route files and shared layout/components.

Approved strategy:

- `defaultLocale: 'en'`
- `locales: ['en', 'de', 'fr', 'ru', 'zh', 'ar']`
- `routing.prefixDefaultLocale: true`
- Keep English at `/en/`.
- Keep current `/en/` behavior unchanged.

Task:

- Add i18n foundation helpers.
- Add English locale JSON files only.
- Update `Base.astro` `lang` and `dir` handling only if it is safe and does not change current English output unexpectedly.
- Convert Header/Footer strings only.
- Keep all current routes working.
- Do not create translated long-form content yet.
- Do not create `/de/`, `/fr/`, `/ru/`, `/zh/`, or `/ar/` route folders unless the implementation plan explicitly approves a minimal scaffold.

Rules:

- Do not translate the website yet.
- Do not change DNS.
- Do not touch Cloudflare variables.
- Do not touch Gmail/email setup.
- Do not change `functions/api/contact.js` behavior.
- Do not deploy.
- Do not commit or push without approval.

Validation:

- Run `git diff --check`.
- Run the build if source files changed.
- Show `git status --short`.
- Report any route, SEO, or contact-form risk before finishing.
