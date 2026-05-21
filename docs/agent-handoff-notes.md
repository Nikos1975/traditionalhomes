# Agent Handoff Notes

Use this file when work becomes multi-step, paused, or important enough that another agent may need to continue it.

Keep notes short and factual. Do not duplicate every git diff. Record the decisions, current state, blockers, and the next useful action.

## Current Status

- Astro static website for Elounda Traditional Homes.
- Sitemap is configured with `@astrojs/sitemap`.
- Property page visual work has been adjusted recently: orange primary booking/rate buttons, green hover states, gallery button color changes, and mobile breadcrumb fixes.
- Content audit completed for house and villa pages in `docs/content-audit-property-pages-checklist.md`.
- Project-specific content audit skill added at `.agents/skills/property-content-audit/SKILL.md`.
- `AGENTS.md` and `CLAUDE.md` now include property-page source-of-truth and content workflow rules.

## Current Content Plan

- Fix factual blockers first:
  - Villa page has live placeholders and conditional draft copy.
  - Demetra has a bedroom-count mismatch between inventory and narrative copy.
- Then verify or remove unsupported square-metre and history claims.
- Then rewrite property pages for practical clarity: layout, sleeping arrangement, pool, view, parking, access, constraints, and who each property suits.
- Finally review SEO titles, descriptions, and repeated phrases across the collection.

## Handoff Template

When pausing or finishing a substantial task, add a dated note below with:

- Date
- Goal
- Files changed
- What was verified
- What remains
- Blockers or facts needing confirmation

## Notes

### 2026-05-21 - Elounda blog research articles

- Goal: create Phase 1 Elounda blog articles from organized research.
- Files changed:
  - `.agents/skills/blog-research-article/SKILL.md`
  - `src/content/blog/elounda-history-through-its-shoreline.md`
  - `src/content/blog/elounda-visitor-economy.md`
  - `src/content/blog/elounda-wartime-memory.md`
  - `docs/superpowers/plans/2026-05-21-elounda-blog-content-phase-1.md`
- What changed:
  - Added `.agents/skills/blog-research-article/SKILL.md` for reusable research-to-blog workflows.
  - Added a checklist implementation plan for the Elounda blog research phase.
  - Revised the shoreline history article to be more specific and restrained.
  - Added visitor-economy and wartime-memory articles using conservative, low-risk claims.
- Verified:
  - Tone scans found no issue except one intentional factual use of "high-end hospitality" to describe public image.
  - `rg --files src/pages | rg "\.md$"` found no markdown under `src/pages`.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated the new blog routes.
- Remaining:
  - Phase 2 blog index/category improvements.
- Blockers:
  - Official skill validator could not run because the local Python environment is missing `yaml`.

### 2026-05-21 - Product content group staged

- Goal: continue clean commit preparation from the generated commit plan.
- Current state:
  - Re-read project instructions, handoff notes, clean commit planner skill, and generated clean commit plan.
  - Re-ran `.agents/skills/clean-commit-planner/scripts/plan-clean-commits.ps1` because this handoff file had changed after the previous plan.
  - Staged only `docs/commit-plan/groups/01-product-content-data.txt`.
- Verified:
  - `npm run build` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
- Remaining:
  - Commit or unstage the first group before staging the next group, otherwise the staged index will mix groups.
  - Continue with `02-ui-map-behavior` after the first group decision.
- Blockers:
  - None.

### 2026-05-21 - New chat handoff checkpoint

- Goal: preserve current state before continuing in a fresh chat.
- Current state:
  - Property copy, inventory size data, At a Glance size display, UI green-color fixes, map initialization fixes, map popup link fixes, and contact Group Gatherings color fix are implemented in the working tree.
  - Fresh verification already passed after the latest user-facing changes: `npm run build` and `npm run typecheck` both passed with 0 errors, 0 warnings, 0 hints.
  - Clean commit planning skill exists at `.agents/skills/clean-commit-planner/SKILL.md`.
  - Current generated commit plan is at `docs/commit-plan/clean-commit-plan.md`.
  - Current pathspec groups are in `docs/commit-plan/groups/`.
- Next useful action:
  - In the new chat, first read `AGENTS.md`, `CLAUDE.md`, this handoff file, `.agents/skills/clean-commit-planner/SKILL.md`, and `docs/commit-plan/clean-commit-plan.md`.
  - Re-run `& .agents/skills/clean-commit-planner/scripts/plan-clean-commits.ps1` if any files changed after this note.
  - Review/stage one pathspec group at a time; do not use `git add .`.
- Commit plan:
  - `01-product-content-data`: property copy, inventory facts, content display.
  - `02-ui-map-behavior`: UI, map behavior, templates, shared styles.
  - `03-build-deploy-tooling`: Astro/build/deploy/tooling config, after review.
  - `04-agent-project-docs`: project instructions, skills, audit docs, handoff notes, only if these should be versioned.
  - `98-review-needed`: currently `package-lock.json`; only commit if lockfile churn is intentional.
  - `99-excluded-local-workflow`: `.agent/`, `.ai/`, `.claude/`, `.codex/`, and temp local workflow files; do not commit unless explicitly requested.
- Blockers:
  - None. The next decision is whether to stage/commit by group, and whether project agent docs/skills should be committed.

### 2026-05-21 - Clean commit planner skill

- Goal: automate dirty-tree review and clean commit grouping without staging everything.
- Files changed:
  - `.agents/skills/clean-commit-planner/SKILL.md`
  - `.agents/skills/clean-commit-planner/scripts/plan-clean-commits.ps1`
  - `docs/commit-plan/clean-commit-plan.md`
  - `docs/commit-plan/groups/*.txt`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a project skill for classifying product content/data, UI/map behavior, build/deploy tooling, agent docs, review-needed files, and excluded local workflow files.
  - Added a PowerShell planner script that generates a Markdown report and Git pathspec files.
- Verified:
  - Planner script ran successfully.
  - `git add --dry-run --pathspec-from-file=...` passed for product content/data, UI/map behavior, build/deploy tooling, and agent project docs groups.
- Remaining:
  - `package-lock.json` remains in `98-review-needed` because `package.json` was not changed.
  - `.agent/`, `.ai/`, `.claude/`, and `.codex/` remain excluded from the clean commit plan.
- Blockers:
  - None.

### 2026-05-21 - Contact group card color

- Goal: replace the remaining black Group Gatherings card on `/en/contact/` with the green system treatment.
- Files changed:
  - `src/pages/en/contact.astro`
  - `docs/agent-handoff-notes.md`
- Verified:
  - Browser checked `http://localhost:4321/en/contact/`: Group Gatherings card uses `bg-accent-sage-soft`, `border-accent-sage/60`, and dark stone text.
  - `npm run build` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
- Blockers:
  - None.

### 2026-05-21 - Map popup link and filter color follow-up

- Goal: fix house-page map popup links resolving to `undefined` and use the green system color for location map filter buttons.
- Files changed:
  - `src/components/maps/SinglePinMap.astro`
  - `src/components/maps/LeafletMap.astro`
  - `src/components/maps/MasterLocationMap.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Single-pin map markers now include the correct property detail URL and subtitle.
  - Leaflet popup detail buttons are omitted when a marker has no URL, preventing `undefined` hrefs.
  - Master location map filter buttons now use `accent-sage` for active and hover states instead of black.
- Verified:
  - Browser checked `http://localhost:4321/en/houses/demetra/`: popup detail link href is `/en/houses/demetra/`.
  - Browser checked `http://localhost:4321/en/location/?id=demetra#map-section`: active filter button remains wired with no console errors.
  - `npm run build` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
- Blockers:
  - None.

### 2026-05-21 - Village map initialization fix

- Goal: restore house-page village maps and `/en/location/?id=...#map-section` deep links.
- Files changed:
  - `src/components/maps/LeafletMap.astro`
  - `src/components/maps/MasterLocationMap.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Map scripts now initialize on normal `DOMContentLoaded`/ready state as well as `astro:page-load`.
  - Master location map controls are guarded against duplicate setup and only mark ready after the Leaflet map exists.
- Verified:
  - Browser checked `http://localhost:4321/en/houses/demetra/`: single map rendered with tiles and marker.
  - Browser clicked the house-page `View map` link to `http://localhost:4321/en/location/?id=demetra#map-section`: master map rendered, Demetra card activated, popup opened.
  - Browser loaded `http://localhost:4321/en/location/?id=demetra#map-section` directly with the same result.
  - `npm run build` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
- Remaining:
  - None for the reported map/deep-link regression.
- Blockers:
  - None.

### 2026-05-21 - Resume verification after Phase 2

- Goal: continue from the property Phase 2 handoff and confirm whether work remained.
- Checked:
  - Reviewed `AGENTS.md`, `CLAUDE.md`, audit checklist, Phase 2 plan, and property content audit skill.
  - `rg` found no flagged placeholders, unsupported history/square-metre phrases, or flagged hype terms in live property content.
  - Node inventory check confirmed all 11 inventory entries have numeric `areaSqm`.
- Verified:
  - `npm run build` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
- Remaining:
  - No property Phase 2 tasks remain in the current plan.
  - Owner confirmation is still required before reintroducing historical claims, exact walk/drive times, or exclusive pool/barbecue pairing language.
- Blockers:
  - None.

### 2026-05-21 - Confirmed property sizes

- Goal: add owner-confirmed property sizes to inventory, public copy, and the At a Glance UI.
- Files changed:
  - `src/inventory/inventory.json`
  - `src/types.ts`
  - `src/components/AtAGlance.astro`
  - `src/content/houses/argyro.md`
  - `src/content/houses/leonidas.md`
  - `src/content/houses/margarita.md`
  - `src/content/houses/demetra.md`
  - `src/content/houses/penelope.md`
  - `src/content/houses/erato.md`
  - `src/content/houses/clio.md`
  - `src/content/houses/efterpi.md`
  - `src/content/houses/kalliopi.md`
  - `src/content/houses/monastiri.md`
  - `src/content/villa/almond-tree-villa.md`
- What changed:
  - Added `areaSqm` to every inventory unit.
  - Added size display to `AtAGlance`.
  - Added confirmed `m2` values to property summaries and interior copy.
- Confirmed values:
  - Argyro: 85 m2
  - Leonidas: 50 m2
  - Margarita: 120 m2
  - Demetra: 50 m2
  - Penelope: 65 m2
  - Erato: 55 m2
  - Clio: 55 m2
  - Efterpi: 55 m2
  - Kalliopi: 55 m2
  - Monastiri: 120 m2
  - Almond Tree Villa: 230 m2
- Verified:
  - Node inventory check confirmed all 11 entries have numeric `areaSqm`.
  - `rg` confirmed no old `sqm`, `square metres`, `square-metre`, or `m²` wording remains in property content/inventory.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed cleanly on rerun.
- Blockers:
  - None.

### 2026-05-21 - Phase 2 property fixes

- Goal: complete browser review, fix remaining UI friction, and keep a fact-confirmation list for future property work.
- Files changed:
  - `src/pages/en/villa/[slug].astro`
  - `src/styles/global.css`
  - `src/pages/en/about.astro`
  - `src/pages/en/location.astro`
  - `src/pages/en/contact.astro`
  - `src/components/maps/MapPreview.astro`
  - `docs/superpowers/plans/2026-05-21-property-pages-phase-2-fixes.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Browser-reviewed all 10 house pages plus Almond Tree Villa.
  - Moved villa-specific access warnings out of the early main content and into the sidebar "Before you book" card.
  - Removed the duplicated generic "Access reminder" from the villa sidebar.
  - Changed remaining explicit black button hover treatments to the green/sage system.
  - Verified the mobile menu opens and closes three times in a row at a 390 px viewport.
- Verified:
  - Browser checked all property pages for new headings and absence of flagged old copy.
  - Browser checked `http://localhost:4321/en/villa/almond-tree-villa/`, `http://localhost:4321/en/about/`, `http://localhost:4321/en/location/`, and `http://localhost:4321/en/contact/`.
  - `rg` check found no remaining flagged placeholders, unsupported square-metre/history phrases, or flagged hype terms in `src/content/houses` and `src/content/villa`.
  - `npm run build` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
- Remaining:
  - Owner should confirm any facts before reintroducing square metres, historical claims, exact walk/drive times, or exclusive pool/barbecue pairing language.
- Blockers:
  - None.

### 2026-05-21 - Property page copy rewrite

- Goal: continue the property content plan by fixing live content blockers and tightening house/villa copy.
- Files changed:
  - `src/content/houses/argyro.md`
  - `src/content/houses/leonidas.md`
  - `src/content/houses/margarita.md`
  - `src/content/houses/demetra.md`
  - `src/content/houses/penelope.md`
  - `src/content/houses/erato.md`
  - `src/content/houses/clio.md`
  - `src/content/houses/efterpi.md`
  - `src/content/houses/kalliopi.md`
  - `src/content/houses/monastiri.md`
  - `src/content/villa/almond-tree-villa.md`
  - `docs/content-audit-property-pages-checklist.md`
- What changed:
  - Removed live villa placeholders and conditional pool copy.
  - Corrected Demetra copy to match inventory: 1 bedroom, sleeps 4, shared pool with Penelope.
  - Removed unsupported square-metre and history claims from property pages.
  - Rewrote summaries and body sections in a calmer, fact-first style.
  - Added access, stairs, parking, pool sharing, and pairing notes into the live copy.
- Verified:
  - `rg` check found no remaining placeholders, unsupported square-metre/history phrases, or the flagged hype terms in `src/content/houses` and `src/content/villa`.
  - `npm run build` passed when run alone, with no duplicate content warnings.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - Browser checked `http://localhost:4321/en/villa/almond-tree-villa/`, `http://localhost:4321/en/houses/demetra/`, and `http://localhost:4321/en/houses/`.
- Remaining:
  - Optional deeper browser-review of every individual property page for final rhythm and spacing.
- Blockers:
  - None for this rewrite pass. Any exact history or square-metre claims should stay out until confirmed by a reliable source.

### 2026-05-21 - Property content audit

- Goal: audit house and villa page content and create a reusable workflow for future content work.
- Files changed:
  - `docs/content-audit-property-pages-checklist.md`
  - `.agents/skills/property-content-audit/SKILL.md`
  - `AGENTS.md`
  - `CLAUDE.md`
- Verified:
  - `npm run build` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - Skill frontmatter structure checked locally.
- Remaining:
  - Rewrite live property content using the audit checklist.
  - Confirm square-metre and history claims before keeping them.
  - Resolve villa placeholders and Demetra bedroom mismatch first.
- Blockers:
  - Official skill validator could not run because the local Python environment is missing `yaml`.
