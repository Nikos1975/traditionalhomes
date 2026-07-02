# Traditional Homes Astro Repo Structure Audit

Audit date: 2026-06-09
Repository root: `D:\_projects\_traditional-homes`
Branch observed: `codex/property-content-ui-map-version`
Remote observed: `https://github.com/Nikos1975/traditionalhomes.git`

Evidence commands included `git status --short`, `git diff --name-only`, `Get-ChildItem`, `rg` import/reference searches, and direct reads of `CLAUDE.md`, `AGENTS.md`, `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, and `src/content.config.ts`.

## 1. Executive Summary

The active website structure is recognizable and mostly healthy: it is a static Astro 5 site with Tailwind, content collections for `houses`, `villa`, and `blog`, a small set of route files under `src/pages`, reusable components under `src/components`, and data-driven property facts under `src/inventory` and `src/data`.

The messy parts are mostly around duplication and local/generated material. The repo contains build snapshots (`dist_old_*`, `dist_locked_*`), local agent folders (`.agent`, `.agents`, `.claude`, `.codex`, `.superpowers`), a very large `open-design` tree, duplicate media roots (`public/images`, `public/en/images`, `src/assets/images`), and generated/cache-looking folders inside `src` (`src/.astro`, `src/node_modules`). These do not all imply broken pages, but they increase maintenance risk and make it harder to know what is canonical.

The most important content/data risk is that `src/inventory/inventory.json` is the stated source of truth, but similar facts also appear in Markdown content, `src/data/locations.ts`, `src/data/gallery.json`, `src/inventory/inventory copy.json`, guide Markdown, and docs/research mockups. The project already has good instruction routing: `CLAUDE.md` should remain canonical, while `AGENTS.md` should stay a thin wrapper.

## 2. Dirty Worktree Snapshot

`git status --short` showed a dirty working tree before this report was created.

Modified files:

- `.ai/memory/conventions.md`
- `.gitignore`
- `AGENTS.md`
- `docs/agent-handoff-notes.md`
- `docs/commit-plan/clean-commit-plan.md`
- `docs/commit-plan/groups/02-ui-map-behavior.txt`
- `docs/commit-plan/groups/04-agent-project-docs.txt`
- `docs/commit-plan/groups/98-review-needed.txt`
- `package-lock.json`
- `src/components/AtAGlance.astro`
- `src/components/UnitCard.astro`
- `src/components/booking/BookingHandoffForm.astro`
- `src/content/houses/argyro.md`
- `src/content/houses/margarita.md`

Untracked folders/files:

- `.agent/`
- `.ai/brand/`
- `.ai/memory/conventions.md.tmp.4907.1775928805346`
- `.ai/prompts/blog-editorial-system.md`
- `.ai/prompts/website-editorial-system.md`
- `.claude/`
- `.codex/`
- `.superpowers/`
- `CLAUDE.md`
- `docs/integrations/WebHotelier API Context for AI Automation.md`
- `docs/integrations/WebHotelier Documentation Analysis ALL SOurces.md`
- `docs/integrations/WebHotelier Documentation Analysis.md`
- `docs/research/elounda/blog/`
- `docs/research/elounda/elounda-luxury-tourism-evolution/EloundasLuxuryTourismEvolution.html`
- `docs/research/elounda/elounda-rich-historical-tapestry/EloundasRichHistoricalTapestryUnveiled.html`
- `docs/research/elounda/elounda-wartime-history-and-stories/EloundasWartimeHistoryandStories.html`
- `docs/superpowers/plans/2026-05-22-webhotelier-responsive-css-finalization.md`
- `public/images/blog/IMG_20230808_201732~2-EFFECTS.jpg`
- `public/images/blog/IMG_20250710_143457-EDIT.jpg`
- `public/images/blog/Screenshot 2025-12-23 105800-EDIT.jpg`
- `public/images/blog/elounda-spinalonga-1024.webp`
- `public/images/blog/elounda-spinalonga-1600.webp`
- `public/images/blog/elounda-spinalonga-2400.webp`
- `public/images/blog/elounda-spinalonga-480.webp`
- `public/images/blog/elounda-spinalonga-768.webp`
- `public/images/blog/elounda-spinalonga.jpg`

What matters:

- The dirty files include active source files and content files, so any future cleanup should avoid broad resets.
- `.agent/`, `.claude/`, `.codex/`, and `.superpowers/` appear to be local workflow/tooling state. `CLAUDE.md` explicitly says not to commit `.claude/`, `CLAUDE.md`, or `.ai/` unless requested.
- `.gitignore` currently ignores `.astro/`, `node_modules/`, `dist/`, `dist_old_*/`, `dist_locked_*/`, `open-design/`, and common cache files, but it does not currently ignore `.agent/`, `.agents/`, `.claude/`, `.codex/`, `.superpowers/`, or `.ai/memory/*.tmp.*`.

## 3. Current Folder Map

Excludes `node_modules`, `.git`, `.astro`, `dist`, `dist_old_*`, `dist_locked_*`, and generated build outputs.

```text
D:\_projects\_traditional-homes
|-- .agent/
|   `-- skills/traditional-homes/
|-- .agents/
|   `-- skills/
|       |-- astro-build-triage/
|       |-- blog-research-article/
|       |-- brand-content-audit-and-rewrite/
|       |-- clean-commit-planner/
|       `-- property-content-audit/
|-- .ai/
|   |-- brand/
|   |-- logs/
|   |-- memory/
|   `-- prompts/
|-- .bolt/
|-- .claude/
|   `-- skills/
|-- .codex/
|-- .superpowers/
|   `-- brainstorm/
|-- .vscode/
|-- docs/
|   |-- commit-plan/
|   |-- integrations/
|   |-- releases/
|   |-- research/
|   `-- superpowers/
|-- open-design/
|-- public/
|   |-- en/
|   |-- fonts/
|   |-- icons/
|   `-- images/
|-- scripts/
`-- src/
    |-- assets/
    |-- components/
    |-- content/
    |-- data/
    |-- guides/
    |-- inventory/
    |-- layouts/
    |-- pages/
    |-- styles/
    `-- utils/
```

Root files observed:

- Active/config: `astro.config.mjs`, `package.json`, `package-lock.json`, `postcss.config.js`, `tailwind.config.js`, `tsconfig.json`, `.node-version`, `.gitattributes`, `.gitignore`, `.env`
- Instructions/docs: `AGENTS.md`, `CLAUDE.md`, `README.md`
- Tooling/scripts: `build_gallery.cjs`, `inject_srcset.cjs`, `run-ai.mjs`, `update_data.cjs`, `update_data.js`
- Suspicious/local or generated: `check_err.txt`, `check_err_utf8.txt`

## 4. Active Folders

| Folder | Purpose | Evidence of use | Confidence |
|---|---|---|---|
| `src/pages` | Astro route files | 14 route files under `src/pages`; Astro file-based routing | High |
| `src/pages/en` | Main English site routes | Imports `Base.astro`, `siteCopy.json`, inventory, maps, forms | High |
| `src/pages/blog` | Blog index and dynamic blog article routes | Uses `getCollection('blog')` and `render()` | High |
| `src/components` | Shared UI components | All `.astro` components have filename import hits in active source | High |
| `src/components/booking` | WebHotelier handoff form | Imported by home, listing, house detail, villa detail | High |
| `src/components/gallery` | House gallery component | Imported by `src/pages/en/houses/[slug].astro` | High |
| `src/components/maps` | Leaflet and map wrappers | Imported by home, location, house, villa routes | High |
| `src/components/blog` | Blog-specific timeline component | Imported by `src/pages/blog/[...slug].astro` | High |
| `src/layouts` | Shared page shells | `Base.astro` imported by all active page routes except root redirect page; `MagazineLayout.astro` is not imported | Medium |
| `src/content` | Astro content collections | `src/content.config.ts` defines `houses`, `villa`, `blog` loaders here | High |
| `src/content/houses` | House Markdown content | `getEntry('houses', slug)` in house dynamic route | High |
| `src/content/villa` | Villa Markdown content | `getEntry('villa', slug)` in villa dynamic route | High |
| `src/content/blog` | Blog Markdown content | `getCollection('blog')` in blog index and dynamic route | High |
| `src/inventory` | Property structured source data | `inventory.json`, `groups.json`, `suggested-pairings.json` imported by active routes/components | High |
| `src/data` | Gallery, locations, site-wide copy | `gallery.json`, `locations.ts`, `siteCopy.json` imported by active routes/components | High |
| `src/guides` | Markdown source for static area guide routes | Imported by `src/pages/en/guide/mavrikiano.astro` and `vrouchas.astro` | High |
| `src/utils` | Shared validation/filter/gallery/map helpers | Imported by active pages/components | High |
| `src/styles` | Global CSS | Imported by `src/layouts/Base.astro` | High |
| `src/assets/images` | Astro optimized image source | Used by `import.meta.glob('/src/assets/images/**/*...')` in `UnitCard.astro`, `GroupCard.astro`, and `MasterLocationMap.astro` | Medium |
| `public/images` | Public image URLs used in data/content | Referenced by `gallery.json`, `locations.ts`, blog Markdown, house/villa detail routes | High |
| `public/fonts` | Local fonts | Preloaded in `Base.astro` and referenced by global CSS | High |
| `public/icons` | App icons | Referenced by `public/site.webmanifest` | High |
| `public` | Static headers, redirects, robots, manifest, favicons | Astro public directory semantics plus direct references in layout/config | High |
| `scripts` | Auditing/content/image helper scripts | Files include `audit_*`, gallery/data update helpers; not route-critical | Medium |
| `docs` | Project docs, handoffs, plans, research | Referenced by `CLAUDE.md`, dirty worktree, and existing workflow docs | High |
| `.ai/brand` | Brand voice source | `CLAUDE.md` and `AGENTS.md` name `.ai/brand/website-brand-style-guide.md` as tone source | High |
| `.ai/prompts` | Editorial system prompts | `CLAUDE.md` and `AGENTS.md` route property/blog work here | High |
| `.agents/skills` | Project-specific agent skills | `CLAUDE.md` says property page audits use `.agents/skills/property-content-audit/SKILL.md` | High |

Active folder count: 28.

## 5. Suspected Unused / Legacy Folders and Files

| Folder/File | Why suspected unused | Evidence checked | Confidence | Recommended action |
|---|---|---|---|---|
| `src/layouts/MagazineLayout.astro` | Experimental standalone HTML layout; references placeholder fonts `YourSerifFont.woff2` and `YourSansFont.woff2` | `rg --fixed-strings 'MagazineLayout'` found only `docs/agent-handoff-notes.md`; no source imports | High | Archive or delete later after mentor approval |
| `src/inventory/inventory copy.json` | Backup/copy inventory with old slug `dimitra`; not imported | `rg --fixed-strings 'inventory copy.json'` found no references outside filename | High | Archive or delete later after comparing against `inventory.json` |
| `public/en/images` | Duplicate public image tree under `/en/images`; active code references `/images/...` | `rg --fixed-strings '/en/images'` found only docs/research mockups and handoff notes | Medium | Investigate manually, then remove from deploy path if not needed |
| `public/images/houses/dimitra` | Slug spelling does not match live house content file `demetra.md`; active inventory now uses `demetra` in routes | `rg 'dimitra'` found `src/data/gallery.json`, contact option, old placeholders, and `inventory copy.json` | Medium | Investigate spelling migration before deleting |
| `src/assets/images/houses/dimitra` | Same duplicate/legacy spelling risk as public `dimitra` | `rg 'dimitra'` found data references but active content route is `demetra.md` | Medium | Investigate manually; decide canonical spelling |
| `src/.astro` | Generated Astro content/cache files inside `src` | `Get-ChildItem src -Recurse` showed `src/.astro/content-assets.mjs`, `content-modules.mjs`, `content.d.ts`, `types.d.ts` | High | Ignore/remove later as generated cache |
| `src/node_modules` | Generated/local dependency cache inside source tree | `Get-ChildItem src -Recurse` showed `src/node_modules/.astro` and `src/node_modules/.vite` | High | Ignore/remove later; do not keep under `src` |
| `dist_old_1774439278` | Old static build snapshot | Root folder name matches ignored pattern `dist_old_*`; not source | High | Keep ignored or delete later outside product change |
| `dist_locked_1779298776` | Locked/static build snapshot | Root folder name matches ignored pattern `dist_locked_*`; not source | High | Keep ignored or delete later outside product change |
| `open-design` | Large unrelated design/tool repository tree | `.gitignore` already has `open-design/`; root map shows many unrelated packages/design systems | High | Keep ignored; do not include in product commits |
| `.agent/` | Local workflow state | Untracked; not referenced by app imports | Medium | Ignore or keep local only |
| `.claude/` | Local Claude workflow state | Untracked; `CLAUDE.md` says do not commit `.claude/` unless requested | High | Keep local only; ignore |
| `.codex/` | Local Codex workflow state | Untracked; not app source | Medium | Keep local only; ignore |
| `.superpowers/` | Local superpowers workflow state | Untracked; not app source | Medium | Keep local only; ignore |
| `.ai/memory/conventions.md.tmp.4907.1775928805346` | Temporary file | Untracked `.tmp` filename inside memory folder | High | Delete later or ignore temp pattern |
| `check_err.txt` / `check_err_utf8.txt` | Old captured error logs | Root text files with check/error names; no app imports found in source import search | Medium | Investigate manually, archive/delete later |
| `src/assets/images/*/PLACEHOLDER.md` and `public/images/*/PLACEHOLDER.md` | Placeholder marker files mixed into media folders | `rg` found many placeholder files; active images are direct `.webp`/`.jpg` references | Low | Keep until media workflow is confirmed |
| `docs/research/elounda/blog/*.html` | Design mockups, not live Astro routes | References localhost URLs and `/en/images`; docs/handoff says mockups were created for design research | Medium | Keep as research or archive under docs |
| `docs/integrations/WebHotelier Documentation Analysis*.md` | Large analysis/source docs, some untracked | Not route imports; docs/integrations contains live integration reference material | Low | Review and consolidate later |

Suspected unused/legacy count: 19.

## 6. Routing Structure

Astro config uses `output: 'static'`, `trailingSlash: 'always'`, `build.format: 'directory'`, and `site: 'https://traditional-homes.gr'`.

| Route file | URL created | Type | Dependencies / purpose |
|---|---|---|---|
| `src/pages/index.astro` | `/` | Static | Root page. Content not deeply inspected in this audit; sitemap config excludes `https://traditional-homes.gr/`, suggesting the canonical public home may be `/en/`. |
| `src/pages/en/index.astro` | `/en/` | Static | Main home page. Imports `Base`, `UnitCard`, `BookingHandoffForm`, `MapPreview`, `inventory.json`, `siteCopy.json`, `validateInventory`, `InventoryUnit`. |
| `src/pages/en/houses/index.astro` | `/en/houses/` | Static listing | Imports `Base`, `UnitCard`, `GroupCard`, `FilterBar`, `BookingHandoffForm`, `inventory.json`, `groups.json`, `siteCopy.json`, `validateInventory`. Builds combined unit/group listing. |
| `src/pages/en/houses/[slug].astro` | `/en/houses/{slug}/` | Dynamic static paths | `getStaticPaths()` filters `inventory.json` units where `type === 'house'`. Imports content entry via `getEntry('houses', slug)`, gallery data, locations, pairings, maps, booking form, `HouseGallery`, and `AtAGlance`. |
| `src/pages/en/villa/[slug].astro` | `/en/villa/{slug}/` | Dynamic static paths | `getStaticPaths()` filters inventory units where `type === 'villa'`. Imports villa content entry via `getEntry('villa', slug)`, gallery data, locations, booking form, `GalleryA`, `AtAGlance`, and uses `node:fs`/`node:path` to find hero/OG files in `public/images/villa`. |
| `src/pages/en/location.astro` | `/en/location/` | Static | Imports `Base`, `siteCopy.json`, `MasterLocationMap`, `inventory.json`, `locations.ts`, types. Location/map landing page. |
| `src/pages/en/about.astro` | `/en/about/` | Static | Imports `Base` and `siteCopy.json`; references `/images/brand/about-detail.webp`. |
| `src/pages/en/contact.astro` | `/en/contact/` | Static | Imports `Base` and `siteCopy.json`; contains contact/property inquiry UI. `rg 'dimitra'` found a contact option still using `dimitra`. |
| `src/pages/en/faq.astro` | `/en/faq/` | Static | Imports `Base` and `siteCopy.json`; policy/access FAQ copy. |
| `src/pages/en/policies.astro` | `/en/policies/` | Static | Imports `Base` and `siteCopy.json`; rules/policy copy. |
| `src/pages/en/guide/mavrikiano.astro` | `/en/guide/mavrikiano/` | Static | Imports `Base` and `src/guides/Mavrikiano-Guide.md`. |
| `src/pages/en/guide/vrouchas.astro` | `/en/guide/vrouchas/` | Static | Imports `Base` and `src/guides/Vrouchas-Guide.md`. |
| `src/pages/blog/index.astro` | `/blog/` | Static collection index | Imports `Base` and `getCollection('blog')`; filters/sorts blog posts. |
| `src/pages/blog/[...slug].astro` | `/blog/{slug}/` | Dynamic catch-all static paths | Imports `Base`, `EloundaHotelTimeline`, `getCollection('blog')`, `render()`. Renders Markdown posts. |

Dynamic routes:

- `src/pages/en/houses/[slug].astro`
- `src/pages/en/villa/[slug].astro`
- `src/pages/blog/[...slug].astro`

## 7. Components and Layouts

Component usage evidence:

- `AtAGlance.astro`: imported by house detail and villa detail.
- `FilterBar.astro`: imported by houses listing.
- `Footer.astro`: imported by `Base.astro`.
- `GalleryA.astro`: imported by villa detail.
- `GroupCard.astro`: imported by houses listing.
- `Header.astro`: imported by `Base.astro`.
- `UnitCard.astro`: imported by home and houses listing.
- `blog/EloundaHotelTimeline.astro`: imported by blog dynamic route.
- `booking/BookingHandoffForm.astro`: imported by home, houses listing, house detail, villa detail.
- `gallery/HouseGallery.astro`: imported by house detail.
- `maps/LeafletMap.astro`: imported by `SinglePinMap.astro` and `MasterLocationMap.astro`.
- `maps/MapPreview.astro`: imported by home.
- `maps/MasterLocationMap.astro`: imported by location page.
- `maps/SinglePinMap.astro`: imported by house detail and villa detail.

No `.astro` component under `src/components` appeared completely unused by filename search.

Layout usage:

- `src/layouts/Base.astro` is the active shell. It imports `global.css`, `Header`, and `Footer`, defines SEO/OG/Twitter metadata, font preloads, a mobile booking bar, and a chat placeholder.
- `src/layouts/MagazineLayout.astro` appears unused. It is a complete HTML shell, not a wrapper around `Base`, and includes placeholder font paths and "National Geographic Style" title text. This duplicates layout/head/body responsibility if ever revived.

Duplicated layout responsibility:

- `Base.astro` contains global SEO, navigation, footer, mobile booking, and chat behavior.
- `MagazineLayout.astro` also declares a full HTML document, viewport, title, and global styles, but does not share `Base`. If used, it would bypass the active header/footer/SEO conventions.
- House and villa detail pages implement similar property-detail responsibilities separately: hero, gallery, at-a-glance, Markdown content, amenities, location/map, booking sidebar. The villa route uses `GalleryA` and filesystem hero discovery, while the house route uses `HouseGallery` and `gallery.json` sorting.

## 8. Data and Content Sources

Canonical/current sources:

- `src/inventory/inventory.json`: stated in `CLAUDE.md` as source of truth for sleeps, bedrooms, bathrooms, floors, stairs, pool, view, parking, access notes, constraints, official groups, and suggested pairings. Active pages import it.
- `src/inventory/groups.json`: official group/listing data for houses listing.
- `src/inventory/suggested-pairings.json`: recommendation-only pairings used by house detail route.
- `src/content/houses/*.md`: house narrative content collection, loaded by `src/content.config.ts` and rendered by house detail route.
- `src/content/villa/almond-tree-villa.md`: villa narrative content collection, loaded by `src/content.config.ts` and rendered by villa detail route.
- `src/content/blog/*.md`: blog collection content, loaded by blog routes.
- `src/data/gallery.json`: gallery source for house and villa gallery components and hero image derivation.
- `src/data/locations.ts`: map and location metadata, image URLs, Google Maps URLs, group classification.
- `src/data/siteCopy.json`: site-wide copy, metadata descriptions, booking engine URL, policy/access copy.

Duplicate or legacy sources:

- `src/inventory/inventory copy.json`: likely old inventory backup; not imported.
- `src/data/gallery.json` includes a `dimitra` key and `/images/houses/dimitra/...` paths, while live content has `demetra.md`; inventory search also found `dimitra` in relations/copy. This needs spelling/canonical-slug review.
- `src/guides/Mavrikiano-Guide.md` and `src/guides/Vrouchas-Guide.md` are imported by static guide routes, but area guide editorial rules say area guides should follow the blog editorial system. They currently sit outside `src/content/blog`.
- `docs/research/elounda/blog/*.html` includes design mockups using live-like property data and localhost image URLs. Useful research, but not source of truth.
- Blog style variants `src/content/blog/elounda-guide-style-1.md`, `style-2`, and `style-3` appear as separate live collection entries unless marked draft in frontmatter. They should be checked before production indexing.

Old Airbnb-style copy:

- `.ai/brand/website-brand-style-guide.md`, `.ai/prompts/blog-editorial-system.md`, and `.ai/prompts/website-editorial-system.md` explicitly warn against Airbnb-like language.
- `docs/agent-handoff-notes.md` records that prior `/en/houses/` copy/cards were "Airbnb-style" and used phrases like "Book Now".
- `rg "Airbnb|Booking|Book now|Check dates|Check availability"` found current booking UI text in source plus old/reference material in docs and AI prompt files. Not all matches are defects; the AI/prompt matches are policy text.

## 9. Assets and Media

Active asset flows:

- `public/images/...` is used for direct URL references in `src/data/gallery.json`, `src/data/locations.ts`, blog Markdown frontmatter/body images, house/villa OG images, and home hero CSS background.
- `src/assets/images/...` is used by Astro image optimization through `import.meta.glob('/src/assets/images/**/*.{webp,jpg,jpeg,png}')` in `UnitCard.astro`, `GroupCard.astro`, and `MasterLocationMap.astro`.
- `public/fonts/...` is used by `Base.astro` font preloads and likely by `src/styles/global.css`.
- `public/icons/...` is referenced by `public/site.webmanifest`.
- Favicons and Apple touch icon are referenced by `Base.astro`.

Needs manual confirmation:

- The project has both `public/images` and `src/assets/images` with similar property image trees. This may be intentional: public URLs for galleries and Astro-optimized imports for cards/maps. It still needs clear ownership rules.
- `public/en/images` appears to duplicate image paths for `/en/images`, but active code uses `/images`. `rg '/en/images'` found only docs/research mockups and handoff notes.
- `dimitra` folders exist under both `public/images/houses` and `src/assets/images/houses`. Active content uses `demetra`, but gallery data still contains `dimitra`.
- `public/images/blog` has untracked Spinalonga files and several edited JPGs. They may be intended for upcoming blog content, but current blog frontmatter references `location-map.jpg`, `og-default.jpg`, and specific `.jfif` files under nested blog folders.

Classification:

- Active: `public/images/houses`, `public/images/villa`, `public/images/brand`, `public/images/blog` where referenced by current data/content; `src/assets/images` where consumed by Astro `import.meta.glob`; `public/fonts`; `public/icons`; favicons.
- Suspected legacy: `public/en/images`, `public/images/houses/dimitra`, `src/assets/images/houses/dimitra`, duplicate placeholder files.
- Needs manual confirmation: untracked blog images under `public/images/blog`, `public/images/blog/elounda-salt-pans`, and any image not present in `gallery.json`, `locations.ts`, Markdown frontmatter/body, CSS backgrounds, or Astro image globs.

## 10. AI / Documentation / Prompt Files

Instruction hierarchy observed:

- `CLAUDE.md` is the canonical project instruction file. It defines project type, working rules, build/debug workflow, commit policy, brand voice, house page rules, blog/guide rules, editorial routing, SEO rules, and memory imports.
- `AGENTS.md` is a thin wrapper that says to use `CLAUDE.md` as canonical and points editorial work to `.ai/brand/website-brand-style-guide.md`, `.ai/prompts/website-editorial-system.md`, and `.ai/prompts/blog-editorial-system.md`.
- `.ai/brand/website-brand-style-guide.md` is the shared tone source.
- `.ai/prompts/website-editorial-system.md` is for property pages, homepage sections, collection copy, and property-related location copy.
- `.ai/prompts/blog-editorial-system.md` is for blog posts, area guides, village guides, and broader place-based editorial content.
- `.agents/skills/property-content-audit/SKILL.md` is required by `CLAUDE.md` when auditing or rewriting property pages.

Duplication/conflict:

- `AGENTS.md` duplicates only the high-level editorial routing and correctly points to `CLAUDE.md`; this is acceptable and should remain thin.
- `CLAUDE.md` says not to commit `.claude/`, `CLAUDE.md`, or `.ai/` unless explicitly requested. However `CLAUDE.md` and `.ai/brand`/`.ai/prompts` are currently untracked/dirty and central to workflow. This needs a project decision: either keep them local-only or intentionally track the canonical instruction set.
- `docs/codex-5-3-router.md` overlaps with `CLAUDE.md` routing. It can remain as a helper, but `CLAUDE.md` should stay authoritative.

Recommended clean hierarchy:

1. `CLAUDE.md`: canonical operational and editorial routing.
2. `AGENTS.md`: thin wrapper for agents that do not read `CLAUDE.md` automatically.
3. `.ai/brand/website-brand-style-guide.md`: voice/tone source.
4. `.ai/prompts/website-editorial-system.md`: property/home/collection/location copy workflow.
5. `.ai/prompts/blog-editorial-system.md`: blog, area guide, village guide workflow.
6. `.agents/skills/*`: procedural skills, referenced from canonical instructions.
7. `docs/*`: implementation history, audits, integration notes, research, and plans.

## 11. Imports and Aliases

Configured aliases in `tsconfig.json`:

- `@/*` -> `src/*`
- `@data/*` -> `src/data/*`
- `@components/*` -> `src/components/*`
- `@layouts/*` -> `src/layouts/*`

`astro.config.mjs` does not define additional aliases. It configures Tailwind, sitemap, static output, trailing slash, directory build format, and site URL.

Import pattern issues:

- Active source mostly uses relative imports such as `../../layouts/Base.astro`, `../../../inventory/inventory.json`, and `../types`, despite aliases being configured.
- No `@components`, `@layouts`, or `@data` imports were found in the active import search output.
- The deep page routes (`src/pages/en/houses/[slug].astro`, `src/pages/en/villa/[slug].astro`) use fragile `../../../` paths throughout. Moving routes or folders would require many import updates.
- The villa route imports `node:fs` and `node:path` and reads `public/images/villa/{slug}/2400` at build time. This works for static builds but couples route rendering to filesystem naming and makes the villa hero path less data-driven than the house route.
- `MasterLocationMap.astro` has a likely path mismatch: it builds `propertyFolder = /src/assets/images/${loc.slug}/`, while observed assets are under `src/assets/images/houses/{slug}/` and `src/assets/images/villa/...`. It falls back to `loc.image`, so this may be harmless, but the optimization lookup should be reviewed.

## 12. Main Structural Risks

1. Duplicate data sources can diverge: property facts exist in `inventory.json`, Markdown content, `locations.ts`, `gallery.json`, guide Markdown, and docs/research mockups.
2. Media is split across `public/images`, `public/en/images`, and `src/assets/images`, with both `demetra` and `dimitra` spellings present.
3. Generated/local folders are present in or near source (`src/.astro`, `src/node_modules`, `.agent`, `.claude`, `.codex`, `.superpowers`, `open-design`), making commits and audits noisy.
4. `MagazineLayout.astro` and old mockups can mislead future agents into reviving outdated layout/style patterns.
5. Alias configuration exists but active imports mostly use deep relative paths, making route/component moves fragile.

## 13. Recommended Target Structure

Practical future structure:

```text
src/
|-- pages/
|   |-- en/
|   |   |-- index.astro
|   |   |-- houses/
|   |   |   |-- index.astro
|   |   |   `-- [slug].astro
|   |   |-- villa/
|   |   |   `-- [slug].astro
|   |   |-- guide/
|   |   |   `-- [slug].astro
|   |   |-- about.astro
|   |   |-- contact.astro
|   |   |-- faq.astro
|   |   |-- location.astro
|   |   `-- policies.astro
|   `-- blog/
|       |-- index.astro
|       `-- [...slug].astro
|-- content/
|   |-- blog/
|   |-- guides/
|   |-- houses/
|   `-- villa/
|-- data/
|   |-- siteCopy.json
|   |-- gallery.json
|   `-- locations.ts
|-- inventory/
|   |-- inventory.json
|   |-- groups.json
|   `-- suggested-pairings.json
|-- components/
|   |-- booking/
|   |-- cards/
|   |-- gallery/
|   |-- maps/
|   `-- layout/
|-- layouts/
|   `-- Base.astro
|-- styles/
`-- utils/

public/
|-- fonts/
|-- icons/
`-- images/
    |-- brand/
    |-- blog/
    |-- houses/
    `-- villa/

.ai/
|-- brand/
`-- prompts/

docs/
|-- audits/
|-- integrations/
|-- research/
|-- releases/
`-- handoff/
```

Notes:

- Keep `inventory.json` as the factual property source.
- Move area/village guides into a content collection if they should behave editorially like blog/guide content.
- Keep one public image URL namespace unless there is a documented reason for `/en/images`.
- Keep only one active layout shell unless there is a formal article layout requirement.
- Use aliases consistently after a separate, low-risk import cleanup.

## 14. Safe Next Actions

1. Add a non-destructive "ignore recommendation" issue/list for local folders: `.agent/`, `.claude/`, `.codex/`, `.superpowers/`, `.ai/memory/*.tmp.*`, `src/.astro/`, and `src/node_modules/`.
2. Review `dimitra` vs `demetra` as a spelling/canonical-slug decision before touching media or gallery data.
3. Decide whether `CLAUDE.md`, `.ai/brand`, and `.ai/prompts` are local-only or should be deliberately tracked as project workflow files.
4. Create a media ownership note that explains when to use `public/images` versus `src/assets/images`.
5. Review `MagazineLayout.astro`, `inventory copy.json`, and `public/en/images` with the mentor architect before any deletion or archive move.

## 15. Questions for Mentor Architect

1. Should `/en/` remain the canonical home while `/` is excluded from sitemap, or should `/` redirect explicitly to `/en/`?
2. Is `demetra` the final public slug, and should all remaining `dimitra` data/media/contact options be migrated?
3. Should area guides move from `src/guides/*.md` into an Astro content collection under `src/content/guides`?
4. Should property image handling use `public/images` only, `src/assets/images` only, or a documented hybrid?
5. Should `CLAUDE.md` and `.ai/brand`/`.ai/prompts` be committed as canonical project files despite the current commit-policy warning?
6. Should `MagazineLayout.astro` be removed, or is a future editorial layout planned?
7. Should docs/research HTML mockups stay in this repo, move to an archive, or live in a separate design workspace?
8. Should the TypeScript aliases be adopted consistently, or removed until the project is ready for an import cleanup?
