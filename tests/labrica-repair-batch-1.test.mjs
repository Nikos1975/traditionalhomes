import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

const readText = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

function parseRedirects(source) {
  return source
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+#.*$/, '').trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const [from, to, status, ...extra] = line.split(/\s+/);
      assert.deepEqual(extra, [], `Unexpected redirect fields in: ${line}`);
      return { from, to, status: Number(status) };
    });
}

const expectedRedirects = [
  { from: '/', to: '/en/', status: 301 },
  { from: '/index.php', to: '/en/', status: 301 },
  { from: '/index.php/', to: '/en/', status: 301 },
  { from: '/index.php/en', to: '/en/', status: 301 },
  { from: '/index.php/en/', to: '/en/', status: 301 },
  { from: '/index.php/en/about-us-2', to: '/en/houses/', status: 301 },
  { from: '/index.php/en/about-us-2/', to: '/en/houses/', status: 301 },
  { from: '/index.php/en/about-us-2/argyro', to: '/en/houses/argyro/', status: 301 },
  { from: '/index.php/en/about-us-2/clio', to: '/en/houses/clio/', status: 301 },
  { from: '/index.php/en/about-us-2/dimitra', to: '/en/houses/demetra/', status: 301 },
  { from: '/index.php/en/about-us-2/efterpi', to: '/en/houses/efterpi/', status: 301 },
  { from: '/index.php/en/about-us-2/erato', to: '/en/houses/erato/', status: 301 },
  { from: '/index.php/en/about-us-2/kalliopi', to: '/en/houses/kalliopi/', status: 301 },
  { from: '/index.php/en/about-us-2/leonidas', to: '/en/houses/leonidas/', status: 301 },
  { from: '/index.php/en/about-us-2/margarita', to: '/en/houses/margarita/', status: 301 },
  { from: '/index.php/en/about-us-2/monastery', to: '/en/houses/monastiri/', status: 301 },
  { from: '/index.php/en/about-us-2/penelope', to: '/en/houses/penelope/', status: 301 },
  { from: '/index.php/en/almond-tree-villas', to: '/en/villa/almond-tree-villa/', status: 301 },
  { from: '/index.php/en/contact', to: '/en/contact/', status: 301 },
  { from: '/index.php/en/elounda', to: '/en/location/', status: 301 },
  { from: '/en', to: '/en/', status: 301 },
  { from: '/en/houses', to: '/en/houses/', status: 301 },
  { from: '/en/location', to: '/en/location/', status: 301 },
  { from: '/en/faq', to: '/en/faq/', status: 301 },
  { from: '/en/policies', to: '/en/policies/', status: 301 },
  { from: '/en/about', to: '/en/about/', status: 301 },
  { from: '/en/contact', to: '/en/contact/', status: 301 },
];

describe('Labrica repair batch 1', () => {
  it('keeps the parking marker visible without generating an internal details link', async () => {
    const map = await readText('src/components/maps/MasterLocationMap.astro');
    const locations = await readText('src/data/locations.ts');
    const inventory = JSON.parse(await readText('src/inventory/inventory.json'));

    assert.match(
      locations,
      /id: "private-car-parking"[\s\S]*type: "parking"[\s\S]*title: "Shared Guest Parking"/,
    );
    assert.equal(inventory.some((unit) => unit.slug === 'private-car-parking'), false);
    assert.match(map, /const allLocs = locations\.filter[\s\S]*return \{[\s\S]*\.\.\.loc/);
    assert.match(map, /const markers = allLocs\.map[\s\S]*id:\s*loc\.id[\s\S]*url:\s*loc\.detailsUrl/);
    assert.match(map, /const detailsUrl = unit[\s\S]*villaPath\(unit\.slug, defaultLocale\)[\s\S]*housePath\(unit\.slug, defaultLocale\)[\s\S]*undefined/);
    assert.match(map, /url:\s*loc\.detailsUrl/);
    assert.match(map, /\{loc\.detailsUrl && \([\s\S]*href=\{loc\.detailsUrl\}/);
    assert.doesNotMatch(map, /loc\.type === 'villa' \? villaPath\(loc\.slug\) : housePath\(loc\.slug\)/);
    assert.doesNotMatch(map, /private-car-parking/);
  });

  it('keeps valid house markers linked to their generated detail routes', async () => {
    const map = await readText('src/components/maps/MasterLocationMap.astro');
    const inventory = JSON.parse(await readText('src/inventory/inventory.json'));

    assert.equal(inventory.find((unit) => unit.slug === 'argyro')?.type, 'house');
    assert.match(
      map,
      /const unit = units\.find[\s\S]*const detailsUrl = unit[\s\S]*unit\.type === 'villa'[\s\S]*villaPath\(unit\.slug, defaultLocale\)[\s\S]*housePath\(unit\.slug, defaultLocale\)/,
    );
    assert.match(map, /href=\{loc\.detailsUrl\}/);
  });

  it('points the villa breadcrumb to the generated houses collection route', async () => {
    const villaPage = await readText('src/pages/en/villa/[slug].astro');

    await access(new URL('../src/pages/en/houses/index.astro', import.meta.url));
    assert.match(
      villaPage,
      /<a href=\{localizedPath\(defaultLocale, 'houses'\)}[^>]*>Houses<\/a>/,
    );
    assert.doesNotMatch(villaPage, />Villa<\/a>/);
    assert.doesNotMatch(villaPage, /localizedPath\(defaultLocale, 'villa'\)/);
  });

  it('keeps the complete legacy redirect table exact while adding only the two approved rules', async () => {
    const redirects = parseRedirects(await readText('public/_redirects'));

    assert.deepEqual(redirects, expectedRedirects);
    assert.deepEqual(
      redirects.find(({ from }) => from === '/index.php/'),
      { from: '/index.php/', to: '/en/', status: 301 },
    );
    assert.deepEqual(
      redirects.find(({ from }) => from === '/index.php/en/about-us-2/'),
      { from: '/index.php/en/about-us-2/', to: '/en/houses/', status: 301 },
    );
    assert.equal(redirects.some(({ from }) => from.includes('*')), false);
  });

  it('contains no redirect loops or chains', async () => {
    const redirects = parseRedirects(await readText('public/_redirects'));
    const sources = new Set(redirects.map(({ from }) => from));

    for (const { from, to } of redirects) {
      assert.notEqual(from, to, `Redirect loop at ${from}`);
      assert.equal(sources.has(to), false, `Redirect chain from ${from} through ${to}`);
    }
  });
});
