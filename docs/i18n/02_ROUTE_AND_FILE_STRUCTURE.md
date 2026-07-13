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
  villa/
    en/
    de/
    fr/
    ru/
    zh/
    ar/
  guides/
    en/
    de/
    fr/
    ru/
    zh/
    ar/
  blog/
    en/
    de/
    fr/
    ru/
    zh/
    ar/
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

## Blog Migration Note

The blog currently lives under `/blog/` without a locale prefix. Do not move it casually.

Before migrating blog routes, prepare:

- redirect rules from current unprefixed blog URLs
- canonical URL rules
- hreflang rules
- sitemap expectations
- checks for existing published and hidden/noindex articles
