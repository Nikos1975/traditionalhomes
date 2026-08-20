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

German is **not** translated sitewide. As of Stage 3 German owns exactly one
public route, listed below. Every other German string resolves to the English
source through the documented partial-overlay fallback in
`src/i18n/translate.ts`.

| Area | EN source frozen | DE | FR | RU | ZH | AR | HE | QA status | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Homepage | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Current source at `/en/`; long-form homepage copy remains in the page file. |
| Houses index | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Current source at `/en/houses/`; filter/card labels remain in source components. |
| House detail pages | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Stable slugs should be preserved. |
| Villa page | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Stable slug should be preserved. |
| Location page | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Map/sidebar layout needs locale QA. |
| Contact page | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Contact form must keep posting to `/api/contact`. |
| FAQ page | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Long bodies may need content collection handling. |
| Policies page | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Long bodies may need content collection handling. |
| About page | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Keep factual claims conservative. |
| Mavrikiano guide | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Area guides follow the blog editorial system. |
| Vrouchas guide | Source present | Pilot | Not started | Not started | Not started | Not started | Not started | Ready for QA | German pilot at `/de/reisefuehrer/vrouchas/`; bounded German extract only (access note + distance table + pointer to the English guide). Long-form sections remain English. |
| Blog index | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | English-only canonical route is `/en/blog/`; legacy `/blog/` redirects permanently. |
| Blog posts | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | English-only canonical article routes are `/en/blog/<slug>/`; no translated routes exist. |
| Header/Footer | Extracted | Pilot | Not started | Not started | Not started | Not started | Not started | Ready for QA | German labels exist in the `de` overlay for the chrome the pilot renders. Hrefs still resolve through the route map, so untranslated sections keep their English URL and carry `hreflang="en"`. |
| Booking/contact UI | Partially extracted | Pilot | Not started | Not started | Not started | Not started | Not started | Ready for QA | German labels cover only the mobile booking bar and chat trigger rendered on the pilot page. `defaultItemName` (analytics) and `chatPopupEmail` deliberately stay English. Contact page copy and `/api/contact` are untouched. |
| SEO/meta | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | SEO strings remain split between page files, `siteCopy.json`, and `seo.json`; canonical, hreflang, and sitemap require QA. |
| Gallery alt/captions | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Image paths stay shared; text may localize later. |

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
