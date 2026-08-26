import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { promisify } from 'node:util';
import { after, describe, it } from 'node:test';

const execFileAsync = promisify(execFile);

const root = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, root), 'utf8');
const readJson = async (path) => JSON.parse(await readText(path));
const exists = async (path) => {
  try {
    await access(new URL(path, root));
    return true;
  } catch {
    return false;
  }
};

const SITE = 'https://traditional-homes.gr';

/**
 * Internal content ids, identical in every locale. The public path is derived
 * from `src/i18n/route-map.ts`, never by substituting `/en/` with `/de/`.
 */
const HOUSE_IDS = [
  'argyro',
  'leonidas',
  'margarita',
  'demetra',
  'penelope',
  'erato',
  'clio',
  'efterpi',
  'kalliopi',
  'monastiri',
];
const VILLA_ID = 'almond-tree-villa';

const enHouse = (id) => `/en/houses/${id}/`;
const deHouse = (id) => `/de/ferienhaeuser/${id}/`;
const EN_VILLA = `/en/villa/${VILLA_ID}/`;
const DE_VILLA = `/de/villa/${VILLA_ID}/`;

/** Every property as an EN/DE pair, so no test hard-codes one property. */
const PROPERTY_PAIRS = [
  ...HOUSE_IDS.map((id) => ({ id, en: enHouse(id), de: deHouse(id) })),
  { id: VILLA_ID, en: EN_VILLA, de: DE_VILLA },
];

const anchors = (html) =>
  [...html.matchAll(/<a\b([^>]*)>/g)].map(([, attrs]) => ({
    href: attrs.match(/\bhref="([^"]*)"/)?.[1],
    hreflang: attrs.match(/\bhreflang="([^"]*)"/)?.[1],
    lang: attrs.match(/\blang="([^"]*)"/)?.[1],
    isLanguageSwitcher: /\bdata-language-switcher-link\b/.test(attrs),
  }));

const alternates = (html) =>
  [...html.matchAll(/<link rel="alternate"([^>]*)>/g)].map(([, attrs]) => ({
    hreflang: attrs.match(/\bhreflang="([^"]*)"/)?.[1],
    href: attrs.match(/\bhref="([^"]*)"/)?.[1],
  }));

const canonicalOf = (html) => html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];

const asDataUrl = (code) => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;

/** Run the real i18n modules unmodified, with their dependency graph inlined. */
const loadModules = async () => {
  const ts = (await import('typescript')).default;
  const transpile = async (name) =>
    ts.transpileModule(await readText(`src/i18n/${name}.ts`), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;

  const config = asDataUrl(await transpile('config'));
  const routeMap = asDataUrl((await transpile('route-map')).replaceAll("'./config'", `'${config}'`));
  const languageSwitcher = asDataUrl(
    (await transpile('language-switcher'))
      .replaceAll("'./config'", `'${config}'`)
      .replaceAll("'./route-map'", `'${routeMap}'`),
  );

  return { routeMap: await import(routeMap), languageSwitcher: await import(languageSwitcher) };
};

describe('German property details — route map and sources', () => {
  it('declares a German slug for every house and for the villa', async () => {
    const { routeMap } = await loadModules();

    for (const { id, en, de } of PROPERTY_PAIRS) {
      const routeId = id === VILLA_ID ? 'villa' : 'house';

      assert.equal(routeMap.resolveRoute('en', routeId, id), en, `${id}: English route`);
      assert.equal(routeMap.resolveRoute('de', routeId, id), de, `${id}: German route`);
      // The property's proper name keeps its internal slug in both locales.
      assert.equal(routeMap.publicSlug('de', routeId, id), id, `${id}: German slug must stay stable`);
    }
  });

  it('declares the German villa segment rather than reusing the English path', async () => {
    const map = await readText('src/i18n/route-map.ts');

    assert.match(map, /segments: \{ en: \['villa'\], de: \['villa'\] \}/);
    // Nothing is inferred: an undeclared locale still has no villa route.
    const { routeMap } = await loadModules();
    for (const locale of ['fr', 'ru', 'zh', 'ar', 'he']) {
      assert.equal(routeMap.resolveRoute(locale, 'villa', VILLA_ID), null, `${locale} must own no villa route`);
    }
  });

  it('ships a German content master for every declared German property route', async () => {
    for (const id of HOUSE_IDS) {
      assert.equal(await exists(`src/content/houses/de/${id}.md`), true, `missing src/content/houses/de/${id}.md`);
    }
    assert.equal(await exists(`src/content/villa/de/${VILLA_ID}.md`), true);
  });

  it('reuses one renderer per property type instead of forking it per locale', async () => {
    const routeFiles = [
      'src/pages/en/houses/[slug].astro',
      'src/pages/de/ferienhaeuser/[slug].astro',
      'src/pages/en/villa/[slug].astro',
      'src/pages/de/villa/[slug].astro',
    ];

    for (const file of routeFiles) {
      const source = await readText(file);

      assert.doesNotMatch(source, /<article|prose prose-stone|<nav\b|aria-label=/, `${file} duplicates page markup`);
      assert.ok(source.split('\n').length < 30, `${file} should stay a thin wrapper`);
    }

    assert.match(await readText('src/pages/de/villa/[slug].astro'), /locale="de"/);
    assert.match(await readText('src/pages/en/villa/[slug].astro'), /locale=\{defaultLocale\}/);

    const villaRenderer = await readText('src/components/pages/VillaDetailPage.astro');

    assert.match(villaRenderer, /locale: Locale;/);
    assert.match(villaRenderer, /assertRoute\(locale, 'villa', slug\)/);
    assert.match(villaRenderer, /routePath\(locale, 'villa', slug\)/);
    assert.match(villaRenderer, /routeAlternates\('villa', slug\)/);
    // The renderer must never infer the active locale from route state.
    assert.doesNotMatch(villaRenderer, /Astro\.url|Astro\.currentLocale|Astro\.params/);
  });

  it('generates German property routes only from the route map', async () => {
    for (const file of ['src/pages/de/ferienhaeuser/[slug].astro', 'src/pages/de/villa/[slug].astro']) {
      const source = await readText(file);

      assert.match(source, /publicSlug\('de', '(house|villa)', unit\.slug\)/, `${file} must ask the route map`);
      assert.match(source, /return slug \? \[/, `${file} must skip content the map does not declare`);
    }
  });
});

describe('German property details — language switcher', () => {
  it('resolves every property to its exact equivalent in the other locale', async () => {
    const { languageSwitcher } = await loadModules();
    const { getLanguageSwitcherLinks } = languageSwitcher;

    for (const { id, en, de } of PROPERTY_PAIRS) {
      const toGerman = getLanguageSwitcherLinks('en', en).find((link) => link.locale === 'de');
      const toEnglish = getLanguageSwitcherLinks('de', de).find((link) => link.locale === 'en');

      assert.equal(toGerman?.href, de, `${id}: EN must switch to the German equivalent`);
      assert.equal(toGerman?.fallback, 'none', `${id}: EN must not fall back`);
      assert.equal(toEnglish?.href, en, `${id}: DE must switch to the English equivalent`);
      assert.equal(toEnglish?.fallback, 'none', `${id}: DE must not fall back`);
    }
  });

  it('never produces an English path segment under /de/', async () => {
    const { languageSwitcher } = await loadModules();

    for (const { en, de } of PROPERTY_PAIRS) {
      for (const path of [en, de]) {
        for (const locale of ['en', 'de']) {
          for (const link of languageSwitcher.getLanguageSwitcherLinks(locale, path)) {
            assert.doesNotMatch(link.href, /^\/de\/houses\//, `${path} produced ${link.href}`);
          }
        }
      }
    }
  });

  it('keeps the parent and homepage fallback tiers working for untranslated content', async () => {
    const { languageSwitcher } = await loadModules();

    /**
     * Every real property is translated now, so the fallback tiers are exercised
     * against a fixture map rather than against a page that no longer exists.
     * The fixture is the shape the real map had before this batch.
     */
    const fixture = {
      home: { segments: { en: [], de: [] } },
      houses: { segments: { en: ['houses'], de: ['ferienhaeuser'] } },
      house: {
        segments: { en: ['houses'], de: ['ferienhaeuser'] },
        dynamic: true,
        content: { argyro: { en: 'argyro', de: 'argyro' }, monastiri: { en: 'monastiri' } },
      },
      villa: { segments: { en: ['villa'] }, dynamic: true },
      faq: { segments: { en: ['faq'] } },
    };
    const german = (path) =>
      languageSwitcher.getLanguageSwitcherLinks('en', path, fixture).find((link) => link.locale === 'de');

    // Tier 1 — a real equivalent always wins.
    assert.equal(german('/en/houses/argyro/')?.href, '/de/ferienhaeuser/argyro/');
    assert.equal(german('/en/houses/argyro/')?.fallback, 'none');

    // Tier 2 — the declared parent, never a fabricated deep URL.
    assert.equal(german('/en/houses/monastiri/')?.href, '/de/ferienhaeuser/');
    assert.equal(german('/en/houses/monastiri/')?.fallback, 'parent');
    assert.equal(german(`/en/villa/${VILLA_ID}/`)?.href, '/de/ferienhaeuser/');

    // Tier 3 — the target locale homepage.
    assert.equal(german('/en/faq/')?.href, '/de/');
    assert.equal(german('/en/faq/')?.fallback, 'home');
  });
});

describe('German property details — presentation stays bound to inventory', () => {
  it('adds no property to the German presentation that the inventory does not own', async () => {
    const display = await readJson('src/i18n/locales/de/inventory-display.json');
    const inventory = await readJson('src/inventory/inventory.json');
    const slugs = new Set(inventory.map((unit) => unit.slug));

    const unknown = Object.keys(display.units ?? {}).filter((slug) => !slugs.has(slug));
    assert.deepEqual(unknown, [], `Not in src/inventory/inventory.json: ${unknown.join(', ')}`);

    // Every property the route map declares for German is really presented.
    for (const { id } of PROPERTY_PAIRS) {
      assert.ok(display.units?.[id], `${id} has a German route but no German presentation`);
    }
  });

  it('keeps every German locale resource free of factual inventory values', async () => {
    const files = await readdir(new URL('src/i18n/locales/de/', root));

    for (const file of files) {
      const contents = await readText(`src/i18n/locales/de/${file}`);

      assert.doesNotMatch(
        contents,
        /"bookingId"|"roomCode"|"availabilityUrl"|"latitude"|"longitude"|"lat"|"lng"|reserve-online/i,
        `de/${file} must not carry operational inventory data`,
      );
    }

    // The presentation file describes; it never declares a fact of its own.
    const display = await readJson('src/i18n/locales/de/inventory-display.json');
    const factualKeys = ['sleeps', 'bedrooms', 'bathrooms', 'areaSqm', 'floors', 'pool', 'internalStairs', 'slug', 'type'];

    for (const [slug, fields] of Object.entries(display.units ?? {})) {
      for (const key of factualKeys) {
        assert.ok(!(key in fields), `de presentation for ${slug} declares the factual field "${key}"`);
      }
    }
  });
});

describe('German property details — generated output', async () => {
  const temporaryDirectory = await mkdtemp(join(process.cwd(), '.astro-i18n-property-'));
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
  const htmlFiles = async () =>
    (await readdir(outputPath, { recursive: true, withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
      .map((entry) => join(entry.parentPath ?? entry.path, entry.name));

  it('builds a real page for every declared German property route', async () => {
    for (const { id, de } of PROPERTY_PAIRS) {
      await access(join(outputPath, de, 'index.html'));
      assert.match(await page(de.replace(/^\/|\/$/g, '')), /<html lang="de" dir="ltr">/, `${id} must render as German`);
    }
  });

  it('emits no /de/houses/ URL anywhere in the generated site', async () => {
    const offenders = [];

    for (const file of await htmlFiles()) {
      const html = await readFile(file, 'utf8');

      if (/(?:href|content)="(?:https:\/\/traditional-homes\.gr)?\/de\/houses\//.test(html)) {
        offenders.push(relative(outputPath, file));
      }
    }

    assert.deepEqual(offenders, []);
  });

  it('switches every property to the exact equivalent in the generated pages', async () => {
    for (const { id, en, de } of PROPERTY_PAIRS) {
      const fromEnglish = anchors(await page(en.replace(/^\/|\/$/g, '')))
        .filter((link) => link.isLanguageSwitcher && link.href?.startsWith('/de/'))
        .map((link) => link.href);
      const fromGerman = anchors(await page(de.replace(/^\/|\/$/g, '')))
        .filter((link) => link.isLanguageSwitcher && link.href?.startsWith('/en/'))
        .map((link) => link.href);

      assert.ok(fromEnglish.length > 0, `${id}: the English page must offer a German choice`);
      assert.deepEqual([...new Set(fromEnglish)], [de], `${id}: English page switched to ${fromEnglish}`);
      assert.ok(fromGerman.length > 0, `${id}: the German page must offer an English choice`);
      assert.deepEqual([...new Set(fromGerman)], [en], `${id}: German page switched to ${fromGerman}`);

      for (const href of [...fromEnglish, ...fromGerman]) {
        await access(join(outputPath, href, 'index.html'));
      }
    }
  });

  it('links every German property card to its German detail page', async () => {
    const html = await page('de/ferienhaeuser');
    const germanCopy = await readJson('src/i18n/locales/de/common.json');
    const fallbackLabel = germanCopy.ui.property.card.detailsInEnglish;
    const cards = [...html.matchAll(/<article[\s\S]*?<\/article>/g)].map(([card]) => card);
    const byId = new Map(PROPERTY_PAIRS.map((pair) => [pair.id, pair]));

    assert.ok(cards.length >= 11, `expected every property to render a card, found ${cards.length}`);

    let covered = 0;

    for (const card of cards) {
      const slug = card.match(/data-id="([^"]+)"/)?.[1];
      const links = anchors(card).filter((link) => link.href?.startsWith('/'));

      assert.ok(links.length > 0, `${slug} card has no internal link`);

      for (const { href, hreflang } of links) {
        assert.doesNotMatch(href, /^\/de\/houses\//, `${slug}: ${href} fabricates a German route`);
        assert.ok(!href.startsWith('/en/'), `${slug}: a translated card must not link to ${href}`);
        assert.equal(hreflang, undefined, `${slug}: ${href} is in-locale and must not be marked`);
        await access(join(outputPath, href.split('#')[0], 'index.html'));
      }

      assert.ok(!card.includes(fallbackLabel), `${slug}: a translated card must not say "${fallbackLabel}"`);

      // Group cards offer their members, so only single-property cards are
      // required to point every link at one detail page.
      if (slug?.startsWith('group-')) continue;

      const pair = byId.get(slug);
      assert.ok(pair, `unexpected card id ${slug}`);
      assert.ok(
        links.every(({ href }) => href === pair.de),
        `${slug}: every card link must point at ${pair.de}`,
      );
      covered += 1;
    }

    assert.equal(covered, PROPERTY_PAIRS.length, 'every property must have a translated card');
  });

  it('keeps inventory the single factual source on every German property page', async () => {
    const inventory = await readJson('src/inventory/inventory.json');

    for (const unit of inventory) {
      const route = unit.type === 'villa' ? `de/villa/${unit.slug}` : `de/ferienhaeuser/${unit.slug}`;
      const html = await page(route);
      const english = await page(unit.type === 'villa' ? `en/villa/${unit.slug}` : `en/houses/${unit.slug}`);
      const facts = (source) => ({
        sleeps: [...source.matchAll(/(\d+)\s*(?:Personen|Gäste|guests)/gi)].length,
        area: source.includes(`${unit.areaSqm} m²`),
        bedrooms: source.includes(String(unit.bedrooms)),
      });

      assert.ok(html.includes(String(unit.sleeps)), `${unit.slug}: sleeps must come from inventory`);
      assert.ok(html.includes(String(unit.bedrooms)), `${unit.slug}: bedrooms must come from inventory`);
      assert.equal(facts(html).area, facts(english).area, `${unit.slug}: floor area must not diverge`);
      assert.equal(facts(html).bedrooms, facts(english).bedrooms, `${unit.slug}: bedrooms must not diverge`);

      // The booking payload keeps the untranslated inventory identity.
      assert.match(html, new RegExp(`data-item-name="${unit.name}"`), `${unit.slug}: booking item name`);

      // A German page never advertises a pool the inventory does not record.
      const germanPoolWords = /Privater Pool|Gemeinsamer Pool|Tauchpool/;
      if (unit.pool === 'none' && unit.slug !== 'clio') {
        assert.doesNotMatch(html, germanPoolWords, `${unit.slug}: no pool in inventory, none on the page`);
      }
    }
  });

  it('names a shared-pool neighbour from the inventory, never from its slug', async () => {
    const inventory = await readJson('src/inventory/inventory.json');
    const display = await readJson('src/i18n/locales/de/inventory-display.json');
    const sharing = inventory.filter((unit) => unit.pool === 'shared' && unit.sharedPoolWith?.length);

    assert.ok(sharing.length > 0, 'the inventory must contain a shared-pool property to cover');

    for (const unit of sharing) {
      const english = await page(`en/houses/${unit.slug}`);
      const german = await page(`de/ferienhaeuser/${unit.slug}`);

      for (const neighbourSlug of unit.sharedPoolWith) {
        const neighbour = inventory.find((candidate) => candidate.slug === neighbourSlug);
        const germanName = display.units?.[neighbourSlug]?.name;

        assert.ok(neighbour, `${neighbourSlug} must exist in the inventory`);
        assert.ok(germanName, `${neighbourSlug} must have a German presentation name`);

        // English renders the factual inventory name; German renders the locale's
        // presentation of that same name. Neither renders the routing key.
        assert.match(english, new RegExp(`>\\s*${neighbour.name}\\s*<`), `${unit.slug}: English name`);
        assert.match(german, new RegExp(`>\\s*${germanName}\\s*<`), `${unit.slug}: German name`);

        for (const [locale, html] of [['en', english], ['de', german]]) {
          assert.doesNotMatch(
            html,
            new RegExp(`>\\s*${neighbourSlug}\\s*<`),
            `${unit.slug}: the ${locale} page renders the slug "${neighbourSlug}" as a visible name`,
          );
        }

        // The link itself stays route-derived in the active locale.
        assert.ok(english.includes(`href="/en/houses/${neighbourSlug}/"`), `${unit.slug}: English href`);
        assert.ok(german.includes(`href="/de/ferienhaeuser/${neighbourSlug}/"`), `${unit.slug}: German href`);
      }
    }
  });

  it('self-canonicalises both locales and advertises reciprocal alternates only', async () => {
    for (const { id, en, de } of PROPERTY_PAIRS) {
      const germanHtml = await page(de.replace(/^\/|\/$/g, ''));
      const englishHtml = await page(en.replace(/^\/|\/$/g, ''));

      assert.equal(canonicalOf(germanHtml), `${SITE}${de}`, `${id}: German canonical`);
      assert.equal(canonicalOf(englishHtml), `${SITE}${en}`, `${id}: English canonical`);

      const expected = [
        { hreflang: 'en', href: `${SITE}${en}` },
        { hreflang: 'de', href: `${SITE}${de}` },
        { hreflang: 'x-default', href: `${SITE}${en}` },
      ];

      assert.deepEqual(alternates(germanHtml), expected, `${id}: German alternates`);
      assert.deepEqual(alternates(englishHtml), expected, `${id}: English alternates`);
    }
  });

  it('lists every real German route in the sitemap and nothing else', async () => {
    const sitemap = await readFile(join(outputPath, 'sitemap-0.xml'), 'utf8');
    const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => url);
    const german = urls.filter((url) => url.startsWith(`${SITE}/de/`)).sort();

    assert.deepEqual(german, [
      `${SITE}/de/`,
      `${SITE}/de/ferienhaeuser/`,
      ...HOUSE_IDS.map((id) => `${SITE}${deHouse(id)}`).sort(),
      `${SITE}/de/lage/`,
      `${SITE}/de/reisefuehrer/vrouchas/`,
      `${SITE}${DE_VILLA}`,
    ].sort());

    for (const url of urls) {
      await access(join(outputPath, new URL(url).pathname, 'index.html'));
    }
  });

  it('keeps every internal link on a German property page pointing at a page that exists', async () => {
    for (const { id, de } of PROPERTY_PAIRS) {
      const html = await page(de.replace(/^\/|\/$/g, ''));

      for (const { href, hreflang, isLanguageSwitcher } of anchors(html)) {
        if (!href?.startsWith('/')) continue;

        await access(join(outputPath, href.split('#')[0].split('?')[0], 'index.html'));

        if (isLanguageSwitcher) continue;

        if (href.startsWith('/de/')) {
          assert.equal(hreflang, undefined, `${id}: ${href} is in-locale and must not carry hreflang`);
        } else {
          // Contact, FAQ, policies and the blog are still English only, and a
          // link that leaves German has to say so.
          assert.equal(hreflang, 'en', `${id}: ${href} leaves German without hreflang="en"`);
        }
      }
    }
  });

  it('sends no German property visitor to an English page that has a German equivalent', async () => {
    const germanEquivalents = new Set([
      '/en/',
      '/en/houses/',
      '/en/location/',
      '/en/guide/vrouchas/',
      ...PROPERTY_PAIRS.map((pair) => pair.en),
    ]);

    for (const file of await htmlFiles()) {
      const route = relative(outputPath, file).replace(/\\/g, '/');
      if (!route.startsWith('de/')) continue;

      const html = await readFile(file, 'utf8');

      for (const { href, isLanguageSwitcher } of anchors(html)) {
        if (isLanguageSwitcher || !href?.startsWith('/en/')) continue;

        const pathname = href.split('#')[0].split('?')[0];
        assert.ok(
          !germanEquivalents.has(pathname),
          `${route}: ${href} has a real German equivalent and must not fall back`,
        );
      }
    }
  });

  it('gives every German property page German metadata that matches the English intent', async () => {
    for (const { id, de } of PROPERTY_PAIRS) {
      const html = await page(de.replace(/^\/|\/$/g, ''));
      const title = html.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? '';
      const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
      const headings = html.match(/<h1[\s>]/g) ?? [];

      assert.equal(headings.length, 1, `${id}: exactly one H1`);
      assert.ok(title.length > 0 && title.includes('Elounda Traditional Homes'), `${id}: title was ${title}`);
      assert.ok(description.length > 0 && description.length <= 220, `${id}: description was ${description}`);
      // The metadata names the property, not a generic collection page.
      const properName = id === VILLA_ID ? 'Almond Tree Villa' : id[0].toUpperCase() + id.slice(1);
      assert.ok(title.includes(properName), `${id}: title must name the property`);
      assert.ok(description.includes(properName), `${id}: description must name the property`);
    }
  });
});
