# Validation Baseline

Use the current working branch baseline, not a copied historical result, as the final authority.

For reference, PR #59's German visible-language completion was validated on the workstation with:

- `node --test`: 344/344 pass
- `npm run typecheck`: 3 errors, 0 warnings, 3 hints
- `npm run build`: 41 pages
- `npm run seo:links`: pass
- `git diff --check`: pass

The three known typecheck errors at that point were unrelated to i18n:

1. `src/components/UnitCard.astro` — `InventoryUnit` has no `village` property.
2. `src/components/booking/BookingHandoffForm.astro` — invalid `rel` on a form.
3. `src/pages/en/guide/mavrikiano.astro` — missing required `title` in guide frontmatter typing.

Treat these numbers as a reference implementation snapshot, not permission to ignore new failures. Compare diagnostics before and after the current change.
