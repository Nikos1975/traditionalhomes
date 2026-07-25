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
  },
  {
    path: "en/houses/argyro/index.html",
    url: "/en/houses/argyro/",
  },
  {
    path: "en/villa/almond-tree-villa/index.html",
    url: "/en/villa/almond-tree-villa/",
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
  }
});
