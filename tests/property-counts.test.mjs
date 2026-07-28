import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import ts from 'typescript';

const loadPropertyCounts = async () => {
  const source = await readFile(
    new URL('../src/i18n/property-counts.ts', import.meta.url),
    'utf8',
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });

  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
};

const englishForms = {
  guestsUpTo: { one: 'Up to {count} Guest', other: 'Up to {count} Guests' },
  bedrooms: { one: '{count} Bedroom', other: '{count} Bedrooms' },
  bathrooms: { one: '{count} bathroom', other: '{count} bathrooms' },
  bathroomsCompact: { one: '{count} Bath', other: '{count} Baths' },
  sleeps: { other: 'Sleeps {count}' },
};

test('stores complete English property count templates in locale resources', async () => {
  const common = JSON.parse(
    await readFile(new URL('../src/i18n/locales/en/common.json', import.meta.url), 'utf8'),
  );

  assert.deepEqual(common.ui.property.counts, englishForms);
});

test('formats complete English property count messages with plural selection and replacement', async () => {
  const { formatPropertyCount } = await loadPropertyCounts();

  assert.equal(formatPropertyCount('en', 6, englishForms.guestsUpTo), 'Up to 6 Guests');
  assert.equal(formatPropertyCount('en', 1, englishForms.bedrooms), '1 Bedroom');
  assert.equal(formatPropertyCount('en', 2, englishForms.bedrooms), '2 Bedrooms');
  assert.equal(formatPropertyCount('en', 1, englishForms.bathrooms), '1 bathroom');
  assert.equal(formatPropertyCount('en', 2, englishForms.bathrooms), '2 bathrooms');
  assert.equal(formatPropertyCount('en', 1, englishForms.bathroomsCompact), '1 Bath');
  assert.equal(formatPropertyCount('en', 2, englishForms.bathroomsCompact), '2 Baths');
  assert.equal(formatPropertyCount('en', 4, englishForms.sleeps), 'Sleeps 4');
});

test('falls back to other when a locale selects an unavailable plural form', async () => {
  const { formatPropertyCount } = await loadPropertyCounts();

  assert.equal(formatPropertyCount('ru', 2, { other: '{count} properties' }), '2 properties');
});
