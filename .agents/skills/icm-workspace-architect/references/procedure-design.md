# ICM Procedure Design

Use this reference only when deciding whether reusable work needs its own procedure or stage contract, or when designing that contract.

## Canonical naming

Name a reusable canonical procedure for the work it performs, using a descriptive filename such as `historical_claim_verification.md`, `deployment_verification.md`, `source_to_video_script.md`, `icm_new_project_bootstrap.md`, or `icm_existing_project_audit.md`.

Do not use generic canonical names such as `procedure.md`, `workflow.md`, `instructions.md`, or `task.md`. If a runtime requires `SKILL.md`, keep it as a thin discovery and routing wrapper that points to descriptively named canonical procedure files.

## Procedure and stage contract

A reusable procedure or meaningful sequential stage should define:

- inputs;
- process;
- outputs;
- done criteria;
- unresolved issues;
- review boundary; and
- next allowed action.

When safe scope is not already obvious—especially for autonomous, broad, or optimization work—the contract should distinguish what may be inspected, the smallest surface that may be modified, protected or read-only state, and actions requiring approval. Do not require file-by-file enumeration when existing boundaries are sufficient.

## Separate-file test

Do not add a new ICM file unless it:

1. solves a distinct recurring problem; and
2. can often be omitted from other tasks through selective loading.

A separate file must create a useful context boundary, not merely organize prose.

If its contents are normally needed together with an existing canonical owner, keep them with that owner.

Do not split rules merely for:

- neatness;
- symmetry;
- naming consistency;
- smaller file size;
- conceptual completeness.

A new file is justified only when the separate boundary improves selective loading, ownership, maintenance, or routing for a recurring problem.

Give a procedure its own file when the workflow recurs, has a distinct contract or review boundary, and benefits from being routed and maintained independently. Keep one-off task instructions with their current working artifact.

Do not split a simple transformation into artificial procedures or numbered stages. A stage is justified only when order matters and its output is intentionally consumed by the next step.
