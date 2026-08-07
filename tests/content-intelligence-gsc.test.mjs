import assert from "node:assert/strict";
import test from "node:test";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { importSearchConsoleCsv } from "../scripts/content-intelligence/gsc-import.mjs";
import { analyzeSearchConsole, searchConsoleMarkdown } from "../scripts/content-intelligence/gsc-analysis.mjs";
import { runContentCli } from "../scripts/content-intelligence/cli.mjs";

const fixtures = path.join(process.cwd(), "tests", "fixtures", "content-intelligence-gsc");
const property = "https://example.com/";
const scratch = async () => {
  const rootDir = await mkdtemp(path.join(os.tmpdir(), "gsc-import-"));
  return { rootDir, cleanup: () => rm(rootDir, { recursive: true, force: true }) };
};

test("imports a query export with normalized metrics, provenance, deduplication, and a baseline warning", async () => {
  const temp = await scratch();
  try {
    const result = await importSearchConsoleCsv({ rootDir: temp.rootDir, file: path.join(fixtures, "query.csv"), property });
    assert.equal(result.property, property);
    assert.equal(result.exportType, "query");
    assert.deepEqual(result.records[0], { query: "Elounda beaches", date: "2026-05-01", clicks: 15, impressions: 120, ctr: 0.125, position: 3.583333 });
    assert.equal(result.records.length, 2);
    assert.equal(result.provenance.sourceFile, "query.csv");
    assert.match(result.provenance.sourceFingerprint, /^[a-f0-9]{64}$/);
    assert.equal(result.baseline.warning, "Baseline covers fewer than 90 days.");
    assert.equal(result.baseline.days, 89);
  } finally { await temp.cleanup(); }
});

test("imports page and combined exports, canonicalizes page URLs, and retains UTF-8 query text", async () => {
  const temp = await scratch();
  try {
    const pages = await importSearchConsoleCsv({ rootDir: temp.rootDir, file: path.join(fixtures, "page.csv"), property: "https://www.example.com/" });
    assert.equal(pages.exportType, "page");
    assert.equal(pages.records[0].page, "https://www.example.com/en/blog/elounda-beaches/");
    const combined = await importSearchConsoleCsv({ rootDir: temp.rootDir, file: path.join(fixtures, "combined.csv"), property: "sc-domain:example.com" });
    assert.equal(combined.exportType, "combined");
    assert.equal(combined.records[0].query, "Παραλίες Ελούντα");
    assert.equal(combined.records[0].page, "https://blog.example.com/guide/");
  } finally { await temp.cleanup(); }
});

test("rejects required, malformed, incompatible, and unsafe input before writing output", async () => {
  const temp = await scratch();
  try {
    const malformed = path.join(temp.rootDir, "malformed.csv");
    await writeFile(malformed, "Query,Clicks,Impressions,CTR,Position\nbeaches,nope,10,10%,2\n", "utf8");
    await assert.rejects(importSearchConsoleCsv({ rootDir: temp.rootDir, file: malformed, property }), /Clicks.*number/);
    await assert.rejects(importSearchConsoleCsv({ rootDir: temp.rootDir, file: path.join(fixtures, "query.csv") }), /property is required/);
    await assert.rejects(importSearchConsoleCsv({ rootDir: temp.rootDir, file: path.join(fixtures, "query.csv"), property: "example.com" }), /property must be/);
    await assert.rejects(importSearchConsoleCsv({ rootDir: temp.rootDir, file: path.join(fixtures, "query.csv"), property: "sc-domain:example..com" }), /property must be/);
    await assert.rejects(importSearchConsoleCsv({ rootDir: temp.rootDir, file: path.join(fixtures, "page.csv"), property: "https://other.example/" }), /not compatible/);
    await assert.rejects(importSearchConsoleCsv({ rootDir: temp.rootDir, file: "../query.csv", property }), /remain under/);
    const missing = path.join(temp.rootDir, "missing.csv");
    await writeFile(missing, "Query,Clicks\nbeaches,1\n", "utf8");
    await assert.rejects(importSearchConsoleCsv({ rootDir: temp.rootDir, file: missing, property }), /missing required columns/);
    const malformedDate = path.join(temp.rootDir, "malformed-date.csv");
    await writeFile(malformedDate, "Query,Clicks,Impressions,CTR,Position,Date\nbeaches,1,10,10%,2,2026-02-30\n", "utf8");
    await assert.rejects(importSearchConsoleCsv({ rootDir: temp.rootDir, file: malformedDate, property }), /Date must be ISO-8601/);
  } finally { await temp.cleanup(); }
});

test("treats URL-prefix path components as complete boundaries during compatibility validation", async () => {
  const temp = await scratch();
  try {
    const file = path.join(temp.rootDir, "outside-prefix.csv");
    await writeFile(file, "Page,Clicks,Impressions,CTR,Position\nhttps://example.com/blog-other/,1,10,10%,2\n", "utf8");
    await assert.rejects(importSearchConsoleCsv({ rootDir: temp.rootDir, file, property: "https://example.com/blog" }), /not compatible/);
  } finally { await temp.cleanup(); }
});

test("produces deterministic output and has no warning at the 90-day baseline boundary", async () => {
  const temp = await scratch();
  try {
    const file = path.join(temp.rootDir, "ninety-days.csv");
    await writeFile(file, "Query,Clicks,Impressions,CTR,Position,Date\na,1,10,10%,1,2026-01-01\nb,1,10,10%,1,2026-03-31\n", "utf8");
    const first = await importSearchConsoleCsv({ rootDir: temp.rootDir, file, property });
    const second = await importSearchConsoleCsv({ rootDir: temp.rootDir, file, property });
    assert.deepEqual(first, second);
    assert.equal(first.baseline.days, 90);
    assert.equal(first.baseline.warning, null);
  } finally { await temp.cleanup(); }
});

test("analyses processed evidence deterministically without changing Phase 1 scoring", () => {
  const dataset = {
    property,
    exportType: "combined",
    provenance: { sourceFile: "combined.csv", sourceFingerprint: "a".repeat(64), property },
    baseline: { startDate: "2026-05-01", endDate: "2026-05-30", days: 30, warning: "Baseline covers fewer than 90 days." },
    records: [
      { query: "elounda beaches", page: "https://example.com/en/blog/elounda-beaches/", clicks: 1, impressions: 150, ctr: 0.006667, position: 9 },
      { query: "spinalonga history", page: "https://example.com/en/blog/elounda-beaches/", clicks: 0, impressions: 120, ctr: 0, position: 11 },
    ],
  };
  const inventory = { articles: [
    { title: "Elounda beaches", route: "/en/blog/elounda-beaches/", internalLinks: [], keywords: ["elounda", "beaches"] },
    { title: "A guide to Spinalonga", route: "/en/blog/spinalonga-guide/", internalLinks: [], keywords: ["spinalonga"] },
  ] };
  const first = analyzeSearchConsole({ datasets: [dataset], inventory, options: { highImpressions: 100, nearRank: 12 } });
  const second = analyzeSearchConsole({ datasets: [dataset], inventory, options: { highImpressions: 100, nearRank: 12 } });
  assert.deepEqual(first, second);
  assert.equal(first.searchConsoleEvidence.baseline.warning, "Baseline covers fewer than 90 days.");
  assert.equal(first.opportunities.highImpressionLowClick[0].query, "spinalonga history");
  assert.ok(first.opportunities.nearRank.some((item) => item.query === "spinalonga history"));
  assert.equal(first.relationships.queryPages[0].existingPageFirst, true);
  assert.equal(first.relationships.queryPages.find((item) => item.query === "spinalonga history").possibleOverlap, true);
  assert.equal(first.gaps.status, "guarded: baseline warning");
  assert.equal(first.gaps.candidates.length, 0);
  assert.equal(first.internalLinkSuggestions[0].from, "/en/blog/spinalonga-guide/");
  assert.equal(first.internalLinkSuggestions[0].to, "/en/blog/elounda-beaches/");
  assert.match(searchConsoleMarkdown(first), /Baseline warning: Baseline covers fewer than 90 days\./);
  assert.equal("finalScore" in first.searchConsoleEvidence, false);
});

test("routes GSC commands with strict arguments and keeps status read-only", async () => {
  const temp = await scratch();
  try {
    await assert.rejects(runContentCli({ command: "gsc-import", argv: [], rootDir: temp.rootDir }), /requires --file and --property/);
    await assert.rejects(runContentCli({ command: "gsc-analyze", argv: ["--unknown"], rootDir: temp.rootDir }), /Invalid argument/);
    await cp(path.join(process.cwd(), "config"), path.join(temp.rootDir, "config"), { recursive: true });
    await mkdir(path.join(temp.rootDir, "src", "content", "blog"), { recursive: true });
    await writeFile(path.join(temp.rootDir, "src", "content", "blog", "elounda-beaches.md"), "---\ntitle: Elounda beaches\npubDate: 2026-01-01\ntags: [elounda, beaches]\n---\n\nA guide to [Spinalonga](/en/blog/spinalonga-guide/).\n", "utf8");
    const csv = path.join(temp.rootDir, "combined.csv");
    await writeFile(csv, await readFile(path.join(fixtures, "combined.csv"), "utf8"), "utf8");
    const imported = await runContentCli({ command: "gsc-import", argv: ["--file", "combined.csv", "--property", "sc-domain:example.com"], rootDir: temp.rootDir });
    assert.equal(imported.exportType, "combined");
    const analysis = await runContentCli({ command: "gsc-analyze", argv: ["--high-impressions", "10", "--near-rank", "10"], rootDir: temp.rootDir });
    assert.equal(analysis.schemaVersion, 1);
    assert.match(await readFile(path.join(temp.rootDir, "data", "content-intelligence", "search-console", "analysis.md"), "utf8"), /Search Console evidence analysis/);
    const processedDir = path.join(temp.rootDir, "data", "content-intelligence", "search-console", "processed");
    const before = await import("node:fs/promises").then(({ stat }) => stat(processedDir));
    const status = await runContentCli({ command: "gsc-status", argv: ["--json"], rootDir: temp.rootDir });
    const after = await import("node:fs/promises").then(({ stat }) => stat(processedDir));
    assert.equal(status.processedDatasets, 1);
    assert.equal(after.mtimeMs, before.mtimeMs);
  } finally { await temp.cleanup(); }
});
