# Media Ownership

The current media setup is intentionally hybrid until a later media consolidation phase.

## Public Images

`public/images` is for stable public URLs. Use it for gallery image URLs, Open Graph images, Markdown body images, Markdown frontmatter images, and any asset that must be referenced by a durable `/images/...` path.

These paths are part of the public site surface, so changes to names or locations can break pages, social previews, indexed media, or external references.

## Astro-Optimized Images

`src/assets/images` is for images consumed by Astro components through the asset pipeline, especially cards, maps, and reusable components that benefit from Astro image optimization.

Use this folder when components import images or discover them with `import.meta.glob`.

## Suspected Legacy Images

`public/en/images` is suspected legacy unless live references prove otherwise. Current architecture should prefer `/images/...` public paths for stable image URLs.

Do not move or delete images without a reference audit. A safe audit should check source files, content files, data files, generated references, public URLs, and existing published routes before any media migration.

## Future Consolidation

A later media consolidation phase may choose a single canonical structure. Until then, keep the hybrid model documented and avoid broad media moves.
