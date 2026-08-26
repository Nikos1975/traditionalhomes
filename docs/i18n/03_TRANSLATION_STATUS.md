# Translation Status

Status values:

- `Source present`: current English source exists on the live English-first site.
- `Partially extracted`: some shared English UI strings have been moved into locale JSON, while page/body copy remains in source files or content files.
- `Extracted`: English source for this shared area is now in locale JSON.
- `Not started`: no approved translation work has started.
- `Pending`: work is planned but not complete.
- `Ready for QA`: translation is complete and awaiting checks.
- `Approved`: translation has passed QA.
- `Pilot`: a single route is implemented to prove the shared rendering and locale-routing architecture. It is not a sitewide translation and must not be read as one.
- `Localized`: the route is a complete, faithful localization of the English master and is the pattern later locales should follow.

## Localization contract

English is the verified factual master. A translated page carries **the same
facts as its English counterpart** — same dates, distances, descriptions,
historical statements, practical and visitor information, and the same degree of
certainty. Translators localize wording, headings, SEO metadata and route
segments; they do not reconcile, correct, qualify or drop factual claims in one
language only.

If an English claim looks wrong or outdated, it is raised as a proposed
**cross-language correction** and applied to English and every locale together
once approved. Until then the locales stay factually aligned. Open proposals are
listed at the end of this document.

German is **not** translated sitewide. German owns the fifteen public routes
listed in "German cluster" below: the four cluster routes, all ten house detail
pages and the villa detail page. Every other German string resolves to the
English source through the documented partial-overlay fallback in
`src/i18n/translate.ts`, and every link to a page German does not own carries an
explicit `hreflang="en"`.

### Facts and presentation are separate

A locale never restates a fact. `src/inventory/inventory.json`,
`src/data/locations.ts`, `src/inventory/groups.json` and
`src/inventory/suggested-pairings.json` own every number, enum, slug,
coordinate and boolean. `src/i18n/inventory-display.ts` owns only how one locale
*renders* a descriptive value the factual source stores in English, keyed by a
stable identifier — a unit slug, a location id, or the exact English source
string when the factual source repeats one line across many ids. The default
locale always renders the factual value verbatim, so English can never drift,
and an unmapped value falls back to it. There is no second German inventory.

Display strings a component *derives* from stable facts (a layout summary, an
access summary, a region name) live in locale resources keyed by a stable
semantic key, never by their English text. `tests/i18n-german-visible-language.test.mjs`
asserts that every number in a German mapping also appears in the English source
it presents, that mapped slugs and ids really exist, and that a list mapping
keeps the length of the factual list.

| Area | EN source frozen | DE | FR | RU | ZH | AR | HE | QA status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Homepage | Source present | Localized | Not started | Not started | Not started | Not started | Not started | Ready for QA | `/de/` renders the shared `HomePage.astro`; copy in `home.json`. |
| Houses index | Source present | Localized | Not started | Not started | Not started | Not started | Not started | Ready for QA | `/de/ferienhaeuser/` renders the shared `CollectionPage.astro`; copy in `properties.json`. Filtering logic is shared, not forked. |
| House detail pages | Source present | Localized | Not started | Not started | Not started | Not started | Not started | Ready for QA | All ten houses at `/de/ferienhaeuser/<slug>/`, generated from the shared `HouseDetailPage.astro`. Slugs are stable across locales. |
| Villa page | Source present | Localized | Not started | Not started | Not started | Not started | Not started | Ready for QA | `/de/villa/almond-tree-villa/` renders the shared `VillaDetailPage.astro`. `villa` is the German generic noun as well, so the segment is declared per locale, not inferred; the property's proper name keeps its stable slug. |
| Location page | Source present | Localized | Not started | Not started | Not started | Not started | Not started | Ready for QA | `/de/lage/` renders the shared `LocationPage.astro`; copy in `location.json`. |
| Contact page | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Contact form must keep posting to `/api/contact`. |
| FAQ page | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Long bodies may need content collection handling. |
| Policies page | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Long bodies may need content collection handling. |
| About page | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Keep factual claims conservative. |
| Mavrikiano guide | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Area guides follow the blog editorial system. |
| Vrouchas guide | Source present | Localized | Not started | Not started | Not started | Not started | Not started | Ready for QA | Complete faithful localization at `/de/reisefuehrer/vrouchas/`: all seven sections and three subsections of the English master, same facts. |
| Blog index | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | English-only canonical route is `/en/blog/`; legacy `/blog/` redirects permanently. |
| Blog posts | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | English-only canonical article routes are `/en/blog/<slug>/`; no translated routes exist. |
| Header/Footer | Extracted | Pilot | Not started | Not started | Not started | Not started | Not started | Ready for QA | German labels exist in the `de` overlay for the chrome the pilot renders. Hrefs still resolve through the route map, so untranslated sections keep their English URL and carry `hreflang="en"`. |
| Booking/contact UI | Partially extracted | Pilot | Not started | Not started | Not started | Not started | Not started | Ready for QA | German labels cover only the mobile booking bar and chat trigger rendered on the pilot page. `defaultItemName` (analytics) and `chatPopupEmail` deliberately stay English. Contact page copy and `/api/contact` are untouched. |
| SEO/meta | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | SEO strings remain split between page files, `siteCopy.json`, and `seo.json`; canonical, hreflang, and sitemap require QA. |
| Gallery alt/captions | Source present | Localized | Not started | Not started | Not started | Not started | Not started | Ready for QA | An authored alt is the English master and renders verbatim in English. Other locales render the same picture through the shared vocabulary in `src/i18n/locales/<locale>/gallery-tokens.json` via `localizedAlt`. |

## Stage 3 pilot scope

| Item | Value |
|---|---|
| Internal route id | `guide` |
| Internal content id | `vrouchas` |
| English URL | `/en/guide/vrouchas/` (unchanged) |
| German URL | `/de/reisefuehrer/vrouchas/` |
| Shared renderer | `src/components/pages/GuidePage.astro` |
| German content | `src/guides/de/Vrouchas-Guide.md` |
| German locale overlays | `common.json`, `navigation.json`, `forms.json`, `guide.json` (all partial) |

Not implemented in this stage: any other German route, a language switcher,
German SEO templates, translated blog or property routes, and RTL routes for
`ar` / `he`. `src/inventory/inventory.json` remains the factual source of truth
and no inventory value was copied into a locale file.

## German Vrouchas guide

| Item | Value |
|---|---|
| Internal route id | `guide` |
| Internal content id | `vrouchas` |
| English URL | `/en/guide/vrouchas/` (unchanged) |
| German URL | `/de/reisefuehrer/vrouchas/` |
| German title | Vrouchas auf Kreta: Lage, Anreise & Tipps |
| German H1 | Vrouchas auf Kreta: Lage, Anreise und praktische Informationen |
| German content | `src/guides/de/Vrouchas-Guide.md` |
| German locale overlays | `common.json`, `navigation.json`, `forms.json`, `guide.json` (all partial) |

Section parity with `src/guides/Vrouchas-Guide.md`, asserted by test:

| English section | German section |
|---|---|
| Distances from Almond Tree Villa, Vrouchas | Entfernungen ab der Almond Tree Villa, Vrouchas |
| Beaches of the Area | Strände in der Umgebung |
| Historical Sites & Landmarks | Historische Stätten und Sehenswürdigkeiten |
| Transport & Practical Information | Verkehr und praktische Hinweise |
| Recommended Day-Trip Itinerary: The Mirabello Circuit | Vorschlag für einen Tagesausflug: die Mirabello-Runde |
| Essential Packing List | Packliste |
| Spinalonga Visitor Information (2026 Season) | Besucherinformationen zu Spinalonga (Saison 2026) |
| — Operating Hours | — Öffnungszeiten |
| — Site Entrance Tickets | — Eintrittskarten |
| — Boat Transfers from Plaka | — Bootstransfer ab Plaka |

The only editorial deviation is the middle table column header, rendered as
"Beschreibung" rather than a literal translation of "National Geographic Style
Description". That header is an internal authoring label, not a fact; every
description in the column is localized in full.

Not implemented: any other German route, a language switcher, German SEO
templates, translated blog or property routes, RTL routes for `ar` / `he`.
`src/inventory/inventory.json` remains the factual source of truth and no
inventory value was copied into a locale file.

## Proposed cross-language corrections — NOT applied

Raised for review only. English and German currently state all of these
identically, and they must stay aligned until a correction is approved and
applied to every locale at once.

| Claim (English master, mirrored in German) | Concern | Repository evidence |
|---|---|---|
| Spinalonga "leper colony (1903–1957)" | The colony start year may be 1904 | `docs/research/blog/spinalonga-multiple-lives/contradiction-register.md`: "The first residents arrived in 1904"; the day and count are blocked, the year is secure |
| Spinalonga fortress "built 1579" | Works *began* June 1579; construction was not completed that year | `claim-verification-register.md`, S01, status Verified |
| Olous as "an ancient Minoan metropolis" / "Minoan-era foundations" | Published repository content never describes Olous as Minoan | `src/content/blog/elounda-and-mirabello-bay.md` |
| Elounda Canal "built by French military engineers in 1897–98" | The published article explicitly declines to assign a construction date or responsible authority; the French attribution survives only in the unpublished `elounda-guide-style-*` drafts | `src/content/blog/elounda-and-mirabello-bay.md` |
| Elounda Salt Pans "Venetian-era" | The Ephorate of Antiquities of Lasithi records possible Byzantine origin, with Venetian use from the early period of their rule | `src/content/blog/elounda-salt-pans-and-poros-windmills.md` |
| Salt pans "a notable and serene spot for birdwatching" | Not present in any verified repository content | — |
| Gournia "the only fully excavated Minoan city in Crete" | Not present in any verified repository content | — |
| Paleochristian Basilica of Poros mosaics | Not present in any verified repository content | — |
| Spinalonga admission €20 / €10, free under 25 (EU) | Two official sources currently disagree: the [Ephorate of Antiquities of Lasithi](https://spinalonga-island.gr/infos/?lang=en) publishes €20/€10, while the [Ministry of Culture Odysseus page](http://odysseus.culture.gr/h/3/eh355.jsp?obj_id=2607) publishes €8/€4. The Ephorate states reduced admission for EU citizens over 65 from 1 October to 31 May, which does not match the under-25 free-admission wording | Both sources checked 2026-08-20 |
| Boat "€10 to €12 round trip, every 30 minutes" | Operator-specific and volatile; no official source consulted | — |
| "Limited service runs between Elounda and Agios Nikolaos" | Not checked against the current [KTEL Heraklion–Lasithi](https://www.ktelherlas.gr/en/timetables) timetable | — |
| Section titled "(2026 Season)" | Dated section title will need an annual review in both languages | — |

## German cluster (reference implementation)

| Internal route id | Content id | English URL | German URL |
|---|---|---|---|
| `home` | — | `/en/` | `/de/` |
| `houses` | — | `/en/houses/` | `/de/ferienhaeuser/` |
| `house` | `argyro` | `/en/houses/argyro/` | `/de/ferienhaeuser/argyro/` |
| `house` | `leonidas` | `/en/houses/leonidas/` | `/de/ferienhaeuser/leonidas/` |
| `house` | `margarita` | `/en/houses/margarita/` | `/de/ferienhaeuser/margarita/` |
| `house` | `demetra` | `/en/houses/demetra/` | `/de/ferienhaeuser/demetra/` |
| `house` | `penelope` | `/en/houses/penelope/` | `/de/ferienhaeuser/penelope/` |
| `house` | `erato` | `/en/houses/erato/` | `/de/ferienhaeuser/erato/` |
| `house` | `clio` | `/en/houses/clio/` | `/de/ferienhaeuser/clio/` |
| `house` | `efterpi` | `/en/houses/efterpi/` | `/de/ferienhaeuser/efterpi/` |
| `house` | `kalliopi` | `/en/houses/kalliopi/` | `/de/ferienhaeuser/kalliopi/` |
| `house` | `monastiri` | `/en/houses/monastiri/` | `/de/ferienhaeuser/monastiri/` |
| `villa` | `almond-tree-villa` | `/en/villa/almond-tree-villa/` | `/de/villa/almond-tree-villa/` |
| `location` | — | `/en/location/` | `/de/lage/` |
| `guide` | `vrouchas` | `/en/guide/vrouchas/` | `/de/reisefuehrer/vrouchas/` |

Shared renderers in `src/components/pages/`: `HomePage`, `CollectionPage`,
`LocationPage`, `HouseDetailPage`, `VillaDetailPage`, `GuidePage`. Every route
file is a thin wrapper that passes `locale` explicitly. There is no parallel
German implementation and no client-side translation runtime.

Locale resources added for German: `home.json`, `location.json`,
`properties.json`, `seo.json`, plus additions to `forms.json`. Long-form
property copy lives in `src/content/houses/de/`, not in a translation resource.
`src/inventory/inventory.json` remains the single factual source; the German
house page reads the same `sleeps`, `bedrooms`, `pool` and access values as the
English page, and only its display title comes from the German content entry.

### Visible-language completeness

All fifteen German routes are audited against their rendered HTML, not against
the translation payload. Two checks run in `tests/i18n-german-visible-language.test.mjs`:

1. **EN↔DE parity.** A visible string — text node, `aria-label`, `alt`, `title`
   or `placeholder` — that is identical on the German page and on its English
   counterpart is a suspected leak unless it matches an explicit allow-list of
   proper names, place names, brands, airport codes and bare numbers. This is
   never a blanket "reject every English word".
2. **English master preserved.** The same suite asserts that the English routes
   still render the English wording, so localizing a shared component cannot
   silently change English output.

Legitimately untranslated on a German page: proper and place names, brand names,
`WebHotelier` item identifiers such as `data-item-name`, airport codes, URLs, and
links to routes German does not own — those carry `hreflang="en"` by design.

Not yet German: contact, FAQ, policies, about, the Mavrikiano guide, and all
blog articles. Those links appear on German pages with their English URL and an
explicit `hreflang="en"`. The language selector's parent and homepage fallback
tiers remain in place for that content; no translated property relies on them
any more.

### Deferred: language switcher

Not implemented in this stage. The route map already answers "does an
equivalent page exist in locale X" through `routeLocales`, so a switcher is a
small component rather than an architectural change. It was deferred to keep
this stage to the four reference routes.
