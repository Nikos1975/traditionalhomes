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

### 2026-05-21 - New session blog handoff checkpoint

- Goal: preserve current blog/content state before continuing in a fresh session.
- Current branch:
  - `codex/property-content-ui-map-version`
- Draft PR:
  - `https://github.com/Nikos1975/traditionalhomes/pull/2`
- Current blog state:
  - Blog now has 7 posts: 3 History, 3 Location Guide, 1 Updates.
  - The Elounda history pillar article is now `A Short Chronological History of Elounda`.
  - The user's chronological draft was adapted into the pillar article while removing luxury framing, dramatic phrasing, and unsupported claims.
  - Local blog images were added under `public/images/blog/` and used in the history, wartime memory, and visitor-economy articles.
  - Research files under `docs/research/**` were used as context only and were not edited.
- Product/content files currently changed or added:
  - `public/images/blog/elounda-history/ancient-olous-sunken-remains.jfif`
  - `public/images/blog/elounda-wartime-memory/spinalonga-venetian-fortifications.jfif`
  - `public/images/blog/elounda-visitor-economy/elounda-bay-resort-development.jfif`
  - `src/content/blog/Mavrikiano-Distances-And-Guide.md`
  - `src/content/blog/elounda-history-through-its-shoreline.md`
  - `src/content/blog/elounda-visitor-economy.md`
  - `src/content/blog/elounda-wartime-memory.md`
  - `src/content/blog/elounda-salt-pans-and-poros-windmills.md`
  - `docs/agent-handoff-notes.md`
- Known dirty files to leave alone unless explicitly requested:
  - `.ai/memory/conventions.md`
  - `.agent/`
  - `.ai/memory/conventions.md.tmp.4907.1775928805346`
  - `.claude/`
  - `.codex/`
  - `CLAUDE.md`
  - `package-lock.json`
- Latest verification:
  - `python scripts/audit_blog_metadata.py` passed.
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/audit_brand_language.py` does not flag the touched/new blog articles; remaining matches are existing items in `elounda-guide.md`, `kalliopi.md`, and `leonidas.md`.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints; content sync may print duplicate-id loader notices after edits.
  - `npm run build` passed and generated 29 pages.
  - `agent-browser` confirmed local blog images render on the intended article pages.
- Next useful action:
  - Review the blog visually again after any new copy edits.
  - Optional: remove duplicate Markdown `#` headings from older untouched posts such as `elounda-guide.md` and `elounda-visitor-economy.md`.
  - Optional: decide whether to stage/commit only the blog/product files, excluding local workflow files and `package-lock.json`.
- Blockers:
  - None.

### 2026-05-21 - Source-backed Elounda history blog articles

- Goal: turn the Elounda history and wartime research into humble, factual blog articles with relevant internet photos and citations.
- Files changed:
  - `public/images/blog/elounda-history/ancient-olous-sunken-remains.jfif`
  - `public/images/blog/elounda-wartime-memory/spinalonga-venetian-fortifications.jfif`
  - `public/images/blog/elounda-visitor-economy/elounda-bay-resort-development.jfif`
  - `src/content/blog/elounda-history-through-its-shoreline.md`
  - `src/content/blog/elounda-visitor-economy.md`
  - `src/content/blog/elounda-wartime-memory.md`
  - `src/content/blog/elounda-salt-pans-and-poros-windmills.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Revised the shoreline history article as the pillar history piece, with official Ministry/Ephorate sources and Wikimedia image credits.
  - Revised the wartime memory article to keep the Battle of Crete and Spinalonga war-years material restrained and source-backed.
  - Added a focused article on Elounda salt pans and the Poros windmills.
  - Added user-provided local Getty-sourced images to the shoreline history, wartime memory, and visitor-economy articles, with captions/credits.
  - Adapted the user's chronological Elounda history draft into the pillar article structure while removing luxury framing, dramatic phrasing, and unsupported claims.
  - Removed Markdown `#` headings from the revised/new articles so the template page title remains the only main heading.
- Verified:
  - `python scripts/audit_blog_metadata.py` passed.
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/audit_brand_language.py` did not flag the revised/new history articles or the visitor-economy image edit; remaining matches are existing review items in `elounda-guide.md`, `kalliopi.md`, and `leonidas.md`.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints; content sync printed duplicate-id loader notices for the two rewritten article files.
  - `npm run build` passed and generated 29 pages.
  - `agent-browser` confirmed the updated local images render on the shoreline history, wartime memory, and visitor-economy article pages.
- Remaining:
  - Consider a later pass to remove duplicate Markdown `#` headings from older untouched blog posts.
- Blockers:
  - None.

### 2026-05-21 - Blog visual review and Mavrikiano guide cleanup

- Goal: visually review the blog routes and clean up the older Mavrikiano guide language flagged by the brand audit.
- Files changed:
  - `src/content/blog/Mavrikiano-Distances-And-Guide.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Reviewed `/blog/`, `/blog/elounda-guide/`, and `/blog/mavrikiano-distances-and-guide/` with `agent-browser` against the local preview server.
  - Replaced the visible draft-style table label with `Practical Notes`.
  - Rewrote the Mavrikiano guide's promotional descriptions, itinerary notes, packing notes, and final Spinalonga note in a calmer, practical style.
  - Kept existing route links and distance/time values.
- Verified:
  - `python scripts/audit_blog_metadata.py` passed.
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/audit_brand_language.py` no longer flags the Mavrikiano guide; remaining matches are existing review items in other blog/property content.
  - `npm run typecheck` passed.
  - `npm run build` passed.
  - `agent-browser` confirmed the updated Mavrikiano table renders from local preview.
- Remaining:
  - Article pages still render a template title plus Markdown `#` headings; consider a separate blog-content/template pass if duplicate H1s should be removed across all posts.
- Blockers:
  - Initial dev-server attempt hit a Windows `.astro/data-store.json` EPERM cache rename lock; existing preview on port 4322 was used for browser checks.

### 2026-05-21 - Booking CTA green-first treatment

- Goal: reverse booking CTA colors and align the blog drop cap with the green system color.
- Files changed:
  - `src/styles/global.css`
  - `src/pages/blog/[...slug].astro`
  - `src/pages/en/contact.astro`
  - `src/components/Footer.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - `booking-cta` buttons now use sage green by default and rust/orange on hover.
  - Blog article drop cap now uses sage green.
  - Contact form submit button no longer uses `booking-cta`, so it is not treated as a booking/date action.
  - Footer `Check Availability` text link now starts in sage and hovers to rust.
- Verified:
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 28 pages.
  - `agent-browser` opened `/blog/elounda-guide/`, `/en/`, and `/en/houses/` successfully from local preview.
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/audit_blog_metadata.py` passed.
- Remaining:
  - None for this color pass.
- Blockers:
  - None.

### 2026-05-21 - Blog article drop cap

- Goal: restore the old magazine-style first-letter treatment inside the current blog article template.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a blog-only drop cap on the first article paragraph using the active Cormorant Garamond font and site primary color.
  - Confirmed downloaded fonts are active through `src/styles/global.css` and `Base.astro`; legacy `MagazineLayout.astro` still references placeholder font paths and remains unused.
- Verified:
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 28 pages.
  - `agent-browser batch --bail "open http://127.0.0.1:4322/blog/elounda-guide/" "get url" "close"` passed.
  - Static preview HTML includes the `blog-article` class, drop-cap CSS, and Cormorant font asset references.
- Remaining:
  - Visual review at `http://127.0.0.1:4322/blog/elounda-guide/`.
- Blockers:
  - None.

### 2026-05-21 - Superpowers coordination rule

- Goal: document use of `obra/superpowers` with GPT-5.5 coordination and Codex 5.3 execution.
- Files changed:
  - `docs/codex-5-3-router.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added the `obra/superpowers` `.codex-plugin` reference to the router.
  - Defined priority order: project/user rules first, project skills second, Superpowers process skills third.
  - Added guidance for GPT-5.5 as coordinator, Codex 5.3 as bounded executor, `agent-browser` for visual checks, and Python scripts for compact audits.
- Verified:
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/blog_index_summary.py` passed.
  - `agent-browser --version` returned `0.27.0`.
- Remaining:
  - None.
- Blockers:
  - None.

### 2026-05-21 - Agent browser and content audit scripts

- Goal: support the GPT-5.5 coordinator / Codex 5.3 executor workflow with browser tooling and compact repo-local audits.
- Files changed:
  - `scripts/audit_blog_metadata.py`
  - `scripts/audit_public_markdown.py`
  - `scripts/audit_brand_language.py`
  - `scripts/blog_index_summary.py`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Updated global `agent-browser` CLI to `0.27.0`, installed Chrome for Testing, and installed the `vercel-labs/agent-browser@agent-browser` skill into the user-level skills folder.
  - Installed the closest available ULTRA-style skill, `intellectronica/agent-skills@ultrathink`, into the user-level skills folder.
  - Added dependency-free Python scripts for blog metadata, public markdown placement, brand-language review, and compact blog index summaries.
- Verified:
  - `agent-browser batch --bail "open about:blank" "get url" "close"` passed.
  - `python scripts/audit_blog_metadata.py` passed.
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/blog_index_summary.py` passed.
  - `python scripts/audit_brand_language.py` ran and flagged existing review items, mostly in the older Mavrikiano guide.
- Remaining:
  - Restart Codex to pick up newly installed user-level skills in future sessions.
  - Optional future cleanup: revise the flagged older Mavrikiano guide language.
- Blockers:
  - None.

### 2026-05-21 - Blog structure and SEO

- Goal: improve the blog index for a larger post set without adding client-side filtering.
- Files changed:
  - `src/pages/blog/index.astro`
  - `src/pages/blog/[...slug].astro`
  - `src/content/blog/welcome-to-elounda.md`
  - `src/content/blog/Mavrikiano-Distances-And-Guide.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added static category grouping and category anchor links to the blog index.
  - Made card metadata show date, region, tags, and category consistently.
  - Added fallback category display on individual blog pages.
  - Added missing category, region, tags, and image metadata to two older posts.
- Verified:
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints. Astro printed duplicate-id loader notices for two existing blog slugs during content sync, but diagnostics passed and build did not repeat them.
  - `npm run build` passed and generated 28 pages.
  - `rg --files src/pages | rg "\.md$"` returned no markdown under `src/pages`.
  - Local dev-server HTML checks confirmed `/blog/` includes Location Guide, History, Updates, and region metadata; `/blog/mavrikiano-distances-and-guide/` includes the revised title, category, and region.
- Remaining:
  - Optional browser visual review if the browser tool or Playwright is available later.
- Blockers:
  - In-app browser tooling was not exposed in this session, and Playwright is not installed in the repo.

### 2026-05-21 - New session coordinator handoff

- Goal: preserve state before continuing in a new session with GPT-5.5 coordinating Codex 5.3 execution.
- Current state:
  - Active branch: `codex/property-content-ui-map-version`.
  - Draft PR: `https://github.com/Nikos1975/traditionalhomes/pull/2`.
  - PR already includes property content/data fixes, UI/map fixes, build/deploy tooling, project agent docs, Elounda blog research folders, three new/revised blog posts, and the blog research skill.
  - Added coordinator router at `docs/codex-5-3-router.md`.
- Next useful action:
  - In the new session, read `AGENTS.md`, `CLAUDE.md`, `docs/agent-handoff-notes.md`, and `docs/codex-5-3-router.md`.
  - Use the router to send one task packet at a time to Codex 5.3.
  - Recommended next work: Phase 2 blog structure and SEO for `src/pages/blog/index.astro` and `src/pages/blog/[...slug].astro`.
- Verification:
  - Latest blog/content verification before this handoff: `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints; `npm run build` passed and generated 28 pages.
- Remaining dirty files to keep excluded unless explicitly requested:
  - `.ai/memory/conventions.md`
  - `package-lock.json`
  - `.agent/`
  - `.ai/memory/conventions.md.tmp.4907.1775928805346`
  - `.claude/`
  - `.codex/`
  - `CLAUDE.md`
- Blockers:
  - None for continuation. Official skill validation still cannot run in local Python because `yaml` is missing.

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
