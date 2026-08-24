# ICM Context Audit — 2026-08-24

## Scope

Read-only review of the repository's agent/context architecture, followed by minimal routing corrections on PR #60. No product folders, routes, content, assets, dependencies, deployment configuration, or application behavior were changed.

## Architecture decision

Keep the repository as a hybrid ICM architecture. Do not introduce a generic root `CONTEXT.md` or numbered repository-wide stages.

- `CLAUDE.md` remains the canonical project instruction file.
- `AGENTS.md` remains a thin non-Claude adapter.
- `BLOG_ORCHESTRATOR.md` remains the blog-workspace router.
- `.agents/skills/` remains the procedure layer.
- `.ai/brand/`, `.ai/prompts/`, `docs/architecture/`, and structured source-of-truth files remain stable reference context.
- Current research packets, drafts, branch/PR changes, and run artifacts remain task-specific working context.

## Verified findings

### 1. Broad operational reads

Root instructions previously pointed generally at the operating model and repeated-failures playbook. Those files are now task-triggered: process/build/commit/debug work loads the operating model, while the failure playbook loads only after a matching failure class appears.

### 2. Handoff archive was unsuitable for cold start

`docs/agent-handoff-notes.md` is a large historical archive. It is now explicitly search-only context: agents should locate the exact topic, slug, PR, command, or failure and read the smallest matching section rather than loading the file wholesale.

### 3. Blog routing reread root context unnecessarily

`BLOG_ORCHESTRATOR.md` previously instructed agents to read both `AGENTS.md` and `CLAUDE.md` again. It now assumes runtime root instructions are already loaded and routes to one blog skill plus only the references needed for that mode.

### 4. Skill routing contained stale project-local skill names

The operating model named project-local skills that are not present in the current `.agents/skills/` directory. The current directory and each installed skill's frontmatter are now authoritative, and the routing table has been aligned to the installed skill set.

### 5. Property routing referenced an absent skill

`CLAUDE.md` referenced `.agents/skills/property-content-audit/SKILL.md`, which is not installed in the current project-local skill directory. That stale route was removed. Property facts continue to route through `src/inventory/inventory.json`; property copy uses the website editorial system when needed.

## Cold-start target

```text
runtime root adapter
    ↓
CLAUDE.md project rules
    ↓
classify task
    ↓
one task router / exact source-of-truth
    ↓
relevant skill or stable references only
    ↓
current working artifacts
```

## Explicit non-changes

- No repository-wide `CONTEXT.md` hierarchy added.
- No existing product/workflow folders moved or renamed.
- No numbered stages added where the work does not require sequential handoffs.
- No automatic publication, merge, deployment, deletion, or other consequential action introduced.

## Remaining caution

Model-specific historical routing documents may contain older model names, paths, or procedures. They are not universal project routers and should be used only when that exact coordinator/executor workflow is explicitly requested.
