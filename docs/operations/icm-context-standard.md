# ICM Context Standard

This repository uses Interpretable Context Methodology (ICM) reasoning as the default architecture lens for agent context, folders, workflows, and reusable procedures.

## Repository rule

Always use ICM reasoning. Do not force a fixed ICM folder structure.

The canonical reusable standard is:

`.agents/skills/icm-workspace-architect/ICM_RULES.md`

`CLAUDE.md` remains the canonical project instruction file. `AGENTS.md` remains a thin wrapper for non-Claude agents. ICM does not replace either file; it governs how context is routed and how new workspace/stage boundaries are evaluated.

## Cold-start path

A new agent should follow:

```text
AGENTS.md / CLAUDE.md
        ↓
route the current task
        ↓
relevant local context only
        ↓
exact skill / procedure / stable reference
        ↓
current working artifact(s)
```

Do not recursively read all repository instructions, skills, references, research folders, or historical work by default.

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

## Change rule

For an existing repository, preserve working architecture. Any ICM-driven restructuring should start with a read-only audit and a minimal-change proposal before files are moved, renamed, deleted, or broadly reorganized.
