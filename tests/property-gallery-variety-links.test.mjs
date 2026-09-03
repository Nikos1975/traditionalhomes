import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { after, describe, it } from "node:test";
import { createServer } from "vite";

const root = new URL("../", import.meta.url);
const readText = (path) => readFile(new URL(path, root), "utf8");

describe("property gallery variety and homepage villa link", async () => {
  const vite = await createServer({
    appType: "custom",
    server: { middlewareMode: true, hmr: false },
  });
  after(() => vite.close());

  it("links the full Almond Tree Villa image area through the localized villa route", async () => {
    const [homePage, routeMap] = await Promise.all([
      readText("src/components/pages/HomePage.astro"),
      vite.ssrLoadModule("/src/i18n/route-map.ts"),
    ]);

    assert.deepEqual(
      routeMap.resolveLocalizedLink("en", "villa", "almond-tree-villa"),
      {
        href: "/en/villa/almond-tree-villa/",
        locale: "en",
        isFallback: false,
      },
    );
    assert.deepEqual(
      routeMap.resolveLocalizedLink("de", "villa", "almond-tree-villa"),
      {
        href: "/de/villa/almond-tree-villa/",
        locale: "de",
        isFallback: false,
      },
    );
    const imageIndex = homePage.indexOf(
      'src="/images/villa/1024/almond-tree-villa-garden-pool-wide-01-1024.webp"',
    );
    const anchorStart = homePage.lastIndexOf("<a", imageIndex);
    const anchorEnd = homePage.indexOf("</a>", imageIndex);
    const imageLink = homePage.slice(anchorStart, anchorEnd + 4);

    assert.ok(imageIndex > -1);
    assert.ok(anchorStart > -1);
    assert.ok(anchorEnd > imageIndex);
    assert.match(imageLink, /href=\{villaLink\?\.href \?\? housesLink\.href\}/);
    assert.match(imageLink, /aria-label=\{copy\.villa\.ctaView\}/);
    assert.match(
      imageLink,
      /class="lg:col-span-7 min-h-\[300px\] md:min-h-\[360px\] lg:min-h-\[460px\]"/,
    );
    assert.match(imageLink, /loading="lazy"/);
    assert.match(imageLink, /class="h-full w-full object-cover"/);
    assert.doesNotMatch(imageLink, /bookingEngineUrl|WebHotelier/i);
  });

  it("moves the hero photo to the end without losing metadata or duplicating photos", async () => {
    const galleryHelpers = await vite.ssrLoadModule(
      "/src/utils/galleryHelpers.ts",
    );
    assert.equal(typeof galleryHelpers.reorderGalleryForDesktop, "function");

    const images = [
      { src: "/hero.webp", alt: "Hero", srcset: "/hero-480.webp 480w" },
      { src: "/second.webp", alt: "Second", srcset: "/second-480.webp 480w" },
      { src: "/third.webp", alt: "Third", srcset: "/third-480.webp 480w" },
    ];
    const desktop = galleryHelpers.reorderGalleryForDesktop(images);

    assert.deepEqual(desktop, [images[1], images[2], images[0]]);
    assert.deepEqual(images, [images[0], images[1], images[2]]);
    assert.equal(desktop.length, images.length);
    assert.equal(desktop.filter((image) => image === images[0]).length, 1);
    assert.deepEqual(new Set(desktop), new Set(images));
  });

  it("keeps the single-image fallback safe", async () => {
    const { reorderGalleryForDesktop } = await vite.ssrLoadModule(
      "/src/utils/galleryHelpers.ts",
    );
    assert.equal(typeof reorderGalleryForDesktop, "function");

    const onlyImage = { src: "/only.webp", alt: "Only photo" };
    const gallery = [onlyImage];

    assert.equal(reorderGalleryForDesktop(gallery), gallery);
    assert.deepEqual(reorderGalleryForDesktop(gallery), [onlyImage]);
  });

  it("keeps each page hero and mobile gallery on the original order while reordering only desktop", async () => {
    for (const pagePath of [
      "src/components/pages/HouseDetailPage.astro",
      "src/components/pages/VillaDetailPage.astro",
    ]) {
      const page = await readText(pagePath);

      assert.match(page, /const heroEntry\s*=\s*gallery\[0\]/, pagePath);
      assert.match(
        page,
        /const galleryItems = buildGalleryItems\(gallery, displayName, locale\)/,
        pagePath,
      );
      assert.match(
        page,
        /const desktopGallery = reorderGalleryForDesktop\(gallery\)/,
        pagePath,
      );
      assert.match(
        page,
        /<MobilePropertyHero[\s\S]*?items=\{galleryItems\}/,
        pagePath,
      );
      assert.match(
        page,
        /data-desktop-property-gallery[\s\S]*?class=['"]hidden md:block['"][\s\S]*?<HouseGallery[\s\S]*?images=\{desktopGallery\}/,
        pagePath,
      );
    }
  });
});
