import assert from 'node:assert/strict';
import { copyFile, mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import sharp from 'sharp';

import { PROFILES, resolveProfile } from '../scripts/images/profiles.mjs';
import { processImage } from '../scripts/images/core.mjs';

const execFileAsync = promisify(execFile);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function makeWorkspace() {
  const root = await mkdtemp(path.join(tmpdir(), 'traditional-homes-image-pipeline-'));
  const source = path.join(root, 'fixture.jpg');
  await sharp({
    create: { width: 1200, height: 675, channels: 3, background: { r: 48, g: 112, b: 168 } },
  }).jpeg({ quality: 90 }).toFile(source);
  return { root, source };
}

async function removeBlogOutputs(slug, imageName, widths = [480, 768, 1200]) {
  await rm(path.join(repoRoot, 'src', 'assets', 'blog-source', slug, `${imageName}.jpg`), { force: true });
  for (const width of widths) await rm(path.join(repoRoot, 'public', 'images', 'blog', slug, `${imageName}-${width}.webp`), { force: true });
}

async function runBlog(args) {
  return execFileAsync(process.execPath, ['scripts/process-blog-image.mjs', ...args], { cwd: repoRoot });
}

async function readImageMetadata(filePath) {
  const program = `import sharp from 'sharp'; console.log(JSON.stringify(await sharp(${JSON.stringify(filePath)}).metadata()));`;
  const { stdout } = await execFileAsync(process.execPath, ['--input-type=module', '--eval', program], { cwd: repoRoot });
  return JSON.parse(stdout);
}

test('defines the approved hero and blog profile defaults', () => {
  assert.deepEqual(PROFILES['homepage-hero'].widths, [480, 768, 1024, 1440, 1920, 2400]);
  assert.equal(PROFILES['homepage-hero'].quality, 76);
  assert.deepEqual(PROFILES['blog-hero'].widths, [480, 768, 1200, 1600, 2400]);
  assert.equal(PROFILES['blog-hero'].quality, 84);
  assert.equal(PROFILES['property-card'].quality, 76);
  assert.equal(PROFILES.gallery.quality, 76);
  assert.equal(PROFILES['social-image'].quality, 76);
  assert.throws(() => resolveProfile('property-card'), /requires explicit --widths/);
});

test('property-card and gallery use quality 76 with explicit widths, and still require widths', async (t) => {
  const workspace = await makeWorkspace();
  t.after(() => rm(workspace.root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }));

  for (const profile of ['property-card', 'gallery']) {
    const report = await processImage({
      source: workspace.source,
      profile,
      name: profile,
      outputDir: path.join(workspace.root, profile),
      widths: '480,768',
    });
    assert.equal(report.quality, 76);
    assert.deepEqual(report.outputs.map(output => output.width), [480, 768]);
    await assert.rejects(
      processImage({ source: workspace.source, profile, name: `${profile}-missing`, outputDir: path.join(workspace.root, `${profile}-missing`) }),
      /requires explicit --widths/,
    );
  }
});

test('rejects every malformed width token instead of silently filtering it', async (t) => {
  const workspace = await makeWorkspace();
  t.after(() => rm(workspace.root, { recursive: true, force: true }));

  for (const widths of ['480,abc,768', '480,,768', '480,480', '0,768', '480.5,768', '480.0,768', '1e3,768', '-480,768']) {
    await assert.rejects(
      processImage({ source: workspace.source, profile: 'property-card', name: 'card', outputDir: path.join(workspace.root, widths.replaceAll(/[^a-z0-9]/gi, '-')), widths }),
      /Widths must be a comma-separated list of unique positive integers/,
    );
  }
});

test('social-image generates the reviewed exact cover dimensions', async (t) => {
  const workspace = await makeWorkspace();
  t.after(() => rm(workspace.root, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 }));
  const outputDir = path.join(workspace.root, 'social');
  const report = await processImage({
    source: workspace.source,
    profile: 'social-image',
    name: 'social-card',
    outputDir,
    widths: '1200',
    height: '630',
    position: 'center',
    cropReviewed: true,
  });

  assert.equal(report.quality, 76);
  assert.deepEqual(report.outputs.map(output => [output.width, output.height]), [[1200, 630]]);
  const metadata = await readImageMetadata(report.outputs[0].path);
  assert.equal(metadata.width, 1200);
  assert.equal(metadata.height, 630);
});

test('social-image validates height, one width, crop review, and position', async (t) => {
  const workspace = await makeWorkspace();
  t.after(() => rm(workspace.root, { recursive: true, force: true }));
  const base = { source: workspace.source, profile: 'social-image', name: 'social', outputDir: path.join(workspace.root, 'social'), widths: '1200' };

  await assert.rejects(processImage({ ...base, cropReviewed: true }), /requires --height/);
  await assert.rejects(processImage({ ...base, height: '630', cropReviewed: true, widths: '480,1200' }), /requires exactly one --width/);
  await assert.rejects(processImage({ ...base, height: '630' }), /requires explicit crop review/);
  await assert.rejects(processImage({ ...base, height: '630', cropReviewed: true, position: 'not-a-position' }), /Position must be a Sharp-supported safe position/);
  await assert.rejects(processImage({ ...base, height: '0', cropReviewed: true }), /Height must be a positive integer/);
});

test('image CLI reports the friendly Sharp dependency error when Sharp is unavailable', async (t) => {
  const workspace = await makeWorkspace();
  const scriptRoot = await mkdtemp(path.join(tmpdir(), 'traditional-homes-image-cli-without-sharp-'));
  t.after(() => Promise.all([rm(workspace.root, { recursive: true, force: true }), rm(scriptRoot, { recursive: true, force: true })]));
  await mkdir(path.join(scriptRoot, 'images'), { recursive: true });
  await Promise.all([
    copyFile(path.join(repoRoot, 'scripts', 'process-blog-image.mjs'), path.join(scriptRoot, 'process-blog-image.mjs')),
    copyFile(path.join(repoRoot, 'scripts', 'images', 'process-image.mjs'), path.join(scriptRoot, 'images', 'process-image.mjs')),
    copyFile(path.join(repoRoot, 'scripts', 'images', 'core.mjs'), path.join(scriptRoot, 'images', 'core.mjs')),
    copyFile(path.join(repoRoot, 'scripts', 'images', 'profiles.mjs'), path.join(scriptRoot, 'images', 'profiles.mjs')),
  ]);
  await assert.rejects(
    execFileAsync(process.execPath, [path.join(scriptRoot, 'images', 'process-image.mjs'), '--source', workspace.source, '--profile', 'homepage-hero', '--name', 'hero', '--output-dir', path.join(workspace.root, 'output')]),
    error => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /The "sharp" package is required\. Install it before running this script\./);
      assert.doesNotMatch(error.stderr, /Cannot find package 'sharp'/);
      return true;
    },
  );
  await assert.rejects(
    execFileAsync(process.execPath, [path.join(scriptRoot, 'process-blog-image.mjs'), '--slug', 'welcome-to-elounda', '--file', workspace.source, '--name', 'hero'], { cwd: repoRoot }),
    error => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /The "sharp" package is required\. Install it before running this script\./);
      assert.doesNotMatch(error.stderr, /Cannot find package 'sharp'/);
      return true;
    },
  );
});

test('generates deterministic WebP candidates without upscaling and reports structured sizes', async (t) => {
  const workspace = await makeWorkspace();
  t.after(() => rm(workspace.root, { recursive: true, force: true }));
  const outputDir = path.join(workspace.root, 'output');

  const report = await processImage({
    source: workspace.source,
    profile: 'homepage-hero',
    name: 'coastal-hero',
    outputDir,
  });

  assert.deepEqual(report.outputs.map(output => output.width), [480, 768, 1024]);
  assert.deepEqual(report.outputs.map(output => path.basename(output.path)), [
    'coastal-hero-480.webp',
    'coastal-hero-768.webp',
    'coastal-hero-1024.webp',
  ]);
  assert.equal(report.source.format, 'jpeg');
  assert.equal(report.source.width, 1200);
  assert.ok(report.totalOutputBytes > 0);
  assert.ok(report.outputs.every(output => output.bytes > 0 && output.compressionRatio > 0));
  await Promise.all(report.outputs.map(output => stat(output.path)));
});

test('does not publish outputs during dry runs or before a collision is resolved', async (t) => {
  const workspace = await makeWorkspace();
  t.after(() => rm(workspace.root, { recursive: true, force: true }));
  const outputDir = path.join(workspace.root, 'output');

  const dryRun = await processImage({
    source: workspace.source,
    profile: 'homepage-hero',
    name: 'coastal-hero',
    outputDir,
    dryRun: true,
  });
  assert.equal(dryRun.dryRun, true);
  await assert.rejects(stat(path.join(outputDir, 'coastal-hero-480.webp')));

  await mkdir(outputDir, { recursive: true });
  const collision = path.join(outputDir, 'coastal-hero-480.webp');
  await writeFile(collision, 'keep');
  await assert.rejects(
    processImage({ source: workspace.source, profile: 'homepage-hero', name: 'coastal-hero', outputDir }),
    /Refusing to overwrite existing files/,
  );
  assert.equal(await readFile(collision, 'utf8'), 'keep');

  const overwritten = await processImage({
    source: workspace.source,
    profile: 'homepage-hero',
    name: 'coastal-hero',
    outputDir,
    overwrite: true,
  });
  assert.ok(overwritten.outputs.length > 0);
  assert.notEqual(await readFile(collision, 'utf8'), 'keep');
});

test('rejects unsafe destinations and unsupported sources', async (t) => {
  const workspace = await makeWorkspace();
  t.after(() => rm(workspace.root, { recursive: true, force: true }));
  const invalid = path.join(workspace.root, 'fixture.svg');
  await writeFile(invalid, '<svg xmlns="http://www.w3.org/2000/svg"/>');

  await assert.rejects(
    processImage({ source: invalid, profile: 'homepage-hero', name: 'hero', outputDir: path.join(workspace.root, 'output') }),
    /Unsupported source type/,
  );
  await assert.rejects(
    processImage({ source: workspace.source, profile: 'homepage-hero', name: '../hero', outputDir: path.join(workspace.root, 'output') }),
    /safe filename segment/,
  );
  await assert.rejects(
    processImage({ source: workspace.source, profile: 'homepage-hero', name: 'hero', outputDir: `${workspace.root}\\..\\unsafe-output` }),
    /must not contain path traversal/,
  );
});

test('warns when WebP is larger than a practical PNG source and accepts Windows source paths', async (t) => {
  const workspace = await makeWorkspace();
  t.after(() => rm(workspace.root, { recursive: true, force: true }));
  const pngSource = path.join(workspace.root, 'flat.png');
  await sharp({ create: { width: 600, height: 338, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 0 } } }).png({ compressionLevel: 9, palette: true }).toFile(pngSource);
  const report = await processImage({
    source: pngSource.replaceAll('/', '\\'),
    profile: 'homepage-hero',
    name: 'flat',
    outputDir: path.join(workspace.root, 'output'),
  });
  assert.ok(report.warnings.some(warning => warning.includes('is larger than the source image')));
});

test('blog CLI preserves supported npm argument forms, source copy, widths, and snippet', async (t) => {
  const workspace = await makeWorkspace();
  t.after(() => rm(workspace.root, { recursive: true, force: true }));
  const slug = 'welcome-to-elounda';
  const imageName = `pipeline-fixture-${Date.now()}`;
  t.after(() => removeBlogOutputs(slug, imageName));
  const result = await runBlog(['--', '--slug', slug, '--file', workspace.source, '--name', imageName]);

  assert.match(result.stdout, new RegExp(`Copied source: src[\\\\/]assets[\\\\/]blog-source[\\\\/]${slug}[\\\\/]${imageName}\\.jpg`));
  assert.match(result.stdout, new RegExp(`image: /images/blog/${slug}/${imageName}-1200\\.webp`));
  for (const width of [480, 768, 1200]) {
    await stat(path.join(repoRoot, 'public', 'images', 'blog', slug, `${imageName}-${width}.webp`));
  }
  await assert.rejects(runBlog(['--slug', slug, '--file', workspace.source, '--name', imageName]), error => {
    assert.equal(error.code, 1);
    assert.match(error.stderr, /Refusing to overwrite existing files/);
    return true;
  });
});

test('blog CLI preserves default-name and mixed-case slug handling for both npm forwarding forms', async (t) => {
  const workspace = await makeWorkspace();
  t.after(() => rm(workspace.root, { recursive: true, force: true }));
  const defaultSlug = 'welcome-to-elounda';
  t.after(() => removeBlogOutputs(defaultSlug, 'hero'));
  const defaultResult = await runBlog(['--', defaultSlug, workspace.source]);
  assert.match(defaultResult.stderr, /Defaulting image name to "hero"/);
  assert.match(defaultResult.stdout, /image: \/images\/blog\/welcome-to-elounda\/hero-1200\.webp/);

  const mixedCaseSlug = 'Mavrikiano-Distances-And-Guide';
  const imageName = `case-fixture-${Date.now()}`;
  t.after(() => removeBlogOutputs(mixedCaseSlug.toLowerCase(), imageName));
  const caseResult = await runBlog(['--', '--slug', mixedCaseSlug.toLowerCase(), '--file', workspace.source, '--name', imageName]);
  assert.match(caseResult.stderr, new RegExp(`using existing mixed-case blog id "${mixedCaseSlug}"`));
  await stat(path.join(repoRoot, 'src', 'assets', 'blog-source', mixedCaseSlug.toLowerCase(), `${imageName}.jpg`));
});

test('blog CLI retains stable errors for missing slugs and unsupported files', async (t) => {
  const workspace = await makeWorkspace();
  t.after(() => rm(workspace.root, { recursive: true, force: true }));
  await assert.rejects(runBlog(['--slug', 'not-a-real-post', '--file', workspace.source, '--name', 'hero']), error => {
    assert.equal(error.code, 1);
    assert.match(error.stderr, /Blog post "not-a-real-post" was not found/);
    return true;
  });
  const invalid = path.join(workspace.root, 'fixture.gif');
  await writeFile(invalid, 'not-an-image');
  await assert.rejects(runBlog(['--slug', 'welcome-to-elounda', '--file', invalid, '--name', 'hero']), error => {
    assert.equal(error.code, 1);
    assert.match(error.stderr, /Unsupported source type "\.gif"/);
    return true;
  });
});
