# Stage 03 — Canonical Fact Correction

One job: change a canonical structured property fact on an explicit authoritative correction, and leave every representation consistent with it. This is the only stage permitted to write to the factual record.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/architecture/source-of-truth.md` | ownership boundary and conflict rule |
| L3 | `src/inventory/AGENTS.md` | inventory data rules |
| L3 | `docs/operations/agent-operating-model.md` | task classification, commit and stop rules |
| L3 | `docs/content-audit-property-pages-checklist.md` | how a corrected fact must read on the page |
| L4 | the exact authoritative correction as given, and who gave it | authority for the change |
| L4 | only the affected property's record in `src/inventory/inventory.json` | the field being corrected |
| L4 | only the exact representations that restate the corrected field for that property | consistency scope |
| L4 | only the exact focused tests covering the corrected field | regression scope |

## Process

1. Confirm the correction is an explicit authoritative owner correction, not an inference, a search result, an SEO recommendation, or prose that merely disagrees. If it is not, stop.
2. Identify the canonical field that must change and correct the factual record first.
3. Establish which representations derive the value automatically and which restate it. Update only those that restate it; never hand-copy a value into a surface that should derive it.
4. Leave localized surfaces to i18n and renderer defects to site engineering. Name the follow-up instead of doing it here.
5. Never update a visible page while leaving the factual record stale, and never the reverse.
6. If the correction implies a wider data change, record the scope and stop. A broad migration is a separate approved task.
7. Validate and review the diff.

## Outputs

- the corrected canonical field, plus only the representations that restate it;
- a stage report naming base SHA, property slug, field, previous and corrected value, the authority for the correction, every surface checked, surfaces deliberately left to another owner, and validation results.

## Verify

Re-read the corrected record and every representation in scope. Run the focused tests for that field, then `node --test` for the affected test families. The factual record is build-sensitive, so also run `npm run build` and `npm run typecheck` and compare the diagnostics with the branch-base baseline; unrelated pre-existing diagnostics stay unrepaired. Finish with `git diff --check` and an explicit changed-file list.

## Stop conditions

Stop on a correction without a named authority, two authoritative records disagreeing, a field whose ownership is unclear, a correction that would require a broad data migration, an attempt to fix only the visible page or only the record, unrelated diagnostics appearing, or any requested merge, deploy, publication, push or force push.
