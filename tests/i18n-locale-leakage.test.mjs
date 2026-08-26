import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { promisify } from 'node:util';
import { after, describe, it } from 'node:test';

const execFileAsync = promisify(execFile);

const root = new URL('../', import.meta.url);
const readText = (path) => readFile(new URL(path, root), 'utf8');
const asDataUrl = (code) => `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;

/** Run the real route map unmodified, with its dependency graph inlined. */
const loadRouteMap = async () => {
  const ts = (await import('typescript')).default;
  const transpile = async (name) =>
    ts.transpileModule(await readText(`src/i18n/${name}.ts`), {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
    }).outputText;

  const config = asDataUrl(await transpile('config'));
  return import(asDataUrl((await transpile('route-map')).replaceAll("'./config'", `'${config}'`)));
};

const anchors = (html) =>
  [...html.matchAll(/<a\b([^>]*)>/g)].map(([, attrs]) => ({
    href: attrs.match(/\bhref="([^"]*)"/)?.[1],
    isLanguageSwitcher: /\bdata-language-switcher-link\b/.test(attrs),
  }));

/**
 * Why a cross-locale link is allowed, or `null` when it is a leak.
 *
 * There are exactly two reasons, and neither is "it starts with /en/":
 *
 * 1. The language selector. Crossing locales is its entire purpose, and it
 *    carries a stable marker so it can be told apart from page navigation.
 * 2. The blog, which is deliberately English-only for now. The allowed paths are
 *    derived from the route map's own blog segments, so the exception stays
 *    scoped to that route family and cannot widen into a general `/en/` licence.
 */
export const crossLocaleReason = (link, blogPrefixes) => {
  if (link.isLanguageSwitcher) {
    return 'language selector';
  }

  if (blogPrefixes.some((prefix) => link.href === prefix || link.href.startsWith(prefix))) {
    return 'blog is intentionally excluded from German localization';
  }

  return null;
};

describe('German locale leakage — classifier', () => {
  it('allows only the language selector and the blog route family', async () => {
    const map = await loadRouteMap();
    const blogPrefixes = ['blog', 'blogArticle'].map(
      (routeId) => `/en/${map.routeMap[routeId].segments.en.join('/')}/`,
    );

    assert.deepEqual([...new Set(blogPrefixes)], ['/en/blog/'], 'the exception must be the blog route family');

    // Allowed.
    assert.equal(crossLocaleReason({ href: '/en/houses/', isLanguageSwitcher: true }, blogPrefixes), 'language selector');
    assert.ok(crossLocaleReason({ href: '/en/blog/', isLanguageSwitcher: false }, blogPrefixes));
    assert.ok(crossLocaleReason({ href: '/en/blog/elounda-beaches/', isLanguageSwitcher: false }, blogPrefixes));

    // Not allowed: the exception is a route family, not a prefix wildcard.
    for (const href of ['/en/', '/en/houses/', '/en/faq/', '/en/about/', '/en/contact/', '/en/policies/', '/en/blogging/']) {
      assert.equal(
        crossLocaleReason({ href, isLanguageSwitcher: false }, blogPrefixes),
        null,
        `${href} must not be treated as an allowed cross-locale destination`,
      );
    }
  });
});

describe('German locale leakage — generated output', async () => {
  const temporaryDirectory = await mkdtemp(join(process.cwd(), '.astro-i18n-leakage-'));
  const configPath = join(temporaryDirectory, 'astro.config.mjs');
  const cachePath = join(temporaryDirectory, 'cache');
  const outputPath = join(temporaryDirectory, 'dist');
  const projectConfig = new URL('astro.config.mjs', root).href;

  try {
    await writeFile(
      configPath,
      `import config from ${JSON.stringify(projectConfig)};\nexport default { ...config, cacheDir: ${JSON.stringify(cachePath)}, outDir: ${JSON.stringify(relative(process.cwd(), outputPath))} };\n`,
    );
    await execFileAsync(process.execPath, [
      './node_modules/astro/astro.js',
      'build',
      '--config',
      relative(process.cwd(), configPath),
    ]);
  } catch (error) {
    await rm(temporaryDirectory, { force: true, recursive: true });
    throw error;
  }

  after(() => rm(temporaryDirectory, { force: true, recursive: true }));

  const htmlFiles = async () =>
    (await readdir(outputPath, { recursive: true, withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith('.html'))
      .map((entry) => ({
        file: join(entry.parentPath ?? entry.path, entry.name),
        route: relative(outputPath, join(entry.parentPath ?? entry.path, entry.name)).replace(/\\/g, '/'),
      }));

  it('sends no German visitor to an English page outside the two allowed reasons', async () => {
    const map = await loadRouteMap();
    const blogPrefixes = [
      ...new Set(['blog', 'blogArticle'].map((id) => `/en/${map.routeMap[id].segments.en.join('/')}/`)),
    ];
    const leaks = [];

    for (const { file, route } of await htmlFiles()) {
      if (!route.startsWith('de/')) continue;

      for (const link of anchors(await readFile(file, 'utf8'))) {
        if (!link.href?.startsWith('/en/') && link.href !== '/en') continue;

        if (!crossLocaleReason(link, blogPrefixes)) {
          leaks.push(`/${route.replace(/index\.html$/, '')} → ${link.href} (no German equivalent linked; not the language selector, not the blog)`);
        }
      }
    }

    assert.deepEqual(leaks, [], `German pages leaking into English:\n${leaks.join('\n')}`);
  });

  it('keeps every allowed cross-locale link pointing at a page that exists', async () => {
    const map = await loadRouteMap();
    const blogPrefixes = [
      ...new Set(['blog', 'blogArticle'].map((id) => `/en/${map.routeMap[id].segments.en.join('/')}/`)),
    ];

    for (const { file, route } of await htmlFiles()) {
      if (!route.startsWith('de/')) continue;

      for (const link of anchors(await readFile(file, 'utf8'))) {
        if (!link.href?.startsWith('/en/')) continue;
        assert.ok(crossLocaleReason(link, blogPrefixes), `${route}: ${link.href}`);
        await access(join(outputPath, link.href.split('#')[0].split('?')[0], 'index.html'));
      }
    }
  });

  it('keeps English pages free of German URLs outside the language selector', async () => {
    const strays = [];

    for (const { file, route } of await htmlFiles()) {
      if (route.startsWith('de/')) continue;

      for (const link of anchors(await readFile(file, 'utf8'))) {
        if (!link.href?.startsWith('/de/') || link.isLanguageSwitcher) continue;
        strays.push(`/${route.replace(/index\.html$/, '')} → ${link.href}`);
      }
    }

    assert.deepEqual(strays, [], `English pages linking into German:\n${strays.join('\n')}`);
  });

  it('builds a page for every static route the map declares for German', async () => {
    const map = await loadRouteMap();
    const missing = [];

    for (const [routeId, definition] of Object.entries(map.routeMap)) {
      if (definition.dynamic || !definition.segments.de) continue;

      const path = map.routePath('de', routeId);

      try {
        await access(join(outputPath, path, 'index.html'));
      } catch {
        missing.push(`${routeId} → ${path}`);
      }
    }

    assert.deepEqual(missing, [], `route map declares German routes with no generated page:\n${missing.join('\n')}`);
  });
});
