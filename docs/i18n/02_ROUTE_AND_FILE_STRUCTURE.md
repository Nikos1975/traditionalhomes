# Route And File Structure

This document records the proposed future i18n structure. It is a plan, not a statement that these files or routes already exist.

## Implemented Route Map (Stage 3)

Public URLs are derived from stable internal identifiers, never assumed to be
the same string in every language. `src/i18n/route-map.ts` is the single source
of truth.

```ts
routeMap = {
  guide: {
    segments: { en: ['guide'], de: ['reisefuehrer'] },
    dynamic: true,
    content: {
      vrouchas: { en: 'vrouchas', de: 'vrouchas' },
      mavrikiano: { en: 'mavrikiano' },
    },
  },
}
```

Two independent layers may be localized:

1. **Route segments** — the generic part of the path (`houses`, `location`,
   `guide`). A locale that owns a route declares its own segments.
2. **Content slugs** — the public slug for an internal content id. Place and
   property names normally keep their internal slug in every locale
   (`argyro`, `vrouchas`, `mavrikiano`); editorial article slugs may differ.

Resolution rules:

- Default locale: any content id is routable; its public slug is the declared
  value, or the internal id when nothing is declared.
- Every other locale: content is routable only when the map names a slug for it.
  Nothing is inferred and nothing is machine-translated.
- `resolveRoute` returns `null` rather than a guessed URL; `routePath` and
  `assertRoute` throw, so the build fails instead of emitting a locale route
  that does not exist.
- `routeAlternates` returns alternates only for locales that really render the
  route, and adds `x-default` only when a translation exists.
- `matchDefaultLocalePath` / `resolveAuthoredHref` resolve navigation and footer
  links that are still authored as English paths through the same map, so a
  locale that owns a translated route gets its own URL and everything else keeps
  the English URL tagged with `hreflang`.

Worked example of the target shape:

```text
internal id          EN                              DE
guide/vrouchas       /en/guide/vrouchas/             /de/reisefuehrer/vrouchas/
house/argyro         /en/houses/argyro/              /de/ferienhaeuser/argyro/
location             /en/location/                   /de/lage/
blogArticle/
  elounda-beaches    /en/blog/elounda-beaches/       /de/blog/straende-in-elounda/
```

The first three rows exist today, for every house and for the villa. The
`blogArticle` row is still covered by unit tests against a fixture map, so a
locale-specific editorial slug is proven without creating a German blog URL.

`src/i18n/routes.ts` remains the low-level path primitive plus thin,
route-map-backed helpers. It never decides which routes exist.

## Proposed Locale Helper Structure

```text
src/i18n/
  config.ts
  routes.ts
  translate.ts
  seo.ts
  locales/
    en/
      common.json
      navigation.json
      forms.json
      seo.json
      properties.json
      home.json
      location.json
      faq.json
      policies.json
    de/
    fr/
    ru/
    zh/
    ar/
    he/
```

Responsibilities:

- `config.ts`: supported locales, default locale, locale labels, and text direction.
- `routes.ts`: locale-aware route builders and stable slug helpers.
- `translate.ts`: translation lookup and fallback helpers.
- `seo.ts`: locale-aware SEO, canonical, and hreflang helpers.
- `locales/*/*.json`: short interface strings and SEO templates.

## Proposed Content Collection Structure

```text
src/content/
  houses/
    en/
    de/
    fr/
    ru/
    zh/
    ar/
    he/
  villa/
    en/
    de/
    fr/
    ru/
    zh/
    ar/
    he/
  guides/
    en/
    de/
    fr/
    ru/
    zh/
    ar/
    he/
  blog/
    en/
    de/
    fr/
    ru/
    zh/
    ar/
    he/
```

Long-form content should move into locale-specific content folders only after the English foundation and shared rendering approach are stable.

## Proposed Shared Page Components

Route files should later become thin wrappers. Shared page rendering should move into page-level components such as:

```text
src/components/pages/
  HomePage.astro
  CollectionPage.astro
  HouseDetailPage.astro
  VillaDetailPage.astro
  LocationPage.astro
  ContactPage.astro
  FaqPage.astro
  PoliciesPage.astro
  BlogIndexPage.astro
  BlogArticlePage.astro
```

## Route File Principles

- Route files should load locale, route params, and content.
- Route files should pass data into shared page components.
- Route files should avoid duplicating page markup per locale.
- Shared components should receive resolved strings and content rather than reading route state implicitly where possible.
- Internal links should be built through locale-aware route helpers.

## Future Translated-Route Contract

- English remains under `/en/`, and every current English URL is frozen.
- Public path segments and public content slugs are locale-specific by design. Do not assume one slug across locales.
- Internal content and route identifiers are stable and locale-independent, and never appear in a URL directly.
- A translated route must pass its locale explicitly to shared page renderers and reusable components; components must not infer locale from route state.
- Locale resources contain reusable interface copy and SEO templates, not inventory facts, property names, slugs, identifiers, coordinates, or operational data.
- `/en/blog/` is the canonical English-only blog route; `/blog/**` is redirect-only.
- Adding translated routes, hreflang output, a language selector, or sitemap locale expansion requires a separate approved stage.
- `GuidePage.astro` is implemented as of Stage 3 and was the first shared page renderer. `src/pages/en/guide/vrouchas.astro` and `src/pages/de/reisefuehrer/vrouchas.astro` are thin wrappers over it.
- `HomePage.astro`, `CollectionPage.astro`, `LocationPage.astro`, `HouseDetailPage.astro`, `VillaDetailPage.astro`, `AboutPage.astro`, `ContactPage.astro`, `FaqPage.astro` and `PoliciesPage.astro` are implemented. Every English and German route file for those pages is a thin wrapper that passes `locale` explicitly.
- `BlogIndexPage.astro` and `BlogArticlePage.astro` are still proposals: the blog is deliberately English-only, so no locale needs a shared blog renderer yet.

## Blog Migration Note

The blog is canonically under `/en/blog/`. Do not add translated blog routes without a separately approved stage.

Before migrating blog routes, prepare:

- redirect rules from legacy unprefixed blog URLs
- canonical URL rules
- sitemap expectations
- checks for existing published and hidden/noindex articles
