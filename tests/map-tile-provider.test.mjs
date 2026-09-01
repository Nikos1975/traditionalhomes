import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('maps do not use CARTO without a configured authenticated integration', async () => {
  const leafletMap = await readFile(new URL('../src/components/maps/LeafletMap.astro', import.meta.url), 'utf8');

  assert.doesNotMatch(leafletMap, /cartocdn|basemaps\.carto\.com/i);
  assert.match(leafletMap, /tile\.openstreetmap\.org/);
  assert.doesNotMatch(leafletMap, /attributionControl:\s*false/);
});
