# Stage 04 — Verify

One job: verify an already completed deployment or operational change against production, report the result exactly, and stop. Verification is READ-ONLY by preference and NEVER repairs.

Verification must not silently repair a failure. A failed check is reported, diagnosed and returned to inspection. It never becomes a redeploy, a rollback, a configuration edit or a second attempt.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/operations/deployment-operations.md` | what a correct verification looks like and what it may never do |
| L3 | `docs/operations/agent-operating-model.md` | instruction hierarchy, staging and stop rules |
| L4 | the exact deployment or change result recorded by `.agents/workspaces/operations-deployment/stages/03_apply/CONTEXT.md` | what is being verified |
| L4 | the exact production endpoints, routes or headers the change was supposed to affect | the observable check set |
| L4 | the exact expected behavior declared in `public/_redirects`, `public/_headers` or the relevant configuration | the expected result |

Do not sweep every route, every header or every Cloudflare setting to verify one change.

## Process

1. Restate the exact change that was applied and the exact observable behavior it should produce.
2. Check the canonical production host responds correctly, and that the exact affected route is reachable.
3. Check that the deployment identifier or revision serving production is the approved one.
4. For a redirect, check the status code, the Location header, path preservation, query-string preservation, the final response, that no loop exists and that no unnecessary redirect chain was introduced.
5. For a header change, check the exact header on the exact affected path and confirm unrelated paths are unchanged.
6. For a Pages Function change, check the endpoint is reachable and behaves as declared, without submitting anything that would send a real message or consume a real quota.
7. Confirm the Cloudflare configuration reflects the approved change and nothing beyond it.
8. On a failure: STOP. Do not repair, redeploy, roll back or reconfigure. Diagnose, return to `.agents/workspaces/operations-deployment/stages/01_inspect/CONTEXT.md` or `.agents/workspaces/operations-deployment/stages/02_prepare/CONTEXT.md`, and require fresh explicit authorization before any further application.
9. Report the result exactly, distinguishing verified behavior from unverified assumption.

## Outputs

- the exact endpoints checked and the exact observed statuses, headers and final responses;
- the deployment identifier or revision observed in production;
- a clear pass or fail per check, with no aggregate claim that hides a failing check;
- for a failure, the diagnosis, the owning stage it returns to, and an explicit statement that nothing was repaired;
- environment-variable names only, with no values.

## Verify

Confirm the verification itself changed nothing: no deployment, no rollback, no cache purge, no configuration edit, no repository file written. Confirm every reported status, header and identifier came from an observed response rather than from the local configuration. Confirm a local build or a passing test was never reported as production evidence. Confirm no credential appears in any captured output.

## Stop conditions

Stop on any failed check, an unreachable production host, a serving revision that is not the approved one, a redirect loop or a dropped path or query string, a request to repair or redeploy from this stage, a check that would require mutating production to perform, a temptation to report a local build as production proof, a credential appearing anywhere in output, or any requested merge, deploy, push or force push.
