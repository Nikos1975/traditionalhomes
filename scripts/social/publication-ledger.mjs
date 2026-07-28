import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";

import { assertDrafts, assertNoSensitiveFields, assertPlatformDraft, PLATFORMS } from "./draft-schema.mjs";

const STATES = new Set(["prepared", "approved", "publishing", "published", "failed", "unknown"]);

function platformRecord(draft, articleFingerprint) {
  return {
    draft, articleFingerprint, state: "prepared", targetId: null, containerId: null,
    approvedAt: null, publishedAt: null, platformPostId: null, attempts: [],
  };
}

function hasSafePreparedState(record) {
  return record.state === "prepared"
    && record.approvedAt === null
    && record.publishedAt === null
    && record.platformPostId === null
    && record.attempts.length === 0;
}

function preparedPlatformRecord({ existingRecord, draft, articleFingerprint, legacyFingerprint }) {
  if (!existingRecord) return platformRecord(draft, articleFingerprint);
  const recordFingerprint = existingRecord.articleFingerprint ?? legacyFingerprint;
  if (!hasSafePreparedState(existingRecord)) {
    return { ...existingRecord, articleFingerprint: recordFingerprint };
  }
  return { ...existingRecord, draft, articleFingerprint };
}

function recordsMatch(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function allowsLegacyFingerprintAddition(existingRecord, nextRecord, legacyFingerprint) {
  if (existingRecord.articleFingerprint || nextRecord.articleFingerprint !== legacyFingerprint) return false;
  const { articleFingerprint: _ignored, ...withoutFingerprint } = nextRecord;
  return recordsMatch(existingRecord, withoutFingerprint);
}

function ledgerPath(rootDir, slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? "")) throw new Error("slug must be lowercase kebab-case.");
  return path.join(rootDir, "data", "social-publications", `${slug}.json`);
}

export function assertLedger(ledger) {
  assertNoSensitiveFields(ledger);
  if (!ledger?.slug || !/^[0-9a-f]{64}$/.test(ledger.articleFingerprint ?? "")) throw new Error("Ledger has invalid article identity.");
  if (ledger.articleUrl != null && (typeof ledger.articleUrl !== "string" || !ledger.articleUrl.startsWith("https://"))) throw new Error("Ledger has invalid article URL.");
  if (!ledger.platforms || typeof ledger.platforms !== "object") throw new Error("Ledger has invalid platform records.");
  for (const platform of Object.keys(ledger.platforms)) {
    if (!PLATFORMS.includes(platform)) throw new Error(`Ledger has unknown ${platform} platform.`);
  }
  for (const platform of PLATFORMS) {
    const record = ledger.platforms[platform];
    if (!record) continue;
    assertPlatformDraft(platform, record.draft);
    if (!STATES.has(record.state)) throw new Error(`Ledger has invalid ${platform} state.`);
    if (!Array.isArray(record.attempts)) throw new Error(`Ledger has invalid ${platform} attempts.`);
    if (record.articleFingerprint != null && !/^[0-9a-f]{64}$/.test(record.articleFingerprint)) throw new Error(`Ledger has invalid ${platform} fingerprint.`);
    if (record.targetId != null && !/^\d+$/.test(record.targetId)) throw new Error(`Ledger has invalid ${platform} target ID.`);
  }
}

export function isPlatformStale(record, currentFingerprint) {
  return (record.articleFingerprint ?? currentFingerprint) !== currentFingerprint;
}

export function createPreparedLedger({ article, fingerprint, drafts, existingLedger, now = new Date() }) {
  assertDrafts(drafts);
  if (existingLedger) {
    assertLedger(existingLedger);
    if (existingLedger.slug !== article.slug) throw new Error("Prepared ledger article slug does not match.");
  }
  const ledger = {
    ...existingLedger,
    schemaVersion: 1,
    slug: article.slug,
    articleUrl: article.canonicalUrl,
    articleFingerprint: fingerprint,
    preparedAt: now.toISOString(),
    media: existingLedger?.media ?? { sourceHero: { url: article.heroImageUrl }, facebook: { imageUrl: article.heroImageUrl }, instagram: null },
    platforms: Object.fromEntries(PLATFORMS.map((platform) => [platform, preparedPlatformRecord({
      existingRecord: existingLedger?.platforms[platform],
      draft: drafts[platform],
      articleFingerprint: fingerprint,
      legacyFingerprint: existingLedger?.articleFingerprint,
    })])),
  };
  assertLedger(ledger);
  return ledger;
}

export async function readLedger({ rootDir, slug }) {
  const filePath = ledgerPath(rootDir, slug);
  try {
    await stat(filePath);
  } catch {
    throw new Error(`Prepared social record not found: ${slug}.`);
  }
  const ledger = JSON.parse(await readFile(filePath, "utf8"));
  assertLedger(ledger);
  return ledger;
}

export async function writeLedger({ rootDir, ledger }) {
  assertLedger(ledger);
  const filePath = ledgerPath(rootDir, ledger.slug);
  try {
    const existing = await readLedger({ rootDir, slug: ledger.slug });
    for (const platform of PLATFORMS) {
      const existingRecord = existing.platforms[platform];
      const nextRecord = ledger.platforms[platform];
      if (existingRecord?.state === "published"
        && !recordsMatch(existingRecord, nextRecord)
        && !allowsLegacyFingerprintAddition(existingRecord, nextRecord, existing.articleFingerprint)) {
        throw new Error(`Published ${platform} platform record is terminal and cannot be replaced.`);
      }
    }
  } catch (error) {
    if (!/Prepared social record not found/.test(error.message)) throw error;
  }
  await mkdir(path.dirname(filePath), { recursive: true });
  const temporaryPath = `${filePath}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, `${JSON.stringify(ledger, null, 2)}\n`, { flag: "wx" });
  await rename(temporaryPath, filePath);
}
