# Blog Content Index

## Purpose

This is a Graphify-style content map for future agents working on the blog system. Keep it in sync whenever blog files, blog route logic, guide/blog boundaries, index visibility, or indexing metadata changes.

Mermaid source: `docs/architecture/blog-content-index.mmd`

## Current Route Structure

- Canonical public index: `/en/blog/`
- Canonical public articles: `/en/blog/<slug>/`
- Legacy `/blog/**` is redirect-only through `public/_redirects`.
- Blog index file: `src/pages/en/blog/index.astro`
- Blog post route file: `src/pages/en/blog/[...slug].astro`
- Blog content collection: `src/content/blog/`

## Published Posts Listed On `/en/blog/`

| File | URL | Title |
| --- | --- | --- |
| `areti-monastery-mirabello-crete.md` | `/en/blog/areti-monastery-mirabello-crete/` | Moni Aretiou: A Historic Monastery Inland from Elounda |
| `elounda-and-mirabello-bay.md` | `/en/blog/elounda-and-mirabello-bay/` | Elounda and Mirabello Bay |
| `elounda-guide.md` | `/en/blog/elounda-guide/` | Where the Sea Holds Memory |
| `elounda-history-through-its-shoreline.md` | `/en/blog/elounda-history-through-its-shoreline/` | A Short Chronological History of Elounda |
| `elounda-salt-pans-and-poros-windmills.md` | `/en/blog/elounda-salt-pans-and-poros-windmills/` | Elounda Salt Pans and the Poros Windmills |
| `elounda-visitor-economy.md` | `/en/blog/elounda-visitor-economy/` | How Elounda's Visitor Economy Changed |
| `elounda-wartime-memory.md` | `/en/blog/elounda-wartime-memory/` | Elounda, Spinalonga, and Wartime Memory |
| `key-phases-in-elounda-hotel-development.md` | `/en/blog/key-phases-in-elounda-hotel-development/` | Key Phases in Elounda's Hotel Development |
| `Mavrikiano-Distances-And-Guide.md` | `/en/blog/mavrikiano-distances-and-guide/` | Mavrikiano Distances and Area Guide |
| `walking-around-elounda.md` | `/en/blog/walking-around-elounda/` | Walking Around Elounda |
| `welcome-to-elounda.md` | `/en/blog/welcome-to-elounda/` | Welcome to Elounda Traditional Homes |

## Draft Style Variants

These posts remain `draft: true`; they have no public route or sitemap entry. Their existing metadata/image issues are outside this migration.

| File | URL | Status |
| --- | --- | --- |
| `elounda-guide-style-1.md` | No public route | Draft style variant |
| `elounda-guide-style-2.md` | No public route | Draft style variant |
| `elounda-guide-style-3.md` | No public route | Draft style variant |

## Guide Content Outside Blog

Treat these as guide content, not current blog posts:

- `src/guides/Mavrikiano-Guide.md`
- `src/guides/Vrouchas-Guide.md`

## Current Decisions

- Keep `elounda-guide-style-1`, `elounda-guide-style-2`, and `elounda-guide-style-3` hidden/noindex until a final guide version is chosen.
- Keep the public blog English-only at `/en/blog/`; do not add translated blog routes, hreflang, a selector, RSS, categories, or tags.
- Do not rename `Mavrikiano-Distances-And-Guide.md` unless redirects are planned.
- Treat `src/guides/Mavrikiano-Guide.md` and `src/guides/Vrouchas-Guide.md` as guide content, not blog posts.

## Maintenance Rule

When a future agent adds, removes, renames, moves, or changes indexability/status for blog or guide content, update this file, `docs/architecture/blog-content-index.mmd`, and `docs/agent-handoff-notes.md` in the same task.
