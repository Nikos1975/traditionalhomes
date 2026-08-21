# Workspace Identity

This repository is the production source for the Elounda Traditional Homes website.

- Astro 5, static-first output, Tailwind CSS.
- Content-driven architecture; avoid heavy client-side JavaScript and unnecessary dependencies.
- Production site: `https://traditional-homes.gr`.
- Current public behavior, routes, CI, publication controls, and deployment behavior are protected unless the task explicitly authorizes a change.

## Global invariants

- Prefer the smallest safe change. Do not broaden scope or start consolidation/refactor work unless requested.
- `src/inventory/inventory.json` is the factual source of truth for property capacity, bedrooms, bathrooms, floors, stairs, pools, views, parking, access, constraints, booking identifiers, official groups, and structured relationships.
- Structured factual sources beat marketing or narrative copy. Flag unsupported facts instead of guessing.
- Never place `AGENTS.md`, `CONTEXT.md`, or internal instruction Markdown under `src/pages/`; Astro treats Markdown there as public routes.
- Preserve the static-first architecture and performance/SEO characteristics.
- Do not change `functions/api/contact.js`, Cloudflare DNS/variables, email routing, deployment configuration, or production deployment state unless explicitly authorized.
- Never publish, merge, deploy, delete tracked production material, send external messages, or push directly to `main` without explicit authorization.
- Keep changes reviewable and reversible. Do not use `git add .`, `git add -A`, or destructive reset/cleanup commands.

## Context loading

Read `CONTEXT.md` after this file and route the task before loading detailed instructions.

Use the repository as an ICM workspace:

- Layer 0: this file — identity and global invariants.
- Layer 1: `CONTEXT.md` and nested workspace routers — where to go.
- Layer 2: stage `CONTEXT.md` files or the routed project skill — exact Inputs, Process, Outputs, Verify, and Stop conditions.
- Layer 3: stable references such as architecture decisions, brand/editorial rules, i18n rules, and project-local skills.
- Layer 4: current source files, research packets, diffs, PR state, validation reports, and other run-specific working material.

Do not automatically load `.ai/memory/current-task.md`, the full `docs/agent-handoff-notes.md`, or unrelated workspace instructions. Load only the context named by the routed stage.

Current repository continuity: `docs/handoff/current.md` — current baseline, working-tree preservation, known diagnostics and planned work. It is reference context, not an execution authority, and it does not replace the routed stage contract.

## Validation and stop conditions

- For source, component, content, route, media-reference, package, or dependency changes, run the relevant focused tests plus the repository validation required by the routed stage. Compare `npm run typecheck` with the known baseline rather than claiming unrelated existing diagnostics are new.
- For docs/control-plane-only changes, validate structure and diffs; a production build is not required unless the change affects executable behavior.
- Stop on an unexpected file, unsupported factual claim, missing approval, source-of-truth conflict, or real validation failure.
- Keep documentation changes proportional: update durable architecture/operations docs when structure or behavior changes; do not inflate historical handoff notes for routine work.
