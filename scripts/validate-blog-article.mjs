import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const PERMITTED_FIELDS = new Set([
  'title',
  'description',
  'pubDate',
  'author',
  'draft',
  'subtitle',
  'category',
  'region',
  'tags',
  'image',
  'imageAlt',
  'imageCaption',
  'imageCredit',
  'imageCreditUrl',
]);

function scalarValue(value = '') {
  const trimmed = value.trim();
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function isCalendarDate(value) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;
  const [, year, month, day] = match.map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return { body: source, fields: new Map(), errors: ['Missing YAML frontmatter block.'] };
  }

  const fields = new Map();
  const errors = [];
  for (const line of match[1].split(/\r?\n/)) {
    if (!line || /^\s/.test(line)) continue;
    const field = line.match(/^([A-Za-z][A-Za-z0-9]*):(?:\s*(.*))?$/);
    if (!field) continue;
    const [, key, value = ''] = field;
    if (fields.has(key)) errors.push(`Duplicate frontmatter field: ${key}`);
    fields.set(key, value);
  }

  return { body: source.slice(match[0].length), fields, errors };
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function internalPathExists(rootDir, href) {
  let pathname;
  try {
    pathname = decodeURIComponent(href.split(/[?#]/, 1)[0]);
  } catch {
    return false;
  }

  if (!pathname.startsWith('/') || pathname.includes('..')) return false;
  const route = pathname.replace(/^\/+|\/+$/g, '');
  const pageBase = path.join(rootDir, 'src', 'pages', ...route.split('/').filter(Boolean));
  const pageCandidates = route
    ? [`${pageBase}.astro`, path.join(pageBase, 'index.astro')]
    : [path.join(rootDir, 'src', 'pages', 'index.astro')];

  for (const candidate of pageCandidates) {
    if (await exists(candidate)) return true;
  }

  const blogMatch = route.match(/^blog\/([^/]+)$/i);
  if (!blogMatch) return false;
  const blogDir = path.join(rootDir, 'src', 'content', 'blog');
  const expected = `${blogMatch[1]}.md`.toLowerCase();
  const entries = await readdir(blogDir);
  return entries.some(entry => entry.toLowerCase() === expected);
}

export async function validateBlogArticle({ rootDir, articlePath }) {
  const source = await readFile(articlePath, 'utf8');
  const parsed = parseFrontmatter(source);
  const errors = [...parsed.errors];
  const { fields } = parsed;

  for (const key of fields.keys()) {
    if (!PERMITTED_FIELDS.has(key)) errors.push(`Unknown frontmatter field: ${key}`);
  }

  if (!scalarValue(fields.get('title'))) errors.push('title is required.');

  const pubDate = scalarValue(fields.get('pubDate'));
  if (!isCalendarDate(pubDate)) {
    errors.push('pubDate is required in YYYY-MM-DD format.');
  }

  if (fields.has('draft') && !['true', 'false'].includes((fields.get('draft') ?? '').trim())) {
    errors.push('draft must be true or false.');
  }

  const image = scalarValue(fields.get('image'));
  if (image) {
    if (!scalarValue(fields.get('imageAlt'))) {
      errors.push('imageAlt is required when image is supplied.');
    }
    const imagePath = image.startsWith('/')
      ? path.join(rootDir, 'public', ...image.replace(/^\/+/, '').split('/'))
      : null;
    if (!imagePath || !(await exists(imagePath))) {
      errors.push(`Image path does not exist: ${image}`);
    }
  }

  const placeholder = source.match(/\b(?:TODO|TBD|lorem ipsum)\b|\[(?:placeholder|needs confirmation)\]/i);
  if (placeholder) errors.push(`Placeholder text found: ${placeholder[0]}`);

  const internalLinks = [...parsed.body.matchAll(/(?<!!)\[[^\]]+\]\((\/[^)\s]+)\)/g)].map(match => match[1]);
  for (const href of new Set(internalLinks)) {
    if (!(await internalPathExists(rootDir, href))) {
      errors.push(`Internal link does not resolve: ${href}`);
    }
  }

  if (
    scalarValue(fields.get('category')).toLowerCase() === 'history' &&
    !/^## Sources(?: and Image Credits)?\s*$/im.test(parsed.body)
  ) {
    errors.push('Historical articles require a Sources section.');
  }

  return { errors };
}

async function runCli() {
  const articlePaths = process.argv.slice(2);
  if (articlePaths.length === 0) {
    console.error('Usage: npm run blog:validate -- src/content/blog/<article>.md');
    process.exitCode = 1;
    return;
  }

  let failed = false;
  for (const requestedPath of articlePaths) {
    const articlePath = path.resolve(requestedPath);
    const result = await validateBlogArticle({ rootDir: process.cwd(), articlePath });
    if (result.errors.length === 0) {
      console.log(`PASS ${path.relative(process.cwd(), articlePath)}`);
      continue;
    }
    failed = true;
    console.error(`FAIL ${path.relative(process.cwd(), articlePath)}`);
    for (const error of result.errors) console.error(`- ${error}`);
  }
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  await runCli();
}
