import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, describe, it } from 'node:test';
import { createServer } from 'vite';

const root = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, root), 'utf8');

describe('mobile property hero gallery', async () => {
  const vite = await createServer({ appType: 'custom', server: { middlewareMode: true } });
  after(() => vite.close());

  it('derives the hero captions and alt text from the existing gallery pipeline', async () => {
    const { buildGalleryItems } = await vite.ssrLoadModule('/src/utils/galleryHelpers.ts');
    const images = [
      {
        src: '/images/houses/erato/1024/erato-private-pool-wide-01-1024.webp',
        srcset: '/images/houses/erato/480/erato-private-pool-wide-01-480.webp 480w',
        alt: 'Erato private pool wide 01',
        isFeatured: true,
      },
    ];

    assert.deepEqual(buildGalleryItems(images, 'House Erato', 'en'), [
      {
        src: images[0].src,
        srcset: images[0].srcset,
        alt: images[0].alt,
        label: 'Private pool wide',
      },
    ]);
    assert.equal(buildGalleryItems(images, 'Haus Erato', 'de')[0].label, 'Privater Pool, weite Ansicht');
  });

  it('renders semantic responsive images while prioritizing only the first slide', async () => {
    const component = await readText('src/components/gallery/MobilePropertyHero.astro');

    assert.match(component, /items\.map\(\(item, index\) =>/);
    assert.match(component, /<img[\s\S]*?src=\{item\.src\}[\s\S]*?srcset=\{item\.srcset\}/);
    assert.match(component, /loading=\{index === 0 \? ['"]eager['"] : ['"]lazy['"]\}/);
    assert.match(component, /fetchpriority=\{index === 0 \? ['"]high['"] : ['"]auto['"]\}/);
    assert.match(component, /sizes=['"]100vw['"]/);
    assert.doesNotMatch(component, /background-image/);
  });

  it('provides localized button controls, counter, caption updates, and no lightbox trigger', async () => {
    const component = await readText('src/components/gallery/MobilePropertyHero.astro');

    assert.match(component, /type=['"]button['"][\s\S]*?aria-label=\{galleryCopy\.previousPhoto\}/);
    assert.match(component, /type=['"]button['"][\s\S]*?aria-label=\{galleryCopy\.nextPhoto\}/);
    assert.match(component, /data-mobile-hero-counter/);
    assert.match(component, /data-mobile-hero-caption/);
    assert.match(component, /function show\(index\)[\s\S]*?var caption = root\.parentElement/);
    assert.match(component, /caption\.textContent = item\.getAttribute\(['"]data-label['"]\)/);
    assert.match(component, /counter\.textContent = activeIndex \+ 1 \+ ['"] \/ ['"] \+ total/);
    assert.doesNotMatch(component, /data-lb=/);
    assert.doesNotMatch(component, /showModal\(/);
    assert.doesNotMatch(component, /setInterval\(/);
  });

  it('uses a horizontal pointer threshold and preserves vertical page scrolling', async () => {
    const component = await readText('src/components/gallery/MobilePropertyHero.astro');

    assert.match(component, /touch-action:\s*pan-y/);
    assert.match(component, /const SWIPE_THRESHOLD = 48/);
    assert.match(component, /Math\.abs\(deltaX\) >= SWIPE_THRESHOLD/);
    assert.match(component, /Math\.abs\(deltaX\) > Math\.abs\(deltaY\)/);
    assert.match(component, /addEventListener\(['"]pointerdown['"]/);
    assert.match(component, /addEventListener\(['"]pointerup['"]/);
    assert.doesNotMatch(component, /preventDefault\(\)/);
  });

  it('keeps the mobile gallery hit-testable beneath the decorative and content layers', async () => {
    for (const pagePath of [
      'src/components/pages/HouseDetailPage.astro',
      'src/components/pages/VillaDetailPage.astro',
    ]) {
      const page = await readText(pagePath);

      assert.match(
        page,
        /class=['"][^'"]*pointer-events-none[^'"]*bg-gradient-to-b[^'"]*['"]|class=['"][^'"]*bg-gradient-to-b[^'"]*pointer-events-none[^'"]*['"]/,
        `${pagePath}: the decorative gradient must not intercept touch input`,
      );
      assert.match(
        page,
        /class=['"][^'"]*pointer-events-none[^'"]*md:pointer-events-auto[^'"]*relative z-20|class=['"][^'"]*relative z-20[^'"]*pointer-events-none[^'"]*md:pointer-events-auto[^'"]*['"]/,
        `${pagePath}: the full-height mobile content layer must pass touch input through`,
      );
      assert.match(
        page,
        /<nav class=['"][^'"]*pointer-events-auto[^'"]*['"]/,
        `${pagePath}: breadcrumb links must remain interactive`,
      );
    }
  });

  it('centers only the changing mobile caption', async () => {
    for (const pagePath of [
      'src/components/pages/HouseDetailPage.astro',
      'src/components/pages/VillaDetailPage.astro',
    ]) {
      const page = await readText(pagePath);

      assert.match(page, /<p[\s\S]*?class=['"][^'"]*w-full[^'"]*text-center[^'"]*md:hidden[^'"]*['"][\s\S]*?data-mobile-hero-caption/, pagePath);
      assert.doesNotMatch(page, /<h1 class=['"][^'"]*text-center/, pagePath);
    }
  });

  it('uses one compact mobile gap before At a Glance while retaining desktop rhythm', async () => {
    for (const pagePath of [
      'src/components/pages/HouseDetailPage.astro',
      'src/components/pages/VillaDetailPage.astro',
    ]) {
      const page = await readText(pagePath);

      assert.match(page, /<main class=['"]site-max site-pad py-8 md:py-16['"]>/, pagePath);
      assert.match(
        page,
        /<div class=['"]lg:col-span-8['"]>[\s\S]*?data-desktop-property-gallery[\s\S]*?<div class=['"]space-y-14 md:mt-14['"]>[\s\S]*?<section aria-label=\{propertyCopy\.detail\.sections\.atAGlance\} class=['"]md:border-t md:border-stone-100 md:pt-12['"]>/,
        pagePath,
      );
    }
  });

  it('uses the sorted property collection in the mobile hero and keeps the lower gallery desktop-only', async () => {
    for (const pagePath of [
      'src/components/pages/HouseDetailPage.astro',
      'src/components/pages/VillaDetailPage.astro',
    ]) {
      const page = await readText(pagePath);

      assert.match(page, /buildGalleryItems\(gallery, displayName, locale\)/, pagePath);
      assert.match(page, /<MobilePropertyHero[\s\S]*?items=\{galleryItems\}/, pagePath);
      assert.match(page, /data-desktop-property-gallery[\s\S]*?class=['"]hidden md:block['"][\s\S]*?<HouseGallery/, pagePath);
      assert.match(page, /<h1[\s\S]*?\{displayName\}[\s\S]*?<\/h1>/, pagePath);
    }
  });
});
