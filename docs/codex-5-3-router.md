# Codex 5.3 Task Router

Use this file when GPT-5.5 is coordinating and Codex 5.3 is executing implementation tasks.

## Roles

**Coordinator: GPT-5.5**

- Break work into small, independent tasks.
- Decide which files Codex 5.3 should touch.
- Provide exact instructions, constraints, and verification commands.
- Review Codex 5.3 output before the next task.
- Keep commits clean and separated by scope.

**Executor: Codex 5.3**

- Follow one task packet at a time.
- Read the required project files before editing.
- Modify only the allowed files unless blocked.
- Run the requested verification commands.
- Report changed files, checks, blockers, and any uncertainty.

## Project Rules To Always Include

Every task packet to Codex 5.3 must include:

```text
Work in D:\_projects\_traditional-homes.

Read first:
- AGENTS.md
- CLAUDE.md
- docs/agent-handoff-notes.md

Do not use git add .
Do not commit .agent/, .ai/, .claude/, .codex/, CLAUDE.md, or package-lock.json unless explicitly requested.
Never place markdown under src/pages/.
Astro treats markdown under src/pages/ as public routes.
Keep code simple, static-first, and content-driven.
Run npm run typecheck and npm run build after user-facing changes.
If build fails with Windows EPERM/cache lock, classify it as environment/cache and retry once.
```

## Routing Categories

### Blog Content

Use for research-to-blog work.

Required skill/context:

```text
Use .agents/skills/blog-research-article/SKILL.md.
Use .agents/skills/brand-content-audit-and-rewrite/SKILL.md.
```

Allowed files:

```text
docs/research/**
src/content/blog/**
docs/agent-handoff-notes.md
```

Verification:

```powershell
rg --files src/pages | rg "\.md$"
npm run typecheck
npm run build
```

### Blog Structure And SEO

Use for blog index, categories, card display, article metadata, and internal linking.

Allowed files:

```text
src/pages/blog/index.astro
src/pages/blog/[...slug].astro
src/content/blog/**
src/content.config.ts
docs/agent-handoff-notes.md
```

Verification:

```powershell
npm run typecheck
npm run build
```

### Property Content

Use for house/villa copy or inventory-based property facts.

Required skill/context:

```text
Use .agents/skills/property-content-audit/SKILL.md.
Use src/inventory/inventory.json as source of truth.
```

Allowed files:

```text
src/content/houses/**
src/content/villa/**
src/inventory/inventory.json
src/components/AtAGlance.astro
docs/agent-handoff-notes.md
```

Verification:

```powershell
npm run typecheck
npm run build
```

### UI Or Map Behavior

Use for layout, buttons, filters, galleries, maps, and page behavior.

Allowed files:

```text
src/components/**
src/components/maps/**
src/pages/en/**
src/layouts/**
src/styles/**
tailwind.config.js
docs/agent-handoff-notes.md
```

Verification:

```powershell
npm run typecheck
npm run build
```

Browser verification is required for map or mobile navigation changes.

### Build Or Deploy Tooling

Use only for Astro config, sitemap, headers, scripts, TypeScript config, and ignore rules.

Allowed files:

```text
astro.config.mjs
tsconfig.json
.gitignore
public/_headers
inject_srcset.cjs
update_data.js
docs/agent-handoff-notes.md
```

Verification:

```powershell
npm run typecheck
npm run build
```

## Task Packet Template

Send Codex 5.3 one packet at a time.

```text
Work in D:\_projects\_traditional-homes.

Task type: <Blog Content | Blog Structure And SEO | Property Content | UI Or Map Behavior | Build Or Deploy Tooling>

Read first:
- AGENTS.md
- CLAUDE.md
- docs/agent-handoff-notes.md
- <relevant skill files>
- <relevant source files>

Goal:
<one concrete outcome>

Allowed files:
- <exact files or directories>

Do not touch:
- .agent/
- .ai/
- .claude/
- .codex/
- CLAUDE.md
- package-lock.json
- src/pages/*.md

Instructions:
1. <specific step>
2. <specific step>
3. <specific step>

Verification:
Run:
- npm run typecheck
- npm run build

If build fails with Windows EPERM/cache lock, classify it as environment/cache and retry once.

Report back with:
- Files changed
- Summary of changes
- Verification results
- Any skipped items or blockers
- Whether this is ready for coordinator review
```

## Codex 5.3 Report Format

Ask Codex 5.3 to respond in this format:

```text
Files changed:
- ...

Summary:
- ...

Verification:
- npm run typecheck: pass/fail
- npm run build: pass/fail

Risks or uncertain facts:
- ...

Ready for coordinator review:
Yes/No
```

## Coordinator Review Checklist

Before approving a Codex 5.3 task:

- [ ] Changed files match the allowed scope.
- [ ] No local workflow files are staged or modified by the task.
- [ ] No markdown was added under `src/pages/`.
- [ ] Blog/property copy follows the project voice.
- [ ] Unsupported claims are removed or marked only in research notes.
- [ ] Build/typecheck results are fresh.
- [ ] Handoff notes are updated when work is multi-step or important.

## Commit Rule

After coordinator approval, stage with explicit pathspecs only.

Use:

```powershell
git add <exact-file-1> <exact-file-2>
git diff --cached --stat
git commit -m "<scope-specific message>"
```

Never use:

```powershell
git add .
```
