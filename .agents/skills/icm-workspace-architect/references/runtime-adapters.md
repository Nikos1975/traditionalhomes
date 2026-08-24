# ICM Runtime Adapters

ICM is runtime-independent. The semantic invariant is one canonical project map, selective context loading, and thin runtime-specific adapters.

## General pattern

```text
runtime root instruction
  -> canonical project map/routing
  -> routed workspace or procedure
  -> exact stable references
  -> current artifacts
```

Do not make runtime compatibility create duplicated instruction systems.

## Claude Code

If `CLAUDE.md` is already the canonical project file, keep it as the root map. Add only a short pointer to the locally installed `ICM_RULES.md` when ICM should govern architecture reasoning.

## AGENTS.md projects

If `AGENTS.md` is authoritative, keep it as the root map. Do not introduce a parallel root authority only to match an example structure.

## Mixed runtimes

Prefer one canonical semantic map and thin wrappers for each runtime. If the repository already has one canonical file and one wrapper, preserve that pattern.

## OpenCode and other runtimes

Use the runtime's established project-instruction convention. The important behavior is routing and selective reads, not the filename.

## Shared-skill installation

Cross-project shared skills should be vendored or deterministically copied into the project's established skill directory and pinned to a reviewed source commit. The project root should point to the local installed copy.

Avoid floating-branch runtime dependencies. A project should remain operable even when the shared repository is unavailable.

## Token efficiency

A cold-start agent should normally read only the runtime-required root file, the selected router/context, the exact procedure or stable rules needed for the task, and the current artifacts. Do not preload sibling workspaces or the full shared-skill catalog.
