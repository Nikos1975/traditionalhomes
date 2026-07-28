#!/usr/bin/env node

import path from "node:path";
import { pathToFileURL } from "node:url";

import { approvePlatform } from "./approval.mjs";
import { loadPublishedArticle } from "./article.mjs";
import { createManualDrafts } from "./generators/manual.mjs";
import { fingerprintArticle } from "./fingerprint.mjs";
import { generateInstagramDerivative, resolvePublicSourcePath } from "./media.mjs";
import { publishPlatform } from "./publisher.mjs";
import { createPreparedLedger, isPlatformStale, readLedger, writeLedger } from "./publication-ledger.mjs";
import { reconcilePlatform } from "./reconcile.mjs";

function parseArgs(argv) {
  const args = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (!key.startsWith("--")) continue;
    const name = key.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) args[name] = true;
    else { args[name] = value; index += 1; }
  }
  return args;
}

export async function runSocialCli({ command, argv, rootDir = process.cwd() }) {
  const args = parseArgs(argv);
  if (!args.slug) throw new Error("Usage requires --slug <slug>.");
  if (command === "status") {
    const ledger = await readLedger({ rootDir, slug: args.slug });
    return {
      ...ledger,
      platforms: Object.fromEntries(Object.entries(ledger.platforms).map(([platform, record]) => [platform, {
        ...record,
        stale: isPlatformStale(record, ledger.articleFingerprint),
      }])),
    };
  }
  const article = await loadPublishedArticle({ rootDir, slug: args.slug });
  const fingerprint = fingerprintArticle(article);
  if (command === "prepare") {
    let existingLedger;
    try {
      existingLedger = await readLedger({ rootDir, slug: args.slug });
    } catch (error) {
      if (!/Prepared social record not found/.test(error.message)) throw error;
    }
    const sourceUrl = new URL(article.heroImageUrl);
    if (sourceUrl.origin !== new URL(article.canonicalUrl).origin) throw new Error("Instagram derivative source must belong to the public website.");
    const instagram = await generateInstagramDerivative({
      rootDir, slug: article.slug, sourcePath: resolvePublicSourcePath({ rootDir, pathname: sourceUrl.pathname }),
      siteUrl: sourceUrl.origin, articleFingerprint: fingerprint,
    });
    const ledger = createPreparedLedger({ article, fingerprint, drafts: createManualDrafts(article), existingLedger });
    ledger.media = {
      sourceHero: { url: article.heroImageUrl },
      facebook: { imageUrl: article.heroImageUrl },
      instagram,
    };
    await writeLedger({ rootDir, ledger });
    return ledger;
  }
  if (command === "approve") {
    if (!args.platform) throw new Error("Approval requires --platform <platform>.");
    const ledger = await readLedger({ rootDir, slug: args.slug });
    console.log(JSON.stringify(ledger.platforms[args.platform]?.draft ?? null, null, 2));
    const approved = approvePlatform({ ledger, platform: args.platform, currentFingerprint: fingerprint, confirmed: args.confirm === true });
    await writeLedger({ rootDir, ledger: approved });
    return approved;
  }
  if (command === "publish") {
    if (!args.platform) throw new Error("Live publishing requires --platform facebook or instagram.");
    const ledger = await readLedger({ rootDir, slug: args.slug });
    return publishPlatform({
      ledger, platform: args.platform, currentFingerprint: fingerprint, env: process.env,
      confirmLive: args["confirm-live"] === true, fetchImpl: globalThis.fetch,
      persist: (nextLedger) => writeLedger({ rootDir, ledger: nextLedger }),
    });
  }
  if (command === "reconcile") {
    if (!args.platform) throw new Error("Reconciliation requires --platform facebook or instagram.");
    const ledger = await readLedger({ rootDir, slug: args.slug });
    return reconcilePlatform({
      ledger, platform: args.platform, env: process.env, fetchImpl: globalThis.fetch,
      remoteId: args["remote-id"], confirmed: args.confirm === true,
      persist: (nextLedger) => writeLedger({ rootDir, ledger: nextLedger }),
    });
  }
  throw new Error(`Unknown social command: ${command}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [command, ...argv] = process.argv.slice(2);
  runSocialCli({ command, argv })
    .then((result) => console.log(JSON.stringify(result, null, 2)))
    .catch((error) => { console.error(`BLOCKED: ${error.message}`); process.exitCode = 1; });
}
