import { getLocaleMeta, isLocale, normalizeLocale, type Locale } from './config';

const siteUrl = 'https://traditional-homes.gr';

export type HreflangAlternate = {
  locale: Locale;
  hreflang: string;
  href: string;
};

export function canonicalUrl(pathname: string): string {
  return new URL(pathname, siteUrl).href;
}

export function getOgLocale(locale: string | undefined): string {
  return getLocaleMeta(normalizeLocale(locale)).ogLocale;
}

export function localizedCanonical(locale: string | undefined, pathname: string): string {
  const safeLocale = normalizeLocale(locale);
  const pathWithSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;

  if (pathWithSlash === `/${safeLocale}`) {
    return canonicalUrl(`/${safeLocale}/`);
  }

  return canonicalUrl(pathWithSlash);
}

export function localizedHreflangAlternates(pathsByLocale: Partial<Record<Locale, string>>): HreflangAlternate[] {
  return Object.entries(pathsByLocale).flatMap(([locale, pathname]) => {
    if (!isLocale(locale) || !pathname) {
      return [];
    }

    const pathWithSlash = pathname.startsWith('/') ? pathname : `/${pathname}`;

    return [
      {
        locale,
        hreflang: getLocaleMeta(locale).lang,
        href: canonicalUrl(pathWithSlash),
      },
    ];
  });
}
