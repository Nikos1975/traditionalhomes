const API_ROOT = "https://www.googleapis.com/webmasters/v3";

function failure(status) {
  if (status === 401 || status === 403) return new Error("Search Console permission blocked.");
  if (status === 429) return new Error("Search Console quota blocked.");
  return new Error("Search Console request failed.");
}

export class SearchConsoleTransport {
  constructor({ fetch: fetchImpl = globalThis.fetch } = {}) {
    if (typeof fetchImpl !== "function") throw new Error("Search Console transport requires fetch.");
    this.fetch = fetchImpl;
  }

  async request(url, accessToken, options = {}) {
    const response = await this.fetch(url, {
      ...options,
      headers: { Authorization: `Bearer ${accessToken}`, ...(options.headers ?? {}) },
    });
    if (!response.ok) throw failure(response.status);
    try { return await response.json(); } catch { throw new Error("Search Console response was malformed."); }
  }

  listSites(accessToken) {
    return this.request(`${API_ROOT}/sites`, accessToken);
  }

  querySearchAnalytics(accessToken, request) {
    const { property, ...body } = request;
    return this.request(`${API_ROOT}/sites/${encodeURIComponent(property)}/searchAnalytics/query`, accessToken, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }
}
