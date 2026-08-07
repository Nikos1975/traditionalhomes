import { normalizeSearchAnalyticsResponse } from "./gsc-api-normalize.mjs";

export const MAX_SEARCH_ANALYTICS_BATCHES = 100;

export async function fetchSearchAnalyticsPages({ transport, accessToken, request, maxBatches = MAX_SEARCH_ANALYTICS_BATCHES }) {
  const records = [];
  for (let batch = 0; batch < maxBatches; batch += 1) {
    const response = await transport.querySearchAnalytics(accessToken, { ...request, startRow: batch * request.rowLimit });
    const page = normalizeSearchAnalyticsResponse({ response, property: request.property, dimensions: request.dimensions });
    records.push(...page);
    if (page.length < request.rowLimit) return { records: records.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))), truncated: false, batches: batch + 1 };
  }
  return { records: records.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))), truncated: true, batches: maxBatches };
}
