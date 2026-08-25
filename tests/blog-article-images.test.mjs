import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const publicRoot = new URL("../public/", import.meta.url);
const readSource = (relativePath) =>
  readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");

describe("shared blog article lead-image delivery", () => {
  it("matches the existing full-bleed lead-image width", async () => {
    const { blogArticleImageSizes } =
      await import("../src/utils/blogArticleImages.mjs");

    assert.equal(
      blogArticleImageSizes,
      "(min-width: 1056px) 1024px, calc(100vw - 32px)",
    );
  });

  it("discovers the complete responsive blog-image family from files that exist", async () => {
    const { getBlogArticleImageDelivery } =
      await import("../src/utils/blogArticleImages.mjs");
    const delivery = await getBlogArticleImageDelivery(
      "/images/blog/elounda-and-mirabello-bay/hero-1600.webp",
      publicRoot,
    );

    assert.deepEqual(delivery, {
      src: "/images/blog/elounda-and-mirabello-bay/hero-1600.webp",
      srcset: [
        "/images/blog/elounda-and-mirabello-bay/hero-480.webp 480w",
        "/images/blog/elounda-and-mirabello-bay/hero-768.webp 768w",
        "/images/blog/elounda-and-mirabello-bay/hero-1200.webp 1200w",
        "/images/blog/elounda-and-mirabello-bay/hero-1600.webp 1600w",
        "/images/blog/elounda-and-mirabello-bay/hero-2400.webp 2400w",
      ].join(", "),
      width: 1600,
      height: 900,
    });
  });

  it("omits missing widths from an incomplete legacy blog-image family", async () => {
    const { getBlogArticleImageDelivery } =
      await import("../src/utils/blogArticleImages.mjs");
    const delivery = await getBlogArticleImageDelivery(
      "/images/blog/welcome-to-elounda/mavrikiano-elounda-1200.webp",
      publicRoot,
    );

    assert.match(delivery.srcset, /mavrikiano-elounda-480\.webp 480w/);
    assert.match(delivery.srcset, /mavrikiano-elounda-768\.webp 768w/);
    assert.match(delivery.srcset, /mavrikiano-elounda-1200\.webp 1200w/);
    assert.doesNotMatch(delivery.srcset, /-1600\.webp|-2400\.webp/);
  });

  it("supports the established property-gallery directory convention", async () => {
    const { getBlogArticleImageDelivery } =
      await import("../src/utils/blogArticleImages.mjs");
    const delivery = await getBlogArticleImageDelivery(
      "/images/houses/argyro/1600/argyro-veranda-dining-sea-view-03-1600.webp",
      publicRoot,
    );

    assert.match(
      delivery.srcset,
      /\/480\/argyro-veranda-dining-sea-view-03-480\.webp 480w/,
    );
    assert.match(
      delivery.srcset,
      /\/768\/argyro-veranda-dining-sea-view-03-768\.webp 768w/,
    );
    assert.match(
      delivery.srcset,
      /\/1024\/argyro-veranda-dining-sea-view-03-1024\.webp 1024w/,
    );
    assert.match(
      delivery.srcset,
      /\/1600\/argyro-veranda-dining-sea-view-03-1600\.webp 1600w/,
    );
  });

  it("keeps a legacy original safe when no responsive derivative exists", async () => {
    const { getBlogArticleImageDelivery } =
      await import("../src/utils/blogArticleImages.mjs");
    const delivery = await getBlogArticleImageDelivery(
      "/images/blog/elounda-visitor-economy/elounda-bay-resort-development.jfif",
      publicRoot,
    );

    assert.deepEqual(delivery, {
      src: "/images/blog/elounda-visitor-economy/elounda-bay-resort-development.jfif",
      width: 2048,
      height: 1217,
    });
  });

  it("does not opt unrelated image families into adjacent-file discovery", async () => {
    const { getBlogArticleImageDelivery } =
      await import("../src/utils/blogArticleImages.mjs");
    const delivery = await getBlogArticleImageDelivery(
      "/images/brand/home-hero-spinalonga-1024.webp",
      publicRoot,
    );

    assert.equal(delivery.srcset, undefined);
  });

  it("rejects encoded traversal before reading image metadata", async () => {
    const { getBlogArticleImageDelivery } =
      await import("../src/utils/blogArticleImages.mjs");

    await assert.rejects(
      getBlogArticleImageDelivery(
        "/images/blog/%2e%2e/private-image.webp",
        publicRoot,
      ),
      /safe root-relative public URL/,
    );
  });

  it("uses one responsive source for preload and the eager high-priority lead image", async () => {
    const source = await readSource("src/pages/en/blog/[...slug].astro");

    assert.match(source, /getBlogArticleImageDelivery\(entry\.data\.image\)/);
    assert.match(
      source,
      /rel="preload"[\s\S]*as="image"[\s\S]*imagesrcset=\{leadImage\.srcset\}[\s\S]*imagesizes=\{blogArticleImageSizes\}/,
    );
    assert.match(
      source,
      /<img[\s\S]*src=\{leadImage\.src\}[\s\S]*srcset=\{leadImage\.srcset\}[\s\S]*sizes=\{blogArticleImageSizes\}/,
    );
    assert.match(source, /width=\{leadImage\.width\}/);
    assert.match(source, /height=\{leadImage\.height\}/);
    assert.match(source, /loading="eager"/);
    assert.match(source, /fetchpriority="high"/);
    assert.match(source, /decoding="async"/);
    assert.equal((source.match(/rel="preload"/g) ?? []).length, 1);
    assert.equal((source.match(/fetchpriority="high"/g) ?? []).length, 2);
  });

  it("keeps canonical and Open Graph inputs unchanged", async () => {
    const source = await readSource("src/pages/en/blog/[...slug].astro");

    assert.match(
      source,
      /canonicalUrl=\{`https:\/\/traditional-homes\.gr\$\{blogArticlePath\(entry\.id, defaultLocale\)\}`\}/,
    );
    assert.match(source, /ogImage=\{entry\.data\.image\}/);
  });
});
