# ICM Rules

These rules define the default context-architecture reasoning for agent work.

## Core principle

**Always use ICM reasoning. Do not force a fixed ICM folder structure.**

The goal is to give an agent the minimum context required to perform the current task correctly, while keeping project state, handoffs, and consequential decisions inspectable.

## Cold-start protocol

When entering an unfamiliar project or beginning a materially different task:

1. Read the runtime-required root adapter.
2. Use the authoritative project route already provided by the active parent context. If it does not resolve the task, read the smallest relevant canonical routing map.
3. If the task involves architecture, context, routing, workspace, or procedure design, load the project's local pinned copy of these ICM rules.
4. Route to one workspace or procedure.
5. Load only the L3 rules and references required by that route.
6. Load the current L4 artifacts required for the task.

## Selective context loading

Route before loading detailed context. Every additional instruction, reference, procedure, or skill read must answer a specific unresolved question required to execute the active task. Stop loading context once the task can be performed correctly.

- Do not read sibling procedures or references speculatively or preload context for possible future use.
- Do not read compatibility or discovery wrappers when authoritative routing has already resolved the route.
- Do not load inventory or registry documentation unless the task concerns inventory, installation, discovery metadata, validation, publishing, or registration.
- Do not load ICM files for ordinary non-ICM tasks merely because ICM is installed. Load them only when ICM-specific architecture, context, routing, workspace, stage, or procedure-design reasoning is required.
- Reuse authoritative routing and context already provided by the active parent context unless it has changed or conflicts with the current task.
- An unresolved ambiguity, conflict, or missing target is a valid reason to read one additional relevant file.
- Do not load sibling workspaces, all skills, historical outputs, or the entire repository.

## ICM layers

Classify context conceptually as:

- **L0 — Map / routing:** project identity, task routing, critical global constraints.
- **L1 — Workspace context:** rules and resources for one distinct mental mode.
- **L2 — Procedure or stage contract:** reusable workflow or sequential handoff contract.
- **L3 — Stable references:** schemas, conventions, style rules, reusable procedures, templates, domain references.
- **L4 — Working artifacts:** current-run sources, research, drafts, plans, generated data, review notes, outputs.

Do not mix long-lived L3 rules with run-specific L4 material.

These layers are conceptual boundaries, not mandatory folder or filename conventions. A small project may legitimately use only `CLAUDE.md`, `instructions/`, `src/`, and `tests/`. Do not require `CONTEXT.md`, `stages/`, `_config/`, or numbered folders unless the actual work justifies those boundaries.

## Routing rules

- Every common task should have one obvious route.
- Prefer one canonical semantic map and thin runtime adapters.
- Do not duplicate full instructions across `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, or other adapters.
- The root map should route, not contain every detailed rule.
- Do not load sibling workspace context unless the task genuinely crosses that boundary.

## Stable rules versus working state

Use stable reference files for constraints expected to remain substantially valid across many runs.

Keep current task material in working artifacts or the repository's existing run-specific location.

Do not promote temporary observations, drafts, or unresolved assumptions into stable project rules.

## Human review

Consequential, destructive, public, financially significant, hard-to-reverse, or factually unresolved actions require an explicit review or approval boundary.

## Token-efficiency invariant

A cold-start agent should be able to:

**root map → route task → load local context → load exact procedure/references → work on current artifacts**

without first reading unrelated project areas.

Optimize for:

- minimum necessary context;
- unambiguous routing;
- single sources of truth;
- focused files rather than giant instruction dumps;
- references instead of copied rules;
- deterministic validation where possible;
- no repeated rediscovery of already-known repository state.

## Durability test

The architecture is healthy when an agent with no prior conversation history can enter at the project root, identify the correct route, load only the relevant context, understand its allowed actions, and produce an inspectable result without requiring oral explanation of hidden project conventions.
