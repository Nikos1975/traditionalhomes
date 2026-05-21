# Property Pages Phase 2 Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the next property-page quality pass after the content rewrite by checking live presentation, removing remaining friction, and documenting any facts that still need owner confirmation.

**Architecture:** Keep the site static-first and content-driven. Prefer edits in `src/content/*`, `src/inventory/inventory.json`, `src/data/siteCopy.json`, and existing Astro/Tailwind components only where the live UI proves a real issue. Avoid broad component refactors.

**Tech Stack:** Astro 5, Tailwind CSS, Markdown content collections, `src/inventory/inventory.json`, `@astrojs/sitemap`, in-app Browser verification.

---

## File Map

- `src/content/houses/*.md`: live narrative copy for the 10 house pages.
- `src/content/villa/almond-tree-villa.md`: live narrative copy for the villa page.
- `src/inventory/inventory.json`: source of truth for structured property facts.
- `src/data/siteCopy.json`: shared site notes and operational copy.
- `src/pages/en/houses/[slug].astro`: house page template.
- `src/pages/en/villa/[slug].astro`: villa page template.
- `src/pages/en/houses/index.astro`: collection page template.
- `docs/content-audit-property-pages-checklist.md`: completed audit checklist and reference.
- `docs/agent-handoff-notes.md`: running handoff notes for future agents.

---

### Task 1: Browser Review Every Property Page

**Files:**
- Read: `src/content/houses/*.md`
- Read: `src/content/villa/almond-tree-villa.md`
- Modify only if needed: `src/content/houses/*.md`
- Modify only if needed: `src/content/villa/almond-tree-villa.md`
- Modify: `docs/agent-handoff-notes.md`

- [x] **Step 1: Start or reuse the dev server**

Run:

```powershell
Get-NetTCPConnection -LocalPort 4321 -State Listen -ErrorAction SilentlyContinue
```

Expected:

- If a listener exists, use `http://localhost:4321`.
- If no listener exists, run:

```powershell
npm run dev -- --host 127.0.0.1
```

- [x] **Step 2: Open each page in Browser**

Review these URLs:

```text
http://localhost:4321/en/houses/argyro/
http://localhost:4321/en/houses/leonidas/
http://localhost:4321/en/houses/margarita/
http://localhost:4321/en/houses/demetra/
http://localhost:4321/en/houses/penelope/
http://localhost:4321/en/houses/erato/
http://localhost:4321/en/houses/clio/
http://localhost:4321/en/houses/efterpi/
http://localhost:4321/en/houses/kalliopi/
http://localhost:4321/en/houses/monastiri/
http://localhost:4321/en/villa/almond-tree-villa/
```

Check:

- Headline and badge do not collide.
- Summary/sidebar facts match the page body.
- Prose sections are not too repetitive.
- Access notes are visible but not overwhelming.
- CTA card does not hide or overlap content.
- Mobile layout remains readable.

- [x] **Step 3: Apply only proven copy fixes**

If a page reads awkwardly in the browser, edit only that page's Markdown file. Keep the existing section structure:

```markdown
### [Specific Setting Or Layout Heading]

[Fact-first paragraph.]

### The Interior Layout

[Sleeps, bedrooms, bathrooms, stairs, kitchen, practical use.]

### [Outdoor Space Heading]

[Pool/veranda/courtyard/balcony and view.]

### Access And Setting

[Parking, steps, internal stairs, pairing if useful.]
```

- [x] **Step 4: Record review results**

Append a dated note to `docs/agent-handoff-notes.md` with:

```markdown
### 2026-05-21 - Property browser review

- Goal: browser-review all property pages after the content rewrite.
- Verified:
  - [list pages checked]
- Changed:
  - [list files changed]
- Remaining:
  - [list any pages needing owner fact confirmation]
- Blockers:
  - [list blockers, or "None"]
```

---

### Task 2: Fix Remaining UI Friction On Property Pages

**Files:**
- Inspect: `src/pages/en/houses/[slug].astro`
- Inspect: `src/pages/en/villa/[slug].astro`
- Inspect: `src/pages/en/houses/index.astro`
- Modify only if needed: relevant Astro component/page file
- Modify: `docs/agent-handoff-notes.md`

- [x] **Step 1: Check known friction points**

Use Browser at desktop and mobile widths for:

```text
http://localhost:4321/en/houses/
http://localhost:4321/en/houses/demetra/
http://localhost:4321/en/villa/almond-tree-villa/
```

Check:

- Breadcrumb works repeatedly on mobile.
- Gallery "View all photos" button uses the green/stone hover treatment, not black.
- Primary booking/rate buttons are orange and hover green.
- Villa badge uses the green treatment.
- Access reminder placement is useful, not repeated too high on every page.

- [x] **Step 2: Fix only confirmed UI issues**

If Browser confirms an issue, update the smallest relevant file. Keep Tailwind changes local to the existing component or page. Do not introduce new JS unless the bug requires it.

- [x] **Step 3: Verify the exact issue**

Run:

```powershell
npm run build
npm run typecheck
```

Expected:

- `npm run build` completes.
- `npm run typecheck` reports `0 errors`, `0 warnings`, `0 hints`.

Use Browser to re-check the exact page and interaction that failed.

---

### Task 3: Owner Fact Confirmation List

**Files:**
- Modify: `docs/agent-handoff-notes.md`
- Modify if user provides facts: `src/inventory/inventory.json`
- Modify if user provides facts: `src/content/houses/*.md`
- Modify if user provides facts: `src/content/villa/almond-tree-villa.md`

- [x] **Step 1: Prepare the confirmation list**

Ask the owner to confirm only facts that should return to the website:

```text
1. Exact square metres for each house, if they should be shown.
2. Historical claims:
   - Argyro built in 1905
   - Clio ancient church site
   - Efterpi 15th-century church / artifacts
   - Monastiri Prophet Elias Monastery / 2003 reconstruction
3. Exact walk/drive times from Mavrikiano houses to Elounda waterfront.
4. Whether any paired houses give exclusive pool or barbecue use when booked together.
```

- [x] **Step 2: Add confirmed facts only**

If facts are confirmed, add them to `src/inventory/inventory.json` first when they are structured facts. Then reflect them in Markdown copy only where they help a booking decision.

- [x] **Step 3: Leave unconfirmed facts out**

If facts are not confirmed, keep the current safer copy. Do not add `[needs confirmation]` inside public page content.

---

### Task 4: Final Verification And Handoff

**Files:**
- Modify: `docs/agent-handoff-notes.md`

- [x] **Step 1: Run text checks**

Run:

```powershell
rg -n "\[10\]|\[5\]|If there is a pool|two comfortable bedrooms|square metres|square-metre|15th-century|ancient church|historical engravings|Prophet Elias|perfect|idyllic|magnificent|sanctuary|absolute|premium|exclusive|pristine|bustling|effortlessly|seamless|sweeping" src\content\houses src\content\villa
```

Expected:

- No matches, unless the owner has confirmed a specific historical or square-metre claim and the wording is intentionally restored.

- [x] **Step 2: Run build checks one at a time**

Run:

```powershell
npm run build
npm run typecheck
```

Expected:

- `npm run build` passes.
- `npm run typecheck` reports `0 errors`, `0 warnings`, `0 hints`.
- Do not run these two Astro commands in parallel because concurrent content sync can produce duplicate-id warnings.

- [x] **Step 3: Update handoff**

Append:

```markdown
### 2026-05-21 - Phase 2 property fixes

- Goal: complete browser review, UI friction fixes, and fact-confirmation list.
- Files changed:
  - [exact files]
- Verified:
  - `npm run build`
  - `npm run typecheck`
  - Browser pages checked
- Remaining:
  - [remaining work, or "None"]
- Blockers:
  - [blockers, or "None"]
```

---

## Self-Review

- Spec coverage: covers browser review, UI friction, owner fact confirmation, build/typecheck, and handoff notes.
- Placeholder scan: no task depends on unspecified implementation details.
- Type consistency: plan keeps structured facts in `src/inventory/inventory.json` and narrative copy in Markdown content files.
