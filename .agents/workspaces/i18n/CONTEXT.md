# I18N Workspace Router

This workspace governs multilingual implementation for `traditional-homes.gr`. Route one primary stage and load only that stage's declared inputs.

## Route the task

| Requested outcome | Stage |
| --- | --- |
| Add/change locale routes, route-map entries, shared page renderers, locale-aware component behavior, fallback rules, canonical/hreflang, sitemap, or `llms.txt` infrastructure | `stages/01_infrastructure/CONTEXT.md` |
| Translate/localize an already-supported route, including UI copy, long-form copy, title/meta/H1, terminology, and visible-language completeness | `stages/02_translation/CONTEXT.md` |
| Both infrastructure and translation are required | Run Stage 01 first, stop for review, then Stage 02 |
| A factual correction to the English master is required | Stop and record it as a cross-language correction; do not fix one locale independently |

## Shared invariants

- English is the verified factual master unless an explicitly approved cross-language correction changes the source.
- `src/inventory/inventory.json` remains the factual property source of truth.
- Stable internal identities are separate from locale-specific public URLs.
- Non-default locale routes are explicit and fail closed; do not invent or infer public routes.
- Do not add phantom locale URLs, automatic browser/IP redirects, client-side machine translation, or a second factual inventory.
- Preserve `/en/` behavior except for reciprocal multilingual infrastructure that does not change rendered English content.
- Current implementation in `src/i18n/route-map.ts` is authoritative for which localized routes actually exist. If older planning docs conflict with implemented route facts, do not guess; use the implementation for current state and flag the documentation drift for the reference-cleanup phase.
- No merge, deploy, or publication is authorized merely by completing a stage.

## Review boundaries

Stage 01 and Stage 02 are separate mental modes. Do not combine renderer/route architecture work with broad translation in one undifferentiated pass. Each stage must leave a reviewable result before the next stage begins.
