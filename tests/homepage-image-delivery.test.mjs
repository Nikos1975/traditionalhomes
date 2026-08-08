import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const unitCardPath = new URL('../src/components/UnitCard.astro', import.meta.url);
const homepagePath = new URL('../src/pages/en/index.astro', import.meta.url);
const housesPath = new URL('../src/pages/en/houses/index.astro', import.meta.url);

test('homepage card image delivery keeps listing priority isolated from the homepage', async () => {
  const [unitCard, homepage, houses] = await Promise.all([
    readFile(unitCardPath, 'utf8'),
    readFile(homepagePath, 'utf8'),
    readFile(housesPath, 'utf8'),
  ]);

  assert.match(unitCard, /priority\?: boolean/);
  assert.match(unitCard, /loading=\{priority \? "eager" : "lazy"\}/);
  assert.match(unitCard, /widths=\{\[320, 480, 640, 768\]\}/);
  assert.match(unitCard, /\(min-width: 1344px\) 373px/);
  assert.match(unitCard, /\(min-width: 1024px\) calc\(\(100vw - 160px\) \/ 3\)/);
  assert.match(unitCard, /\(min-width: 640px\) calc\(\(100vw - 88px\) \/ 2\)/);
  assert.match(unitCard, /calc\(100vw - 32px\)/);

  assert.doesNotMatch(homepage, /<UnitCard\s+unit=\{unit\}\s+priority=\{index < 3\}/);
  assert.match(houses, /<UnitCard\s+unit=\{unit\}\s+priority=\{index < 3\}/);
});
