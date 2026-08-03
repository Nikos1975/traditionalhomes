import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import test from 'node:test';

const repoRoot = resolve(import.meta.dirname, '..');
const siteOrigin = 'https://traditional-homes.gr';
const llmsSourcePath = join(repoRoot, 'public', 'llms.txt');
const approvedH1 = '# Elounda Traditional Homes of Crete';

function markdownLinks(content) {
  return [...content.matchAll(/\[[^\]]+\]\(([^\s)]+)\)/g)]
    .map((match) => match[1]);
}

function generatedPathForUrl(buildDir, url) {
  const { pathname } = new URL(url);
  return join(buildDir, ...pathname.split('/').filter(Boolean), 'index.html');
}

test('publishes a compliant agent-readable site index', () => {
  assert.ok(existsSync(llmsSourcePath), 'public/llms.txt must exist');

  const source = readFileSync(llmsSourcePath);
  const content = source.toString('utf8');
  const nonEmptyLines = content.split(/\r?\n/).filter((line) => line.trim());
  const h1Lines = nonEmptyLines.filter((line) => /^#\s+/.test(line));
  const links = markdownLinks(content);

  assert.equal(nonEmptyLines[0], approvedH1);
  assert.deepEqual(h1Lines, [approvedH1]);
  assert.match(content, /^>\s+.+/m, 'must include a blockquote summary');
  assert.ok(links.length > 0, 'must include Markdown links');
  assert.doesNotMatch(content, /(?:localhost|pages\.dev|https:\/\/traditional-homes\.gr\/blog\/|(?<!\/en)\/blog\/|<\/?[a-z][^>]*>|\b(?:TODO|TBD|placeholder|lorem ipsum)\b)/i);

  for (const link of links) {
    const parsed = new URL(link);
    assert.equal(parsed.origin, siteOrigin);
    assert.ok(parsed.pathname.endsWith('/'), `${link} must retain its trailing slash`);
  }

  const buildRoot = mkdtempSync(join(tmpdir(), 'traditional-homes-llms-'));
  const buildDir = join(buildRoot, 'dist');
  const configDirectory = mkdtempSync(join(repoRoot, '.llms-txt-config-'));
  const configPath = join(configDirectory, 'astro.config.mjs');

  try {
    writeFileSync(
      configPath,
      `import baseConfig from ${JSON.stringify(pathToFileURL(join(repoRoot, 'astro.config.mjs')).href)};\nexport default { ...baseConfig, outDir: ${JSON.stringify(buildDir)} };\n`,
      'utf8',
    );

    execFileSync(process.execPath, ['node_modules/astro/astro.js', 'build', '--config', relative(repoRoot, configPath)], {
      cwd: repoRoot,
      stdio: 'pipe',
    });

    const generatedLlmsPath = join(buildDir, 'llms.txt');
    assert.ok(existsSync(generatedLlmsPath), 'generated llms.txt must exist');
    assert.ok(!existsSync(join(buildDir, 'llms', 'index.html')), 'llms.txt must not generate an HTML route');
    assert.equal(Buffer.compare(source, readFileSync(generatedLlmsPath)), 0, 'generated llms.txt must match public/llms.txt byte-for-byte');

    for (const link of links) {
      const generatedPath = generatedPathForUrl(buildDir, link);
      assert.ok(existsSync(generatedPath), `${link} must resolve to ${basename(generatedPath)}`);
    }
  } finally {
    rmSync(buildRoot, { force: true, recursive: true });
    rmSync(configDirectory, { force: true, recursive: true });
  }
});
