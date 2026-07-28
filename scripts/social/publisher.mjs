import { assertLedger } from "./publication-ledger.mjs";
import { verifyDeployedInstagramDerivative } from "./media.mjs";
import { createMetaClient } from "./meta-client.mjs";

const LIVE_PLATFORMS = new Set(["facebook", "instagram"]);
const sensitive = /(?:token|secret|authorization|header|oauth|password|credential)/i;

export function redactSensitive(value) {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(redactSensitive);
  return Object.fromEntries(Object.entries(value).flatMap(([key, child]) => sensitive.test(key) ? [] : [[key, redactSensitive(child)]]));
}

function configured(env, name, pattern) {
  const value = env[name];
  if (!pattern.test(value ?? "")) throw new Error(`${name} must be explicitly configured.`);
  return value;
}

function liveConfig(env) {
  if (env.SOCIAL_LIVE_PUBLISHING !== "true") throw new Error("SOCIAL_LIVE_PUBLISHING=true is required.");
  return {
    graphVersion: configured(env, "META_GRAPH_VERSION", /^v\d+\.\d+$/),
    pageId: configured(env, "META_PAGE_ID", /^\d+$/),
    instagramUserId: configured(env, "META_IG_USER_ID", /^\d+$/),
    pageToken: configured(env, "META_PAGE_ACCESS_TOKEN", /.+/),
    instagramToken: configured(env, "META_IG_ACCESS_TOKEN", /.+/),
  };
}

async function verifyPublicUrl(fetchImpl, url) {
  const response = await fetchImpl(url, { method: "GET" });
  if (!response.ok) throw new Error(`Public resource verification failed: ${url}.`);
}

function clone(ledger) {
  return structuredClone(ledger);
}

function nextAttempt(record, outcome, now) {
  return [...record.attempts, { at: now.toISOString(), outcome }];
}

async function persistTransition({ ledger, platform, state, targetId, changes = {}, persist }) {
  const next = clone(ledger);
  next.platforms[platform] = { ...next.platforms[platform], ...changes, targetId, state };
  await persist(next);
  return next;
}

async function pollContainer({ client, containerId, sleep, maxPolls = 3 }) {
  for (let attempt = 0; attempt < maxPolls; attempt += 1) {
    try {
      const result = await client.getInstagramContainer({ containerId });
      if (result.status_code === "FINISHED" || result.status_code === "ERROR" || result.status_code === "EXPIRED") return result.status_code;
    } catch (error) {
      if (attempt === maxPolls - 1) throw error;
    }
    await sleep((attempt + 1) * 100);
  }
  return "TIMEOUT";
}

export async function publishPlatform({ ledger, platform, currentFingerprint, env, confirmLive, fetchImpl, persist, sleep = async () => {}, now = new Date() }) {
  assertLedger(ledger);
  if (!LIVE_PLATFORMS.has(platform)) throw new Error(`Live publishing is not implemented for ${platform}.`);
  if (confirmLive !== true) throw new Error("--confirm-live is required.");
  const record = ledger.platforms[platform];
  if (!record) throw new Error(`Prepared platform draft not found: ${platform}.`);
  if ((record.articleFingerprint ?? ledger.articleFingerprint) !== currentFingerprint) throw new Error("Approved social draft is stale.");
  if (record.state !== "approved") throw new Error(`${platform} must be approved before live publishing.`);
  if (typeof ledger.articleUrl !== "string" || !ledger.articleUrl.startsWith("https://")) throw new Error("Ledger has invalid article URL.");
  const config = liveConfig(env);
  const targetId = platform === "facebook" ? config.pageId : config.instagramUserId;
  if (record.targetId && record.targetId !== targetId) throw new Error("Configured target ID does not match the approved ledger target ID.");
  await verifyPublicUrl(fetchImpl, ledger.articleUrl);
  if (platform === "instagram") {
    try {
      await verifyDeployedInstagramDerivative({ fetchImpl, derivative: ledger.media?.instagram ?? {} });
    } catch {
      return persistTransition({ ledger, platform, state: "failed", targetId, persist, changes: { attempts: nextAttempt(record, "deployment-validation-failed", now) } });
    }
  } else {
    await verifyPublicUrl(fetchImpl, ledger.media?.facebook?.imageUrl);
  }
  const client = createMetaClient({ fetchImpl, graphVersion: config.graphVersion, pageToken: config.pageToken, instagramToken: config.instagramToken });
  let working = await persistTransition({ ledger, platform, state: "publishing", targetId, persist });
  try {
    if (platform === "facebook") {
      const remote = await client.publishFacebook({ pageId: targetId, text: working.platforms.facebook.draft.text, url: working.platforms.facebook.draft.url });
      if (!remote.id) throw new Error("Facebook did not return a post ID.");
      return persistTransition({ ledger: working, platform, state: "published", targetId, persist, changes: { platformPostId: remote.id, publishedAt: now.toISOString(), attempts: nextAttempt(working.platforms.facebook, "published", now) } });
    }
    const container = await client.createInstagramContainer({ userId: targetId, imageUrl: working.media.instagram.imageUrl, caption: working.platforms.instagram.draft.caption });
    if (!container.id) throw new Error("Instagram did not return a container ID.");
    working = await persistTransition({ ledger: working, platform, state: "publishing", targetId, persist, changes: { containerId: container.id, attempts: nextAttempt(working.platforms.instagram, "container-created", now) } });
    const status = await pollContainer({ client, containerId: container.id, sleep });
    if (status !== "FINISHED") return persistTransition({ ledger: working, platform, state: "failed", targetId, persist, changes: { attempts: nextAttempt(working.platforms.instagram, `container-${status.toLowerCase()}`, now) } });
    try {
      const remote = await client.publishInstagramMedia({ userId: targetId, containerId: container.id });
      if (!remote.id) throw new Error("Instagram did not return a media ID.");
      return persistTransition({ ledger: working, platform, state: "published", targetId, persist, changes: { platformPostId: remote.id, publishedAt: now.toISOString(), attempts: nextAttempt(working.platforms.instagram, "published", now) } });
    } catch (error) {
      if (error.kind === "http") return persistTransition({ ledger: working, platform, state: "failed", targetId, persist, changes: { attempts: nextAttempt(working.platforms.instagram, "publish-rejected", now) } });
      return persistTransition({ ledger: working, platform, state: "unknown", targetId, persist, changes: { attempts: nextAttempt(working.platforms.instagram, "publish-unknown", now) } });
    }
  } catch (error) {
    if (error.kind === "http") return persistTransition({ ledger: working, platform, state: "failed", targetId, persist, changes: { attempts: nextAttempt(working.platforms[platform], "rejected", now) } });
    return persistTransition({ ledger: working, platform, state: "unknown", targetId, persist, changes: { attempts: nextAttempt(working.platforms[platform], "unknown", now) } });
  }
}
