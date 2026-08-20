# Agent Operating Model

This document explains how agents should work in this repo before editing, staging, or committing.

## 1. Instruction hierarchy

`CLAUDE.md` is canonical for this repo. It controls the project rules, build/debug workflow, commit policy, brand voice, content rules, and source-of-truth expectations.

`AGENTS.md` is a wrapper for non-Claude agents. It should stay minimal and point agents to `CLAUDE.md` and the editorial routing files.

`.ai/brand/website-brand-style-guide.md` controls shared tone.

`.ai/prompts/website-editorial-system.md` controls property, homepage, collection, and property-related location copy.

`.ai/prompts/blog-editorial-system.md` controls blog, guide, village-guide, and area-guide copy unless the task is explicitly property-page copy.

`.agents/skills/*/SKILL.md` files are task-triggered procedural workflows. Use the relevant skill when the task matches its description.

`docs/architecture/*` defines repo decisions that agents must not override casually, including source-of-truth, media ownership, and slug decisions.

If instructions appear to conflict, follow `CLAUDE.md` first, then the relevant architecture document, then the relevant skill or editorial prompt for the task.

### External / generic workflows and Superpowers Ultra

Repo-local instructions and repo-local skills take precedence over external, generic, environment-level, Superpowers, or Obra-style workflows.

External process skills may be used as background methodology, but they must not override this repo's file scope, build rules, commit rules, media rules, source-of-truth rules, or copy/factual-claim rules.

When available, agents should use Superpowers Ultra or an equivalent token-minimizing workflow as the default execution mode. This means:

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

If a concrete Superpowers Plan Mode tool is available in the environment, agents may use it as an efficiency layer. If it is not available, agents should apply the same behavior manually: plan briefly, read only targeted files, avoid repeated rediscovery, and keep output concise and action-focused.

Planning and token minimization must not override repo-local instructions, file scope, build requirements, commit rules, or stop conditions.

## 2. Always-read vs task-triggered files

| File or folder | Read always? | Read when? | Purpose |
|---|---:|---|---|
| `CLAUDE.md` | Yes | Before any repo task | Canonical project, build, content, and commit rules. |
| `AGENTS.md` | Yes | Before any repo task | Wrapper that routes agents to `CLAUDE.md` and editorial systems. |
| `.ai/brand/` | No | Public-facing copy, editorial review, tone decisions | Shared brand voice and tone source. |
| `.ai/prompts/` | No | Website copy, blog posts, guides, property content | Editorial systems by content type. |
| `.agents/skills/` | No | When a task matches a skill description | Procedural workflows for builds, content audits, commits, and research articles. |
| `docs/architecture/` | No | Source-of-truth, media, slug, routing, or structural decisions | Durable repo architecture decisions. |
| `src/inventory/inventory.json` | No | House or villa facts, access, capacity, parking, groups, constraints | Canonical structured property facts. |
| `docs/operations/` | No | Agent process, known failure handling, commit workflow | Operating model and repeated-failures playbook. |

## 3. Skills routing

| Skill | When to use | When not to use | Required inputs | Expected output |
|---|---|---|---|---|
| `astro-build-triage` | Astro build failures, content validation, Windows cache locks, minimal repair work | Broad redesigns, copy rewrites, commit planning | Current repo state, build error, affected files | Root-cause classification, smallest safe fix, build result. |
| `blog-research-article` | Creating or revising Astro blog articles from `docs/research`, especially Elounda history, guide, tourism, or local context posts | Property pages, pure UI work, unrelated docs | Topic brief, research folder, content schema, existing posts, brand/editorial rules | Claim-reviewed `source-notes.md`, a validated `draft: true` article, and a draft PR for manual approval. |
| `traditional-homes-article-visual-plan` | Planning evidence-led visuals for a blog post or guide before image work | Image generation, processing, article integration, publication, or social posting | Article/topic brief, research packet, claim register, image-rights register, brand/editorial rules | A validated `docs/research/blog/<slug>/visual-plan.md` with purpose, evidence, rights, placement, accessibility, crop, destination, approval, and blockers. |
| `brand-content-audit-and-rewrite` | Rewriting or auditing public-facing copy for brand voice | Pure code/build tasks, commit-only tasks | Existing copy, content type, factual sources | Revised copy, edits made, removed unsupported claims, remaining gaps. |
| `clean-commit-planner` | Dirty working trees, mixed changes, commit grouping, pathspec staging plans | Single-file investigation where no staging is planned | `git status`, generated commit-plan groups, reviewed diffs | Clean commit groups, explicit staging scope, build/typecheck guidance. |
| `property-content-audit` | House or villa page audits, rewrites, inventory accuracy checks | Blog posts, general UI-only work | `src/inventory/inventory.json`, relevant house/villa content | Fact-checked property copy or audit checklist with unsupported claims flagged. |

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
- Stage explicit paths only, or a reviewed pathspec file generated by the clean-commit planner.
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
