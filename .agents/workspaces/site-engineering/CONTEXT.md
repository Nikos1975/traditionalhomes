# Site Engineering Workspace Router

This workspace is the control plane for non-i18n Astro and site implementation, and for build, runtime, browser, type and regression debugging on `traditional-homes.gr`. Route one stage at a time and load only that stage's declared Layer 3 references and Layer 4 working material.

## Classify the request before routing

| Request class | What it means | Route |
| --- | --- | --- |
| A — implementation | the desired behavior is known and authorized; a bounded code change is requested | `stages/01_implementation/CONTEXT.md` |
| B — debugging | existing behavior fails: build, type check, rendered output, client-side behavior, or a test regression | `stages/02_debugging/CONTEXT.md` |
| C — architecture decision | a decision is requested and no implementation is authorized yet | the relevant file under `docs/architecture/`; return here only after an implementation is approved |
| D — cross-domain | the real subject belongs to another owner | route to the owner below and stop; do not restate its procedure here |

A request has one primary class. Reproducing a defect inside an implementation task, or writing the repair after a diagnosis, does not create a second workflow; it stays inside the routed stage contract.

## In scope

Astro component, page and layout implementation; shared UI behavior; Tailwind/CSS implementation through the single global stylesheet entrypoint `src/styles/global.css`; client-side browser behavior; forms and site UI integration; non-i18n route implementation; build and debug work; TypeScript/Astro diagnostics for changed files; regression repair; image-delivery integration when it is an implementation concern; and Cloudflare Pages/Functions work under `functions/` when it is source-code engineering rather than infrastructure administration.

## Domains this workspace does not own

| Subject | Owner |
| --- | --- |
| Multilingual translation, localized public routes, locale-aware renderers, locale SEO, hreflang/canonical/sitemap locale infrastructure | `.agents/workspaces/i18n/CONTEXT.md` |
| Blog/guide research, drafting, revision, content audit, publication, article visual plans, blog images | `BLOG_ORCHESTRATOR.md` |
| Property factual authority and property-page content | `.agents/workspaces/property-content/CONTEXT.md`, whose authority is `docs/architecture/source-of-truth.md` with `src/inventory/inventory.json` |
| Media placement and image-rights authority | `docs/architecture/media-ownership.md` |
| Search Console analysis, topic scoring, content-gap analysis, editorial SEO planning | no ICM workspace yet; stop and report instead of absorbing it here |
| Social publication workflows | no ICM workspace yet; stop and report |
| Deployment, Cloudflare account/DNS/redirect administration, production deployment state | no ICM workspace yet; stop and report. Only source-code engineering under `functions/` is routed here |

Consuming a fact, a media rule or an i18n contract is allowed. Becoming its authority is not.

## Shared invariants

- Select exact affected files at task time. Do not load all of `src/`, all of `tests/`, or all of `docs/`, and do not load historical handoff material by default.
- Prefer an existing shared component, layout, renderer or helper over duplicated markup or a second implementation of the same behavior.
- Make the smallest change that satisfies the approved behavior. No speculative refactor, no rename sweep, no new dependency for a small problem.
- Do not normalize unrelated diagnostics, unrelated lint noise, or unrelated failing material encountered on the way. Report it instead.
- Property facts are not invented in components, translation resources are not factual stores, and article research evidence is not copied into components.
- Do not hard-code a duplicate of data that already has a canonical source. A source-of-truth conflict is a stop condition, not something to reconcile silently in one copy.
- An environment or generated-output lock never authorizes a source edit.
- No merge, deploy, publication, push, force push or destructive cleanup is authorized by completing a stage. A branch commit is allowed only when the task asks for it, and only from explicitly staged paths after an exact changed-file review.

## Review boundaries

Implementation and debugging are separate mental modes. A debugging task ends at a diagnosis plus the smallest in-scope repair; it does not become a redesign. An implementation task does not expand into architecture cleanup because the surrounding code looks improvable. Each stage must leave a reviewable, explicitly listed set of changed files.
