import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { tmpdir } from 'node:os';
import { promisify } from 'node:util';
import vm from 'node:vm';
import { after, describe, it } from 'node:test';

const execFileAsync = promisify(execFile);

class FakeElement {
  constructor(id = '') {
    this.id = id;
    this.dataset = {};
    this.attributes = new Map();
    this.listeners = new Map();
    this.innerHTML = '';
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type) {
    for (const listener of this.listeners.get(type) ?? []) listener({ type });
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  querySelector() {
    return null;
  }
}

class FakeButton extends FakeElement {}

function createBrowserHarness(script) {
  const trigger = new FakeButton('chat-trigger');
  const mobileBookingBar = new FakeElement('mobile-booking-bar');
  const checkin = new FakeElement();
  const room = new FakeElement();
  const elements = new Map([[trigger.id, trigger]]);
  const documentListeners = new Map();
  const timeouts = [];

  mobileBookingBar.querySelector = (selector) => {
    if (selector === '[data-mobile-checkin]') return checkin;
    if (selector === '[data-mobile-room]') return room;
    return null;
  };

  const document = {
    body: {
      appendChild(element) {
        elements.set(element.id, element);
        element.remove = () => elements.delete(element.id);
      },
    },
    getElementById(id) {
      return elements.get(id) ?? null;
    },
    createElement() {
      return new FakeElement();
    },
    addEventListener(type, listener) {
      const listeners = documentListeners.get(type) ?? [];
      listeners.push(listener);
      documentListeners.set(type, listeners);
    },
    dispatch(type) {
      for (const listener of documentListeners.get(type) ?? []) listener({ type });
    },
    querySelector(selector) {
      if (selector === '[data-mobile-booking-bar]') return mobileBookingBar;
      return null;
    },
    querySelectorAll() {
      return [];
    },
  };

  vm.runInNewContext(script, {
    document,
    window: {},
    HTMLButtonElement: FakeButton,
    setTimeout(callback) {
      timeouts.push(callback);
      return timeouts.length;
    },
    Date,
  });

  return { trigger, mobileBookingBar, checkin, document, elements, room, timeouts };
}

describe('Generated chat popup script', async () => {
  const temporaryDirectory = await mkdtemp(join(process.cwd(), 'traditional-homes-chat-script-'));
  const configPath = join(temporaryDirectory, 'astro.config.mjs');
  const cachePath = join(temporaryDirectory, 'cache');
  const outputPath = join(temporaryDirectory, 'dist');
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

  it('initializes chat immediately and remains idempotent after astro:page-load', async () => {
    const html = await readFile(join(outputPath, 'en/index.html'), 'utf8');
    const script = [...html.matchAll(/<script[^>]*>(?<script>[\s\S]*?)<\/script>/g)]
      .map((match) => match.groups?.script)
      .find((candidate) => candidate?.includes('chat-trigger'));
    assert.ok(script, 'expected the chat browser script in /en/');

    const harness = createBrowserHarness(script);
    assert.equal(harness.trigger.dataset.initialized, 'true');
    assert.equal(harness.trigger.listeners.get('click')?.length, 1);

    harness.document.dispatch('astro:page-load');
    assert.equal(harness.trigger.listeners.get('click')?.length, 1);
  });

  it('shows one localized popup, restores aria-expanded after dismissal, and leaves booking initialized', async () => {
    const html = await readFile(join(outputPath, 'en/index.html'), 'utf8');
    const script = [...html.matchAll(/<script[^>]*>(?<script>[\s\S]*?)<\/script>/g)]
      .map((match) => match.groups?.script)
      .find((candidate) => candidate?.includes('chat-trigger'));
    assert.ok(script, 'expected the chat browser script in /en/');

    const harness = createBrowserHarness(script);
    harness.trigger.dispatch('click');
    const popup = harness.elements.get('chat-widget');

    assert.ok(popup, 'expected a chat popup after clicking the trigger');
    assert.match(popup.innerHTML, /mailto:/);
    assert.match(popup.innerHTML, /For booking enquiries/);
    assert.equal(harness.trigger.getAttribute('aria-expanded'), 'true');

    harness.trigger.dispatch('click');
    assert.equal(harness.elements.get('chat-widget'), popup);
    assert.equal(harness.timeouts.length, 1);

    harness.timeouts[0]();
    assert.equal(harness.elements.get('chat-widget'), undefined);
    assert.equal(harness.trigger.getAttribute('aria-expanded'), 'false');

    harness.trigger.dispatch('click');
    assert.ok(harness.elements.get('chat-widget'));
    assert.equal(harness.mobileBookingBar.listeners.get('submit')?.length, 1);
    assert.match(harness.checkin.min, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(harness.room.disabled, true);
  });
});
