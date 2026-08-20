# SEO, Hreflang, Sitemap and LLM Contract

## Canonical

Every real localized page is self-canonical.

Do not canonicalize a translated page back to English merely because English is the factual master.

## Hreflang

Emit alternates only for real equivalent routes.

Required properties for an equivalent pair:

- reciprocal EN/target-locale entries;
- self entry on both sides;
- `x-default` points to the English route;
- no entry for an unbuilt locale.

## Internal links

Prefer a real same-locale equivalent. When none exists, link to the actual English page and mark the fallback as English.

## Sitemap

Keep one global sitemap entry point. Localized routes appear only when they actually build.

Do not add future-language URLs to the sitemap before their pages exist.

## llms.txt

Keep one global `/llms.txt`. Add language-version entries only for real translated routes. Do not create per-language llms files without an approved architecture change.

## Redirects

Do not add automatic IP/browser-language redirects. Preserve the existing English blog canonical/redirect contract unless the task explicitly changes it.
