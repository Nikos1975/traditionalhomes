import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

const readSource = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');

describe('blog featured slider interactions', () => {
  it('keeps the existing controls and keyboard navigation connected to setActiveSlide', async () => {
    const source = await readSource('src/pages/blog/index.astro');

    assert.match(source, /data-blog-prev aria-label="Show previous featured article"/);
    assert.match(source, /data-blog-next aria-label="Show next featured article"/);
    assert.match(source, /thumb\.addEventListener\('click', \(\) => setActiveSlide\(index\)\)/);
    assert.match(source, /event\.key === 'ArrowLeft'[\s\S]*setActiveSlide\(activeIndex - 1\)/);
    assert.match(source, /event\.key === 'ArrowRight'[\s\S]*setActiveSlide\(activeIndex \+ 1\)/);
    assert.match(source, /thumb\.setAttribute\('aria-selected'[\s\S]*counter\.textContent/);
  });

  it('uses pointer events with a horizontal threshold while preserving vertical scrolling', async () => {
    const source = await readSource('src/pages/blog/index.astro');

    assert.match(source, /touch-action:\s*pan-y/);
    assert.match(source, /pointerdown/);
    assert.match(source, /pointermove/);
    assert.match(source, /pointerup/);
    assert.match(source, /pointercancel/);
    assert.match(source, /SWIPE_THRESHOLD/);
    assert.match(source, /Math\.abs\(deltaX\) > Math\.abs\(deltaY\)/);
  });

  it('only suppresses the first article-link click after a confirmed swipe', async () => {
    const source = await readSource('src/pages/blog/index.astro');

    assert.match(source, /let suppressNextLinkClick = false/);
    assert.match(source, /suppressNextLinkClick = true/);
    assert.match(source, /suppressNextLinkClick = false/);
    assert.match(source, /event\.preventDefault\(\)/);
  });

  it('does not add autoplay', async () => {
    const source = await readSource('src/pages/blog/index.astro');

    assert.doesNotMatch(source, /setInterval|autoplay/i);
  });
});

describe('shared blog article availability CTA', () => {
  it('renders one CTA after article content and before related reading', async () => {
    const source = await readSource('src/pages/blog/[...slug].astro');
    const contentIndex = source.indexOf('<Content />');
    const ctaIndex = source.indexOf('data-blog-availability-cta');
    const relatedIndex = source.indexOf('related-reading-heading');

    assert.ok(contentIndex >= 0, 'article content is rendered');
    assert.ok(ctaIndex > contentIndex, 'CTA follows article content');
    assert.ok(relatedIndex > ctaIndex, 'CTA precedes related reading');
    assert.equal((source.match(/data-blog-availability-cta/g) ?? []).length, 1);
  });

  it('uses the canonical houses route and configured booking URL with safe external-link attributes', async () => {
    const source = await readSource('src/pages/blog/[...slug].astro');

    assert.match(source, /See the traditional houses in Mavrikiano, or check availability across the collection\./);
    assert.match(source, /href="\/en\/houses\/"/);
    assert.match(source, /href=\{siteCopy\.bookingEngineUrl\}/);
    assert.match(source, /target="_blank"/);
    assert.match(source, /rel="noopener noreferrer"/);
  });

  it('keeps the CTA out of the blog index', async () => {
    const source = await readSource('src/pages/blog/index.astro');

    assert.doesNotMatch(source, /data-blog-availability-cta/);
  });
});
