import { defaultLocale, getLocaleMeta, supportedLocales, type Locale } from './config';

/**
 * Internal, locale-independent page identity. Route ids never appear in a URL.
 *
 * The public URL for a page is always derived from this id through
 * `routeMap` below, so a locale is free to use its own public path segments and
 * its own public content slugs without changing any internal identifier.
 */
export type RouteId =
  | 'home'
  | 'houses'
  | 'house'
  | 'villa'
  | 'location'
  | 'contact'
  | 'faq'
  | 'about'
  | 'policies'
  | 'blog'
  | 'blogArticle'
  | 'guide';

export type RouteDefinition = {
  /**
   * Public path segments per locale, relative to the locale root.
   * A locale that is absent has no page for this route and must never be
   * linked, canonicalised, advertised in hreflang, or listed in the sitemap.
   */
  segments: Partial<Record<Locale, readonly string[]>>;
  /** The route appends an internal content id as its final path segment. */
  dynamic?: boolean;
  /**
   * Public slug per locale for each internal content id.
   *
   * - Default locale: any content id is routable; its public slug is the value
   *   declared here, or the internal id when nothing is declared.
   * - Every other locale: the content is routable only when this table names a
   *   slug for it. Nothing is inferred and nothing is auto-translated.
   *
   * Place and property names normally keep their internal slug in every locale
   * (`argyro`, `vrouchas`, `mavrikiano`). Editorial slugs and generic segments
   * are free to differ, for example:
   *
   * ```ts
   * blogArticle: {
   *   segments: { en: ['blog'], de: ['blog'] },
   *   dynamic: true,
   *   content: {
   *     'elounda-beaches': { en: 'elounda-beaches', de: 'straende-in-elounda' },
   *   },
   * }
   * ```
   */
  content?: Record<string, Partial<Record<Locale, string>>>;
};

/**
 * The single source of truth for public URLs.
 *
 * Current English URLs are frozen: every `en` entry reproduces the URL that is
 * live today. German owns the routes whose complete German pages exist.
 */
export const routeMap = {
  home: { segments: { en: [], de: [] } },
  houses: { segments: { en: ['houses'], de: ['ferienhaeuser'] } },
  house: {
    // Generic segment localized; property names keep their stable slug.
    segments: { en: ['houses'], de: ['ferienhaeuser'] },
    dynamic: true,
    content: {
      argyro: { en: 'argyro', de: 'argyro' },
      // A German slug is declared only when complete German content exists.
      clio: { en: 'clio' },
      demetra: { en: 'demetra' },
      efterpi: { en: 'efterpi' },
      erato: { en: 'erato' },
      kalliopi: { en: 'kalliopi' },
      leonidas: { en: 'leonidas' },
      margarita: { en: 'margarita', de: 'margarita' },
      monastiri: { en: 'monastiri' },
      penelope: { en: 'penelope' },
    },
  },
  villa: { segments: { en: ['villa'] }, dynamic: true },
  location: { segments: { en: ['location'], de: ['lage'] } },
  contact: { segments: { en: ['contact'] } },
  faq: { segments: { en: ['faq'] } },
  about: { segments: { en: ['about'] } },
  policies: { segments: { en: ['policies'] } },
  blog: { segments: { en: ['blog'] } },
  blogArticle: { segments: { en: ['blog'] }, dynamic: true },
  guide: {
    // The generic segment is localized; the place name is not.
    segments: { en: ['guide'], de: ['reisefuehrer'] },
    dynamic: true,
    content: {
      vrouchas: { en: 'vrouchas', de: 'vrouchas' },
      // No German page exists for Mavrikiano, so no German slug is declared.
      mavrikiano: { en: 'mavrikiano' },
    },
  },
} as const satisfies Record<RouteId, RouteDefinition>;

export type RouteMap = Record<string, RouteDefinition>;

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '');

/**
 * Join a locale root and its public segments into a trailing-slash path.
 * `src/i18n/routes.ts` keeps the equivalent low-level path primitive;
 * `tests/i18n-german-route-pilot.test.mjs` asserts the two agree.
 */
const localeRootPath = (locale: Locale, segments: readonly string[]): string => {
  const path = segments.filter(Boolean).join('/');

  return path ? `/${locale}/${path}/` : `/${locale}/`;
};

/**
 * Public slug for an internal content id, or `null` when the locale has no page
 * for that content.
 */
export function publicSlug(
  locale: Locale,
  routeId: RouteId,
  contentId: string,
  map: RouteMap = routeMap,
): string | null {
  const declared = map[routeId]?.content?.[contentId]?.[locale];

  if (declared) {
    return declared;
  }

  // English is the complete source: unlisted content keeps its internal id.
  return locale === defaultLocale ? contentId : null;
}

/**
 * Resolve the public path for an internal route identity.
 *
 * Returns `null` — never a guessed URL — when the locale has no such page.
 */
export function resolveRoute(
  locale: Locale,
  routeId: RouteId,
  contentId?: string,
  map: RouteMap = routeMap,
): string | null {
  const definition = map[routeId];
  const segments = definition?.segments[locale];

  if (!definition || !segments) {
    return null;
  }

  if (!definition.dynamic) {
    return localeRootPath(locale, segments);
  }

  if (!contentId) {
    return null;
  }

  const slug = publicSlug(locale, routeId, contentId, map);

  return slug ? localeRootPath(locale, [...segments, slug]) : null;
}

export function routeExists(
  locale: Locale,
  routeId: RouteId,
  contentId?: string,
  map: RouteMap = routeMap,
): boolean {
  return resolveRoute(locale, routeId, contentId, map) !== null;
}

/**
 * Public path for a route that must exist. Throws instead of emitting a URL the
 * build cannot produce.
 */
export function routePath(
  locale: Locale,
  routeId: RouteId,
  contentId?: string,
  map: RouteMap = routeMap,
): string {
  const path = resolveRoute(locale, routeId, contentId, map);

  if (!path) {
    throw new Error(
      `No "${locale}" route for "${routeId}"${contentId ? ` / "${contentId}"` : ''}. ` +
        'Declare it in routeMap (src/i18n/route-map.ts) only once the page really exists.',
    );
  }

  return path;
}

/** Locales that really render a route, in the configured locale order. */
export function routeLocales(routeId: RouteId, contentId?: string, map: RouteMap = routeMap): Locale[] {
  return supportedLocales.filter((locale) => routeExists(locale, routeId, contentId, map));
}

export type ResolvedLocalizedLink = {
  href: string;
  /** Locale the href actually resolves to. */
  locale: Locale;
  /** True when the active locale has no page and the link falls back. */
  isFallback: boolean;
  /** `hreflang` to render on the anchor, and `undefined` when it stays in-locale. */
  hreflang?: string;
};

/**
 * Resolve an internal link for the active locale, falling back to the default
 * locale when the active locale has no such page. The fallback is reported
 * explicitly so callers can mark it rather than hide it.
 */
export function resolveLocalizedLink(
  locale: Locale,
  routeId: RouteId,
  contentId?: string,
  map: RouteMap = routeMap,
): ResolvedLocalizedLink {
  const localized = resolveRoute(locale, routeId, contentId, map);

  if (localized) {
    return { href: localized, locale, isFallback: false };
  }

  return {
    href: routePath(defaultLocale, routeId, contentId, map),
    locale: defaultLocale,
    isFallback: true,
    hreflang: getLocaleMeta(defaultLocale).lang,
  };
}

export type RouteAlternate = {
  locale: Locale;
  hreflang: string;
  path: string;
};

/**
 * Alternates for a route, restricted to locales that really render it.
 * Adds `x-default` only when a translation actually exists.
 */
export function routeAlternates(routeId: RouteId, contentId?: string, map: RouteMap = routeMap): RouteAlternate[] {
  const locales = routeLocales(routeId, contentId, map);

  const alternates = locales.map((locale) => ({
    locale,
    hreflang: getLocaleMeta(locale).lang,
    path: routePath(locale, routeId, contentId, map),
  }));

  if (alternates.length < 2) {
    return alternates;
  }

  return [
    ...alternates,
    {
      locale: defaultLocale,
      hreflang: 'x-default',
      path: routePath(defaultLocale, routeId, contentId, map),
    },
  ];
}

/**
 * Build-time guard. Throws when a page renders a locale the route map does not
 * declare, so a locale route can never be generated silently.
 */
export function assertRoute(locale: Locale, routeId: RouteId, contentId?: string, map: RouteMap = routeMap): void {
  routePath(locale, routeId, contentId, map);
}

export type RouteMatch = {
  routeId: RouteId;
  contentId?: string;
};

/**
 * Reverse lookup: map an existing default-locale path back to its internal
 * route identity, so links that are still authored as English paths (navigation
 * and footer resources) can be resolved through the route map instead of being
 * emitted verbatim.
 *
 * Returns `null` for external, unknown, or non-default-locale paths.
 */
export function matchDefaultLocalePath(path: string, map: RouteMap = routeMap): RouteMatch | null {
  if (!path.startsWith(`/${defaultLocale}/`) && path !== `/${defaultLocale}`) {
    return null;
  }

  const parts = trimSlashes(path.split('#')[0].split('?')[0]).split('/').slice(1).filter(Boolean);
  const entries = Object.entries(map) as [RouteId, RouteDefinition][];

  // Longest segment match first so `houses/argyro` beats `houses`.
  const candidates = entries
    .flatMap(([routeId, definition]) => {
      const segments = definition.segments[defaultLocale];

      return segments ? [{ routeId, definition, segments }] : [];
    })
    .sort((a, b) => b.segments.length - a.segments.length);

  for (const { routeId, definition, segments } of candidates) {
    const matchesPrefix = segments.every((segment, index) => parts[index] === segment);

    if (!matchesPrefix) continue;

    const rest = parts.slice(segments.length);

    if (definition.dynamic && rest.length === 1) {
      const contentId = Object.entries(definition.content ?? {}).find(
        ([, slugs]) => slugs[defaultLocale] === rest[0],
      )?.[0];

      return { routeId, contentId: contentId ?? rest[0] };
    }

    if (!definition.dynamic && rest.length === 0) {
      return { routeId };
    }
  }

  return null;
}

/**
 * Resolve an authored default-locale href for the active locale.
 *
 * Known routes go through the route map, so a locale that owns a translated
 * route gets its own public URL. Anything else keeps the default-locale URL and
 * is reported as a fallback.
 */
export function resolveAuthoredHref(
  locale: Locale,
  href: string,
  map: RouteMap = routeMap,
): ResolvedLocalizedLink {
  if (!href.startsWith('/')) {
    return { href, locale, isFallback: false };
  }

  const [pathname, ...rest] = href.split(/(?=[#?])/);
  const suffix = rest.join('');
  const match = matchDefaultLocalePath(pathname, map);

  if (!match) {
    return {
      href,
      locale: defaultLocale,
      isFallback: locale !== defaultLocale,
      hreflang: locale === defaultLocale ? undefined : getLocaleMeta(defaultLocale).lang,
    };
  }

  const resolved = resolveLocalizedLink(locale, match.routeId, match.contentId, map);

  return { ...resolved, href: `${resolved.href}${suffix}` };
}
