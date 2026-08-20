# I18N Master Plan

## Objective

Build multilingual support for `traditional-homes.gr` without weakening the English site, duplicating factual sources, or publishing locale routes that do not really exist.

This document defines durable multilingual policy. Live route availability is owned by `src/i18n/route-map.ts`.

## Locale strategy

```ts
defaultLocale: 'en'
locales: ['en', 'de', 'fr', 'ru', 'zh', 'ar', 'he']
routing: {
  prefixDefaultLocale: true
}
```

- English remains the default locale and stays publicly under `/en/`.
- Greek is not the default locale.
- Do not use `prefixDefaultLocale: false`.
- Do not use Weglot, Google Translate widgets, automatic browser/IP redirects, or a client-side machine-translation runtime.
- Arabic and Hebrew require explicit RTL QA before launch.

## Core architecture

### Stable identity, localized public URLs

Internal route/content identities are stable and locale-independent. Public path segments and editorial slugs may differ by locale.

Examples proven by the German reference implementation:

| Internal identity | English | German |
| --- | --- | --- |
| `home` | `/en/` | `/de/` |
| `houses` | `/en/houses/` | `/de/ferienhaeuser/` |
| `house/argyro` | `/en/houses/argyro/` | `/de/ferienhaeuser/argyro/` |
| `location` | `/en/location/` | `/de/lage/` |
| `guide/vrouchas` | `/en/guide/vrouchas/` | `/de/reisefuehrer/vrouchas/` |

Do not assume the same public slug in every language. Proper names normally remain unchanged; generic route segments and editorial slugs may localize naturally.

### Fail closed

A non-default-locale route exists only when the route map explicitly declares it and the page can render substantive localized content. Do not infer, machine-translate, or fabricate future locale URLs.

### Shared rendering

Equivalent locale pages should share page renderers where their structure is the same. Thin route wrappers pass `locale` explicitly. Do not fork complete page markup per language unless structural divergence is genuinely required.

### Facts and presentation are separate

`src/inventory/inventory.json` remains the factual property source of truth. Other structured factual files keep ownership of their own values. Locale resources may describe how a fact is presented, but must not become a second factual inventory.

English is the verified factual master for substantive copy. Suspected factual errors become cross-language corrections; they are not silently fixed in one locale.

### Static-first delivery

Select locale content at build time and serve static HTML. Browser payloads should contain only the active locale's client-side labels when client code needs localized strings.

## SEO contract

- Every real localized page is self-canonical.
- Emit reciprocal hreflang only for real equivalent routes.
- `x-default` points to English when an alternate set exists.
- Do not emit hreflang for an unbuilt locale.
- Prefer a real same-locale internal link; otherwise link to the real English page and mark the fallback as English.
- Keep one global sitemap entry point.
- Keep one global `/llms.txt`.
- Add localized sitemap/LLM entries only when the corresponding page actually builds.
- `/en/blog/` remains the canonical English blog; legacy `/blog/**` remains redirect-only unless a separate approved blog migration changes that contract.

## Content placement

Use locale JSON/TypeScript resources for reusable presentation strings such as:

- navigation and footer labels;
- buttons, forms, filters, maps and breadcrumbs;
- derived display text;
- SEO templates;
- localized presentation of descriptive structured values.

Use locale-specific Markdown/content entries for long-form content such as:

- house and villa descriptions;
- guides;
- long location/editorial bodies;
- future translated blog articles.

Share media paths where practical. Alt text and captions may localize as presentation while the underlying asset remains shared.

## German reference implementation

PR #59 proves the reference architecture on five German routes:

- `/de/`
- `/de/ferienhaeuser/`
- `/de/ferienhaeuser/argyro/`
- `/de/lage/`
- `/de/reisefuehrer/vrouchas/`

This is not a sitewide German launch. The route map remains the live authority for what exists on the current branch.

## Expansion order

1. Prove infrastructure and complete visible-language QA on a bounded reference scope.
2. Scale German one route/content unit at a time without further broad renderer refactors.
3. Add a language switcher only after enough real equivalents exist to make it useful.
4. Expand to French, Russian, Simplified Chinese, Arabic and Hebrew only after the German pattern remains stable.
5. Run explicit RTL layout and interaction QA for Arabic and Hebrew.
6. Translate blog content only under a separately approved editorial/SEO plan.

## Non-negotiables

- Preserve `/en/` public URLs and behavior unless a cross-language correction is explicitly approved.
- Keep `src/inventory/inventory.json` as the factual property authority.
- Do not create phantom routes, sitemap entries or hreflang entries.
- Do not independently correct facts in one locale.
- Keep contact submission behavior and `/api/contact` unchanged during translation work.
- Do not merge, deploy, publish, change DNS, Cloudflare variables, email routing, or production state without explicit approval.

## Protected operational files/settings

Do not change without explicit approval:

- `functions/api/contact.js`
- Cloudflare Pages variables
- Cloudflare DNS
- Cloudflare Email Service
- Gmail/email routing
- deployment configuration
- production deployment state
