# ICM Workspace Architecture Procedure

Use this procedure to design or refine reusable ICM architecture. Read `ICM_RULES.md` first and treat its principles and layer definitions as canonical.

## Procedure

1. Inspect the existing architecture before proposing changes: root routing, workspace contexts, procedures, stable references, current-run artifact locations, scripts, tests, and review gates.
2. Map the relevant context conceptually across L0–L4.
3. Identify ambiguous or competing routes, unnecessary global context, duplicated rules, and context that crosses workspace boundaries without a functional reason.
4. If a concrete workspace/stage, architecture, deterministic-execution, or review-gate boundary remains unresolved, read `references/decision-rules.md` and apply only the relevant test.
5. If the task creates or revises a reusable procedure or stage contract, read `references/procedure-design.md`.
6. If the task considers another skill or capability and active guidance does not resolve whether it belongs, read `references/auxiliary-capability-selection.md`.
7. If runtime-adapter behavior or mixed-runtime routing is under design or test, read `references/runtime-adapters.md`.
8. Propose the smallest justified architecture change and explain the functional reason for every new boundary, move, or canonical file.
9. Obtain approval before broad structural changes, then implement only the approved scope.
10. Validate the result against the cold-start and durability requirements in `ICM_RULES.md`.

## Output

Return the architecture decision, routing map, L0–L4 mapping, boundary decisions, deterministic/judgment split, review boundaries, minimal change set, references loaded, and cold-start validation result.
