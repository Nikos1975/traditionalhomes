import assert from "node:assert/strict";
import test from "node:test";
import { buildInventory } from "../scripts/content-intelligence/inventory.mjs";
import { analyzeSearchConsole } from "../scripts/content-intelligence/gsc-analysis.mjs";

const warning = "Limited Search Console history. Use for current query/page observations, not seasonality or long-term trend conclusions.";

function dataset(records, { baselineOnly = true } = {}) {
  return {
    property: "sc-domain:traditional-homes.gr",
    exportType: "combined",
    complete: true,
    baselineOnly,
    baseline: { startDate: "2026-07-29", endDate: "2026-08-08", days: 11, warning: baselineOnly ? warning : null },
    provenance: { source: "google-search-console-api", truncated: false },
    records,
  };
}

test("sitewide inventory includes production Astro routes and dynamic property routes", async () => {
  const inventory = await buildInventory({ rootDir: process.cwd(), includeDrafts: true });
  const routes = new Set(inventory.sitePages.filter((page) => page.published).map((page) => page.route));
  for (const route of [
    "/en/",
    "/en/location/",
    "/en/guide/mavrikiano/",
    "/en/houses/leonidas/",
    "/en/villa/almond-tree-villa/",
  ]) assert.ok(routes.has(route), `missing production route ${route}`);
  assert.ok(inventory.redirects.some((item) => item.from === "/" && item.to === "/en/" && item.status === 301));
  assert.ok(inventory.sitePages.some((page) => page.draft === true && page.published === false));
});

test("page-first opportunities use the primary ranking URL instead of a blended query position", () => {
  const inventory = {
    articles: [],
    sitePages: [
      { route: "/en/", title: "Home", type: "homepage", published: true, seoEligible: true, keywords: ["elounda", "traditional", "homes"] },
      { route: "/en/policies/", title: "Policies", type: "utility", published: true, seoEligible: false, keywords: [] },
      { route: "/en/blog/elounda-guide/", title: "Elounda guide", type: "blog", published: true, seoEligible: true, keywords: ["elounda"] },
    ],
    redirects: [],
  };
  const result = analyzeSearchConsole({ datasets: [dataset([
    { query: "elounda traditional homes of crete", page: "https://traditional-homes.gr/en/", clicks: 8, impressions: 45, ctr: 0.177778, position: 1.4 },
    { query: "elounda traditional homes of crete", page: "https://traditional-homes.gr/en/policies/", clicks: 0, impressions: 15, ctr: 0, position: 11.866667 },
    { query: "elounda traditional homes of crete", page: "https://traditional-homes.gr/en/blog/elounda-guide/", clicks: 1, impressions: 4, ctr: 0.25, position: 8.5 },
  ])], inventory });
  const ownership = result.relationships.queryOwnership[0];
  assert.equal(ownership.primary.canonicalRoute, "/en/");
  assert.equal(ownership.primary.position, 1.4);
  assert.equal(ownership.overlapEvidence.level, "MULTIPLE_RANKING_URLS");
  assert.equal(result.opportunities.nearRank.some((item) => item.query === "elounda traditional homes of crete"), false);
});

test("site pages are recognised and draft articles are excluded from internal-link sources", () => {
  const inventory = {
    articles: [
      { route: "/en/blog/published-source/", title: "Mavrikiano walking", keywords: ["mavrikiano"], internalLinks: [], draft: false },
      { route: "/en/blog/draft-source/", title: "Mavrikiano draft", keywords: ["mavrikiano"], internalLinks: [], draft: true },
    ],
    sitePages: [
      { route: "/en/guide/mavrikiano/", title: "Mavrikiano guide", type: "destination-guide", published: true, seoEligible: true, keywords: ["mavrikiano"] },
      { route: "/en/blog/published-source/", title: "Mavrikiano walking", type: "blog", published: true, seoEligible: true, keywords: ["mavrikiano"] },
      { route: "/en/blog/draft-source/", title: "Mavrikiano draft", type: "blog", draft: true, published: false, seoEligible: false, keywords: ["mavrikiano"] },
    ],
    redirects: [],
  };
  const result = analyzeSearchConsole({ datasets: [dataset([
    { query: "mavrikiano", page: "https://traditional-homes.gr/en/guide/mavrikiano/", clicks: 0, impressions: 15, ctr: 0, position: 7.8 },
  ])], inventory });
  const relation = result.relationships.queryPages[0];
  assert.equal(relation.existingPageFirst, true);
  assert.equal(relation.pageType, "destination-guide");
  assert.equal(relation.ownershipRole, "primary");
  assert.equal(result.internalLinkSuggestions.some((item) => item.from === "/en/blog/draft-source/"), false);
  assert.equal(result.internalLinkSuggestions.some((item) => item.from === "/en/blog/published-source/"), true);
  assert.equal(result.internalLinkStatus, "guarded: baseline warning");
});

test("exact redirects resolve old ranking URLs to their production target", () => {
  const inventory = {
    articles: [],
    sitePages: [{ route: "/en/", title: "Home", type: "homepage", published: true, seoEligible: true, keywords: [] }],
    redirects: [{ from: "/", to: "/en/", status: 301 }],
  };
  const result = analyzeSearchConsole({ datasets: [dataset([
    { query: "leonidas", page: "http://www.traditional-homes.gr/", clicks: 0, impressions: 1, ctr: 0, position: 4 },
  ])], inventory });
  const relation = result.relationships.queryPages[0];
  assert.equal(relation.route, "/");
  assert.equal(relation.canonicalRoute, "/en/");
  assert.equal(relation.redirected, true);
  assert.equal(relation.existingPageFirst, true);
  assert.equal(result.opportunities.nearRank.length, 0);
});
