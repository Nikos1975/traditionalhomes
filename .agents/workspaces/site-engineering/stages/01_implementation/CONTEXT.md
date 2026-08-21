# Stage 01 — Site Implementation

One job: implement one approved, bounded change to non-i18n site code and prove it. Do not redesign the surrounding area, refactor unrelated code, or repair unrelated diagnostics in this stage.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/operations/agent-operating-model.md` | instruction hierarchy, task classification, commit and stop rules |
| L3 | `docs/architecture/repo-wireframe.md` | where each kind of site code lives |
| L3 | `docs/operations/repeated-failures-playbook.md` | known repository failure patterns, loaded when validation hits one |
| L3 | `.ai/brand/website-brand-style-guide.md` | only when visible brand surface or user-facing copy is implemented |
| L3 | `docs/architecture/media-ownership.md` | only when image placement or delivery changes |
| L3 | `docs/architecture/source-of-truth.md` | only when the change consumes property facts |
| L3 | `docs/operations/generated-site-link-validation.md` | only when internal links or generated output change |
| L4 | the approved behavior statement and its scope boundary | exact task |
| L4 | only the exact affected files under `src/components/`, `src/layouts/`, `src/pages/`, `src/styles/`, `src/utils/`, `src/data/` or `functions/` | working material |
| L4 | the exact existing shared component, renderer or helper the change must reuse | reuse target |
| L4 | only the exact focused test files covering the changed behavior | regression scope |
| L4 | the branch-base validation baseline for exactly the checks this change requires | comparison |

Load an optional Layer 3 row only when the task actually involves it. Do not load all of `src/`, all of `tests/`, or all of `docs/`; the affected files are selected at task time as Layer 4.

## Process

1. Restate the approved behavior and the scope boundary. If the behavior is not decided yet, this is a class C architecture request; stop instead of editing source.
2. List the exact affected source and test files before editing anything.
3. Inspect the existing shared pattern for this surface and reuse it instead of duplicating markup or logic.
4. Read property facts from the factual source instead of hard-coding a duplicate value in a component.
5. Implement the smallest change compatible with current behavior, existing routes, and the static-first architecture.
6. Add or update focused tests for the changed behavior.
7. Validate.
8. Review the diff file by file and confirm nothing outside the declared scope changed.

## Outputs

- the bounded source and test change, and nothing else;
- a stage report naming base SHA, request class, exact files changed, Layer 3 references loaded, Layer 4 files inspected, tests added or updated, validation results, and anything deliberately left unrepaired.

## Verify

Run the focused tests for the changed behavior first, then `node --test` for the affected test families. When runtime or build-sensitive source changed, also run `npm run build` and `npm run typecheck`, and compare the diagnostics against the branch-base baseline rather than assuming a fixed count; pre-existing diagnostics stay as they are and unrelated ones must not be repaired here. Finish with `git diff --check`, an explicit changed-file list, and explicit path staging only if the task authorizes a commit.

## Stop conditions

Stop on an undecided behavior, an unexpected or unrelated modified file, a source-of-truth conflict, an unsupported factual claim, a required change to i18n route or renderer contracts, a change that would alter production deployment or Cloudflare configuration, a proposed new dependency for a small problem, a real test or build failure outside the approved scope, or any requested merge, deploy, publication, push or force push.
