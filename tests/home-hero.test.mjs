import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pagePath = new URL('../src/pages/en/index.astro', import.meta.url);

test('homepage hero uses an eager responsive picture while preserving its visual contract', async () => {
  const page = await readFile(pagePath, 'utf8');

  assert.match(page, /<picture>/);
  assert.match(page, /home-hero-spinalonga-480\.webp 480w/);
  assert.match(page, /sizes="100vw"/);
  assert.match(page, /loading="eager"/);
  assert.match(page, /fetchpriority="high"/);
  assert.match(page, /decoding="async"/);
  assert.match(page, /rel="preload"/);
  assert.match(page, /imagesrcset="\/images\/brand\/home-hero-spinalonga-480\.webp 480w/);
  assert.match(page, /object-cover/);
  assert.match(page, /object-center/);
  assert.match(page, /h-\[85vh\] min-h-\[600px\]/);
  assert.match(page, /prefers-reduced-motion: reduce/);
});
