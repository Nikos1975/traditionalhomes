# Route Contract

## Authority

`src/i18n/route-map.ts` is the live source of truth for which localized public routes currently exist.

Do not duplicate its current route list here.

## Stable identity vs public URL

Internal route/content identities are stable. Public path segments may vary by locale.

Examples already proven by the German implementation:

- internal `houses` → EN `/en/houses/` → DE `/de/ferienhaeuser/`
- internal `location` → EN `/en/location/` → DE `/de/lage/`
- internal guide id `vrouchas` → EN `/en/guide/vrouchas/` → DE `/de/reisefuehrer/vrouchas/`
- internal property id `argyro` → EN `/en/houses/argyro/` → DE `/de/ferienhaeuser/argyro/`

Proper names generally retain their identity; generic route segments may be localized.

## Fail-closed rule

If a locale does not have a real page, route resolution must return no localized route rather than guessing one.

No route declaration should exist for a non-default-locale house unless the corresponding localized content can be rendered.

## Fallback rule

When a German page links to content that exists only in English, link to the real English route and mark the link as English (`hreflang="en"`) where the shared link helper supports that contract.

Do not fabricate an untranslated German destination merely to keep the path under `/de/`.
