import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import sharp from 'sharp';

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const script = path.join(root, 'scripts', 'process-blog-image.mjs');

async function fixture(width = 1200, height = 675, extension = 'jpg') {
  const directory = await mkdtemp(path.join(tmpdir(), 'traditional-homes-blog-image-'));
  const file = path.join(directory, `source.${extension}`);
  const image = sharp({ create: { width, height, channels: 3, background: { r: 50, g: 100, b: 150 } } });
  if (extension === 'png') await image.png().toFile(file);
  else await image.jpeg({ quality: 90 }).toFile(file);
  return { directory, file };
}

function run(args, env = {}) {
  return execFileAsync(process.execPath, [script, ...args], { cwd: root, env: { ...process.env, ...env } });
}

async function cleanupBlog(slug, name, extension = 'jpg') {
  await rm(path.join(root, 'src', 'assets', 'blog-source', slug, `${name}.${extension}`), { force: true, maxRetries: 10, retryDelay: 100 });
  for (const width of [480, 768, 1200, 1600, 2400]) await rm(path.join(root, 'public', 'images', 'blog', slug, `${name}-${width}.webp`), { force: true, maxRetries: 10, retryDelay: 100 });
}

test('blog image CLI help and argument errors are stable', async () => {
  const help = await run(['--help']);
  assert.match(help.stdout, /npm run blog:image -- --slug <blog-slug> --file <path-to-source> --name <image-name>/);
  assert.match(help.stdout, /Windows\/npm fallback/);
  await assert.rejects(run([]), error => {
    assert.equal(error.code, 1);
    assert.match(error.stderr, /Missing required --slug option/);
    return true;
  });
});

test('blog image CLI accepts named, positional, and npm-config argument forms', async (t) => {
  const source = await fixture();
  t.after(() => rm(source.directory, { recursive: true, force: true }));
  const slug = 'welcome-to-elounda';
  const names = [`named-${Date.now()}`, `positional-${Date.now()}`, `npm-${Date.now()}`];
  for (const name of names) t.after(() => cleanupBlog(slug, name));

  await run(['--', '--slug', slug, '--file', source.file, '--name', names[0]]);
  await run([slug, source.file, names[1]]);
  await run([], { npm_config_slug: slug, npm_config_file: source.file, npm_config_name: names[2] });
  for (const name of names) await stat(path.join(root, 'public', 'images', 'blog', slug, `${name}-1200.webp`));
});

test('blog image CLI preserves default-name and slug normalization behavior', async (t) => {
  const source = await fixture();
  t.after(() => rm(source.directory, { recursive: true, force: true }));
  const defaultSlug = 'elounda-guide-style-1';
  t.after(() => cleanupBlog(defaultSlug, 'hero'));
  const defaultName = await run(['--', defaultSlug, source.file]);
  assert.match(defaultName.stderr, /Defaulting image name to "hero"/);
  assert.match(defaultName.stdout, /image: \/images\/blog\/elounda-guide-style-1\/hero-1200\.webp/);

  const mixedCase = 'Mavrikiano-Distances-And-Guide';
  const name = `case-${Date.now()}`;
  t.after(() => cleanupBlog(mixedCase.toLowerCase(), name));
  const resolved = await run(['--slug', mixedCase.toLowerCase(), '--file', source.file, '--name', name]);
  assert.match(resolved.stderr, /using existing mixed-case blog id "Mavrikiano-Distances-And-Guide"/);
  await assert.rejects(run(['--slug', '../unsafe', '--file', source.file, '--name', name]), /slug must contain at least one letter or number/);
  await assert.rejects(run(['--slug', 'not-a-real-post', '--file', source.file, '--name', name]), /Blog post "not-a-real-post" was not found/);
});

test('blog image CLI validates formats, source existence, source shape, and no-upscale', async (t) => {
  const small = await fixture(479, 300);
  const portrait = await fixture(800, 1200);
  const narrow = await fixture(800, 620);
  const png = await fixture(800, 450, 'png');
  t.after(() => Promise.all([small, portrait, narrow, png].map(item => rm(item.directory, { recursive: true, force: true }))));
  const slug = 'welcome-to-elounda';
  for (const name of ['portrait', 'narrow', 'png']) t.after(() => cleanupBlog(slug, name, name === 'png' ? 'png' : 'jpg'));

  await assert.rejects(run(['--slug', slug, '--file', path.join(small.directory, 'missing.jpg'), '--name', 'missing']), /Source image not found/);
  const invalid = path.join(small.directory, 'source.gif');
  await writeFile(invalid, 'gif');
  await assert.rejects(run(['--slug', slug, '--file', invalid, '--name', 'invalid']), /Unsupported source type "\.gif"/);
  await assert.rejects(run(['--slug', slug, '--file', small.file, '--name', 'small']), /below the smallest generated width \(480px\).*Refusing to upscale/);
  const portraitResult = await run(['--slug', slug, '--file', portrait.file, '--name', 'portrait']);
  assert.match(portraitResult.stderr, /source width is 800px; 2400px or wider is recommended/);
  assert.match(portraitResult.stderr, /source image is portrait/);
  const narrowResult = await run(['--slug', slug, '--file', narrow.file, '--name', 'narrow']);
  assert.match(narrowResult.stderr, /source aspect ratio is 1\.29:1/);
  const pngResult = await run(['--slug', slug, '--file', png.file, '--name', 'png']);
  assert.match(pngResult.stderr, /PNG is allowed only when the source is not a normal photo/);
});

test('blog image CLI copies the source, filters widths, uses WebP quality 84, and refuses overwrite', async (t) => {
  const source = await fixture(1200, 675);
  t.after(() => rm(source.directory, { recursive: true, force: true }));
  const slug = 'welcome-to-elounda';
  const name = `contract-${Date.now()}`;
  t.after(() => cleanupBlog(slug, name));
  const result = await run(['--slug', slug, '--file', source.file, '--name', name]);
  assert.match(result.stdout, new RegExp(`Copied source: src[\\\\/]assets[\\\\/]blog-source[\\\\/]${slug}[\\\\/]${name}\\.jpg`));
  assert.match(result.stdout, new RegExp(`image: /images/blog/${slug}/${name}-1200\\.webp`));
  await stat(path.join(root, 'src', 'assets', 'blog-source', slug, `${name}.jpg`));
  for (const width of [480, 768, 1200]) await stat(path.join(root, 'public', 'images', 'blog', slug, `${name}-${width}.webp`));
  await assert.rejects(stat(path.join(root, 'public', 'images', 'blog', slug, `${name}-1600.webp`)));
  await assert.rejects(run(['--slug', slug, '--file', source.file, '--name', name]), /Refusing to overwrite existing files/);
});
