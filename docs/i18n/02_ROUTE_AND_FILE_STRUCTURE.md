# Route And File Structure

This document records the proposed future i18n structure. It is a plan, not a statement that these files or routes already exist.

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

- English remains under `/en/`.
- A future translated route must pass its locale explicitly to shared page renderers and reusable components; components must not infer locale from route state.
- Locale resources contain reusable interface copy and SEO templates, not inventory facts, property names, slugs, identifiers, coordinates, or operational data.
- `/en/blog/` is the canonical English-only blog route; `/blog/**` is redirect-only.
- Adding translated routes, hreflang output, a language selector, or sitemap locale expansion requires a separate approved stage.
- `GuidePage.astro` is the proposed first shared page-renderer pilot; it is not implemented by the current extraction work.

## Blog Migration Note

The blog is canonically under `/en/blog/`. Do not add translated blog routes without a separately approved stage.

Before migrating blog routes, prepare:

- redirect rules from legacy unprefixed blog URLs
- canonical URL rules
- sitemap expectations
- checks for existing published and hidden/noindex articles
