# Runtime Adapters

ICM is independent of a specific model runtime. The invariant is semantic: one canonical map routes the task, deeper context is loaded selectively, and runtime-specific files remain thin adapters.

## Universal rule

When a project adopts this package as an always-on standard, its canonical root instruction file should point to `ICM_RULES.md` rather than duplicate the rules.

Preferred behavior:

```text
runtime adapter -> canonical project map -> routed local context -> exact procedure/references -> current artifacts
```

Do not make every runtime read every context file at startup.

## Claude Code

Use `CLAUDE.md` as the L0 root map when that is the repository's established convention.

Typical skill path:

```text
.claude/skills/icm-workspace-architect/
```

If ICM should govern architecture decisions globally in the project, add one short rule in `CLAUDE.md` pointing to the installed `ICM_RULES.md`.

## Repositories using AGENTS.md

If `AGENTS.md` is already authoritative, treat it as L0. Do not create a parallel `CLAUDE.md` containing competing rules.

Typical project-local path may be:

```text
.agents/skills/icm-workspace-architect/
```

The exact discovery path is runtime-specific; preserve the repository's existing convention.

## Mixed runtimes

Prefer one canonical semantic map and thin adapters.

Example:

```text
project/
├── PROJECT-MAP.md      # canonical semantic map
├── AGENTS.md           # thin adapter: read PROJECT-MAP.md
└── CLAUDE.md           # thin adapter: read PROJECT-MAP.md
```

Use this only when both runtimes genuinely require their own root files. Do not copy detailed rules into both adapters.

If the repository already has one canonical file and one wrapper, preserve that pattern instead of introducing `PROJECT-MAP.md` merely for symmetry.

## Browser/project workspaces

When there is no filesystem-aware root-file convention, use the same information model as project instructions/knowledge:

- root map = project instructions;
- room/stage contexts = uploaded/reference files;
- stable references = persistent project knowledge;
- working artifacts = files attached to the current task or run.

The architecture remains useful even if routing is manual.

## Token-efficiency rule

Runtime compatibility must not turn into context duplication.

A cold-start agent should read only:

1. the runtime-required root adapter;
2. the canonical project map it points to, if separate;
3. the routed workspace/stage context;
4. the exact stable rules/procedure required for the task;
5. the current working artifact(s).

Do not recursively preload sibling workspaces, all skills, all references, or historical run artifacts.
