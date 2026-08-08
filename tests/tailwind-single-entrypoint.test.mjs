import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const configPath = new URL('../astro.config.mjs', import.meta.url);
const globalStylesPath = new URL('../src/styles/global.css', import.meta.url);

test('global stylesheet is the sole Tailwind entrypoint', async () => {
  const [config, globalStyles] = await Promise.all([
    readFile(configPath, 'utf8'),
    readFile(globalStylesPath, 'utf8'),
  ]);

  assert.match(config, /tailwind\(\{\s*applyBaseStyles:\s*false\s*\}\)/);
  assert.match(globalStyles, /@tailwind base;/);
  assert.match(globalStyles, /@tailwind components;/);
  assert.match(globalStyles, /@tailwind utilities;/);
});
