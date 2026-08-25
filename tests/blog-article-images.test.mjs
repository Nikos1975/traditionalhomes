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

/**
 * Published inline body images are raw HTML inside Markdown, so no Astro
 * component enforces their delivery contract. This guard derives the published
 * article set and its inline images from the repository and requires every one
 * of them to be either an explicitly classified exception or a compliant
 * responsive image.
 */

const blogContentDir = new URL("../src/content/blog/", import.meta.url);

/**
 * Inline images that are audited, published and knowingly non-compliant.
 * Exact source matching only: a category-wide rule would defeat the guard.
 * Batch C resolved the last two entries, so this list is now empty and every
 * published inline image must be compliant. Any new entry is a temporary,
 * audited exception that its own batch must delete again.
 */
const knownInlineImageExceptions = new Map([]);

/** @param {string} markdown */
function frontmatterBlock(markdown) {
  const match = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match ? match[1] : "";
}

/** @param {string} tag */
function parseAttributes(tag) {
  /** @type {Record<string, string>} */
  const attributes = {};
  for (const match of tag.matchAll(/([A-Za-z][A-Za-z0-9-]*)="([^"]*)"/g)) {
    attributes[match[1]] = match[2];
  }
  return attributes;
}

/** Published articles and their inline images, derived from the repository. */
async function publishedInlineImages() {
  const { readdir } = await import("node:fs/promises");
  const files = (await readdir(blogContentDir))
    .filter((file) => file.endsWith(".md"))
    .sort();
  /** @type {{ article: string, tag: string, attributes: Record<string, string> }[]} */
  const images = [];
  let publishedArticles = 0;

  for (const file of files) {
    const markdown = await readFile(new URL(file, blogContentDir), "utf8");
    if (/^draft:\s*true\s*$/m.test(frontmatterBlock(markdown))) continue;
    publishedArticles += 1;

    for (const match of markdown.matchAll(/<img\b[^>]*>/g)) {
      images.push({
        article: file,
        tag: match[0],
        attributes: parseAttributes(match[0]),
      });
    }
  }

  return { images, publishedArticles, articleFiles: files };
}

/** @param {string} url */
async function intrinsicMetadata(url) {
  const sharp = (await import("sharp")).default;
  const { fileURLToPath } = await import("node:url");
  const { width, height } = await sharp(
    fileURLToPath(new URL(`.${url}`, publicRoot)),
  ).metadata();
  return { width, height };
}

/**
 * Every requirement a normal local published inline image must satisfy.
 * Returns a list of human-readable problems; an empty list means compliant.
 *
 * @param {Record<string, string>} attributes
 * @param {string} expectedSizes
 */
async function inlineImageProblems(attributes, expectedSizes) {
  const { existsSync } = await import("node:fs");
  const problems = [];
  const src = attributes.src ?? "";

  if (!src.startsWith("/images/")) {
    problems.push(`src is not a local public image: ${src || "(missing)"}`);
    return problems;
  }
  if (src.includes("..") || src.includes("\\")) {
    problems.push(`src is not a safe root-relative path: ${src}`);
    return problems;
  }
  if (!existsSync(new URL(`.${src}`, publicRoot))) {
    problems.push(`src file does not exist: ${src}`);
    return problems;
  }

  const { width: sourceWidth, height: sourceHeight } =
    await intrinsicMetadata(src);

  if (attributes.width !== String(sourceWidth)) {
    problems.push(
      `width="${attributes.width ?? ""}" does not match the intrinsic ${sourceWidth}px`,
    );
  }
  if (attributes.height !== String(sourceHeight)) {
    problems.push(
      `height="${attributes.height ?? ""}" does not match the intrinsic ${sourceHeight}px`,
    );
  }
  if (attributes.loading !== "lazy") problems.push('loading="lazy" is missing');
  if (attributes.decoding !== "async")
    problems.push('decoding="async" is missing');
  if (attributes.sizes !== expectedSizes) {
    problems.push(
      `sizes must be the canonical inline value, got "${attributes.sizes ?? ""}"`,
    );
  }
  if (!attributes.srcset) {
    problems.push("srcset is missing");
    return problems;
  }

  const seenUrls = new Set();
  const seenDescriptors = new Set();

  for (const entry of attributes.srcset.split(",")) {
    const [candidateUrl, descriptor, ...rest] = entry.trim().split(/\s+/);
    if (rest.length > 0 || !/^\d+w$/.test(descriptor ?? "")) {
      problems.push(`malformed srcset candidate: "${entry.trim()}"`);
      continue;
    }
    if (seenUrls.has(candidateUrl))
      problems.push(`duplicate srcset candidate: ${candidateUrl}`);
    if (seenDescriptors.has(descriptor))
      problems.push(`duplicate srcset descriptor: ${descriptor}`);
    seenUrls.add(candidateUrl);
    seenDescriptors.add(descriptor);

    if (!candidateUrl.startsWith("/images/") || candidateUrl.includes("..")) {
      problems.push(
        `srcset candidate is not a safe local path: ${candidateUrl}`,
      );
      continue;
    }
    if (!existsSync(new URL(`.${candidateUrl}`, publicRoot))) {
      problems.push(`srcset candidate does not exist: ${candidateUrl}`);
      continue;
    }

    const { width: candidateWidth } = await intrinsicMetadata(candidateUrl);
    const declaredWidth = Number.parseInt(descriptor, 10);
    if (declaredWidth !== candidateWidth) {
      problems.push(
        `${candidateUrl} declares ${declaredWidth}w but is ${candidateWidth}px wide`,
      );
    }
  }

  if (!seenUrls.has(src)) {
    problems.push(`src is not offered as a srcset candidate: ${src}`);
  }

  return problems;
}

describe("published blog inline images", () => {
  it("keeps every published inline image compliant or explicitly excepted", async () => {
    const { blogInlineImageSizes } =
      await import("../src/utils/blogArticleImages.mjs");
    const { images, publishedArticles } = await publishedInlineImages();

    assert.ok(publishedArticles > 0, "no published blog articles were derived");
    assert.ok(images.length > 0, "no published inline images were derived");

    const failures = [];
    let compliant = 0;

    for (const image of images) {
      const src = image.attributes.src ?? "";
      if (knownInlineImageExceptions.has(src)) continue;

      const problems = await inlineImageProblems(
        image.attributes,
        blogInlineImageSizes,
      );
      if (problems.length > 0) {
        failures.push(
          `${image.article} -> ${src}\n    - ${problems.join("\n    - ")}`,
        );
      } else {
        compliant += 1;
      }
    }

    assert.deepEqual(
      failures,
      [],
      `non-compliant published inline images:\n  ${failures.join("\n  ")}`,
    );
    assert.equal(
      compliant + knownInlineImageExceptions.size,
      images.length,
      "every published inline image must be classified",
    );
    assert.ok(compliant > 0, "the inline-image guard classified nothing");
  });

  it("keeps every temporary exception real, so resolving one forces its removal", async () => {
    const { images } = await publishedInlineImages();
    const publishedSources = new Set(
      images.map((image) => image.attributes.src ?? ""),
    );

    for (const [src, reason] of knownInlineImageExceptions) {
      assert.ok(
        publishedSources.has(src),
        `stale inline-image exception, delete it: ${src} (${reason})`,
      );
    }
  });

  it("rejects a non-compliant inline image", async () => {
    const { blogInlineImageSizes } =
      await import("../src/utils/blogArticleImages.mjs");

    const problems = await inlineImageProblems(
      {
        src: "/images/blog/spinalonga-why-fortified-changing-uses/spinalonga-gulf-context.webp",
        srcset:
          "/images/blog/spinalonga-why-fortified-changing-uses/spinalonga-gulf-context-480.webp 768w",
        sizes: "100vw",
        loading: "lazy",
      },
      blogInlineImageSizes,
    );

    assert.ok(problems.some((problem) => problem.includes('width=""')));
    assert.ok(problems.some((problem) => problem.includes('height=""')));
    assert.ok(problems.some((problem) => problem.includes("decoding")));
    assert.ok(
      problems.some((problem) => problem.includes("canonical inline value")),
    );
    assert.ok(
      problems.some((problem) =>
        problem.includes("declares 768w but is 480px wide"),
      ),
    );
    assert.ok(
      problems.some((problem) =>
        problem.includes("not offered as a srcset candidate"),
      ),
    );
  });
});
