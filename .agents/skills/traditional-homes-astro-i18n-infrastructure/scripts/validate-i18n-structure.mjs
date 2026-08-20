#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../');
const failures = [];

const mustExist = [
  'src/i18n/config.ts',
  'src/i18n/route-map.ts',
  'src/i18n/seo.ts',
  'public/llms.txt',
  'public/robots.txt',
];

for (const relative of mustExist) {
  if (!fs.existsSync(path.join(repoRoot, relative))) failures.push(`missing required file: ${relative}`);
}

const pagesRoot = path.join(repoRoot, 'src/pages');
if (fs.existsSync(pagesRoot)) {
  const stack = [pagesRoot];
  while (stack.length) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        failures.push(`instruction/content markdown must not live under src/pages: ${path.relative(repoRoot, full)}`);
      }
    }
  }
}

for (const locale of ['de', 'fr', 'ru', 'zh', 'ar', 'he']) {
  const perLocaleLlms = path.join(repoRoot, 'public', `llms-${locale}.txt`);
  if (fs.existsSync(perLocaleLlms)) failures.push(`unexpected per-locale llms file: public/llms-${locale}.txt`);
}

if (failures.length) {
  console.error('I18N structural validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('I18N structural validation passed.');
