import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { validateBlogArticle } from '../scripts/validate-blog-article.mjs';

async function createFixture(article) {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), 'blog-validator-'));
  const blogDir = path.join(rootDir, 'src', 'content', 'blog');
  await mkdir(blogDir, { recursive: true });
  await mkdir(path.join(rootDir, 'src', 'pages', 'blog'), { recursive: true });
  await writeFile(path.join(rootDir, 'src', 'pages', 'blog', 'index.astro'), '');
  const articlePath = path.join(blogDir, 'test-history.md');
  await writeFile(articlePath, article);
  return { rootDir, articlePath };
}

const validHistoricalArticle = `---
title: "A Documented History"
description: "A concise description."
pubDate: 2026-07-22
draft: true
category: "History"
region: "Lasithi, Eastern Crete"
tags:
  - history
---

The documented account links back to the [blog index](/blog/).

## Sources and Image Credits

- [Institutional source](https://example.org/source).
`;

test('accepts a schema-valid historical draft without an image', async () => {
  const fixture = await createFixture(validHistoricalArticle);
  const result = await validateBlogArticle(fixture);
  assert.deepEqual(result.errors, []);
});

test('rejects unknown frontmatter fields and a non-boolean draft value', async () => {
  const fixture = await createFixture(
    validHistoricalArticle
      .replace('draft: true', 'draft: "true"')
      .replace('category: "History"', 'category: "History"\nseoKeyword: "monastery"'),
  );
  const result = await validateBlogArticle(fixture);
  assert.match(result.errors.join('\n'), /Unknown frontmatter field: seoKeyword/);
  assert.match(result.errors.join('\n'), /draft must be true or false/);
});

test('requires a title and a real calendar date', async () => {
  const fixture = await createFixture(
    validHistoricalArticle.replace('title: "A Documented History"', 'title: ""').replace('2026-07-22', '2026-02-31'),
  );
  const result = await validateBlogArticle(fixture);
  assert.match(result.errors.join('\n'), /title is required/);
  assert.match(result.errors.join('\n'), /pubDate is required in YYYY-MM-DD format/);
});

test('requires an existing image and imageAlt whenever image is supplied', async () => {
  const fixture = await createFixture(
    validHistoricalArticle.replace(
      'draft: true',
      'draft: true\nimage: "/images/blog/test-history/hero-1600.webp"',
    ),
  );
  const result = await validateBlogArticle(fixture);
  assert.match(result.errors.join('\n'), /imageAlt is required when image is supplied/);
  assert.match(result.errors.join('\n'), /Image path does not exist/);
});

test('rejects placeholders, broken internal links, and historical posts without sources', async () => {
  const fixture = await createFixture(
    validHistoricalArticle
      .replace('[blog index](/blog/)', '[missing page](/en/missing-page/)')
      .replace('## Sources and Image Credits', '## Further Reading')
      .replace('The documented account', 'TODO: The documented account'),
  );
  const result = await validateBlogArticle(fixture);
  assert.match(result.errors.join('\n'), /Placeholder text found/);
  assert.match(result.errors.join('\n'), /Internal link does not resolve: \/en\/missing-page\//);
  assert.match(result.errors.join('\n'), /Historical articles require a Sources section/);
});
