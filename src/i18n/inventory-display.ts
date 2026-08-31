import { defaultLocale, type Locale } from './config';
import unitsDe from './locales/de/inventory-display.json';
import galleryTokensDe from './locales/de/gallery-tokens.json';

/**
 * Localized *presentation* of descriptive data that lives outside the locale
 * resources.
 *
 * `src/inventory/inventory.json` and `src/data/locations.ts` remain the single
 * factual source: they own every number, enum, slug, coordinate and boolean.
 * This module owns nothing factual. It only says how one locale renders a
 * descriptive sentence that the factual source stores in English, keyed by the
 * stable slug or id of the thing being described.
 *
 * Rules:
 * - The default locale always renders the factual source verbatim, so English
 *   output can never drift.
 * - Any other locale renders its mapped presentation, or falls back to the
 *   factual source when nothing is mapped.
 * - A mapping must preserve factual meaning. `tests/i18n-german-visible-language.test.mjs`
 *   asserts that every number in a German mapping also appears in the English
 *   source it presents.
 * - This is not a second inventory. Adding a property here without adding it to
 *   the factual source does nothing.
 */

type UnitPresentation = {
  name?: string;
  view?: string;
  parking?: string;
  pets?: string;
  accessDetail?: string;
  poolNotes?: string;
  kitchen?: string;
  amenities?: string[];
  hardConstraints?: string[];
};

type LocationPresentation = {
  title?: string;
  distanceTag?: string;
};

type LocalePresentation = {
  units?: Record<string, UnitPresentation>;
  locations?: Record<string, LocationPresentation>;
  /**
   * Map-marker descriptions keyed by their English source string, for values the
   * factual source repeats across many ids (every Mavrikiano house shares one
   * walking-distance line).
   */
  locationPhrases?: Record<string, string>;
  /** Editorial one-liners keyed by their English source sentence. */
  pairings?: Record<string, string>;
};

const presentation: Partial<Record<Locale, LocalePresentation>> = {
  de: unitsDe as LocalePresentation,
};

const parkingDistance = (factual: string | null | undefined): string | undefined =>
  factual?.match(/~?\d+(?:[.,]\d+)?\s*m\b/i)?.[0];

/**
 * Render the one supported factual token in a localized parking presentation.
 * A locale mapping may choose the surrounding German wording, but any distance
 * stays in inventory. If inventory does not supply the requested token, retain
 * its factual parking value rather than rendering a stale localized sentence.
 */
export function localizeParking(
  mapping: string | undefined,
  factual: string | null | undefined,
): string | null | undefined {
  if (!mapping) return factual;
  if (!mapping.includes('{distance}')) return mapping;

  const distance = parkingDistance(factual);
  return distance ? mapping.replaceAll('{distance}', distance) : factual;
}

/** Descriptive unit field as the locale renders it. */
export function unitText(
  locale: Locale,
  slug: string,
  field: keyof Pick<UnitPresentation, 'name' | 'view' | 'parking' | 'pets' | 'accessDetail' | 'poolNotes' | 'kitchen'>,
  factual: string | null | undefined,
): string | null | undefined {
  if (locale === defaultLocale) {
    return factual;
  }

  const mapped = presentation[locale]?.units?.[slug]?.[field];

  return field === 'parking' ? localizeParking(mapped, factual) : mapped ?? factual;
}

/** Descriptive unit list as the locale renders it, entry for entry. */
export function unitList(
  locale: Locale,
  slug: string,
  field: keyof Pick<UnitPresentation, 'amenities' | 'hardConstraints'>,
  factual: readonly string[],
): readonly string[] {
  if (locale === defaultLocale) {
    return factual;
  }

  const mapped = presentation[locale]?.units?.[slug]?.[field];

  return mapped && mapped.length === factual.length ? mapped : factual;
}

/**
 * Descriptive map-marker field as the locale renders it. An id-specific mapping
 * wins; otherwise a shared phrase mapping for the exact English source string is
 * used, so a line the factual source repeats is translated once.
 */
export function locationText(
  locale: Locale,
  id: string,
  field: keyof LocationPresentation,
  factual: string | null | undefined,
): string | null | undefined {
  if (locale === defaultLocale) {
    return factual;
  }

  const mapping = presentation[locale];
  const byId = mapping?.locations?.[id]?.[field];

  if (byId) {
    return byId;
  }

  return (factual ? mapping?.locationPhrases?.[factual] : undefined) ?? factual;
}

/**
 * Localized display name for a unit. The inventory name stays authoritative:
 * only the common-noun prefix differs ("House Argyro" / "Haus Argyro"), never
 * the proper name.
 */
export function unitName(locale: Locale, slug: string, factual: string): string {
  return unitText(locale, slug, 'name', factual) ?? factual;
}

/** Editorial pairing summary as the locale renders it. */
export function pairingText(locale: Locale, factual: string): string {
  if (locale === defaultLocale) {
    return factual;
  }

  return presentation[locale]?.pairings?.[factual] ?? factual;
}

type GalleryTokens = {
  phrases: Record<string, string>;
  tokens: Record<string, string>;
};

const galleryTokens: Partial<Record<Locale, GalleryTokens>> = {
  de: galleryTokensDe as GalleryTokens,
};

/**
 * Localize a gallery label that was derived from an image filename.
 *
 * Image filenames are English descriptive tokens (`argyro-master-bedroom-01`).
 * Rather than translating every image caption per property, a locale maps the
 * shared vocabulary once: a phrase table for word orders that differ, then a
 * token table for everything else. Anything unmapped keeps its English token,
 * so a new filename degrades to a readable label instead of an empty one.
 */
export function localizeGalleryLabel(locale: Locale, label: string): string {
  const dictionary = galleryTokens[locale];

  if (locale === defaultLocale || !dictionary || !label) {
    return label;
  }

  const normalized = label.toLowerCase().trim();
  const numberSuffix = normalized.match(/\s(\d+)$/)?.[1];
  const withoutNumber = numberSuffix ? normalized.replace(/\s\d+$/, '') : normalized;

  const phrase = dictionary.phrases[withoutNumber];
  const translated =
    phrase ??
    withoutNumber
      .split(' ')
      .filter(Boolean)
      .map((token) => dictionary.tokens[token] ?? token)
      .join(' ');

  return numberSuffix ? `${translated} ${numberSuffix}` : translated;
}
