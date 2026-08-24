# ICM Decision Rules

Use this reference when the correct architecture boundary is unclear.

## Workspace vs stage

A workspace is a different mode of work. Create one when context, rules, tools, audience, or quality criteria differ materially and fixed execution order is not inherent.

A stage is a sequential transformation. Create one when it consumes a defined artifact, produces a defined artifact, order matters, and the next step intentionally depends on that output.

## Architecture boundaries

Add a boundary only when it solves an observed routing, context, handoff, ownership, or validation problem. Preserve working conventions and prefer the fewest boundaries that clearly isolate context.

When capability and correctness are equivalent, prefer the option with lower total implementation, context, routing, maintenance, abstraction, and operational cost. A small gain should justify the complexity it adds.

## Stable reference vs working artifact

Use L3 for persistent constraints and reusable patterns such as schemas, style rules, conventions, and reusable procedures.

Use L4 for current-run sources, research, drafts, plans, generated data, and review notes.

A useful test: will this file be reused substantially unchanged across many future runs? If yes, it is probably L3. If not, it is probably L4.

## Deterministic mechanism, procedure, or judgment

Use a deterministic script or test when correct behavior is mechanical and testable, including parsing, normalization, validation, indexing, checksums, and repeatable file operations.

When success is mechanically testable, prefer success criteria and evaluation mechanisms that are not modified by the same candidate change. If tests, benchmarks, or acceptance criteria must change, make that explicit task scope rather than silently redefining success.

For verbose deterministic processes, capture complete output outside active model context when practical; load the smallest summary needed for the current decision, then expand only into relevant diagnostics if the summary is insufficient or indicates failure.

Use a stable rule, template, or procedure when the reusable value is workflow logic, constraints, or a repeatable decision process that still requires contextual execution.

Use AI judgment for ambiguity, synthesis, interpretation, strategy, and language where controlled variability is useful.

## Review-boundary placement

Place the review or approval gate immediately before the consequential action, not merely at the beginning of a multi-stage workflow.

Define what is being reviewed, the evidence available, unresolved issues, the allowed next action, and whether approval authorizes only the current stage or a named downstream action.

Require accountable review when factual uncertainty materially affects a public, destructive, financially significant, hard-to-reverse, or commitment-making action.
