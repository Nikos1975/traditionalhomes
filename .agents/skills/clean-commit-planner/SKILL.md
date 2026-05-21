---
name: clean-commit-planner
description: Use when reviewing a dirty git working tree, separating product changes from local workflow/tooling files, preparing pathspec staging lists, or planning clean commits without staging everything.
---

# Clean Commit Planner

Use this skill before staging broad or mixed changes.

## Core Rule

Never use `git add .` for a broad working tree. Classify first, then stage one reviewed group at a time.

## Workflow

1. Run the bundled planner script from the repo root:

```powershell
& .agents/skills/clean-commit-planner/scripts/plan-clean-commits.ps1
```

2. Read `docs/commit-plan/clean-commit-plan.md`.
3. Inspect each generated pathspec file in `docs/commit-plan/groups/`.
4. Move any uncertain paths between groups before staging.
5. Stage one group at a time:

```powershell
git add --pathspec-from-file=docs/commit-plan/groups/01-product-content-data.txt
git diff --cached --stat
npm run build
npm run typecheck
git commit -m "Update property content and inventory facts"
```

6. Repeat for the next group only after the previous commit is verified.

## Default Groups

- `01-product-content-data`: public content, structured data, content-driven display components.
- `02-ui-map-behavior`: visual/interaction changes, maps, templates, shared styling.
- `03-build-deploy-tooling`: Astro/build/deploy/tool scripts and config.
- `04-agent-project-docs`: project instructions, agent skills, audit docs, handoff notes.
- `99-excluded-local-workflow`: local/private workflow state that should usually not be committed.
- `98-review-needed`: paths the script cannot classify confidently.

## Review Rules

- Keep product code separate from local workflow/tooling files.
- Do not commit `.claude/`, `.codex/`, `.agent/`, `.ai/`, or temporary files unless explicitly requested.
- Treat `package-lock.json` as review-needed if `package.json` did not change.
- For renamed deploy files, verify the deletion and new filename together before staging.
- Run `npm run build` and `npm run typecheck` one at a time after each product-facing commit group.
