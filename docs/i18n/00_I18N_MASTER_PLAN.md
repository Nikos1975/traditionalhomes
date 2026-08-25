# I18N Master Plan

## Objective

Prepare multilingual support for the Astro website while keeping the current English-first site stable. This document is the control source for all multilingual route, page, and translation work.

## Approved Locale Strategy

```ts
defaultLocale: 'en'
locales: ['en', 'de', 'fr', 'ru', 'zh', 'ar', 'he']
routing: {
  prefixDefaultLocale: true
}
```

- English remains the default locale.
- English remains publicly prefixed at `/en/`.
- Slugs stay stable across languages for now.
- Greek is not the default locale.
- Do not use `prefixDefaultLocale: false`.
- Do not use Weglot or a Google Translate widget.

## Non-Negotiables

- Keep `/en/` as the canonical English route.
- Preserve current English behavior during foundation work.
- Do not translate the full website during foundation work.
- Keep `src/inventory/inventory.json` as the factual source of truth.
- Preserve stable property and guide slugs across locales until a later approved slug strategy exists.
- Treat `/en/blog/` as the canonical English blog; `/blog/**` is redirect-only.
- Keep contact form behavior unchanged.

## Current Route Summary

- `/` redirects to `/en/`.
- `/en/` is the homepage.
- `/en/houses/`
- `/en/houses/[slug]/`
- `/en/villa/[slug]/`
- `/en/location/`
- `/en/contact/`
- `/en/faq/`
- `/en/policies/`
- `/en/about/`
- `/en/guide/mavrikiano/`
- `/en/guide/vrouchas/`
- `/en/blog/` is the English blog index; legacy `/blog/**` redirects permanently to it.

## Future Route Target

Top-level locale roots:

- `/en/`
- `/de/`
- `/fr/`
- `/ru/`
- `/zh/`
- `/ar/`
- `/he/`

Stable slug examples:

- `/en/houses/argyro/`
- `/de/houses/argyro/`
- `/fr/houses/argyro/`
- `/ru/houses/argyro/`
- `/zh/houses/argyro/`
- `/ar/houses/argyro/`
- `/he/houses/argyro/`

## Content Strategy

Use JSON or TypeScript locale files for short interface strings:

- navigation
- buttons
- breadcrumbs
- forms
- footer
- labels
- SEO templates

Use Markdown or content collections for long-form content:

- house descriptions
- villa descriptions
- location pages
- guides
- blog posts
- long FAQ and policy bodies where needed

Inventory rules:

- `src/inventory/inventory.json` remains the factual source of truth.
- Translated display strings should live beside inventory, keyed by stable slug.
- Do not duplicate factual inventory values into translation files unless they are display labels.
- Gallery image paths remain shared.
- Gallery alt text and captions may be localized later.

## Language Selector Contract

- Show only locales whose real homepage route exists in `routeMap`; configured future locales must stay hidden until they are actually launched.
- Use text labels rather than flags. Compact desktop controls may use locale codes such as `EN` and `DE`; mobile controls should use native names such as `English` and `Deutsch`.
- When the current page has a real equivalent in the target locale, switch directly to that equivalent route.
- When no equivalent page exists, link to the target locale homepage rather than inventing a route or silently linking to a non-existent translation.
- Language-switcher URLs must be derived from the same route map used by canonicals, hreflang, navigation and sitemap logic.
- Adding a future locale homepage to the route map should make that locale eligible for the shared selector without a locale-specific UI rewrite.

## Localized Navigation Contract

- A non-default locale's primary navigation must list only destinations that have real pages in that locale.
- Do not present a translated navigation label that silently sends the visitor to an English fallback route.
- Until a page is localized, omit it from that locale's primary navigation; the language selector remains the explicit path back to the full English site.
- Once a localized route is launched, add its authored source href to that locale's navigation overlay so the shared route resolver produces the localized public URL.

## Migration Order

1. Document route, content, and QA rules.
2. Add i18n foundation helpers and English locale files.
3. Convert shared UI strings in Header and Footer only.
4. Add route/file structure for one non-English locale after English is stable.
5. Translate one language at a time from the English source.
6. Add localized long-form content collections after shared UI is stable.
7. Add locale-aware SEO, canonicals, hreflang, and sitemap checks.
8. Maintain the approved `/blog/**` to `/en/blog/**` redirect and canonical contract.
9. Complete RTL-specific review for Arabic and Hebrew.

## Launch Order

1. English foundation
2. German
3. French
4. Russian
5. Simplified Chinese
6. Arabic with RTL QA
7. Hebrew with RTL QA after route scaffolding is approved

## Risks

- Accidentally changing `/en/` behavior while adding i18n helpers.
- Duplicating inventory facts in translation files and creating factual drift.
- Migrating `/blog/` without a redirect/canonical plan.
- Breaking contact form behavior while changing form labels.
- Adding locale routes before shared rendering and fallback rules are clear.
- Missing `dir="rtl"` layout issues for Arabic or Hebrew.
- Generating sitemap or hreflang entries before all target routes exist.
- Publishing translated claims that expand beyond the English source.

## Files Not To Touch Without Explicit Approval

- `functions/api/contact.js`
- Cloudflare Pages variables
- Cloudflare DNS settings
- Cloudflare Email Service configuration
- Gmail or email routing setup
- Deployment configuration
- Production deployment state
- Existing contact endpoint behavior at `/api/contact`
