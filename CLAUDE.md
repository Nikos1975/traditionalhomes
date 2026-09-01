# Project

- Astro website
- Static-first
- Tailwind CSS
- Content-driven structure
- No heavy JS
- For repo structure, see docs/architecture/repo-wireframe.md.
- For the Mermaid source, see docs/architecture/repo-wireframe.mmd.

# Working rules

- Keep code simple
- Avoid unnecessary dependencies
- Use structured content, not hardcoded text
- Maintain performance and SEO
- For ICM-specific repository architecture, context loading, routing, workspace/stage boundaries, and reusable workflow organization, read `.agents/skills/icm-workspace-architect/ICM_RULES.md`, then continue to the exact procedure:
  - existing-project ICM audit or refinement: `.agents/skills/icm-workspace-architect/icm_existing_project_audit.md`
  - new-project ICM adoption: `.agents/skills/icm-workspace-architect/icm_new_project_bootstrap.md`
  - general ICM architecture, context, routing, workspace, stage, or procedure design: `.agents/skills/icm-workspace-architect/icm_workspace_architect.md`
- Load ICM references only when the selected procedure identifies a concrete unresolved question. Do not force a fixed folder structure.
- Load `docs/operations/agent-operating-model.md` only for process, commit, build, branch, or debugging work that needs it. Load `docs/operations/repeated-failures-playbook.md` only after a matching failure or known failure class appears.
- Prefer minimal changes before broad refactors
- Separate environment/cache issues from real code/content issues
- Do not start consolidation refactors unless explicitly asked
- Never place AGENTS.md or internal instruction markdown under src/pages/
- Astro treats markdown under src/pages/ as public routes
- When work is multi-step, paused, or important for future agents, update `docs/agent-handoff-notes.md` with what changed, what was verified, what remains, and any blockers
- Keep handoff notes short and factual; do not duplicate every diff

## Agent efficiency

- Reuse context already loaded in the current session. Reread files only when they changed or a specific unresolved question requires it.
- Read only the skill and instruction files relevant to the task; do not repeatedly reload them in the same session.
- Do not read `docs/agent-handoff-notes.md` wholesale. Search it for the exact topic, slug, PR, command, or failure only when historical task context is required.
- Prefer targeted `rg`, focused diffs, and small line ranges over dumping whole files.
- For complex multi-file exploration, prefer an existing fresh Graphify graph before broad grep or file reads, including a matching graph held in a separate worktree only when its source SHA matches the relevant repository base.
- Use a small Graphify query budget (normally 1000–1500 tokens); treat its results as navigation evidence and verify the exact source before editing.
- Do not use Graphify for obvious single-file or local tasks, and do not automatically rebuild graphs during ordinary work.
- Do not trigger semantic or LLM extraction unless explicitly required.
- If the graph is missing, stale, incomplete, or does not cover the relevant files, fall back to targeted `rg` and source reads.
- Graphify never overrides correctness, protected-file rules, or source verification; keep its output local and untracked.
- Check repository/worktree state at the start, before commit, and after commit unless there is a concrete reason to recheck sooner.
- During implementation, run the smallest relevant tests first; run the full validation suite once after the change is complete unless a failure requires another run.
- Group safe shell commands and avoid narrating routine command execution. Report material findings, decisions, and concrete blockers only.
- Do not repeat the task specification, rediscover known branch/worktree facts, or print large generated files when targeted field checks, hashes, parsers, or tests are sufficient.
- Do not pause only to report partial progress. Continue until completion or a genuine blocker.
- Keep final reports concise: changed scope, validation, commit/PR state, and remaining issues.
- Token efficiency never overrides correctness, safety, protected-file rules, verification gates, or required approvals.
- For command or tool failures, follow the Failure Budget and Tool Retry Policy in `docs/operations/agent-operating-model.md`: classify the failure before retrying, use at most one documented remediation plus one retry for the same environment failure, preserve successful validation evidence, and stop rather than entering environment-repair loops.

## Documentation update rules

When adding, removing, renaming, or significantly changing a website section, route, component, content collection, data file, API function, or user-facing flow, update the relevant documentation in the same task.

Minimum documentation updates:

* Update `docs/agent-handoff-notes.md` with what changed, what was verified, and what remains.
* Update `docs/architecture/repo-wireframe.md` and `docs/architecture/repo-wireframe.mmd` if the repo structure, route structure, main flows, or component relationships changed.
* Update any relevant operational docs under `docs/operations/` if the change affects build, deploy, debugging, or known failure handling.
* If a new public page/route is added, document its purpose, route path, source files, and any data dependencies.

Do not update architecture documentation for tiny copy edits or cosmetic-only changes unless the change affects structure or future agent understanding.

Before finishing, report whether documentation was updated or why no documentation update was needed.

# Build/debug workflow

1. First classify the issue:
   - content/schema validation
   - code/type/build logic
   - Windows filesystem/cache lock
2. Fix environment/cache issues before touching architecture
3. Prefer the smallest safe fix
4. Run the build after changes when the environment supports Node/npm
5. If build passes, stop and report Phase 2 separately

# Commit policy

- Keep product code changes separate from local workflow/tooling files
- Do not commit temporary artifacts such as dist_old_* or cache leftovers
- Do not commit .claude/, temporary AI scratch files, or local agent outputs unless explicitly requested. CLAUDE.md and AGENTS.md are committed project instruction files.

# Brand voice

- Calm, precise, understated
- No hype, urgency, or sales language
- No clichés, booking language, or generic luxury/travel phrasing
- Use concrete details over adjectives
- Prefer trust, clarity, control, and factual tone
- Do not make unsupported claims

# House page rules

- Preserve existing house-page structure unless a change is clearly required
- Hero selection should be data-driven, not filename-driven
- Suggested pairings are recommendation-only, not filterable inventory
- Official groups and suggested pairings must remain separate
- Prefer factual, low-risk UI changes over broader refactors
- Describe layout, setting, view, privacy, access, and practical use clearly
- Use `src/inventory/inventory.json` as the source of truth for sleeps, bedrooms, bathrooms, floors, stairs, pool, view, parking, access notes, constraints, official groups, and suggested pairings
- Do not publish placeholders, bracketed draft copy, or conditional notes
- Mark unsupported square-metre, history, distance, and exclusivity claims for verification instead of guessing

# Blog and guide rules

For every blog post, area guide, village guide, historical article, blog revision, blog audit, publication, or blog-image task, read `BLOG_ORCHESTRATOR.md` before researching, drafting, editing, validating, processing media, or publishing.

- Keep writing observational, grounded, useful, and non-promotional
- If a fact is uncertain, leave it out or mark it for verification
- Do not turn blog posts or guides into booking copy
- Start with a clear scene, fact, or grounded context
- Prefer place, distance, atmosphere, and practical relevance
- Keep paragraphs readable and specific
- Avoid generic destination-guide phrasing
- Use quiet, factual endings rather than promotional conclusions

# Editorial routing

- `.ai/brand/website-brand-style-guide.md` is the shared source of truth for website and blog tone
- For property pages, homepage sections, collection copy, and property-related location copy, use `.ai/prompts/website-editorial-system.md`
- For blog posts, area guides, village guides, and broader place-based editorial content, use `.ai/prompts/blog-editorial-system.md`
- Area guides follow the blog editorial system unless the task is explicitly property-page copy
- Do not duplicate these instruction files into page content or local task notes unless explicitly requested

# SEO/content rules

- Keep titles and headings clear and specific
- Avoid clickbait
- Prefer durable content over trend-driven content
- Make sure each article matches the actual page/topic precisely

# Project memory imports

@.ai/memory/conventions.md
@.ai/memory/current-task.md
@.ai/memory/decisions.md
@.ai/memory/bugs.md
@.ai/memory/handoff.md
