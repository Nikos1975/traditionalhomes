# Stage 01 — Inspect

One job: read and diagnose the current operational or deployment state, name the owner of the cause, and stop. This stage is READ ONLY.

READ ONLY. It may read exact local configuration and, in a future authorized workflow, read-only remote operational state. It may not edit production, deploy, change Cloudflare, change DNS, change environment variables, purge cache, restart a service, modify a route or publish anything.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/operations/deployment-operations.md` | the permission classes, the mechanisms that exist, and the safety prohibitions |
| L3 | `docs/operations/agent-operating-model.md` | instruction hierarchy, staging and stop rules |
| L3 | `docs/operations/repeated-failures-playbook.md` | how to stop repeating a failing operational action |
| L4 | the one exact configuration file the question is about, such as `public/_redirects`, `public/_headers`, `public/robots.txt` or `functions/api/contact.js` | the current declared behavior |
| L4 | the one exact deployment record, build log or error text the user supplied | the observed failure |
| L4 | the one exact production URL, route or header the question is about | the observed production behavior |

Do not load every Cloudflare surface, every audit, the whole deployment history, all of `src/` or all of `tests/` to answer one operational question.

## Process

1. Restate the exact operational question and the exact environment it concerns. An unstated environment is a stop condition.
2. Read the one exact local configuration that declares the behavior in question, and nothing adjacent to it.
3. Read the observed evidence the user supplied. Do not reproduce it by triggering a production action.
4. Classify the cause: operational configuration, deployment state, or application source code. State the classification explicitly.
5. Route a source-code cause to `.agents/workspaces/site-engineering/CONTEXT.md`, an SEO evidence question to `.agents/workspaces/seo-content-intelligence/CONTEXT.md`, a localized route question to `.agents/workspaces/i18n/CONTEXT.md`, and a content question to its content owner.
6. Report environment-variable requirements by name only. Never read, echo, log, quote or commit a value.
7. Name the next stage. A repair that needs a local edit goes to `.agents/workspaces/operations-deployment/stages/02_prepare/CONTEXT.md`. A production mutation is never proposed as the next step without an explicit user request for that exact mutation.
8. Stop. A diagnosis is not a change, and it is not authorization for one.

## Outputs

- the exact question, the exact environment, and the exact files or endpoints inspected;
- the diagnosis, with the observed evidence it rests on and the difference between confirmed and unverified;
- the classification: operational, deployment-state or source-code;
- the exact next owner or stage, with what would have to be authorized before anything changes;
- environment-variable names only, with no values.

## Verify

Confirm nothing was written: no repository file changed, no Cloudflare or DNS setting changed, no deployment triggered, no cache purged and no environment variable read for its value. Confirm every claim about production behavior is backed by observed evidence rather than by an assumption about how the configuration should behave. Confirm no credential, token or secret value appears in the report.

## Stop conditions

Stop on a request to change anything, an unstated or ambiguous environment, a diagnosis that would require triggering a production action to confirm, a cause that belongs to another workspace, a missing deployment record, an inability to distinguish confirmed evidence from assumption, a credential appearing anywhere in output, or any requested merge, deploy, push or force push.
