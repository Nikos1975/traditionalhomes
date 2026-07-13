# Codex Prompt: Translate One Language

Repo:
`D:\_projects\_traditional-homes`

Language:
`<target language>`

Locale code:
`<de|fr|ru|zh|ar>`

Scope:
`<page, section, or content collection>`

Goal:
Translate one approved language scope from the English source only.

Before editing:

- Read `AGENTS.md`.
- Read `CLAUDE.md`.
- Read `docs/i18n/00_I18N_MASTER_PLAN.md`.
- Read `docs/i18n/01_TRANSLATION_STYLE_GUIDE.md`.
- Read `docs/i18n/03_TRANSLATION_STATUS.md`.
- Read `docs/i18n/04_QA_CHECKLIST.md`.
- Read the English source files for the requested scope.

Translation rules:

- Translate from English source only.
- Preserve facts exactly.
- Preserve slugs.
- Preserve property names unless an approved naming rule says otherwise.
- Do not invent amenities, distances, access details, views, square metres, history, exclusivity, or suitability claims.
- Do not add luxury exaggeration.
- Do not add generic tourist language.
- Keep the tone clear, quiet, accurate, and hospitality-oriented.
- Report unclear English phrases instead of guessing.
- Keep gallery image paths shared.

Implementation rules:

- Work on one locale only.
- Work on the requested scope only.
- Keep `/en/` behavior unchanged.
- Keep contact form behavior unchanged.
- Do not change DNS.
- Do not touch Cloudflare variables.
- Do not touch Gmail/email setup.
- Do not change `functions/api/contact.js` behavior.
- Do not deploy.
- Do not commit or push without approval.

Validation:

- Run `git diff --check`.
- Run the relevant build/check command for the changed files.
- Run the relevant parts of `docs/i18n/04_QA_CHECKLIST.md`.
- Show `git status --short`.

Final report:

- Files changed.
- Translation scope completed.
- Any unclear phrases or facts needing owner confirmation.
- QA checklist results.
- Confirmation that slugs, facts, contact behavior, DNS, Cloudflare variables, email setup, deploy, commit, and push were not changed.
