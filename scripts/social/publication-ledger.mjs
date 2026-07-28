import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import { assertDrafts, assertNoSensitiveFields, PLATFORMS } from "./draft-schema.mjs";

const STATES = new Set(["prepared", "approved", "publishing", "published", "failed", "unknown"]);

function platformRecord(draft) {
  return { draft, state: "prepared", approvedAt: null, publishedAt: null, platformPostId: null, attempts: [] };
}

function ledgerPath(rootDir, slug) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? "")) throw new Error("slug must be lowercase kebab-case.");
  return path.join(rootDir, "data", "social-publications", `${slug}.json`);
}

export function assertLedger(ledger) {
  assertNoSensitiveFields(ledger);
  if (!ledger?.slug || !/^[0-9a-f]{64}$/.test(ledger.articleFingerprint ?? "")) throw new Error("Ledger has invalid article identity.");
  const drafts = Object.fromEntries(PLATFORMS.map((platform) => [platform, ledger.platforms?.[platform]?.draft]));
  assertDrafts(drafts);
  for (const platform of PLATFORMS) {
    const record = ledger.platforms[platform];
    if (!STATES.has(record.state)) throw new Error(`Ledger has invalid ${platform} state.`);
    if (!Array.isArray(record.attempts)) throw new Error(`Ledger has invalid ${platform} attempts.`);
  }
}

export function createPreparedLedger({ article, fingerprint, drafts, now = new Date() }) {
  assertDrafts(drafts);
  const ledger = {
    schemaVersion: 1,
    slug: article.slug,
    articleFingerprint: fingerprint,
    preparedAt: now.toISOString(),
    platforms: Object.fromEntries(PLATFORMS.map((platform) => [platform, platformRecord(drafts[platform])])),
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
    if (PLATFORMS.some((platform) => existing.platforms[platform].state === "published")) {
      throw new Error("Published platform records are terminal and cannot be replaced.");
    }
  } catch (error) {
    if (!/Prepared social record not found/.test(error.message)) throw error;
  }
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(ledger, null, 2)}\n`);
}
