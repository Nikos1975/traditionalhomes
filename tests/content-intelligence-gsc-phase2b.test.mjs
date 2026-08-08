import assert from "node:assert/strict";
import test from "node:test";
import { LocalUserAdcAuthProvider } from "../scripts/content-intelligence/gsc-auth.mjs";
import { SearchConsoleTransport } from "../scripts/content-intelligence/gsc-transport.mjs";
import { normalizeProperties, normalizeSearchAnalyticsResponse } from "../scripts/content-intelligence/gsc-api-normalize.mjs";
import { fetchSearchAnalyticsPages } from "../scripts/content-intelligence/gsc-acquire.mjs";
import { buildApiDataset, persistDataset } from "../scripts/content-intelligence/gsc-dataset.mjs";
import { runContentCli } from "../scripts/content-intelligence/cli.mjs";
import { analyzeSearchConsole } from "../scripts/content-intelligence/gsc-analysis.mjs";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

test("local ADC auth requests only the Search Console readonly scope", async () => {
  const provider = new LocalUserAdcAuthProvider({
    createAuthClient: async ({ scopes }) => {
      assert.deepEqual(scopes, ["https://www.googleapis.com/auth/webmasters.readonly"]);
      return { credentials: { type: "authorized_user" }, getAccessToken: async () => "secret-token" };
    },
  });
  assert.equal(await provider.getAccessToken(), "secret-token");
});

test("local ADC auth preserves library request metadata including its quota project", async () => {
  const provider = new LocalUserAdcAuthProvider({
    createAuthClient: async () => ({
      credentials: { type: "authorized_user" },
      getRequestHeaders: async () => ({ Authorization: "Bearer secret-token", "x-goog-user-project": "quota-from-auth-library" }),
    }),
  });
  assert.deepEqual(await provider.getRequestHeaders(), { Authorization: "Bearer secret-token", "x-goog-user-project": "quota-from-auth-library" });
});

test("local ADC auth redacts credential values from failures", async () => {
  const provider = new LocalUserAdcAuthProvider({
    createAuthClient: async () => { throw new Error("refresh_token=secret-token"); },
  });
  await assert.rejects(provider.getAccessToken(), (error) => {
    assert.match(error.message, /^Authentication blocked:/);
    assert.doesNotMatch(error.message, /secret-token|refresh_token/);
    return true;
  });
});

test("local ADC auth blocks GOOGLE_APPLICATION_CREDENTIALS for request metadata", async () => {
  const previous = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  process.env.GOOGLE_APPLICATION_CREDENTIALS = "blocked-credential-path";
  try {
    await assert.rejects(new LocalUserAdcAuthProvider().getRequestHeaders(), /local user Application Default Credentials are required/);
  } finally {
    if (previous === undefined) delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    else process.env.GOOGLE_APPLICATION_CREDENTIALS = previous;
  }
});

test("Search Console transport forwards library auth and quota headers and encodes property paths", async () => {
  const calls = [];
  const transport = new SearchConsoleTransport({ fetch: async (url, options) => {
    calls.push({ url, options });
    return new Response(JSON.stringify({ siteEntry: [{ siteUrl: "sc-domain:example.com", permissionLevel: "siteOwner" }] }), { status: 200 });
  } });
  const authHeaders = { Authorization: "Bearer secret-token", "x-goog-user-project": "quota-from-auth-library" };
  const sites = await transport.listSites(authHeaders);
  assert.equal(sites.siteEntry[0].siteUrl, "sc-domain:example.com");
  assert.equal(calls[0].options.headers.Authorization, "Bearer secret-token");
  assert.equal(calls[0].options.headers["x-goog-user-project"], "quota-from-auth-library");
  await transport.querySearchAnalytics(authHeaders, { property: "sc-domain:example.com", startDate: "2026-01-01" });
  assert.match(calls[1].url, /sites\/sc-domain%3Aexample.com\/searchAnalytics\/query$/);
  assert.equal(calls[1].options.method, "POST");
  assert.equal(calls[1].options.headers.Authorization, "Bearer secret-token");
  assert.equal(calls[1].options.headers["x-goog-user-project"], "quota-from-auth-library");
});

test("local ADC auth does not parse credential files", async () => {
  const source = await readFile(new URL("../scripts/content-intelligence/gsc-auth.mjs", import.meta.url), "utf8");
  assert.doesNotMatch(source, /application_default_credentials\.json|readFile/);
});

test("Search Console transport maps HTTP failures without retrying", async () => {
  let calls = 0;
  const transport = new SearchConsoleTransport({ fetch: async () => { calls += 1; return new Response("no", { status: 429 }); } });
  await assert.rejects(transport.listSites("secret-token"), /quota blocked/);
  assert.equal(calls, 1);
});

for (const status of [401, 403]) test(`Search Console transport keeps ${status} permission failures blocked`, async () => {
  const transport = new SearchConsoleTransport({ fetch: async () => new Response("no", { status }) });
  await assert.rejects(transport.listSites({ Authorization: "Bearer secret-token" }), /permission blocked/);
});

test("property discovery keeps only valid URL-prefix and domain properties", () => {
  assert.deepEqual(normalizeProperties({ siteEntry: [
    { siteUrl: "sc-domain:example.com", permissionLevel: "siteOwner" },
    { siteUrl: "https://example.com/blog/", permissionLevel: "siteFullUser" },
  ] }), [
    { property: "https://example.com/blog/", permissionLevel: "siteFullUser" },
    { property: "sc-domain:example.com", permissionLevel: "siteOwner" },
  ]);
  assert.throws(() => normalizeProperties({ siteEntry: [{ siteUrl: "example.com", permissionLevel: "siteOwner" }] }), /invalid property/);
});

test("API normalizer maps ordered dimensions and rejects malformed rows", () => {
  const result = normalizeSearchAnalyticsResponse({
    response: { rows: [{ keys: ["beaches", "https://example.com/blog/"], clicks: 2, impressions: 10, ctr: 0.2, position: 4.5 }] },
    property: "sc-domain:example.com",
    dimensions: ["query", "page"],
  });
  assert.deepEqual(result, [{ query: "beaches", page: "https://example.com/blog/", clicks: 2, impressions: 10, ctr: 0.2, position: 4.5 }]);
  assert.throws(() => normalizeSearchAnalyticsResponse({ response: { rows: [{ keys: ["beaches"], clicks: 2, impressions: 10, ctr: 0.2, position: 4.5 }] }, property: "sc-domain:example.com", dimensions: ["query", "page"] }), /keys/);
});

test("API normalizer deduplicates records with deterministic weighted metrics", () => {
  const result = normalizeSearchAnalyticsResponse({ response: { rows: [
    { keys: ["beaches"], clicks: 1, impressions: 2, ctr: 0.5, position: 2 },
    { keys: ["beaches"], clicks: 2, impressions: 4, ctr: 0.5, position: 5 },
  ] }, property: "sc-domain:example.com", dimensions: ["query"] });
  assert.deepEqual(result, [{ query: "beaches", clicks: 3, impressions: 6, ctr: 0.5, position: 4 }]);
});

test("Search Analytics acquisition fetches one page and stops on a short response", async () => {
  const requests = [];
  const transport = { querySearchAnalytics: async (_token, request) => { requests.push(request); return { rows: [{ keys: ["one"], clicks: 1, impressions: 2, ctr: 0.5, position: 3 }] }; } };
  const result = await fetchSearchAnalyticsPages({ transport, accessToken: "token", request: { property: "sc-domain:example.com", dimensions: ["query"], rowLimit: 2 } });
  assert.equal(result.records.length, 1);
  assert.equal(result.truncated, false);
  assert.deepEqual(requests.map((item) => item.startRow), [0]);
});

test("Search Analytics acquisition advances startRow by the requested batch size", async () => {
  const requests = [];
  const transport = { querySearchAnalytics: async (_token, request) => { requests.push(request); return { rows: requests.length === 1 ? [{ keys: ["one"], clicks: 1, impressions: 2, ctr: 0.5, position: 3 }, { keys: ["two"], clicks: 1, impressions: 2, ctr: 0.5, position: 3 }] : [] }; } };
  const result = await fetchSearchAnalyticsPages({ transport, accessToken: "token", request: { property: "sc-domain:example.com", dimensions: ["query"], rowLimit: 2 } });
  assert.equal(result.records.length, 2);
  assert.deepEqual(requests.map((item) => item.startRow), [0, 2]);
});

test("Search Analytics acquisition marks a safety-capped result as truncated", async () => {
  const transport = { querySearchAnalytics: async () => ({ rows: [{ keys: ["one"], clicks: 1, impressions: 2, ctr: 0.5, position: 3 }] }) };
  const result = await fetchSearchAnalyticsPages({ transport, accessToken: "token", request: { property: "sc-domain:example.com", dimensions: ["query"], rowLimit: 1 }, maxBatches: 2 });
  assert.equal(result.truncated, true);
  assert.equal(result.records.length, 2);
});

test("API datasets are idempotent and retain truncation provenance", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "gsc-api-"));
  try {
    const input = { property: "sc-domain:example.com", startDate: "2026-01-01", endDate: "2026-03-31", dimensions: ["query"], rowLimit: 25000, records: [{ query: "beaches", clicks: 1, impressions: 2, ctr: 0.5, position: 3 }], truncated: true, batches: 100 };
    const first = await persistDataset({ rootDir, dataset: buildApiDataset(input) });
    const second = await persistDataset({ rootDir, dataset: buildApiDataset(input) });
    assert.equal(first.fingerprint, second.fingerprint);
    assert.equal(first.provenance.importedAt, second.provenance.importedAt);
    assert.equal(first.provenance.truncated, true);
    assert.equal(first.complete, false);
  } finally { await rm(rootDir, { recursive: true, force: true }); }
});

test("GSC fetch requires a property before authentication or transport access", async () => {
  let authenticationCalls = 0;
  let transportCalls = 0;
  const authProvider = { getAccessToken: async () => { authenticationCalls += 1; return "token"; } };
  const transport = {
    listSites: async () => { transportCalls += 1; return { siteEntry: [] }; },
    querySearchAnalytics: async () => { transportCalls += 1; return { rows: [] }; },
  };
  await assert.rejects(runContentCli({ command: "gsc-fetch", argv: [], authProvider, transport }), /requires --property/);
  assert.equal(authenticationCalls, 0);
  assert.equal(transportCalls, 0);
});

test("GSC properties lists accessible properties independently", async () => {
  const headers = { Authorization: "Bearer token", "x-goog-user-project": "quota-from-auth-library" };
  const authProvider = { getRequestHeaders: async () => headers };
  const transport = { listSites: async (receivedHeaders) => { assert.deepEqual(receivedHeaders, headers); return { siteEntry: [{ siteUrl: "sc-domain:example.com", permissionLevel: "siteOwner" }] }; } };
  const listed = await runContentCli({ command: "gsc-properties", argv: ["--json"], authProvider, transport });
  assert.deepEqual(listed, [{ property: "sc-domain:example.com", permissionLevel: "siteOwner" }]);
});

test("GSC fetch validates accessible properties before querying", async () => {
  const calls = [];
  const authProvider = { getRequestHeaders: async () => ({ Authorization: "Bearer token" }) };
  const transport = {
    listSites: async () => ({ siteEntry: [{ siteUrl: "sc-domain:example.com", permissionLevel: "siteOwner" }] }),
    querySearchAnalytics: async (...args) => { calls.push(args); return { rows: [] }; },
  };
  await assert.rejects(runContentCli({ command: "gsc-fetch", argv: ["--property", "sc-domain:other.com", "--start-date", "2026-01-01", "--end-date", "2026-01-01", "--dimensions", "query"], authProvider, transport }), /not accessible/);
  assert.equal(calls.length, 0);
});

test("GSC fetch validates strict request flags and persists API responses", async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "gsc-fetch-"));
  try {
    const headers = { Authorization: "Bearer token", "x-goog-user-project": "quota-from-auth-library" };
    const requests = [];
    const authProvider = { getRequestHeaders: async () => headers };
    const transport = {
      listSites: async (receivedHeaders) => { requests.push(receivedHeaders); return { siteEntry: [{ siteUrl: "sc-domain:example.com", permissionLevel: "siteOwner" }] }; },
      querySearchAnalytics: async (receivedHeaders) => { requests.push(receivedHeaders); return { rows: [] }; },
    };
    await assert.rejects(runContentCli({ command: "gsc-fetch", argv: ["--property", "sc-domain:example.com", "--start-date", "2026-01-01", "--end-date", "2027-01-01", "--dimensions", "query"], rootDir, authProvider, transport }), /at most 365/);
    const result = await runContentCli({ command: "gsc-fetch", argv: ["--property", "sc-domain:example.com", "--start-date", "2026-01-01", "--end-date", "2026-01-01", "--dimensions", "query", "--row-limit", "1"], rootDir, authProvider, transport });
    assert.equal(result.provenance.source, "google-search-console-api");
    assert.equal(result.complete, true);
    assert.deepEqual(requests, [headers, headers]);
  } finally { await rm(rootDir, { recursive: true, force: true }); }
});

test("analysis accepts mixed API and CSV evidence but guards truncated API results", () => {
  const inventory = { articles: [] };
  const csv = { property: "sc-domain:example.com", exportType: "query", baselineOnly: false, baseline: { warning: null }, provenance: { source: "google-search-console", sourceFilename: "query.csv" }, records: [{ query: "beaches", clicks: 1, impressions: 2, ctr: 0.5, position: 3 }] };
  const api = { property: "sc-domain:example.com", exportType: "query", baselineOnly: false, baseline: { warning: null }, complete: false, provenance: { source: "google-search-console-api", truncated: true }, records: [{ query: "villages", clicks: 1, impressions: 2, ctr: 0.5, position: 3 }] };
  const result = analyzeSearchConsole({ datasets: [csv, api], inventory });
  assert.equal(result.searchConsoleEvidence.baseline.complete, false);
  assert.match(result.searchConsoleEvidence.baseline.warning, /incomplete/);
  assert.match(result.gaps.status, /incomplete/);
  assert.equal("trend" in result, false);
});
