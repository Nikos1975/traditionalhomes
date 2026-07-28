# Translation Status

Status values:

- `Source present`: current English source exists on the live English-first site.
- `Partially extracted`: some shared English UI strings have been moved into locale JSON, while page/body copy remains in source files or content files.
- `Extracted`: English source for this shared area is now in locale JSON.
- `Not started`: no approved translation work has started.
- `Pending`: work is planned but not complete.
- `Ready for QA`: translation is complete and awaiting checks.
- `Approved`: translation has passed QA.

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
| Vrouchas guide | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Area guides follow the blog editorial system. |
| Blog index | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | English-only canonical route is `/en/blog/`; legacy `/blog/` redirects permanently. |
| Blog posts | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | English-only canonical article routes are `/en/blog/<slug>/`; no translated routes exist. |
| Header/Footer | Extracted | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Shared Header/Footer English labels and links are in `navigation.json` and `common.json`. |
| Booking/contact UI | Partially extracted | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Shared booking handoff labels are in `forms.json`; contact page form/body copy remains hardcoded and contact endpoint behavior must not change. |
| SEO/meta | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | SEO strings remain split between page files, `siteCopy.json`, and `seo.json`; canonical, hreflang, and sitemap require QA. |
| Gallery alt/captions | Source present | Not started | Not started | Not started | Not started | Not started | Not started | Not started | Image paths stay shared; text may localize later. |
