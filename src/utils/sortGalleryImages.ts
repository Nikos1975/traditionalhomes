import type { GalleryImage } from '../types';

/**
 * Canonical tag order for gallery display.
 * Images with earlier tags appear first.
 * Untagged images fall to the end.
 */
const TAG_ORDER: string[] = [
  'exterior',
  'veranda',
  'outdoor',
  'living',
  'bedroom',
  'bathroom',
  'kitchen',
  'detail',
];

function tagScore(tags: string[] = []): number {
  if (tags.length === 0) return TAG_ORDER.length;
  return Math.min(...tags.map((t) => {
    const i = TAG_ORDER.indexOf(t.toLowerCase());
    return i === -1 ? TAG_ORDER.length : i;
  }));
}

/**
 * Sort gallery images by canonical tag order.
 * Featured images always come first, in their original order.
 */
export function sortGalleryImages(images: GalleryImage[]): GalleryImage[] {
  const featured = images.filter((img) => img.isFeatured);
  const rest = images
    .filter((img) => !img.isFeatured)
    .sort((a, b) => tagScore(a.tags) - tagScore(b.tags));
  return [...featured, ...rest];
}
