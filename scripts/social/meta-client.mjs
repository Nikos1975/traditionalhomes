function sanitize(value) {
  return String(value ?? "Meta request failed.")
    .replace(/(?:access_)?token=[^\s&]+/gi, "[redacted]")
    .replace(/Bearer\s+[^\s]+/gi, "Bearer [redacted]")
    .slice(0, 240);
}

async function responseText(response) {
  if (typeof response.text === "function") return response.text();
  if (typeof response.json === "function") return JSON.stringify(await response.json());
  return "";
}

function parseJson(text) {
  try { return text ? JSON.parse(text) : null; } catch { return null; }
}

function responseError(response, payload, operation) {
  const meta = payload?.error ?? payload ?? {};
  const error = new Error(sanitize(meta.message ?? `Meta request failed with HTTP ${response.status}.`));
  error.name = "MetaHttpError";
  error.kind = "http";
  error.operation = operation;
  error.status = response.status;
  error.metaCode = Number.isInteger(meta.code) ? meta.code : undefined;
  error.metaSubcode = Number.isInteger(meta.error_subcode) ? meta.error_subcode : undefined;
  error.retryable = response.status === 429 || response.status >= 500;
  return error;
}

function successError(operation) {
  const error = new Error("Meta returned an invalid success response.");
  error.name = "MetaProtocolError";
  error.kind = "protocol";
  error.operation = operation;
  return error;
}

export function createMetaClient({ fetchImpl, graphVersion, pageToken, instagramToken }) {
  if (typeof fetchImpl !== "function") throw new Error("A fetch implementation is required.");
  const endpoint = (target) => `https://graph.facebook.com/${graphVersion}/${target}`;
  async function request({ method, target, fields = {}, token, operation }) {
    const params = new URLSearchParams({ ...fields, access_token: token });
    const url = method === "GET" ? `${endpoint(target)}?${params}` : endpoint(target);
    const response = await fetchImpl(url, method === "GET" ? { method } : { method, headers: { "content-type": "application/x-www-form-urlencoded" }, body: params });
    const payload = parseJson(await responseText(response));
    if (!response.ok) throw responseError(response, payload, operation);
    if (!payload || typeof payload !== "object") throw successError(operation);
    return payload;
  }
  return {
    publishFacebook: ({ pageId, text, url }) => request({ method: "POST", target: `${pageId}/feed`, fields: { message: text, link: url }, token: pageToken, operation: "facebook.publish" }),
    createInstagramContainer: ({ userId, imageUrl, caption }) => request({ method: "POST", target: `${userId}/media`, fields: { image_url: imageUrl, caption }, token: instagramToken, operation: "instagram.container" }),
    getInstagramContainer: ({ containerId }) => request({ method: "GET", target: containerId, fields: { fields: "status_code" }, token: instagramToken, operation: "instagram.containerStatus" }),
    publishInstagramMedia: ({ userId, containerId }) => request({ method: "POST", target: `${userId}/media_publish`, fields: { creation_id: containerId }, token: instagramToken, operation: "instagram.publish" }),
    getFacebookPost: ({ postId }) => request({ method: "GET", target: postId, fields: { fields: "id,created_time,from" }, token: pageToken, operation: "facebook.reconcile" }),
    getInstagramMedia: ({ mediaId }) => request({ method: "GET", target: mediaId, fields: { fields: "id,owner,username,permalink" }, token: instagramToken, operation: "instagram.reconcile" }),
  };
}
