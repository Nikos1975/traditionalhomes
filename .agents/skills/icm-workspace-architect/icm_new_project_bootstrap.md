# ICM New-Project Bootstrap Procedure

Use this procedure when a project has not yet adopted ICM. Read `ICM_RULES.md` first.

## Operating lifecycle

**reason → route → propose → approve → scaffold → validate**

Reason about the work before choosing routes. Propose the minimum architecture and obtain approval before scaffolding it. Do not start by generating folders.

## Workflow

1. Understand the project's purpose, expected work, constraints, and consequential actions.
2. Identify recurring task classes and genuinely distinct mental modes.
3. Design the minimum conceptual L0–L4 architecture justified by that work and propose one canonical root routing map for common requests.
4. If a concrete workspace/stage, architecture, deterministic-execution, or review-gate boundary remains unresolved, read `references/decision-rules.md` and apply only the relevant test.
5. If recurring work may deserve its own procedure or stage contract, read `references/procedure-design.md` before proposing that file.
6. If the design considers installing or requiring another skill or capability, read `references/auxiliary-capability-selection.md` only when active guidance does not resolve the choice.
7. If runtime-specific routing is a concrete design constraint, read `references/runtime-adapters.md` for that runtime only.
8. Obtain approval for the proposed architecture, then scaffold only the approved files and boundaries.
9. Validate the result against the cold-start and durability requirements in `ICM_RULES.md`.
