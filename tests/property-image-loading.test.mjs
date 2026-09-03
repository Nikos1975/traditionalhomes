import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { describe, it } from 'node:test';

const root = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, root), 'utf8');

describe('property image loading architecture', () => {
  it('keeps every below-fold HouseGallery image out of the eager high-priority path', async () => {
    const component = await readText('src/components/gallery/HouseGallery.astro');

    for (const imageId of ['hero-placeholder', 'hero-img']) {
      const imageStart = component.indexOf(`id={\`${'${uid}'}-${imageId}\`}`);
      const imageEnd = component.indexOf('/>', imageStart);
      const image = component.slice(imageStart, imageEnd);

      assert.ok(imageStart > -1, imageId);
      assert.match(image, /loading=['"]lazy['"]/);
      assert.doesNotMatch(image, /fetchpriority=['"]high['"]/);
    }

    assert.doesNotMatch(component, /loading=\{i === 0 \? ['"]eager['"] : ['"]lazy['"]\}/);
  });

  it('gives only the first mobile hero slide real responsive sources at render time', async () => {
    const component = await readText('src/components/gallery/MobilePropertyHero.astro');

    assert.match(component, /src=\{index === 0 \? item\.src : undefined\}/);
    assert.match(component, /srcset=\{index === 0 \? item\.srcset : undefined\}/);
    assert.match(component, /data-src=\{index > 0 \? item\.src : undefined\}/);
    assert.match(component, /data-srcset=\{index > 0 \? item\.srcset : undefined\}/);
    assert.match(component, /loading=\{index === 0 \? ['"]eager['"] : ['"]lazy['"]\}/);
    assert.match(component, /fetchpriority=\{index === 0 \? ['"]high['"] : ['"]low['"]\}/);
  });

  it('hydrates a requested mobile slide before moving it into view', async () => {
    const component = await readText('src/components/gallery/MobilePropertyHero.astro');

    assert.match(component, /function loadSlide\(index\)/);
    assert.match(component, /image\.getAttribute\(['"]data-src['"]\)/);
    assert.match(component, /image\.getAttribute\(['"]data-srcset['"]\)/);
    assert.match(component, /image\.srcset = srcset/);
    assert.match(component, /image\.src = src/);
    assert.match(
      component,
      /activeIndex = normalizeIndex\(index\);[\s\S]*?loadSlide\(activeIndex\);[\s\S]*?track\.style\.transform/,
    );
    assert.doesNotMatch(component, /requestIdleCallback|setTimeout\([^)]*loadSlide/);
  });

  it('keeps empty and one-photo mobile galleries safe', async () => {
    const component = await readText('src/components/gallery/MobilePropertyHero.astro');

    assert.match(component, /\{total > 0 && \(/);
    assert.match(component, /\{total > 1 && \(/);
    assert.match(component, /if \(!root\) return/);
    assert.match(component, /if \(!track \|\| total === 0\) return/);
    assert.match(component, /return \(\(index % total\) \+ total\) % total/);
  });

  it('uses mutually exclusive mobile and desktop hero preloads for houses and villas', async () => {
    for (const pagePath of [
      'src/components/pages/HouseDetailPage.astro',
      'src/components/pages/VillaDetailPage.astro',
    ]) {
      const page = await readText(pagePath);
      const preloads = page.match(/<link[\s\S]*?rel=['"]preload['"][\s\S]*?\/>/g) ?? [];

      assert.equal(preloads.length, 2, pagePath);

      const mobile = preloads.find((preload) => /media=['"]\(max-width: 767px\)['"]/.test(preload));
      const desktop = preloads.find((preload) => /media=['"]\(min-width: 768px\)['"]/.test(preload));

      assert.ok(mobile, `${pagePath}: mobile preload`);
      assert.match(mobile, /href=\{heroEntry\.src\}/);
      assert.match(mobile, /imagesrcset=\{heroEntry\.srcset\}/);
      assert.match(mobile, /imagesizes=['"]100vw['"]/);
      assert.match(mobile, /fetchpriority=['"]high['"]/);

      assert.ok(desktop, `${pagePath}: desktop preload`);
      assert.match(desktop, /href=\{(?:heroSrc|heroImage)\}/);
      assert.doesNotMatch(desktop, /imagesrcset|imagesizes/);
      assert.match(desktop, /fetchpriority=['"]high['"]/);

      assert.equal(preloads.filter((preload) => !/media=/.test(preload)).length, 0, pagePath);
    }
  });
});
