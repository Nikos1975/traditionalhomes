const number = (value) => Number(value.toFixed(6));
const phrase = (value) => String(value ?? "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const tokens = (value) => new Set(phrase(value).split(" ").filter((item) => item.length > 2));
const sharedTerms = (left, right) => [...tokens(left)].filter((term) => tokens(right).has(term));
const routeForPage = (page) => { try { return new URL(page).pathname; } catch { return page; } };
const sortByMetrics = (items) => [...items].sort((left, right) => right.impressions - left.impressions || right.clicks - left.clicks || left.query.localeCompare(right.query));

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
  return [...groups.values()].map(({ weightedPosition, ...item }) => ({ ...item, ctr: item.impressions ? number(item.clicks / item.impressions) : 0, position: item.impressions ? number(weightedPosition / item.impressions) : 0 }));
}

export function analyzeSearchConsole({ datasets, inventory, options = {} } = {}) {
  if (!Array.isArray(datasets) || !datasets.length) throw new Error("At least one processed Search Console dataset is required.");
  if (!inventory?.articles || !Array.isArray(inventory.articles)) throw new Error("Phase 1 inventory is required.");
  const thresholds = { highImpressions: Number(options.highImpressions ?? 100), lowClicks: Number(options.lowClicks ?? 0), nearRank: Number(options.nearRank ?? 10) };
  if (!Object.values(thresholds).every(Number.isFinite) || thresholds.highImpressions < 0 || thresholds.lowClicks < 0 || thresholds.nearRank < 1) throw new Error("Analysis thresholds must be non-negative numbers (nearRank must be at least 1).");
  const records = datasets.flatMap((dataset) => dataset.records ?? []);
  const queryRecords = aggregate(records.filter((record) => record.query), ["query"]);
  const queryPages = aggregate(records.filter((record) => record.query && record.page), ["query", "page"]).map((item) => {
    const route = routeForPage(item.page);
    const target = inventory.articles.find((article) => article.route === route);
    const overlapArticles = inventory.articles.filter((article) => sharedTerms(item.query, `${article.title} ${(article.keywords ?? []).join(" ")}`).length > 0);
    const possibleOverlap = overlapArticles.some((article) => article.route !== route);
    return { ...item, route, existingPageFirst: Boolean(target), existingPage: target ? { route: target.route, title: target.title } : null, possibleOverlap, overlapNote: possibleOverlap ? "Possible topical overlap; review manually, not a diagnosis." : null };
  });
  const baselineWarnings = datasets.map((dataset) => dataset.baseline?.warning).filter(Boolean).sort();
  const baseline = { warnings: [...new Set(baselineWarnings)], warning: [...new Set(baselineWarnings)][0] ?? null, datasets: datasets.map((dataset) => ({ property: dataset.property, exportType: dataset.exportType, baseline: dataset.baseline, provenance: dataset.provenance })).sort((left, right) => `${left.property}:${left.provenance.sourceFile}`.localeCompare(`${right.property}:${right.provenance.sourceFile}`)) };
  const highImpressionLowClick = sortByMetrics(queryRecords.filter((item) => item.impressions >= thresholds.highImpressions && item.clicks <= thresholds.lowClicks));
  const nearRank = sortByMetrics(queryRecords.filter((item) => item.position > 3 && item.position <= thresholds.nearRank));
  const links = [];
  for (const relation of queryPages.filter((item) => item.existingPageFirst)) for (const source of inventory.articles) {
    if (source.route === relation.route || source.internalLinks?.includes(relation.route)) continue;
    if (sharedTerms(relation.query, `${source.title} ${(source.keywords ?? []).join(" ")}`).length) links.push({ from: source.route, to: relation.route, query: relation.query, note: "Potential internal-link lead; verify relevance and anchor text manually." });
  }
  const uniqueLinks = [...new Map(links.map((item) => [`${item.from}\u0000${item.to}\u0000${item.query}`, item])).values()].sort((left, right) => `${left.from}:${left.to}:${left.query}`.localeCompare(`${right.from}:${right.to}:${right.query}`));
  const pageCoverage = queryPages.length > 0;
  const gaps = baseline.warning ? { status: "guarded: baseline warning", candidates: [] } : !pageCoverage ? { status: "guarded: page-level evidence unavailable", candidates: [] } : { status: "review required", candidates: sortByMetrics(queryRecords.filter((item) => !queryPages.some((relation) => relation.query === item.query)).map((item) => ({ ...item, note: "Evidence-led research lead only; do not create or delete URLs from this output." }))) };
  return { schemaVersion: 1, generatedAt: "deterministic", thresholds, searchConsoleEvidence: { baseline, processedDatasets: baseline.datasets }, relationships: { queryPages: sortByMetrics(queryPages) }, opportunities: { highImpressionLowClick, nearRank }, gaps, internalLinkSuggestions: uniqueLinks };
}

export function searchConsoleMarkdown(analysis) {
  const warning = analysis.searchConsoleEvidence.baseline.warning;
  const lines = ["# Search Console evidence analysis", "", warning ? `Baseline warning: ${warning}` : "Baseline warning: none.", "", "## Opportunities", "", "### High impressions, low clicks", ...analysis.opportunities.highImpressionLowClick.map((item) => `- ${item.query}: ${item.impressions} impressions, ${item.clicks} clicks, position ${item.position}`), "", "### Near rank", ...analysis.opportunities.nearRank.map((item) => `- ${item.query}: position ${item.position}`), "", "## Existing-page-first relationships", ...analysis.relationships.queryPages.map((item) => `- ${item.query} → ${item.route}${item.existingPageFirst ? " (review the existing page first)" : ""}${item.overlapNote ? ` — ${item.overlapNote}` : ""}`), "", "## Guarded gaps", `Status: ${analysis.gaps.status}`, ...analysis.gaps.candidates.map((item) => `- ${item.query}: ${item.note}`), "", "## Internal-link leads", ...analysis.internalLinkSuggestions.map((item) => `- ${item.from} → ${item.to} (${item.query})`)];
  return `${lines.join("\n")}\n`;
}
