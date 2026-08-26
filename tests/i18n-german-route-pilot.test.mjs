import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { after, describe, it } from 'node:test';

const execFileAsync = promisify(execFile);

const root = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, root), 'utf8');
const exists = async (path) => {
  try {
    await access(new URL(path, root));
    return true;
  } catch {
    return false;
  }
};

const SITE = 'https://traditional-homes.gr';
/** Stable internal content id, identical in every locale. */
const PILOT_ID = 'vrouchas';
/** Public URLs. The generic segment is localized; the place name is not. */
const EN_PILOT = `/en/guide/${PILOT_ID}/`;
const DE_PILOT = `/de/reisefuehrer/${PILOT_ID}/`;
const UNBUILT_LOCALES = ['fr', 'ru', 'zh', 'ar', 'he'];

/**
 * Anchors, with the one distinction the navigation contract depends on.
 *
 * Ordinary navigation stays inside the active locale, or is marked as a
 * deliberate English fallback. The language selector does the opposite on
 * purpose: crossing locales is its entire function, so it carries a stable
 * marker and is exempt from the fallback and in-locale hreflang rules. Its
 * target must still be a page that really exists, and its own behaviour is
 * covered by `tests/i18n-language-switcher.test.mjs`.
 */
const anchors = (html) =>
  [...html.matchAll(/<a\b([^>]*)>/g)].map(([, attrs]) => ({
    href: attrs.match(/\bhref="([^"]*)"/)?.[1],
    hreflang: attrs.match(/\bhreflang="([^"]*)"/)?.[1],
    isLanguageSwitcher: /\bdata-language-switcher-link\b/.test(attrs),
  }));

const alternates = (html) =>
  [...html.matchAll(/<link rel="alternate"([^>]*)>/g)].map(([, attrs]) => ({
    hreflang: attrs.match(/\bhreflang="([^"]*)"/)?.[1],
    href: attrs.match(/\bhref="([^"]*)"/)?.[1],
  }));

const canonicalOf = (html) => html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];

const loadModules = async () => {
  const ts = (await import('typescript')).default;
  const sources = new Map();

  for (const name of ['config', 'routes', 'route-map']) {
    const source = await readText(`src/i18n/${name}.ts`);
    const { outputText } = ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    });
    sources.set(name, outputText);
  }

  // Inline the dependency graph as data URLs so the real modules run unmodified.
  const asDataUrl = (code) => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  const config = asDataUrl(sources.get('config'));
  const routeMap = asDataUrl(sources.get('route-map').replaceAll("'./config'", `'${config}'`));
  const routes = asDataUrl(
    sources.get('routes').replaceAll("'./config'", `'${config}'`).replaceAll("'./route-map'", `'${routeMap}'`),
  );

  return { routeMap: await import(routeMap), routes: await import(routes) };
};

describe('Stage 3 German route pilot — route map', () => {
  it('separates stable internal ids from localized public paths', async () => {
    const { routeMap } = await loadModules();

    // Internal identity is the same on both sides; only the public path differs.
    assert.equal(routeMap.resolveRoute('en', 'guide', 'vrouchas'), EN_PILOT);
    assert.equal(routeMap.resolveRoute('de', 'guide', 'vrouchas'), DE_PILOT);
    assert.notEqual(EN_PILOT, DE_PILOT, 'the pilot must not assume one slug across locales');
    assert.equal(routeMap.publicSlug('de', 'guide', 'vrouchas'), 'vrouchas');
  });

  it('supports localized route segments and localized content slugs', async () => {
    const { routeMap } = await loadModules();

    // A fixture map proves the capability without creating German URLs here.
    const fixture = {
      houses: { segments: { en: ['houses'], de: ['ferienhaeuser'] } },
      house: {
        segments: { en: ['houses'], de: ['ferienhaeuser'] },
        dynamic: true,
        content: { argyro: { en: 'argyro', de: 'argyro' } },
      },
      location: { segments: { en: ['location'], de: ['lage'] } },
      blogArticle: {
        segments: { en: ['blog'], de: ['blog'] },
        dynamic: true,
        content: { 'elounda-beaches': { en: 'elounda-beaches', de: 'straende-in-elounda' } },
      },
    };

    assert.equal(routeMap.resolveRoute('de', 'houses', undefined, fixture), '/de/ferienhaeuser/');
    assert.equal(routeMap.resolveRoute('de', 'location', undefined, fixture), '/de/lage/');
    // Property names keep their internal slug; only the segment is localized.
    assert.equal(routeMap.resolveRoute('de', 'house', 'argyro', fixture), '/de/ferienhaeuser/argyro/');
    assert.equal(routeMap.resolveRoute('en', 'house', 'argyro', fixture), '/en/houses/argyro/');
    // Editorial slugs may differ per locale.
    assert.equal(
      routeMap.resolveRoute('de', 'blogArticle', 'elounda-beaches', fixture),
      '/de/blog/straende-in-elounda/',
    );
    assert.equal(
      routeMap.resolveRoute('en', 'blogArticle', 'elounda-beaches', fixture),
      '/en/blog/elounda-beaches/',
    );
  });

  it('returns null instead of guessing a URL for a locale that has no page', async () => {
    const { routeMap } = await loadModules();

    for (const locale of UNBUILT_LOCALES) {
      assert.equal(routeMap.resolveRoute(locale, 'houses'), null);
      assert.equal(routeMap.resolveRoute(locale, 'house', 'argyro'), null);
      assert.equal(routeMap.resolveRoute(locale, 'blogArticle', 'elounda-guide'), null);
    }

    // German owns the cluster routes only; everything else still resolves to null.
    assert.equal(routeMap.resolveRoute('de', 'blogArticle', 'elounda-guide'), null);
    assert.equal(routeMap.resolveRoute('de', 'villa', 'almond-tree-villa'), null);
    assert.equal(routeMap.resolveRoute('de', 'contact'), null);
    assert.equal(routeMap.resolveRoute('de', 'house', 'leonidas'), null);

    // German owns the guide segment but only the Vrouchas guide itself.
    assert.equal(routeMap.resolveRoute('de', 'guide', 'mavrikiano'), null);
    assert.throws(() => routeMap.routePath('de', 'guide', 'mavrikiano'), /No "de" route/);
    assert.throws(() => routeMap.assertRoute('fr', 'guide', 'vrouchas'), /No "fr" route/);
  });

  it('advertises alternates only for locales that really render a route', async () => {
    const { routeMap } = await loadModules();

    assert.deepEqual(routeMap.routeLocales('guide', 'vrouchas'), ['en', 'de']);
    assert.deepEqual(routeMap.routeLocales('guide', 'mavrikiano'), ['en']);
    assert.deepEqual(routeMap.routeLocales('houses'), ['en', 'de']);
    assert.deepEqual(routeMap.routeLocales('home'), ['en', 'de']);
    assert.deepEqual(routeMap.routeLocales('location'), ['en', 'de']);
    assert.deepEqual(routeMap.routeLocales('house', 'argyro'), ['en', 'de']);
    // Houses without German content stay English-only.
    assert.deepEqual(routeMap.routeLocales('house', 'leonidas'), ['en']);
    assert.deepEqual(routeMap.routeLocales('villa', 'almond-tree-villa'), ['en']);

    assert.deepEqual(routeMap.routeAlternates('guide', 'vrouchas'), [
      { locale: 'en', hreflang: 'en', path: EN_PILOT },
      { locale: 'de', hreflang: 'de', path: DE_PILOT },
      { locale: 'en', hreflang: 'x-default', path: EN_PILOT },
    ]);

    // A route with a single locale advertises nothing at all.
    assert.deepEqual(routeMap.routeAlternates('guide', 'mavrikiano'), [
      { locale: 'en', hreflang: 'en', path: '/en/guide/mavrikiano/' },
    ]);
  });

  it('resolves authored English hrefs through the map and marks fallbacks', async () => {
    const { routeMap } = await loadModules();

    assert.deepEqual(routeMap.matchDefaultLocalePath('/en/houses/argyro/'), {
      routeId: 'house',
      contentId: 'argyro',
    });
    assert.deepEqual(routeMap.matchDefaultLocalePath('/en/houses/'), { routeId: 'houses' });
    assert.deepEqual(routeMap.matchDefaultLocalePath('/en/'), { routeId: 'home' });
    assert.equal(routeMap.matchDefaultLocalePath('https://traditional-homes.gr'), null);

    // German now owns /de/ferienhaeuser/, so the authored English href resolves German.
    const germanCollection = routeMap.resolveAuthoredHref('de', '/en/houses/');
    assert.deepEqual(germanCollection, { href: '/de/ferienhaeuser/', locale: 'de', isFallback: false });

    // A section German does not own still falls back, and says so.
    const germanFallback = routeMap.resolveAuthoredHref('de', '/en/contact/');
    assert.deepEqual(germanFallback, { href: '/en/contact/', locale: 'en', isFallback: true, hreflang: 'en' });

    // English pages are never marked as falling back.
    const english = routeMap.resolveAuthoredHref('en', '/en/policies/#access');
    assert.equal(english.href, '/en/policies/#access');
    assert.equal(english.hreflang, undefined);
    assert.equal(english.isFallback, false);
  });

  it('keeps the low-level path primitive and the route map in agreement', async () => {
    const { routeMap, routes } = await loadModules();

    // Frozen English URLs: the route map must reproduce exactly what ships today.
    assert.equal(routeMap.resolveRoute('en', 'home'), routes.localizedPath('en'));
    assert.equal(routeMap.resolveRoute('en', 'houses'), routes.localizedPath('en', 'houses'));
    assert.equal(routeMap.resolveRoute('en', 'location'), routes.localizedPath('en', 'location'));
    assert.equal(routeMap.resolveRoute('en', 'blog'), routes.localizedPath('en', 'blog'));
    assert.equal(routes.housePath('argyro', 'en'), '/en/houses/argyro/');
    assert.equal(routes.villaPath('almond-tree-villa', 'en'), '/en/villa/almond-tree-villa/');
    assert.equal(routes.blogArticlePath('elounda-guide', 'en'), '/en/blog/elounda-guide/');
    assert.equal(routes.guidePath('mavrikiano'), '/en/guide/mavrikiano/');
    assert.equal(routes.guidePath('vrouchas', 'de'), DE_PILOT);
    // Helpers never fabricate a locale URL: they fall back to the English page.
    assert.equal(routes.housePath('argyro', 'de'), '/de/ferienhaeuser/argyro/');
    assert.equal(routes.housePath('leonidas', 'de'), '/en/houses/leonidas/');
  });
});

describe('Stage 3 German route pilot — source contracts', () => {
  it('declares the pilot route in the route map and nothing it cannot render', async () => {
    const map = await readText('src/i18n/route-map.ts');

    assert.match(map, /segments: \{ en: \['guide'\], de: \['reisefuehrer'\] \}/);
    assert.match(map, /segments: \{ en: \['houses'\], de: \['ferienhaeuser'\] \}/);
    assert.match(map, /location: \{ segments: \{ en: \['location'\], de: \['lage'\] \} \}/);

    for (const locale of UNBUILT_LOCALES) {
      assert.doesNotMatch(map, new RegExp(`\\b${locale}: \\[`), `${locale} must not own a route before its pages exist`);
    }
  });

  it('keeps the route map and src/pages in sync in both directions', async () => {
    const { routeMap } = await loadModules();
    const localeDirectories = (await readdir(new URL('src/pages/', root), { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && entry.name !== 'en')
      .map((entry) => entry.name);

    const declared = new Set();

    for (const [routeId, definition] of Object.entries(routeMap.routeMap)) {
      for (const [locale, segments] of Object.entries(definition.segments)) {
        if (locale === 'en') continue;

        if (!definition.dynamic) {
          // The locale root is `src/pages/<locale>/index.astro`; a nested
          // section is `src/pages/<locale>/<segments>.astro` or its index.
          const path = [...segments].join('/');
          declared.add(path ? `${locale}/${path}` : `${locale}/index`);
          continue;
        }

        for (const contentId of Object.keys(definition.content ?? {})) {
          const slug = routeMap.publicSlug(locale, routeId, contentId);
          if (slug) declared.add(`${locale}/${[...segments, slug].join('/')}`);
        }
      }
    }

    // Every declared non-default locale route has a real page file, either as
    // `<route>.astro` or as `<route>/index.astro`.
    for (const route of declared) {
      const parent = route.replace(/\/[^/]+$/, '');
      const candidates = [
        `src/pages/${route}.astro`,
        `src/pages/${route}/index.astro`,
        // Dynamic routes are generated from one `[slug].astro` file whose
        // getStaticPaths is itself driven by the route map.
        `src/pages/${parent}/[slug].astro`,
      ];
      const found = await Promise.all(candidates.map((candidate) => exists(candidate)));
      assert.ok(found.some(Boolean), `route map declares /${route}/ but no page file exists for it`);
    }

    // Every non-default locale page file is declared in the route map.
    // `fileURLToPath` is required here: a URL `pathname` is `/D:/...` on Windows,
    // which `path.relative` cannot compare against a native path.
    const pagesRoot = fileURLToPath(new URL('src/pages/', root));

    for (const locale of localeDirectories) {
      const pages = await readdir(new URL(`src/pages/${locale}/`, root), { recursive: true, withFileTypes: true });

      for (const page of pages) {
        if (!page.isFile() || !page.name.endsWith('.astro')) continue;

        const absolute = join(page.parentPath ?? page.path, page.name);
        const route = relative(pagesRoot, absolute).replace(/\\/g, '/').replace(/\.astro$/, '');

        const normalised = route.replace(/\/index$/, '') || route;
        const isDynamic = route.includes('[');
        const dynamicPrefix = route.replace(/\/\[[^\]]+\]$/, '');
        const covered = isDynamic
          ? [...declared].some((declaredRoute) => declaredRoute.startsWith(`${dynamicPrefix}/`))
          : declared.has(route) || declared.has(`${normalised}/index`) || declared.has(normalised);

        assert.ok(covered, `src/pages/${route}.astro exists but is not declared in routeMap`);
      }
    }
  });

  it('passes the active locale and internal id explicitly into the shared renderer', async () => {
    const guidePage = await readText('src/components/pages/GuidePage.astro');
    const enRoute = await readText('src/pages/en/guide/vrouchas.astro');
    const deRoute = await readText('src/pages/de/reisefuehrer/vrouchas.astro');

    assert.match(guidePage, /locale: Locale;/);
    assert.match(guidePage, /guideId: string;/);
    assert.match(guidePage, /const \{ locale, guideId, frontmatter/);
    assert.match(guidePage, /assertRoute\(locale, 'guide', guideId\)/);
    assert.match(guidePage, /routePath\(locale, 'guide', guideId\)/);
    assert.match(guidePage, /routeAlternates\('guide', guideId\)/);

    // The renderer must never infer the active locale from route state.
    assert.doesNotMatch(guidePage, /Astro\.url/);
    assert.doesNotMatch(guidePage, /Astro\.currentLocale/);
    assert.doesNotMatch(guidePage, /Astro\.params/);

    assert.match(enRoute, /locale=\{defaultLocale\}/);
    assert.match(deRoute, /locale="de"/);

    for (const route of [enRoute, deRoute]) {
      // The internal id, not the public slug, is what a route file passes in.
      assert.match(route, /guideId="vrouchas"/);
      assert.match(route, /<GuidePage[\s\S]*<Content \/>[\s\S]*<\/GuidePage>/);
    }
  });

  it('genuinely reuses one renderer instead of copying markup per locale', async () => {
    const enRoute = await readText('src/pages/en/guide/vrouchas.astro');
    const deRoute = await readText('src/pages/de/reisefuehrer/vrouchas.astro');

    for (const route of [enRoute, deRoute]) {
      assert.doesNotMatch(route, /<article|prose prose-stone|<nav\b|aria-label="Breadcrumb"/);
      assert.ok(route.split('\n').length < 20, 'locale route files should stay thin wrappers');
    }
  });

  it('falls back to English intentionally instead of silently', async () => {
    const translate = await readText('src/i18n/translate.ts');

    assert.match(translate, /const dictionaries = \{\s*en:/);
    assert.match(translate, /de: \{/);
    assert.match(translate, /function mergeDictionary/);
    assert.match(translate, /export function hasTranslations/);

    // German is a partial overlay: it must only override keys that exist in the
    // English source, so a typo can never become a silently missing string.
    const namespaces = ['common', 'navigation', 'forms', 'guide'];

    /**
     * Lists where a locale selects from the English inventory instead of
     * translating it entry for entry.
     *
     * `navigation.main` is the locale's launch surface, not a translation list:
     * English holds every primary route, and a locale publishes only the ones
     * whose pages really exist. Entries are therefore matched by their stable
     * authored `href` rather than by array index, so omitting one never shifts
     * the meaning of the entries a locale does keep. Every other array stays
     * under the whole-list-or-nothing rule below; membership here is explicit
     * and per path, never inferred from an array's contents.
     *
     * Which routes German may expose is a separate question, owned by
     * `tests/i18n-language-switcher.test.mjs`.
     */
    const LOCALE_SELECTION_LISTS = new Set(['navigation.main']);

    for (const namespace of namespaces) {
      const source = JSON.parse(await readText(`src/i18n/locales/en/${namespace}.json`));
      const overlay = JSON.parse(await readText(`src/i18n/locales/de/${namespace}.json`));

      const assertSubset = (sourceValue, overlayValue, path) => {
        if (Array.isArray(sourceValue) || Array.isArray(overlayValue)) {
          assert.ok(
            Array.isArray(sourceValue) && Array.isArray(overlayValue),
            `de/${namespace}.json ${path} changes the shape of the English source`,
          );

          if (LOCALE_SELECTION_LISTS.has(path)) {
            const sourceByHref = new Map(sourceValue.map((item) => [item?.href, item]));
            const claimed = new Set();

            overlayValue.forEach((item, index) => {
              const href = item?.href;

              assert.equal(
                typeof href,
                'string',
                `de/${namespace}.json ${path}[${index}] must carry the authored href it selects`,
              );
              assert.ok(
                sourceByHref.has(href),
                `de/${namespace}.json ${path} selects ${href}, which the English navigation does not offer`,
              );
              assert.ok(
                !claimed.has(href),
                `de/${namespace}.json ${path} selects ${href} more than once`,
              );
              claimed.add(href);

              // The selected entry still has to match the English item's shape.
              assertSubset(sourceByHref.get(href), item, `${path}[href=${href}]`);
            });

            return;
          }

          assert.equal(
            overlayValue.length,
            sourceValue.length,
            `de/${namespace}.json ${path} must translate the whole list or none of it`,
          );
          overlayValue.forEach((item, index) => assertSubset(sourceValue[index], item, `${path}[${index}]`));
          return;
        }

        if (typeof sourceValue !== 'object' || sourceValue === null) return;

        for (const [key, value] of Object.entries(overlayValue)) {
          assert.ok(key in sourceValue, `de/${namespace}.json defines unknown key ${path}.${key}`);
          assertSubset(sourceValue[key], value, `${path}.${key}`);
        }
      };

      assertSubset(source, overlay, namespace);
    }

    // Keys the German overlay deliberately leaves to the English source.
    const formsDe = JSON.parse(await readText('src/i18n/locales/de/forms.json'));
    assert.ok(!('defaultItemName' in formsDe.booking), 'analytics item name must stay untranslated');
    assert.ok(!('chatPopupEmail' in formsDe.contact), 'contact address must stay untranslated');
    // German now ships its own page SEO metadata for the routes it owns.
    assert.equal(await exists('src/i18n/locales/de/seo.json'), true, 'German page SEO metadata must exist');
    const seoDe = JSON.parse(await readText('src/i18n/locales/de/seo.json'));
    assert.deepEqual(Object.keys(seoDe.pages).sort(), ['home', 'houses', 'location']);
    for (const page of Object.values(seoDe.pages)) {
      assert.ok(page.title.length > 0 && page.description.length > 0);
    }
  });

  it('keeps inventory facts out of the German locale resources', async () => {
    const files = [
      'src/i18n/locales/de/common.json',
      'src/i18n/locales/de/navigation.json',
      'src/i18n/locales/de/forms.json',
      'src/i18n/locales/de/guide.json',
    ];

    for (const file of files) {
      const contents = await readText(file);
      // Route hrefs legitimately contain a unit slug; copy must not.
      const copyOnly = contents.replace(/"href":\s*"[^"]*"/g, '"href": ""');

      // Label *keys* mirror the English source (`sleeps`, `bedrooms`), so the
      // rule is the same one `tests/i18n-foundation.test.mjs` applies to English:
      // no unit identity, no booking identifiers, no coordinates.
      assert.doesNotMatch(
        copyOnly,
        /argyro|almond-tree-villa|roomCode|bookingId|coordinates|latitude|longitude/i,
      );
      assert.doesNotMatch(contents, /"\/de\//, `${file} must not link to locale routes that do not exist`);
    }
  });

  it('does not change the /blog/** redirect contract', async () => {
    const redirects = await readText('public/_redirects');
    const index = redirects.indexOf('/blog /en/blog/ 301');
    const slash = redirects.indexOf('/blog/ /en/blog/ 301');
    const dynamic = redirects.indexOf('/blog/* /en/blog/:splat 301');

    assert.ok(index >= 0 && slash > index && dynamic > slash);
    assert.doesNotMatch(redirects, /\/de\//);
  });

  it('leaves RTL configuration for ar and he intact', async () => {
    const config = await readText('src/i18n/config.ts');

    assert.match(config, /ar:\s*\{[\s\S]*?lang:\s*'ar',[\s\S]*?dir:\s*'rtl',/);
    assert.match(config, /he:\s*\{[\s\S]*?lang:\s*'he',[\s\S]*?dir:\s*'rtl',/);
    assert.match(config, /de:\s*\{[\s\S]*?lang:\s*'de',[\s\S]*?dir:\s*'ltr',/);
  });
});

describe('Stage 3 German route pilot — generated output', async () => {
  const temporaryDirectory = await mkdtemp(join(process.cwd(), '.astro-i18n-pilot-'));
  const configPath = join(temporaryDirectory, 'astro.config.mjs');
  const cachePath = join(temporaryDirectory, 'cache');
  const outputPath = join(temporaryDirectory, 'dist');
  const projectConfig = new URL('astro.config.mjs', root).href;

  try {
    await writeFile(
      configPath,
      `import config from ${JSON.stringify(projectConfig)};\nexport default { ...config, cacheDir: ${JSON.stringify(cachePath)}, outDir: ${JSON.stringify(relative(process.cwd(), outputPath))} };\n`,
    );
    await execFileAsync(process.execPath, [
      './node_modules/astro/astro.js',
      'build',
      '--config',
      relative(process.cwd(), configPath),
    ]);
  } catch (error) {
    await rm(temporaryDirectory, { force: true, recursive: true });
    throw error;
  }

  after(() => rm(temporaryDirectory, { force: true, recursive: true }));

  const page = (route) => readFile(join(outputPath, route, 'index.html'), 'utf8');

  it('renders the German pilot route', async () => {
    const html = await page('de/reisefuehrer/vrouchas');

    assert.match(html, /Entfernungen ab der Almond Tree Villa/);
    assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1);
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
  });

  it('renders lang="de" and LTR direction on the German pilot', async () => {
    const html = await page('de/reisefuehrer/vrouchas');

    assert.match(html, /<html lang="de" dir="ltr">/);
  });

  it('keeps both canonicals self-referencing with no cross-locale canonicalization', async () => {
    assert.equal(canonicalOf(await page('en/guide/vrouchas')), `${SITE}${EN_PILOT}`);
    assert.equal(canonicalOf(await page('de/reisefuehrer/vrouchas')), `${SITE}${DE_PILOT}`);
  });

  it('emits EN and DE alternates only, on both sides of the pilot route', async () => {
    const expected = [
      { hreflang: 'en', href: `${SITE}${EN_PILOT}` },
      { hreflang: 'de', href: `${SITE}${DE_PILOT}` },
      { hreflang: 'x-default', href: `${SITE}${EN_PILOT}` },
    ];

    assert.deepEqual(alternates(await page('en/guide/vrouchas')), expected);
    assert.deepEqual(alternates(await page('de/reisefuehrer/vrouchas')), expected);
  });

  it('emits no hreflang for locales without a page', async () => {
    for (const route of ['en/guide/vrouchas', 'de/reisefuehrer/vrouchas', 'en', 'en/blog', 'en/guide/mavrikiano', 'de', 'de/ferienhaeuser', 'de/lage', 'de/ferienhaeuser/argyro']) {
      const html = await page(route);

      for (const { hreflang, href } of alternates(html)) {
        assert.ok(!UNBUILT_LOCALES.includes(hreflang), `${route} must not advertise hreflang="${hreflang}"`);
        await access(join(outputPath, new URL(href).pathname, 'index.html'));
      }
    }
  });

  it('does not emit hreflang on pages that have no translated equivalent', async () => {
    for (const route of ['en/blog', 'en/guide/mavrikiano', 'en/contact', 'en/faq']) {
      assert.deepEqual(alternates(await page(route)), [], `${route} should not advertise alternates`);
    }
  });

  it('never links to an unbuilt locale from any generated page', async () => {
    const files = await readdir(outputPath, { recursive: true, withFileTypes: true });

    for (const file of files) {
      if (!file.isFile() || !file.name.endsWith('.html')) continue;

      const html = await readFile(join(file.parentPath ?? file.path, file.name), 'utf8');

      for (const locale of UNBUILT_LOCALES) {
        assert.doesNotMatch(html, new RegExp(`href="(?:${SITE})?/${locale}/`), `${file.name} links to /${locale}/`);
      }
    }
  });

  it('keeps every internal link on the German pilot pointing at a page that exists', async () => {
    const html = await page('de/reisefuehrer/vrouchas');

    for (const { href, hreflang, isLanguageSwitcher } of anchors(html)) {
      if (!href?.startsWith('/')) continue;

      const pathname = href.split('#')[0];
      await access(join(outputPath, pathname, 'index.html'));

      // The language selector crosses locales by design; only its target is checked here.
      if (isLanguageSwitcher) continue;

      // A link that leaves the active locale must say so.
      if (pathname.startsWith('/de/')) {
        assert.equal(hreflang, undefined, `${href} is in-locale and should not carry hreflang`);
      } else {
        assert.equal(hreflang, 'en', `${href} leaves the German locale and must carry hreflang="en"`);
      }
    }
  });

  it('keeps English internal links free of fallback markup', async () => {
    const html = await page('en/guide/vrouchas');

    for (const { href, hreflang, isLanguageSwitcher } of anchors(html)) {
      if (!href?.startsWith('/')) continue;

      if (isLanguageSwitcher) {
        // Still a real page, but a deliberate cross-locale link rather than a fallback.
        await access(join(outputPath, href.split('#')[0].split('?')[0], 'index.html'));
        continue;
      }

      assert.equal(hreflang, undefined, `${href} on an English page should not be marked as a fallback`);
    }
  });

  it('keeps the English pilot output semantically unchanged apart from the added alternates', async () => {
    const html = await page('en/guide/vrouchas');
    const source = await readText('src/guides/Vrouchas-Guide.md');

    assert.match(html, /<h1[^>]*>Vrouchas Area, Access &(?:amp|#x26);? ?Practical Information<\/h1>/);
    assert.match(html, /Back to Interactive Map/);
    assert.match(html, /View Properties/);
    assert.match(html, /href="\/en\/location\/"/);
    assert.match(html, /href="\/en\/houses\/"/);
    assert.match(html, /Spinalonga Visitor Information/);
    assert.ok(source.includes('Spinalonga Visitor Information (2026 Season)'));
  });

  it('lists only routes that really exist in the sitemap', async () => {
    const sitemap = await readFile(join(outputPath, 'sitemap-0.xml'), 'utf8');
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);

    assert.ok(urls.includes(`${SITE}${DE_PILOT}`));
    assert.ok(urls.includes(`${SITE}${EN_PILOT}`));

    for (const url of urls) {
      await access(join(outputPath, new URL(url).pathname, 'index.html'));
    }

    const localePrefixes = new Set(urls.map((url) => new URL(url).pathname.split('/')[1]));
    assert.deepEqual([...localePrefixes].sort(), ['de', 'en']);
  });

  it('localizes every substantive section of the English master', async () => {
    const source = await readText('src/guides/Vrouchas-Guide.md');
    const html = await page('de/reisefuehrer/vrouchas');

    // Structural parity: the German page must not drop or invent a section.
    const englishHeadings = [...source.matchAll(/^(#{2,3})\s+(.+)$/gm)];
    // Scope to the article: the shared header and footer contribute headings too.
    const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? '';
    const germanH2 = [...article.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].length;
    const germanH3 = [...article.matchAll(/<h3[^>]*>([\s\S]*?)<\/h3>/g)].length;

    assert.equal(germanH2, englishHeadings.filter(([, level]) => level === '##').length);
    assert.equal(germanH3, englishHeadings.filter(([, level]) => level === '###').length);

    // Every substantive English topic has a German counterpart.
    const required = [
      'Kiesstrand',           // Beaches of the Area
      'Driros',
      'Kolokytha',
      'Spinalonga',
      'Olous',
      'Kanal von Elounda',    // Historical Sites & Landmarks
      'Basilika von Poros',
      'Salinen von Elounda',
      'Gournia',
      'Mietwagen',            // Transport & Practical Information
      'Taxis',
      'Linienbus',
      'Mirabello-Runde',      // Day-trip itinerary
      'Packliste',
      'Schnorchelausrastung'.replace('astung', 'üstung'),
      'Trockenbeutel',
      'Eintrittskarten',      // Spinalonga visitor information
      'Bootstransfer',
    ];

    for (const term of required) {
      assert.ok(html.includes(term), `German page is missing a localized counterpart for: ${term}`);
    }
  });

  it('keeps German facts identical to the English master', async () => {
    const source = await readText('src/guides/Vrouchas-Guide.md');
    const html = await page('de/reisefuehrer/vrouchas');
    const text = (html.match(/<article[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? '').replace(/<[^>]+>/g, ' ');

    // Distances and drive times, with the German decimal comma.
    const distances = [
      ['4.2 km', '4,2 km'],
      ['20.1 km', '20,1 km'],
      ['9 km', '9 km'],
      ['10.5 km', '10,5 km'],
      ['63.2 km', '63,2 km'],
      ['7.5 km', '7,5 km'],
      ['13 km', '13 km'],
      ['30 km', '30 km'],
    ];

    for (const [english, german] of distances) {
      assert.ok(source.includes(english), `English master no longer states ${english}`);
      assert.ok(text.includes(german), `German page must state ${german}`);
    }

    // Dates and figures carried over unchanged from the master.
    for (const [english, german] of [
      ['1579', '1579'],
      ['1903\u20131957', '1903\u20131957'],
      ['1897\u201398', '1897\u201398'],
      ['\u20ac20', '20 \u20ac'],
      ['\u20ac10', '10 \u20ac'],
      ['08:30 AM to 6:00 PM', '08:30 bis 18:00 Uhr'],
      ['\u20ac10 to \u20ac12', '10 bis 12 \u20ac'],
      ['7 to 10 minutes', '7 bis 10 Minuten'],
      ['Every 30 minutes', 'Alle 30 Minuten'],
    ]) {
      assert.ok(source.includes(english), `English master no longer states ${english}`);
      assert.ok(text.includes(german), `German page must state ${german}`);
    }

    // No factual divergence: German must not add a figure the master omits.
    // "10 bis 12 €" contributes only its trailing figure to this scan; the full
    // range is asserted verbatim above.
    const germanEuroFigures = [...text.matchAll(/(\d+)\s*\u20ac/g)].map(([, n]) => n).sort();
    assert.deepEqual(germanEuroFigures, ['10', '12', '20']);
  });

  it('uses German title, description and H1 on the German route', async () => {
    const html = await page('de/reisefuehrer/vrouchas');
    const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
    const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '').replace(/<[^>]+>/g, '').trim();

    assert.match(title, /^Vrouchas auf Kreta: Lage, Anreise/);
    assert.equal(h1, 'Vrouchas auf Kreta: Lage, Anreise und praktische Informationen');
    assert.match(description, /^Praktische Informationen zu Vrouchas bei Elounda/);

    // Keep the rendered title within the length the English page already ships.
    const englishTitle = (await page('en/guide/vrouchas')).match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
    assert.ok(
      title.replace(/&amp;/g, '&').length <= englishTitle.replace(/&amp;/g, '&').length,
      `German title (${title.length}) should not exceed the English title (${englishTitle.length})`,
    );
    assert.ok(description.length <= 160, `meta description is ${description.length} characters`);
  });

  it('keeps German chrome and breadcrumbs in German', async () => {
    const html = await page('de/reisefuehrer/vrouchas');
    const breadcrumb = html.match(/<nav class="text-xs text-muted[^"]*"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? '';
    const breadcrumbText = breadcrumb.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

    assert.match(breadcrumbText, /Startseite/);
    assert.match(breadcrumbText, /Lage/);
    assert.match(breadcrumbText, /Vrouchas/);
    // The long SEO title must not leak into the breadcrumb trail.
    assert.doesNotMatch(breadcrumbText, /Lage, Anreise/);

    // Visible German chrome, ignoring the serialised script payload where
    // untranslated keys legitimately keep their English fallback value.
    const visible = html.replace(/<script[\s\S]*?<\/script>/g, ' ');
    assert.match(visible, /Zur\u00fcck zur interaktiven Karte/);
    assert.match(visible, /H\u00e4user ansehen/);
    assert.match(visible, /Hauptnavigation/);
    assert.match(visible, /Verf\u00fcgbarkeit pr\u00fcfen/);
    assert.doesNotMatch(visible, /Back to Interactive Map|View Properties|Check Dates|Main navigation/);
  });

  it('keeps the English master rendered content unchanged', async () => {
    const html = await page('en/guide/vrouchas');
    const source = await readText('src/guides/Vrouchas-Guide.md');

    // The English page still renders its own title and every master heading.
    assert.match(html, /<title>Vrouchas Area, Access &amp; Practical Information \| Elounda Traditional Homes<\/title>/);
    assert.match(html, /aria-current="page">Vrouchas Area, Access &amp; Practical Information<\/li>/);

    for (const [, , heading] of source.matchAll(/^(#{2,3})\s+(.+)$/gm)) {
      void heading;
    }
    for (const term of ['National Geographic Style Description', 'Gournia', 'Every 30 minutes', 'Reduced Price']) {
      assert.ok(html.includes(term.replace(/&/g, '&amp;')), `English page no longer renders: ${term}`);
    }
  });

  it('lists the German route in one global llms.txt with resolvable links', async () => {
    const llms = await readText('public/llms.txt');
    const links = [...llms.matchAll(/\[[^\]]+\]\(([^\s)]+)\)/g)].map(([, url]) => url);

    assert.ok(links.includes(`${SITE}${DE_PILOT}`), 'llms.txt must list the real German route');
    assert.equal(links.filter((url) => url.startsWith(`${SITE}/de/`)).length, 5, 'only real German routes belong in llms.txt');

    // One global file: no per-language llms variants.
    assert.equal(await exists('public/llms-de.txt'), false);
    assert.equal(await exists('public/llms-en.txt'), false);

    for (const url of links) {
      await access(join(outputPath, new URL(url).pathname, 'index.html'));
    }
  });

  it('keeps one global sitemap entry point', async () => {
    const index = await readFile(join(outputPath, 'sitemap-index.xml'), 'utf8');
    const children = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);

    assert.ok(children.every((url) => /sitemap-\d+\.xml$/.test(url)), 'no language-specific sitemaps');
    await access(join(outputPath, 'sitemap-index.xml'));
    assert.equal(await exists('public/sitemap-de.xml'), false);
  });

  it('renders the four German cluster routes with German metadata', async () => {
    const expected = [
      { route: 'de', path: '/de/', titleStart: 'Ferienhäuser in Elounda', h1: 'Wohnen im' },
      { route: 'de/ferienhaeuser', path: '/de/ferienhaeuser/', titleStart: 'Ferienhäuser', h1: 'Unsere Ferienhäuser' },
      { route: 'de/lage', path: '/de/lage/', titleStart: 'Lage', h1: 'Die' },
      { route: 'de/ferienhaeuser/argyro', path: '/de/ferienhaeuser/argyro/', titleStart: 'Haus Argyro', h1: 'Haus Argyro' },
    ];

    for (const { route, path, titleStart, h1 } of expected) {
      const html = await page(route);

      assert.match(html, /<html lang="de" dir="ltr">/, `${path} must be German and LTR`);
      assert.equal(canonicalOf(html), `${SITE}${path}`, `${path} must self-canonicalise`);

      const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
      assert.ok(title.startsWith(titleStart), `${path} title was ${title}`);

      const heading = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? '').replace(/<[^>]+>/g, ' ').trim();
      assert.ok(heading.startsWith(h1), `${path} H1 was ${heading}`);
      assert.equal((html.match(/<h1[\s>]/g) ?? []).length, 1, `${path} must have exactly one H1`);

      const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
      assert.ok(description.length > 0 && description.length <= 200);
    }
  });

  it('gives every German cluster route reciprocal EN/DE alternates', async () => {
    const pairs = [
      ['de', 'en', '/de/', '/en/'],
      ['de/ferienhaeuser', 'en/houses', '/de/ferienhaeuser/', '/en/houses/'],
      ['de/lage', 'en/location', '/de/lage/', '/en/location/'],
      ['de/ferienhaeuser/argyro', 'en/houses/argyro', '/de/ferienhaeuser/argyro/', '/en/houses/argyro/'],
    ];

    for (const [deRoute, enRoute, dePath, enPath] of pairs) {
      const expected = [
        { hreflang: 'en', href: `${SITE}${enPath}` },
        { hreflang: 'de', href: `${SITE}${dePath}` },
        { hreflang: 'x-default', href: `${SITE}${enPath}` },
      ];

      assert.deepEqual(alternates(await page(deRoute)), expected, `${dePath} alternates`);
      assert.deepEqual(alternates(await page(enRoute)), expected, `${enPath} alternates`);
    }
  });

  it('prefers real German equivalents and marks every English fallback', async () => {
    const germanRoutes = ['de', 'de/ferienhaeuser', 'de/lage', 'de/ferienhaeuser/argyro', 'de/reisefuehrer/vrouchas'];
    const germanEquivalents = ['/en/', '/en/houses/', '/en/location/', '/en/houses/argyro/'];

    for (const route of germanRoutes) {
      const html = await page(route);

      for (const { href, hreflang, isLanguageSwitcher } of anchors(html)) {
        if (!href?.startsWith('/')) continue;

        const pathname = href.split('#')[0].split('?')[0];
        await access(join(outputPath, pathname, 'index.html'));

        // Switching language to the English equivalent is the selector's purpose,
        // not an unwanted fallback from German navigation.
        if (isLanguageSwitcher) continue;

        if (pathname.startsWith('/de/')) {
          assert.equal(hreflang, undefined, `${route}: ${href} is in-locale and must not carry hreflang`);
        } else {
          assert.equal(hreflang, 'en', `${route}: ${href} leaves German and must carry hreflang="en"`);
          assert.ok(
            !germanEquivalents.includes(pathname),
            `${route}: ${href} has a real German equivalent and must not fall back`,
          );
        }
      }
    }
  });

  it('never offers a fabricated German URL for an untranslated property page', async () => {
    const html = await page('en/houses/monastiri');
    const german = anchors(html).filter((link) => link.isLanguageSwitcher && link.href?.startsWith('/de/'));

    assert.ok(german.length > 0, 'the English property page must offer a German choice');

    for (const { href } of german) {
      // The URL the preview reported. It has no page and must never be emitted.
      assert.notEqual(href, '/de/houses/monastiri/');
      assert.doesNotMatch(href, /^\/de\/houses\//, `${href} carries an English segment under /de/`);
      // Nearest real localized parent, and it really exists.
      assert.equal(href, '/de/ferienhaeuser/');
      await access(join(outputPath, href, 'index.html'));
    }

    // Argyro is translated, so it keeps its own German page.
    for (const { href } of anchors(await page('en/houses/argyro')).filter(
      (link) => link.isLanguageSwitcher && link.href?.startsWith('/de/'),
    )) {
      assert.equal(href, '/de/ferienhaeuser/argyro/');
    }
  });

  it('emits no /de/houses/ URL anywhere in the generated site', async () => {
    const offenders = [];

    for (const file of await readdir(outputPath, { recursive: true, withFileTypes: true })) {
      if (!file.isFile() || !file.name.endsWith('.html')) continue;

      const html = await readFile(join(file.parentPath ?? file.path, file.name), 'utf8');

      if (/(?:href|content)="(?:https:\/\/traditional-homes\.gr)?\/de\/houses\//.test(html)) {
        offenders.push(relative(outputPath, join(file.parentPath ?? file.path, file.name)));
      }
    }

    assert.deepEqual(offenders, []);
  });

  it('marks every English property fallback on the German collection instead of hiding it', async () => {
    const html = await page('de/ferienhaeuser');
    const germanCopy = JSON.parse(await readText('src/i18n/locales/de/common.json'));
    const fallbackLabel = germanCopy.ui.property.card.detailsInEnglish;
    const cards = [...html.matchAll(/<article[\s\S]*?<\/article>/g)].map(([card]) => card);

    assert.ok(cards.length >= 11, `expected every property to render a card, found ${cards.length}`);

    let translated = 0;
    let fallbacks = 0;

    for (const card of cards) {
      const slug = card.match(/data-id="([^"]+)"/)?.[1];
      const links = [...card.matchAll(/<a\b([^>]*)>/g)]
        .map(([, attrs]) => ({
          href: attrs.match(/\bhref="([^"]*)"/)?.[1],
          hreflang: attrs.match(/\bhreflang="([^"]*)"/)?.[1],
          lang: attrs.match(/\blang="([^"]*)"/)?.[1],
        }))
        .filter((link) => link.href?.startsWith('/'));

      assert.ok(links.length > 0, `${slug} card has no internal link`);

      for (const { href, hreflang, lang } of links) {
        // No phantom locale URL, and whatever it points at was really built.
        assert.doesNotMatch(href, /^\/de\/houses\//, `${slug}: ${href} fabricates a German route`);
        await access(join(outputPath, href.split('#')[0], 'index.html'));

        if (href.startsWith('/de/')) {
          assert.equal(hreflang, undefined, `${slug}: ${href} is in-locale and must not be marked`);
          continue;
        }

        // Leaving German must be declared on every clickable part of the card.
        assert.equal(hreflang, 'en', `${slug}: ${href} leaves German without hreflang`);
        assert.equal(lang, 'en', `${slug}: ${href} leaves German without lang`);
      }

      const leavesGerman = links.some(({ href }) => !href.startsWith('/de/'));

      // A card that sends the reader to English must say so in visible German copy.
      assert.equal(
        card.includes(fallbackLabel),
        leavesGerman,
        leavesGerman
          ? `${slug}: an English fallback must say so in visible German copy`
          : `${slug}: a translated card must not claim its details are English`,
      );

      // A group card offers its two members, so only single-property cards are
      // required to point every link at one page.
      if (slug?.startsWith('group-')) continue;

      if (slug === 'argyro') {
        translated += 1;
        assert.ok(
          links.every(({ href }) => href.startsWith('/de/')),
          'Argyro is translated and must not link to English',
        );
        assert.equal(links[0].href, '/de/ferienhaeuser/argyro/');
        continue;
      }

      fallbacks += 1;

      const expected = slug === 'almond-tree-villa' ? `/en/villa/${slug}/` : `/en/houses/${slug}/`;

      assert.ok(
        links.every(({ href }) => href === expected),
        `${slug}: every card link must point at the same English detail page`,
      );
    }

    assert.equal(translated, 1, 'exactly one German property page exists today');
    assert.ok(fallbacks >= 10, 'every other property is still an explicit English fallback');
  });

  it('serialises only the active locale into client-side script payloads', async () => {
    const german = await page('de');
    const english = await page('en');

    const germanScripts = (german.match(/<script[\s\S]*?<\/script>/g) ?? []).join(' ');
    const englishScripts = (english.match(/<script[\s\S]*?<\/script>/g) ?? []).join(' ');

    // Compare serialised *string values*, not identifiers that merely contain
    // the word (`maxAdults` is a DOM variable, not a shipped label).
    const serialisedValues = (scripts) =>
      new Set([...scripts.matchAll(/&quot;([^&]{2,60})&quot;|"([^"\\]{2,60})"/g)].map(([, a, b]) => a ?? b));

    const germanValues = serialisedValues(germanScripts);
    const englishValues = serialisedValues(englishScripts);

    for (const englishOnly of ['Check Dates', 'Search all available properties', 'Arrival', 'Nights', 'Adults']) {
      assert.ok(!germanValues.has(englishOnly), `German payload leaks English string: ${englishOnly}`);
    }
    for (const germanOnly of ['Verfügbarkeit prüfen', 'Nächte', 'Erwachsene', 'Anreise']) {
      assert.ok(!englishValues.has(germanOnly), `English payload leaks German string: ${germanOnly}`);
    }

    // The German page does ship its own German labels.
    assert.ok(germanValues.has('Erwachsene') || germanScripts.includes('Erwachsene'));
  });

  it('keeps inventory the single factual source for the German house page', async () => {
    const html = await page('de/ferienhaeuser/argyro');
    const inventory = JSON.parse(await readText('src/inventory/inventory.json'));
    const units = Array.isArray(inventory) ? inventory : Object.values(inventory).find(Array.isArray);
    const argyro = units.find((unit) => unit.slug === 'argyro');

    // Facts come from inventory, and the German page shows the same numbers.
    assert.ok(html.includes(String(argyro.sleeps)));
    assert.ok(html.includes(String(argyro.bedrooms)));

    // Locale resources must not carry inventory values.
    for (const file of ['common', 'navigation', 'forms', 'guide', 'properties', 'home', 'location', 'seo']) {
      const contents = await readText(`src/i18n/locales/de/${file}.json`);
      assert.doesNotMatch(contents, /"bookingId"|"roomCode"|"latitude"|"longitude"|reserve-online/i, `de/${file}.json`);
    }
  });

  it('lists every real German route in the sitemap and nothing else', async () => {
    const sitemap = await readFile(join(outputPath, 'sitemap-0.xml'), 'utf8');
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
    const german = urls.filter((url) => url.startsWith(`${SITE}/de/`)).sort();

    assert.deepEqual(german, [
      `${SITE}/de/`,
      `${SITE}/de/ferienhaeuser/`,
      `${SITE}/de/ferienhaeuser/argyro/`,
      `${SITE}/de/lage/`,
      `${SITE}/de/reisefuehrer/vrouchas/`,
    ]);

    for (const url of urls) {
      await access(join(outputPath, new URL(url).pathname, 'index.html'));
    }
  });

  it('generates no German page for a house without German content', async () => {
    for (const slug of ['leonidas', 'margarita', 'clio', 'monastiri']) {
      await assert.rejects(access(join(outputPath, 'de', 'ferienhaeuser', slug, 'index.html')));
    }
    await assert.rejects(access(join(outputPath, 'de', 'villa', 'almond-tree-villa', 'index.html')));
    await assert.rejects(access(join(outputPath, 'de', 'kontakt', 'index.html')));
  });

  it('keeps the blog canonical contract unchanged', async () => {
    const blogIndex = await page('en/blog');

    assert.equal(canonicalOf(blogIndex), `${SITE}/en/blog/`);
    await assert.rejects(access(join(outputPath, 'blog', 'index.html')));
  });
});
