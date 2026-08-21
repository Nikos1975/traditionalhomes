# Stage 02 — Property Factual Audit

One job: compare one property's factual record with how it is represented, classify every difference, and report. Read-only by default: this stage does not edit content or data.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/architecture/source-of-truth.md` | which source wins |
| L3 | `docs/content-audit-property-pages-checklist.md` | established property-page audit rules |
| L3 | `src/inventory/AGENTS.md` | inventory data rules, official groups versus recommendation-only pairings |
| L3 | `docs/audits/repo-structure-audit-2026-06-09.md` | already-recorded duplication and the unreferenced legacy inventory backup |
| L3 | `.ai/brand/website-brand-style-guide.md` | only when classifying an unsupported promotional claim |
| L4 | the exact property under audit, by stable slug | audit target |
| L4 | only that property's record in `src/inventory/inventory.json` | factual authority |
| L4 | only that property's exact English master content file | representation under audit |
| L4 | only the exact derived surfaces in question, such as that property's entry in `src/data/locations.ts` or its mapping in `src/i18n/inventory-display.ts` | bounded comparison |
| L4 | only the exact localized content file when a locale is explicitly part of the audit scope | bounded comparison |

Do not audit every property at once. Widen the comparison only when the requested audit genuinely requires it, and say so in the report.

## Process

1. Fix the audit boundary: one property, and which representations are in scope.
2. Read the factual record first, before any prose.
3. Read the English master content, then only the derived surfaces in scope.
4. Compare field by field and classify every difference as consistent, presentation difference only, missing from presentation, stale presentation value, canonical source conflict, unsupported claim, or unclear authority requiring a human decision.
5. For each finding name the field, the authority, each representation's value, and the classification.
6. Separate narrative-only detail that has no structured counterpart from a contradiction. Absence from the record is not a contradiction.
7. Report without editing. A genuine canonical source conflict stops here and is never resolved automatically.
8. Remediation, if approved later, is a separate Stage 01 content change or Stage 03 fact correction with its own scope.

## Outputs

- a read-only finding list, one row per compared field, with authority, representation values and classification;
- the conflicts that need a human decision, stated as a decision rather than as a change to apply silently;
- the audit boundary and anything deliberately not compared;
- no file change by default.

## Verify

Confirm every finding names its field and its authority, that no classification silently upgrades a narrative-only detail into a contradiction, and that the working tree is unchanged. Run read-only checks only; `git status --short` must show no new modification produced by this stage.

## Stop conditions

Stop on an unclear audit boundary, a canonical source conflict, two plausible authorities disagreeing, a missing property record, a request to fix findings inside the audit, or any requested merge, deploy, publication, push or force push. Do not convert an audit into a rewrite.
