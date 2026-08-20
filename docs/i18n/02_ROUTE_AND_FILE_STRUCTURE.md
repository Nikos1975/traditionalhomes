# Route and File Structure

This document records the durable multilingual route/rendering contract. `src/i18n/route-map.ts` is the live authority for which localized public routes actually exist on the current branch.

## Stable internal identity vs public URL

Public URLs are resolved from stable internal route/content identities. Do not assume that an internal id, English segment or English editorial slug must appear in every locale URL.

Two layers may localize independently:

1. **generic route segments** — for example `houses` → German `ferienhaeuser`, `location` → `lage`, `guide` → `reisefuehrer`;
2. **public content slugs** — property/place names commonly remain unchanged, while editorial article slugs may later localize.

Reference examples:

| Internal identity | EN | DE |
| --- | --- | --- |
| `home` | `/en/` | `/de/` |
| `houses` | `/en/houses/` | `/de/ferienhaeuser/` |
| `house/argyro` | `/en/houses/argyro/` | `/de/ferienhaeuser/argyro/` |
| `location` | `/en/location/` | `/de/lage/` |
| `guide/vrouchas` | `/en/guide/vrouchas/` | `/de/reisefuehrer/vrouchas/` |

## Route-map contract

`src/i18n/route-map.ts` decides route availability.

Required behavior:

- default-locale routes remain available under `/en/`;
- a non-default locale is routable only when explicitly declared;
- missing locale routes resolve to `null`/fail closed rather than being guessed;
- route helpers that require a real route should throw rather than emit a phantom URL;
- alternates are produced only for real equivalent routes;
- authored English links resolve to a same-locale equivalent when one exists;
- otherwise the real English URL is retained and marked as an English fallback.

`src/i18n/routes.ts` remains a low-level path primitive/helper layer. It does not decide which translated pages exist.

## Shared page rendering

The German reference implementation proves the shared-renderer pattern with:

```text
src/components/pages/
  HomePage.astro
  CollectionPage.astro
  LocationPage.astro
  HouseDetailPage.astro
  GuidePage.astro
```

Equivalent locale route files should be thin wrappers that:

1. select the locale;
2. resolve the internal route/content id;
3. load the required localized content;
4. pass `locale` and data explicitly into the shared renderer.

Reusable components should receive locale/data explicitly where practical. Do not infer locale from browser state when static build context already knows it.

Do not duplicate a complete German/French/etc page implementation when one shared renderer can serve the equivalent page.

## Locale helper structure

Current multilingual helpers live under:

```text
src/i18n/
  config.ts
  routes.ts
  route-map.ts
  translate.ts
  seo.ts
  locales/
    en/
    de/
    fr/
    ru/
    zh/
    ar/
    he/
```

Responsibilities:

- `config.ts` — supported locales, default locale, labels and direction;
- `route-map.ts` — route/content identity → real localized public path;
- `routes.ts` — low-level path helpers;
- `translate.ts` — locale overlay/fallback helpers;
- `seo.ts` — canonical, metadata and alternate helpers;
- `locales/<locale>/` — reusable presentation copy and SEO templates.

Do not create empty locale resources merely to imply completion.

## Long-form localized content

Use locale-specific content entries for substantive page bodies rather than large strings embedded in UI dictionaries.

Current reference patterns include:

```text
src/content/houses/de/argyro.md
src/guides/de/Vrouchas-Guide.md
```

A non-default-locale detail route should not build unless the corresponding substantive localized content is present.

Future content collections/localized folders should be added only when the route being implemented needs them. Do not scaffold all future languages in advance.

## Facts vs presentation

Structured factual data keeps one owner.

Examples:

- `src/inventory/inventory.json` — property facts;
- `src/data/locations.ts` — location facts;
- `src/inventory/groups.json` — group definitions;
- `src/inventory/suggested-pairings.json` — pairing facts.

Locale presentation may map descriptive values by stable slug/id/semantic key or exact English source string, but must not restate the factual dataset.

PR #59's visible-language completion proves this pattern with locale presentation mappings and localized gallery vocabulary while preserving the factual source files unchanged. Branches predating that commit may not yet contain every presentation helper; treat the architecture as the reference contract, not as permission to assume a file exists without checking.

## SEO and fallback structure

- Every real locale page is self-canonical.
- Equivalent EN/locale pages emit reciprocal hreflang only when both exist.
- `x-default` points to English for an alternate set.
- Unbuilt locales receive no hreflang, sitemap entry or fake route.
- German pages may link to English-only pages; those are intentional fallbacks and should carry `hreflang="en"` where supported.
- Keep one global sitemap entry point.
- Keep one global `/llms.txt`.
- Preserve `/en/blog/` as the canonical English blog and `/blog/**` as redirect-only until a separate translated-blog stage is approved.

## Scaling contract

The architecture is considered scalable only when the next localized page of an existing structural type mostly requires:

- route-map availability;
- localized long-form content when needed;
- locale presentation entries for genuinely new values;
- focused tests.

If the second property or equivalent page still requires a broad shared-renderer refactor, stop and treat that as an infrastructure deficiency before scaling further.

## Language switcher

A switcher is intentionally deferred. When implemented, it must derive available destinations from real route availability. It must not offer a locale destination that does not exist.
