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
- See `docs/operations/agent-operating-model.md` and `docs/operations/repeated-failures-playbook.md` for process rules and known failure handling.
- Prefer minimal changes before broad refactors
- Separate environment/cache issues from real code/content issues
- Do not start consolidation refactors unless explicitly asked
- Never place AGENTS.md or internal instruction markdown under src/pages/
- Astro treats markdown under src/pages/ as public routes
- When work is multi-step, paused, or important for future agents, update `docs/agent-handoff-notes.md` with what changed, what was verified, what remains, and any blockers
- Keep handoff notes short and factual; do not duplicate every diff

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
- When auditing or rewriting property pages, use the project skill `.agents/skills/property-content-audit/SKILL.md`

# Blog and guide rules

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
