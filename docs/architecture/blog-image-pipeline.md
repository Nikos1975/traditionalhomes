# Blog Image Pipeline

Use `scripts/process-blog-image.mjs` to turn one source image into the responsive WebP files used by blog hero, lead, and card images.

## Source Images

- JPG/JPEG is preferred for normal photos.
- PNG is allowed only when the source is not a normal photo.
- Recommended minimum width: 2400 px.
- Landscape images are preferred for blog hero images.

Place source originals through the script, not by hand:

```text
src/assets/blog-source/{post-slug}/{image-name}.{ext}
```

Do not place backup markdown copies in `src/content/blog/`; Astro will treat them as public content routes.

## Generated Images

The script writes WebP files only:

```text
public/images/blog/{post-slug}/{image-name}-480.webp
public/images/blog/{post-slug}/{image-name}-768.webp
public/images/blog/{post-slug}/{image-name}-1200.webp
public/images/blog/{post-slug}/{image-name}-1600.webp
public/images/blog/{post-slug}/{image-name}-2400.webp
```

Generated files are stripped of metadata/EXIF by the Sharp output pipeline. The script does not upscale above the source width, so smaller sources generate only the widths that fit.

## Command

Preferred command:

```bash
npm run blog:image -- --slug elounda-wartime-memory --file "C:\path\to\photo.jpg" --name hero
```

On Windows/npm versions that strip option names after a single separator, or when `npm run blog:image -- --help` prints npm's own help, use the extra `--` fallback:

```bash
npm run blog:image -- -- --slug elounda-wartime-memory --file "C:\path\to\photo.jpg" --name hero
```

The script:

- validates the blog slug against `src/content/blog/*.md` when possible;
- accepts the current mixed-case blog id if the existing content filename matches;
- copies the source into `src/assets/blog-source/{post-slug}/`;
- writes WebP sizes into `public/images/blog/{post-slug}/`;
- warns when the source is narrower than 2400 px;
- warns when the source is portrait or too narrow for a hero;
- refuses to overwrite existing files;
- prints a frontmatter-ready snippet using the current blog schema:

```yaml
image: /images/blog/{post-slug}/{image-name}-1600.webp
imageAlt: ""
```

## Alt And Caption

Write `alt` and `caption` manually. Keep both factual and specific. Do not use promotional language, unsupported claims, or generic travel wording.
