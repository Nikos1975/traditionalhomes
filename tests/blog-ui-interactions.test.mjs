import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

const readSource = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');

describe('blog featured slider interactions', () => {
  it('curates five balanced featured articles and keeps mobile selectors scrollable', async () => {
    const source = await readSource('src/pages/en/blog/index.astro');

    assert.match(source, /const preferredFeaturedIds = \[\s*'elounda-and-mirabello-bay',\s*'elounda-beaches',\s*'walking-around-elounda',\s*'elounda-history-through-its-shoreline',\s*'elounda-salt-pans-and-poros-windmills',\s*\]/);
    assert.match(source, /overflow-x-auto[\s\S]*snap-x[\s\S]*snap-mandatory[\s\S]*touch-pan-x[\s\S]*sm:grid/);
    assert.match(source, /blog-featured-thumb[\s\S]*snap-start[\s\S]*sm:basis-auto/);
  });

  it('keeps the existing controls and keyboard navigation connected to setActiveSlide', async () => {
    const source = await readSource('src/pages/en/blog/index.astro');

    assert.match(source, /data-blog-prev aria-label="Show previous featured article"/);
    assert.match(source, /data-blog-next aria-label="Show next featured article"/);
    assert.match(source, /thumb\.addEventListener\('click', \(\) => setActiveSlide\(index\)\)/);
    assert.match(source, /event\.key === 'ArrowLeft'[\s\S]*setActiveSlide\(activeIndex - 1\)/);
    assert.match(source, /event\.key === 'ArrowRight'[\s\S]*setActiveSlide\(activeIndex \+ 1\)/);
    assert.match(source, /thumb\.setAttribute\('aria-selected'[\s\S]*counter\.textContent/);
  });

  it('uses pointer events with a horizontal threshold while preserving vertical scrolling', async () => {
    const source = await readSource('src/pages/en/blog/index.astro');

    assert.match(source, /touch-action:\s*pan-y/);
    assert.match(source, /pointerdown/);
    assert.match(source, /pointermove/);
    assert.match(source, /pointerup/);
    assert.match(source, /pointercancel/);
    assert.match(source, /SWIPE_THRESHOLD/);
    assert.match(source, /const setActiveSlide = \(nextIndex: number\) =>/);
    assert.match(source, /const clearPointer = \(event: PointerEvent\) =>/);
    assert.match(source, /Math\.abs\(deltaX\) > Math\.abs\(deltaY\)/);
  });

  it('only suppresses the first article-link click after a confirmed swipe', async () => {
    const source = await readSource('src/pages/en/blog/index.astro');

    assert.match(source, /let suppressNextLinkClick = false/);
    assert.match(source, /suppressNextLinkClick = true/);
    assert.match(source, /suppressNextLinkClick = false/);
    assert.match(source, /event\.preventDefault\(\)/);
  });

  it('does not add autoplay', async () => {
    const source = await readSource('src/pages/en/blog/index.astro');

    assert.doesNotMatch(source, /setInterval|autoplay/i);
  });
});

describe('blog index image delivery', () => {
  it('prioritizes only the initial featured hero and defers inactive hero sources', async () => {
    const source = await readSource('src/pages/en/blog/index.astro');

    assert.match(source, /loading=\{index === 0 \? 'eager' : 'lazy'\}/);
    assert.match(source, /fetchpriority=\{index === 0 \? 'high' : undefined\}/);
    assert.match(source, /src=\{index === 0 \? featuredImage\.src : undefined\}/);
    assert.match(source, /data-src=\{index > 0 \? featuredImage\.src : undefined\}/);
    assert.match(source, /const loadSlideImage = \(slide: Element\) =>/);
    assert.match(source, /loadSlideImage\(slides\[activeIndex\]\)/);
  });

  it('uses the existing 480px blog derivatives for featured selectors', async () => {
    const source = await readSource('src/pages/en/blog/index.astro');

    assert.match(source, /src=\{featuredImage\.thumbnailSrc\}/);
    assert.match(source, /sizes="72px"/);
    assert.match(source, /width="480"/);
    assert.match(source, /height=\{featuredImage\.thumbnailHeight\}/);
    assert.doesNotMatch(source, /<img src=\{post\.data\.image\} alt="" loading="lazy"/);
  });

  it('does not embed article hero URLs as decorative card backgrounds', async () => {
    const source = await readSource('src/pages/en/blog/index.astro');

    assert.doesNotMatch(source, /background-image:\s*url\(/);
    assert.doesNotMatch(source, /style=\{`background-image:/);
  });

  it('keeps each regular-card photograph URL inert until that card is initialized', async () => {
    const source = await readSource('src/pages/en/blog/index.astro');

    assert.match(source, /\{post\.data\.image && \(\s*<img\s+data-src=\{post\.data\.image\}\s+data-blog-card-image/);
    assert.doesNotMatch(source, /<img[^>]*\ssrc=\{post\.data\.image\}/);
  });

  it('initializes only the interacted regular card on pointer entry or keyboard focus', async () => {
    const source = await readSource('src/pages/en/blog/index.astro');

    assert.match(source, /const initializeCardImage = \(card: HTMLElement\) =>/);
    assert.match(source, /card\.dataset\.imageInitialized === 'true'/);
    assert.match(source, /image\.src = image\.dataset\.src/);
    assert.match(source, /card\.dataset\.imageInitialized = 'true'/);
    assert.match(source, /card\.addEventListener\('pointerenter', \(\) => initializeCardImage\(card\), \{ once: true \}\)/);
    assert.match(source, /card\.addEventListener\('focusin', \(\) => initializeCardImage\(card\), \{ once: true \}\)/);
  });

  it('marks a regular-card photograph loaded after a successful load, including cached images', async () => {
    const source = await readSource('src/pages/en/blog/index.astro');

    assert.match(source, /const markImageLoaded = \(\) => \{\s*image\.dataset\.loaded = 'true';\s*\}/);
    assert.match(source, /image\.addEventListener\('load', markImageLoaded, \{ once: true \}\)/);
    assert.match(source, /image\.complete && image\.naturalWidth > 0[\s\S]*markImageLoaded\(\)/);
    assert.doesNotMatch(source, /image\.dataset\.initialized/);
  });

  it('reveals only loaded regular-card photographs at 25% opacity over 500ms', async () => {
    const source = await readSource('src/pages/en/blog/index.astro');

    assert.match(source, /\.blog-card-image \{[\s\S]*opacity:\s*0;[\s\S]*transition:\s*opacity 500ms ease;/);
    assert.match(source, /\.blog-card:hover \.blog-card-image\[data-loaded="true"\],[\s\S]*\.blog-card:focus-visible \.blog-card-image\[data-loaded="true"\][\s\S]*\{\s*opacity:\s*0\.25;/);
  });
});

describe('shared blog article availability CTA', () => {
  it('renders one CTA after article content and before related reading', async () => {
    const source = await readSource('src/pages/en/blog/[...slug].astro');
    const contentIndex = source.indexOf('<Content />');
    const ctaIndex = source.indexOf('data-blog-availability-cta');
    const relatedIndex = source.indexOf('related-reading-heading');

    assert.ok(contentIndex >= 0, 'article content is rendered');
    assert.ok(ctaIndex > contentIndex, 'CTA follows article content');
    assert.ok(relatedIndex > ctaIndex, 'CTA precedes related reading');
    assert.equal((source.match(/data-blog-availability-cta/g) ?? []).length, 1);
  });

  it('uses the canonical houses route and configured booking URL with safe external-link attributes', async () => {
    const source = await readSource('src/pages/en/blog/[...slug].astro');

    assert.match(source, /See the traditional houses in Mavrikiano, or check availability across the collection\./);
    assert.match(source, /href="\/en\/houses\/"/);
    assert.match(source, /href=\{siteCopy\.bookingEngineUrl\}/);
    assert.match(source, /target="_blank"/);
    assert.match(source, /rel="noopener noreferrer"/);
  });

  it('keeps the CTA out of the blog index', async () => {
    const source = await readSource('src/pages/en/blog/index.astro');

    assert.doesNotMatch(source, /data-blog-availability-cta/);
  });
});
