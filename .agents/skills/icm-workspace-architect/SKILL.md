---
name: icm-workspace-architect
description: Use for ICM architecture, new-project bootstrap, existing-project audit, or this skill's discovery and entrypoint inspection.
---

# ICM Workspace Architect

This is a thin compatibility and discovery wrapper, not the canonical ICM methodology.

## ICM architecture routes

Read `ICM_RULES.md` first, then exactly one procedure:

- new-project adoption → `icm_new_project_bootstrap.md`;
- existing-project audit or refinement → `icm_existing_project_audit.md`;
- general ICM architecture design or refinement → `icm_workspace_architect.md`.

## Runtime and discovery routes

- Skill discovery or entrypoint inspection → this wrapper only.
- Runtime-adapter or mixed-runtime compatibility → `references/runtime-adapters.md`; add this wrapper only when discovery behavior is relevant.
- Runtime-related ICM architecture, context, or routing design → `ICM_RULES.md`, then `icm_workspace_architect.md`; add `references/runtime-adapters.md` only when runtime-specific guidance is required.

For an ICM architecture route, load only an exact reference named by the selected procedure for a concrete unresolved question. Do not preload references.
