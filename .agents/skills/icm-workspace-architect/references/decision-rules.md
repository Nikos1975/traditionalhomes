# ICM Decision Rules

Use this reference when the correct folder boundary is unclear.

## 1. The unit of organization is a decision boundary

Do not create folders merely because a topic has a name. Create them when the folder changes what context, rules, tools, or handoffs should apply.

## 2. Workspace vs stage

### Workspace
A workspace is a different mode of work.

Signals:
- different quality criteria;
- different tools/skills;
- different audience;
- context from another area would be distracting;
- order relative to other workspaces is not inherently fixed.

Examples: planning, source code, documentation, operations.

### Stage
A stage is a sequential transformation.

Signals:
- it consumes a defined artifact;
- it produces a defined artifact;
- the next stage depends on that output;
- order matters;
- there is a natural review checkpoint.

Examples: research → analysis → draft → release preparation.

## 3. Stable reference vs working artifact

### Stable reference (L3)
Use when the information is a persistent rule or reusable pattern.

Examples: brand voice, data schema, editorial policy, architectural conventions, source-evaluation rubric.

### Working artifact (L4)
Use when the file belongs to this specific run.

Examples: this article's research, this feature's spec, this client's intake, this deployment's incident log.

A useful test: **Will this file be reused substantially unchanged next month?** If yes, it is probably L3. If no, it is probably L4.

## 4. Context loading rule

The stage contract must name what to read. Avoid phrases such as:

- "read everything relevant"
- "scan the whole repo"
- "use all project context"

Prefer explicit paths and scopes.

## 5. Routing rule

For every high-frequency request, there should be one obvious row in the root routing table.

If two rows could both match, improve the task labels or merge the workspaces.

## 6. Skill boundary

A process should become a skill when the reusable value is **how to do the work**, not the project facts.

Keep project-specific facts in the project. Keep reusable procedures in the skill.

Bad skill: `traditional-homes-current-priorities`.
Good skill: `historical-claim-verification`.

## 7. Script boundary

Move a step to a script when the correct behavior can be tested mechanically.

Good candidates:
- parse or normalize input;
- copy/create folders;
- validate schema;
- check links or filenames;
- calculate hashes;
- run builds/tests;
- generate deterministic indexes.

Keep AI for ambiguity, synthesis, judgment, and language where variability is valuable.

## 8. Review gate rule

Insert a human review gate before:

- publication;
- deployment;
- sending external communication;
- irreversible/destructive actions;
- accepting a factual or legal claim that needs accountability;
- crossing from analysis into commitment.

## 9. Minimal architecture rule

Start with the fewest rooms/stages that cleanly separate context. Add a new one only after an actual collision appears.

## 10. Migration rule

Do not reorganize an existing repository by aesthetics. Every move needs one of these reasons:

- clearer routing;
- narrower context loading;
- explicit handoff;
- reduced duplication;
- stronger ownership or review boundary;
- deterministic automation support.
