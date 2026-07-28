function responseError(response, body) {
  const error = new Error(`Meta request failed with HTTP ${response.status}.`);
  error.kind = "http";
  error.status = response.status;
  error.body = body;
  return error;
}

export function createMetaClient({ fetchImpl, graphVersion, pageToken, instagramToken }) {
  if (typeof fetchImpl !== "function") throw new Error("A fetch implementation is required.");
  const endpoint = (target) => `https://graph.facebook.com/${graphVersion}/${target}`;
  async function request({ method, target, fields = {}, token }) {
    const params = new URLSearchParams({ ...fields, access_token: token });
    const url = method === "GET" ? `${endpoint(target)}?${params}` : endpoint(target);
    const response = await fetchImpl(url, method === "GET" ? { method } : { method, headers: { "content-type": "application/x-www-form-urlencoded" }, body: params });
    const body = await response.json();
    if (!response.ok) throw responseError(response, body);
    return body;
  }
  return {
    publishFacebook: ({ pageId, text, url }) => request({ method: "POST", target: `${pageId}/feed`, fields: { message: text, link: url }, token: pageToken }),
    createInstagramContainer: ({ userId, imageUrl, caption }) => request({ method: "POST", target: `${userId}/media`, fields: { image_url: imageUrl, caption }, token: instagramToken }),
    getInstagramContainer: ({ containerId }) => request({ method: "GET", target: containerId, fields: { fields: "status_code" }, token: instagramToken }),
    publishInstagramMedia: ({ userId, containerId }) => request({ method: "POST", target: `${userId}/media_publish`, fields: { creation_id: containerId }, token: instagramToken }),
    getFacebookPost: ({ postId }) => request({ method: "GET", target: postId, fields: { fields: "id,created_time" }, token: pageToken }),
    getInstagramMedia: ({ mediaId }) => request({ method: "GET", target: mediaId, fields: { fields: "id,timestamp" }, token: instagramToken }),
  };
}
