import { defaultLocale, type Locale } from '../i18n/config';
import { localizeGalleryLabel } from '../i18n/inventory-display';
import { getCommonCopy } from '../i18n/translate';
import type { GalleryImage } from '../types';

export interface GalleryItem {
  src: string;
  srcset: string;
  alt: string;
  label: string;
}
/**
 * Extract the first (smallest) URL from a srcset string.
 *
 * gallery.json srcset format:
 *   "/images/.../480/foo-480.webp 480w, /images/.../768/foo-768.webp 768w, ..."
 *
 * Used to derive a low-resolution blur placeholder without
 * hardcoding path conventions.
 */
export function placeholderSrc(srcset: string): string {
  const first = srcset.split(",")[0]?.trim();
  return first ? first.split(/\s+/)[0] : "";
}

const propertySlugTokens = [
  "almond-tree-villa",
  "margarita",
  "leonidas",
  "demetra",
  "argyro",
  "erato",
  "clio",
  "efterpi",
  "kalliopi",
  "penelope",
  "monastiri",
];

const technicalTokens = new Set([
  "hero",
  "320",
  "480",
  "513",
  "684",
  "706",
  "768",
  "1024",
  "1068",
  "1600",
  "2400",
]);

function sentenceCase(label: string): string {
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : "";
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function reorderViewPhrase(tokens: string[]): string[] {
  const lastThree = tokens.slice(-3).join("-");
  if (lastThree === "terrace-sea-view")
    return ["sea-view", ...tokens.slice(0, -3), "terrace"];
  if (lastThree === "veranda-sea-view")
    return ["sea-view", ...tokens.slice(0, -3), "veranda"];
  if (lastThree === "balcony-sea-view")
    return ["sea-view", ...tokens.slice(0, -3), "balcony"];
  if (tokens.join("-") === "view-sea") return ["sea", "view"];
  return tokens;
}

export function filenameLabel(src: string, fallback = "Photo", locale: Locale = defaultLocale): string {
  const filePath = safeDecode(src.split(/[?#]/)[0] ?? "");
  const fileName = filePath.split("/").pop() ?? "";
  const baseName = fileName.replace(/\.[^.]+$/, "");
  let normalized = baseName
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  propertySlugTokens.forEach((slug) => {
    normalized = normalized
      .replace(new RegExp(`(^|-)${slug}(?=-|$)`, "g"), "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  });

  const tokens = reorderViewPhrase(
    normalized
      .split("-")
      .filter(Boolean)
      .map((token) => (token === "siiting" ? "sitting" : token))
      .map((token) => (token === "dinning" ? "dining" : token))
      .filter((token) => !technicalTokens.has(token))
      .filter((token) => !/^\d+$/.test(token)),
  );

  const label = tokens
    .join(" ")
    .replace(/\bbbq\b/g, "barbecue")
    .replace(/\bview sea\b/g, "sea view")
    .replace(/\bsea view\b/g, "sea-view")
    .trim();
  return sentenceCase(localizeGalleryLabel(locale, label || fallback));
}

/**
 * Image alt text for the active locale.
 *
 * An authored alt is the English master and is rendered verbatim in the default
 * locale. Another locale renders the same picture through the shared gallery
 * vocabulary, so a German page never falls back to an English caption.
 * When no alt exists at all, the caller's already-localized fallback is used.
 */
export function localizedAlt(
  src: string,
  alt: string | undefined,
  fallback: string,
  locale: Locale = defaultLocale,
): string {
  if (!alt) {
    return fallback;
  }

  return locale === defaultLocale ? alt : filenameLabel(src, alt, locale);
}

/**
 * Build the single localized representation shared by property photo UIs.
 * Gallery data remains the source for URLs and authored English alt text;
 * non-default locales reuse the existing filename-token translation pipeline.
 */
export function buildGalleryItems(
  images: GalleryImage[],
  unitName: string,
  locale: Locale = defaultLocale,
): GalleryItem[] {
  const galleryCopy = getCommonCopy(locale).ui.gallery;

  return images.map((img, index) => {
    const photoNumber = index + 1;
    const numberedPhoto = galleryCopy.photoNumbered.replace('{n}', String(photoNumber));
    const photoFallback = galleryCopy.photoOfNumbered
      .replace('{name}', unitName)
      .replace('{n}', String(photoNumber));

    return {
      src: img.src,
      srcset: img.srcset ?? '',
      alt: localizedAlt(img.src, img.alt, photoFallback, locale),
      label: filenameLabel(img.src, img.alt ?? numberedPhoto, locale),
    };
  });
}
