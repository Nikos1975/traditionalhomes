import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const blogWidths = [480, 768, 1200, 1600, 2400];
const galleryWidths = [480, 768, 1024, 1600, 2400];

export const blogArticleImageSizes =
  "(min-width: 1056px) 1024px, calc(100vw - 32px)";

/**
 * Sizes for inline body images inside a blog article.
 *
 * Inline images sit in the prose column (`max-w-[46rem]` inside `site-pad`),
 * not the full-bleed lead figure, so they must not reuse
 * `blogArticleImageSizes`. Article Markdown embeds this literal value in raw
 * `<img sizes="...">` attributes; this constant is the canonical source.
 */
export const blogInlineImageSizes =
  "(min-width: 784px) 736px, (min-width: 640px) calc(100vw - 48px), calc(100vw - 32px)";

/**
 * @typedef {object} BlogArticleImageDelivery
 * @property {string} src
 * @property {string} [srcset]
 * @property {number} width
 * @property {number} height
 */

/** @param {string} imageUrl @param {string} publicRoot */
function publicPath(imageUrl, publicRoot) {
  const decodedUrl = decodeURIComponent(imageUrl);
  const segments = decodedUrl.split("/").filter(Boolean);

  if (
    !decodedUrl.startsWith("/") ||
    decodedUrl.includes("\\") ||
    segments.some((segment) => segment === "." || segment === "..")
  ) {
    throw new Error(
      `Blog article image must be a safe root-relative public URL: ${imageUrl}`,
    );
  }

  return path.join(publicRoot, ...segments);
}

/** @param {string} imageUrl */
function responsiveCandidateUrls(imageUrl) {
  if (
    imageUrl.startsWith("/images/houses/") ||
    imageUrl.startsWith("/images/villa/")
  ) {
    const galleryMatch = imageUrl.match(
      /^(.*\/)(480|768|1024|1200|1600|2400)\/(.+)-\2\.webp$/,
    );

    if (!galleryMatch) return [];

    const [, prefix, , name] = galleryMatch;
    return galleryWidths.map(
      (width) => `${prefix}${width}/${name}-${width}.webp`,
    );
  }

  if (!imageUrl.startsWith("/images/blog/")) return [];

  const extension = path.posix.extname(imageUrl);
  const stem = imageUrl
    .slice(0, -extension.length)
    .replace(/-(480|768|1024|1200|1600|2400)$/, "");

  return blogWidths.map((width) => `${stem}-${width}.webp`);
}

/** @param {string | URL} publicRoot */
function resolvePublicRoot(publicRoot) {
  return publicRoot instanceof URL ? fileURLToPath(publicRoot) : publicRoot;
}

/**
 * @param {string} imageUrl
 * @param {string | URL} [publicRoot]
 * @returns {Promise<BlogArticleImageDelivery>}
 */
export async function getBlogArticleImageDelivery(
  imageUrl,
  publicRoot = path.join(process.cwd(), "public"),
) {
  const resolvedPublicRoot = resolvePublicRoot(publicRoot);
  const sourcePath = publicPath(imageUrl, resolvedPublicRoot);
  const sourceMetadata = await sharp(sourcePath).metadata();

  if (!sourceMetadata.width || !sourceMetadata.height) {
    throw new Error(
      `Could not determine blog article image dimensions: ${imageUrl}`,
    );
  }

  const candidateUrls = responsiveCandidateUrls(imageUrl).filter(
    (candidateUrl) =>
      fs.existsSync(publicPath(candidateUrl, resolvedPublicRoot)),
  );

  if (!candidateUrls.includes(imageUrl)) {
    candidateUrls.push(imageUrl);
  }

  const candidates = await Promise.all(
    candidateUrls.map(async (candidateUrl) => {
      const metadata = await sharp(
        publicPath(candidateUrl, resolvedPublicRoot),
      ).metadata();
      return metadata.width
        ? { url: candidateUrl, width: metadata.width }
        : undefined;
    }),
  );
  const uniqueCandidates = [
    ...new Map(
      candidates
        .filter(Boolean)
        .sort((a, b) => a.width - b.width)
        .map((candidate) => [candidate.width, candidate]),
    ).values(),
  ];

  return {
    src: imageUrl,
    ...(uniqueCandidates.length > 1
      ? {
          srcset: uniqueCandidates
            .map((candidate) => `${candidate.url} ${candidate.width}w`)
            .join(", "),
        }
      : {}),
    width: sourceMetadata.width,
    height: sourceMetadata.height,
  };
}
