---
name: blog-image-pipeline
description: Use when adding, replacing, generating, or documenting blog hero, lead, card, or responsive images for Traditional Homes blog posts. Requires using the repo blog image pipeline, preserving blog routes/status, and updating handoff notes when image conventions change.
---

# Blog Image Pipeline

Use `npm run blog:image` for blog hero, lead, and card image generation.

## Required Workflow

1. Keep blog article text, routes, slugs, draft status, `noindex`, and test variants unchanged unless explicitly requested.
2. Put one source image through the pipeline instead of manually resizing variants.
3. Use JPG/JPEG for normal photo sources. Use PNG only when the source is not a normal photo.
4. Prefer landscape source images at least 2400 px wide.
5. Run:

```bash
npm run blog:image -- --slug <post-slug> --file "<path-to-source-image>" --name <image-name>
```

   If Windows/npm strips option names or prints npm's own help instead of the script help, use the extra `--` fallback:

```bash
npm run blog:image -- -- --slug <post-slug> --file "<path-to-source-image>" --name <image-name>
```

6. Copy the printed `image` and `imageAlt` snippet into content only when explicitly asked to update frontmatter. Do not use `heroImage` unless the site schema/template adds support for it.
7. Write alt and caption manually, factually, and without promotional wording.
8. Do not place backup markdown files inside `src/content/blog/`.
9. Update `docs/agent-handoff-notes.md` when image conventions, generated sizes, source/output directories, or the pipeline command change.

## References

Read `docs/architecture/blog-image-pipeline.md` before changing the pipeline or adding blog image assets.
