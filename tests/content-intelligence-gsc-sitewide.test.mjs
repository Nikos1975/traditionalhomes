import assert from "node:assert/strict";
import test from "node:test";
import { buildInventory, deriveRoute } from "../scripts/content-intelligence/inventory.mjs";
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

test("host variants that redirect to one production route merge into a single canonical relation", () => {
  const inventory = {
    articles: [],
    sitePages: [{ route: "/en/", title: "Home", type: "homepage", published: true, seoEligible: true, keywords: ["elounda"] }],
    redirects: [{ from: "/", to: "/en/", status: 301 }],
  };
  const result = analyzeSearchConsole({ datasets: [dataset([
    { query: "elounda traditional homes", page: "https://traditional-homes.gr/en/", clicks: 2, impressions: 60, ctr: 0.033333, position: 6.2 },
    { query: "elounda traditional homes", page: "http://www.traditional-homes.gr/", clicks: 0, impressions: 45, ctr: 0, position: 7.9 },
  ])], inventory, options: { highImpressions: 100, lowClicks: 5, nearRank: 10 } });

  assert.equal(result.relationships.queryPages.length, 1);
  const relation = result.relationships.queryPages[0];
  assert.equal(relation.canonicalRoute, "/en/");
  assert.equal(relation.impressions, 105);
  assert.equal(relation.clicks, 2);
  assert.equal(relation.ctr, 0.019048);
  assert.equal(relation.position, 6.928571);
  assert.equal(relation.redirected, false);
  assert.equal(relation.existingPageFirst, true);
  assert.deepEqual(relation.sourceRoutes, ["/", "/en/"]);
  assert.equal(relation.sources.length, 2);
  assert.deepEqual(relation.sources.map((source) => source.redirected), [false, true]);
  assert.deepEqual(relation.sources.map((source) => source.impressions), [60, 45]);

  const ownership = result.relationships.queryOwnership[0];
  assert.equal(ownership.primary.canonicalRoute, "/en/");
  assert.equal(ownership.primary.impressions, 105);
  assert.equal(ownership.secondary.length, 0);
  assert.equal(ownership.overlapEvidence.level, "NO_MULTI_URL_EVIDENCE");
  assert.deepEqual(ownership.overlapEvidence.rankingRoutes, ["/en/"]);

  assert.equal(result.opportunities.highImpressionLowClick.length, 1);
  assert.equal(result.opportunities.highImpressionLowClick[0].impressions, 105);
});

test("a redirecting source with more impressions cannot drop the query from opportunity analysis", () => {
  const inventory = {
    articles: [],
    sitePages: [{ route: "/en/", title: "Home", type: "homepage", published: true, seoEligible: true, keywords: ["elounda"] }],
    redirects: [{ from: "/", to: "/en/", status: 301 }],
  };
  const result = analyzeSearchConsole({ datasets: [dataset([
    { query: "traditional homes crete", page: "http://www.traditional-homes.gr/", clicks: 1, impressions: 90, ctr: 0.011111, position: 5 },
    { query: "traditional homes crete", page: "https://traditional-homes.gr/en/", clicks: 0, impressions: 30, ctr: 0, position: 6 },
  ])], inventory, options: { highImpressions: 50, lowClicks: 5, nearRank: 10 } });

  assert.equal(result.relationships.queryPages.length, 1);
  const relation = result.relationships.queryPages[0];
  assert.equal(relation.canonicalRoute, "/en/");
  assert.equal(relation.impressions, 120);
  assert.equal(relation.clicks, 1);
  assert.equal(relation.ctr, 0.008333);
  assert.equal(relation.position, 5.25);
  assert.equal(relation.redirected, false, "a live contributing source must keep the merged relation actionable");
  assert.equal(relation.ownershipRole, "primary");

  assert.equal(result.opportunities.highImpressionLowClick.length, 1);
  assert.equal(result.opportunities.highImpressionLowClick[0].impressions, 120);
  assert.equal(result.opportunities.nearRank.length, 1);
  assert.equal(result.opportunities.nearRank[0].canonicalRoute, "/en/");
});

test("a relation whose sources all redirect stays out of opportunity analysis", () => {
  const inventory = {
    articles: [],
    sitePages: [{ route: "/en/", title: "Home", type: "homepage", published: true, seoEligible: true, keywords: [] }],
    redirects: [{ from: "/", to: "/en/", status: 301 }],
  };
  const result = analyzeSearchConsole({ datasets: [dataset([
    { query: "leonidas", page: "http://www.traditional-homes.gr/", clicks: 0, impressions: 200, ctr: 0, position: 4 },
  ])], inventory, options: { highImpressions: 100, lowClicks: 5, nearRank: 10 } });
  assert.equal(result.relationships.queryPages[0].redirected, true);
  assert.equal(result.opportunities.highImpressionLowClick.length, 0);
  assert.equal(result.opportunities.nearRank.length, 0);
});

test("distinct production routes still report MULTIPLE_RANKING_URLS after canonical merging", () => {
  const inventory = {
    articles: [],
    sitePages: [
      { route: "/en/", title: "Home", type: "homepage", published: true, seoEligible: true, keywords: [] },
      { route: "/en/blog/elounda-guide/", title: "Elounda guide", type: "blog", published: true, seoEligible: true, keywords: [] },
    ],
    redirects: [{ from: "/", to: "/en/", status: 301 }],
  };
  const result = analyzeSearchConsole({ datasets: [dataset([
    { query: "elounda", page: "https://traditional-homes.gr/en/", clicks: 3, impressions: 40, ctr: 0.075, position: 4 },
    { query: "elounda", page: "http://www.traditional-homes.gr/", clicks: 0, impressions: 10, ctr: 0, position: 9 },
    { query: "elounda", page: "https://traditional-homes.gr/en/blog/elounda-guide/", clicks: 1, impressions: 20, ctr: 0.05, position: 7 },
  ])], inventory });
  assert.equal(result.relationships.queryPages.length, 2);
  const ownership = result.relationships.queryOwnership[0];
  assert.equal(ownership.overlapEvidence.level, "MULTIPLE_RANKING_URLS");
  assert.deepEqual(ownership.overlapEvidence.rankingRoutes, ["/en/", "/en/blog/elounda-guide/"]);
  assert.equal(ownership.primary.canonicalRoute, "/en/");
  assert.equal(ownership.primary.impressions, 50);
  assert.equal(ownership.secondary.length, 1);
  assert.equal(ownership.secondary[0].impressions, 20);
});

test("a legacy URL absent from the production inventory never becomes an actionable lead", () => {
  const inventory = {
    articles: [{ title: "Elounda beaches", route: "/en/blog/elounda-beaches/", internalLinks: [], keywords: ["elounda", "beaches"] }],
    sitePages: [
      { route: "/en/", title: "Home", type: "homepage", published: true, seoEligible: true, keywords: [] },
      { route: "/en/blog/elounda-beaches/", title: "Elounda beaches", type: "blog", published: true, seoEligible: true, keywords: ["elounda", "beaches"] },
    ],
    redirects: [{ from: "/", to: "/en/", status: 301 }],
  };
  const result = analyzeSearchConsole({ datasets: [dataset([
    { query: "elounda beaches", page: "https://traditional-homes.gr/blog/elounda-beaches/", clicks: 0, impressions: 120, ctr: 0, position: 8.4 },
  ])], inventory, options: { highImpressions: 100, lowClicks: 5, nearRank: 10 } });

  const relation = result.relationships.queryPages[0];
  assert.equal(relation.canonicalRoute, "/blog/elounda-beaches/", "the wildcard redirect is intentionally not in the exact redirect map");
  assert.equal(relation.existingPageFirst, false);
  assert.equal(result.opportunities.highImpressionLowClick.length, 0, "an unmatched route must not be an opportunity target");
  assert.equal(result.opportunities.nearRank.length, 0);
  assert.equal(result.internalLinkSuggestions.some((item) => item.to === "/blog/elounda-beaches/"), false);
});

test("blog routes use the canonical casing Astro publishes, not the source filename casing", () => {
  assert.equal(deriveRoute("Mavrikiano-Distances-And-Guide"), "/en/blog/mavrikiano-distances-and-guide/");
  assert.equal(deriveRoute("elounda-beaches"), "/en/blog/elounda-beaches/");
  assert.equal(deriveRoute("Welcome To Elounda"), "/en/blog/welcome-to-elounda/");
});

test("a mixed-case Markdown filename produces the lowercase published route without changing its slug", async () => {
  const inventory = await buildInventory({ rootDir: process.cwd(), includeDrafts: true });
  const article = inventory.articles.find((item) => item.slug === "Mavrikiano-Distances-And-Guide");
  assert.ok(article, "the mixed-case source article must still be discovered");
  assert.equal(article.route, "/en/blog/mavrikiano-distances-and-guide/");
  assert.equal(article.slug, "Mavrikiano-Distances-And-Guide", "the slug must stay the on-disk basename so the source file remains readable");

  const entries = inventory.sitePages.filter((page) => page.route === "/en/blog/mavrikiano-distances-and-guide/");
  assert.equal(entries.length, 1, "case normalization must not create a duplicate site page");
  assert.equal(entries[0].type, "blog");
  assert.equal(entries[0].published, true);
  assert.equal(entries[0].seoEligible, true);
  assert.equal(inventory.sitePages.some((page) => page.route === "/en/blog/Mavrikiano-Distances-And-Guide/"), false);
});

test("existing lowercase blog routes are unchanged and every blog route is canonical", async () => {
  const inventory = await buildInventory({ rootDir: process.cwd(), includeDrafts: true });
  const beaches = inventory.articles.find((item) => item.slug === "elounda-beaches");
  assert.ok(beaches);
  assert.equal(beaches.route, "/en/blog/elounda-beaches/");
  for (const page of inventory.sitePages.filter((item) => item.type === "blog")) {
    assert.match(page.route, /^\/en\/blog\/[a-z0-9\-_]+\/$/, `non-canonical blog route ${page.route}`);
  }
  assert.equal(inventory.sitePages.length, new Set(inventory.sitePages.map((page) => page.route)).size, "site page routes must be unique");
});

test("real Search Console evidence for the published mavrikiano URL resolves to the production page", async () => {
  const inventory = await buildInventory({ rootDir: process.cwd(), includeDrafts: true });
  const result = analyzeSearchConsole({ datasets: [dataset([
    { query: "mavrikiano distances", page: "https://traditional-homes.gr/en/blog/mavrikiano-distances-and-guide/", clicks: 0, impressions: 140, ctr: 0, position: 8.1 },
  ])], inventory, options: { highImpressions: 100, lowClicks: 5, nearRank: 10 } });

  const relation = result.relationships.queryPages[0];
  assert.equal(relation.canonicalRoute, "/en/blog/mavrikiano-distances-and-guide/");
  assert.equal(relation.existingPageFirst, true);
  assert.notEqual(relation.existingPage, null);
  assert.equal(relation.existingPage.route, "/en/blog/mavrikiano-distances-and-guide/");
  assert.equal(relation.pageType, "blog");
  assert.equal(relation.seoEligible, true);
  assert.equal(relation.redirected, false);

  assert.equal(result.opportunities.highImpressionLowClick.length, 1, "a recognised production page must remain an eligible opportunity target");
  assert.equal(result.opportunities.highImpressionLowClick[0].canonicalRoute, "/en/blog/mavrikiano-distances-and-guide/");
  assert.equal(result.opportunities.nearRank[0].canonicalRoute, "/en/blog/mavrikiano-distances-and-guide/");
});
