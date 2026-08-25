import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, root), 'utf8');
const asDataUrl = (code) => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;

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
