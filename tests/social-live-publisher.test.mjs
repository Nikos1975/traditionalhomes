import assert from "node:assert/strict";
import { mkdtemp, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { publishPlatform, redactSensitive } from "../scripts/social/publisher.mjs";
import { reconcilePlatform } from "../scripts/social/reconcile.mjs";
import { validateInstagramMedia } from "../scripts/social/media.mjs";
import { createFixtureDrafts } from "../scripts/social/generators/fixture.mjs";
import { createPreparedLedger, writeLedger } from "../scripts/social/publication-ledger.mjs";

const article = {
  slug: "published-article",
  title: "Published Article",
  description: "A clear article description.",
  canonicalUrl: "https://traditional-homes.gr/en/blog/published-article/",
  heroImageUrl: "https://traditional-homes.gr/images/blog/hero.webp",
  heroImageAlt: "A quiet view",
  excerpt: "A calm first paragraph.",
  publicationDate: "2026-07-27",
};
const fingerprint = "a".repeat(64);
const env = {
  SOCIAL_LIVE_PUBLISHING: "true",
  META_GRAPH_VERSION: "v23.0",
  META_PAGE_ID: "123456",
  META_IG_USER_ID: "654321",
  META_PAGE_ACCESS_TOKEN: "page-secret",
  META_IG_ACCESS_TOKEN: "ig-secret",
};

function response(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

function approvedLedger() {
  const ledger = createPreparedLedger({ article, fingerprint, drafts: createFixtureDrafts(article) });
  ledger.media = {
    sourceHero: { url: article.heroImageUrl },
    facebook: { imageUrl: article.heroImageUrl },
    instagram: {
      imageUrl: "https://traditional-homes.gr/images/social/published-article-instagram.jpg",
      contentType: "image/jpeg",
      bytes: 2_000_000,
      width: 1080,
      height: 1350,
    },
  };
  ledger.platforms.facebook.state = "approved";
  ledger.platforms.instagram.state = "approved";
  return ledger;
}

function successfulPublicUrls(url, options) {
  if (options.method === "GET" && url.startsWith("https://traditional-homes.gr/")) return response({});
  return null;
}

test("publishes a Facebook Page post after atomically recording publishing", async () => {
  const writes = [];
  const result = await publishPlatform({
    ledger: approvedLedger(), platform: "facebook", currentFingerprint: fingerprint, env, confirmLive: true,
    persist: async (ledger) => writes.push(structuredClone(ledger)),
    fetchImpl: async (url, options) => successfulPublicUrls(url, options) ?? response({ id: "123456_789" }),
  });
  assert.equal(writes[0].platforms.facebook.state, "publishing");
  assert.equal(result.platforms.facebook.state, "published");
  assert.equal(result.platforms.facebook.platformPostId, "123456_789");
  assert.equal(result.platforms.instagram.state, "approved");
});

test("publishes Instagram through container, bounded polling, and media publish", async () => {
  const calls = [];
  const result = await publishPlatform({
    ledger: approvedLedger(), platform: "instagram", currentFingerprint: fingerprint, env, confirmLive: true,
    persist: async () => {}, sleep: async () => {},
    fetchImpl: async (url, options) => {
      calls.push({ url, method: options.method });
      if (options.method === "GET" && url.startsWith("https://traditional-homes.gr/")) return response({});
      if (url.endsWith("/654321/media") && options.method === "POST") return response({ id: "container-1" });
      if (url.includes("/container-1?") && options.method === "GET") return response({ status_code: "FINISHED" });
      if (url.endsWith("/654321/media_publish") && options.method === "POST") return response({ id: "ig-media-1" });
      throw new Error(`Unexpected request: ${options.method} ${url}`);
    },
  });
  assert.equal(result.platforms.instagram.state, "published");
  assert.equal(result.platforms.instagram.containerId, "container-1");
  assert.equal(result.platforms.instagram.platformPostId, "ig-media-1");
  assert.equal(calls.filter((call) => call.method === "POST").length, 2);
});

test("fails closed for invalid Instagram WebP and aspect-ratio media", () => {
  assert.throws(() => validateInstagramMedia({ imageUrl: "https://example.test/image.webp", contentType: "image/webp", bytes: 1, width: 1080, height: 1350 }), /JPEG/i);
  assert.throws(() => validateInstagramMedia({ imageUrl: "https://example.test/image.jpg", contentType: "image/jpeg", bytes: 1, width: 2000, height: 500 }), /aspect ratio/i);
});

test("rejects changed fingerprints, wrong targets, and missing live confirmation", async () => {
  await assert.rejects(() => publishPlatform({ ledger: approvedLedger(), platform: "facebook", currentFingerprint: "b".repeat(64), env, confirmLive: true, persist: async () => {}, fetchImpl: successfulPublicUrls }), /stale/i);
  const wrongTarget = approvedLedger();
  wrongTarget.platforms.facebook.targetId = "999";
  await assert.rejects(() => publishPlatform({ ledger: wrongTarget, platform: "facebook", currentFingerprint: fingerprint, env, confirmLive: true, persist: async () => {}, fetchImpl: successfulPublicUrls }), /target ID/i);
  await assert.rejects(() => publishPlatform({ ledger: approvedLedger(), platform: "facebook", currentFingerprint: fingerprint, env, confirmLive: false, persist: async () => {}, fetchImpl: successfulPublicUrls }), /confirm-live/i);
});

test("records an ambiguous Facebook POST as unknown without retrying it", async () => {
  let posts = 0;
  const result = await publishPlatform({
    ledger: approvedLedger(), platform: "facebook", currentFingerprint: fingerprint, env, confirmLive: true, persist: async () => {},
    fetchImpl: async (_url, options) => {
      if (options.method === "GET") return response({});
      posts += 1;
      throw new TypeError("network timeout");
    },
  });
  assert.equal(result.platforms.facebook.state, "unknown");
  assert.equal(posts, 1);
});

test("reconciles a confirmed remote Facebook publication without creating a post", async () => {
  const ledger = approvedLedger();
  ledger.platforms.facebook = { ...ledger.platforms.facebook, state: "unknown", targetId: env.META_PAGE_ID, platformPostId: "123456_789" };
  let posts = 0;
  const result = await reconcilePlatform({
    ledger, platform: "facebook", env, persist: async () => {},
    fetchImpl: async (url, options) => {
      assert.equal(options.method, "GET");
      assert.match(url, /123456_789/);
      posts += 1;
      return response({ id: "123456_789", created_time: "2026-07-28T10:00:00+0000" });
    },
  });
  assert.equal(posts, 1);
  assert.equal(result.platforms.facebook.state, "published");
});

test("redacts credentials and writes ledgers atomically", async () => {
  assert.deepEqual(redactSensitive({ access_token: "secret", headers: { Authorization: "Bearer secret" }, id: "safe" }), { id: "safe" });
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "social-atomic-"));
  const ledger = approvedLedger();
  await writeLedger({ rootDir, ledger });
  const entries = await readdir(path.join(rootDir, "data", "social-publications"));
  assert.deepEqual(entries, ["published-article.json"]);
});
