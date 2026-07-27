import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { promisify } from 'node:util';
import { after, describe, it } from 'node:test';

const execFileAsync = promisify(execFile);

describe('Generated browser booking script', async () => {
  const temporaryDirectory = await mkdtemp(join(process.cwd(), 'traditional-homes-browser-script-'));
  const configPath = join(temporaryDirectory, 'astro.config.mjs');
  const cachePath = join(temporaryDirectory, 'cache');
  const outputPath = join(temporaryDirectory, 'dist');
  const scriptPath = join(temporaryDirectory, 'booking-script.mjs');
  const projectConfig = new URL('../astro.config.mjs', import.meta.url).href;

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

  it('emits valid JavaScript for the booking, analytics, and chat behaviour', async () => {
    const html = await readFile(join(outputPath, 'en/index.html'), 'utf8');
    const scripts = [...html.matchAll(/<script[^>]*>(?<script>[\s\S]*?)<\/script>/g)]
      .map((match) => match.groups?.script);
    const script = scripts.find((candidate) => candidate?.includes('[data-mobile-booking-bar]'));

    assert.ok(script, 'expected the booking browser script in /en/');
    assert.doesNotMatch(script, /\s+as\s+Window\b/);
    assert.doesNotMatch(script, /querySelector\s*</);
    assert.doesNotMatch(script, /\bHTML(?:Form|Input)Element\b/);
    assert.doesNotMatch(script, /dataLayer\s*\?:/);
    assert.match(script, /\[data-mobile-booking-bar\]/);
    assert.match(script, /\[data-booking-handoff\]/);
    assert.match(script, /addEventListener\('submit'/);
    assert.match(script, /select_item/);
    assert.match(script, /dataLayer/);
    assert.match(script, /chat-trigger/);

    await writeFile(scriptPath, script);
    await execFileAsync(process.execPath, ['--check', scriptPath]);
  });
});
