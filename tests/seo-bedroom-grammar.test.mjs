import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { promisify } from "node:util";
import { after, describe, it } from "node:test";

const execFileAsync = promisify(execFile);

const oneBedroomRoutes = [
  {
    slug: "leonidas",
    description: "House Leonidas in Mavrikiano Elounda — sleeps 3, 1 bedroom. Traditional Cretan home in Elounda.",
  },
  {
    slug: "demetra",
    description: "House Demetra in Mavrikiano Elounda — sleeps 4, 1 bedroom, shared pool. Traditional Cretan home in Elounda.",
  },
  {
    slug: "erato",
    description: "House Erato in Mavrikiano Elounda — sleeps 4, 1 bedroom, private pool. Traditional Cretan home in Elounda.",
  },
  {
    slug: "clio",
    description: "House Clio in Mavrikiano Elounda — sleeps 4, 1 bedroom. Traditional Cretan home in Elounda.",
  },
  {
    slug: "efterpi",
    description: "House Efterpi in Mavrikiano Elounda — sleeps 5, 1 bedroom. Traditional Cretan home in Elounda.",
  },
  {
    slug: "kalliopi",
    description: "House Kalliopi in Mavrikiano Elounda — sleeps 4, 1 bedroom. Traditional Cretan home in Elounda.",
  },
];

const metadata = (html, name) =>
  new RegExp(`<meta ${name} content="([^"]*)">`).exec(html)?.[1];

describe("SEO bedroom grammar", async () => {
  const temporaryDirectory = await mkdtemp(join(process.cwd(), ".astro-bedroom-grammar-"));
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

  for (const route of oneBedroomRoutes) {
    it(`renders singular meta and Open Graph bedroom grammar for ${route.slug}`, async () => {
      const html = await readFile(join(outputPath, "en/houses", route.slug, "index.html"), "utf8");

      assert.equal(metadata(html, 'name="description"'), route.description);
      assert.equal(metadata(html, 'property="og:description"'), route.description);
    });
  }

  it("keeps plural meta and Open Graph bedroom grammar for a two-bedroom house", async () => {
    const html = await readFile(join(outputPath, "en/houses/argyro/index.html"), "utf8");
    const description = "House Argyro in Mavrikiano Elounda — sleeps 4, 2 bedrooms. Traditional Cretan home in Elounda.";

    assert.equal(metadata(html, 'name="description"'), description);
    assert.equal(metadata(html, 'property="og:description"'), description);
  });
});
