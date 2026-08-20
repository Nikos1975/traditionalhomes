import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import sharp from 'sharp';

const unitCardPath = new URL('../src/components/UnitCard.astro', import.meta.url);
const homepagePath = new URL('../src/components/pages/HomePage.astro', import.meta.url);
const housesPath = new URL('../src/components/pages/CollectionPage.astro', import.meta.url);
const headerPath = new URL('../src/components/Header.astro', import.meta.url);
const footerPath = new URL('../src/components/Footer.astro', import.meta.url);
const markPath = new URL('../public/images/brand/eh-mark-144.webp', import.meta.url);

test('homepage card image delivery keeps listing priority isolated from the homepage', async () => {
  const [unitCard, homepage, houses] = await Promise.all([
    readFile(unitCardPath, 'utf8'),
    readFile(homepagePath, 'utf8'),
    readFile(housesPath, 'utf8'),
  ]);

  assert.match(unitCard, /priority\?: boolean/);
  assert.match(unitCard, /loading=\{priority \? "eager" : "lazy"\}/);
  assert.match(unitCard, /widths=\{\[320, 480, 672, 768\]\}/);
  assert.match(unitCard, /quality=\{68\}/);
  assert.match(unitCard, /\(min-width: 1344px\) 373px/);
  assert.match(unitCard, /\(min-width: 1024px\) calc\(\(100vw - 160px\) \/ 3\)/);
  assert.match(unitCard, /\(min-width: 640px\) calc\(\(100vw - 88px\) \/ 2\)/);
  assert.match(unitCard, /calc\(100vw - 32px\)/);

  assert.doesNotMatch(homepage, /<UnitCard unit=\{unit\} priority=\{index < 3\} locale=\{locale\}/);
  assert.match(houses, /<UnitCard unit=\{unit\} priority=\{index < 3\} locale=\{locale\}/);
});

test('brand mark uses the approved 144px WebP asset', async () => {
  const [header, footer, metadata] = await Promise.all([
    readFile(headerPath, 'utf8'),
    readFile(footerPath, 'utf8'),
    sharp(fileURLToPath(markPath)).metadata(),
  ]);

  for (const component of [header, footer]) {
    assert.match(component, /\/images\/brand\/eh-mark-144\.webp/);
    assert.doesNotMatch(component, /\/images\/brand\/eh-mark\.svg/);
  }

  assert.equal(metadata.width, 144);
  assert.equal(metadata.height, 144);
  assert.equal(metadata.format, 'webp');
});
