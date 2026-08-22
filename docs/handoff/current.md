# Current Repository Handoff

Continuity and reference only. This file records current repository state so a new
agent does not have to reconstruct it. It is **not** an execution authority:
`CLAUDE.md`, `CONTEXT.md` and the workspace/stage `CONTEXT.md` contracts remain
authoritative for what a task may do.

Historical detail lives in `docs/agent-handoff-notes.md`. That archive is not part
of startup context and is loaded only when a specific historical question requires it.

## Current Baseline

- Current validated phase: ICM Phase 17 (edit-source principle).
- Phase 17 branch/base: `chore/icm-phase17-edit-source-principle` branched from the
  Phase 16 head `765abe5086a9181cf53cbabddaa0c890aeefd905`.
- Phase 17 is the final planned ICM phase. The ICM migration is complete.
- Runtime stack: Astro 5 static-first output, TypeScript, Tailwind CSS, Node test
  runner (`node --test`), no heavy client-side JavaScript.
- Deployment model: Cloudflare Pages built from the connected GitHub repository.
  Production host is `https://traditional-homes.gr`. A local build proves nothing
  about production; deployment and Cloudflare mutations are separately authorized.

## Working Tree Preservation

Two tracked files are expected to be modified in the working tree across phases:

- `data/content-intelligence/inventory.json`
- `data/content-intelligence/inventory.md`

Do not stage, restore, regenerate, overwrite, revert or commit them without an
explicit instruction naming them. A clean phase ends with exactly these two files
still showing as modified.

## Active ICM Owners

Seven workspaces own the repository's work. Route to exactly one.

| Owner | Scope |
| --- | --- |
| `.agents/workspaces/i18n/CONTEXT.md` | Multilingual implementation, locale routes, shared renderers, canonical/hreflang/sitemap infrastructure, translation and visible-language QA. |
| `BLOG_ORCHESTRATOR.md` and `.agents/workspaces/editorial-research/CONTEXT.md` | Blog, guide and historical article work: research, drafting, revision, audit, visual plans and publication routing. |
| `.agents/workspaces/property-content/CONTEXT.md` | Property facts and property-facing content; the only owner allowed to change a canonical property fact. |
| `.agents/workspaces/site-engineering/CONTEXT.md` | Non-i18n Astro/UI implementation and build, runtime, browser, type and regression debugging. |
| `.agents/workspaces/seo-content-intelligence/CONTEXT.md` | Search Console evidence, SEO performance/gap/overlap analysis and SEO recommendation planning. |
| `.agents/workspaces/social-publishing/CONTEXT.md` | Preparation, approval, live publication and reconciliation of social posts for an already-published article. |
| `.agents/workspaces/operations-deployment/CONTEXT.md` | Cloudflare Pages operations, deployment execution, production runtime configuration and post-deployment verification. |

Stage contracts are not reproduced here. Load the stage from its workspace router.

## Local Run Provenance

`scripts/context/icm-run.mjs` records local ICM run provenance — branch, base and
current commit, workspace, stage, task, changed files, commands actually run and the
validation results observed — under the untracked directory .agent/icm/.

That material is Layer 4 local evidence only. It is never committed, never a source of
truth for repository state, and never execution authority: a run record does not
authorize a merge, push, force push, deployment, Cloudflare mutation, publication or
social publication. Recording that an authorized action happened is not granting it.

## Permission Boundaries

- Research is not drafting, and drafting is not publication.
- A recommendation is not an implementation.
- Prepare, approve and publish are three separate permissions.
- Inspect, prepare, apply and verify are four separate permissions.
- A source bug is not a deployment permission; a passing test, a successful build
  and a merged commit never authorize a production mutation.
- No merge, deploy, publish, push to `main` or force-push without explicit
  authorization for that exact action.
- Ownership boundaries are exact: a workspace consumes another owner's outputs and
  never becomes their authority.
- Before editing a derived artifact, identify and edit its authoritative source;
  generated products are verification outputs, not substitute edit surfaces. The
  method is `docs/operations/edit-source-principle.md`; it creates no new authority.
- Secrets, tokens and credentials never enter tracked context, reports or commits.

## Known Baselines

`npm run typecheck` baseline, unresolved and accepted:

- 3 errors
- 0 warnings
- 3 hints

Known error locations:

- `src/components/UnitCard.astro`
- `src/components/booking/BookingHandoffForm.astro`
- `src/pages/en/guide/mavrikiano.astro`

Do not repair these opportunistically inside unrelated work. Compare a run against
the current baseline instead of claiming pre-existing diagnostics are new.

Dependency vulnerabilities are known and tracked. They are out of scope for
unrelated phases and are not fixed as a side effect.

## Current Validation Baseline

- Context audit passes (`npm run context:audit`).
- Last full native `node --test` suite: Phase 17 — 531 tests, 531 pass,
  0 fail, 0 cancelled.
- Phase 17 focused edit-source, ICM routing and current-handoff validation also
  passes: 41 tests, 41 pass, 0 fail, 0 cancelled.
- The first full Phase 17 suite exposed a transient Astro `.astro` cache rename
  failure in `tests/llms-txt.test.mjs`; after removing the generated `.astro`
  cache, the isolated test and the complete native suite both passed.
- `git diff --check` passes.
- `git fsck --connectivity-only` is healthy; two harmless dangling trees may remain.
- Final Phase 17 working-tree status contains only the two protected
  content-intelligence modifications documented above.

531 is an observed baseline, not a permanently required test count. The permanent
gate is fail 0 and cancelled 0.

The desktop-bridge environment cannot run the full native suite reliably. Run
full-suite validation natively on Windows when future repository work requires it.

## Git Safety

- Inspect `git status --short` before starting and before committing.
- Never `git reset --hard`; never `git add .` or `git add -A`. Stage exact paths.
- Preserve backup refs and existing worktrees; do not reuse a worktree whose
  branch and purpose do not match the current task.
- Inspect a stale lock before removing it; confirm no git process is running.
- The Claude desktop bridge may leave `tmp_obj_*` objects or `.git/*.lock`
  artifacts behind after an interrupted command.
- Do not run `git gc --prune=now` as routine validation.
- Do not write commit hashes into `.git/refs/` by hand.

## Current Product / Site Constraints

- Astro + Tailwind + TypeScript, static-first.
- Cloudflare Pages deploys from the connected GitHub repository.
- English is the factual master; German is the current reference implementation
  for localization.
- No fabricated property facts. `src/inventory/inventory.json` is the canonical
  property source of truth.
- Google Search Console is authoritative for current organic search performance.
- Editorial style is factual, direct and specific, with no hype and no invented
  history.
- Positioning is authentic traditional Cretan houses, not luxury.

## Current Planned Work

No ICM phase remains planned; Phase 17 closed the migration.

Larger unfinished streams, recorded without detail:

- Finish the German implementation before starting other locales.
- German keyword and SERP research before broader metadata changes.
- Remaining typecheck baseline.
- Dependency vulnerabilities.
- Deferred research and article work.
- Social live configuration, only under explicit authorization.

## Resume Procedure

1. Read `CLAUDE.md`.
2. Read `CONTEXT.md`.
3. Read this file, `docs/handoff/current.md`.
4. Run `git status --short` and confirm the expected working tree.
5. Identify exactly one workspace owner for the task.
6. Load only that workspace router and its one routed stage contract.
7. Preserve the two known modified content-intelligence files.
8. Validate with the focused tests named by that stage before anything broader.
9. Stop at every review, approval and permission gate.
