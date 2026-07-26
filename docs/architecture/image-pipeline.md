# Image Processing Pipeline

Use `npm run image:process --` for new non-blog raster processing. Required arguments: `--source`, `--profile`, `--name`, `--output-dir`. Optional: `--quality`, `--widths`, `--height`, `--position`, `--dry-run`, `--overwrite`, `--crop-reviewed`.

```powershell
npm run image:process -- -- --source "C:\photos\coast.jpg" --profile homepage-hero --name coast --output-dir public\images\brand
```

The command emits JSON with dimensions, bytes, compression ratios, warnings, and total output bytes. It corrects orientation, refuses upscaling and unsafe paths, generates on the destination filesystem, verifies candidates, and refuses collisions unless overwrite is explicit.

- `homepage-hero`: 480, 768, 1024, 1440, 1920, 2400 at quality 76.
- `blog-hero`: 480, 768, 1200, 1600, 2400 at quality 84.
- `property-card` and `gallery`: quality 76; explicit widths required pending measurement.
- `social-image`: quality 76; exactly one explicit width, `--height`, and `--crop-reviewed` required. It uses `fit: cover` with a Sharp-supported `--position` (default `center`) and reports the exact output dimensions.

`npm run blog:image` remains the compatibility command; see [blog-image-pipeline.md](blog-image-pipeline.md). The full workflow lives in `.agents/skills/traditional-homes-image-pipeline/SKILL.md`.

On npm versions that forward named arguments normally, one separator may be sufficient. Use the extra `--` form above on Windows when npm strips argument names.
