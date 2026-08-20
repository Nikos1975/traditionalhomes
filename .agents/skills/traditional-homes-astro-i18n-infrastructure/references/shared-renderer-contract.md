# Shared Renderer Contract

## Goal

One renderer should serve equivalent locale routes whenever their page structure is the same.

The current reference implementation uses shared page renderers under `src/components/pages/` for the homepage, collection, location, house detail, and guide routes.

## Rules

- Route files should be thin wrappers.
- Pass `locale` explicitly into the shared renderer.
- Prefer stable internal ids/slugs as renderer inputs.
- Do not read locale implicitly from browser state when static build data can provide it.
- A shared renderer may load localized presentation resources, but factual property data remains in structured source-of-truth files.
- Keep locale-specific client payloads limited to the active locale.
- Do not duplicate complete page markup into locale-specific page files unless structural divergence is genuinely required.

## Scaling test

After the reference property works, the next property should usually require content/data and a route-map declaration rather than another renderer refactor.

If a second property still requires broad structural changes, stop and treat that as an architecture deficiency before scaling further.
