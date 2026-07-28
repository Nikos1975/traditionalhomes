import { PLATFORMS } from "./draft-schema.mjs";
import { assertLedger } from "./publication-ledger.mjs";

export function approvePlatform({ ledger, platform, currentFingerprint, confirmed, now = new Date() }) {
  assertLedger(ledger);
  if (!PLATFORMS.includes(platform)) throw new Error(`Unknown platform: ${platform}.`);
  const record = ledger.platforms[platform];
  if (!record) throw new Error(`Prepared platform draft not found: ${platform}.`);
  const platformFingerprint = record.articleFingerprint ?? ledger.articleFingerprint;
  if (platformFingerprint !== currentFingerprint) throw new Error("Prepared social draft is stale; prepare it again before approval.");
  if (confirmed !== true) throw new Error("Explicit confirmation via --confirm is required.");
  if (record.state === "published") throw new Error("Published platform record is terminal.");
  if (record.state !== "prepared") throw new Error(`${platform} must be in the prepared state before approval.`);
  return {
    ...ledger,
    platforms: {
      ...ledger.platforms,
      [platform]: { ...record, state: "approved", approvedAt: now.toISOString() },
    },
  };
}
