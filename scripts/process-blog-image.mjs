#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { inspectRaster, writeWebpCandidate } from './images/core.mjs';

const ROOT = process.cwd();
const BLOG_CONTENT_DIR = path.join(ROOT, 'src', 'content', 'blog');
const SOURCE_ROOT = path.join(ROOT, 'src', 'assets', 'blog-source');
const PUBLIC_ROOT = path.join(ROOT, 'public', 'images', 'blog');
const WIDTHS = [480, 768, 1200, 1600, 2400];
const QUALITY = 84;
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

function printHelp() {
  console.log(`Usage:
  npm run blog:image -- --slug <blog-slug> --file <path-to-source> --name <image-name>
  npm run blog:image -- -- --slug <blog-slug> --file <path-to-source> --name <image-name>

Options:
  --slug   Blog post id/filename without .md, for example elounda-wartime-memory
  --file   Source image path. JPG/JPEG preferred for photos; PNG only for non-photo sources.
  --name   Output image base name, for example hero
  --help   Show this help

Example:
  npm run blog:image -- --slug elounda-wartime-memory --file "C:\\path\\to\\photo.jpg" --name hero

Windows/npm fallback:
  npm run blog:image -- -- --slug elounda-wartime-memory --file "C:\\path\\to\\photo.jpg" --name hero

Generated files:
  src/assets/blog-source/{post-slug}/{image-name}.{ext}
  public/images/blog/{post-slug}/{image-name}-{width}.webp
`);
}

function parseArgs(argv) {
  const args = {};
  const positional = [];
  const tokens = argv[0] === '--' ? argv.slice(1) : argv;

  for (let i = 0; i < tokens.length; i += 1) {
    const arg = tokens[i];

    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }

    if (!arg.startsWith('--')) {
      positional.push(arg);
      continue;
    }

    const key = arg.slice(2);
    const value = tokens[i + 1];

    if (!value || value.startsWith('--')) {
      throw new Error(`Missing value for --${key}`);
    }

    args[key] = value;
    i += 1;
  }

  if (!args.slug && positional[0]) args.slug = positional[0];
  if (!args.file && positional[1]) args.file = positional[1];
  if (!args.name && positional[2]) args.name = positional[2];

  if (!args.slug && process.env.npm_config_slug && process.env.npm_config_slug !== 'true') {
    args.slug = process.env.npm_config_slug;
  }

  if (!args.file && process.env.npm_config_file && process.env.npm_config_file !== 'true') {
    args.file = process.env.npm_config_file;
  }

  if (!args.name && process.env.npm_config_name && process.env.npm_config_name !== process.env.npm_package_name) {
    args.name = process.env.npm_config_name;
  }

  if (!args.name && positional.length === 2) {
    args.name = 'hero';
    console.warn('Warning: npm did not forward --name. Defaulting image name to "hero"; use the extra "--" fallback for another name.');
  }

  return args;
}

function safeSegment(value, label, { preserveCase = false } = {}) {
  const normalized = value
    .trim()
    .replace(/\.[^.]+$/, '')
    .replace(/[^A-Za-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const result = preserveCase ? normalized : normalized.toLowerCase();

  if (!result) {
    throw new Error(`${label} must contain at least one letter or number.`);
  }

  if (!/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(result)) {
    throw new Error(`${label} contains unsupported characters after normalization: ${result}`);
  }

  return result;
}

async function pathExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveBlogSlug(requestedSlug) {
  const slug = safeSegment(requestedSlug, 'slug', { preserveCase: true });
  const files = (await fs.readdir(BLOG_CONTENT_DIR))
    .filter(file => file.endsWith('.md'))
    .map(file => ({
      id: path.basename(file, '.md'),
      file,
    }));

  const exact = files.find(entry => entry.id === slug);
  if (exact) return exact.id;

  const caseInsensitive = files.filter(entry => entry.id.toLowerCase() === slug.toLowerCase());
  if (caseInsensitive.length === 1) {
    console.warn(`Warning: using existing mixed-case blog id "${caseInsensitive[0].id}" for requested slug "${requestedSlug}".`);
    return caseInsensitive[0].id;
  }

  const suggestions = files.map(entry => entry.id).sort().join(', ');
  throw new Error(`Blog post "${requestedSlug}" was not found in src/content/blog/. Existing ids: ${suggestions}`);
}

async function assertWillNotOverwrite(paths) {
  const existing = [];

  for (const filePath of paths) {
    if (await pathExists(filePath)) existing.push(path.relative(ROOT, filePath));
  }

  if (existing.length > 0) {
    throw new Error(`Refusing to overwrite existing files:\n${existing.map(file => `- ${file}`).join('\n')}`);
  }
}

function printSnippet(slug, name, generatedWidths) {
  const srcWidth = generatedWidths.includes(1600)
    ? 1600
    : generatedWidths[generatedWidths.length - 1];

  console.log('\nMarkdown/frontmatter-ready snippet:\n');
  console.log(`image: /images/blog/${slug}/${name}-${srcWidth}.webp`);
  console.log('imageAlt: ""');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  for (const key of ['slug', 'file', 'name']) {
    if (!args[key]) throw new Error(`Missing required --${key} option.`);
  }

  const contentId = await resolveBlogSlug(args.slug);
  const slug = safeSegment(contentId, 'slug');
  const imageName = safeSegment(args.name, 'name');
  const sourcePath = path.resolve(ROOT, args.file);
  const sourceExt = path.extname(sourcePath).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(sourceExt)) {
    throw new Error(`Unsupported source type "${sourceExt}". Use JPG/JPEG for photos, or PNG only for non-photo sources.`);
  }

  if (!(await pathExists(sourcePath))) {
    throw new Error(`Source image not found: ${sourcePath}`);
  }

  let metadata;
  try {
    metadata = await inspectRaster(sourcePath);
  } catch (error) {
    if (error?.code === 'ERR_MODULE_NOT_FOUND') throw new Error('The "sharp" package is required. Install it before running this script.');
    throw error;
  }

  if (metadata.width < 2400) {
    console.warn(`Warning: source width is ${metadata.width}px; 2400px or wider is recommended for blog hero images.`);
  }

  const aspectRatio = metadata.width / metadata.height;
  if (metadata.height > metadata.width) {
    console.warn('Warning: source image is portrait. Landscape images are preferred for blog hero images.');
  } else if (aspectRatio < 1.35) {
    console.warn(`Warning: source aspect ratio is ${aspectRatio.toFixed(2)}:1. A wider landscape crop is usually better for hero images.`);
  }

  if (sourceExt === '.png') {
    console.warn('Warning: PNG is allowed only when the source is not a normal photo. JPG/JPEG is preferred for photos.');
  }

  const generatedWidths = WIDTHS.filter(width => width <= metadata.width);
  if (generatedWidths.length === 0) {
    throw new Error(`Source width is ${metadata.width}px, below the smallest generated width (${WIDTHS[0]}px). Refusing to upscale.`);
  }

  const sourceDir = path.join(SOURCE_ROOT, slug);
  const outputDir = path.join(PUBLIC_ROOT, slug);
  const copiedSourcePath = path.join(sourceDir, `${imageName}${sourceExt}`);
  const outputPaths = generatedWidths.map(width => path.join(outputDir, `${imageName}-${width}.webp`));

  await assertWillNotOverwrite([copiedSourcePath, ...outputPaths]);
  await fs.mkdir(sourceDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
  await fs.copyFile(sourcePath, copiedSourcePath);

  for (const width of generatedWidths) {
    await writeWebpCandidate({
      sourcePath,
      width,
      quality: QUALITY,
      outputPath: path.join(outputDir, `${imageName}-${width}.webp`),
    });
  }

  console.log(`Copied source: ${path.relative(ROOT, copiedSourcePath)}`);
  console.log('Generated WebP files:');
  for (const outputPath of outputPaths) {
    console.log(`- ${path.relative(ROOT, outputPath)}`);
  }

  printSnippet(slug, imageName, generatedWidths);
}

main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
});
