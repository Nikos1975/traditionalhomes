# Agent Operating Model

This document explains how agents should work in this repo before editing, staging, or committing.

## 1. Instruction hierarchy

`CLAUDE.md` is canonical for this repo. It controls the project rules, build/debug workflow, commit policy, brand voice, content rules, and source-of-truth expectations.

`AGENTS.md` is a thin wrapper for non-Claude agents. It should stay minimal and point agents to `CLAUDE.md` and task-specific routing files.

`.agents/skills/icm-workspace-architect/ICM_RULES.md` is the canonical context-architecture standard. Always use ICM reasoning for context loading, workspace/stage boundaries, and reusable workflow organization; do not force a fixed folder tree.

`.ai/brand/website-brand-style-guide.md` controls shared tone.

`.ai/prompts/website-editorial-system.md` controls property, homepage, collection, and property-related location copy.

`.ai/prompts/blog-editorial-system.md` controls blog, guide, village-guide, and area-guide copy unless the task is explicitly property-page copy.

`.agents/skills/*/SKILL.md` files are task-triggered procedural workflows. Treat the actual `.agents/skills/` directory as authoritative for which project-local skills are installed.

`docs/architecture/*` defines repo decisions that agents must not override casually, including source-of-truth, media ownership, and slug decisions.

If instructions appear to conflict, follow `CLAUDE.md` first, then the relevant architecture document, then the relevant routed skill or editorial prompt for the task.

### External / generic workflows and Superpowers Ultra

Repo-local instructions and repo-local skills take precedence over external, generic, environment-level, Superpowers, or Obra-style workflows.

External process skills may be used as background methodology, but they must not override this repo's file scope, build rules, commit rules, media rules, source-of-truth rules, or copy/factual-claim rules.

When available, agents may use Superpowers Ultra or an equivalent token-minimizing workflow as an execution aid. This means:

- Prefer targeted reads over broad file dumps.
- Summarize long files instead of repeating them.
- Avoid re-reading unchanged instructions unnecessarily within the same task.
- Use existing repo-local skills and docs instead of rediscovering rules.
- Keep final responses concise and action-oriented.
- Avoid repeating known failure analysis unless the failure changed.

Token minimization is an efficiency layer only. It must not skip required instructions, required skill reads, staged-file verification, build checks, or stop conditions.

### Plan Mode / planning workflow policy

Plan Mode, writing-plans, or an equivalent planning workflow should be used for multi-step, ambiguous, cross-file, architectural, debugging, content-production, or commit-planning tasks.

Do not over-plan exact-scope tasks. For one-line edits, simple image path fixes, already-classified docs-only commits, and direct user-approved exact-path commits, agents should execute directly while still following required reads, staged-file checks, build rules, and stop conditions.

If a concrete planning tool is available in the environment, agents may use it as an efficiency layer. If it is not available, agents should apply the same behavior manually: plan briefly, read only targeted files, avoid repeated rediscovery, and keep output concise and action-focused.

Planning and token minimization must not override repo-local instructions, file scope, build requirements, commit rules, or stop conditions.

## 2. Always-read vs task-triggered files

| File or folder | Read always? | Read when? | Purpose |
|---|---:|---|---|
| Runtime root adapter (`AGENTS.md` or native `CLAUDE.md`) | Yes | At task start if the runtime has not already loaded it | Enter the project instruction hierarchy. |
| `CLAUDE.md` | Yes for project rules | Non-Claude agents reach it through `AGENTS.md`; native Claude runtimes may already have it loaded | Canonical project, build, content, and commit rules. |
| `.agents/skills/icm-workspace-architect/ICM_RULES.md` | No | Architecture, context-loading, workspace/stage, or reusable-workflow decisions | Canonical ICM reasoning standard. |
| `BLOG_ORCHESTRATOR.md` | No | Blog, guide, historical article, blog audit/revision/publication/image work | Routes to exactly one blog procedure. |
| `.ai/brand/` | No | Public-facing copy, editorial review, tone decisions | Shared brand voice and tone source. |
| `.ai/prompts/` | No | Website copy, blog posts, guides, property content | Editorial systems by content type. |
| `.agents/skills/` | No | When the task matches an installed skill | Procedural workflows. |
| `docs/architecture/` | No | Source-of-truth, media, slug, routing, or structural decisions | Durable repo architecture decisions. |
| `src/inventory/inventory.json` | No | House or villa facts, access, capacity, parking, groups, constraints | Canonical structured property facts. |
| `docs/operations/agent-operating-model.md` | No | Process, commit, build, branch, or debugging work | Operational rules. |
| `docs/operations/repeated-failures-playbook.md` | No | Only after a matching failure or known failure class appears | Known failure handling. |
| `docs/agent-handoff-notes.md` | No | Targeted historical lookup by topic, slug, PR, command, or failure | Historical archive; never cold-start context. |

Do not reread unchanged root instructions inside the same task merely because a routed procedure links back to them.

## 3. Skills routing

The installed project-local skill inventory is the `.agents/skills/` directory. The table below reflects the current routed procedures; if the directory and this table ever differ, the directory plus each skill's frontmatter is authoritative.

| Skill | When to use | When not to use | Required inputs | Expected output |
|---|---|---|---|---|
| `blog-research-article` | New research-led blog, guide, or historical article work routed by `BLOG_ORCHESTRATOR.md` | Property pages, pure UI work, publication-only tasks | Topic brief/research packet, content schema, brand/editorial rules | Claim-reviewed draft-stage article artifacts under the blog workflow. |
| `blog-revise-draft` | Revising an existing draft article | New research-only work, publication-only tasks | Existing draft, research packet, claim evidence, editorial rules | Revised draft with unresolved factual issues surfaced rather than invented. |
| `blog-content-audit` | Auditing existing blog/guide content | Drafting a new article from scratch | Existing article/content, relevant research/source material, editorial rules | Bounded audit findings and recommended corrections. |
| `blog-publication` | Publication preparation after editorial approval | Research, drafting, or unapproved publication | Approved article state and required validation inputs | Publication-stage changes with explicit approval and validation gates. |
| `traditional-homes-article-visual-plan` | Planning evidence-led visuals for a blog post or guide before image work | Image generation, processing, article integration, publication, or social posting | Article/topic brief, research packet, claim register, image-rights register | Validated `docs/research/blog/<slug>/visual-plan.md` with evidence, rights, placement, accessibility, crop, approval, and blockers. |
| `traditional-homes-image-pipeline` | Approved image processing/integration tasks routed by the blog workflow | Visual planning, unsupported acquisition, unapproved generation/publication | Approved visual/image inputs and exact destination scope | Deterministically processed image artifacts within the approved boundary. |
| `icm-workspace-architect` | Repository/workspace/context architecture audits, routing design, staged workflow design | Ordinary single-file code/content edits with no architecture question | Existing tree/instructions and current workflow requirements | Minimal-change ICM architecture proposal or approved scaffolding. |

## 4. Plugins/tools/integrations routing

Astro integrations configured in `astro.config.mjs`:

- `@astrojs/tailwind` via `tailwind()`.
- `@astrojs/sitemap` via `sitemap()`, filtering the root URL and `/AGENTS/` pages.

Astro output is static. `trailingSlash` is `always`, build format is `directory`, and the site URL is `https://traditional-homes.gr`.

Available npm scripts:

- `npm run dev`: starts Astro dev server for local browser review.
- `npm run build`: runs `astro build`.
- `npm run blog:validate -- <article-path>`: validates one blog article's frontmatter, draft/image rules, placeholders, internal links, and historical sources section.
- `npm run preview`: previews the built site.
- `npm run typecheck`: runs `astro check`.
- `npm run format`: runs Prettier write mode.

Use `npm run build` for source, component, content, media-reference, route, config, dependency, or package changes before committing. On Windows, if build fails only with `EPERM` on generated output, follow the repeated-failures playbook.

Use `npm run dev` when visual/browser review is needed, especially for frontend layout, interaction, image rendering, responsive behavior, or user-facing UI changes.

Browser review is required after significant frontend changes and useful after image/path changes that affect visible pages. It is not required for docs-only process changes.

### Browser and visual review

This repo does not currently include Playwright, Playwright config, e2e tests, or npm visual-test scripts. Do not claim Playwright coverage unless those files are added later.

When visual review is needed, start the Astro dev server with `npm run dev` and use the available `agent-browser` CLI when present, for example to open local URLs and confirm pages load. If `agent-browser` is unavailable or the issue depends on visual judgment, ask Nikos for targeted screenshots.

Use browser review for visible UI, responsive layout, image rendering, map behavior, navigation, and page-specific visual checks. Use file/build inspection for exact path fixes, docs-only changes, and non-visual source changes.

Do not install Playwright or add browser-test scripts unless Nikos explicitly asks.

Git commands are allowed for inspection, explicit-path staging, committing requested scopes, and status/history checks. Do not push unless Nikos explicitly asks.

PowerShell cleanup commands are allowed only for generated output or caches when needed, such as `dist/` and `node_modules/.vite/`. Do not delete source, content, public assets, or docs as cleanup.

## Failure budget and retry policy

This is the general retry and stop budget. `docs/operations/repeated-failures-playbook.md` remains the source of specific remediation recipes.

### Failure classification

Before retrying a failed command or tool, classify it as:

1. **PRODUCT** — caused by the code or content currently being changed.
2. **KNOWN ENVIRONMENT** — matches a failure class in `docs/operations/repeated-failures-playbook.md`.
3. **UNRELATED ENVIRONMENT / TOOLING** — unrelated to the source diff, such as incomplete `node_modules`, dependency-install corruption, an unavailable browser or tool process, a shell or environment permission restriction, an unavailable external executable, or a network/tooling failure.

### Core retry rule

Use one diagnosis -> one documented remediation -> one retry -> stop that validation path if it still fails. Do not enter iterative repair loops.

### Same-command retry budget

Do not rerun the same failing command without a materially different documented remediation. For a known environment failure, apply the documented remediation once and retry once. If the same failure class remains, stop and report it.

### Dependency-install budget

For tasks that are not explicitly dependency or package-management work:

- Run `npm install` or `npm ci` only when dependencies are genuinely absent, and allow at most one install attempt in a disposable worktree.
- If that installation leaves `node_modules` incomplete or corrupted, treat the validation environment as broken and preserve the source diff for reporting.
- Never repair dependencies package-by-package, copy dependency files or directories from another worktree, or modify `package.json` or `package-lock.json` to repair an environment problem.
- Copying `prismjs`, or any other dependency internals, from another worktree is not an approved recovery procedure.

### Optional tool fallback budget

For optional or nonessential validation, use at most one reasonable already-available alternative. Do not install new tooling during an unrelated task just to complete optional validation. If the primary tool and that fallback both fail, report the validation path as blocked.

For example, if `agent-browser` fails, one existing alternative may be tried; otherwise report visual QA as blocked.

### Validation tiers

Use the cheapest, highest-signal validation first:

| Tier | Validation |
|---|---|
| 1 | Exact regression or unit test; targeted static or source contract; `git diff --check` |
| 2 | Related subsystem tests; `npm run typecheck` when relevant |
| 3 | Full `npm test`; build; SEO or link validation when relevant |

Do not rerun a validation tier that already passed unless the source diff changed afterward. A later unrelated environment or tooling failure does not invalidate earlier successful validation evidence; preserve that evidence.

### Stop conditions

Stop additional tool execution and report instead when:

- The same environment failure remains after its one remediation and retry.
- Dependency installation leaves `node_modules` incomplete.
- Environment or security policy blocks an action.
- The second equivalent optional tool fails.
- Continuing would require unrelated environment surgery.
- Further validation would not materially increase confidence.

### Forbidden environment surgery

During ordinary feature or fix work, do not:

- Reconstruct `node_modules` manually.
- Copy dependency internals from another checkout or worktree.
- Repeatedly install or uninstall packages.
- Modify application source to accommodate workstation-specific failures.
- Modify lockfiles to repair a local environment.
- Cycle through several equivalent tools after optional validation fails.

If such repair is genuinely required, stop and propose a separate environment-maintenance task.

### Blocked validation reporting

When validation is blocked, report only:

```text
BLOCKED VALIDATION
- command/tool
- failure class
- remediation attempted
- result
- source diff affected: yes/no
- successful validation still available
- recommended next action
```

Do not narrate every intermediate tool invocation.

## 5. Task classification before action

| Task class | Build required? | Commit allowed? | Files that may be staged | Stop and ask Nikos when |
|---|---:|---:|---|---|
| investigation-only | No | No | None | Findings imply edits or scope changes. |
| docs-only | Usually no | Yes, if requested | Exact reviewed docs paths only | Staged list includes source/content/media/package files. |
| source/component change | Yes | Yes, if requested | Exact source/component files and required assets only | Build fails with real source/app error. |
| content/copy change | Yes | Yes, if requested | Exact content files and supporting docs/assets only | Facts are unsupported or source-of-truth conflicts. |
| media/image change | Yes when referenced by live pages | Yes, if requested | Exact media files and exact references only | Image file is missing or folder ownership is unclear. |
| dependency/package change | Yes, plus review package diff | Yes, if requested | `package.json` and matching lockfile only | `package-lock.json` changes without `package.json`. |
| cleanup/archive | No unless source references change | Usually no | Exact archive/docs paths only, if requested | Cleanup would delete or move tracked files. |
| commit-only | No new build unless requested | Yes, if staged list is exact | Already reviewed allowed paths only | Staged list differs from requested scope. |

## 6. Commit operating rules

- Use one phase per commit.
- Do not use `git add .`.
- Do not use `git add -A`.
- Stage explicit paths only, or a reviewed pathspec list/file prepared for the exact approved scope.
- Verify staged files with `git diff --cached --name-only` before committing.
- Build is required for source, component, content, media-reference, package, and dependency changes.
- Docs-only commits may skip build if the staged list is exact and the only blocker is known Windows `EPERM` on generated output.
- Do not include unrelated local memory, generated output, research backlog, orphaned images, or lockfile noise.
- Do not push unless Nikos explicitly asks.

## 7. Image placement rules

- Use `public/images/...` for stable URL images, Open Graph images, Markdown frontmatter/body images, and public references that must resolve as `/images/...`.
- Use `src/assets/images/...` for images imported by Astro components or consumed through the Astro image pipeline.
- Treat `public/en/images/` as legacy. Avoid it for new work unless a reference audit proves it is required.
- About page images go under `public/images/about/`.
- Blog images go under `public/images/blog/` only when referenced by live content.
- Property gallery images stay in their property-specific folders. Do not move property images during unrelated work.

## 8. Copy and factual-claim rules

- Structured inventory and source docs beat marketing copy.
- `src/inventory/inventory.json` is the source for property facts.
- Do not invent luxury, heritage, oldest, first, built-in, exclusivity, square-metre, distance, or history claims.
- Use safer wording when a claim is plausible but unsupported, such as "connected with" instead of "built in".
- Flag unsupported claims instead of polishing them.
- Keep off-brand Airbnb-style copy, urgency, hype, and generic luxury language out of public pages.

## 9. Stop conditions

Agents must stop when:

- File scope is unclear.
- Build fails with a real source/app error.
- Staged list includes extra files.
- `package-lock.json` changes without `package.json`.
- The requested image file is missing.
- The requested claim is unsupported.
- The task crosses phases.
- The requested cleanup would move, delete, or overwrite tracked files.
