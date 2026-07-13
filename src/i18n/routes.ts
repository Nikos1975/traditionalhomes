import { defaultLocale, normalizeLocale, type Locale } from './config';

const stripSlashes = (path: string) => path.replace(/^\/+|\/+$/g, '');

export function localizedPath(locale: string | undefined, path = '/'): string {
  const safeLocale = normalizeLocale(locale);
  const cleanPath = stripSlashes(path);

  return cleanPath ? `/${safeLocale}/${cleanPath}/` : `/${safeLocale}/`;
}

export function housePath(slug: string, locale: Locale = defaultLocale): string {
  return localizedPath(locale, `houses/${slug}`);
}

export function villaPath(slug: string, locale: Locale = defaultLocale): string {
  return localizedPath(locale, `villa/${slug}`);
}

export function guidePath(slug: string, locale: Locale = defaultLocale): string {
  return localizedPath(locale, `guide/${slug}`);
}
