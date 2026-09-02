# Traditional Homes — Permanent Work Table

**Last reviewed:** 2026-09-03  
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
- Keep the TypeScript baseline at zero errors so typecheck remains a useful quality gate.
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

- [x] Fix `src/components/UnitCard.astro` TypeScript error: `InventoryUnit.village` typing mismatch.
  - Owner: Nikos / Coding Agent
  - Completed: 2026-08-27
  - Evidence:
    - PR #81
    - implementation commit: `b1c51e6`
    - merge commit: `6ffb207`

- [x] Fix `src/components/booking/BookingHandoffForm.astro` TypeScript error: invalid `rel` on `<form>`.
  - Owner: Nikos / Coding Agent
  - Completed: 2026-08-27
  - Evidence:
    - PR #81
    - implementation commit: `b1c51e6`
    - merge commit: `6ffb207`

- [x] `npm run typecheck` → 0 errors.
  - Evidence: Windows validation on `b1c51e6`: 0 errors, 0 warnings, 3 hints.

- [x] `npm test` → PASS after the P0 fixes.
  - Evidence: Windows validation on `b1c51e6`: 414 tests, 414 pass, 0 fail, 0 cancelled.

- [x] `npm run build` → PASS after the P0 fixes.
  - Evidence: Windows validation on `b1c51e6`: PASS, 57 pages built, sitemap generated.

- [x] `npm run seo:links` → PASS after the P0 fixes.
  - Evidence: Windows validation on `b1c51e6`: PASS.

- [x] `git diff --check` → clean for the P0 PR.
  - Evidence: clean during isolated PR validation; final Windows validation worktree also returned clean `git status --short`.

---

# P1 — Production / Indexation

- [x] Record a final production smoke test at 100% browser zoom.
  - Check: `/de/`
  - Check: `/de/ferienhaeuser/`
  - Check: at least 3 German property detail pages
  - Check: `/de/kontakt/`
  - Check: `/de/faq/`
  - Check: `/de/richtlinien/`
  - Check: EN ↔ DE switching
  - Evidence: 2026-08-28 production smoke test PASS — 8 required German routes loaded successfully at 100% browser zoom; German content appeared where expected; navigation and primary CTAs worked; images loaded after normal lazy-load scrolling; EN ↔ DE switching passed for collection, property, and contact equivalents; no issues found.

- [x] Verify sitemap contains only intended generated German URLs.
  - Evidence: 2026-08-28 production sitemap PASS — contains 20 intended German URLs.

- [x] Verify German pages use self-referencing canonicals.
  - Evidence: 2026-08-28 production canonical check PASS — all 20 German URLs use self-referencing canonicals.

- [x] Verify reciprocal EN ↔ DE `hreflang` only where real equivalents exist.
  - Evidence: 2026-08-28 production hreflang check PASS — reciprocal EN ↔ DE hreflang exists only for actual equivalents.

- [x] Confirm there are no unintended `/de/houses/*` public routes/indexation targets.
  - Evidence: 2026-08-28 production route/indexation check PASS — `/de/houses/` and all 10 corresponding property variants return 404; zero `/de/houses/*` URLs appear in the sitemap.

- [x] Establish the first German discovery/indexation baseline in Google Search Console.
  - Evidence: 2026-08-28 first post-rollout baseline — sitemap submission status Success and resubmitted (previous last read 2026-08-21; 36 pages previously discovered); `/de/` and `/de/reisefuehrer/mavrikiano/` were initially not on Google, passed live tests, and had indexing requested; `/de/ferienhaeuser/` and `/de/kontakt/` were on Google; initial German Search Performance was 0. Google has begun discovery/indexing; no technical indexation defect identified.

- [x] Fix the confirmed GSC legacy `component/mailto` 5xx URL in production.
  - Owner: Nikos / Coding Agent
  - Completed: 2026-08-31
  - Evidence:
    - Affected URL: `https://traditional-homes.gr/index.php/en/component/mailto/?tmpl=component&template=boutique&link=bfd25c5855a7c69f620bf8c6a6b6045f57e2f22f`
    - PR #84; implementation commit: `32ce1e7021d64330452952de540f3f523c74866e`; merge commit: `81b8f15bb3c5eeccb83f8f5e43a20b31ed18f6f0`
    - 2026-08-31 production verification: HTTP 301 to `/en/contact/` with legacy query parameters preserved, then HTTP 200 after one redirect; no redirect loop or chain; destination self-canonical is `https://traditional-homes.gr/en/contact/`.
    - **FIXED IN PRODUCTION — GSC Validate Fix submitted 2026-08-31 — Google recrawl/revalidation pending.**

---

# P2 — Search Console Baseline

- [ ] Export/Search Console Queries — last 90 days.
  - Evidence/file:

- [ ] Export/Search Console Pages — last 90 days.
  - Evidence/file:

- [ ] Review Page Indexing report.
  - Partial evidence: 2026-08-31 GSC Not Found examples classified — `/index.php/en/contact/components` is legacy malformed/orphan (keep 404); `/index.php/en/apartments` remains hold at the existing medium-confidence, non-public mapping; `/images/web_3c.pdf` is a legacy document with no verified current equivalent (keep 404); the legacy `component/mailto` query-string variant is already covered by the existing exact redirect; `/leonidas` is a high-confidence legacy property URL and has one exact redirect to `/en/houses/leonidas/` pending production verification. Other 404/indexation classifications remain open.

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

- [ ] Run a real-device mobile conversion smoke test on representative pages.
  - Test one sea-view house, one pool house, one German property page, and Almond Tree Villa.
  - Verify hero/gallery, call/contact CTA, Check Dates, WebHotelier handoff, back navigation, and sticky booking UI.
  - Test on an actual Android phone, not emulator only.
  - Record date, device, route, and any friction found.

- [ ] Add a compact mobile-only click-to-call strip on property pages.
  - Placement: after property facts and before `At a Glance`.
  - Visible number: `+30 697 289 0090`.
  - Use semantic `tel:+306972890090`.
  - Localize the CTA for EN/DE while keeping the number unchanged.
  - Keep desktop unchanged and keep the CTA compact/secondary to booking.
  - Later connect it to `phone_call_click` conversion tracking.

- [ ] Establish a real-user mobile performance baseline before further performance changes.
  - Review Cloudflare RUM / Web Analytics performance data.
  - Prioritize LCP, CLS and INP on Home, Houses collection, one property page, Location and one major Blog article.
  - Record the baseline before changing performance code.
  - Investigate only pages with measured problems rather than optimizing speculatively.

- [ ] Verify the complete direct-booking handoff end-to-end.
  - Test property page → Check Dates → WebHotelier.
  - Confirm the correct property/room mapping.
  - Confirm dates and guest parameters where applicable.
  - Test EN and DE.
  - Test mobile and desktop.
  - Verify there is no broken or confusing return path.

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

- [ ] Implement minimal site-wide conversion-event tracking with Cloudflare Zaraz, without making Google Analytics a dependency.
  - Core events: `phone_call_click`, `booking_click`, `contact_submit`, `directions_click`, `property_click`.
  - Context parameters: `page_type`, `article_slug`, `property_slug` / `destination_property`, `locale`, `placement`.
  - Include Blog attribution so article → property / booking / contact / phone actions can be measured.
  - Keep tracking deliberately minimal; do not add scroll-depth, gallery, image, TOC, or other low-value interaction events unless a future decision specifically requires them.
  - Purpose: measure commercial intent and which existing pages/articles contribute to direct-booking actions without creating analytics noise.

- [ ] Audit existing high-value Blog articles for natural commercial-path opportunities.
  - Check whether relevant articles naturally link to Location, Houses collection, and appropriate property pages.
  - Do not force property links where editorial relevance is weak.
  - Prioritize articles already receiving impressions or traffic.
  - Measure article → property / booking / contact / phone contribution after conversion-event tracking exists.

- [ ] Standardize measurable Google Business Profile links.
  - Verify the website link and reservation link.
  - Add consistent UTM attribution where supported and appropriate.
  - Confirm destination pages and redirects.
  - Record the final production URLs.

- [ ] Create a lightweight quarterly website conversion health check.
  - Confirm contact-form submission works.
  - Confirm booking links resolve to the correct WebHotelier destination.
  - Confirm phone links open the dialer.
  - Confirm Maps/directions links open the correct locations.
  - Confirm sitemap responds successfully.
  - Confirm representative EN/DE routes render correctly.
  - Record the date and failures/fixes rather than redesigning without evidence.

---

# Completed Log

## 2026-08-27

- [x] PR #80 merged: German non-Blog site rollout.
  - Evidence: `https://github.com/Nikos1975/traditionalhomes/pull/80`
  - Merge commit: `4c777c4`
- [x] PR #81 merged: remaining TypeScript baseline errors cleared.
  - Evidence: `https://github.com/Nikos1975/traditionalhomes/pull/81`
  - Implementation commit: `b1c51e6`
  - Merge commit: `6ffb207`
  - Windows validation: 414/414 tests pass; typecheck 0 errors; build 57 pages; `seo:links` pass; clean validation worktree.
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
