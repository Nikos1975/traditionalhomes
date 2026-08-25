import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../', import.meta.url);
const readJson = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const parkingDistancePattern = /\((~?\d+(?:[.,]\d+)?\s*(?:m|km))\)/i;

test('German parking presentation keeps the distance sourced from inventory', async () => {
  const [display, inventory, rendererSource] = await Promise.all([
    readJson('src/i18n/locales/de/inventory-display.json'),
    readJson('src/inventory/inventory.json'),
    readFile(new URL('src/i18n/inventory-display.ts', root), 'utf8'),
  ]);
  const units = new Map((Array.isArray(inventory) ? inventory : inventory.units).map((unit) => [unit.slug, unit]));
  let parkingMappings = 0;

  for (const [slug, fields] of Object.entries(display.units ?? {})) {
    if (!fields.parking) continue;
    parkingMappings += 1;

    const factual = units.get(slug)?.parking;
    assert.ok(factual, `Missing factual parking value for ${slug}`);
    assert.match(factual, parkingDistancePattern, `Parking distance is not parseable for ${slug}: ${factual}`);
    assert.match(fields.parking, /\{distance\}/, `German parking for ${slug} must use {distance}`);
    assert.doesNotMatch(fields.parking, /\d/, `German parking for ${slug} must not duplicate a numeric distance`);
  }

  assert.ok(parkingMappings > 0, 'Expected at least one localized parking mapping');

  // The generated-output i18n suite verifies that the German page remains
  // translated. These source guards make the factual-token contract explicit:
  // extract the distance from inventory, interpolate it, and fail closed to the
  // factual source if the token cannot be extracted.
  assert.match(rendererSource, /PARKING_DISTANCE_PATTERN/);
  assert.match(rendererSource, /mapped\.replace\('\{distance\}', distance\)/);
  assert.match(rendererSource, /return distance \? mapped\.replace\('\{distance\}', distance\) : factual;/);
});
