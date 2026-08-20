# Runtime Adapters

The ICM idea is independent of a specific model runtime. What matters is that one root file acts as the global map and that deeper context is loaded selectively.

## Claude Code

Use `CLAUDE.md` as the L0 root map when that is the repository's established convention.

Typical skill path:

```text
.claude/skills/icm-workspace-architect/
```

## Repositories using AGENTS.md

If `AGENTS.md` is already authoritative, treat it as L0. Do not create a parallel `CLAUDE.md` containing competing rules.

Typical project-local skill path in agent-skill repositories may be:

```text
.agents/skills/icm-workspace-architect/
```

The exact skill-discovery path is runtime-specific; preserve the repository's existing convention.

## Mixed runtimes

Preferred pattern:

```text
project/
├── PROJECT-MAP.md      # canonical semantic map
├── AGENTS.md           # thin adapter: read PROJECT-MAP.md
└── CLAUDE.md           # thin adapter: read PROJECT-MAP.md
```

Use this only when both runtimes genuinely require their own root files. Keep runtime adapters short and put shared semantics in one place.

## Browser/project workspaces

When there is no filesystem-aware root-file convention, use the same information model as project instructions/knowledge:

- root map = project instructions;
- room/stage contexts = uploaded/reference files;
- stable references = persistent project knowledge;
- working artifacts = files attached to the current task or run.

The architecture is still useful even if routing is manual.
