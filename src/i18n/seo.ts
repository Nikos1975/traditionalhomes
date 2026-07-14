import { getLocaleMeta, isLocale, normalizeLocale, type Locale } from './config';
import { getSeoCopy } from './translate';

const siteUrl = 'https://traditional-homes.gr';

export type PageSeoKey = keyof ReturnType<typeof getSeoCopy>['pages'];

export type PageSeoMeta = {
  title: string;
  description: string;
};

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

export function getPageSeo(locale: string | undefined, page: PageSeoKey): PageSeoMeta {
  return getSeoCopy(locale).pages[page];
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
