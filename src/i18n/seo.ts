import { getLocaleMeta, normalizeLocale } from './config';

const siteUrl = 'https://traditional-homes.gr';

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
