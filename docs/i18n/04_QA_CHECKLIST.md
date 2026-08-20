# I18N QA Checklist

Run only the sections relevant to the current stage, but do not skip a check that protects a changed behavior.

## Repository and scope

- [ ] Working tree was checked before editing.
- [ ] Only the approved locale/route/content scope changed.
- [ ] No unexpected files were created or modified.
- [ ] `git diff --check` passes.
- [ ] Generated/local check artifacts were restored or kept untracked.

## Build and route checks

- [ ] Focused i18n tests pass.
- [ ] Full relevant test suite passes or only documented pre-existing failures remain.
- [ ] `npm run typecheck` is no worse than the current baseline.
- [ ] `npm run build` passes.
- [ ] `npm run seo:links` passes when the environment supports its local crawl; if not, record the environment limitation and use a bounded substitute rather than claiming success.
- [ ] `/en/` behavior remains correct.
- [ ] Root `/` redirect remains correct.
- [ ] Every declared target-locale route actually builds.
- [ ] No undeclared/phantom locale route builds.
- [ ] No broken internal links, slugs, fragments or images were introduced.

## Route and fallback checks

- [ ] Stable internal ids are separate from locale-specific public URLs.
- [ ] A target-locale link prefers a real same-locale equivalent where one exists.
- [ ] A page with no target-locale equivalent links to the real English route instead of a fabricated locale route.
- [ ] Intentional English fallbacks are marked `hreflang="en"` where the shared link contract supports it.
- [ ] Non-default detail routes fail closed when substantive localized content is missing.

## Shared-renderer checks

- [ ] Equivalent locale pages reuse shared renderers rather than duplicating complete markup.
- [ ] Locale is passed explicitly through the relevant route/renderer/component chain.
- [ ] Browser payloads contain only the active locale's client-side labels when localized client data is required.
- [ ] English output did not change unintentionally because a shared component was localized.

## Visible-language completeness

For a route declared localized, inspect generated output, not only locale dictionaries.

- [ ] Headings and body text are in the target language.
- [ ] Header/footer/breadcrumbs are in the target language where those controls are part of the localized page.
- [ ] Buttons, forms, filters and map/card labels are localized.
- [ ] Inventory-derived/structured descriptive values render naturally in the target language.
- [ ] `aria-label`, `alt`, `title` and `placeholder` contain no unintended source-language leakage.
- [ ] Gallery alt/caption presentation is localized where the page claims full localization.
- [ ] Any shared EN/target string is legitimate: proper name, brand, code, URL, machine-facing identifier, bare number or intentional English fallback.
- [ ] No naive blanket English-vocabulary rule creates false positives; parity/allow-list logic is explicit and reviewable.

For German expansion, run `tests/i18n-german-visible-language.test.mjs` when it exists on the current branch.

## Fact/source integrity

- [ ] `src/inventory/inventory.json` remains the factual property authority.
- [ ] Location/group/pairing factual source files remain authoritative for their domains.
- [ ] Locale resources contain presentation, not duplicated factual datasets.
- [ ] Numbers in localized presentation mappings correspond to the factual English/source value they present.
- [ ] Stable ids/slugs referenced by presentation mappings really exist.
- [ ] List-valued presentation mappings preserve factual list cardinality/order where required.
- [ ] Proper names are not accidentally translated into different identities.
- [ ] A suspected factual problem was recorded as a cross-language correction rather than fixed in one locale only.

## SEO checks

- [ ] Target-language title, meta description and H1 are natural and faithful to the page.
- [ ] Every localized page is self-canonical.
- [ ] Reciprocal hreflang exists only for real equivalent routes.
- [ ] Each alternate set includes its real self entry.
- [ ] `x-default` points to English.
- [ ] No hreflang is emitted for an unbuilt locale.
- [ ] One global sitemap entry point remains in place.
- [ ] Sitemap contains real localized routes and no phantom locale URLs.
- [ ] One global `/llms.txt` remains in place; no per-locale `llms-*.txt` files were introduced.
- [ ] `/en/blog/` and legacy `/blog/**` redirect/canonical behavior remain unchanged unless the stage explicitly changes the blog architecture.

## English regression checks

- [ ] English factual content remains the master.
- [ ] Existing English public URLs are unchanged.
- [ ] English visible wording is unchanged unless an approved synchronized correction is part of the stage.
- [ ] English gallery authored alt/caption behavior is preserved.
- [ ] Contact/booking behavior is unchanged unless explicitly in scope.

## Language-switcher checks — only when implemented

- [ ] The switcher is derived from real route availability.
- [ ] It never offers a locale destination that does not exist.
- [ ] It links to the equivalent current page when available.
- [ ] It does not perform automatic browser/IP redirect behavior.

## RTL checks — only for implemented Arabic/Hebrew routes

- [ ] Arabic uses `lang="ar"` and `dir="rtl"`.
- [ ] Hebrew uses `lang="he"` and `dir="rtl"`.
- [ ] Header/mobile navigation checked.
- [ ] Forms and booking controls checked.
- [ ] Maps/sidebar/layout checked.
- [ ] Directional icons and controls checked.
- [ ] Mixed Latin names, numbers, URLs and RTL text checked.

## Operational safety

- [ ] No DNS configuration changed.
- [ ] No Cloudflare variables changed.
- [ ] No email routing/Gmail setup changed.
- [ ] `functions/api/contact.js` behavior unchanged unless explicitly approved.
- [ ] No deployment or production publication occurred without explicit approval.
- [ ] No merge occurred without explicit approval.

## Stage report

Record:

- base SHA;
- locale and route/content scope;
- Layer 3 references loaded;
- Layer 4 working inputs;
- files changed;
- tests/checks run and exact outcomes;
- unresolved factual/translation issues;
- next allowed stage/action.
