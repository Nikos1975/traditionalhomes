# Deployment and Cloudflare Operations

Stable operational policy for deploying this site and for changing its production runtime configuration. It describes the permission model and the mechanisms that exist. It is not a task list, and it authorizes nothing by itself.

The ICM owner of this material is `.agents/workspaces/operations-deployment/CONTEXT.md`.

## Permission model

Operational work has four permission classes, and they are never merged:

| Class | May do | May never do |
| --- | --- | --- |
| INSPECT | read local configuration, read supplied deployment records, read production responses | change anything |
| PREPARE | change local repository files, run deterministic local validation | reach any remote mutation, deploy, change Cloudflare or DNS |
| APPLY | perform one exact explicitly authorized production operation | infer permission, broaden scope, combine operations, retry an unclear result |
| VERIFY | observe production and report the result | repair, redeploy, roll back, purge or reconfigure |

No production mutation may be inferred from reviewing configuration, checking deployment state, preparing a change, editing local configuration, running tests, or receiving a successful build. Explicit user authorization is required for the exact production mutation, naming the exact target, environment and revision or configuration.

"fix this", "prepare this", "check this", "commit this" and "tests passed" are not deployment authorization.

## Operations that are never implicit

Each of the following requires an exact explicit request and is never performed as a side effect of another task:

- a DNS record change;
- a nameserver change;
- Pages project deletion;
- domain removal or rebinding;
- environment-variable deletion;
- secret disclosure;
- a cache purge;
- a WAF or security-rule change;
- a Turnstile change;
- a deployment;
- a rollback;
- a production restart or reconfiguration.

One authorization covers one operation on one target. It is never broadened into a second Cloudflare change and never combined with an unrelated production operation.

## Mechanisms this repository actually has

| Mechanism | Where it lives |
| --- | --- |
| Static build: static output, trailing-slash routes, canonical site host, sitemap integration | the Astro configuration at the repository root |
| Production deployment | Cloudflare Pages, built from the connected GitHub repository. This repository contains no wrangler configuration and no deploy script |
| Edge redirects shipped with the build | `public/_redirects` |
| Edge headers, including the pages.dev noindex rules and the asset cache policy | `public/_headers` |
| Contact endpoint as a Pages Function | `functions/api/contact.js`, with behavior owned by `tests/contact-function.test.mjs` |
| Crawl directives served in production | `public/robots.txt` |
| Canonical host consolidation from www to the apex host | a Cloudflare rule outside this repository |
| Control-plane audit | `scripts/context/validate-icm.mjs` by way of `npm run context:audit` |

Recorded operational history, read only when a task needs it: `docs/releases/2026-05-22-cloudflare-go-live-roadmap.md`, `docs/audits/www-redirection-audit-2026-07-24.md` and `docs/audits/robots-sitemap-verification-2026-07-24.md`.

Do not invent a Cloudflare capability, a deployment command, an environment variable or a configuration file this repository does not have. A separate Cloudflare Workers Builds integration is obsolete; its failure is not a website failure and is not repaired unless that exact task is requested.

## Secrets

Secret values never enter a context file, documentation, a test, a fixture, a commit, a report or command output captured in a tracked file. Variable names may be documented; values are never read back, echoed, logged, quoted or committed.

The non-secret names the contact Pages Function reads are TURNSTILE_SECRET_KEY, CONTACT_EMAIL_TO, CONTACT_EMAIL_FROM, CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_EMAIL_API_TOKEN. Naming them is documentation. Reading, printing or committing any of their values is a stop condition.

## Ownership boundary

Operations owns deployment execution, Cloudflare operations, production runtime configuration and post-deployment operational verification.

An application-source defect is not an operational defect. A deployment problem whose cause is Astro, component, route or client-side code is diagnosed by inspection and routed to `.agents/workspaces/site-engineering/CONTEXT.md`, including source-code engineering under `functions/`. After that workspace produces an approved change, operations may later deploy it, but only after a separate explicit deployment authorization.

SEO evidence, localization, property facts, editorial work and social publication keep their own owners and are never absorbed into operations.

## Verification method

Verification is read-only by preference and never repairs. A local build, a passing test or a green typecheck is never reported as production evidence.

- For a route: the canonical production host responds, and the exact affected route is reachable.
- For a deployment: the revision or deployment identifier serving production is the approved one.
- For a redirect: status code, Location header, path preservation, query-string preservation, final response, no loop, no unnecessary redirect chain.
- For a header: the exact header on the exact affected path, with unrelated paths unchanged.
- For a Pages Function: the endpoint is reachable and behaves as declared, without sending a real message or consuming a real quota.
- For a Cloudflare setting: the configuration reflects the approved change and nothing beyond it.

A failed check stops the run. It is diagnosed and returned to inspection or preparation, and it requires fresh explicit authorization before any further application. Repeating a failing operational action is governed by `docs/operations/repeated-failures-playbook.md`.
