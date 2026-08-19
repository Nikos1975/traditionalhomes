import assert from "node:assert/strict";
import test from "node:test";
import { analyzeSearchConsole, assertDatasetsAggregable } from "../scripts/content-intelligence/gsc-analysis.mjs";

const PROPERTY = "sc-domain:traditional-homes.gr";

const inventory = {
  articles: [],
  sitePages: [
    { route: "/en/", title: "Home", type: "homepage", published: true, seoEligible: true, keywords: ["elounda"] },
  ],
  redirects: [],
};

function dataset({
  property = PROPERTY,
  exportType = "combined",
  startDate = "2026-06-01",
  endDate = "2026-06-30",
  dimensions,
  fingerprint,
  sourceFilename,
  records = [{ query: "elounda", page: "https://traditional-homes.gr/en/", clicks: 1, impressions: 10, ctr: 0.1, position: 4 }],
} = {}) {
  const days = startDate && endDate
    ? Math.round((Date.parse(`${endDate}T00:00:00Z`) - Date.parse(`${startDate}T00:00:00Z`)) / 86400000) + 1
    : null;
  return {
    schemaVersion: 1,
    property,
    exportType,
    baselineOnly: true,
    complete: true,
    baseline: { startDate, endDate, days, warning: null, baselineOnly: true },
    provenance: {
      source: "google-search-console",
      property,
      coverageStart: startDate,
      coverageEnd: endDate,
      coverageDays: days,
      recordCount: records.length,
      ...(sourceFilename ? { sourceFilename } : {}),
      ...(dimensions ? { dimensions } : {}),
    },
    ...(fingerprint ? { fingerprint } : {}),
    records,
  };
}

const analyse = (datasets) => analyzeSearchConsole({ datasets, inventory });

test("accepts a single processed dataset", () => {
  const summary = assertDatasetsAggregable([dataset()]);
  assert.equal(summary.property, PROPERTY);
  assert.equal(summary.datasets, 1);
  assert.ok(analyse([dataset()]).relationships.queryPages.length > 0);
});

test("accepts a single dataset whose evidence period is unknown", () => {
  const summary = assertDatasetsAggregable([dataset({ startDate: null, endDate: null })]);
  assert.equal(summary.coverageKnown, false);
});

test("accepts two datasets with the same property, export type and non-overlapping periods", () => {
  const june = dataset({ startDate: "2026-06-01", endDate: "2026-06-30", fingerprint: "a".repeat(64) });
  const july = dataset({ startDate: "2026-07-01", endDate: "2026-07-31", fingerprint: "b".repeat(64) });
  const summary = assertDatasetsAggregable([june, july]);
  assert.equal(summary.datasets, 2);
  assert.equal(summary.coverageKnown, true);
  const result = analyse([june, july]);
  assert.equal(result.relationships.queryPages[0].impressions, 20);
});

test("rejects a domain property combined with a URL-prefix property", () => {
  const datasets = [
    dataset({ property: "sc-domain:traditional-homes.gr" }),
    dataset({ property: "https://traditional-homes.gr/", startDate: "2026-07-01", endDate: "2026-07-31" }),
  ];
  assert.throws(() => assertDatasetsAggregable(datasets), /different properties/);
  assert.throws(() => analyse(datasets), /different properties/);
});

test("rejects two different URL-prefix properties", () => {
  const datasets = [
    dataset({ property: "https://traditional-homes.gr/" }),
    dataset({ property: "https://www.traditional-homes.gr/", startDate: "2026-07-01", endDate: "2026-07-31" }),
  ];
  assert.throws(() => assertDatasetsAggregable(datasets), /different properties/);
});

test("rejects the same property with overlapping evidence periods", () => {
  const datasets = [
    dataset({ startDate: "2026-07-01", endDate: "2026-07-31" }),
    dataset({ startDate: "2026-07-15", endDate: "2026-08-15" }),
  ];
  assert.throws(() => assertDatasetsAggregable(datasets), /overlapping evidence periods/);
  assert.throws(() => analyse(datasets), /2026-07-15/);
});

test("rejects the same evidence period re-exported as a separate dataset", () => {
  const first = dataset({ startDate: "2026-07-01", endDate: "2026-07-31", fingerprint: "c".repeat(64), sourceFilename: "july.csv" });
  const reexported = dataset({ startDate: "2026-07-01", endDate: "2026-07-31", fingerprint: "d".repeat(64), sourceFilename: "july-reordered.csv" });
  assert.notEqual(first.fingerprint, reexported.fingerprint);
  assert.throws(() => assertDatasetsAggregable([first, reexported]), /overlapping evidence periods/);
});

test("rejects the identical processed dataset supplied twice", () => {
  const only = dataset({ fingerprint: "e".repeat(64) });
  assert.throws(() => assertDatasetsAggregable([only, only]), /supplied more than once/);
});

test("rejects mixed export types that would duplicate the same metrics", () => {
  const datasets = [
    dataset({ exportType: "query", startDate: "2026-06-01", endDate: "2026-06-30" }),
    dataset({ exportType: "combined", startDate: "2026-07-01", endDate: "2026-07-31" }),
  ];
  assert.throws(() => assertDatasetsAggregable(datasets), /different export types/);
  assert.throws(() => analyse(datasets), /double-counts/);
});

test("rejects datasets acquired with different dimension sets", () => {
  const datasets = [
    dataset({ startDate: "2026-06-01", endDate: "2026-06-30", dimensions: ["query", "page"] }),
    dataset({ startDate: "2026-07-01", endDate: "2026-07-31", dimensions: ["query", "page", "date"] }),
  ];
  assert.throws(() => assertDatasetsAggregable(datasets), /different dimensions/);
});

test("fails closed when a combined dataset has no recorded evidence period", () => {
  const datasets = [
    dataset({ startDate: "2026-06-01", endDate: "2026-06-30" }),
    dataset({ startDate: null, endDate: null, sourceFilename: "undated.csv" }),
  ];
  assert.throws(() => assertDatasetsAggregable(datasets), /date-range compatibility cannot be established/);
  assert.throws(() => analyse(datasets), /undated\.csv/);
});

test("fails closed when every dataset has an unknown evidence period", () => {
  const datasets = [
    dataset({ startDate: null, endDate: null }),
    dataset({ startDate: null, endDate: null }),
  ];
  assert.throws(() => assertDatasetsAggregable(datasets), /date-range compatibility cannot be established/);
});

test("rejects a dataset whose baseline and provenance coverage disagree", () => {
  const broken = dataset({ startDate: "2026-06-01", endDate: "2026-06-30" });
  broken.provenance.coverageEnd = "2026-07-31";
  assert.throws(() => assertDatasetsAggregable([broken]), /inconsistent coverage end dates/);
});

test("rejects a dataset whose provenance property contradicts its property", () => {
  const broken = dataset();
  broken.provenance.property = "https://traditional-homes.gr/";
  assert.throws(() => assertDatasetsAggregable([broken]), /does not match its dataset property/);
});

test("rejects an unrecognised export type", () => {
  assert.throws(() => assertDatasetsAggregable([dataset({ exportType: "trend" })]), /unrecognised export type/);
});

test("the guard runs before any records are flattened or aggregated", () => {
  let recordReads = 0;
  const backing = [{ query: "elounda", page: "https://traditional-homes.gr/en/", clicks: 1, impressions: 10, ctr: 0.1, position: 4 }];
  const poisoned = dataset({ startDate: "2026-07-01", endDate: "2026-07-31" });
  delete poisoned.records;
  Object.defineProperty(poisoned, "records", {
    enumerable: true,
    get() { recordReads += 1; return backing; },
  });
  const incompatible = dataset({ property: "https://traditional-homes.gr/" });
  assert.throws(() => analyzeSearchConsole({ datasets: [incompatible, poisoned], inventory }), /different properties/);
  assert.equal(recordReads, 1);
});

test("a rejected dataset set produces no analysis output at all", () => {
  const datasets = [
    dataset({ startDate: "2026-07-01", endDate: "2026-07-31" }),
    dataset({ startDate: "2026-07-10", endDate: "2026-08-10" }),
  ];
  let result = "unset";
  assert.throws(() => { result = analyse(datasets); });
  assert.equal(result, "unset");
});
