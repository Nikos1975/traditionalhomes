import { PLATFORMS } from "./draft-schema.mjs";
import { assertLedger } from "./publication-ledger.mjs";

export function approvePlatform({ ledger, platform, currentFingerprint, confirmed, now = new Date() }) {
  assertLedger(ledger);
  if (!PLATFORMS.includes(platform)) throw new Error(`Unknown platform: ${platform}.`);
  if (ledger.articleFingerprint !== currentFingerprint) throw new Error("Prepared social draft is stale; prepare it again before approval.");
  if (confirmed !== true) throw new Error("Explicit confirmation via --confirm is required.");
  if (ledger.platforms[platform].state === "published") throw new Error("Published platform record is terminal.");
  return {
    ...ledger,
    platforms: {
      ...ledger.platforms,
      [platform]: { ...ledger.platforms[platform], state: "approved", approvedAt: now.toISOString() },
    },
  };
}
