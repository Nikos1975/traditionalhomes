import { defaultLocale, normalizeLocale } from './config';
import commonEn from './locales/en/common.json';
import formsEn from './locales/en/forms.json';
import guideEn from './locales/en/guide.json';
import navigationEn from './locales/en/navigation.json';
import seoEn from './locales/en/seo.json';
import commonDe from './locales/de/common.json';
import formsDe from './locales/de/forms.json';
import guideDe from './locales/de/guide.json';
import navigationDe from './locales/de/navigation.json';

/**
 * English is the complete source dictionary. Every other locale is a partial
 * overlay: it lists only the strings that locale has really translated.
 *
 * Missing keys resolve to the English source through `mergeDictionary` below.
 * That fallback is deliberate and documented, not accidental — see
 * `docs/i18n/03_TRANSLATION_STATUS.md` for what each locale actually covers.
 */
const dictionaries = {
  en: {
    common: commonEn,
    navigation: navigationEn,
    forms: formsEn,
    seo: seoEn,
    guide: guideEn,
  },
  de: {
    common: commonDe,
    navigation: navigationDe,
    forms: formsDe,
    guide: guideDe,
  },
} as const;

type SourceDictionary = (typeof dictionaries)['en'];
type OverlayLocale = Exclude<keyof typeof dictionaries, 'en'>;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Recursively overlay a partial translation onto the English source.
 *
 * - Objects merge key by key, so a locale can translate part of a namespace.
 * - Arrays and primitives are replaced wholesale, so a partially translated
 *   list can never be spliced together into a half-English list.
 * - Anything the overlay omits keeps its English value.
 */
function mergeDictionary<T>(source: T, overlay: unknown): T {
  if (overlay === undefined) {
    return source;
  }

  if (!isPlainObject(source) || !isPlainObject(overlay)) {
    return overlay as T;
  }

  const merged: Record<string, unknown> = { ...source };

  for (const [key, value] of Object.entries(overlay)) {
    merged[key] = key in source ? mergeDictionary(source[key], value) : value;
  }

  return merged as T;
}

const resolvedDictionaries = new Map<string, SourceDictionary>([['en', dictionaries.en]]);

export function getTranslations(locale: string | undefined = defaultLocale): SourceDictionary {
  const safeLocale = normalizeLocale(locale);
  const cached = resolvedDictionaries.get(safeLocale);

  if (cached) {
    return cached;
  }

  const overlay = dictionaries[safeLocale as OverlayLocale] as Partial<SourceDictionary> | undefined;
  const resolved = overlay ? mergeDictionary(dictionaries.en, overlay) : dictionaries.en;

  resolvedDictionaries.set(safeLocale, resolved);

  return resolved;
}

/**
 * True when the locale ships its own translations for a namespace. Used to keep
 * fallback behaviour visible to callers instead of silent.
 */
export function hasTranslations(locale: string | undefined, namespace: keyof SourceDictionary): boolean {
  const safeLocale = normalizeLocale(locale);
  const overlay = dictionaries[safeLocale as OverlayLocale] as Partial<SourceDictionary> | undefined;

  return safeLocale === defaultLocale || Boolean(overlay && namespace in overlay);
}

export function getCommonCopy(locale: string | undefined = defaultLocale) {
  return getTranslations(locale).common;
}

export function getNavigationCopy(locale: string | undefined = defaultLocale) {
  return getTranslations(locale).navigation;
}

export function getFormsCopy(locale: string | undefined = defaultLocale) {
  return getTranslations(locale).forms;
}

export function getSeoCopy(locale: string | undefined = defaultLocale) {
  return getTranslations(locale).seo;
}

export function getGuideCopy(locale: string | undefined = defaultLocale) {
  return getTranslations(locale).guide;
}
