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

export function assertPlatformDraft(platform, draft) {
  assertNoSensitiveFields(draft);
  if (platform === "facebook") {
    assertExactKeys(draft, ["text", "url"], platform);
    return assertHttps(draft.url, "draft URL");
  }
  if (platform === "instagram") {
    assertExactKeys(draft, ["caption", "imageUrl", "altText"], platform);
    return assertHttps(draft.imageUrl, "draft URL");
  }
  if (platform === "threads") {
    assertExactKeys(draft, ["text", "url"], platform);
    return assertHttps(draft.url, "draft URL");
  }
  if (platform === "linkedin") {
    assertExactKeys(draft, ["commentary", "url"], platform);
    return assertHttps(draft.url, "draft URL");
  }
  if (platform === "bluesky") {
    assertExactKeys(draft, ["text", "card"], platform);
    assertExactKeys(draft.card, ["url", "title", "description", "imageUrl"], "bluesky card");
    assertHttps(draft.card.url, "draft URL");
    return assertHttps(draft.card.imageUrl, "draft URL");
  }
  throw new Error(`Unknown platform: ${platform}.`);
}

export function assertDrafts(drafts) {
  assertNoSensitiveFields(drafts);
  assertExactKeys(drafts, PLATFORMS, "social");
  for (const platform of PLATFORMS) assertPlatformDraft(platform, drafts[platform]);
}
