# Operations and Deployment Workspace Router

This workspace is the control plane for deployment execution, Cloudflare operations, production runtime configuration and operational verification after a deployment or change. Route one stage at a time and load only that stage's declared Layer 3 references and Layer 4 working material.

The four rules the workspace exists to enforce:

- Inspecting is not preparing.
- Preparing is not applying.
- Applying is not verifying.
- Verifying is not repairing.

INSPECT is not PREPARE is not APPLY is not VERIFY. Reviewing configuration, checking deployment state, preparing a change, editing local configuration, running tests and receiving a successful build are all read-or-local work. None of them authorizes a production mutation.

## Route the task

| Requested outcome | Stage |
| --- | --- |
| Inspect Cloudflare configuration, deployment state, production hostname assumptions or environment-variable requirements, diagnose a Cloudflare Pages operational issue, or decide whether a failure is operational or source-code | `stages/01_inspect/CONTEXT.md` |
| Prepare one exact operational change locally: a configuration or redirect/header edit, a deployment configuration fix, environment-variable documentation, or an exact deployment command held for later approval | `stages/02_prepare/CONTEXT.md` |
| Execute one exact production operation the user has explicitly authorized: deploy an approved revision, or change one approved Cloudflare or environment setting | `stages/03_apply/CONTEXT.md` |
| Verify one already completed deployment or operational change against production | `stages/04_verify/CONTEXT.md` |

Four stages, because each one is a different permission class. Stage 01 is read-only. Stage 02 may change local repository files and may reach nothing remote. Stage 03 is the only stage that may mutate production, and only for one exact authorized operation. Stage 04 prefers read-only checks and may never repair, redeploy or reconfigure anything.

NO PRODUCTION MUTATION BY DEFAULT. "fix this", "prepare this", "check this", "commit this" and "tests passed" never route into Stage 03. Deployment and Cloudflare changes require an explicit request naming the exact mutation.

## Deployment mechanisms this repository actually has

| Mechanism | Where it lives |
| --- | --- |
| Static build: static output, trailing-slash routes, canonical site host, sitemap integration | the Astro configuration at the repository root |
| Cloudflare Pages production deployment from the connected GitHub repository | the Cloudflare Pages project; this repository contains no wrangler configuration and no deploy script |
| Edge redirects shipped with the build | `public/_redirects` |
| Edge headers, including the pages.dev noindex rules and asset cache policy | `public/_headers` |
| The contact Pages Function and its non-secret environment contract | `functions/api/contact.js`, with behavior owned by `tests/contact-function.test.mjs` |
| Crawl directives served in production | `public/robots.txt`, with the Cloudflare managed exception recorded in `docs/audits/robots-sitemap-verification-2026-07-24.md` |
| Canonical host consolidation from www to the apex host | a Cloudflare rule outside this repository, recorded in `docs/audits/www-redirection-audit-2026-07-24.md` |
| The recorded go-live gate sequence | `docs/releases/2026-05-22-cloudflare-go-live-roadmap.md` |

Do not invent a Cloudflare capability, a deployment command, an environment variable or a configuration file this repository does not have.

## Domains this workspace does not own

| Subject | Owner |
| --- | --- |
| Astro, component, layout, route and client-side defects, build or runtime bugs that need an application-source change, and source-code engineering under `functions/` | `.agents/workspaces/site-engineering/CONTEXT.md` |
| Search Console evidence, SEO analysis and SEO recommendation | `.agents/workspaces/seo-content-intelligence/CONTEXT.md` |
| Localized routes, hreflang, locale canonical and sitemap locale infrastructure | `.agents/workspaces/i18n/CONTEXT.md` |
| Property facts and property-page content | `.agents/workspaces/property-content/CONTEXT.md` |
| Article research, drafting, revision, audit and publication | `BLOG_ORCHESTRATOR.md` with `.agents/workspaces/editorial-research/CONTEXT.md` |
| Social publication preparation, approval, live publication and reconciliation | `.agents/workspaces/social-publishing/CONTEXT.md` |

Operating a deployment is allowed. Becoming the authority on what is deployed is not. A deployment problem whose cause is source code routes from Stage 01 to `.agents/workspaces/site-engineering/CONTEXT.md`, and a change that workspace produces is deployable only after a separate explicit deployment authorization.

## Shared invariants

- One request, one exact operation, one environment, one stage per run. Never load all of `src/`, all of `tests/`, all of `docs/`, every Cloudflare surface or the whole deployment history.
- A local change, a passing test, a green build, a commit and a merge are not deployment permission. Deployment permission is a separate explicit instruction naming the exact revision and target.
- One authorization covers one operation. Never broaden it into a second Cloudflare change, never combine unrelated production operations, and never repeat an operation because the result was unclear.
- These are never implicit and each requires an exact explicit request: a DNS change, a nameserver change, Pages project deletion, domain removal, environment-variable deletion, secret disclosure, a cache purge, a WAF or security-rule change, a Turnstile change, a deployment, a rollback, and a production restart or reconfiguration.
- Secrets are operational configuration. Variable names may be documented; values never enter a context file, documentation, a test, a fixture, a commit, a report or captured command output. Report names only.
- Do not modify `src/`, `functions/`, `public/`, `scripts/` or `data/` from this workspace to prove a control-plane point. Record a suspected operational safety defect and stop instead of repairing it here.
- No merge, deploy, push, force push or destructive cleanup is authorized by completing a stage, and completing one stage never authorizes the next.

## Review boundaries

Inspection stops at a diagnosis and a named next owner. Preparation stops at a reviewable local diff. Application stops at one recorded observable result. Verification stops at a pass or at a preserved failure that returns to inspection and requires fresh authorization before any further application.
