export const defaultLocale = 'en';

export const supportedLocales = ['en', 'de', 'fr', 'ru', 'zh', 'ar'] as const;

export type Locale = (typeof supportedLocales)[number];
export type TextDirection = 'ltr' | 'rtl';

export const prefixDefaultLocale = true;

export const localeMeta: Record<
  Locale,
  {
    label: string;
    nativeLabel: string;
    lang: string;
    dir: TextDirection;
    ogLocale: string;
  }
> = {
  en: {
    label: 'English',
    nativeLabel: 'English',
    lang: 'en',
    dir: 'ltr',
    ogLocale: 'en_GB',
  },
  de: {
    label: 'German',
    nativeLabel: 'Deutsch',
    lang: 'de',
    dir: 'ltr',
    ogLocale: 'de_DE',
  },
  fr: {
    label: 'French',
    nativeLabel: 'Français',
    lang: 'fr',
    dir: 'ltr',
    ogLocale: 'fr_FR',
  },
  ru: {
    label: 'Russian',
    nativeLabel: 'Русский',
    lang: 'ru',
    dir: 'ltr',
    ogLocale: 'ru_RU',
  },
  zh: {
    label: 'Simplified Chinese',
    nativeLabel: '简体中文',
    lang: 'zh-CN',
    dir: 'ltr',
    ogLocale: 'zh_CN',
  },
  ar: {
    label: 'Arabic',
    nativeLabel: 'العربية',
    lang: 'ar',
    dir: 'rtl',
    ogLocale: 'ar_AR',
  },
};

export function isLocale(value: string): value is Locale {
  return supportedLocales.includes(value as Locale);
}

export function normalizeLocale(value: string | undefined): Locale {
  return value && isLocale(value) ? value : defaultLocale;
}

export function getLocaleMeta(value: string | undefined) {
  return localeMeta[normalizeLocale(value)];
}
