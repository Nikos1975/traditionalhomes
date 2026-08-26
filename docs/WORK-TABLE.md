# Traditional Homes — Permanent Work Table

**Last reviewed:** 2026-08-27  
**Primary objective:** increase direct-booking potential and organic visibility from the existing `traditional-homes.gr` website.  
**Current sprint:** 2026-08-27 → 2026-09-26  
**Content rule:** new article production is paused during this sprint.

## Agent Operating Protocol

This file is the authoritative operational work table for the Traditional Homes website.

Every LLM/agent working on this repository must:

1. Read this file before proposing or starting non-trivial work.
2. Follow the highest-priority unfinished task unless Nikos explicitly gives a different task.
3. Treat an explicit instruction from Nikos as the current priority; update this table afterward if the priority changed materially.
4. Do not create a parallel active task list. `docs/agent-handoff-notes.md` remains historical/handoff context, not the priority source of truth.
5. Mark work complete only when there is evidence where evidence is available: PR, commit SHA, test/build result, production URL, Search Console export, or dated manual verification.
6. Record blockers and the next action on any task that cannot proceed.
7. Put non-priority ideas in **Backlog / Parking Lot** instead of silently expanding scope.
8. Preserve completed history. Do not delete completed items just to shorten the file; summarize older completion history when needed.
9. Never change priorities, content-freeze status, or strategic constraints silently.
10. If repository reality conflicts with this table, stop the affected work, verify the current state, then correct the table or report the inconsistency.

## Current Strategy

- Primary 30-day website objective: **more direct bookings + stronger organic visibility**.
- Pause new content and extract more value from pages that already exist.
- Fix the known TypeScript baseline errors first so typecheck becomes a useful quality gate.
- Use Google Search Console as the authoritative source for query-to-page SEO decisions.
- Prefer indexation, distribution, internal linking, snippet improvement, and conversion work over new URLs or articles.
- Do not start full German Blog translation without evidence of German search demand.
- Keep property-sale readiness as a separate workstream; do not bend the hospitality website sprint around it.

## Current State Snapshot

### Production / i18n

- [x] German non-Blog rollout merged via PR #80.
  - Evidence: `https://github.com/Nikos1975/traditionalhomes/pull/80`
  - Release commit: `4c777c4`
- [x] German property detail routes exist for the houses and Almond Tree Villa.
- [x] German navigation, FAQ, policies, contact, about, and Mavrikiano guide are part of the merged rollout.
- [ ] Final production smoke check recorded with evidence for representative German routes and EN ↔ DE switching.
- [ ] German sitemap/canonical/hreflang output verified on production after the rollout.

### Current content rule

- [x] New article production paused for the current sprint.
- [ ] Existing content may be changed only when there is a concrete indexing, distribution, CTR, internal-link, factual freshness, or conversion reason.

---

# P0 — Technical Quality

- [ ] Fix `src/components/UnitCard.astro` TypeScript error: `InventoryUnit.village` typing mismatch.
  - Owner: Nikos / Coding Agent
  - Evidence:
  - Blocker:
  - Next step: isolated PR only; no unrelated refactor.

- [ ] Fix `src/components/booking/BookingHandoffForm.astro` TypeScript error: invalid `rel` on `<form>`.
  - Owner: Nikos / Coding Agent
  - Evidence:
  - Blocker:
  - Next step: preserve runtime/security/booking behavior.

- [ ] `npm run typecheck` → 0 errors.
  - Evidence:

- [ ] `npm test` → PASS after the P0 fixes.
  - Evidence:

- [ ] `npm run build` → PASS after the P0 fixes.
  - Evidence:

- [ ] `npm run seo:links` → PASS after the P0 fixes.
  - Evidence:

- [ ] `git diff --check` → clean for the P0 PR.
  - Evidence:

---

# P1 — Production / Indexation

- [ ] Record a final production smoke test at 100% browser zoom.
  - Check: `/de/`
  - Check: `/de/ferienhaeuser/`
  - Check: at least 3 German property detail pages
  - Check: `/de/kontakt/`
  - Check: `/de/faq/`
  - Check: `/de/richtlinien/`
  - Check: EN ↔ DE switching
  - Evidence:

- [ ] Verify sitemap contains only intended generated German URLs.
  - Evidence:

- [ ] Verify German pages use self-referencing canonicals.
  - Evidence:

- [ ] Verify reciprocal EN ↔ DE `hreflang` only where real equivalents exist.
  - Evidence:

- [ ] Confirm there are no unintended `/de/houses/*` public routes/indexation targets.
  - Evidence:

- [ ] Establish the first German discovery/indexation baseline in Google Search Console.
  - Evidence:

---

# P2 — Search Console Baseline

- [ ] Export/Search Console Queries — last 90 days.
  - Evidence/file:

- [ ] Export/Search Console Pages — last 90 days.
  - Evidence/file:

- [ ] Review Page Indexing report.
  - Evidence:

- [ ] Review submitted sitemap status.
  - Evidence:

- [ ] Classify `Crawled - currently not indexed` pages.
  - Evidence:

- [ ] Classify `Discovered - currently not indexed` pages.
  - Evidence:

- [ ] Identify pages with meaningful impressions but weak CTR.
  - Evidence:

- [ ] Identify pages with ranking opportunity, especially existing pages around positions 5–20.
  - Evidence:

- [ ] Build a query → page ownership map before making major SEO edits.
  - Evidence:

---

# P3 — Existing Content Distribution

- [ ] Rank existing pages using GSC evidence and commercial relevance.
  - Consider: impressions, clicks, CTR, average position, internal-link opportunity, relevance to houses/location/direct booking.
  - Evidence:

- [ ] Select the Top 10 existing pages for the first distribution/optimization cycle.
  - Evidence:

For each selected page, choose only justified actions:

- [ ] Internal-link improvement
- [ ] Google Business Profile distribution
- [ ] Social redistribution
- [ ] Search snippet/title/description improvement where data supports it
- [ ] No change where current performance is already appropriate

---

# P4 — Conversion / Direct Booking

Audit the path:

`Google → landing page → property/collection page → Check Dates → WebHotelier`

- [ ] Review collection-page CTA path.
- [ ] Review property-page CTA path.
- [ ] Review booking handoff behavior.
- [ ] Review contact path.
- [ ] Review mobile conversion path.
- [ ] Review Google Business Profile reservation link.
- [ ] Record actual friction before redesigning anything.

Evidence / findings:

---

# P5 — German SEO Decision

Do not translate the Blog automatically.

- [ ] Gather German impressions and query data.
- [ ] Identify which German landing pages receive demand.
- [ ] Identify English articles with demonstrated German-search opportunity.
- [ ] Decide whether selective German article translation is justified.

Decision evidence:

---

# P6 — Existing Content Maintenance

- [ ] Maintain the content freeze unless Nikos explicitly ends it.
- [ ] Refresh an existing page only when supported by a concrete reason:
  - indexation issue
  - query/intent mismatch
  - weak CTR with meaningful impressions
  - internal-link gap
  - outdated/factually stale information
  - ranking opportunity
  - conversion problem
- [ ] Preserve URLs/canonicals unless evidence supports changing them.

---

# Backlog / Parking Lot

Not active during the current sprint unless Nikos explicitly promotes an item:

- New research-led articles
- Full German Blog translation
- Large visual redesign
- New URLs without evidence
- Speculative SEO rewrites
- Broad refactors unrelated to an active defect or measurable objective

---

# Completed Log

## 2026-08-27

- [x] PR #80 merged: German non-Blog site rollout.
  - Evidence: `https://github.com/Nikos1975/traditionalhomes/pull/80`
  - Merge commit: `4c777c4`
- [x] Strategic decision: pause new content and concentrate on distribution/indexation of existing content.
- [x] Strategic decision: fix the two known TypeScript errors before the next SEO workstream.
- [x] Strategic decision: primary 30-day website objective is direct bookings + stronger organic visibility.
- [x] Strategic decision: this file is the permanent operational work table for website agents.

---

# Completion Evidence Format

Use this pattern when closing meaningful work:

```md
- [x] Task name
  - Owner: Nikos / Agent
  - Completed: YYYY-MM-DD
  - Evidence:
    - PR #NN
    - commit: abc1234
    - `npm run typecheck`: 0 errors
    - `npm test`: PASS
```

For SEO/indexation work, evidence should be a dated Search Console export/report, production URL check, or other concrete source rather than an assumption.