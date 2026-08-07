import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { atomicJson, contentPath } from "./utils.mjs";

const WARNING = "Limited Search Console history. Use for current query/page observations, not seasonality or long-term trend conclusions.";
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const sortRecords = (records) => [...records].sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

function deduplicateRecords(records) {
  const grouped = new Map();
  for (const record of records) {
    const { clicks, impressions, ctr, position, ...identity } = record;
    const key = JSON.stringify(identity); const current = grouped.get(key) ?? { ...identity, clicks: 0, impressions: 0, weightedPosition: 0, positions: 0 };
    current.clicks += clicks; current.impressions += impressions; current.weightedPosition += position * impressions; current.positions += position;
    grouped.set(key, current);
  }
  return sortRecords([...grouped.values()].map(({ weightedPosition, positions, ...record }) => ({ ...record, ctr: record.impressions ? Number((record.clicks / record.impressions).toFixed(6)) : 0, position: Number(((record.impressions ? weightedPosition / record.impressions : positions).toFixed(6))) })));
}

function coverage(startDate, endDate) {
  const days = Math.round((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86400000) + 1;
  return { startDate, endDate, days, warning: days < 90 ? WARNING : null, baselineOnly: days < 90 };
}

export function buildApiDataset({ property, startDate, endDate, dimensions, rowLimit, records, truncated = false, batches = 0 }) {
  const baseline = coverage(startDate, endDate);
  const sortedRecords = deduplicateRecords(records);
  const stable = { schemaVersion: 1, source: "google-search-console-api", apiSource: "search-console-v3/searchAnalytics.query", property, coverageStart: startDate, coverageEnd: endDate, dimensions, type: "web", dataState: "final", aggregationType: "auto", rowLimit, truncated, records: sortedRecords };
  const fingerprint = hash(stable);
  return {
    schemaVersion: 1, generatedAt: "deterministic", property, exportType: dimensions.includes("query") && dimensions.includes("page") ? "combined" : dimensions.includes("query") ? "query" : "page",
    provenance: { source: stable.source, apiSource: stable.apiSource, importedAt: new Date().toISOString(), coverageStart: startDate, coverageEnd: endDate, coverageDays: baseline.days, property, recordCount: sortedRecords.length, dimensions, rowLimit, batches, truncated, requestFingerprint: hash({ ...stable, records: undefined }) },
    baselineOnly: baseline.baselineOnly, baseline, complete: !truncated, records: sortedRecords, fingerprint,
  };
}

export async function persistDataset({ rootDir = process.cwd(), dataset }) {
  const destination = contentPath(rootDir, "search-console", "processed", `${dataset.fingerprint}.json`);
  try { return JSON.parse(await readFile(destination, "utf8")); } catch (error) { if (error?.code !== "ENOENT") throw error; }
  await atomicJson(destination, dataset);
  return dataset;
}
