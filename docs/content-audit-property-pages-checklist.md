# Content Audit Checklist: House And Villa Pages

Date: 2026-05-21

Scope:

- House pages in `src/content/houses/*.md`
- Villa page in `src/content/villa/*.md`
- Structured facts in `src/inventory/inventory.json`

Audit goal:

- Make every property page factual, clear, bookable, and consistent with the quiet brand voice.
- Keep structured facts in data files and narrative copy in content files.
- Do not invent details. If a detail is not supported by inventory or a reliable source, mark it as `[needs confirmation]`.

## Global Checklist

- [x] Use `src/inventory/inventory.json` as the first source for sleeps, bedrooms, bathrooms, floors, stairs, pool, view, parking, access notes, and constraints.
- [x] Remove placeholders, bracketed copy, draft notes, and conditional text from published pages.
- [x] Check every page for mismatches between narrative copy and inventory facts.
- [x] Replace hype with concrete details. Avoid words such as `perfect`, `idyllic`, `magnificent`, `exclusive`, `sanctuary`, `absolute`, `premium`, and generic luxury phrasing.
- [x] Make each page answer: who it suits, how the layout works, where people sleep, what the outdoor area is like, what the view is, what privacy level to expect, and what access constraints matter.
- [x] Integrate access facts naturally in the page body where useful, not only in badges or bottom notes.
- [x] Keep official groups and suggested pairings separate. Do not imply exclusive inventory unless the data supports it.
- [x] Confirm square-metre claims before keeping them in copy.
- [x] Confirm history claims before keeping them in copy.
- [x] Make SEO titles and descriptions specific to the actual property, not generic destination copy.
- [x] Keep repeated sections useful, but avoid repeating the same phrases across every property page.

## Priority Fixes

- [x] `src/content/villa/almond-tree-villa.md`: remove bracket placeholders such as `[10]`, `[5]`, and the conditional pool note.
- [x] `src/content/villa/almond-tree-villa.md`: replace unsupported luxury language with factual villa details from inventory: sleeps 10, 5 bedrooms, 2 bathrooms, private pool 9 m x 4 m, split-level layout, sea/gulf/garden/pool views, street parking about 30 m away, steps from parking, steep approach road.
- [x] `src/content/houses/demetra.md`: resolve the bedroom mismatch. Inventory says 1 bedroom; page copy says 2 bedrooms.
- [x] All property pages: confirm or remove square-metre values unless a reliable source is available.
- [x] All property pages: confirm or soften historical claims before publishing stronger statements.

## Per-Property Checklist

### Argyro

- [x] Confirm `85 square metres` or remove it.
- [x] Confirm `built in 1905` or soften the claim.
- [x] Keep sea-view veranda and two-floor layout.
- [x] Make internal stairs and non-step-free access visible in the copy.
- [x] Reduce repeated phrases about waterfront tavernas, pristine beaches, and effortless access.

### Leonidas

- [x] Confirm `50 sqm` or remove it.
- [x] Keep sleeps 3, 1 bedroom, 1 bathroom, 2 floors, internal stairs, and sea view consistent with inventory.
- [x] Explain that it suits a couple or small party better than broad family/group wording.
- [x] Make parking about 70 m away and non-step-free access clear.

### Margarita

- [x] Confirm `120 sqm` and `35 sqm veranda` or remove them.
- [x] Keep sleeps 6, 2 bedrooms, 1 bathroom, 2 floors, sea-view veranda, internal stairs.
- [x] Make the bathroom-through-courtyard constraint clear in practical language.
- [x] Avoid implying more privacy or exclusivity than the inventory supports.

### Demetra

- [x] Resolve the inventory/content mismatch: inventory says 1 bedroom; copy says 2 bedrooms.
- [x] Keep shared pool with House Penelope clearly stated.
- [x] Clarify who it suits once the bedroom count is corrected.
- [x] Keep mountain view and single-floor layout.
- [x] Make non-step-free access visible.

### Penelope

- [x] Confirm `70 sqm` or remove it.
- [x] Keep sleeps 6, 2 bedrooms, 1 bathroom, 2 floors, shared pool with Demetra, and mountain/olive grove view.
- [x] Make pool sharing explicit and avoid private-pool wording.
- [x] Include internal stairs and non-step-free access.

### Erato

- [x] Confirm `60 sqm` or remove it.
- [x] Keep private pool, sleeps 4, 1 bedroom, 1 bathroom, 2 floors, and mountain/olive grove view.
- [x] Explain the entrance reached by stairs down.
- [x] Avoid broad luxury language; focus on private pool, terrace, and layout.

### Clio

- [x] Confirm `60 sqm` or remove it.
- [x] Confirm the ancient-church site claim before keeping it.
- [x] Keep first-floor position above Erato and internal stairs.
- [x] Clarify that it has no private pool.
- [x] Make non-step-free access clear.

### Efterpi

- [x] Confirm `65 sqm` or remove it.
- [x] Confirm the 15th-century church and artifact claims before keeping them.
- [x] Keep sleeps 5, loft access by staircase, courtyard/village view, and parking about 50 m away.
- [x] Explain the loft constraint in plain guest-facing language.

### Kalliopi

- [x] Confirm `60 sqm` or remove it.
- [x] Keep upper-floor position above Efterpi, sleeps 4, 1 bedroom, 1 bathroom, and mountain view.
- [x] Make stairs and non-step-free access clear.
- [x] Distinguish this page from Efterpi so the two houses do not read the same.

### Monastiri

- [x] Confirm `120 sqm` or remove it.
- [x] Confirm historical reconstruction claims and the Prophet Elias Monastery reference before keeping them.
- [x] Keep sleeps 6, 3 bedrooms, 2 bathrooms, private dipping pool, sea view, multi-level layout, and internal stairs.
- [x] Explain that the pool is a dipping pool, not a full swimming pool.
- [x] Avoid overstating exclusivity.

### Almond Tree Villa

- [x] Remove all placeholders and conditional copy.
- [x] Replace generic luxury phrasing with concrete villa details.
- [x] Keep sleeps 10, 5 bedrooms, 2 bathrooms, private pool 9 m x 4 m, split-level layout, and panoramic views.
- [x] Make steps from parking and steep approach road clear.
- [x] Clarify who it suits: larger families or groups who need one private villa, not village-house pairings.
- [x] Check the booking CTA and SEO description after the rewrite so it matches the villa page, not the house pages.

## Rewrite Order

- [x] Fix factual blockers first: villa placeholders and Demetra bedroom mismatch.
- [x] Then remove unsupported or unconfirmed claims.
- [x] Then tighten each page for clarity, access, and who-it-suits.
- [x] Finally review SEO titles, descriptions, and repeated phrasing across the full collection.
