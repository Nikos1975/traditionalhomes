---
name: icm-workspace-architect
description: Design, audit, refactor, or scaffold folder-based AI workspaces using Clief Notes / Interpretable Context Methodology (ICM). Use when a user wants to organize a repository or project for AI agents, reduce context-window clutter, create routing and CONTEXT files, define numbered workflow stages and handoffs, separate stable references from per-run artifacts, wire reusable skills to the right workspace, add human review gates, or turn a repeated manual workflow into a durable file-based system.
---

# ICM Workspace Architect

Build the context architecture before building automation.

This skill adapts the Clief Notes / Interpretable Context Methodology into a reusable, cross-agent workspace design process. Preserve the core method: explicit routing, narrow context, visible intermediate files, stage contracts, human review, and deterministic code for mechanical work.

## Core rules

1. **Do not redesign blindly.** Inspect the existing tree and existing instruction/context files first.
2. **Ask before writing.** Diagnose, propose the architecture, then wait for explicit approval before creating, moving, renaming, or deleting files.
3. **Use the smallest architecture that works.** Start with 2–4 workspaces or stages. Do not create a large taxonomy up front.
4. **Separate mental modes from pipeline stages.** A workspace is a different mode of work; a stage is a sequential transformation with a handoff.
5. **Load only what the current task needs.** Never tell the agent to read the entire repository by default.
6. **Keep stable rules separate from run-specific material.** Stable references constrain behavior; working artifacts are transformed.
7. **Every stage output must be inspectable.** Prefer Markdown/JSON/text handoffs that a human can review or edit before the next stage.
8. **Keep human judgment at explicit gates.** Do not automate approval, publication, deployment, deletion, or other consequential actions unless the user has deliberately designed that boundary.
9. **Use deterministic tooling for deterministic work.** File moves, parsing, validation, formatting, checksums, and repetitive transforms belong in scripts when worthwhile.
10. **Do not turn unresolved process into a skill.** Stabilize the manual workflow first; package it only when the repeatable pattern is understood.

## Architecture model

Use two compatible views of the method.

### Simple view — Map / Rooms / Tools

- **Map:** the root instruction file. It answers: what is this project, where is everything, and where should each task go?
- **Rooms:** workspace-level `CONTEXT.md` files. Each room describes one mental mode, its process, local files, and quality bar.
- **Tools:** reusable skills/scripts attached only to the rooms that need them.

Use this for repositories where work is mostly parallel: planning, code, docs, operations; or research, writing, distribution.

### Full ICM view — L0 through L4

- **L0 — Root map:** global identity, folder map, routing, naming, critical guardrails.
- **L1 — Root context:** workspace-level routing and shared resources.
- **L2 — Stage contract:** exact Inputs → Process → Outputs → Done criteria → Review gate.
- **L3 — Reference material:** stable rules, style guides, schemas, conventions, skills, templates.
- **L4 — Working artifacts:** source material and outputs specific to this run.

Use this when the work is sequential and one step hands an artifact to the next.

## Runtime adapter

Preserve the semantics even when the runtime uses a different root instruction filename.

- Claude Code: normally `CLAUDE.md`.
- Repositories already using `AGENTS.md`: treat that as L0 rather than creating a competing root map.
- Other agent runtimes: use their existing root instruction convention if one exists.
- Mixed-runtime repository: prefer one canonical map and thin runtime adapters instead of duplicating full instructions.

Never create both `CLAUDE.md` and `AGENTS.md` with divergent rules.

## Diagnostic workflow

Before proposing folders, gather only information that changes the architecture.

If the repository is available, inspect it first and answer as many questions as possible from the files. Ask the user only for unresolved items.

### Required diagnostics

1. **Outcome:** What durable work does this workspace support?
2. **Work modes:** What 2–4 kinds of work require different thinking, rules, or tools?
3. **Sequence:** Which activities are true sequential handoffs versus independent workspaces?
4. **Stable context:** What rules, brand standards, schemas, conventions, or domain references persist across runs?
5. **Working artifacts:** What changes each run — source docs, research, drafts, specs, code changes, reports?
6. **Review gates:** At what points must a human inspect or approve before continuing?
7. **Automation boundary:** Which steps are deterministic enough for scripts, and which still require judgment?
8. **Runtime:** Which agent environment(s) must navigate the workspace?
9. **Existing state:** Which files and folder names are contracts that must not be broken?

Do not ask a long questionnaire when the answers are already visible in the repository.

## Decide the shape

Choose one of these shapes.

### A. Workspace architecture

Use when tasks are distinct mental modes and do not form one strict pipeline.

```text
project/
├── <root-map>
├── planning/
│   └── CONTEXT.md
├── implementation/
│   └── CONTEXT.md
└── docs/
    └── CONTEXT.md
```

### B. Sequential ICM pipeline

Use when each stage transforms the prior stage's output.

```text
project/
├── <root-map>
├── CONTEXT.md
├── stages/
│   ├── 01_research/
│   │   ├── CONTEXT.md
│   │   ├── references/
│   │   └── output/
│   ├── 02_analysis/
│   │   ├── CONTEXT.md
│   │   ├── references/
│   │   └── output/
│   └── 03_delivery/
│       ├── CONTEXT.md
│       ├── references/
│       └── output/
└── _config/
    └── shared/
```

Number stage folders only when the order is meaningful.

### C. Hybrid architecture

Use when one workspace contains a pipeline but the repository also contains independent modes.

Example: `/content` may contain `01_research → 02_draft → 03_publish-prep`, while `/src` and `/ops` remain independent workspaces.

## Design each layer

### L0 — Root map

Keep it short. Include:

- 1–3 sentence project identity
- compact folder map
- routing table
- naming conventions
- critical non-negotiable rules
- commands only if they materially affect routing or validation

The root map is not the place for detailed project history, voice rules, architecture essays, or long SOPs. Move those into the relevant room or reference file.

A routing table is mandatory for non-trivial workspaces:

```markdown
| Task | Go to | Read | Skills / tools |
|---|---|---|---|
| Research a topic | /stages/01_research | CONTEXT.md | source-verification |
| Draft from approved research | /stages/02_draft | CONTEXT.md | writing-style |
| Validate release | /ops | CONTEXT.md | deployment-check |
```

### L1 — Root `CONTEXT.md`

Use only when the project benefits from a shared workspace-level control file. It should explain:

- the overall workflow
- shared resources
- stage/workspace relationships
- global handoff rules
- what must not be loaded globally

Do not duplicate L0.

### L2 — Stage/workspace `CONTEXT.md`

For sequential stages, use a strict contract:

```markdown
# <Stage Name>

## Purpose
One job only.

## Inputs
| Layer | Path | Why needed | Read scope |
|---|---|---|---|
| L3 | ../../_config/shared/style.md | Stable constraint | relevant sections only |
| L4 | ../01_research/output/ | Current-run input | required artifact(s) |

## Process
1. ...
2. ...
3. ...

## Outputs
| Artifact | Destination | Format |
|---|---|---|
| analysis.md | output/ | Markdown |

## Done looks like
- measurable acceptance criterion
- required validation complete
- unresolved issues listed, not guessed

## Review gate
Stop here for human review before the next stage when required.

## Do not
- scope boundary
- forbidden actions
```

For non-sequential rooms, adapt the same structure but omit artificial handoff language.

### L3 — Stable references

Put here things that should remain valid across many runs:

- style/voice constraints
- schemas and data contracts
- brand rules
- architectural conventions
- reusable templates
- domain reference notes
- reusable skills

Prefer several focused files over one giant reference dump.

### L4 — Working artifacts

Put here material specific to the current run:

- source documents
- research output
- drafts
- specs
- generated plans
- intermediate JSON
- review notes

Do not mix these into long-lived configuration files.

## Folder-boundary tests

Before creating a folder, ask what boundary it represents.

Create a **workspace** when:

- the thinking mode changes materially;
- different rules or tools should load;
- unrelated context would distract the agent.

Create a **stage** when:

- output A is intentionally consumed by step B;
- order matters;
- a review gate or transformation boundary exists.

Create a **reference file** when:

- the information persists across runs;
- it constrains behavior rather than being transformed.

Create a **skill** when:

- the same how-to process repeats across tasks/projects;
- the process is stable enough to encode;
- consistent execution matters.

Create a **script** when:

- the transformation is mechanical and testable;
- judgment is not the main value;
- repeatability matters more than flexible prose.

If a folder has no distinct rule, owner, input/output boundary, or retrieval purpose, it probably should not exist.

## 60 / 30 / 10 triage

Use the framework as a design check, not as a rigid numeric budget.

- **60 — deterministic layer:** scripts, database queries, parsers, validators, file operations, calculations.
- **30 — rule layer:** routing, schemas, templates, checklists, stage contracts, skills.
- **10 — judgment layer:** synthesis, ambiguity resolution, creative choices, strategy.

Ask: can a lower layer perform this step more reliably and cheaply? If yes, move it down.

## Human review design

Review gates are first-class architecture. Add them where:

- the next step would make a claim public;
- a stakeholder must be able to explain the decision;
- the action is hard to reverse;
- the model may fill missing facts with assumptions;
- the domain expert's judgment is part of the value.

A stage may prepare an action without performing it.

## Naming rules

Choose one convention and document it in L0. Prefer names that are sortable and meaningful without a database.

Examples:

- `topic_draft.md`
- `topic_final.md`
- `feature_spec.md`
- `2026-08-20_decision-title.md`
- numbered stages: `01_research`, `02_analysis`, `03_delivery`

Avoid ambiguous buckets such as `misc/`, `stuff/`, `new/`, or multiple competing `final-final` filenames.

## Build protocol

After diagnostics:

1. Show the proposed tree.
2. For each top-level folder, state the boundary it enforces.
3. Show the routing table.
4. Identify L3 stable references and L4 working artifacts.
5. Mark human review gates.
6. Identify deterministic steps suitable for scripts.
7. List files that will be created, modified, moved, or left untouched.
8. Wait for explicit user approval.
9. Build only the approved structure.
10. Validate paths, routing, and references after creation.

Do not move existing files merely to make the tree look cleaner. Migration must have a functional reason and an explicit mapping.

## Audit mode

When asked to review an existing structure, do not immediately propose a rebuild. Produce:

1. **Observed architecture** — current map, rooms/stages, references, artifacts, skills.
2. **Leak points** — where context is duplicated, mixed, too broad, or loaded globally.
3. **Boundary problems** — folders that combine multiple jobs or stages with unclear handoffs.
4. **Routing gaps** — tasks for which the agent must guess where to go.
5. **State problems** — important decisions or current status trapped in chat instead of files.
6. **Automation misplacement** — AI doing deterministic work, or automation built before process stability.
7. **Minimal-change plan** — smallest set of changes that materially improves reliability.

Prefer refactoring over replacement.

## Validation checklist

Before declaring the architecture complete, verify:

- [ ] Every common task has one obvious route.
- [ ] No two root instruction files contain conflicting rules.
- [ ] Root map is compact and does not hide workspace context inside it.
- [ ] Each workspace/stage has one clear job.
- [ ] Sequential stages have explicit inputs and outputs.
- [ ] L3 stable references are separate from L4 run artifacts.
- [ ] Skills are wired only where needed.
- [ ] Human review gates are explicit.
- [ ] Destructive or publishing actions are not implied by folder traversal.
- [ ] Naming conventions are documented and consistent.
- [ ] Mechanical work is scripted where that reduces repeated AI effort.
- [ ] The user can understand the workflow by opening the folder tree and context files.

## Output format when designing

Return, in this order:

1. **Architecture decision** — why this is workspace, staged, or hybrid.
2. **Proposed tree** — concise filesystem tree.
3. **Routing table** — task → folder → context → skills/tools.
4. **Context plan** — L0–L4 mapping.
5. **Review and automation boundaries** — where humans and scripts sit.
6. **Change plan** — create / modify / move / preserve.
7. **Approval question** — ask before writing files.

After approval, implement and report exact created/changed paths plus validation results.

## Supporting files

Read only as needed:

- `references/decision-rules.md` — boundary and architecture decision rules.
- `references/runtime-adapters.md` — root-instruction strategy across agent runtimes.
- `templates/` — reusable file templates.
- `examples/` — examples of simple, staged, and hybrid workspaces.
- `scripts/scaffold_icm.py` — optional deterministic scaffolder after the architecture plan is approved.
