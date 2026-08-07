import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { atomicJson, contentPath } from "./utils.mjs";

const REQUIRED_METRICS = ["clicks", "impressions", "ctr", "position"];
const HEADER_ALIASES = {
  query: ["query", "queries", "top query", "top queries"],
  page: ["page", "pages", "top page", "top pages"],
  clicks: ["clicks"],
  impressions: ["impressions"],
  ctr: ["ctr"],
  position: ["position", "average position"],
  date: ["date"],
};

const fingerprint = (value) => createHash("sha256").update(value).digest("hex");
const normalizeHeader = (value) => value.trim().toLowerCase().replace(/\s+/g, " ");
const normaliseWhitespace = (value) => value.replace(/\s+/g, " ").trim();

function parseCsv(text, file) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') { cell += '"'; index += 1; }
      else if (char === '"') quoted = false;
      else cell += char;
    } else if (char === '"') quoted = true;
    else if (char === ",") { row.push(cell); cell = ""; }
    else if (char === "\n") { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (char !== "\r") cell += char;
  }
  if (quoted) throw new Error(`${file}: unterminated quoted CSV value.`);
  if (cell || row.length) { row.push(cell); rows.push(row); }
  if (rows.length < 2) throw new Error(`${file}: CSV must contain a header and at least one record.`);
  return rows;
}

function headerMap(headers, file) {
  const mapped = {};
  for (const [key, aliases] of Object.entries(HEADER_ALIASES)) {
    const index = headers.findIndex((header) => aliases.includes(normalizeHeader(header)));
    if (index >= 0) mapped[key] = index;
  }
  const missing = REQUIRED_METRICS.filter((key) => mapped[key] === undefined);
  if (missing.length) throw new Error(`${file}: missing required columns: ${missing.join(", ")}.`);
  if (mapped.query === undefined && mapped.page === undefined) throw new Error(`${file}: missing required columns: query or page.`);
  return mapped;
}

function number(value, label, file, { percent = false } = {}) {
  const raw = normaliseWhitespace(value ?? "");
  if (!raw) throw new Error(`${file}: ${label} must be a number.`);
  const numeric = Number(percent && raw.endsWith("%") ? raw.slice(0, -1) : raw.replace(/,/g, ""));
  if (!Number.isFinite(numeric) || numeric < 0) throw new Error(`${file}: ${label} must be a non-negative number.`);
  const result = percent && raw.endsWith("%") ? numeric / 100 : numeric;
  if (percent && result > 1) throw new Error(`${file}: ${label} must be between 0 and 100%.`);
  return result;
}

function canonicalUrl(value, file) {
  let url;
  try { url = new URL(normaliseWhitespace(value)); } catch { throw new Error(`${file}: Page must be an absolute URL.`); }
  if (!/^https?:$/.test(url.protocol)) throw new Error(`${file}: Page must use http or https.`);
  url.hash = "";
  url.search = "";
  url.hostname = url.hostname.toLowerCase();
  if ((url.protocol === "https:" && url.port === "443") || (url.protocol === "http:" && url.port === "80")) url.port = "";
  if (!url.pathname.endsWith("/")) url.pathname += "/";
  return url.toString();
}

function validateProperty(property) {
  if (typeof property !== "string" || !property) throw new Error("property is required.");
  if (property !== property.trim()) throw new Error("property must be exact and may not include surrounding whitespace.");
  if (property.startsWith("sc-domain:")) {
    const domain = property.slice("sc-domain:".length).toLowerCase();
    const labels = domain.split(".");
    if (labels.length < 2 || !labels.every((label) => /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))) throw new Error("property must be a URL-prefix or sc-domain: property.");
    return { type: "domain", value: domain };
  }
  try {
    const url = new URL(property);
    if (!/^https?:$/.test(url.protocol) || !url.hostname) throw new Error();
    return { type: "prefix", value: url };
  } catch { throw new Error("property must be a URL-prefix or sc-domain: property."); }
}

function assertCompatible(page, property, file) {
  if (!page) return;
  const url = new URL(page);
  if (property.type === "domain") {
    if (url.hostname !== property.value && !url.hostname.endsWith(`.${property.value}`)) throw new Error(`${file}: Page is not compatible with the supplied property.`);
  } else {
    const prefixPath = property.value.pathname.replace(/\/+$/, "") || "/";
    const pathMatches = prefixPath === "/" || url.pathname === prefixPath || url.pathname.startsWith(`${prefixPath}/`);
    if (url.origin !== property.value.origin || !pathMatches) throw new Error(`${file}: Page is not compatible with the supplied property.`);
  }
}

function normalizedRecord(row, headers, file) {
  const record = {};
  if (headers.query !== undefined) {
    const query = normaliseWhitespace(row[headers.query] ?? "");
    if (!query) throw new Error(`${file}: Query is required.`);
    record.query = query;
  }
  if (headers.page !== undefined) record.page = canonicalUrl(row[headers.page] ?? "", file);
  if (headers.date !== undefined) {
    const date = normaliseWhitespace(row[headers.date] ?? "");
    const parsedDate = new Date(`${date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(parsedDate.valueOf()) || parsedDate.toISOString().slice(0, 10) !== date) throw new Error(`${file}: Date must be ISO-8601 (YYYY-MM-DD).`);
    record.date = date;
  }
  const clicks = number(row[headers.clicks], "Clicks", file);
  const impressions = number(row[headers.impressions], "Impressions", file);
  const ctr = number(row[headers.ctr], "CTR", file, { percent: true });
  const position = number(row[headers.position], "Position", file);
  return { record, clicks, impressions, ctr, position };
}

function deduplicate(values) {
  const grouped = new Map();
  for (const item of values) {
    const key = JSON.stringify(item.record);
    const existing = grouped.get(key) ?? { ...item.record, clicks: 0, impressions: 0, weightedPosition: 0, positions: 0 };
    existing.clicks += item.clicks;
    existing.impressions += item.impressions;
    existing.weightedPosition += item.position * item.impressions;
    existing.positions += item.position;
    grouped.set(key, existing);
  }
  return [...grouped.values()].map(({ weightedPosition, positions, ...record }) => ({
    ...record,
    clicks: record.clicks,
    impressions: record.impressions,
    ctr: record.impressions ? Number((record.clicks / record.impressions).toFixed(6)) : 0,
    position: Number(((record.impressions ? weightedPosition / record.impressions : positions).toFixed(6))),
  })).sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)));
}

function baseline(records) {
  const dates = records.map((record) => record.date).filter(Boolean).sort();
  if (!dates.length) return { startDate: null, endDate: null, days: null, warning: "Baseline period is not available." };
  const startDate = dates[0];
  const endDate = dates.at(-1);
  const days = Math.round((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86400000) + 1;
  return { startDate, endDate, days, warning: days < 90 ? "Baseline covers fewer than 90 days." : null };
}

export async function importSearchConsoleCsv({ rootDir = process.cwd(), file, property } = {}) {
  if (typeof file !== "string" || !file) throw new Error("file is required.");
  if (!path.isAbsolute(file)) {
    const candidate = path.resolve(rootDir, file);
    if (path.relative(path.resolve(rootDir), candidate).startsWith("..")) throw new Error("Input file must remain under the supplied root directory when using a relative path.");
    file = candidate;
  }
  const validatedProperty = validateProperty(property);
  const source = await readFile(file, "utf8");
  const [header, ...rows] = parseCsv(source.replace(/^\uFEFF/, ""), file);
  const headers = headerMap(header, file);
  const exportType = headers.query !== undefined && headers.page !== undefined ? "combined" : headers.query !== undefined ? "query" : "page";
  const values = rows.map((row) => normalizedRecord(row, headers, file));
  for (const value of values) assertCompatible(value.record.page, validatedProperty, file);
  const records = deduplicate(values);
  const provenance = { sourceFile: path.basename(file), sourceFingerprint: fingerprint(source), property };
  const result = { schemaVersion: 1, generatedAt: "deterministic", property, exportType, provenance, baseline: baseline(records), records };
  result.fingerprint = fingerprint(JSON.stringify(result));
  await atomicJson(contentPath(rootDir, "search-console", "processed", `${result.fingerprint}.json`), result);
  return result;
}
