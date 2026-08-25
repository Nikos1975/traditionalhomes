import { defaultLocale, getLocaleMeta, supportedLocales, type Locale } from './config';
import { resolveRoute, routeMap, routePath, type RouteDefinition, type RouteId } from './route-map';

export type LanguageSwitchLink = {
  locale: Locale;
  label: string;
  shortLabel: string;
  href: string;
  hreflang: string;
  isActive: boolean;
  isFallbackToHome: boolean;
};

type LocalizedRouteMatch = {
  locale: Locale;
  routeId: RouteId;
  contentId?: string;
};

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '');

/**
 * Reverse-match one real localized URL to its locale-independent route id.
 * Unknown or undeclared locale URLs return null rather than being guessed.
 */
export function matchLocalizedPath(path: string): LocalizedRouteMatch | null {
  const pathname = path.split('#')[0].split('?')[0];
  const parts = trimSlashes(pathname).split('/').filter(Boolean);
  const locale = supportedLocales.find((candidate) => candidate === parts[0]);

  if (!locale) {
    return null;
  }

  const routeParts = parts.slice(1);
  const definitions = Object.entries(routeMap) as [RouteId, RouteDefinition][];
  const candidates = definitions
    .flatMap(([routeId, definition]) => {
      const segments = definition.segments[locale];
      return segments ? [{ routeId, definition, segments }] : [];
    })
    .sort((a, b) => b.segments.length - a.segments.length);

  for (const { routeId, definition, segments } of candidates) {
    const matchesPrefix = segments.every((segment, index) => routeParts[index] === segment);
    if (!matchesPrefix) continue;

    const rest = routeParts.slice(segments.length);

    if (!definition.dynamic && rest.length === 0) {
      return { locale, routeId };
    }

    if (!definition.dynamic || rest.length !== 1) {
      continue;
    }

    const contentId = Object.entries(definition.content ?? {}).find(([, slugs]) => slugs[locale] === rest[0])?.[0];

    if (contentId) {
      return { locale, routeId, contentId };
    }

    // English is the complete source locale, so dynamic English content that
    // is not explicitly listed in the map still uses its public slug as id.
    if (locale === defaultLocale) {
      return { locale, routeId, contentId: rest[0] };
    }
  }

  return null;
}

/**
 * Build the visible language choices for the current page.
 *
 * A locale is visible only after its real homepage exists in routeMap. When the
 * current page has an equivalent route in the target locale, link to it;
 * otherwise fall back to that locale's real homepage. No locale URL is ever
 * fabricated.
 */
export function getLanguageSwitcherLinks(currentLocale: Locale, currentPath: string): LanguageSwitchLink[] {
  const currentRoute = matchLocalizedPath(currentPath);
  const launchedLocales = supportedLocales.filter((locale) => resolveRoute(locale, 'home') !== null);

  return launchedLocales.map((targetLocale) => {
    const equivalent = currentRoute
      ? resolveRoute(targetLocale, currentRoute.routeId, currentRoute.contentId)
      : null;
    const href = equivalent ?? routePath(targetLocale, 'home');
    const meta = getLocaleMeta(targetLocale);

    return {
      locale: targetLocale,
      label: meta.nativeLabel,
      shortLabel: targetLocale.toUpperCase(),
      href,
      hreflang: meta.lang,
      isActive: targetLocale === currentLocale,
      isFallbackToHome: equivalent === null,
    };
  });
}
