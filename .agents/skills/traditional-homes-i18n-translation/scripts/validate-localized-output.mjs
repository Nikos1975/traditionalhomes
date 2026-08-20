#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../');
const args = process.argv.slice(2);
const localeIndex = args.indexOf('--locale');
const locale = localeIndex >= 0 ? args[localeIndex + 1] : null;

if (!locale || !/^[a-z]{2}$/.test(locale)) {
  console.error('Usage: node validate-localized-output.mjs --locale <two-letter-locale>');
  process.exit(2);
}

const localeDir = path.join(repoRoot, 'dist', locale);
if (!fs.existsSync(localeDir)) {
  console.error(`Localized output directory does not exist: dist/${locale}. Run the build first.`);
  process.exit(1);
}

const htmlFiles = [];
const stack = [localeDir];
while (stack.length) {
  const dir = stack.pop();
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) stack.push(full);
    else if (entry.isFile() && entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}

const failures = [];
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes(`<html lang="${locale}"`) && !html.includes(`<html lang='${locale}'`)) {
    failures.push(`${path.relative(repoRoot, file)} does not render lang="${locale}"`);
  }

  const relative = path.relative(path.join(repoRoot, 'dist'), file).split(path.sep).join('/');
  const route = relative === `${locale}/index.html`
    ? `/${locale}/`
    : `/${relative.replace(/index\.html$/, '')}`;
  const canonical = `https://traditional-homes.gr${route}`;
  if (!html.includes(`rel="canonical"`) || !html.includes(`href="${canonical}"`)) {
    failures.push(`${path.relative(repoRoot, file)} does not expose the expected self-canonical ${canonical}`);
  }
}

if (failures.length) {
  console.error('Localized output validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

// German currently has a stronger generated-output regression gate. Reuse it
// rather than duplicating its allow-list and parity logic in this helper.
if (locale === 'de') {
  const germanTest = path.join(repoRoot, 'tests/i18n-german-visible-language.test.mjs');
  if (fs.existsSync(germanTest)) {
    const result = spawnSync(process.execPath, ['--test', germanTest], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
}

console.log(`Localized output validation passed for ${locale}: ${htmlFiles.length} generated HTML file(s) checked.`);
