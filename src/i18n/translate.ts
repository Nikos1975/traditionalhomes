import { defaultLocale, normalizeLocale } from './config';
import commonEn from './locales/en/common.json';
import formsEn from './locales/en/forms.json';
import navigationEn from './locales/en/navigation.json';
import seoEn from './locales/en/seo.json';

const dictionaries = {
  en: {
    common: commonEn,
    navigation: navigationEn,
    forms: formsEn,
    seo: seoEn,
  },
} as const;

type AvailableLocale = keyof typeof dictionaries;

export function getTranslations(locale: string | undefined = defaultLocale) {
  const safeLocale = normalizeLocale(locale);

  return dictionaries[(safeLocale in dictionaries ? safeLocale : defaultLocale) as AvailableLocale];
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
