# ICM Context Standard

This repository uses Interpretable Context Methodology (ICM) reasoning as the default architecture lens for agent context, folders, workflows, and reusable procedures.

## Repository rule

Always use ICM reasoning. Do not force a fixed ICM folder structure.

The runtime-local standard is:

`.agents/skills/icm-workspace-architect/ICM_RULES.md`

The cross-project upstream is the pinned shared skill in `Nikos1975/nikos-agent-skills`. The source commit, path, and canonical-rules hash are recorded in `.agents/skills.lock.yaml`. Runtime work uses the local copy; it does not require access to the shared repository.

`CLAUDE.md` remains the canonical project instruction file. `AGENTS.md` remains a thin wrapper for non-Claude agents. ICM does not replace either file; it governs how context is routed and how new workspace/stage boundaries are evaluated.

## Cold-start path

A new agent should follow:

```text
AGENTS.md / CLAUDE.md
        ↓
classify and route the current task
        ↓
relevant local context only
        ↓
exact skill / procedure / stable reference
        ↓
current working artifact(s)
```

Do not recursively read all repository instructions, skills, references, research folders, or historical work by default.

## Traditional Homes routing map

| Task class | First route | Then load only what is needed |
| --- | --- | --- |
| Repository architecture, folder/context design, workflow organization | `.agents/skills/icm-workspace-architect/ICM_RULES.md` | Relevant architecture files and current task artifacts |
| Blog, area guide, village guide, historical article, revision, audit, publication, or blog image | `BLOG_ORCHESTRATOR.md` | One routed blog skill, `docs/operations/blog-production.md`, then only required research/editorial references |
| Multilingual routes, pages, or translations | `docs/i18n/00_I18N_MASTER_PLAN.md` | Relevant locale, route-map, page, and translation files only |
| Property facts or property copy | `CLAUDE.md` house/editorial rules | `src/inventory/inventory.json`, the exact property content/page, and `.ai/prompts/website-editorial-system.md` when copy judgment is required |
| UI/component/code work | `CLAUDE.md` | Exact source/component files; architecture docs only when the change is structural |
| Build, commit, branch, or debugging process | `docs/operations/agent-operating-model.md` | `docs/operations/repeated-failures-playbook.md` only after a matching failure or known failure class appears |
| Historical task context | targeted search in `docs/agent-handoff-notes.md` | Exact matching section for the topic, slug, PR, command, or failure; never the full archive by default |

## Context layers

Use L0–L4 conceptually:

- L0: project map and global routing;
- L1: workspace context when a distinct mental mode needs local rules;
- L2: procedure or stage contract;
- L3: stable reusable rules and references;
- L4: current-run working artifacts.

The layers are reasoning boundaries, not mandatory physical folders.

## Efficiency requirements

- Reuse context already loaded in the session when unchanged.
- Prefer targeted reads and exact paths.
- Keep runtime adapters thin.
- Avoid duplicated rules.
- Prefer descriptive procedure filenames when runtime constraints allow them.
- Use deterministic scripts/tests for mechanical repeatable work.
- Create new workspaces or stages only when they reduce context leakage or clarify a real handoff.
- Treat the actual `.agents/skills/` directory as authoritative for installed project-local skills. Do not infer that a skill exists only because an older document names it.
- Model-specific or coordinator-specific routing documents are not universal project routers; use them only when that specific workflow is explicitly requested.

## Shared-skill maintenance

Shared skills are vendored locally and updated only through explicit review. Do not point runtime instructions at a floating shared branch. A shared upstream update becomes active in this project only after the local installed copy and `.agents/skills.lock.yaml` are deliberately updated together.

## Handoff archive rule

`docs/agent-handoff-notes.md` is a historical archive, not cold-start context. Search it by exact task identifier and read the smallest matching section. Current root/project rules, architecture docs, source-of-truth data, and routed skills take precedence over old handoff entries when they differ.

## Change rule

For an existing repository, preserve working architecture. Any ICM-driven restructuring should start with a read-only audit and a minimal-change proposal before files are moved, renamed, deleted, or broadly reorganized.
