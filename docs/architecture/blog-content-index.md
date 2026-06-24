# Blog Content Index

## Purpose

This is a Graphify-style content map for future agents working on the blog system. Keep it in sync whenever blog files, blog route logic, guide/blog boundaries, index visibility, or indexing metadata changes.

Mermaid source: `docs/architecture/blog-content-index.mmd`

## Current Route Structure

- Blog index route: `/blog/`
- No `/en/blog/` route exists.
- Blog index file: `src/pages/blog/index.astro`
- Blog post route file: `src/pages/blog/[...slug].astro`
- Blog content collection: `src/content/blog/`

## Published Posts Listed On `/blog/`

| File | URL | Title |
| --- | --- | --- |
| `welcome-to-elounda.md` | `/blog/welcome-to-elounda/` | Welcome to Elounda Traditional Homes |
| `Mavrikiano-Distances-And-Guide.md` | `/blog/mavrikiano-distances-and-guide/` | Mavrikiano Distances and Area Guide |
| `elounda-history-through-its-shoreline.md` | `/blog/elounda-history-through-its-shoreline/` | A Short Chronological History of Elounda |
| `elounda-salt-pans-and-poros-windmills.md` | `/blog/elounda-salt-pans-and-poros-windmills/` | Elounda Salt Pans and the Poros Windmills |
| `elounda-visitor-economy.md` | `/blog/elounda-visitor-economy/` | How Elounda's Visitor Economy Changed |
| `elounda-wartime-memory.md` | `/blog/elounda-wartime-memory/` | Elounda, Spinalonga, and Wartime Memory |
| `key-phases-in-elounda-hotel-development.md` | `/blog/key-phases-in-elounda-hotel-development/` | Key Phases in Elounda's Hotel Development |
| `elounda-guide.md` | `/blog/elounda-guide/` | Where the Sea Holds Memory |

## Hidden Noindex Test Variants

These posts are directly routable but excluded from `/blog/` and should remain `noindex` until a final guide version is chosen.

| File | URL | Status |
| --- | --- | --- |
| `elounda-guide-style-1.md` | `/blog/elounda-guide-style-1/` | Hidden test variant |
| `elounda-guide-style-2.md` | `/blog/elounda-guide-style-2/` | Hidden test variant |
| `elounda-guide-style-3.md` | `/blog/elounda-guide-style-3/` | Hidden test variant |

## Guide Content Outside Blog

Treat these as guide content, not current blog posts:

- `src/guides/Mavrikiano-Guide.md`
- `src/guides/Vrouchas-Guide.md`

## Current Decisions

- Keep `elounda-guide-style-1`, `elounda-guide-style-2`, and `elounda-guide-style-3` hidden/noindex until a final guide version is chosen.
- Do not add `/en/blog/` unless localization is explicitly required.
- Do not rename `Mavrikiano-Distances-And-Guide.md` unless redirects are planned.
- Treat `src/guides/Mavrikiano-Guide.md` and `src/guides/Vrouchas-Guide.md` as guide content, not blog posts.

## Maintenance Rule

When a future agent adds, removes, renames, moves, or changes indexability/status for blog or guide content, update this file, `docs/architecture/blog-content-index.mmd`, and `docs/agent-handoff-notes.md` in the same task.
