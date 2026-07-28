import { assertLedger } from "./publication-ledger.mjs";
import { createMetaClient } from "./meta-client.mjs";

function config(env) {
  if (!/^v\d+\.\d+$/.test(env.META_GRAPH_VERSION ?? "")) throw new Error("META_GRAPH_VERSION must be explicitly configured.");
  return env;
}

export async function reconcilePlatform({ ledger, platform, env, fetchImpl, persist, now = new Date() }) {
  assertLedger(ledger);
  if (!["facebook", "instagram"].includes(platform)) throw new Error(`Reconciliation is not implemented for ${platform}.`);
  const record = ledger.platforms[platform];
  if (!["unknown", "publishing"].includes(record.state)) throw new Error(`${platform} is not awaiting reconciliation.`);
  if (!record.platformPostId) throw new Error(`${platform} has no remote post ID to reconcile.`);
  const values = config(env);
  const client = createMetaClient({ fetchImpl, graphVersion: values.META_GRAPH_VERSION, pageToken: values.META_PAGE_ACCESS_TOKEN, instagramToken: values.META_IG_ACCESS_TOKEN });
  const remote = platform === "facebook" ? await client.getFacebookPost({ postId: record.platformPostId }) : await client.getInstagramMedia({ mediaId: record.platformPostId });
  if (remote.id !== record.platformPostId) throw new Error(`${platform} reconciliation could not confirm the remote publication.`);
  const next = structuredClone(ledger);
  next.platforms[platform] = { ...record, state: "published", publishedAt: record.publishedAt ?? now.toISOString() };
  await persist(next);
  return next;
}
