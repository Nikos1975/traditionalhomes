import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

const root = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, root), 'utf8');

const publishedSlugs = [
  'areti-monastery-mirabello-crete',
  'elounda-and-mirabello-bay',
  'elounda-guide',
  'elounda-history-through-its-shoreline',
  'elounda-salt-pans-and-poros-windmills',
  'elounda-visitor-economy',
  'elounda-wartime-memory',
  'key-phases-in-elounda-hotel-development',
  'mavrikiano-distances-and-guide',
  'walking-around-elounda',
  'welcome-to-elounda',
];

describe('English blog canonical route migration', () => {
  it('defines explicit English blog path helpers', async () => {
    const routes = await readText('src/i18n/routes.ts');

    assert.match(routes, /export function blogIndexPath\(locale: Locale\): string/);
    assert.match(routes, /export function blogArticlePath\(slug: string, locale: Locale\): string/);

    // Since the Stage 3 route map, blog paths are resolved from the internal
    // route id rather than assembled from a hardcoded public segment.
    assert.match(routes, /return resolveLocalizedLink\(locale, 'blog'\)\.href/);
    assert.match(routes, /return resolveLocalizedLink\(locale, 'blogArticle', slug\)\.href/);

    const routeMap = await readText('src/i18n/route-map.ts');
    assert.match(routeMap, /blog: \{ segments: \{ en: \['blog'\] \} \}/);
    assert.match(routeMap, /blogArticle: \{ segments: \{ en: \['blog'\] \}, dynamic: true \}/);
  });

  it('renders the blog only under the English locale route', async () => {
    await access(new URL('src/pages/en/blog/index.astro', root));
    await access(new URL('src/pages/en/blog/[...slug].astro', root));
    await assert.rejects(access(new URL('src/pages/blog/index.astro', root)));
    await assert.rejects(access(new URL('src/pages/blog/[...slug].astro', root)));
  });

  it('uses canonical English blog URLs throughout pages and navigation', async () => {
    const [index, article, navigation, common, notFound] = await Promise.all([
      readText('src/pages/en/blog/index.astro'),
      readText('src/pages/en/blog/[...slug].astro'),
      readText('src/i18n/locales/en/navigation.json'),
      readText('src/i18n/locales/en/common.json'),
      readText('src/pages/404.astro'),
    ]);

    for (const source of [index, article, navigation, common, notFound]) {
      assert.doesNotMatch(source, /(?:href=|\]\()\/?blog\//);
    }
    assert.match(index, /blogIndexPath\(defaultLocale\)/);
    assert.match(article, /blogArticlePath\(entry\.id, defaultLocale\)/);
    assert.match(article, /canonicalUrl=\{`https:\/\/traditional-homes\.gr\$\{blogArticlePath\(entry\.id, defaultLocale\)\}`\}/);
  });

  it('preserves published article slugs while rejecting legacy Markdown links', async () => {
    for (const slug of publishedSlugs) {
      const source = await readText(`src/content/blog/${slug === 'mavrikiano-distances-and-guide' ? 'Mavrikiano-Distances-And-Guide' : slug}.md`);
      assert.doesNotMatch(source, /\]\(\/blog\//);
    }
  });

  it('places the ordered one-hop legacy redirects before broader rules', async () => {
    const redirects = await readText('public/_redirects');
    const index = redirects.indexOf('/blog /en/blog/ 301');
    const slash = redirects.indexOf('/blog/ /en/blog/ 301');
    const dynamic = redirects.indexOf('/blog/* /en/blog/:splat 301');

    assert.ok(index >= 0 && slash > index && dynamic > slash);
  });
});
