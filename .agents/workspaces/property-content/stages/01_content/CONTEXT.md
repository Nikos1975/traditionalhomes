# Stage 01 — Property Content Change

One job: make one bounded change to a single property's prose, practical information or property-facing text, where the underlying facts are already established. This stage never writes to the factual record.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `.ai/prompts/website-editorial-system.md` | section rules, output types and the source-of-truth hierarchy |
| L3 | `.ai/brand/website-brand-style-guide.md` | voice, language to avoid, practical honesty |
| L3 | `docs/architecture/source-of-truth.md` | factual ownership boundary |
| L3 | `docs/content-audit-property-pages-checklist.md` | the repository's own property-page rules |
| L3 | `docs/architecture/media-ownership.md` | only when an image reference or alt text changes |
| L4 | the approved scope and the property's exact stable slug | exact task |
| L4 | only that property's record in `src/inventory/inventory.json` | factual authority for this change |
| L4 | only the exact content file under `src/content/houses/` or `src/content/villa/` | working material |
| L4 | only the exact supporting record actually in question, such as that property's entry in `src/data/locations.ts` | bounded comparison |
| L4 | only the exact focused test files covering the changed text | regression scope |

Do not load all of `src/inventory/`, every property Markdown file, all translations, all components, all tests or all of `docs/`.

## Process

1. Confirm the approved scope and resolve the property to its stable slug.
2. Load that property's factual record, then read only the content file in scope.
3. Load editorial guidance only when the change is prose rather than a mechanical correction.
4. Make the smallest change that satisfies the approved scope.
5. Check every factual statement in the changed text against the factual record. A statement the record does not support is removed, softened or flagged for confirmation, never invented and never sharpened.
6. Preserve every qualifier and limitation. If the change would drop one, stop.
7. If content and the factual record disagree, do not edit either to match the other; route the disagreement to `.agents/workspaces/property-content/stages/02_factual_audit/CONTEXT.md`.
8. Validate and review the diff.

## Outputs

- the bounded content change for one property, and nothing else;
- a stage report naming base SHA, property slug, files changed, each factual statement touched with the record field that supports it, Layer 3 references loaded, validation results, and anything flagged for confirmation.

## Verify

Re-read the changed text against that property's factual record field by field. Run the focused tests covering that property's content, then `node --test` for the affected test families. Confirm no other property, no translation, no component and no structured record changed. Finish with `git diff --check` and an explicit changed-file list, staging explicit paths only when the task authorizes a commit.

## Stop conditions

Stop on a factual statement the record does not support, a content-versus-record disagreement, a request to sharpen an approximate value, a request to remove a limitation for promotional reasons, any change that would touch `src/inventory/inventory.json`, work that really belongs to i18n or site engineering, a second property entering scope, or any requested merge, deploy, publication, push or force push.
