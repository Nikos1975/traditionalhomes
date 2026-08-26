import { defaultLocale, getLocaleMeta, isLocale, normalizeLocale, type Locale } from './config';
import { getSeoCopy } from './translate';

const siteUrl = 'https://traditional-homes.gr';

export type PageSeoKey = keyof ReturnType<typeof getSeoCopy>['pages'];

export type PageSeoMeta = {
  title: string;
  description: string;
};

type PropertySeoUnit = {
  name: string;
  location: string;
  sleeps: number;
  bedrooms: number;
  pool: 'private' | 'shared' | 'none';
};

type VillaSeoUnit = PropertySeoUnit & {
  bathrooms: number;
};

type GuideSeoFrontmatter = {
  title: string;
  description?: string;
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

export function getPropertySeo(
  locale: string | undefined,
  unit: PropertySeoUnit,
  poolLabel: string,
): PageSeoMeta {
  const templates = getSeoCopy(locale).templates;
  const titleSuffix = templates.titleSuffix;
  const property = templates.property;
  const bedroomLabel = unit.bedrooms === 1 ? property.bedroom : property.bedrooms;
  // Only English lowercases a mid-sentence label. German nouns keep their capital.
  const poolText = normalizeLocale(locale) === defaultLocale ? poolLabel.toLowerCase() : poolLabel;

  return {
    title: `${unit.name} — ${unit.location} | ${titleSuffix}`,
    description: `${unit.name} ${property.in} ${unit.location} — ${property.sleeps} ${unit.sleeps}, ${unit.bedrooms} ${bedroomLabel}${
      unit.pool !== 'none' ? `, ${poolText}` : ''
    }. ${property.tail}`,
  };
}

export function getVillaSeo(locale: string | undefined, unit: VillaSeoUnit, poolLabel: string): PageSeoMeta {
  const templates = getSeoCopy(locale).templates;
  // Only English lowercases a mid-sentence label. German nouns keep their capital.
  const poolText = normalizeLocale(locale) === defaultLocale ? poolLabel.toLowerCase() : poolLabel;

  return {
    title: `${unit.name} - ${unit.location} | ${templates.titleSuffix}`,
    description: templates.villa.description
      .replace('{name}', unit.name)
      .replace('{sleeps}', String(unit.sleeps))
      .replace('{bedrooms}', String(unit.bedrooms))
      .replace('{bathrooms}', String(unit.bathrooms))
      .replace('{pool}', poolText),
  };
}

export function getGuideSeo(
  locale: string | undefined,
  frontmatter: GuideSeoFrontmatter,
  fallbackDescription = '',
): PageSeoMeta {
  const guideTitle = getSeoCopy(locale).templates.guideTitle;

  return {
    title: guideTitle.replace('{title}', frontmatter.title),
    description: frontmatter.description || fallbackDescription,
  };
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
