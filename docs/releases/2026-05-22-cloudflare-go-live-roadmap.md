# Cloudflare Go-Live Roadmap - 2026-05-22

## Purpose

This roadmap is the final pre-live checklist for the current `codex/property-content-ui-map-version` branch and draft PR:

`https://github.com/Nikos1975/traditionalhomes/pull/2`

The site should not be uploaded or promoted on Cloudflare until WebHotelier calendar coordination is checked and the final build/deploy checks pass.

## Current State

- The Astro site is static-first and builds to `dist/`.
- Cloudflare Pages build settings remain:
  - Framework preset: Astro
  - Build command: `npm run build`
  - Build output directory: `dist`
- The latest blog work adds the article `Key Phases in Elounda's Hotel Development`.
- The new article route is `/blog/key-phases-in-elounda-hotel-development/`.
- The old route `/blog/elounda-hotel-clusters-timeline/` is no longer generated.
- The homepage index was intentionally not changed.
- Phase 1 WebHotelier handoff is implemented on the site:
  - property and villa sidebars submit `checkin`, `nights`, `adults`, and `room`
  - the collection and homepage search submit `checkin`, `nights`, and `adults`
  - the public site does not call authenticated WebHotelier REST endpoints
  - header and footer booking links use the HTTPS WebHotelier URL

## Gate 1 - WebHotelier Calendar Coordination

This is the required step before final Cloudflare upload or go-live promotion.

### Goal

Confirm that live booking and calendar behavior is coordinated with WebHotelier before the public site is treated as ready.

### Booking Funnel Strategy

Use the Intelligent Handoff approach for the first live booking funnel.

The site remains a boutique, content-led Astro website. WebHotelier remains the transactional booking engine. The public site should not create reservations through the WebHotelier REST booking API.

#### Integration Method

- Use direct links to `https://traditionalhomes.reserve-online.net/`.
- Enhance those links with URL parameter injection when the visitor has selected dates, nights, guests, and a specific room.
- Avoid embedded iframes because they can behave poorly on mobile and may create security or trust issues.
- Avoid building a custom booking engine for this release because it adds unnecessary complexity and would require secure server-side handling.

Target handoff pattern:

```text
https://traditionalhomes.reserve-online.net/?checkin=[YYYY-MM-DD]&nights=[N]&adults=[A]&room=[ROOM_CODE]
```

Current room codes already exist in `src/inventory/inventory.json` inside each `availabilityUrl`.

#### Visitor Flow

1. Visitor reads a property, collection, or location page on `traditional-homes.gr`.
2. Visitor selects arrival date, nights, and guest count in a site-styled availability widget.
3. The `Check Availability` action builds a WebHotelier URL using those values.
4. Visitor lands on WebHotelier with the search context already applied.
5. WebHotelier handles availability results, reservation details, payment, confirmation, and transactional emails.

#### REST API Boundary

The added WebHotelier documentation confirms that REST availability and booking endpoints exist, but those endpoints require Basic HTTP Authentication.

Because this is a static Astro site, do not call authenticated WebHotelier REST endpoints directly from browser JavaScript. API credentials must not be shipped to the client.

For this release:

- do not use `/bookings/{propertyCode}` from the public site
- do not create, cancel, purge, or retrieve bookings from the public site
- do not expose WebHotelier API credentials in Astro, JavaScript, Cloudflare Pages public variables, or static JSON

If live on-site availability is needed later, implement it as a separate phase using a secure server-side layer such as a Cloudflare Worker.

#### Fallback Strategy

For the first release, fallback availability should be handled primarily by WebHotelier after the handoff.

- If a specific room is unavailable, WebHotelier should show available alternatives within the Traditional Homes account or group, if configured there.
- Site copy must not promise that a suggested pairing is available unless WebHotelier confirms it.
- Suggested pairings remain recommendation-only.
- Official groups and suggested pairings remain separate.

The requested collection-page behavior, where date filtering on the site shows another available house such as House Leonidas when House Argyro is booked, requires live availability data. That should not be implemented with client-side REST calls because of API authentication. Treat it as a later Worker-backed phase unless WebHotelier provides a safe public widget or unauthenticated availability feed.

#### Analytics

Use GA4 cross-domain tracking for the handoff.

Required GA4 setup:

- In the GA4 data stream for `traditional-homes.gr`, add `reserve-online.net` to Configure your domains.
- Confirm that outbound WebHotelier links receive the `_gl` linker parameter.
- Confirm that the session source is preserved after handoff.

Recommended event model:

- `view_item`: property page load
- `select_item`: `Check Availability` click
- `begin_checkout`: WebHotelier booking form start
- `purchase`: WebHotelier thank-you page

The `begin_checkout` and `purchase` events require WebHotelier to support the same GA4/GTM measurement setup on their hosted booking pages. Confirm this with WebHotelier before relying on those events in reports.

### Checks

- Confirm which booking/calendar path is intended for each public property page:
  - direct booking link
  - WebHotelier calendar link
  - WebHotelier availability flow
  - no live calendar, if a property should remain inquiry-led
- Confirm that every property shown on the site maps cleanly to the correct WebHotelier property, room, unit, or offer identifier.
- Confirm that official groups and suggested pairings remain separate:
  - official groups may have booking/calendar handling if supported
  - suggested pairings must remain recommendation-only and must not be treated as filterable inventory
- Confirm that calendar availability cannot imply unsupported inventory:
  - shared pool notes stay accurate
  - stairs, parking, and access constraints remain visible before booking
  - maximum occupancy matches `src/inventory/inventory.json`
- Confirm the preferred user journey:
  - property page to availability
  - contact page to inquiry
  - group stay pages to inquiry or supported availability flow
- Confirm whether WebHotelier should open in the same tab or a new tab.
- Confirm exact WebHotelier direct-link parameter names for `checkin`, `nights`, `adults`, and `room`.
- Confirm whether child guests, children ages, or multi-room selections need launch support.
- Confirm that each `room` code in `src/inventory/inventory.json` matches the WebHotelier account.
- Confirm that WebHotelier alternatives are configured for unavailable room searches.
- Confirm GA4 cross-domain settings and whether WebHotelier can load the required GA4/GTM container.
- Confirm whether any Cloudflare-side redirect, header, or environment setting is needed for the WebHotelier flow.

### Output

Record the final decision before deployment:

- confirmed calendar approach
- confirmed direct-link parameter contract
- confirmed analytics ownership between site and WebHotelier
- affected property pages
- any unsupported or deferred properties
- any required code/content changes
- any owner decisions still pending

If code or content changes are needed, complete them before moving to Gate 2.

## Gate 2 - Final Scope Freeze

Before committing or deploying, confirm the intended release scope.

### Include

Expected current blog/product files:

- `src/content/blog/key-phases-in-elounda-hotel-development.md`
- `src/components/blog/EloundaHotelTimeline.astro`
- `src/pages/blog/[...slug].astro`
- `src/pages/blog/index.astro`
- `docs/agent-handoff-notes.md`
- this roadmap file, if the roadmap should be versioned

### Exclude Unless Explicitly Requested

- `.agent/`
- `.ai/`
- `.claude/`
- `.codex/`
- `CLAUDE.md`
- `package-lock.json`
- `docs/commit-plan/**`
- `docs/integrations/webhotelier/**`
- `docs/research/elounda/**/*.html`
- `dist_old_*`
- cache or temporary build artifacts

## Gate 3 - Fresh Verification

Run these commands from the project root, one at a time:

```powershell
python scripts/audit_blog_metadata.py
python scripts/audit_public_markdown.py
python scripts/audit_brand_language.py
npm run typecheck
npm run build
```

Expected results:

- Blog metadata audit passes.
- No markdown files are found under `src/pages/`.
- Brand language audit reports only known unrelated existing matches, unless new changes introduced fresh findings.
- Typecheck passes with no errors.
- Build passes and generates the expected static routes.

If `npm run build` fails with a Windows `.astro` or cache `EPERM` lock, classify it as an environment/cache issue and retry once before changing code.

## Gate 4 - Local Route Smoke Test

Check the built or previewed site locally:

- `/blog/`
- `/blog/key-phases-in-elounda-hotel-development/`
- `/en/houses/`
- one representative house page
- `/en/villa/almond-tree-villa/`
- `/en/location/`
- `/en/contact/`

Specific checks:

- new blog article renders with the correct title
- article timeline is usable on desktop
- mobile article layout has no page-breaking overflow
- article images render
- blog index cards still use image hover reveal
- old `/blog/elounda-hotel-clusters-timeline/` route is not generated
- booking/calendar links follow the WebHotelier decision from Gate 1

## Gate 5 - Clean Commit And PR Update

Do not use `git add .`.

Stage only reviewed paths:

```powershell
git add src/content/blog/key-phases-in-elounda-hotel-development.md `
  src/components/blog/EloundaHotelTimeline.astro `
  src/pages/blog/[...slug].astro `
  src/pages/blog/index.astro `
  docs/agent-handoff-notes.md `
  docs/releases/2026-05-22-cloudflare-go-live-roadmap.md
```

Then inspect:

```powershell
git diff --cached --stat
git diff --cached --check
```

Commit only after the staged diff is clean and limited to the intended release scope.

Suggested commit message:

```text
Add Elounda hotel development article
```

Push the branch:

```powershell
git push origin codex/property-content-ui-map-version
```

Review draft PR #2 after push and confirm no excluded local files entered the diff.

## Gate 6 - Cloudflare Preview

Use the Cloudflare Pages preview generated from the branch or PR.

Check:

- build status
- build command and output directory
- route availability
- images and CSS
- redirects and headers
- WebHotelier calendar or booking flow
- mobile header and article pages

Do not promote the deployment if WebHotelier links, availability, or property mapping are uncertain.

## Gate 7 - Go Live

Proceed only when:

- WebHotelier calendar coordination is confirmed
- final local verification passes
- PR diff is clean
- Cloudflare preview passes smoke testing
- owner has confirmed any remaining booking/calendar decisions

After go-live:

- check the production domain
- verify the same smoke-test routes
- test one booking/calendar path from a real property page
- check Cloudflare Pages deployment logs for warnings
- record the deployed commit and any post-live notes in `docs/agent-handoff-notes.md`

## Current Blocker

The remaining pre-live blocker is WebHotelier calendar coordination. Cloudflare upload or promotion should wait until the direct-link parameter contract, room-code mapping, alternative-property behavior, and analytics ownership are confirmed.
