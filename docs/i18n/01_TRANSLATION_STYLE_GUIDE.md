# Translation Style Guide

## Source Language

English is the source language. Translate from the approved English source only, not from another translation.

## Tone Rules

Translations must be:

- clear
- quiet
- accurate
- hospitality-oriented
- factual
- useful for a guest making a practical decision

Translations must avoid:

- hype
- urgency
- luxury exaggeration
- generic tourist language
- unsupported heritage, distance, exclusivity, or amenity claims
- phrases that sound broader or more confident than the English source

## Phrases To Avoid

Do not use equivalents of:

- hidden gem
- magical paradise
- unforgettable experience
- authentic paradise
- luxury escape

## Property And Place Copy

- Preserve the facts in `src/inventory/inventory.json`.
- Do not invent amenities, views, access details, distances, parking details, or guest suitability notes.
- Keep property names and slugs stable unless a later approved slug strategy changes this.
- Prefer concrete details over adjectives.
- Preserve cautions about stairs, access, pools, parking, and suitability.
- If the English source is unclear, report it instead of smoothing it over.

## SEO Copy

- Keep titles and descriptions clear and specific.
- Do not add clickbait phrasing.
- Keep translated meta descriptions aligned with the page's actual content.
- Do not imply broader availability, luxury level, or location advantages than the English source supports.

## RTL Locales

- Arabic requires separate RTL QA.
- Hebrew requires separate RTL QA.
- Arabic pages should use `lang="ar"` and `dir="rtl"` once implemented.
- Hebrew pages should use `lang="he"` and `dir="rtl"` once implemented.
- Do not assume layout correctness from text translation alone.
