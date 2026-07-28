import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { describe, it } from "node:test";

const readText = (path) =>
  readFile(new URL(`../${path}`, import.meta.url), "utf8");

const testGuides = [
  "elounda-guide-style-1",
  "elounda-guide-style-2",
  "elounda-guide-style-3",
];

describe("Elounda test guide privacy", () => {
  it("keeps all three reference guides as drafts handled by the existing blog filters", async () => {
    for (const slug of testGuides) {
      const guideUrl = new URL(
        `../src/content/blog/${slug}.md`,
        import.meta.url,
      );

      await access(guideUrl);
      assert.match(await readFile(guideUrl, "utf8"), /^draft:\s*true\s*$/m);
    }

    const blogRoute = await readText("src/pages/en/blog/[...slug].astro");
    const blogIndex = await readText("src/pages/en/blog/index.astro");
    const sitemapConfig = await readText("astro.config.mjs");

    assert.match(
      blogRoute,
      /getCollection\('blog'\)\)\.filter\(p => !p\.data\.draft\)/,
    );
    assert.match(
      blogRoute,
      /relatedPosts[\s\S]*filter\(post => !post\.data\.draft/,
    );
    assert.match(blogIndex, /filter\(p => !p\.data\.draft/);
    assert.doesNotMatch(sitemapConfig, /elounda-guide-style/);
  });
});
