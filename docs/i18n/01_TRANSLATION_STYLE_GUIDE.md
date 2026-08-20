# Translation Style Guide

## Source language

English is the verified source language. Translate from the approved English source only, never from another translation.

If the English source appears wrong, outdated or unsupported, do not silently repair the target locale. Record a proposed cross-language correction in `docs/i18n/cross-language-corrections.md`.

## Tone

Translations should be:

- natural in the target language;
- clear and direct;
- calm and factual;
- useful for a guest making a practical decision;
- specific rather than promotional.

Avoid equivalents of:

- hidden gem;
- magical paradise;
- unforgettable experience;
- authentic paradise;
- luxury escape;
- generic destination-guide hype.

Do not make the target language broader, more certain, more luxurious or more promotional than the English source.

## Factual parity

Preserve the same:

- dates and numbers;
- distances;
- amenities and access details;
- views and parking information;
- practical cautions;
- historical claims;
- qualifications and uncertainty;
- visitor information.

Do not invent or remove facts to improve fluency.

`src/inventory/inventory.json` remains the factual property authority. Locale files may localize how descriptive values are presented, but must not duplicate the inventory as a separate factual dataset.

## Names, identities and URLs

- Keep property and place names unchanged unless an approved naming rule explicitly says otherwise.
- Stable internal route/content identities do not translate.
- Public route segments and editorial slugs may be localized naturally through the route-map architecture.
- Do not preserve an English generic path segment merely because the internal id is stable.
- Do not create a locale URL when that page does not exist.

Examples:

- internal `houses` → German public segment `ferienhaeuser`;
- internal `location` → German `lage`;
- internal `guide` → German `reisefuehrer`;
- proper names such as `Argyro`, `Vrouchas`, `Mavrikiano`, `Elounda` and `Spinalonga` normally remain unchanged.

## Presentation of structured facts

A source value may be stored in English while its presentation is localized.

Use stable identifiers, semantic keys, or an exact source string to map presentation. Do not alter the factual owner.

Examples from the German reference implementation include localized layout/access/bathroom descriptions, location-card phrases, group summaries and gallery captions while the underlying inventory/location/group data stays unchanged.

## Visible-language completeness

A route declared as localized should render natural target-language text for all translatable visible strings, including:

- headings and body copy;
- navigation and breadcrumbs;
- buttons and form labels;
- maps/cards;
- `aria-label`;
- `alt`;
- `title`;
- `placeholder`;
- derived inventory presentation;
- gallery captions.

Legitimate exceptions include proper names, brand names, codes, URLs, machine-facing identifiers and intentional links to English-only routes.

Do not use a naive "reject every English word" rule. Validate against the rendered English counterpart and explicit allowed shared strings.

## SEO localization

- Localize title, meta description and H1 naturally for target-language search intent.
- Keep them faithful to the actual page content.
- Generic route words may follow normal target-language search terminology.
- Do not add unsupported claims or keyword-stuffed variants.
- SEO adaptation does not authorize changing the factual scope of the page.

## German wording reference

For German-specific terminology and proven wording decisions, load:

`.agents/skills/traditional-homes-i18n-translation/references/locales/de.md`

Only load a locale-specific reference for the locale currently being translated.

## RTL locales

Arabic and Hebrew require separate RTL QA in addition to translation QA.

- Arabic: `lang="ar"`, `dir="rtl"`.
- Hebrew: `lang="he"`, `dir="rtl"`.
- Verify navigation, mobile menu, forms, maps, sidebars, icon direction and mixed LTR/RTL content.
- Do not assume layout correctness from translated text alone.
