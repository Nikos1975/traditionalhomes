import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { promisify } from "node:util";
import { after, describe, it } from "node:test";

const execFileAsync = promisify(execFile);

const routes = [
  {
    path: "blog/mavrikiano-distances-and-guide/index.html",
    url: "/blog/mavrikiano-distances-and-guide/",
    redundantTitle: "Mavrikiano & Mirabello Bay Exploration Guide",
    renderedTitlePattern: "Mavrikiano (?:&#x26;|&amp;) Mirabello Bay Exploration Guide",
    verifyTableOfContents: true,
  },
  {
    path: "en/houses/argyro/index.html",
    url: "/en/houses/argyro/",
    redundantTitle: "House Argyro",
  },
  {
    path: "en/villa/almond-tree-villa/index.html",
    url: "/en/villa/almond-tree-villa/",
    redundantTitle: "Almond Tree Villa",
  },
];

describe("Duplicate page headings", async () => {
  const temporaryDirectory = await mkdtemp(join(process.cwd(), ".astro-headings-"));
  const configPath = join(temporaryDirectory, "astro.config.mjs");
  const cachePath = join(temporaryDirectory, "cache");
  const outputPath = join(temporaryDirectory, "dist");
  const projectConfig = new URL("../astro.config.mjs", import.meta.url).href;

  try {
    await writeFile(
      configPath,
      `import config from ${JSON.stringify(projectConfig)};\nexport default { ...config, cacheDir: ${JSON.stringify(cachePath)}, outDir: ${JSON.stringify(relative(process.cwd(), outputPath))} };\n`,
    );
    await execFileAsync(process.execPath, [
      "./node_modules/astro/astro.js",
      "build",
      "--config",
      relative(process.cwd(), configPath),
    ]);
  } catch (error) {
    await rm(temporaryDirectory, { force: true, recursive: true });
    throw error;
  }

  after(() => rm(temporaryDirectory, { force: true, recursive: true }));

  for (const route of routes) {
    it(`renders exactly one H1 for ${route.url}`, async () => {
      const html = await readFile(join(outputPath, route.path), "utf8");
      const h1Count = (html.match(/<h1(?:\s|>)/g) ?? []).length;

      assert.equal(h1Count, 1, `${route.url} should render exactly one H1`);
    });

    it(`does not render the redundant title as an H2 for ${route.url}`, async () => {
      const html = await readFile(join(outputPath, route.path), "utf8");
      const renderedTitlePattern = route.renderedTitlePattern ?? route.redundantTitle;
      const redundantH2 = new RegExp(
        `<h2(?:\\s[^>]*)?>\\s*${renderedTitlePattern}\\s*</h2>`,
      );

      assert.doesNotMatch(html, redundantH2, `${route.url} should not render its redundant title as an H2`);
    });

    if (route.verifyTableOfContents) {
      it(`does not include the redundant title in the article table of contents for ${route.url}`, async () => {
        const html = await readFile(join(outputPath, route.path), "utf8");
        const tableOfContents = html.match(
          /<nav[^>]*aria-labelledby="article-toc-heading"[^>]*>[\s\S]*?<\/nav>/,
        )?.[0] ?? "";

        assert.doesNotMatch(
          tableOfContents,
          new RegExp(route.renderedTitlePattern ?? route.redundantTitle),
          `${route.url} should not include its redundant title in the article table of contents`,
        );
      });
    }
  }
});
