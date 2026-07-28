import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import sharp from "sharp";

import { approvePlatform } from "../scripts/social/approval.mjs";
import { loadPublishedArticle } from "../scripts/social/article.mjs";
import { runSocialCli } from "../scripts/social/cli.mjs";
import { createFixtureDrafts } from "../scripts/social/generators/fixture.mjs";
import { fingerprintArticle } from "../scripts/social/fingerprint.mjs";
import {
  createPreparedLedger,
  isPlatformStale,
  readLedger,
  writeLedger,
} from "../scripts/social/publication-ledger.mjs";

const SITE_URL = "https://traditional-homes.gr";

async function createRoot({ slug = "published-article", draft = false, image = "/images/blog/hero.jpg", body = "A calm first paragraph for readers." } = {}) {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "social-publisher-"));
  const blogDir = path.join(rootDir, "src", "content", "blog");
  await mkdir(blogDir, { recursive: true });
  await writeFile(
    path.join(blogDir, `${slug}.md`),
    `---\ntitle: "Published Article"\ndescription: "A clear article description."\npubDate: 2026-07-27\ndraft: ${draft}\nimage: "${image}"\nimageAlt: "A quiet view"\n---\n\n${body}\n\nA second paragraph.\n`,
  );
  if (image.startsWith("/")) {
    const imagePath = path.join(rootDir, "public", image);
    await mkdir(path.dirname(imagePath), { recursive: true });
    await sharp({ create: { width: 1080, height: 1350, channels: 3, background: "#dddddd" } }).jpeg().toFile(imagePath);
  }
  return rootDir;
}

test("extracts all required metadata from one published article", async () => {
  const rootDir = await createRoot();
  const article = await loadPublishedArticle({ rootDir, slug: "published-article", siteUrl: SITE_URL });

  assert.deepEqual(article, {
    slug: "published-article",
    title: "Published Article",
    description: "A clear article description.",
    canonicalUrl: "https://traditional-homes.gr/en/blog/published-article/",
    heroImageUrl: "https://traditional-homes.gr/images/blog/hero.jpg",
    heroImageAlt: "A quiet view",
    excerpt: "A calm first paragraph for readers.",
    publicationDate: "2026-07-27",
  });
});

test("derives a readable excerpt from Markdown body content", async () => {
  const rootDir = await createRoot({ body: "Read [the guide](https://example.test/guide) before you travel." });
  const article = await loadPublishedArticle({ rootDir, slug: "published-article", siteUrl: SITE_URL });
  assert.equal(article.excerpt, "Read the guide before you travel.");
});

test("rejects draft and missing articles", async () => {
  const rootDir = await createRoot({ draft: true });
  await assert.rejects(
    loadPublishedArticle({ rootDir, slug: "published-article", siteUrl: SITE_URL }),
    /published articles only/i,
  );
  await assert.rejects(
    loadPublishedArticle({ rootDir, slug: "missing-article", siteUrl: SITE_URL }),
    /not found/i,
  );
});

test("rejects non-HTTPS canonical and hero URLs", async () => {
  const rootDir = await createRoot();
  await assert.rejects(
    loadPublishedArticle({ rootDir, slug: "published-article", siteUrl: "http://traditional-homes.gr" }),
    /HTTPS canonical URL/i,
  );
  const insecureRoot = await createRoot({ image: "http://example.test/hero.webp" });
  await assert.rejects(
    loadPublishedArticle({ rootDir: insecureRoot, slug: "published-article", siteUrl: SITE_URL }),
    /HTTPS hero image URL/i,
  );
});

test("creates deterministic fixture drafts with only platform-relevant fields", async () => {
  const rootDir = await createRoot();
  const article = await loadPublishedArticle({ rootDir, slug: "published-article", siteUrl: SITE_URL });
  const drafts = createFixtureDrafts(article);

  assert.deepEqual(Object.keys(drafts), ["facebook", "instagram", "threads", "linkedin", "bluesky"]);
  assert.deepEqual(Object.keys(drafts.facebook).sort(), ["text", "url"]);
  assert.deepEqual(Object.keys(drafts.instagram).sort(), ["altText", "caption", "imageUrl"]);
  assert.equal(drafts.facebook.url, article.canonicalUrl);
  assert.equal(drafts.instagram.imageUrl, article.heroImageUrl);
  assert.equal(createFixtureDrafts(article).bluesky.text, drafts.bluesky.text);
});

test("fingerprints are stable and change when article content changes", async () => {
  const rootDir = await createRoot();
  const first = await loadPublishedArticle({ rootDir, slug: "published-article", siteUrl: SITE_URL });
  const same = await loadPublishedArticle({ rootDir, slug: "published-article", siteUrl: SITE_URL });
  const changedRoot = await createRoot({ body: "A changed first paragraph for readers." });
  const changed = await loadPublishedArticle({ rootDir: changedRoot, slug: "published-article", siteUrl: SITE_URL });

  assert.equal(fingerprintArticle(first), fingerprintArticle(same));
  assert.notEqual(fingerprintArticle(first), fingerprintArticle(changed));
});

test("creates a non-secret prepared ledger without publishing or network access", async () => {
  const rootDir = await createRoot();
  const article = await loadPublishedArticle({ rootDir, slug: "published-article", siteUrl: SITE_URL });
  const fingerprint = fingerprintArticle(article);
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => { throw new Error("network access is forbidden"); };
  try {
    const ledger = createPreparedLedger({ article, fingerprint, drafts: createFixtureDrafts(article), now: new Date("2026-07-28T10:00:00.000Z") });
    await writeLedger({ rootDir, ledger });
    const stored = await readLedger({ rootDir, slug: article.slug });
    assert.equal(stored.platforms.facebook.state, "prepared");
    assert.equal(stored.articleUrl, article.canonicalUrl);
    assert.equal(stored.platforms.facebook.publishedAt, null);
    assert.equal(stored.platforms.facebook.platformPostId, null);
    assert.deepEqual(stored.platforms.facebook.attempts, []);
    assert.doesNotMatch(JSON.stringify(stored), /token|secret|authorization|oauth|header/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("requires explicit single-platform approval and preserves other platforms", async () => {
  const rootDir = await createRoot();
  const article = await loadPublishedArticle({ rootDir, slug: "published-article", siteUrl: SITE_URL });
  const fingerprint = fingerprintArticle(article);
  const ledger = createPreparedLedger({ article, fingerprint, drafts: createFixtureDrafts(article), now: new Date("2026-07-28T10:00:00.000Z") });

  assert.throws(() => approvePlatform({ ledger, platform: "facebook", currentFingerprint: fingerprint, confirmed: false }), /confirmation/i);
  const approved = approvePlatform({ ledger, platform: "facebook", currentFingerprint: fingerprint, confirmed: true, now: new Date("2026-07-28T10:01:00.000Z") });
  assert.equal(approved.platforms.facebook.state, "approved");
  assert.equal(approved.platforms.facebook.approvedAt, "2026-07-28T10:01:00.000Z");
  assert.equal(approved.platforms.instagram.state, "prepared");
  assert.throws(() => approvePlatform({ ledger, platform: "unknown", currentFingerprint: fingerprint, confirmed: true }), /unknown platform/i);
});

test("rejects stale approval, secrets, and terminal published records", async () => {
  const rootDir = await createRoot();
  const article = await loadPublishedArticle({ rootDir, slug: "published-article", siteUrl: SITE_URL });
  const fingerprint = fingerprintArticle(article);
  const ledger = createPreparedLedger({ article, fingerprint, drafts: createFixtureDrafts(article), now: new Date("2026-07-28T10:00:00.000Z") });

  assert.throws(() => approvePlatform({ ledger, platform: "facebook", currentFingerprint: "changed", confirmed: true }), /stale/i);
  assert.throws(() => createPreparedLedger({ article, fingerprint, drafts: { facebook: { text: "x", url: article.canonicalUrl, accessToken: "no" } } }), /sensitive/i);
  ledger.platforms.facebook.state = "published";
  ledger.platforms.facebook.platformPostId = "123";
  assert.throws(() => approvePlatform({ ledger, platform: "facebook", currentFingerprint: fingerprint, confirmed: true }), /terminal/i);
});

test("allows approval only from the prepared state", async () => {
  const rootDir = await createRoot();
  const article = await loadPublishedArticle({ rootDir, slug: "published-article", siteUrl: SITE_URL });
  const ledger = createPreparedLedger({ article, fingerprint: fingerprintArticle(article), drafts: createFixtureDrafts(article) });
  ledger.platforms.facebook.state = "failed";
  assert.throws(() => approvePlatform({ ledger, platform: "facebook", currentFingerprint: ledger.articleFingerprint, confirmed: true }), /prepared state/i);
});

test("does not create publication files outside the requested ledger path", async () => {
  const rootDir = await createRoot();
  const article = await loadPublishedArticle({ rootDir, slug: "published-article", siteUrl: SITE_URL });
  const ledger = createPreparedLedger({ article, fingerprint: fingerprintArticle(article), drafts: createFixtureDrafts(article) });
  await writeLedger({ rootDir, ledger });
  const stored = JSON.parse(await readFile(path.join(rootDir, "data", "social-publications", "published-article.json"), "utf8"));
  assert.equal(stored.slug, "published-article");
});

test("prepare preserves an approved platform record while refreshing other prepared drafts", async () => {
  const rootDir = await createRoot();
  const prepared = await runSocialCli({ command: "prepare", argv: ["--slug", "published-article"], rootDir });
  const approved = approvePlatform({
    ledger: prepared,
    platform: "facebook",
    currentFingerprint: prepared.articleFingerprint,
    confirmed: true,
    now: new Date("2026-07-28T10:01:00.000Z"),
  });
  approved.platforms.facebook.attempts = [{ at: "2026-07-28T10:01:01.000Z", result: "approved" }];
  await writeLedger({ rootDir, ledger: approved });

  const refreshed = await runSocialCli({ command: "prepare", argv: ["--slug", "published-article"], rootDir });

  assert.deepEqual(refreshed.platforms.facebook, approved.platforms.facebook);
  assert.equal(refreshed.platforms.instagram.state, "prepared");
  assert.equal(refreshed.platforms.instagram.articleFingerprint, refreshed.articleFingerprint);
});

test("prepare creates only a missing platform record without replacing existing records", async () => {
  const rootDir = await createRoot();
  const prepared = await runSocialCli({ command: "prepare", argv: ["--slug", "published-article"], rootDir });
  const missingLinkedin = { ...prepared, platforms: { ...prepared.platforms } };
  delete missingLinkedin.platforms.linkedin;
  await writeLedger({ rootDir, ledger: missingLinkedin });

  const refreshed = await runSocialCli({ command: "prepare", argv: ["--slug", "published-article"], rootDir });

  assert.deepEqual(refreshed.platforms.facebook, prepared.platforms.facebook);
  assert.equal(refreshed.platforms.linkedin.state, "prepared");
  assert.equal(refreshed.platforms.linkedin.articleFingerprint, refreshed.articleFingerprint);
});

test("a published platform is immutable without blocking another platform update", async () => {
  const rootDir = await createRoot();
  const article = await loadPublishedArticle({ rootDir, slug: "published-article", siteUrl: SITE_URL });
  const fingerprint = fingerprintArticle(article);
  const ledger = createPreparedLedger({ article, fingerprint, drafts: createFixtureDrafts(article) });
  await writeLedger({ rootDir, ledger });
  const publishedFacebook = {
    ...ledger,
    platforms: {
      ...ledger.platforms,
      facebook: {
        ...ledger.platforms.facebook,
        state: "published",
        publishedAt: "2026-07-28T10:02:00.000Z",
        platformPostId: "123",
      },
    },
  };
  await writeLedger({ rootDir, ledger: publishedFacebook });
  const updated = approvePlatform({
    ledger: publishedFacebook,
    platform: "instagram",
    currentFingerprint: fingerprint,
    confirmed: true,
    now: new Date("2026-07-28T10:03:00.000Z"),
  });
  await writeLedger({ rootDir, ledger: updated });

  assert.deepEqual(updated.platforms.facebook, publishedFacebook.platforms.facebook);
  assert.equal(updated.platforms.instagram.state, "approved");
  const mutatedFacebook = {
    ...updated,
    platforms: { ...updated.platforms, facebook: { ...updated.platforms.facebook, platformPostId: "456" } },
  };
  await assert.rejects(writeLedger({ rootDir, ledger: mutatedFacebook }), /published .* platform record is terminal/i);
});

test("changed article content preserves prior approved and published platform fingerprints as stale", async () => {
  const rootDir = await createRoot();
  const first = await runSocialCli({ command: "prepare", argv: ["--slug", "published-article"], rootDir });
  const approved = approvePlatform({
    ledger: first,
    platform: "facebook",
    currentFingerprint: first.articleFingerprint,
    confirmed: true,
  });
  const preserved = {
    ...approved,
    platforms: {
      ...approved.platforms,
      instagram: { ...approved.platforms.instagram, state: "published", publishedAt: "2026-07-28T10:04:00.000Z", platformPostId: "456" },
    },
  };
  await writeLedger({ rootDir, ledger: preserved });
  const articlePath = path.join(rootDir, "src", "content", "blog", "published-article.md");
  const source = await readFile(articlePath, "utf8");
  await writeFile(articlePath, source.replace("A calm first paragraph for readers.", "A changed first paragraph for readers."));

  const refreshed = await runSocialCli({ command: "prepare", argv: ["--slug", "published-article"], rootDir });

  assert.equal(refreshed.articleFingerprint === first.articleFingerprint, false);
  assert.deepEqual(refreshed.platforms.facebook, preserved.platforms.facebook);
  assert.deepEqual(refreshed.platforms.instagram, preserved.platforms.instagram);
  assert.equal(isPlatformStale(refreshed.platforms.facebook, refreshed.articleFingerprint), true);
  assert.equal(isPlatformStale(refreshed.platforms.instagram, refreshed.articleFingerprint), true);
  const status = await runSocialCli({ command: "status", argv: ["--slug", "published-article"], rootDir });
  assert.equal(status.platforms.facebook.stale, true);
  assert.equal(status.platforms.instagram.stale, true);
});
