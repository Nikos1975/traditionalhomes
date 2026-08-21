# Stage 02 — Site Debugging

One job: reproduce one concrete failure, identify its smallest cause, and either repair it in the smallest in-scope way or report it. Do not redesign the failing area and do not repair unrelated defects found on the way.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/operations/repeated-failures-playbook.md` | known repository failure patterns and their forbidden responses |
| L3 | `docs/operations/agent-operating-model.md` | instruction hierarchy, task classification, commit and stop rules |
| L3 | `docs/architecture/repo-wireframe.md` | where each kind of site code lives |
| L3 | `docs/operations/generated-site-link-validation.md` | only for generated-output or internal-link failures |
| L3 | `docs/architecture/media-ownership.md` | only for missing-image or asset-path failures |
| L4 | the exact failing command, its exact output, and the environment it ran in | reproduction |
| L4 | only the exact failing test file and the exact assertion that fails | failure scope |
| L4 | only the exact suspect source files reached from the failure, not the surrounding tree | working material |
| L4 | generated build output, read-only, only as evidence | evidence |
| L4 | the last known-good state of exactly the failing behavior | comparison |

Do not load all of `src/`, all of `tests/`, or all of `docs/`; the suspect files are selected at task time as Layer 4 from the reproduction itself.

## Process

1. Reproduce the failure exactly as reported before reading source. An unreproducible report is a stop condition, not a licence to change code.
2. Reduce it to the smallest failing case and name the single most likely cause.
3. Classify the failure as a source failure or an environment failure before editing anything.
4. Environment failure — an EPERM or lock on generated output, a stale Vite dependency cache, a missing local install, a sandbox network restriction: follow `docs/operations/repeated-failures-playbook.md`, clear the generated artifact once, and rerun. Never edit source, rename an asset, or commit generated output to clear an environment lock. If the lock survives the playbook response, stop and report it.
5. Source failure: make the smallest in-scope fix at the cause rather than at the symptom, and not at a wider surface that merely looks improvable.
6. Rerun the exact failing test, then the affected test family.
7. Rerun the regression gate appropriate to what actually changed.
8. Review the diff file by file.

## Outputs

- the reproduction, the identified cause, and the source-versus-environment classification;
- the smallest in-scope repair, or a report when the cause lies outside the approved scope;
- a stage report naming base SHA, failing command, cause, files changed, tests rerun, validation results, and any unrelated defect observed but deliberately left alone.

## Verify

Confirm the original failing command now passes for the stated reason rather than by coincidence. Rerun the focused tests, then `node --test` for the affected test families. When runtime or build-sensitive source changed, also run `npm run build` and `npm run typecheck`, and compare the diagnostics against the branch-base baseline; unrelated pre-existing diagnostics stay unrepaired. Finish with `git diff --check` and an explicit changed-file list.

## Stop conditions

Stop on an unreproducible failure, an environment lock that survives the playbook response, a cause that lies in i18n contracts, editorial content, property facts, deployment or Cloudflare administration, a repair that would require redesigning the failing area, an unexpected modified file, a source-of-truth conflict, or any requested merge, deploy, publication, push or force push.
