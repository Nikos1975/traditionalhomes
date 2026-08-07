const allowedDimensions = new Set(["query", "page", "date"]);

export function validateProperty(property) {
  if (typeof property !== "string" || property !== property.trim()) throw new Error("property must be a URL-prefix or sc-domain: property.");
  if (property.startsWith("sc-domain:")) {
    const domain = property.slice(10).toLowerCase();
    if (!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/.test(domain)) throw new Error("property must be a URL-prefix or sc-domain: property.");
    return { type: "domain", value: domain };
  }
  try {
    const url = new URL(property);
    if (!/^https?:$/.test(url.protocol) || !url.hostname) throw new Error();
    return { type: "prefix", value: url };
  } catch { throw new Error("property must be a URL-prefix or sc-domain: property."); }
}

function canonicalPage(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error("Search Console row Page must be an absolute URL."); }
  if (!/^https?:$/.test(url.protocol)) throw new Error("Search Console row Page must use http or https.");
  url.hash = ""; url.search = ""; url.hostname = url.hostname.toLowerCase();
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url.toString();
}

function compatible(page, property) {
  const url = new URL(page);
  if (property.type === "domain") return url.hostname === property.value || url.hostname.endsWith(`.${property.value}`);
  const prefix = property.value.pathname.replace(/\/+$/, "") || "/";
  return url.origin === property.value.origin && (prefix === "/" || url.pathname === prefix || url.pathname.startsWith(`${prefix}/`));
}

function validDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(`${value}T00:00:00Z`).toISOString().slice(0, 10) === value;
}

export function normalizeProperties(response) {
  if (!response || !Array.isArray(response.siteEntry)) throw new Error("Search Console property response was malformed.");
  return response.siteEntry.map((entry) => {
    try { validateProperty(entry?.siteUrl); } catch { throw new Error("Search Console returned an invalid property."); }
    if (typeof entry.permissionLevel !== "string" || !entry.permissionLevel) throw new Error("Search Console returned an invalid property.");
    return { property: entry.siteUrl, permissionLevel: entry.permissionLevel };
  }).sort((a, b) => a.property.localeCompare(b.property));
}

export function normalizeSearchAnalyticsResponse({ response, property, dimensions }) {
  const checkedProperty = validateProperty(property);
  if (!Array.isArray(dimensions) || !dimensions.length || dimensions.some((item) => !allowedDimensions.has(item))) throw new Error("Search Console dimensions are invalid.");
  if (!response || (response.rows !== undefined && !Array.isArray(response.rows))) throw new Error("Search Console response was malformed.");
  const values = (response.rows ?? []).map((row) => {
    if (!Array.isArray(row?.keys) || row.keys.length !== dimensions.length) throw new Error("Search Console row keys do not match dimensions.");
    const record = Object.fromEntries(dimensions.map((dimension, index) => [dimension, row.keys[index]]));
    if (record.query !== undefined && (typeof record.query !== "string" || !record.query.trim())) throw new Error("Search Console row Query is invalid.");
    if (record.date !== undefined && !validDate(record.date)) throw new Error("Search Console row Date is invalid.");
    if (record.page !== undefined) { record.page = canonicalPage(record.page); if (!compatible(record.page, checkedProperty)) throw new Error("Search Console row Page is not compatible with the supplied property."); }
    for (const key of ["clicks", "impressions", "ctr", "position"]) if (!Number.isFinite(row[key]) || row[key] < 0 || (key === "ctr" && row[key] > 1)) throw new Error(`Search Console row ${key} is invalid.`);
    return { ...record, clicks: row.clicks, impressions: row.impressions, ctr: Number(row.ctr.toFixed(6)), position: Number(row.position.toFixed(6)) };
  });
  const grouped = new Map();
  for (const record of values) {
    const identity = Object.fromEntries(dimensions.map((dimension) => [dimension, record[dimension]]));
    const key = JSON.stringify(identity);
    const current = grouped.get(key) ?? { ...identity, clicks: 0, impressions: 0, weightedPosition: 0, positions: 0 };
    current.clicks += record.clicks; current.impressions += record.impressions; current.weightedPosition += record.position * record.impressions; current.positions += record.position;
    grouped.set(key, current);
  }
  return [...grouped.values()].map(({ weightedPosition, positions, ...record }) => ({ ...record, ctr: record.impressions ? Number((record.clicks / record.impressions).toFixed(6)) : 0, position: Number(((record.impressions ? weightedPosition / record.impressions : positions).toFixed(6))) })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}
