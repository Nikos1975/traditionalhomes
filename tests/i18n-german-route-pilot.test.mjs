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

const anchors = (html) =>
  [...html.matchAll(/<a\b([^>]*)>/g)].map(([, attrs]) => ({
    href: attrs.match(/\bhref="([^"]*)"/)?.[1],
    hreflang: attrs.match(/\bhreflang="([^"]*)"/)?.[1],
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

    for (const locale of [...UNBUILT_LOCALES, 'de']) {
      assert.equal(routeMap.resolveRoute(locale, 'houses'), null);
      assert.equal(routeMap.resolveRoute(locale, 'house', 'argyro'), null);
      assert.equal(routeMap.resolveRoute(locale, 'blogArticle', 'elounda-guide'), null);
    }

    // German owns the guide segment but only the Vrouchas guide itself.
    assert.equal(routeMap.resolveRoute('de', 'guide', 'mavrikiano'), null);
    assert.throws(() => routeMap.routePath('de', 'guide', 'mavrikiano'), /No "de" route/);
    assert.throws(() => routeMap.assertRoute('fr', 'guide', 'vrouchas'), /No "fr" route/);
  });

  it('advertises alternates only for locales that really render a route', async () => {
    const { routeMap } = await loadModules();

    assert.deepEqual(routeMap.routeLocales('guide', 'vrouchas'), ['en', 'de']);
    assert.deepEqual(routeMap.routeLocales('guide', 'mavrikiano'), ['en']);
    assert.deepEqual(routeMap.routeLocales('houses'), ['en']);

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

    // German has no houses page, so the link stays English and says so.
    const german = routeMap.resolveAuthoredHref('de', '/en/houses/');
    assert.deepEqual(german, { href: '/en/houses/', locale: 'en', isFallback: true, hreflang: 'en' });

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
    assert.equal(routes.housePath('argyro', 'de'), '/en/houses/argyro/');
  });
});

describe('Stage 3 German route pilot — source contracts', () => {
  it('declares the pilot route in the route map and nothing it cannot render', async () => {
    const map = await readText('src/i18n/route-map.ts');

    assert.match(map, /segments: \{ en: \['guide'\], de: \['reisefuehrer'\] \}/);

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
          declared.add(`${locale}/${[...segments].join('/')}`);
          continue;
        }

        for (const contentId of Object.keys(definition.content ?? {})) {
          const slug = routeMap.publicSlug(locale, routeId, contentId);
          if (slug) declared.add(`${locale}/${[...segments, slug].join('/')}`);
        }
      }
    }

    // Every declared non-default locale route has a real page file.
    for (const route of declared) {
      assert.ok(await exists(`src/pages/${route}.astro`), `route map declares /${route}/ but src/pages/${route}.astro is missing`);
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

        assert.ok(declared.has(route), `src/pages/${route}.astro exists but is not declared in routeMap`);
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

    for (const namespace of namespaces) {
      const source = JSON.parse(await readText(`src/i18n/locales/en/${namespace}.json`));
      const overlay = JSON.parse(await readText(`src/i18n/locales/de/${namespace}.json`));

      const assertSubset = (sourceValue, overlayValue, path) => {
        if (Array.isArray(sourceValue) || Array.isArray(overlayValue)) {
          assert.ok(
            Array.isArray(sourceValue) && Array.isArray(overlayValue),
            `de/${namespace}.json ${path} changes the shape of the English source`,
          );
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
    assert.equal(await exists('src/i18n/locales/de/seo.json'), false, 'German SEO templates are not part of this stage');
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

      assert.doesNotMatch(contents, /sleeps|bedrooms|bathrooms|roomCode|bookingId|coordinates|latitude|longitude/i);
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
    for (const route of ['en/guide/vrouchas', 'de/reisefuehrer/vrouchas', 'en', 'en/blog', 'en/guide/mavrikiano']) {
      const html = await page(route);

      for (const { hreflang, href } of alternates(html)) {
        assert.ok(!UNBUILT_LOCALES.includes(hreflang), `${route} must not advertise hreflang="${hreflang}"`);
        await access(join(outputPath, new URL(href).pathname, 'index.html'));
      }
    }
  });

  it('does not emit hreflang on pages that have no translated equivalent', async () => {
    for (const route of ['en', 'en/blog', 'en/guide/mavrikiano', 'en/houses', 'en/contact']) {
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

    for (const { href, hreflang } of anchors(html)) {
      if (!href?.startsWith('/')) continue;

      const pathname = href.split('#')[0];
      await access(join(outputPath, pathname, 'index.html'));

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

    for (const { href, hreflang } of anchors(html)) {
      if (!href?.startsWith('/')) continue;
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

  it('keeps the blog canonical contract unchanged', async () => {
    const blogIndex = await page('en/blog');

    assert.equal(canonicalOf(blogIndex), `${SITE}/en/blog/`);
    await assert.rejects(access(join(outputPath, 'blog', 'index.html')));
  });
});
