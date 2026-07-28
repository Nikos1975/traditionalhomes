export const PLATFORMS = ["facebook", "instagram", "threads", "linkedin", "bluesky"];
const sensitiveKey = /(?:token|secret|password|authorization|header|oauth|credential)/i;

export function assertNoSensitiveFields(value) {
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (sensitiveKey.test(key)) throw new Error(`Sensitive field is not allowed: ${key}.`);
    assertNoSensitiveFields(child);
  }
}

function assertExactKeys(value, keys, platform) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new Error(`${platform} draft contains unsupported fields.`);
  }
}

function assertHttps(value, field) {
  if (typeof value !== "string" || !value.startsWith("https://")) throw new Error(`${field} must be an HTTPS URL.`);
}

export function assertDrafts(drafts) {
  assertNoSensitiveFields(drafts);
  assertExactKeys(drafts, PLATFORMS, "social");
  assertExactKeys(drafts.facebook, ["text", "url"], "facebook");
  assertExactKeys(drafts.instagram, ["caption", "imageUrl", "altText"], "instagram");
  assertExactKeys(drafts.threads, ["text", "url"], "threads");
  assertExactKeys(drafts.linkedin, ["commentary", "url"], "linkedin");
  assertExactKeys(drafts.bluesky, ["text", "card"], "bluesky");
  assertExactKeys(drafts.bluesky.card, ["url", "title", "description", "imageUrl"], "bluesky card");
  for (const value of [drafts.facebook.url, drafts.instagram.imageUrl, drafts.threads.url, drafts.linkedin.url, drafts.bluesky.card.url, drafts.bluesky.card.imageUrl]) assertHttps(value, "draft URL");
}
