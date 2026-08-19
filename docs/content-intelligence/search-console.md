# Search Console baseline workflow

Phase 2A imports manually exported Google Search Console CSV files and analyses them locally. It makes no network request, does not authenticate with Google, and does not change pages, titles, redirects, canonicals, or publication state.

## Privacy and storage

Search queries and performance measures can be sensitive. Keep source CSV files local in `data/content-intelligence/search-console/raw/`; that directory is ignored by Git except for its `.gitkeep` placeholder. Do not paste exports into issues, pull requests, or tracked documentation.

The importer writes a normalized, deduplicated processed dataset to `data/content-intelligence/search-console/processed/<fingerprint>.json`. This includes the supplied property, source filename, SHA-256 source fingerprint, dates where exported, and query/page performance data. Treat processed files and generated `analysis.json` / `analysis.md` as sensitive local analysis material too; review them before any sharing or commit.

## Import

Export a CSV from the intended Search Console property, then run this from the repository root:

```powershell
npm run content:gsc:import -- --file data/content-intelligence/search-console/raw/query-pages.csv --property sc-domain:traditional-homes.gr
```

`--file` and `--property` are both required. Relative files must stay under the repository root; an absolute path is also accepted. The property must be exact, with no leading or trailing whitespace, and must be either:

- a domain property such as `sc-domain:traditional-homes.gr`; or
- a URL-prefix property such as `https://traditional-homes.gr/` (including the relevant scheme, host and optional path).

For this repository the verified property is the domain property:

```text
sc-domain:traditional-homes.gr
```

Use that value in every project command unless `npm run content:gsc:properties` reports a different or additional property for the signed-in account. Do not assume a URL-prefix property exists for this site; confirm it from `content:gsc:properties` output before using one.

For page-bearing exports, every page must be compatible with that property. The CSV must contain `clicks`, `impressions`, `ctr`, and `position`, plus either a query or page column. A combined query-and-page export is preferred for relationship, overlap and internal-link review. If a `date` column is present it must use `YYYY-MM-DD`.

## Analyse and inspect

```powershell
npm run content:gsc:status
npm run content:gsc:status -- --json
npm run content:gsc:analyze
npm run content:gsc:analyze -- --high-impressions 100 --low-clicks 0 --near-rank 10
```

`content:gsc:status` lists the processed dataset count and filenames only. `content:gsc:analyze` reads every processed dataset together with the existing Phase 1 inventory and writes:

- `data/content-intelligence/search-console/analysis.json` — deterministic structured evidence;
- `data/content-intelligence/search-console/analysis.md` — a readable review summary.

The analysis records provenance and baseline details under `searchConsoleEvidence`. It provides leads for high-impression/low-click queries, near-rank queries, query-to-page relationships, possible topical overlap, existing-page-first review, guarded gap candidates, and possible internal links. These are review leads, not automated SEO decisions.

## Dataset compatibility (fail-closed)

`content:gsc:analyze` reads every processed dataset in the directory and analyses them together. Before any records are combined, the analyser validates that the whole set is safe to aggregate and throws a deterministic error if it is not. Nothing is written when validation fails.

A set of two or more datasets is rejected when:

- the datasets do not all carry the exact same Search Console `property` — `sc-domain:traditional-homes.gr`, `https://traditional-homes.gr/` and `https://www.traditional-homes.gr/` are separate evidence scopes even where their URLs overlap;
- a dataset's `provenance.property` contradicts its own `property`;
- the datasets do not all share the same `exportType` (`query`, `page` or `combined`) — the same clicks and impressions are reported in each shape, so mixing them double-counts;
- datasets acquired from the API declare different dimension sets;
- the same processed dataset is supplied more than once;
- any evidence period is unknown, for example a CSV exported without a `date` column — overlap cannot be ruled out, so the analysis fails closed;
- two evidence periods overlap by even one day, including the same period exported twice.

Compatibility is decided from property, export shape and evidence dates, not from source-file fingerprints: re-exporting the same period with different row ordering produces a different fingerprint and would otherwise be treated as new evidence.

Adjacent, non-overlapping periods from the same property and the same export shape may be combined, for example `2026-06-01 → 2026-06-30` with `2026-07-01 → 2026-07-31`.

To analyse a different property or a different export shape, move the other processed datasets out of `data/content-intelligence/search-console/processed/` first and analyse one compatible set at a time.

## Baseline limits

This is a single exported baseline, not a trend or period-over-period report. If there is no date column, the output warns that the baseline period is unavailable. If dated records cover fewer than 90 days, it warns that the baseline is short; gap candidates are then guarded. Page-level evidence is also required before gap candidates are produced.

Do not infer traffic growth or decline, indexation state, causal ranking changes, keyword cannibalisation, or a need to create, delete, redirect, retitle, or canonicalize a URL from this output. Preserve the generated provenance and compare like-for-like properties and date ranges before any later manual decision.

## Phase 2B boundary

Phase 2B may introduce a separately approved comparison workflow for repeated, equivalent exports and explicit historical snapshots. It must retain the raw-local privacy model, provenance, property and date-range checks, and human approval for any editorial or technical change. Phase 2A intentionally contains no scheduling, API connection, trend calculation, or automatic action; it takes no automatic action.
