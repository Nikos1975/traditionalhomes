# ICM Rules

These rules define the default context-architecture reasoning for agent work.

## Core principle

**Always use ICM reasoning. Do not force a fixed ICM folder structure.**

The goal is to give an agent the minimum context required to perform the current task correctly, while keeping project state, handoffs, and consequential decisions inspectable.

## Cold-start protocol

When entering an unfamiliar project or beginning a materially different task:

1. Read the repository's established root instruction/map file.
2. Route the task to the smallest relevant workspace or stage.
3. Read that workspace/stage context only when it is needed.
4. Read only the stable rules, references, procedures, and current artifacts required by the active task.
5. Follow links outward only when the active context identifies them as necessary.
6. Do not recursively read sibling workspaces or the entire repository by default.
7. Reuse context already loaded in the current session unless it changed or an unresolved question requires rereading.

## ICM layers

Classify context conceptually as:

- **L0 — Map / routing:** project identity, task routing, critical global constraints.
- **L1 — Workspace context:** rules and resources for one distinct mental mode.
- **L2 — Procedure or stage contract:** Inputs → Process → Outputs → Done criteria → Review boundary.
- **L3 — Stable references:** schemas, conventions, style rules, reusable procedures, templates, domain references.
- **L4 — Working artifacts:** current-run sources, research, drafts, plans, generated data, review notes, outputs.

Do not mix long-lived L3 rules with run-specific L4 material.

## Routing rules

- Every common task should have one obvious route.
- Prefer one canonical semantic map and thin runtime adapters.
- Do not duplicate full instructions across `AGENTS.md`, `CLAUDE.md`, `CONTEXT.md`, or other adapters.
- The root map should route, not contain every detailed rule.
- Do not load sibling workspace context unless the task genuinely crosses that boundary.

## Workspace and stage rules

Create a **workspace** only when the thinking mode, rules, tools, or required context changes materially.

Create a **stage** only when order matters and one step intentionally produces an artifact consumed by the next step.

For a meaningful sequential stage, define:

- inputs;
- process;
- outputs;
- done criteria;
- unresolved issues;
- review gate;
- next allowed action.

Do not create artificial numbered stages for a simple single transformation.

## Stable rules versus working state

Use stable reference files for constraints expected to remain substantially valid across many runs.

Keep current task material in working artifacts or the repository's existing run-specific location.

Do not promote temporary observations, drafts, or unresolved assumptions into stable project rules.

## Deterministic versus judgment work

Prefer the lowest reliable layer:

- deterministic scripts/tests for mechanical, repeatable, testable work;
- rules/templates/procedures for stable workflow logic;
- AI judgment for interpretation, ambiguity, synthesis, and strategy.

Do not repeatedly spend model tokens on work a small deterministic script can perform more reliably.

## Human review

Keep consequential handoffs visible and inspectable.

Require explicit review or approval before actions that are public, destructive, financially consequential, hard to reverse, or dependent on unresolved factual judgment.

Approval of one stage does not automatically authorize downstream stages.

## Existing-project rule

When applying ICM to an existing project:

1. inspect the current architecture first;
2. preserve what already works;
3. identify routing gaps, context leaks, duplication, and mixed state;
4. propose the smallest material improvement;
5. wait for approval before moving, renaming, deleting, or broadly restructuring files;
6. migrate incrementally and validate routing after each approved change.

Do not redesign a repository merely to resemble an example ICM tree.

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
