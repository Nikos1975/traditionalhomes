# ICM Existing-Project Audit Procedure

Use this procedure to audit or refine a project that already has agent-facing instructions, routing, procedures, or working conventions. Read `ICM_RULES.md` first.

## Lifecycle

**inspect → diagnose → minimal proposal → approval → incremental change → validation**

1. **Inspect:** map the current root routing, workspace contexts, procedures, stable references, current-run artifacts, deterministic tooling, and review gates before proposing changes.
2. **Diagnose:** identify missing or competing routes, unnecessary context loading, duplicated sources of truth, mixed stable/current state, unjustified boundaries, and missing validation or review ownership.
3. **Minimal proposal:** preserve conventions that work and propose only changes with an observed routing, context, handoff, ownership, or validation benefit.
4. **Approval:** present the proposal and wait for explicit approval before broad moves, renames, deletions, or restructuring.
5. **Incremental change:** implement only the approved scope in reviewable steps and check routing after each material step.
6. **Validation:** verify that a cold-start agent can enter through the runtime adapter and canonical map, select one procedure, load only a concretely required reference and current artifact, and stop without unrelated context.

## Conditional references

- If diagnosis leaves a concrete architecture, deterministic-execution, or review-gate boundary unresolved, read `references/decision-rules.md` and apply only the relevant test.
- If the proposal creates or revises a reusable procedure or stage contract, read `references/procedure-design.md`.
- If the proposal considers another skill or capability and active guidance does not resolve the choice, read `references/auxiliary-capability-selection.md`.
- If the defect concerns runtime-specific routing, read `references/runtime-adapters.md` for that runtime only.

## Prohibitions

- Do not reorganize for aesthetics.
- Do not make broad file moves without a functional reason and explicit approval.
- Do not preload all conditional references.
