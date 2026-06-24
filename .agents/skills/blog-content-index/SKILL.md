---
name: blog-content-index
description: Maintain the Traditional Homes blog content index and blog route/content map. Use when adding, removing, renaming, moving, or changing status for blog posts or guide content; changing blog slugs, draft/noindex/testVariant metadata, blog index inclusion, guide/blog boundaries, or blog route logic; or auditing the current blog system.
---

# Blog Content Index

Use this skill whenever blog structure, blog content identity, or blog index visibility changes.

## Required Updates

When an agent does any of the following, update all three files below:

- Adds a blog post.
- Removes a blog post.
- Renames a blog file.
- Changes a blog slug.
- Changes `draft`, `noindex`, or `testVariant` status.
- Changes whether a post appears on `/blog/`.
- Moves guide/blog content between `src/content/blog/` and `src/guides/`.
- Changes blog route logic.

Required files to update:

- `docs/architecture/blog-content-index.md`
- `docs/architecture/blog-content-index.mmd`
- `docs/agent-handoff-notes.md`

## Current Blog Map

- Current blog route: `/blog/`
- No `/en/blog/` route exists.
- Blog route files:
  - `src/pages/blog/index.astro`
  - `src/pages/blog/[...slug].astro`
- Blog posts live in `src/content/blog/`.
- Guide files outside the blog collection include:
  - `src/guides/Mavrikiano-Guide.md`
  - `src/guides/Vrouchas-Guide.md`
- `elounda-guide-style-1`, `elounda-guide-style-2`, and `elounda-guide-style-3` are directly routable test variants. Keep them hidden from `/blog/` and `noindex` unless the user explicitly asks to promote, archive, or remove them.
- `Mavrikiano-Distances-And-Guide.md` has a mixed-case filename. Do not rename it unless redirects and route compatibility are planned.

## Verification Checklist

Before finishing blog index work:

- Confirm `/blog/` is still the only blog index route unless the task explicitly adds localization.
- Confirm hidden/noindex test variants are represented separately from listed posts.
- Confirm `src/guides/Mavrikiano-Guide.md` and `src/guides/Vrouchas-Guide.md` remain documented as guide content unless moved.
- Run `git status --short` and report the result.
