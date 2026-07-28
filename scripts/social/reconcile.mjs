import { assertLedger } from "./publication-ledger.mjs";
import { createMetaClient } from "./meta-client.mjs";

function config(env) {
  if (!/^v\d+\.\d+$/.test(env.META_GRAPH_VERSION ?? "")) throw new Error("META_GRAPH_VERSION must be explicitly configured.");
  if (!/^\d+$/.test(env.META_PAGE_ID ?? "") || !/^\d+$/.test(env.META_IG_USER_ID ?? "")) throw new Error("Configured Meta target IDs must be numeric.");
  if (!env.META_PAGE_ACCESS_TOKEN || !env.META_IG_ACCESS_TOKEN) throw new Error("Meta reconciliation tokens must be configured.");
  return env;
}

export async function reconcilePlatform({ ledger, platform, env, fetchImpl, persist, remoteId, confirmed = false, now = new Date() }) {
  assertLedger(ledger);
  if (!["facebook", "instagram"].includes(platform)) throw new Error(`Reconciliation is not implemented for ${platform}.`);
  const record = ledger.platforms[platform];
  if (!["unknown", "publishing"].includes(record.state)) throw new Error(`${platform} is not awaiting reconciliation.`);
  if (remoteId && confirmed !== true) throw new Error("Reconciliation with --remote-id requires --confirm.");
  const remotePostId = remoteId ?? record.platformPostId;
  if (!remotePostId) return ledger;
  const values = config(env);
  const client = createMetaClient({ fetchImpl, graphVersion: values.META_GRAPH_VERSION, pageToken: values.META_PAGE_ACCESS_TOKEN, instagramToken: values.META_IG_ACCESS_TOKEN });
  const remote = platform === "facebook" ? await client.getFacebookPost({ postId: remotePostId }) : await client.getInstagramMedia({ mediaId: remotePostId });
  if (remote.id !== remotePostId) throw new Error(`${platform} reconciliation could not confirm the remote publication.`);
  if (platform === "facebook" && remote.from?.id && remote.from.id !== values.META_PAGE_ID) throw new Error("Facebook remote post does not belong to the configured Page.");
  const next = structuredClone(ledger);
  next.platforms[platform] = { ...record, platformPostId: remotePostId, state: "published", publishedAt: record.publishedAt ?? now.toISOString() };
  await persist(next);
  return next;
}
