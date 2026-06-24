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

### 2026-06-24 - Blog content index and indexing skill

- Goal: add a Graphify-style blog content map and a project skill for keeping it current.
- Files changed:
  - `.agents/skills/blog-content-index/SKILL.md`
  - `docs/architecture/blog-content-index.md`
  - `docs/architecture/blog-content-index.mmd`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added blog content index documentation for `/blog/`, current listed posts, hidden noindex style variants, and guide files outside the blog collection.
  - Added a blog indexing skill requiring future blog, guide/blog boundary, route logic, slug, draft/noindex/testVariant, and `/blog/` visibility changes to update the index docs and handoff notes.

### 2026-06-24 - Blog test-page robots metadata

- Goal: remove conflicting robots metadata from directly routable blog style-test pages.
- Files changed:
  - `src/layouts/Base.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - `Base.astro` now emits one robots meta tag. Pages passed `noindex` receive `noindex`; normal pages keep the existing `index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1` policy.
  - The blog style-test pages remain controlled by the existing `noindex={isEloundaGuideTest}` route logic and remain excluded from `/blog/`.
- Remaining:
  - Architecture docs were not updated because no route structure, content collection, component relationship, or user-facing flow changed.

### 2026-06-23 - Almond Tree Villa access wording correction

- Goal: correct Almond Tree Villa access wording in the visible "Before you book" and practical notes.
- Files changed:
  - `src/inventory/inventory.json`
  - `src/content/villa/almond-tree-villa.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Removed the inaccurate steep road warning for Almond Tree Villa.
  - Kept factual access notes for several steps from parking, split-level layout, internal stairs, and stepped levels.
- Remaining:
  - Re-run build after releasing any Windows Vite cache lock if it blocks verification.
  - No architecture documentation update is needed because no route, page structure, or component relationship changed.

### 2026-06-23 - Wi-Fi amenity wording cleanup

- Goal: replace the stronger Wi-Fi speed claim in amenity labels with the safer "Wi-Fi Included" wording across property "What's included" sections.
- Files changed:
  - `src/inventory/inventory.json`
  - `src/content/houses/margarita.md`
  - `docs/agent-handoff-notes.md`
- Verified:
  - Repo search found no remaining old Wi-Fi speed label in property content, villa content, inventory, components, or data paths checked.
  - Browser checks on `/en/houses/monastiri/`, `/en/houses/penelope/`, and `/en/houses/leonidas/` showed `Wi-Fi Included` and not the old Wi-Fi speed label.
- Blocker:
  - `npm run build` remains blocked by the known Windows Vite cache `EPERM` lock at `node_modules/.vite/deps/astro___aria-query.js`.
- Remaining:
  - Re-run build after releasing the Vite cache lock.
  - No architecture documentation update is needed because no route, page structure, or component relationship changed.

### 2026-06-23 - Margarita arrival and courtyard correction

- Goal: update House Margarita copy so the arrival point, arched gate, open courtyard, and first-floor veranda are described accurately.
- Files changed:
  - `src/content/houses/margarita.md`
  - `src/inventory/inventory.json`
  - `src/components/AtAGlance.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Revised the overview to place House Margarita in Mavrikiano, above Schisma, Elounda, a few metres beyond House Leonidas, with the main gate on the right beneath an arch.
  - Reworked the layout and outdoor sections to describe the open stone courtyard as entry/access to the main kitchen and bathroom, not a shaded sitting area.
  - Kept the first-floor sea-view veranda as the primary outdoor living and dining space.
  - Updated Margarita inventory constraints and At a Glance access label to mention courtyard entry and internal stairs.
- Remaining:
  - Re-run build and browser verification after releasing Windows cache locks if they block verification.
  - No architecture documentation update is needed because no route or page structure changed.

### 2026-06-23 - Penelope access and veranda route correction

- Goal: update House Penelope copy so guests can understand the route from shared parking to the road, gate, shared pool/barbecue area, covered veranda, external mini kitchen, and house entrance.
- Files changed:
  - `src/content/houses/penelope.md`
  - `src/inventory/inventory.json`
  - `src/components/AtAGlance.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Rewrote the outdoor kitchen/shared pool and access sections to describe the parking route, about 10 metres of uphill village road, gate, shared pool/barbecue area, steps to the tiled-roof veranda, and internal wooden stairs to the ontas.
  - Updated Penelope inventory constraints and At a Glance access label to reflect external steps plus internal stairs to the ontas.
  - Replaced the shared-pool notice wording that implied a "private estate" with a more precise note about one group using both houses around the same shared pool area.
- Remaining:
  - Re-run build and browser verification after releasing Windows cache locks.
  - No architecture documentation update is needed because no route or page structure changed.

### 2026-06-23 - Leonidas layout copy correction

- Goal: update House Leonidas copy so guests can visualize the entrance, fireplace, bathroom, small kitchen, ontas, main bedroom, and balcony sequence.
- Files changed:
  - `src/content/houses/leonidas.md`
  - `src/inventory/inventory.json`
  - `src/components/AtAGlance.astro`
  - `src/components/booking/BookingHandoffForm.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Replaced generic two-floor wording with a spatial walkthrough from the village steps and entrance through the living space, internal wooden stair, ontas, main bedroom, and sea-view balcony.
  - Updated Leonidas inventory and At a Glance labels to describe a main living space plus ontas, internal wooden stairs, and a small kitchen area.
  - Added `rel="noopener noreferrer"` to the existing booking handoff form that already opens in a new tab.
- Verified:
  - Source checks confirmed the old "arranged over two floors" wording is gone from `src/content/houses/leonidas.md` and the requested balcony details are present.
  - `npm run build` was blocked by the known Windows Vite cache `EPERM` lock at `node_modules/.vite/deps/astro___aria-query.js`, not by a source error.
  - A fresh dev server on port 4322 was blocked by an Astro generated-cache `EPERM` lock on `.astro/data-store.json`.
  - Existing port 4321 browser checks showed the new At a Glance label and no horizontal overflow, but the markdown body was stale because the content cache could not refresh.
- Remaining:
  - Re-run build and fresh browser verification after releasing Windows cache locks.
  - No architecture documentation update is needed because no route or page structure changed.

### 2026-06-23 - Mavrikiano property-content corrections

- Goal: document commit `c64d1fd` (`fix: correct Mavrikiano house details`) covering House Efterpi, House Kalliopi, House Monastiri, and House Penelope.
- Files changed in that correction set:
  - `src/content/houses/efterpi.md`
  - `src/content/houses/kalliopi.md`
  - `src/content/houses/monastiri.md`
  - `src/content/houses/penelope.md`
  - `src/inventory/inventory.json`
  - `src/components/AtAGlance.astro`
  - `src/pages/en/houses/[slug].astro`
- What changed:
  - Corrected the Mavrikiano house copy around layout, access, outdoor space, parking wording, and visible property facts.
  - Corrected Penelope from a full two-floor description to a main living space plus ontas, with wooden beds rather than built-in stone beds.
  - Updated Monastiri as a multi-level sea-view house with internal stairs, private courtyard, dipping pool, balconies, and nearby shared parking.
  - Kept Monastiri wording to the safe church fact: beside or near the small church of Profitis Ilias. Do not add unsupported monastery-history claims or the 1950 date.
  - Aligned `inventory.json` and visible At a Glance data with the corrected property facts.
  - Adjusted `AtAGlance.astro` and the house detail page only for corrected visible labels/data; no routes, page structure, or data-flow architecture changed.
- Verified:
  - `npm run build` was blocked by the known Windows Vite cache `EPERM` lock at `node_modules/.vite/deps/astro___aria-query.js`, not by a source error.
- Remaining:
  - Re-run build after clearing or releasing the Windows Vite cache lock.
  - No architecture documentation update was needed for this copy/data-label correction set.

### 2026-06-17 - Location collection metadata

- Goal: improve the `/en/location/` collection list and update one Mavrikiano distance sentence.
- Files changed:
  - `src/pages/en/location.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Changed the Mavrikiano sentence from a 3-minute drive to a 10-minute drive.
  - Reworked the Location page collection list into quiet property clusters with muted metadata badges for village, view, floor, pool, standalone, and villa distinctions.
- Verified:
  - `npm test` was not run because no `test` script exists in `package.json`.
  - `npm run build` was blocked by a known Windows generated-cache `EPERM` lock under `node_modules/.vite`.
  - `npm run dev -- --host 127.0.0.1 --port 4331` was blocked by a generated Astro content-store `EPERM` lock under `.astro`.
  - Browser verification was blocked because the local dev server could not start.
- Remaining:
  - Re-run build and browser verification after the Windows generated-output/cache locks are released.
- Blockers:
  - Windows `EPERM` locks on generated cache/output files only; no source-code fix should be made for these locks.

### 2026-05-25 - Blog and houses listing design research

- Goal: create standalone HTML design mockups for blog article pages, blog index, and houses listing — all using brand tokens and brand voice. No Astro source files were modified.
- Files created in `docs/research/elounda/blog/`:
  - Blog article variants: `v4b3-refined.html` (meta strip #E7F0ED sage-soft), `v4b4-refined.html` (meta #FFFBEB warm cream), `v4b5-refined.html` (meta #B44B2A terracotta, white text). All have caption centered below photo, article title vertically centered (middle-left) using `top:50%; transform:translateY(-50%)`.
  - Blog index: `blog-index-v1-magazine.html` (featured article + 3-col card grid), `blog-index-v2-list.html` (no images, horizontal rule rows), `blog-index-v3-categories.html` (sticky sidebar + per-category sections), `blog-index-v4-mosaic.html` (80vh hero photo + CSS grid mosaic tiles), `blog-index-v5-timeline.html` (year markers + reverse-chronological rows with thumbnails).
  - Houses listing: `houses-v1-list.html` (directory table, column headers), `houses-v2-grid.html` (3-col square-corner card grid, flat badges), `houses-v3-editorial.html` (sticky 280px sidebar + wide horizontal property entries).
- All mockups use real photos from `http://localhost:4321/en/images/houses/` and `http://localhost:4321/en/images/villa/`, real article/property links, brand tokens (--bg, --fg, --accent, --sage, etc.), Cormorant Garamond + Work Sans.
- Known image quirk: Clio hero filename has a space — encoded as `clio-hero-interior-balcony-view-01%20-1024.webp`. Kalliopi hero is 706px (no 1024 version exists).
- Design critiques given:
  - Current /blog/ index: generic SaaS-style cards, no featured article, no visible photos on load, no visual hierarchy.
  - Current /en/houses/: copy violates brand voice ("discerning traveler", "soul of Crete", "meticulously restored"), cards are Airbnb-style (rounded-[2rem], backdrop-blur-md), "Book Now" is urgency language, BookingHandoffForm appears before the property grid.
- Recommendations: blog-index-v2 or v3 for the blog; houses-v3 (editorial sidebar + horizontal entries) for the houses listing.
- Next action: decide which houses listing design to implement, then make targeted changes to `src/pages/en/houses/index.astro` and `src/components/UnitCard.astro` — keeping the Astro data pipeline (inventory.json, FilterBar, GroupCard, groups.json) intact but replacing visual design and copy.
- No build verification needed (no source changes were made this session).
- Blockers: None.

### 2026-05-22 - Elounda guide style test copies

- Goal: create three live local test copies of the Elounda guide article for paragraph separator/style comparison.
- Files changed:
  - `src/content/blog/elounda-guide-style-1.md`
  - `src/content/blog/elounda-guide-style-2.md`
  - `src/content/blog/elounda-guide-style-3.md`
  - `src/pages/blog/[...slug].astro`
  - `src/pages/blog/index.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added live local test routes `/blog/elounda-guide-style-1/`, `/blog/elounda-guide-style-2/`, and `/blog/elounda-guide-style-3/` using the same article content as `/blog/elounda-guide/`.
  - Style 1 hides visible `hr` separators and uses whitespace only.
  - Style 2 uses full-width light section rules.
  - Style 3 uses a short editorial rule with a small dot marker.
  - Marked the three style test routes `noindex` and excluded them from `/blog/`.
- Verified:
  - Static red/green setup check failed before the copies existed and passed after the copy/style setup.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 33 pages.
  - Static output check confirmed all three test pages generated, have `noindex`, include their variant classes, and are absent from the blog index.
  - `python scripts/audit_public_markdown.py` passed.
- Remaining:
  - Visually compare the three local URLs and choose which treatment to keep or refine.
- Blockers:
  - None.

### 2026-05-22 - Elounda guide location-style hero spacing

- Goal: match the `/blog/elounda-guide/` hero subtitle spacing and measure to the `/en/location/` hero introduction without changing colors.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added explicit green-variant header spacing of `5rem`.
  - Set the guide subtitle to the location hero measure: 24 px font size, `1.625` line-height, and `42rem` max width.
  - Preserved the existing title, subtitle, and tag colors.
- Verified:
  - Static red/green check failed before the CSS rules and passed after the update.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed.
  - Browser CDP check confirmed subtitle color remains `rgb(154, 143, 126)`, font size is 24 px, line-height is 39 px, max width is 672 px, header bottom margin is 80 px, and no horizontal overflow.
- Remaining:
  - None.
- Blockers:
  - None.

### 2026-05-22 - Elounda guide left-aligned article block

- Goal: move the `/blog/elounda-guide/` article block to the left instead of centering it.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Removed `mx-auto` from the green guide variant article wrapper while keeping other standard blog posts centered.
- Verified:
  - Static red/green check failed before the class-logic change and passed after the update.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed.
  - Browser CDP check confirmed the guide wrapper class is `max-w-3xl blog-location-variant blog-location-green-variant` with no `mx-auto` and no horizontal overflow.
- Remaining:
  - None.
- Blockers:
  - None.

### 2026-05-22 - Elounda guide tag visibility

- Goal: make the `/blog/elounda-guide/` tag labels visible after the green variant color changes.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a `blog-post-tags` hook and set green variant tag text to `rgb(107, 95, 80)`.
- Verified:
  - Static red/green check failed before the rule and passed after the update.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed.
  - Browser CDP check at 390 px confirmed all six guide tags render as `rgb(107, 95, 80)` with no horizontal overflow.
- Remaining:
  - None.
- Blockers:
  - None.

### 2026-05-22 - Elounda guide one-line title and subtitle color

- Goal: keep the `/blog/elounda-guide/` title on one line and set the subtitle to the stone accent color.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a `blog-title-single-line` hook for the green blog variant title with fixed breakpoint font sizes and `white-space: nowrap`.
  - Set the green variant subtitle color to `rgb(154, 143, 126)`.
- Verified:
  - Static check confirmed the guide title hook, subtitle color rule, and no-wrap rule are present.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed.
  - Browser CDP checks at 390 px and desktop confirmed the title is one line, subtitle color is `rgb(154, 143, 126)`, and `scrollWidth` equals viewport width.
- Remaining:
  - None.
- Blockers:
  - None.

### 2026-05-22 - Elounda guide title accent split

- Goal: adjust the `/blog/elounda-guide/` title so longer titles begin the italic colored accent from the third word.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Changed the green blog title accent for `Where the Sea Holds Memory` from `the Sea Holds Memory` to `Sea Holds Memory`, leaving `Where the` in the normal title style.
- Verified:
  - Static red/green check failed before the change and passed after the template update.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed.
  - Static output check confirmed the built title renders `Where the` before a `blog-title-accent-v2` span containing `Sea Holds Memory`.
- Remaining:
  - None.
- Blockers:
  - None.

### 2026-05-22 - Blog and location visual review

- Goal: visually review the two styled blog articles and the location page on desktop and mobile.
- Files changed:
  - `src/components/Header.astro`
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Tightened the mobile header masthead so it fits alongside the menu button without horizontal overflow.
  - Allowed long blog breadcrumbs and italic title accents to wrap cleanly on narrow screens.
- Verified:
  - Browser screenshots checked `/blog/elounda-visitor-economy/`, `/blog/elounda-guide/`, and `/en/location/` at desktop and 390 px mobile widths.
  - CDP metrics showed `scrollWidth` equals viewport width on all three target pages at 390 px.
  - Location map popup was opened on desktop and mobile; `Book Now` appears in the popup.
  - `python scripts/audit_public_markdown.py` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed.
- Remaining:
  - None for this visual review pass.
- Blockers:
  - None.

### 2026-05-22 - Blog article location-style variants

- Goal: create two blog article visual variants based on the `/en/location/` page style.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `src/content/blog/elounda-visitor-economy.md`
  - `src/content/blog/elounda-guide.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added route-specific article styling for `/blog/elounda-visitor-economy/` to use location-page scale, spacing, typography, and muted color rhythm.
  - Added a second route-specific variant for `/blog/elounda-guide/` that swaps the stone-400 accent treatment toward the location-page light green.
  - Changed the article drop cap to use the serif title treatment in dark text.
  - Updated the title treatment to keep a dual-color title effect. Version 1 italicizes the final word with `Cormorant Garamond`, weight 300, `rgb(154, 143, 126)`, 24 px / 39 px. Version 2 keeps `Where` normal and italicizes `the Sea Holds Memory` in `rgb(152, 188, 180)`.
  - Set the Version 2 subtitle `A journey through Elounda and the stone villages of eastern Crete` to 24 px / 39 px.
  - Removed duplicated body H1 titles from the two target markdown articles; titles now come from frontmatter and the blog article template.
  - Removed the duplicated markdown subtitle from `elounda-guide.md` because the subtitle already comes from frontmatter.
- Verified:
  - `python scripts/audit_public_markdown.py` passed.
  - Target article body-H1 duplicate check passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 30 pages.
  - Static output check confirmed each target page has one `<h1>`, visitor economy has `blog-location-variant`, and elounda guide has `blog-location-variant blog-location-green-variant`.
  - Static output check confirmed visitor economy has `blog-title-accent-v1`, elounda guide has `blog-title-accent-v2`, and each target page still has one `<h1>`.
  - Static source check confirmed Version 2 title accent starts at `the Sea Holds Memory`, and subtitle sizing is 24 px / 39 px.
- Remaining:
  - Visual browser review recommended on the two target URLs.
- Blockers:
  - None.

### 2026-05-22 - Location map popup Book Now buttons

- Goal: add direct booking actions to property popups on `/en/location/`.
- Files changed:
  - `src/components/maps/LeafletMap.astro`
  - `src/components/maps/MasterLocationMap.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added optional `bookingUrl` to Leaflet marker data.
  - Passed each mapped inventory unit's `availabilityUrl` into the marker data.
  - Rendered a sage `Book Now` popup button under `View Details` when a marker has a booking URL.
- Verified:
  - One-off red/green Node check confirmed marker data and popup rendering include `bookingUrl` / `Book Now`.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 30 pages.
  - Static build output confirms `/en/location/` marker JSON includes booking URLs such as `https://traditionalhomes.reserve-online.net/?room=HARGYR` and `?room=ASP3SV`, and the compiled Leaflet popup script renders `Book Now`.
- Remaining:
  - Browser automation could not be completed because the bundled Playwright package failed to load `playwright-core`; visually confirm in the running browser.
- Blockers:
  - None for code/build.

### 2026-05-22 - WebHotelier mobile caption visibility

- Goal: make mobile captions/labels above WebHotelier booking options visible.
- Files changed:
  - `docs/integrations/webhotelier/webhotelier/traditional-homes-webhotelier-theme.css`
  - `docs/integrations/webhotelier/webhotelier/traditional-homes-webhotelier-mobile.css`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added explicit mobile styling for labels, captions, field captions, and legends inside the booking search panels.
  - Updated the standalone mobile CSS panels to use the same lighter site-like background treatment as the combined theme.
  - Added mobile side gutters, inner padding, `box-sizing`, and full-width input/select/textarea rules so the check-in field does not sit against the left edge.
  - Tightened responsive behavior by centering booking/search boxes with calculated mobile width and auto margins.
  - Added stronger mobile button color rules so WebHotelier's blue mobile defaults are overridden by the site sage/rust palette.
  - Added broader mobile button selectors for WebHotelier classes/IDs containing button, btn, book, reserve, reservation, continue, or search.
  - Added scoped mobile float/width resets inside booking search panels so form controls do not keep desktop column spacing on small screens.
  - Removed the broad `[class*="search"]` color override because it also matched search panel containers and caused a tall green mobile search box.
  - Kept search color overrides only on clickable `a`, `button`, and `input` elements, and added row/column padding resets for mobile spacing.
- Verified:
  - CSS brace check passed for the combined theme and standalone mobile CSS.
  - Scan found no `display: none`, `visibility: hidden`, `pointer-events: none`, or `opacity: 0`.
- Remaining:
  - Paste into WebHotelier and confirm against the live mobile booking markup.
  - Change the visible `Villa/Apartments` wording to `Houses & Villa` in WebHotelier language/template settings, or capture the exact rendered HTML selector for a CSS-only visual override.
- Blockers:
  - CSS cannot safely change real select option text without an exact markup selector or WebHotelier template setting.

### 2026-05-22 - Cloudflare go-live roadmap

- Goal: document the final pre-live sequence before uploading or promoting the site on Cloudflare.
- Files changed:
  - `docs/releases/2026-05-22-cloudflare-go-live-roadmap.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a staged go-live roadmap with WebHotelier calendar coordination as the required blocker before Cloudflare upload or promotion.
  - Documented final scope freeze, verification commands, route smoke tests, clean commit rules, Cloudflare preview checks, and post-live checks.
- Verified:
  - `python scripts/audit_public_markdown.py` passed.
- Remaining:
  - Complete WebHotelier calendar coordination and record the decision before final Cloudflare deployment.
- Blockers:
  - WebHotelier calendar/property mapping decisions are not yet recorded.

### 2026-05-22 - WebHotelier booking funnel strategy

- Goal: add the booking funnel strategy to the Cloudflare go-live roadmap.
- Files changed:
  - `docs/releases/2026-05-22-cloudflare-go-live-roadmap.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Documented the Intelligent Handoff approach: site-styled date/guest selection builds a direct WebHotelier URL with `checkin`, `nights`, `adults`, and `room` parameters.
  - Recorded that WebHotelier remains the transaction engine and the public static site must not call authenticated REST booking or availability endpoints directly.
  - Added GA4 cross-domain tracking and event ownership checks for `view_item`, `select_item`, `begin_checkout`, and `purchase`.
  - Marked collection-page live availability fallback as a later secure/server-side phase unless WebHotelier provides a safe public mechanism.
- Verified:
  - Pending lightweight markdown/public-route audit after this note.
- Remaining:
  - Confirm exact WebHotelier direct-link parameter names, room-code mapping, alternative-property behavior, and GA4/GTM support on WebHotelier pages.
- Blockers:
  - WebHotelier booking/calendar configuration and analytics ownership are not yet confirmed.

### 2026-05-22 - Phase 1 WebHotelier handoff implementation

- Goal: implement the approved Intelligent Handoff booking flow without authenticated API calls.
- Files changed:
  - `src/components/booking/BookingHandoffForm.astro`
  - `src/pages/en/index.astro`
  - `src/pages/en/houses/index.astro`
  - `src/pages/en/houses/[slug].astro`
  - `src/pages/en/villa/[slug].astro`
  - `src/components/Header.astro`
  - `src/components/Footer.astro`
  - `docs/releases/2026-05-22-cloudflare-go-live-roadmap.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a reusable form-based WebHotelier handoff component.
  - Property and villa sidebars now submit `checkin`, `nights`, `adults`, and the unit `bookingId` as `room`.
  - Homepage and collection search forms submit `checkin`, `nights`, and `adults` without a room code.
  - Added `dataLayer` pushes for `view_item` on property forms and `select_item` on availability form submit.
  - Changed header and footer booking links from `http` to `https`.
- Verified:
  - `python scripts/audit_public_markdown.py` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 30 pages.
  - Browser check on `/en/houses/argyro/` generated `https://traditionalhomes.reserve-online.net/?checkin=2026-07-10&nights=5&adults=3&room=HARGYR` and confirmed `view_item` was pushed.
  - Browser check on `/en/houses/` generated `https://traditionalhomes.reserve-online.net/?checkin=2026-08-01&nights=4&adults=2` without a room code and confirmed `select_item` can be pushed.
  - Mobile browser check confirmed the Argyro sidebar form fits the booking card without page-breaking overflow.
- Remaining:
  - Confirm with WebHotelier that these direct-link parameters are accepted exactly as implemented.
  - Confirm GA4 cross-domain linking and WebHotelier-side `begin_checkout` / `purchase` support.
- Blockers:
  - Do not promote to Cloudflare production until WebHotelier parameter mapping and analytics ownership are confirmed.

### 2026-05-22 - Mobile sticky booking CTA

- Goal: add a persistent mobile-first booking footer for high-intent mobile users.
- Files changed:
  - `src/layouts/Base.astro`
  - `src/styles/global.css`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a mobile-only sticky booking bar with arrival date, nights, adults, and submit controls.
  - The sticky bar reads the current page's existing `data-booking-handoff` form, so property pages inherit the correct WebHotelier `room` code.
  - Generic pages submit dates, nights, and adults without a room code.
  - Mobile chat button is lifted above the sticky booking bar.
- Verified:
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 30 pages.
  - Browser mobile check on `/en/houses/argyro/` confirmed the sticky bar generated `https://traditionalhomes.reserve-online.net/?checkin=2026-07-10&nights=5&adults=3&room=HARGYR`.
  - Browser mobile check confirmed the sticky bar and chat trigger do not overlap at 390 px.
  - Browser desktop check confirmed the sticky bar is hidden at 1280 px.
- Remaining:
  - Confirm WebHotelier accepts the direct-link parameters exactly as implemented.
- Blockers:
  - Same WebHotelier parameter and analytics confirmation gate as the wider booking handoff.

### 2026-05-22 - Booking fallback search

- Goal: give guests a clear path to other houses if the selected property is unavailable.
- Files changed:
  - `src/components/booking/BookingHandoffForm.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a secondary `Search all available houses` submit action to room-specific booking forms.
  - The primary submit keeps the selected property `room` code.
  - The fallback submit preserves `checkin`, `nights`, and `adults` but disables the `room` field so WebHotelier receives a collection-wide search.
  - Updated the helper copy to mention alternatives in WebHotelier.
- Verified:
  - `python scripts/audit_public_markdown.py` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 30 pages.
  - Browser check on `/en/houses/argyro/` confirmed primary URL includes `room=HARGYR`.
  - Browser check on `/en/houses/argyro/` confirmed fallback URL preserves the same dates and guests but omits `room`.
- Remaining:
  - Confirm WebHotelier automatically shows alternative available houses when a room-specific search is unavailable.
- Blockers:
  - WebHotelier alternative-property behavior still needs confirmation before go-live.

### 2026-05-22 - WebHotelier visual theme CSS

- Goal: provide paste-ready WebHotelier CSS so the hosted booking flow feels closer to the main site.
- Files changed:
  - `docs/integrations/webhotelier/webhotelier/README.md`
  - `docs/integrations/webhotelier/webhotelier/traditional-homes-webhotelier-theme.css`
  - `docs/integrations/webhotelier/webhotelier/traditional-homes-webhotelier-mobile.css`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Replaced the generic WebHotelier README with project-specific integration notes.
  - Added a desktop/shared WebHotelier theme using the site's stone, sage, and rust palette.
  - Added a mobile append CSS file that keeps controls visible and improves touch sizing.
  - Kept the CSS limited to visual styling; no native WebHotelier booking functionality is hidden or removed.
  - Revised the theme files to parser-safe legacy CSS after WebHotelier reported `CssSyntaxError: Unknown word`; removed CSS variables, `fit-content`, keyframes, and grouped selector blocks around important booking elements.
- Verified:
  - `python scripts/audit_public_markdown.py` passed.
  - CSS brace check passed for desktop/shared and mobile WebHotelier CSS files.
  - CSS scan found no CSS variables, `fit-content`, keyframes, `display: none`, `visibility: hidden`, `pointer-events: none`, or `opacity: 0` rules in the WebHotelier theme files.
- Remaining:
  - Paste CSS into WebHotelier's custom CSS fields and visually inspect on desktop and mobile.
  - Confirm final background image URL; current CSS uses the WebHotelier CDN image from the provided template.
- Blockers:
  - WebHotelier template output must be visually reviewed after CSS is applied in their system.

### 2026-05-22 - New session handoff after blog timeline UI work

- Current branch: `codex/property-content-ui-map-version`.
- Draft PR: `https://github.com/Nikos1975/traditionalhomes/pull/2`.
- Current blog state:
  - Blog has 8 posts: 3 History, 4 Location Guide, 1 Updates.
  - New article title: `Key Phases in Elounda's Hotel Development`.
  - New article route: `/blog/key-phases-in-elounda-hotel-development/`.
  - Old route `/blog/elounda-hotel-clusters-timeline/` is no longer generated.
- Product/content files changed or added in this latest blog pass:
  - `src/content/blog/key-phases-in-elounda-hotel-development.md`
  - `src/components/blog/EloundaHotelTimeline.astro`
  - `src/pages/blog/[...slug].astro`
  - `src/pages/blog/index.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added the new Elounda hotel development article using the user's local HTML research files as context only.
  - Added a left-side anchor-linked timeline component for that article only.
  - Renamed the article slug and component from `hotel-clusters` wording to the clearer `key-phases-in-elounda-hotel-development` / `EloundaHotelTimeline`.
  - Added blog-card hover image reveal using each post's `image` metadata.
  - Rounded blog article images, enlarged the first-letter treatment, and matched blog image hover behavior to the photo gallery: slow scale inside a clipped rounded frame with a subtle dark overlay.
  - Homepage index was intentionally not changed.
- Latest verification:
  - `python scripts/audit_blog_metadata.py` passed.
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/audit_brand_language.py` still reports only existing unrelated `best` matches in `elounda-guide.md`, `kalliopi.md`, and `leonidas.md`.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 30 pages.
  - Browser check confirmed the new route renders with the new title and the timeline appears beside the article on desktop.
  - Mobile browser check at 390 px confirmed the timeline, article text, and images render without page-breaking overflow; only a small pre-existing header width measurement was detected.
- Known dirty or local files to leave alone unless explicitly requested:
  - `.ai/memory/conventions.md`
  - `.ai/memory/conventions.md.tmp.4907.1775928805346`
  - `.agent/`
  - `.claude/`
  - `.codex/`
  - `CLAUDE.md`
  - `package-lock.json`
  - `docs/commit-plan/**`
  - `docs/integrations/webhotelier/**`
  - `docs/research/elounda/**/*.html`
- Next useful action:
  - If committing, stage only the intended product/content files and keep local workflow/private files excluded.
- Blockers:
  - None.

### 2026-05-22 - Elounda hotel development timeline article

- Goal: add a factual, restrained article on the key phases in Elounda hotel development.
- Files changed:
  - `src/components/blog/EloundaHotelTimeline.astro`
  - `src/content/blog/key-phases-in-elounda-hotel-development.md`
  - `src/pages/blog/[...slug].astro`
  - `src/pages/blog/index.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Used the user's local HTML research files under `docs/research/elounda/**` as context without editing them.
  - Added a new Location Guide article covering central Elounda, Plaka/Spinalonga-facing resorts, international brand affiliations, asset repositioning, and mixed-use development.
  - Added a left-side, anchor-linked vertical timeline for the Elounda hotel development article using an Astro component.
  - Rounded blog-post body images, enlarged the first-letter treatment on the first article paragraph, and matched the photo-gallery hover effect with a slow image scale and subtle overlay.
  - Added the same subtle blog-card image reveal effect used by the location map cards, using each blog post's `image` metadata.
  - Avoided promotional framing and kept unsupported claims out of the article.
- Verified:
  - `python scripts/audit_blog_metadata.py` passed.
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/audit_brand_language.py` did not flag the new hotel development article after source-label cleanup; remaining matches are existing items in `elounda-guide.md`, `kalliopi.md`, and `leonidas.md`.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 30 pages.
  - Browser check confirmed the timeline appears beside the article on desktop and its links jump to the matching article headings.
  - Mobile browser check at 390 px confirmed the timeline, article text, and images render without page-breaking overflow; only a small pre-existing header width measurement was detected.
- Remaining:
  - None for the hotel development article pass.
- Blockers:
  - None.

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

### 2026-05-22 - WebHotelier CSS fast theme

- Goal: provide a paste-ready WebHotelier custom CSS theme that resembles the main site without affecting booking functionality.
- Files changed:
  - `docs/integrations/webhotelier/webhotelier/traditional-homes-webhotelier-theme.css`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Replaced the older expanded WebHotelier stylesheet with a variable-based fast theme using the site stone, rust, sage, blue, border, and typography language.
  - Kept selectors limited to visible styling for page, header, panels, form fields, buttons, labels, rates, tables, and mobile layout.
- Verified:
  - Brace-balance check passed.
  - Checked for `display: none`, `visibility: hidden`, `pointer-events: none`, and `opacity: 0`; none found.
- Remaining:
  - Paste into WebHotelier and visually confirm against the live booking markup.
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
