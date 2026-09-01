import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readSource = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');

test('Spinalonga Short follows the introduction and precedes the first historical section', async () => {
  const article = await readSource('src/content/blog/spinalonga-why-fortified-changing-uses.md');
  const introductionEnding = 'its continuing connection with Elounda, Plaka and Mirabello Bay.';
  const introductionEndingIndex = article.indexOf(introductionEnding);
  const videoIndex = article.indexOf('<section class="blog-short-video"');
  const firstSectionIndex = article.indexOf('## A small island in a strategic bay');

  assert.ok(introductionEndingIndex >= 0, 'the complete introductory paragraph ending is present');
  assert.ok(videoIndex > introductionEndingIndex + introductionEnding.length, 'the video follows the complete introductory paragraph');
  assert.ok(videoIndex < firstSectionIndex, 'the video precedes the first historical section');
  assert.match(article, /<h2 id="spinalonga-short-video-heading">Spinalonga: a short historical documentary<\/h2>/);
  assert.match(article, /A short visual introduction to Spinalonga’s changing role — from Venetian fortification and Ottoman settlement to compulsory isolation and a place of memory\./);
  assert.match(article, /src="https:\/\/www\.youtube-nocookie\.com\/embed\/Wvd9OVLDNic"/);
  assert.match(article, /title="Spinalonga: Why It Was Fortified and How Its Uses Changed"/);
  assert.match(article, /loading="lazy"/);
  assert.doesNotMatch(article, /autoplay/i);
});

test('the shared blog renderer contains Short embeds without changing article width', async () => {
  const renderer = await readSource('src/pages/en/blog/[...slug].astro');

  assert.match(renderer, /\.blog-short-video-frame\)[\s\S]*width: min\(100%, 24rem\)/);
  assert.match(renderer, /\.blog-short-video-frame\)[\s\S]*aspect-ratio: 9 \/ 16/);
});
