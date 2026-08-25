import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { promisify } from 'node:util';
import { after, describe, it } from 'node:test';

const execFileAsync = promisify(execFile);
const root = new URL('../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));

/**
 * German routes and the English route each one translates.
 *
 * A route declared as German must render natural German for every translatable
 * visible string. These tests read the *generated HTML*, not the serialized
 * translation payload, because a missing translation only becomes visible once
 * a component has rendered it.
 */
const ROUTE_PAIRS = [
  ['de', 'en'],
  ['de/ferienhaeuser', 'en/houses'],
  ['de/lage', 'en/location'],
  ['de/ferienhaeuser/argyro', 'en/houses/argyro'],
  ['de/reisefuehrer/vrouchas', 'en/guide/vrouchas'],
];

/**
 * Strings that are legitimately identical in both languages: proper names,
 * place names, brands, airport codes, bare numbers, and loanwords German uses
 * unchanged. This is an explicit allow-list, never a blanket "ignore English".
 */
const IDENTICAL_BY_DESIGN = [
  /^[^A-Za-z]*$/,
  /^(Mavrikiano|Vrouchas|Elounda|Plaka|Spinalonga|Mirabello|Schisma|Gournia|Kritsa|Lato|Olga|Agios Nikolaos|Heraklion|Sitia)\b/,
  /^(Almond Tree Villa|Elounda Traditional Homes|WebHotelier|Google Maps|traditional-homes\.gr)/,
  /Elounda Traditional Homes/,
  /^(Argyro|Clio|Demetra|Efterpi|Erato|Kalliopi|Leonidas|Margarita|Monastiri|Penelope)\b/,
  /^(FAQ|Blog|Details|Pool|Villa|Balkon|Garten|Veranda|Terrasse|Filter|Taxis|WLAN|Info):?$/,
  // Loanword compounds and counts that read the same in both languages.
  /^(Private Villa · Vrouchas|\d+ Villa)$/,
  /^(HER|JTR|SIT)$/,
  /^\(?\d+([.,]\d+)?\s?(m²|km|m)\)?$/,
  /^https?:\/\//,
];

/** English vocabulary that must never survive into a German gallery caption. */
const ENGLISH_GALLERY_WORDS = [
  'bedroom',
  'bathroom',
  'kitchen',
  'living room',
  'stairs',
  'entrance',
  'sea view',
  'dining',
  'photo of',
  'view all',
  'select ',
];

const strip = (html) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<head[\s\S]*?<\/head>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

/** Every string a reader can actually see: text nodes plus visible attributes. */
const visibleStrings = (html) => {
  const body = strip(html);
  const found = new Set();

  for (const [, text] of body.matchAll(/>([^<>]+)</g)) {
    const value = text.replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ').trim();
    if (value) found.add(value);
  }

  for (const [, value] of body.matchAll(/(?:aria-label|alt|title|placeholder)="([^"]*)"/g)) {
    const text = value.replace(/&amp;/g, '&').trim();
    if (text) found.add(text);
  }

  return found;
};

const altTexts = (html) =>
  [...strip(html).matchAll(/\balt="([^"]*)"/g)].map(([, value]) => value.replace(/&amp;/g, '&'));

const numbersIn = (value) => (String(value).match(/\d+(?:[.,]\d+)?/g) ?? []).map((n) => n.replace(',', '.'));

describe('German visible-language completeness — generated output', async () => {
  const temporaryDirectory = await mkdtemp(join(process.cwd(), '.astro-i18n-visible-'));
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

  for (const [germanRoute, englishRoute] of ROUTE_PAIRS) {
    it(`/${germanRoute}/ shares no untranslated visible string with /${englishRoute}/`, async () => {
      const [germanHtml, englishHtml] = await Promise.all([page(germanRoute), page(englishRoute)]);
      const englishStrings = visibleStrings(englishHtml);

      const untranslated = [...visibleStrings(germanHtml)].filter(
        (value) => englishStrings.has(value) && !IDENTICAL_BY_DESIGN.some((allowed) => allowed.test(value)),
      );

      assert.deepEqual(untranslated, [], `Untranslated on /${germanRoute}/: ${untranslated.join(' | ')}`);
    });
  }

  it('renders German for inventory-derived descriptions on the German house page', async () => {
    const html = await page('de/ferienhaeuser/argyro');

    // Layout, access and bathroom are derived from stable inventory facts.
    assert.match(html, /Erdgeschoss \+ Obergeschoss/);
    assert.match(html, /Innentreppe/);
    assert.doesNotMatch(html, /Ground floor \+ first floor/);
    assert.doesNotMatch(html, /Internal stairs/);

    // Region name, unit names and pairing member names.
    assert.match(html, /Elounda, Kreta/);
    assert.match(html, /Haus Argyro/);
    assert.doesNotMatch(html, /Elounda, Crete/);

    // The English name survives only as the booking provider's item identifier,
    // never as visible text.
    const visible = [...visibleStrings(html)].filter((value) => value.includes('House Argyro'));
    assert.deepEqual(visible, [], `Visible English unit name: ${visible.join(' | ')}`);
    assert.match(html, /data-item-name="House Argyro"/);
  });

  it('renders German for the map cards on the German location page', async () => {
    const html = await page('de/lage');

    assert.match(html, /Gemeinsamer Gästeparkplatz/);
    assert.match(html, /10 Min\. zu Fuß ins Zentrum von Elounda/);
    assert.match(html, /5 Min\. Fahrt zum Strand von Plaka/);
    assert.match(html, /Dorfkarte/);

    assert.doesNotMatch(html, /Shared Guest Parking/);
    assert.doesNotMatch(html, /min walk to Elounda center/);
    assert.doesNotMatch(html, /min drive to Plaka beach/);
    assert.doesNotMatch(html, /Village <span[^>]*>Map/);
    assert.doesNotMatch(html, /Mrs\. Olga/);
  });

  it('renders German gallery captions on the German house page', async () => {
    const html = await page('de/ferienhaeuser/argyro');
    const offenders = altTexts(html).filter((alt) =>
      ENGLISH_GALLERY_WORDS.some((word) => alt.toLowerCase().includes(word)),
    );

    assert.deepEqual(offenders, [], `English gallery captions: ${offenders.join(' | ')}`);
    assert.match(html, /alt="Veranda mit Meerblick"/);
    assert.match(html, /alt="Wohnzimmer mit Kamin"/);
  });

  it('keeps the English master wording on the English routes', async () => {
    const [house, location, erato] = await Promise.all([
      page('en/houses/argyro'),
      page('en/location'),
      page('en/houses/erato'),
    ]);

    assert.match(house, /Ground floor \+ first floor/);
    assert.match(house, /Elounda, Crete/);
    assert.match(house, /House Argyro/);
    assert.match(house, /aria-label="Hero photo of House Argyro"/);
    assert.match(house, /aria-label="Select /);
    assert.match(house, /We personally meet our guests at the parking area/);
    assert.match(location, /Village <span[^>]*>Map<\/span>/);
    assert.match(location, /Mrs\. Olga/);
    assert.match(erato, />1 bathroom</);
  });
});

describe('German presentation mappings stay bound to the factual source', async () => {
  const display = await readJson('src/i18n/locales/de/inventory-display.json');
  const inventory = await readJson('src/inventory/inventory.json');
  const pairings = await readJson('src/inventory/suggested-pairings.json');
  const locationsSource = await readFile(new URL('src/data/locations.ts', root), 'utf8');

  const units = new Map((Array.isArray(inventory) ? inventory : inventory.units).map((unit) => [unit.slug, unit]));

  it('maps only units that exist in the factual inventory', () => {
    const unknown = Object.keys(display.units ?? {}).filter((slug) => !units.has(slug));

    assert.deepEqual(unknown, [], `Not in src/inventory/inventory.json: ${unknown.join(', ')}`);
  });

  it('keeps every number in a German unit mapping identical to the English source', () => {
    const mismatches = [];

    for (const [slug, fields] of Object.entries(display.units ?? {})) {
      const unit = units.get(slug);

      for (const [field, german] of Object.entries(fields)) {
        const factual = unit?.[field];
        if (factual === undefined) continue;

        const source = numbersIn(Array.isArray(factual) ? factual.join(' ') : factual);
        const translated = numbersIn(Array.isArray(german) ? german.join(' ') : german);
        const invented = translated.filter((n) => !source.includes(n));

        if (invented.length) mismatches.push(`${slug}.${field}: ${invented.join(', ')}`);
      }
    }

    assert.deepEqual(mismatches, [], `Numbers not present in the English source: ${mismatches.join(' | ')}`);
  });

  it('keeps list mappings the same length as the factual list', () => {
    const mismatches = [];

    for (const [slug, fields] of Object.entries(display.units ?? {})) {
      for (const field of ['amenities', 'hardConstraints']) {
        const german = fields[field];
        const factual = units.get(slug)?.[field];
        if (!german || !factual) continue;
        if (german.length !== factual.length) mismatches.push(`${slug}.${field}`);
      }
    }

    assert.deepEqual(mismatches, [], `Length differs from the factual list: ${mismatches.join(', ')}`);
  });

  it('keys location phrases by strings the factual source really contains', () => {
    const missing = Object.keys(display.locationPhrases ?? {}).filter(
      (english) => !locationsSource.includes(english),
    );

    assert.deepEqual(missing, [], `Not in src/data/locations.ts: ${missing.join(' | ')}`);

    for (const [english, german] of Object.entries(display.locationPhrases ?? {})) {
      assert.deepEqual(numbersIn(german), numbersIn(english), `Numbers changed for "${english}"`);
    }
  });

  it('keys location entries by ids the factual source really declares', () => {
    const unknown = Object.keys(display.locations ?? {}).filter(
      (id) => !locationsSource.includes(`id: "${id}"`),
    );

    assert.deepEqual(unknown, [], `Not an id in src/data/locations.ts: ${unknown.join(', ')}`);
  });

  it('keys pairing summaries by the English summary they present', () => {
    const summaries = new Set(pairings.map((pairing) => pairing.summary));
    const unknown = Object.keys(display.pairings ?? {}).filter((english) => !summaries.has(english));

    assert.deepEqual(unknown, [], `Not a summary in suggested-pairings.json: ${unknown.join(' | ')}`);

    for (const [english, german] of Object.entries(display.pairings ?? {})) {
      assert.deepEqual(numbersIn(german), numbersIn(english), `Numbers changed for "${english}"`);
    }
  });

  it('never introduces a unit name that changes the proper name', () => {
    for (const [slug, fields] of Object.entries(display.units ?? {})) {
      if (!fields.name) continue;
      const properName = units.get(slug).name.replace(/^House\s+/, '');
      assert.ok(
        fields.name.includes(properName),
        `German name for ${slug} drops the proper name "${properName}"`,
      );
    }
  });
});
