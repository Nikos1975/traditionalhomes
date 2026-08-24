import { defaultLocale, normalizeLocale, type Locale } from './config';
import { resolveLocalizedLink } from './route-map';

const stripSlashes = (path: string) => path.replace(/^\/+|\/+$/g, '');

/**
 * Low-level locale path primitive.
 *
 * This joins a locale root and already-resolved public segments. It does not
 * know which routes exist, so it must not be used to build a link to a
 * translated page — `src/i18n/route-map.ts` is the source of truth for that,
 * and the helpers below resolve through it.
 */
export function localizedPath(locale: string | undefined, path = '/'): string {
  const safeLocale = normalizeLocale(locale);
  const cleanPath = stripSlashes(path);

  return cleanPath ? `/${safeLocale}/${cleanPath}/` : `/${safeLocale}/`;
}

/**
 * Route-map-backed helpers.
 *
 * Each takes an internal content id, never a public slug, and returns the
 * public URL for the requested locale. When the locale has no such page the
 * helper returns the default-locale URL rather than inventing one.
 */
export function housePath(slug: string, locale: Locale): string {
  return resolveLocalizedLink(locale, 'house', slug).href;
}

export function villaPath(slug: string, locale: Locale): string {
  return resolveLocalizedLink(locale, 'villa', slug).href;
}

export function guidePath(slug: string, locale: Locale = defaultLocale): string {
  return resolveLocalizedLink(locale, 'guide', slug).href;
}

export function blogIndexPath(locale: Locale): string {
  return resolveLocalizedLink(locale, 'blog').href;
}

export function blogArticlePath(slug: string, locale: Locale): string {
  return resolveLocalizedLink(locale, 'blogArticle', slug).href;
}
