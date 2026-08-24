# ICM Workspace Architect

A reusable agent package for applying Clief Notes / Interpretable Context Methodology (ICM) reasoning to repositories and file-based workflows.

## Permanent rule

**Always use ICM reasoning. Do not force a fixed ICM folder structure.**

Read `ICM_RULES.md` as the canonical reasoning standard. The methodology should govern context routing, workspace/stage boundaries, stable-vs-working context, human review, and deterministic-vs-AI work even when a project keeps its existing folder layout.

## What it does

- audits an existing repository before reorganizing it;
- decides between workspace, sequential-stage, and hybrid architectures;
- creates compact routing rather than broad context loading;
- writes focused workspace/stage `CONTEXT.md` contracts when justified;
- separates stable reference context (L3) from per-run working artifacts (L4);
- makes human review gates explicit;
- identifies deterministic steps that should become scripts rather than repeated AI work;
- can scaffold an approved architecture without overwriting existing files.

## Cold-start objective

A new agent should be able to enter a project and follow:

```text
root map -> route task -> local context -> exact procedure/references -> current artifacts
```

It should not need to recursively read the repository or rediscover unrelated project rules before acting.

## Install

Place the whole `icm-workspace-architect` folder in the skill/procedure directory used by the agent runtime.

Examples:

```text
.claude/skills/icm-workspace-architect/
```

or, where the repository already uses a generic agent convention:

```text
.agents/skills/icm-workspace-architect/
```

Keep the repository's existing convention rather than creating a second competing system.

For repositories where ICM should always govern architecture decisions, add a thin pointer in the canonical root instruction file to:

```text
.agents/skills/icm-workspace-architect/ICM_RULES.md
```

Do not copy the full ICM rules into multiple runtime adapters.

## Typical triggers for the architect procedure

- "Organize this repo using ICM."
- "Audit my folder structure and context loading."
- "Create a Clief-style folder architecture for this workflow."
- "Turn this manual process into staged folders with review gates."
- "My AGENTS.md/CLAUDE.md is too large — restructure it."
- "Separate stable context from working files."

ICM reasoning itself is broader than these triggers and should remain the default architecture lens whenever the package is wired into a project.

## Safe default

The architect proposes first and writes second. It should not move, delete, or overwrite project files without explicit approval.

## Optional scaffolder

After an architecture is approved:

```bash
python scripts/scaffold_icm.py templates/workspace-plan.example.json /path/to/project
```

Existing files are skipped by default. Use `--force` only deliberately.

## Method basis

This is an adaptation, not a verbatim reproduction, of the Clief Notes folder-organization guidance and the Interpretable Context Methodology (ICM): root routing, workspace contexts, stage contracts, selective context loading, stable-vs-working context, visible file handoffs, human review, and deterministic tooling for mechanical steps.
