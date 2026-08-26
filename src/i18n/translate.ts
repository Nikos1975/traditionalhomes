import { defaultLocale, normalizeLocale } from './config';
import aboutEn from './locales/en/about.json';
import commonEn from './locales/en/common.json';
import contactEn from './locales/en/contact.json';
import faqEn from './locales/en/faq.json';
import formsEn from './locales/en/forms.json';
import guideEn from './locales/en/guide.json';
import homeEn from './locales/en/home.json';
import locationEn from './locales/en/location.json';
import navigationEn from './locales/en/navigation.json';
import policiesEn from './locales/en/policies.json';
import propertiesEn from './locales/en/properties.json';
import seoEn from './locales/en/seo.json';
import aboutDe from './locales/de/about.json';
import commonDe from './locales/de/common.json';
import contactDe from './locales/de/contact.json';
import faqDe from './locales/de/faq.json';
import formsDe from './locales/de/forms.json';
import guideDe from './locales/de/guide.json';
import homeDe from './locales/de/home.json';
import seoDe from './locales/de/seo.json';
import locationDe from './locales/de/location.json';
import navigationDe from './locales/de/navigation.json';
import policiesDe from './locales/de/policies.json';
import propertiesDe from './locales/de/properties.json';

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
    about: aboutEn,
    common: commonEn,
    contact: contactEn,
    faq: faqEn,
    navigation: navigationEn,
    forms: formsEn,
    seo: seoEn,
    guide: guideEn,
    policies: policiesEn,
    properties: propertiesEn,
    location: locationEn,
    home: homeEn,
  },
  de: {
    about: aboutDe,
    common: commonDe,
    contact: contactDe,
    faq: faqDe,
    navigation: navigationDe,
    forms: formsDe,
    guide: guideDe,
    policies: policiesDe,
    properties: propertiesDe,
    location: locationDe,
    home: homeDe,
    seo: seoDe,
  },
} as const;

type SourceDictionary = (typeof dictionaries)['en'];
type OverlayLocale = Exclude<keyof typeof dictionaries, 'en'>;

/**
 * An overlay may translate part of a namespace, so every level is optional —
 * a plain `Partial` would only make the top-level namespaces optional.
 */
type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

type DictionaryOverlay = DeepPartial<SourceDictionary>;

const overlayFor = (locale: string): DictionaryOverlay | undefined =>
  dictionaries[locale as OverlayLocale] as DictionaryOverlay | undefined;

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

  const overlay = overlayFor(safeLocale);
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
  const overlay = overlayFor(safeLocale);

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

export function getPropertiesCopy(locale: string | undefined = defaultLocale) {
  return getTranslations(locale).properties;
}

export function getLocationCopy(locale: string | undefined = defaultLocale) {
  return getTranslations(locale).location;
}

export function getHomeCopy(locale: string | undefined = defaultLocale) {
  return getTranslations(locale).home;
}

export function getAboutCopy(locale: string | undefined = defaultLocale) {
  return getTranslations(locale).about;
}

export function getFaqCopy(locale: string | undefined = defaultLocale) {
  return getTranslations(locale).faq;
}

export function getPoliciesCopy(locale: string | undefined = defaultLocale) {
  return getTranslations(locale).policies;
}

export function getContactCopy(locale: string | undefined = defaultLocale) {
  return getTranslations(locale).contact;
}
