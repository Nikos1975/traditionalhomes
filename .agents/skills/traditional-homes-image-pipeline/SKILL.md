---
name: traditional-homes-image-pipeline
description: Use when adding, auditing, resizing, compressing, or integrating raster photographs for Traditional Homes: homepage or landing heroes, blog heroes, property cards, galleries, social/Open Graph images, responsive candidates, oversized CSS backgrounds, or image-related LCP/page-weight issues. Do not use for SVGs, logos, illustrations, article writing, unrelated CSS/design work, bulk image migration, or automatic duplicate deletion.
---

# Traditional Homes Image Pipeline

Determine source path, intended role/profile, destination component or page, base name, output directory, crop, alt/decorative status, LCP status, and whether appearance must stay identical. Do not infer this from a filename.

## Preflight

1. Confirm clean named branch and current base; stop for dirty checkout, detached HEAD, or unclear ownership.
2. Read `AGENTS.md`, `CLAUDE.md`, `docs/operations/agent-operating-model.md`, the affected component, and its image documentation. Read `docs/architecture/blog-image-pipeline.md` for blog work.
3. Inventory source/reference dimensions, bytes, crop, semantics, duplicates, and LCP status. Do not delete duplicates without a reference audit.
4. Use a real local `npm ci`; never a shared dependency junction. Keep temporary comparisons outside tracked paths.

## Processing

Run `npm run image:process --` with `--source`, `--profile`, `--name`, and `--output-dir`. Optional flags: `--quality`, `--widths`, `--height`, `--position`, `--dry-run`, `--overwrite`, `--crop-reviewed`. The JSON report includes source/output paths, formats, dimensions, bytes, compression ratios, warnings, and total bytes.

| Profile | Defaults | Rules |
| --- | --- | --- |
| `homepage-hero` | WebP 480, 768, 1024, 1440, 1920, 2400; quality 76 | Retain JPEG fallback; no AVIF by default; browser/LCP validation required. |
| `blog-hero` | WebP 480, 768, 1200, 1600, 2400; quality 84 | Use `npm run blog:image` to preserve existing paths, source copy, CLI and snippet behavior. |
| `property-card`, `gallery` | Quality 76 | Require explicit `--widths` based on rendered measurement; lazy and no preload. |
| `social-image` | Quality 76; `--position center` | Require exactly one `--width`, positive `--height`, and `--crop-reviewed`; uses cover resizing only for this profile. |

The processor corrects orientation; rejects unsupported formats, unsafe paths, silent overwrite, and upscaling; generates and verifies all candidates in a temporary directory on the destination filesystem; checks collisions; then publishes. It never creates source-of-truth copies or deletes duplicates. Review any WebP larger than a practical source/fallback.

For uncertain photography, compare temporary WebP at 72, 76, and 80 for bytes, subject/architecture/shoreline, water/vegetation, sky gradients, blockiness, ringing, and softness. Choose the lowest acceptable quality; delete comparison files. Generate AVIF only by explicit request with measured visual and byte benefit.

## Integration

For LCP heroes, use semantic `picture`/`img`, accurate `srcset`/`sizes`, explicit dimensions, baseline `object-fit`/`object-position`, `loading="eager"`, `fetchpriority="high"`, and `decoding="async"`. Add at most one matching responsive preload. Preserve crop, overlays, contrast, height, and animation; respect `prefers-reduced-motion`.

For noncritical images, default to lazy loading, no preload, explicit dimensions, layout-based `sizes`, and existing meaningful/decorative semantics.

## Browser and validation

Chrome DevTools MCP is required only for LCP-critical hero work. Confirm it is connected, `list_pages` succeeds, and navigation/network/screenshot/performance tools exist. Validate 390 × 844, 1440 × 900, and 1920 × 1080 for selected candidate, one transfer, high priority, no preload duplicate, crop, console, and reduced motion. If MCP is unavailable for noncritical processing, continue automated work and report browser validation pending.

Use dedicated small fixtures only. Cover profiles, names, dimensions, no upscale, formats, paths, dry runs, collision/overwrite, atomic failure, reports, Windows paths, WebP-size warnings, and blog compatibility. Run `node --test`, `npm run build`, `npm run seo:links`, `npm run typecheck`, and `git diff --check`. For Windows EPERM, identify the lock and use isolated cache/output paths; do not alter product code, delete unrelated files, or kill unrelated processes.

Keep the draft PR limited to this skill, tooling, compatibility, tests, and minimal docs. Do not mix migrations, AVIF, duplicate cleanup, logos/SVGs, or redesign. Never merge automatically.
