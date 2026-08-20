# Translation Status

This file records the current multilingual scope and reference implementation. It is intentionally concise so routine translation stages do not load historical detail they do not need.

`src/i18n/route-map.ts` remains the live authority for routes on the current branch.

## Status values

- `Source present` — approved English source exists.
- `Not started` — no approved translation work exists.
- `Partial` — only part of the scope is localized.
- `Localized` — substantive target-language content exists for the declared route/scope.
- `Ready for QA` — implementation is complete enough for the current review gate.
- `Approved` — owner/review process has explicitly approved the scope.

## Localization contract

English is the verified factual master. A localized page must preserve the same facts, qualifications, cautions and degree of certainty as the English source.

Target-language work may localize:

- wording and sentence structure;
- headings;
- reusable UI labels;
- title/meta/H1;
- generic public route segments;
- editorial slugs where approved;
- presentation of descriptive structured values;
- gallery alt/caption text.

It must not silently add, remove or correct facts in only one locale.

If a factual issue is discovered, use `docs/i18n/cross-language-corrections.md` and stop the locale-only correction.

## Facts and presentation are separate

Factual ownership remains outside translation resources:

- `src/inventory/inventory.json` — property facts;
- `src/data/locations.ts` — location facts;
- `src/inventory/groups.json` — group facts;
- `src/inventory/suggested-pairings.json` — pairing facts.

Localized presentation may use stable ids/slugs, semantic keys or an exact English source phrase to render those facts naturally. It must not create a second German (or other locale) inventory.

The German visible-language completion in PR #59 demonstrates this separation and adds deterministic tests binding presentation mappings back to factual sources.

## German reference implementation

PR #59 validates the current reference architecture on five German routes:

| Internal route/content id | English | German | Status |
| --- | --- | --- | --- |
| `home` | `/en/` | `/de/` | Localized / Ready for QA |
| `houses` | `/en/houses/` | `/de/ferienhaeuser/` | Localized / Ready for QA |
| `house/argyro` | `/en/houses/argyro/` | `/de/ferienhaeuser/argyro/` | Localized / Ready for QA |
| `location` | `/en/location/` | `/de/lage/` | Localized / Ready for QA |
| `guide/vrouchas` | `/en/guide/vrouchas/` | `/de/reisefuehrer/vrouchas/` | Localized / Ready for QA |

Reference shared renderers:

- `HomePage.astro`
- `CollectionPage.astro`
- `HouseDetailPage.astro`
- `LocationPage.astro`
- `GuidePage.astro`

The Vrouchas German guide is a complete faithful localization of the English master, not an excerpt. Argyro is the reference house; the remaining houses do not acquire German routes merely because the collection page is German.

## Visible-language completeness

A declared localized route must be checked at generated-HTML level, not only by inspecting locale dictionaries.

The German reference suite checks:

1. visible EN↔DE parity to catch untranslated strings;
2. target-language rendering of inventory-derived descriptions and map cards;
3. localized gallery captions;
4. preservation of English master wording;
5. presentation mappings remaining bound to real factual source values.

Legitimate shared strings include proper names, brands, airport codes, URLs, machine-facing identifiers and intentional links to English-only routes.

Do not use a blanket "English word" rejection rule.

## Current broader status

| Area | DE | FR | RU | ZH | AR | HE | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Homepage | Localized | Not started | Not started | Not started | Not started | Not started | German reference route only. |
| Houses collection | Localized | Not started | Not started | Not started | Not started | Not started | German collection exists. |
| House detail pages | Partial | Not started | Not started | Not started | Not started | Not started | Argyro only. |
| Villa | Not started | Not started | Not started | Not started | Not started | Not started | No German villa route declared. |
| Location | Localized | Not started | Not started | Not started | Not started | Not started | `/de/lage/`. |
| Vrouchas guide | Localized | Not started | Not started | Not started | Not started | Not started | Full German guide. |
| Mavrikiano guide | Not started | Not started | Not started | Not started | Not started | Not started | No German route. |
| Contact | Not started | Not started | Not started | Not started | Not started | Not started | `/api/contact` behavior remains unchanged. |
| FAQ | Not started | Not started | Not started | Not started | Not started | Not started | — |
| Policies | Not started | Not started | Not started | Not started | Not started | Not started | — |
| About | Not started | Not started | Not started | Not started | Not started | Not started | — |
| Blog index/posts | Not started | Not started | Not started | Not started | Not started | Not started | English canonical remains `/en/blog/`. |

## Deferred

- remaining German houses;
- Almond Tree Villa;
- German Mavrikiano guide;
- contact/FAQ/policies/about;
- translated blog routes;
- language switcher;
- all FR/RU/ZH/AR/HE public routes;
- RTL launch QA.

Do not infer any deferred route from this list. The route map decides what exists.

## Reference validation snapshot

The German visible-language completion of PR #59 was validated on the workstation with:

- `node --test`: 344/344 passed;
- `npm run typecheck`: 3 existing errors, 0 warnings, 3 hints;
- `npm run build`: 41 pages;
- `npm run seo:links`: passed;
- `git diff --check`: passed;
- clean working tree.

Treat this as a historical reference baseline only. Every new stage must compare against its own current branch state rather than assuming these numbers remain valid.
