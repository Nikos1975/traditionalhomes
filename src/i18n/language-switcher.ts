import { defaultLocale, getLocaleMeta, supportedLocales, type Locale } from './config';
import { resolveRoute, routeMap, routePath, type RouteDefinition, type RouteId, type RouteMap } from './route-map';

export type LanguageSwitchLink = {
  locale: Locale;
  label: string;
  shortLabel: string;
  href: string;
  hreflang: string;
  isActive: boolean;
  /** Which tier of the fallback hierarchy produced `href`. */
  fallback: 'none' | 'parent' | 'home';
  isFallbackToHome: boolean;
};

type LocalizedRouteMatch = {
  locale: Locale;
  routeId: RouteId;
  contentId?: string;
};

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '');

/**
 * Where a locale lands when it has no equivalent for a deep page.
 *
 * Declared per route, never inferred from a URL: a property detail belongs to
 * the collection that lists it, so a reader switching language arrives at the
 * real localized collection rather than being dropped on the homepage. A route
 * with no declared parent, or whose parent the target locale does not own,
 * falls through to that locale's homepage.
 */
const ROUTE_PARENTS: Partial<Record<RouteId, RouteId>> = {
  house: 'houses',
  villa: 'houses',
  blogArticle: 'blog',
};

/**
 * Reverse-match one real localized URL to its locale-independent route id.
 * Unknown or undeclared locale URLs return null rather than being guessed.
 */
export function matchLocalizedPath(path: string, map: RouteMap = routeMap): LocalizedRouteMatch | null {
  const pathname = path.split('#')[0].split('?')[0];
  const parts = trimSlashes(pathname).split('/').filter(Boolean);
  const locale = supportedLocales.find((candidate) => candidate === parts[0]);

  if (!locale) {
    return null;
  }

  const routeParts = parts.slice(1);
  const definitions = Object.entries(map) as [RouteId, RouteDefinition][];
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
 * A locale is visible only after its real homepage exists in routeMap. The
 * target URL is chosen by descending a fallback hierarchy:
 *
 *   1. the equivalent page in the target locale, when it really exists;
 *   2. otherwise the nearest declared parent that locale really owns
 *      (`/en/houses/monastiri/` → `/de/ferienhaeuser/`);
 *   3. otherwise that locale's homepage.
 *
 * Every candidate comes from `resolveRoute`, which returns null rather than
 * guessing, so no locale URL is ever fabricated. A path segment is never
 * translated or swapped: `/de/houses/monastiri/` cannot be produced by any
 * branch of this function.
 *
 * `map` defaults to the real route map and exists so the parent and homepage
 * tiers stay under deterministic test coverage even when every real page has a
 * translation, exactly as `resolveRoute` and its siblings already allow.
 */
export function getLanguageSwitcherLinks(
  currentLocale: Locale,
  currentPath: string,
  map: RouteMap = routeMap,
): LanguageSwitchLink[] {
  const currentRoute = matchLocalizedPath(currentPath, map);
  const launchedLocales = supportedLocales.filter((locale) => resolveRoute(locale, 'home', undefined, map) !== null);

  return launchedLocales.map((targetLocale) => {
    const equivalent = currentRoute
      ? resolveRoute(targetLocale, currentRoute.routeId, currentRoute.contentId, map)
      : null;
    const parentId = currentRoute ? ROUTE_PARENTS[currentRoute.routeId] : undefined;
    const parent = equivalent || !parentId ? null : resolveRoute(targetLocale, parentId, undefined, map);
    const href = equivalent ?? parent ?? routePath(targetLocale, 'home', undefined, map);
    const meta = getLocaleMeta(targetLocale);
    const fallback = equivalent ? 'none' : parent ? 'parent' : 'home';

    return {
      locale: targetLocale,
      label: meta.nativeLabel,
      shortLabel: targetLocale.toUpperCase(),
      href,
      hreflang: meta.lang,
      isActive: targetLocale === currentLocale,
      fallback,
      isFallbackToHome: fallback === 'home',
    };
  });
}
