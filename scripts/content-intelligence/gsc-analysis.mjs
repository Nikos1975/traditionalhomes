const number = (value) => Number(value.toFixed(6));
const LIMITED_HISTORY_WARNING = "Limited Search Console history. Use for current query/page observations, not seasonality or long-term trend conclusions.";
const INCOMPLETE_ACQUISITION_WARNING = "Search Console acquisition was incomplete due to its safety cap; do not treat it as complete evidence.";
const phrase = (value) => String(value ?? "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const tokens = (value) => new Set(phrase(value).split(" ").filter((item) => item.length > 2));
const sharedTerms = (left, right) => [...tokens(left)].filter((term) => tokens(right).has(term));

const normalizeRoute = (value) => {
  if (!value || typeof value !== "string") return value;
  const route = value.startsWith("/") ? value : `/${value}`;
  return route === "/" || route.endsWith("/") ? route : `${route}/`;
};

const routeForPage = (page) => {
  try { return normalizeRoute(new URL(page).pathname); }
  catch { return normalizeRoute(page); }
};

const sortByMetrics = (items) => [...items].sort((left, right) =>
  right.impressions - left.impressions ||
  right.clicks - left.clicks ||
  left.position - right.position ||
  String(left.query ?? "").localeCompare(String(right.query ?? "")) ||
  String(left.canonicalRoute ?? left.route ?? "").localeCompare(String(right.canonicalRoute ?? right.route ?? ""))
);

function aggregate(records, keys) {
  const groups = new Map();
  for (const record of records) {
    const key = keys.map((name) => record[name] ?? "").join("\u0000");
    const current = groups.get(key) ?? Object.fromEntries(keys.map((name) => [name, record[name]]).concat([["clicks", 0], ["impressions", 0], ["weightedPosition", 0]]));
    current.clicks += record.clicks;
    current.impressions += record.impressions;
    current.weightedPosition += record.position * record.impressions;
    groups.set(key, current);
  }
  return [...groups.values()].map(({ weightedPosition, ...item }) => ({
    ...item,
    ctr: item.impressions ? number(item.clicks / item.impressions) : 0,
    position: item.impressions ? number(weightedPosition / item.impressions) : 0,
  }));
}

function publishedSitePages(inventory) {
  const pages = Array.isArray(inventory?.sitePages) && inventory.sitePages.length
    ? inventory.sitePages
    : (inventory?.articles ?? []).map((article) => ({
        ...article,
        type: article.type ?? "blog",
        published: article.draft !== true,
        indexable: article.draft !== true,
        seoEligible: article.draft !== true,
      }));
  return pages.filter((page) => page?.route && page.draft !== true && page.published !== false);
}

function publishedArticles(inventory) {
  return (inventory?.articles ?? []).filter((article) => article?.route && article.draft !== true);
}

function redirectResolver(inventory) {
  const redirects = new Map((inventory?.redirects ?? []).map((item) => [normalizeRoute(item.from), normalizeRoute(item.to)]));
  return (route) => {
    let current = normalizeRoute(route);
    const seen = new Set();
    for (let depth = 0; depth < 8 && redirects.has(current) && !seen.has(current); depth += 1) {
      seen.add(current);
      current = redirects.get(current);
    }
    return current;
  };
}

function signalFor(item) {
  if (item.impressions <= 1) return "single-impression";
  if (item.impressions < 10) return "low-volume";
  return "multi-impression";
}

function decorateQueryPages({ queryPages, inventory }) {
  const pages = publishedSitePages(inventory);
  const pageByRoute = new Map(pages.map((page) => [normalizeRoute(page.route), page]));
  const resolveRedirect = redirectResolver(inventory);
  const base = queryPages.map((item) => {
    const route = routeForPage(item.page);
    const canonicalRoute = resolveRedirect(route);
    const target = pageByRoute.get(canonicalRoute);
    const topicalMatches = pages.filter((page) =>
      normalizeRoute(page.route) !== canonicalRoute &&
      sharedTerms(item.query, `${page.title ?? ""} ${(page.keywords ?? []).join(" ")}`).length > 0
    );
    return {
      ...item,
      route,
      canonicalRoute,
      redirected: route !== canonicalRoute,
      existingPageFirst: Boolean(target),
      existingPage: target ? { route: target.route, title: target.title, type: target.type ?? null } : null,
      pageType: target?.type ?? null,
      seoEligible: target?.seoEligible !== false,
      topicalSimilarity: topicalMatches.length > 0,
      signal: signalFor(item),
    };
  });

  const groups = new Map();
  for (const item of base) {
    if (!groups.has(item.query)) groups.set(item.query, []);
    groups.get(item.query).push(item);
  }

  return base.map((item) => {
    const group = groups.get(item.query);
    const ordered = [...group].sort((left, right) =>
      right.impressions - left.impressions ||
      right.clicks - left.clicks ||
      left.position - right.position ||
      left.canonicalRoute.localeCompare(right.canonicalRoute)
    );
    const primary = ordered[0];
    const rankingRoutes = [...new Set(group.map((relation) => relation.canonicalRoute))].sort();
    const multipleRankingUrls = rankingRoutes.length > 1;
    return {
      ...item,
      ownershipRole: item === primary ? "primary" : "secondary",
      possibleOverlap: multipleRankingUrls || item.topicalSimilarity,
      overlapEvidence: {
        level: multipleRankingUrls ? "MULTIPLE_RANKING_URLS" : "NO_MULTI_URL_EVIDENCE",
        rankingRoutes,
      },
      overlapNote: multipleRankingUrls
        ? "Multiple ranking URLs observed for this query; review page intent before changing URLs or content."
        : item.topicalSimilarity
          ? "Topical similarity only; this is not Search Console evidence of cannibalization."
          : null,
    };
  });
}

function ownershipSummary(queryPages) {
  const groups = new Map();
  for (const item of queryPages) {
    if (!groups.has(item.query)) groups.set(item.query, []);
    groups.get(item.query).push(item);
  }
  return [...groups.entries()].map(([query, items]) => {
    const primary = items.find((item) => item.ownershipRole === "primary") ?? sortByMetrics(items)[0];
    const secondary = items.filter((item) => item !== primary).sort((left, right) => right.impressions - left.impressions || left.position - right.position);
    return {
      query,
      primary: {
        route: primary.route,
        canonicalRoute: primary.canonicalRoute,
        clicks: primary.clicks,
        impressions: primary.impressions,
        ctr: primary.ctr,
        position: primary.position,
        existingPageFirst: primary.existingPageFirst,
        pageType: primary.pageType,
      },
      secondary: secondary.map((item) => ({
        route: item.route,
        canonicalRoute: item.canonicalRoute,
        clicks: item.clicks,
        impressions: item.impressions,
        ctr: item.ctr,
        position: item.position,
        existingPageFirst: item.existingPageFirst,
        pageType: item.pageType,
      })),
      overlapEvidence: primary.overlapEvidence,
    };
  }).sort((left, right) =>
    right.primary.impressions - left.primary.impressions ||
    right.primary.clicks - left.primary.clicks ||
    left.query.localeCompare(right.query)
  );
}

export function analyzeSearchConsole({ datasets, inventory, options = {} } = {}) {
  if (!Array.isArray(datasets) || !datasets.length) throw new Error("At least one processed Search Console dataset is required.");
  if (!inventory?.articles || !Array.isArray(inventory.articles)) throw new Error("Phase 1 inventory is required.");
  const thresholds = {
    highImpressions: Number(options.highImpressions ?? 100),
    lowClicks: Number(options.lowClicks ?? 0),
    nearRank: Number(options.nearRank ?? 10),
  };
  if (!Object.values(thresholds).every(Number.isFinite) || thresholds.highImpressions < 0 || thresholds.lowClicks < 0 || thresholds.nearRank < 1) {
    throw new Error("Analysis thresholds must be non-negative numbers (nearRank must be at least 1).");
  }

  const records = datasets.flatMap((dataset) => dataset.records ?? []);
  const queryRecords = aggregate(records.filter((record) => record.query), ["query"]);
  const queryPages = decorateQueryPages({
    queryPages: aggregate(records.filter((record) => record.query && record.page), ["query", "page"]),
    inventory,
  });

  const baselineOnly = datasets.some((dataset) => dataset.baselineOnly === true);
  const complete = !datasets.some((dataset) => dataset.complete === false || dataset.provenance?.truncated === true);
  const baselineWarnings = datasets
    .filter((dataset) => dataset.baselineOnly === true)
    .map((dataset) => dataset.baseline?.warning ?? LIMITED_HISTORY_WARNING)
    .sort();
  const warnings = [...new Set([...baselineWarnings, ...(complete ? [] : [INCOMPLETE_ACQUISITION_WARNING])])];
  const baseline = {
    baselineOnly,
    complete,
    warnings,
    warning: warnings[0] ?? null,
    datasets: datasets.map((dataset) => ({
      property: dataset.property,
      exportType: dataset.exportType,
      baselineOnly: dataset.baselineOnly === true,
      complete: dataset.complete !== false && dataset.provenance?.truncated !== true,
      baseline: dataset.baseline,
      provenance: dataset.provenance,
    })).sort((left, right) => `${left.property}:${left.provenance.sourceFilename ?? left.provenance.sourceFile}`.localeCompare(`${right.property}:${right.provenance.sourceFilename ?? right.provenance.sourceFile}`)),
  };

  const primaryQueryPages = queryPages.filter((item) => item.ownershipRole === "primary" && item.seoEligible !== false && !item.redirected);
  const highImpressionLowClick = sortByMetrics(primaryQueryPages.filter((item) => item.impressions >= thresholds.highImpressions && item.clicks <= thresholds.lowClicks));
  const nearRank = sortByMetrics(primaryQueryPages.filter((item) => item.position > 3 && item.position <= thresholds.nearRank));

  const published = publishedArticles(inventory);
  const links = [];
  for (const relation of primaryQueryPages.filter((item) => item.existingPageFirst)) {
    for (const source of published) {
      if (normalizeRoute(source.route) === relation.canonicalRoute || (source.internalLinks ?? []).map(normalizeRoute).includes(relation.canonicalRoute)) continue;
      if (!sharedTerms(relation.query, `${source.title ?? ""} ${(source.keywords ?? []).join(" ")}`).length) continue;
      links.push({
        from: source.route,
        to: relation.canonicalRoute,
        query: relation.query,
        evidenceStatus: baselineOnly ? "guarded: baseline warning" : "review required",
        note: "Potential internal-link lead; verify relevance, target-page intent, and anchor text manually.",
      });
    }
  }
  const uniqueLinks = [...new Map(links.map((item) => [`${item.from}\u0000${item.to}\u0000${item.query}`, item])).values()]
    .sort((left, right) => `${left.from}:${left.to}:${left.query}`.localeCompare(`${right.from}:${right.to}:${right.query}`));

  const pageCoverage = queryPages.length > 0;
  const gaps = !baseline.complete
    ? { status: "guarded: incomplete acquisition", candidates: [] }
    : baseline.baselineOnly
      ? { status: "guarded: baseline warning", candidates: [] }
      : !pageCoverage
        ? { status: "guarded: page-level evidence unavailable", candidates: [] }
        : {
            status: "review required",
            candidates: sortByMetrics(queryRecords.filter((item) => !queryPages.some((relation) => relation.query === item.query)).map((item) => ({
              ...item,
              note: "Evidence-led research lead only; do not create or delete URLs from this output.",
            }))),
          };

  return {
    schemaVersion: 2,
    generatedAt: "deterministic",
    thresholds,
    searchConsoleEvidence: { baseline, processedDatasets: baseline.datasets },
    relationships: {
      queryPages: sortByMetrics(queryPages),
      queryOwnership: ownershipSummary(queryPages),
    },
    opportunities: { highImpressionLowClick, nearRank },
    gaps,
    internalLinkStatus: baselineOnly ? "guarded: baseline warning" : complete ? "review required" : "guarded: incomplete acquisition",
    internalLinkSuggestions: uniqueLinks,
  };
}

export function searchConsoleMarkdown(analysis) {
  const warning = analysis.searchConsoleEvidence.baseline.warning;
  const lines = [
    "# Search Console evidence analysis",
    "",
    warning ? `Baseline warning: ${warning}` : "Baseline warning: none.",
    "",
    "## Opportunities",
    "",
    "### High impressions, low clicks",
    ...analysis.opportunities.highImpressionLowClick.map((item) => `- ${item.query} → ${item.canonicalRoute}: ${item.impressions} impressions, ${item.clicks} clicks, position ${item.position} (${item.signal})`),
    "",
    "### Near rank",
    ...analysis.opportunities.nearRank.map((item) => `- ${item.query} → ${item.canonicalRoute}: position ${item.position}, ${item.impressions} impressions (${item.signal})`),
    "",
    "## Query ownership",
    ...analysis.relationships.queryOwnership.map((item) => `- ${item.query} → ${item.primary.canonicalRoute} (primary: ${item.primary.impressions} impressions, position ${item.primary.position})${item.secondary.length ? `; secondary: ${item.secondary.map((secondary) => `${secondary.canonicalRoute} (${secondary.impressions})`).join(", ")}` : ""}${item.overlapEvidence.level === "MULTIPLE_RANKING_URLS" ? " — multiple ranking URLs observed" : ""}`),
    "",
    "## Existing-page-first relationships",
    ...analysis.relationships.queryPages.map((item) => `- ${item.query} → ${item.route}${item.redirected ? ` → ${item.canonicalRoute} (redirect target)` : ""}${item.existingPageFirst ? ` (${item.pageType ?? "page"}; ${item.ownershipRole})` : " (not found in production inventory)"}${item.overlapEvidence.level === "MULTIPLE_RANKING_URLS" ? " — multiple ranking URLs observed; review manually" : ""}`),
    "",
    "## Guarded gaps",
    `Status: ${analysis.gaps.status}`,
    ...analysis.gaps.candidates.map((item) => `- ${item.query}: ${item.note}`),
    "",
    "## Internal-link leads",
    `Status: ${analysis.internalLinkStatus}`,
    ...analysis.internalLinkSuggestions.map((item) => `- ${item.from} → ${item.to} (${item.query}) — ${item.evidenceStatus}`),
  ];
  return `${lines.join("\n")}\n`;
}
