# ICM Workspace Architect Skill

A reusable agent skill for designing folder-based AI workspaces from the Clief Notes / Interpretable Context Methodology (ICM) principles.

## What it does

- audits an existing repository before reorganizing it;
- decides between workspace, sequential-stage, and hybrid architectures;
- creates a compact root routing map;
- writes focused workspace/stage `CONTEXT.md` contracts;
- separates stable reference context (L3) from per-run working artifacts (L4);
- makes human review gates explicit;
- identifies deterministic steps that should become scripts rather than repeated AI work;
- can scaffold an approved architecture without overwriting existing files.

## Install

Place the whole `icm-workspace-architect` folder in the skill directory used by your agent runtime.

Examples:

```text
.claude/skills/icm-workspace-architect/
```

or, where the repository already uses a generic agent-skill convention:

```text
.agents/skills/icm-workspace-architect/
```

Keep the repository's existing convention rather than creating a second competing skill system.

## Typical triggers

- "Organize this repo using ICM."
- "Audit my folder structure and context loading."
- "Create a Clief-style folder architecture for this workflow."
- "Turn this manual process into staged folders with review gates."
- "My AGENTS.md/CLAUDE.md is too large — restructure it."
- "Separate stable context from working files."

## Safe default

The skill proposes first and writes second. It should not move, delete, or overwrite project files without explicit approval.

## Optional scaffolder

After an architecture is approved:

```bash
python scripts/scaffold_icm.py templates/workspace-plan.example.json /path/to/project
```

Existing files are skipped by default. Use `--force` only deliberately.

## Method basis

This is an adaptation, not a verbatim reproduction, of the Clief Notes folder-organization guidance and the Interpretable Context Methodology (ICM): root routing, workspace contexts, stage contracts, selective context loading, stable-vs-working context, visible file handoffs, human review, and deterministic tooling for mechanical steps.
