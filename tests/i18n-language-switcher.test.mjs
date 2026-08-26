import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, root), 'utf8');
const asDataUrl = (code) => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;

/** Stable internal ids. Public paths always come from the route map. */
const HOUSE_SLUGS = [
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

const loadLanguageSwitcher = async () => {
  const ts = (await import('typescript')).default;
  const transpile = async (path) => {
    const source = await readText(path);
    return ts.transpileModule(source, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;
  };

  const config = asDataUrl(await transpile('src/i18n/config.ts'));
  const routeMap = asDataUrl((await transpile('src/i18n/route-map.ts')).replaceAll("'./config'", `'${config}'`));
  const languageSwitcher = asDataUrl(
    (await transpile('src/i18n/language-switcher.ts'))
      .replaceAll("'./config'", `'${config}'`)
      .replaceAll("'./route-map'", `'${routeMap}'`),
  );

  return import(languageSwitcher);
};

test('language switcher exposes only launched locales and prefers equivalent routes', async () => {
  const { getLanguageSwitcherLinks } = await loadLanguageSwitcher();

  const home = getLanguageSwitcherLinks('en', '/en/');
  assert.deepEqual(home.map(({ locale, href, isActive }) => ({ locale, href, isActive })), [
    { locale: 'en', href: '/en/', isActive: true },
    { locale: 'de', href: '/de/', isActive: false },
  ]);

  const argyro = getLanguageSwitcherLinks('en', '/en/houses/argyro/');
  assert.equal(argyro.find((link) => link.locale === 'de')?.href, '/de/ferienhaeuser/argyro/');
  assert.equal(argyro.find((link) => link.locale === 'de')?.isFallbackToHome, false);

  const germanLocation = getLanguageSwitcherLinks('de', '/de/lage/');
  assert.equal(germanLocation.find((link) => link.locale === 'en')?.href, '/en/location/');
});

test('language switcher never fabricates an English segment under /de/', async () => {
  const { getLanguageSwitcherLinks } = await loadLanguageSwitcher();

  // A translated segment is never inferred, so the reported preview URL must be
  // unreachable from every branch of the resolver, for every property.
  for (const slug of HOUSE_SLUGS) {
    for (const path of [`/en/houses/${slug}/`, `/de/ferienhaeuser/${slug}/`]) {
      for (const locale of ['en', 'de']) {
        for (const link of getLanguageSwitcherLinks(locale, path)) {
          assert.notEqual(link.href, `/de/houses/${slug}/`);
          assert.doesNotMatch(link.href, /^\/de\/houses\//, `${link.href} fabricates an English segment under /de/`);
        }
      }
    }
  }
});

test('language switcher resolves every translated property to its exact equivalent', async () => {
  const { getLanguageSwitcherLinks } = await loadLanguageSwitcher();

  for (const slug of HOUSE_SLUGS) {
    const toGerman = getLanguageSwitcherLinks('en', `/en/houses/${slug}/`).find((link) => link.locale === 'de');
    const toEnglish = getLanguageSwitcherLinks('de', `/de/ferienhaeuser/${slug}/`).find((link) => link.locale === 'en');

    assert.equal(toGerman?.href, `/de/ferienhaeuser/${slug}/`, `${slug} must switch to its German page`);
    assert.equal(toGerman?.fallback, 'none', `${slug} must not fall back`);
    assert.equal(toEnglish?.href, `/en/houses/${slug}/`, `${slug} must switch back to its English page`);
    assert.equal(toEnglish?.fallback, 'none', `${slug} must not fall back`);
  }

  const villaToGerman = getLanguageSwitcherLinks('en', '/en/villa/almond-tree-villa/').find((l) => l.locale === 'de');
  const villaToEnglish = getLanguageSwitcherLinks('de', '/de/villa/almond-tree-villa/').find((l) => l.locale === 'en');

  assert.equal(villaToGerman?.href, '/de/villa/almond-tree-villa/');
  assert.equal(villaToGerman?.fallback, 'none');
  assert.equal(villaToEnglish?.href, '/en/villa/almond-tree-villa/');
  assert.equal(villaToEnglish?.fallback, 'none');
});

test('language switcher prefers a real equivalent over the parent fallback', async () => {
  const { getLanguageSwitcherLinks } = await loadLanguageSwitcher();
  const german = getLanguageSwitcherLinks('en', '/en/houses/argyro/').find((link) => link.locale === 'de');

  assert.equal(german?.href, '/de/ferienhaeuser/argyro/');
  assert.equal(german?.fallback, 'none');
});

test('language switcher keeps the parent fallback available for untranslated content', async () => {
  const { getLanguageSwitcherLinks } = await loadLanguageSwitcher();

  /**
   * Every real property is translated now, so the parent tier is exercised
   * against a fixture map — the shape the real map had before that batch —
   * rather than against a page that no longer exists. The tier stays a safety
   * mechanism for genuinely untranslated future content, not normal behaviour.
   */
  const fixture = {
    home: { segments: { en: [], de: [] } },
    houses: { segments: { en: ['houses'], de: ['ferienhaeuser'] } },
    house: {
      segments: { en: ['houses'], de: ['ferienhaeuser'] },
      dynamic: true,
      content: { monastiri: { en: 'monastiri' } },
    },
    villa: { segments: { en: ['villa'] }, dynamic: true },
  };
  const german = (path) => getLanguageSwitcherLinks('en', path, fixture).find((link) => link.locale === 'de');

  assert.equal(german('/en/houses/monastiri/')?.href, '/de/ferienhaeuser/');
  assert.equal(german('/en/houses/monastiri/')?.fallback, 'parent');
  assert.equal(german('/en/houses/monastiri/')?.isFallbackToHome, false);
  assert.equal(german('/en/villa/almond-tree-villa/')?.href, '/de/ferienhaeuser/');
  assert.equal(german('/en/villa/almond-tree-villa/')?.fallback, 'parent');
});

test('language switcher falls back to the target homepage when nothing else exists', async () => {
  const { getLanguageSwitcherLinks } = await loadLanguageSwitcher();

  // A route with no declared parent still lands on a page that exists.
  const faq = getLanguageSwitcherLinks('en', '/en/faq/').find((link) => link.locale === 'de');
  assert.equal(faq?.href, '/de/');
  assert.equal(faq?.fallback, 'home');

  // An unknown path is not matched, and is never turned into a locale URL.
  const unknown = getLanguageSwitcherLinks('en', '/en/nothing-here/').find((link) => link.locale === 'de');
  assert.equal(unknown?.href, '/de/');
});

test('language switcher falls back to the real target homepage when no equivalent page exists', async () => {
  const { getLanguageSwitcherLinks } = await loadLanguageSwitcher();

  const contact = getLanguageSwitcherLinks('en', '/en/contact/');
  const german = contact.find((link) => link.locale === 'de');

  assert.equal(german?.href, '/de/');
  assert.equal(german?.isFallbackToHome, true);
  assert.equal(german?.label, 'Deutsch');
  assert.equal(german?.shortLabel, 'DE');
});

test('header renders compact desktop and native-label mobile language selectors', async () => {
  const [header, enNavigation, deNavigation] = await Promise.all([
    readText('src/components/Header.astro'),
    readText('src/i18n/locales/en/navigation.json'),
    readText('src/i18n/locales/de/navigation.json'),
  ]);

  assert.match(header, /getLanguageSwitcherLinks\(locale, currentPath\)/);
  assert.match(header, /data-language-switcher="desktop"/);
  assert.match(header, /data-language-switcher="mobile"/);
  assert.match(header, /\{link\.shortLabel\}/);
  assert.match(header, /\{link\.label\}/);

  // Both selectors mark their anchors, so the navigation contract tests can tell a
  // deliberate cross-locale link apart from an unwanted English fallback.
  const [, desktopBlock, mobileBlock] = header.split(/data-language-switcher="(?:desktop|mobile)"/);

  assert.match(desktopBlock, /<a\b[\s\S]*?data-language-switcher-link/, 'desktop selector anchor must be marked');
  assert.match(mobileBlock, /<a\b[\s\S]*?data-language-switcher-link/, 'mobile selector anchor must be marked');
  assert.equal((header.match(/data-language-switcher-link/g) ?? []).length, 2);
  assert.match(enNavigation, /"languageSwitcherLabel": "Language"/);
  assert.match(deNavigation, /"languageSwitcherLabel": "Sprache"/);
});

test('German primary navigation exposes only routes that currently have German pages', async () => {
  const navigation = JSON.parse(await readText('src/i18n/locales/de/navigation.json'));

  assert.deepEqual(
    navigation.main.map(({ label, href }) => ({ label, href })),
    [
      { label: 'Häuser', href: '/en/houses/' },
      { label: 'Lage', href: '/en/location/' },
    ],
  );

  const authoredFallbacks = navigation.main.filter(({ href }) =>
    ['/en/villa/', '/en/faq/', '/en/about/', '/en/blog/', '/en/contact/'].some((prefix) => href.startsWith(prefix)),
  );
  assert.deepEqual(authoredFallbacks, []);
});
