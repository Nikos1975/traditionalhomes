# Stage 01 — I18N Infrastructure

One job: implement or validate the Astro multilingual infrastructure required by the requested scope. Do not perform broad translation in this stage.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/i18n/00_I18N_MASTER_PLAN.md` | approved multilingual intent and protected boundaries |
| L3 | `docs/i18n/02_ROUTE_AND_FILE_STRUCTURE.md` | route/rendering design reference |
| L3 | `docs/i18n/04_QA_CHECKLIST.md` | existing QA gates |
| L3 | `docs/architecture/source-of-truth.md` | factual/source ownership boundaries |
| L4 | user's requested locale/route scope | exact task |
| L4 | `src/i18n/route-map.ts` and relevant `src/i18n/*` | implemented route state |
| L4 | only the affected route wrappers, renderers, components, tests, and generated output | working material |

During the current migration, `src/i18n/route-map.ts` is authoritative for routes that actually exist when older planning text is stale. Record documentation drift instead of inferring new behavior.

## Process

1. Identify the smallest infrastructure change required.
2. Preserve English output and factual data ownership.
3. Keep route files thin and locale explicit; do not create a locale route without complete corresponding page support.
4. Keep canonical, hreflang, sitemap, fallback, and generated-link behavior tied to real routes only.
5. Do not translate long-form content beyond the minimum fixture text needed to prove infrastructure.

## Outputs

- exact source/test/doc changes required for the bounded infrastructure scope;
- a concise stage report containing base SHA, routes affected, files changed, validation, unresolved issues, and the next allowed stage.

## Verify

Run the smallest focused i18n tests first, then the repository tests required by the change, `npm run typecheck`, `npm run build`, `npm run seo:links`, and `git diff --check`. Compare typecheck against the known baseline.

## Stop conditions

Stop on factual-copy changes, phantom routes, unexpected files, English regression, duplicated inventory facts, worsened diagnostics, real build/test/link failures, or any requested merge/deploy/publication action without explicit approval.
