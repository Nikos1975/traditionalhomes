# Project

- Astro website
- Static-first
- Tailwind CSS
- Content-driven structure
- No heavy JS

# Working rules

- Keep code simple
- Avoid unnecessary dependencies
- Use structured content, not hardcoded text
- Maintain performance and SEO
- Prefer minimal changes before broad refactors
- Separate environment/cache issues from real code/content issues
- Do not start consolidation refactors unless explicitly asked
- Never place AGENTS.md or internal instruction markdown under src/pages/
- Astro treats markdown under src/pages/ as public routes
- When work is multi-step, paused, or important for future agents, update `docs/agent-handoff-notes.md` with what changed, what was verified, what remains, and any blockers
- Keep handoff notes short and factual; do not duplicate every diff

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
- Do not commit .claude/, CLAUDE.md, or .ai/ unless explicitly requested

# Brand voice

- Calm, precise, understated
- No hype, urgency, or sales language
- No clichés or generic luxury/travel phrasing
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

- Keep writing observational, grounded, and useful
- If a fact is uncertain, leave it out or mark it for verification
- Do not turn blog posts or guides into booking copy
- Start with a clear scene, fact, or grounded context
- Prefer place, distance, atmosphere, and practical relevance
- Keep paragraphs readable and specific
- Avoid generic destination-guide phrasing
- Use quiet, factual endings rather than promotional conclusions

# SEO/content rules

- Keep titles and headings clear and specific
- Avoid clickbait
- Prefer durable content over trend-driven content
- Make sure each article matches the actual page/topic precisely
