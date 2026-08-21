# Stage 02 — Prepare

One job: prepare one exact operational change locally, validate it deterministically, and stop at a review gate. This stage makes LOCAL REPOSITORY CHANGES ONLY.

LOCAL REPOSITORY CHANGES ONLY. No Cloudflare API mutation, no production deployment, no DNS mutation, no environment-variable mutation, and no secret value committed. A locally prepared change is NEVER authorization to deploy.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/operations/deployment-operations.md` | what may be prepared locally, and what may never be applied from here |
| L3 | `docs/operations/agent-operating-model.md` | instruction hierarchy, staging and stop rules |
| L4 | the exact configuration or source file being changed, such as `public/_redirects` or `public/_headers` | the change target |
| L4 | the exact diagnosis from `.agents/workspaces/operations-deployment/stages/01_inspect/CONTEXT.md` that the change answers | the justification |
| L4 | the one exact relevant test, such as `tests/contact-function.test.mjs` when the contact Pages Function contract is affected | deterministic validation |

Do not load every configuration file, every test or every audit to prepare one change.

## Process

1. Restate the exact request and the exact intended behavior change. An implied or batched change request is a stop condition.
2. Open the exact configuration or source file that owns that behavior. Classify the owner first: an application-source repair belongs to `.agents/workspaces/site-engineering/CONTEXT.md`, not here.
3. Make the smallest local change that produces the intended behavior. No adjacent cleanup, no unrelated rule, no speculative rewrite of a working redirect or header.
4. For a redirect change, state the intended status code, the preserved path, the preserved query string, the final response, and that no loop and no unnecessary redirect chain is introduced.
5. Document environment-variable requirements by name only. Never add, remove, echo or commit a value.
6. Run the deterministic validation the change actually needs: the focused test that covers it, plus `npm run context:audit` when the control plane changed. A build or typecheck is required only when a build-sensitive file changed.
7. Write the exact command that would later apply the change, and hold it unexecuted for approval.
8. Stop at the review gate. Report the diff, the validation result and the exact authorization that would be required next.

## Outputs

- the exact files changed and the exact behavior each change produces;
- the deterministic validation that was run and its result;
- for a redirect or header change, the intended status, path and query-string behavior;
- the exact apply command, held unexecuted, with the exact target it would affect;
- environment-variable names only, with no values;
- an explicit statement that nothing was applied, deployed or pushed.

## Verify

Confirm only the intended files changed and that `src/`, `functions/`, `public/`, `scripts/` and `data/` were not touched beyond the one named change target. Run `git diff --check`. Confirm no secret value, token or credential is present in the diff. Confirm the focused validation passed and that no unrelated diagnostic was normalized on the way. Confirm no remote call was made and no deployment was triggered.

## Stop conditions

Stop on an unrelated modified file, a change whose real cause is application source code, a redirect or header change that would create a loop or drop a path or query string, a request to add a secret value, a request to change DNS, nameservers, WAF or security rules, Turnstile, environment variables or the Pages project itself, a real validation failure, an attempt to treat a prepared change or a green build as deployment permission, or any requested merge, deploy, push or force push.
