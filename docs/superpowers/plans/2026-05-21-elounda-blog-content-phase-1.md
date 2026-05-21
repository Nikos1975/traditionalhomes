# Elounda Blog Content Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a focused Elounda blog series from the organized research folders, with factual, non-promotional articles that fit the site voice and Astro content schema.

**Architecture:** Research remains under `docs/research/elounda/`; publish-ready articles live only under `src/content/blog/`. Each article is a standalone Markdown content entry with schema-valid frontmatter, clear SEO title/description, restrained internal links, and no unsupported claims.

**Tech Stack:** Astro content collections, Markdown, `src/content.config.ts`, `npm run build`, `npm run typecheck`.

---

## File Structure

- Create or update: `src/content/blog/elounda-history-through-its-shoreline.md`
- Create: `src/content/blog/elounda-visitor-economy.md`
- Create: `src/content/blog/elounda-wartime-memory.md`
- Read: `docs/research/elounda/elounda-rich-historical-tapestry/sources.md`
- Read: `docs/research/elounda/elounda-luxury-tourism-evolution/sources.md`
- Read: `docs/research/elounda/elounda-wartime-history-and-stories/sources.md`
- Read/update if useful: `docs/research/elounda/*/facts.md`
- Update: `docs/agent-handoff-notes.md`

## Content Rules Checklist

- [ ] Published articles start with a clear scene, fact, or grounded context.
- [ ] Titles are durable and specific, not clickbait.
- [ ] Descriptions summarize the exact page topic.
- [ ] No hype, urgency, generic travel wording, or booking-copy tone.
- [ ] No unsupported dates, distances, square-metre-style precision, or historical claims.
- [ ] Uncertain facts are omitted from published posts or captured in research notes for verification.
- [ ] Internal links are added only where they fit the paragraph context.
- [ ] Markdown is not placed under `src/pages/`.
- [ ] Articles use frontmatter fields accepted by `src/content.config.ts`.
- [ ] Build and typecheck pass after content changes.

## Task 1: Historical Shoreline Article

**Files:**
- Modify: `src/content/blog/elounda-history-through-its-shoreline.md`
- Read: `docs/research/elounda/elounda-rich-historical-tapestry/sources.md`

- [ ] **Step 1: Audit overlap with existing article**

Check whether `elounda-history-through-its-shoreline.md` duplicates the broader essay `src/content/blog/elounda-guide.md`.

Run:

```powershell
Get-Content -Raw src/content/blog/elounda-history-through-its-shoreline.md
Get-Content -Raw src/content/blog/elounda-guide.md
```

Expected: the shoreline article should be shorter, practical, and focused on reading history through the coast, lagoon, Olous, salt, Spinalonga, and harbor settlements.

- [ ] **Step 2: Screen raw research**

Extract only claims that are stable and useful to visitors:

```text
Safe claims:
- Ancient Olous is associated with the Elounda area and remains near shallow water.
- Spinalonga has Venetian fortification history and later 20th-century leprosy-settlement history.
- Elounda's lagoon, salt activity, harbor, and settlement pattern are connected to its shoreline geography.
- Some exact dates and technical geological claims need verification before publication.
```

- [ ] **Step 3: Rewrite the article**

Keep this structure:

```markdown
# Elounda History Through Its Shoreline

Opening: Elounda's coast as a practical way to understand its history.

## Olous and the Shallow Water
## Salt, Windmills, and the Lagoon
## Spinalonga Across the Water
## How to Read the Shoreline Today
Quiet closing paragraph.
```

- [ ] **Step 4: Add restrained internal links**

Use links only where natural:

```markdown
[Elounda location guide](/en/location/)
[Mavrikiano guide](/en/guide/mavrikiano/)
```

- [ ] **Step 5: Self-audit**

Check:

```powershell
rg -n "luxury|exclusive|must-see|hidden gem|paradise|unforgettable|spectacular|best|perfect" src/content/blog/elounda-history-through-its-shoreline.md
```

Expected: no hype terms unless used in a factual context that still reads restrained.

## Task 2: Visitor Economy Article

**Files:**
- Create: `src/content/blog/elounda-visitor-economy.md`
- Read: `docs/research/elounda/elounda-luxury-tourism-evolution/sources.md`

- [ ] **Step 1: Screen raw research**

Use only broad, supportable points:

```text
Safe claims:
- Elounda's visitor economy developed around its sheltered coast, views, and access to Spinalonga and Mirabello Bay.
- The area became associated with high-end hospitality over time.
- Large hotel projects changed the public image of Elounda.
- Exact investment figures, ownership details, future development timelines, and named-person claims require verification before publication.
```

- [ ] **Step 2: Create schema-valid frontmatter**

Use:

```yaml
---
title: "How Elounda's Visitor Economy Changed"
description: "A factual look at how Elounda's coastal setting, hotels, and public image shaped its modern visitor economy."
pubDate: 2026-05-21
category: "Location Guide"
region: "Elounda, Lasithi, Eastern Crete"
tags:
  - elounda
  - crete
  - tourism
  - mirabello
image: "/images/location-map.jpg"
imageAlt: "Elounda coastline and Mirabello Bay in eastern Crete"
---
```

- [ ] **Step 3: Write the article**

Use this structure:

```markdown
# How Elounda's Visitor Economy Changed

Opening: start with geography, not marketing.

## A Coast That Shaped Movement
## From Working Shoreline to Visitor Economy
## Hotels and Public Image
## What This Means for Visitors Today
Quiet closing paragraph.
```

- [ ] **Step 4: Add restrained internal links**

Use:

```markdown
[houses in Mavrikiano and Vrouchas](/en/houses/)
[location guide](/en/location/)
```

- [ ] **Step 5: Self-audit**

Run:

```powershell
rg -n "luxury|jet set|elite|exclusive|world-class|premier|high-end|lavish|iconic|unforgettable" src/content/blog/elounda-visitor-economy.md
```

Expected: avoid or rewrite promotional phrasing. "High-end" may appear only if describing public perception, not selling the site.

## Task 3: Wartime Memory Article

**Files:**
- Create: `src/content/blog/elounda-wartime-memory.md`
- Read: `docs/research/elounda/elounda-wartime-history-and-stories/sources.md`

- [ ] **Step 1: Screen raw research**

Use only broad, verifiable points:

```text
Safe claims:
- Mirabello Bay and Elounda's sheltered waters had strategic value.
- Spinalonga's 20th-century leprosy-settlement history overlaps with wartime memory.
- WWII claims involving local incidents, aircraft, minefields, individual stories, and exact dates need stronger source confirmation before publication.
```

- [ ] **Step 2: Create schema-valid frontmatter**

Use:

```yaml
---
title: "Elounda, Spinalonga, and Wartime Memory"
description: "A careful guide to how Elounda's sheltered waters, Spinalonga, and local memory connect to the wartime history of Mirabello Bay."
pubDate: 2026-05-21
category: "History"
region: "Elounda, Lasithi, Eastern Crete"
tags:
  - elounda
  - crete
  - history
  - spinalonga
  - mirabello
image: "/images/location-map.jpg"
imageAlt: "View toward Mirabello Bay and the Elounda coast"
---
```

- [ ] **Step 3: Write the article**

Use this structure:

```markdown
# Elounda, Spinalonga, and Wartime Memory

Opening: start with the bay and the visible geography.

## A Sheltered Bay With Strategic Value
## Spinalonga's Separate History
## What Remains Visible
## How to Approach the Subject Today
Quiet closing paragraph.
```

- [ ] **Step 4: Avoid unsupported micro-stories**

Do not publish:

```text
- named local wartime anecdotes
- exact military infrastructure claims
- exact incident dates
- dramatic casualty or tragedy claims
```

unless a reliable source is directly confirmed.

- [ ] **Step 5: Self-audit**

Run:

```powershell
rg -n "haunting|tragic|blood|ghost|horror|crucible|shadow|swastika|miracle|desperate" src/content/blog/elounda-wartime-memory.md
```

Expected: remove melodrama and keep the tone respectful.

## Task 4: Final Verification

**Files:**
- Verify: `src/content/blog/*.md`
- Update: `docs/agent-handoff-notes.md`

- [ ] **Step 1: Check no internal markdown is under pages**

Run:

```powershell
rg --files src/pages | rg "\.md$"
```

Expected: no output.

- [ ] **Step 2: Run typecheck**

Run:

```powershell
npm run typecheck
```

Expected:

```text
0 errors
0 warnings
0 hints
```

- [ ] **Step 3: Run build**

Run:

```powershell
npm run build
```

Expected: build completes and includes the new blog routes.

- [ ] **Step 4: Handle Windows cache locks**

If build fails with:

```text
EPERM: operation not permitted, rename ... node_modules\.astro\data-store.json.tmp
```

Classify as Windows filesystem/cache lock, rerun `npm run build` once, and report both the transient failure and final result.

- [ ] **Step 5: Update handoff notes**

Add a short dated note to `docs/agent-handoff-notes.md`:

```markdown
### 2026-05-21 - Elounda blog research articles

- Goal: create Phase 1 Elounda blog articles from organized research.
- Files changed:
  - `src/content/blog/elounda-history-through-its-shoreline.md`
  - `src/content/blog/elounda-visitor-economy.md`
  - `src/content/blog/elounda-wartime-memory.md`
  - `docs/superpowers/plans/2026-05-21-elounda-blog-content-phase-1.md`
- Verified:
  - `npm run typecheck` passed.
  - `npm run build` passed.
- Remaining:
  - Phase 2 blog index/category improvements.
- Blockers:
  - None.
```

## Self-Review

- [ ] Spec coverage: plan covers three research folders, article creation/update, schema frontmatter, internal linking, no markdown under `src/pages/`, build/typecheck, and reporting.
- [ ] Placeholder scan: no task relies on unspecified code or "fill later" instructions.
- [ ] Type consistency: all frontmatter fields match `src/content.config.ts`.
