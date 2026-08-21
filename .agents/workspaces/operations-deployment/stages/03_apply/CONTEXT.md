# Stage 03 — Apply

One job: execute one exact production operational mutation the user has explicitly authorized, record the observable result, and stop. This is the highest-permission stage in the repository control plane.

NO PRODUCTION MUTATION BY DEFAULT. "fix this", "prepare this", "check this", "commit this" and "tests passed" DO NOT authorize a deployment or a Cloudflare change. A previous build, test, commit or merge is never carried forward as permission.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/operations/deployment-operations.md` | the authorization contract and the operations that are never implicit |
| L3 | `docs/operations/agent-operating-model.md` | instruction hierarchy, staging and stop rules |
| L4 | the exact authorized revision, and no other revision | the deployment target |
| L4 | the exact target environment and the exact named Cloudflare surface the authorization covers | the mutation scope |
| L4 | the exact approved configuration prepared by `.agents/workspaces/operations-deployment/stages/02_prepare/CONTEXT.md` | the change content |

Do not load unrelated configuration, unrelated environments or the deployment history to perform one authorized operation.

## Process

1. Require explicit user intent for the exact mutation, in the user's own words. An inferred, implied, batched or previously discussed mutation is a stop condition.
2. Require the exact target and environment. An unnamed environment is a stop condition.
3. Require the exact approved revision or the exact approved configuration value set. An approximate target is a stop condition.
4. Re-check repository and configuration state immediately before acting. If the head, the diff or the configuration changed since approval, stop and require fresh authorization.
5. Perform exactly one operation. Never broaden one approval into a second Cloudflare change, and never combine unrelated production operations in one run.
6. Never expose a secret. Environment variables are set or reported by name; a value is never read back, echoed, logged, quoted or committed.
7. Record the exact observable result: what was changed, on which target, at what time, and the exact response or deployment identifier observed.
8. Do not repeat the operation because the result was unclear. An unclear result goes to `.agents/workspaces/operations-deployment/stages/04_verify/CONTEXT.md` for read-only verification, not to a retry.
9. Stop. Hand verification to Stage 04 and never present an unverified mutation as confirmed.

## Outputs

- the exact authorized operation, quoted from the user's request;
- the exact target, environment and revision or configuration applied;
- the exact observable result, including any deployment or change identifier;
- what was explicitly not changed, so the boundary of the authorization is visible;
- environment-variable names only, with no values;
- an explicit statement that no second operation was performed and no retry occurred.

## Verify

Confirm exactly one operation ran against exactly one named target. Confirm the applied revision or configuration equals the approved one. Confirm no DNS record, nameserver, Pages project, domain binding, WAF or security rule, Turnstile setting or unrelated environment variable was touched. Confirm no secret value appears in any output, log or tracked file. Hand the production behavior check to `.agents/workspaces/operations-deployment/stages/04_verify/CONTEXT.md`; a mutation is not self-verifying.

## Stop conditions

Stop on any request that is not an explicit authorization for this exact mutation, a missing or ambiguous target or environment, an approximate or drifted revision, repository or configuration state that changed since approval, an attempt to broaden the authorization, an attempt to combine unrelated production operations, an unclear result that would tempt a retry, a credential appearing anywhere in output, or any requested merge, deploy, push or force push that was not itself explicitly authorized.
