# Stage 02 — Translation

One job: produce or validate a complete natural localization for routes that the infrastructure already supports. Do not redesign multilingual infrastructure in this stage.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `.agents/skills/traditional-homes-i18n-translation/SKILL.md` | project-local localization procedure |
| L3 | `docs/i18n/01_TRANSLATION_STYLE_GUIDE.md` | translation tone and factual-parity rules |
| L3 | `docs/i18n/03_TRANSLATION_STATUS.md` | current locale/scope status and known review items |
| L3 | `docs/i18n/04_QA_CHECKLIST.md` | existing QA gates |
| L3 | `.ai/brand/website-brand-style-guide.md` | public-facing tone when relevant |
| L4 | approved English source for the exact page/scope | factual and substantive master |
| L4 | current target-locale content/resources | working translation |
| L4 | current generated target-locale HTML and relevant tests | visible-language QA |
| L4 | Stage 01 report when this run required infrastructure first | reviewed handoff |

## Process

1. Read the translation skill and only the target-locale reference relevant to this task.
2. Confirm the target route already exists and is explicitly supported.
3. Translate from the approved English source only.
4. Preserve facts, qualifications, cautions, names, and uncertainty; do not add claims.
5. Localize title/meta/H1 and reusable display language naturally for the target audience without changing factual meaning.
6. Ensure substantive visible text is in the target language. Proper names, brands, airport codes, URLs, and explicitly marked English fallback links may remain unchanged.
7. If an English fact appears wrong or outdated, stop and record a proposed cross-language correction instead of fixing only this locale.

## Outputs

- target-locale content/resource changes for the approved scope;
- a concise stage report containing English source paths, target paths, Layer 3 references loaded, Layer 4 inputs loaded, files changed, terminology decisions, validation, unresolved facts, and the next allowed action.

## Verify

Run focused localization/output checks, relevant i18n tests, `npm run typecheck`, `npm run build`, `npm run seo:links`, the skill's localized-output validator, and `git diff --check`. Confirm canonical/hreflang remain correct and that visible server-rendered text has no unintended English leakage.

## Stop conditions

Stop if the route does not exist, the English source is ambiguous, a factual correction is required, translation would duplicate structured inventory facts, unexpected files appear, English output changes, validation worsens, or merge/deploy/publication is requested without explicit approval.
