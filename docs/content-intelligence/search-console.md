# Search Console baseline workflow

Phase 2A imports manually exported Google Search Console CSV files and analyses them locally. It makes no network request, does not authenticate with Google, and does not change pages, titles, redirects, canonicals, or publication state.

## Privacy and storage

Search queries and performance measures can be sensitive. Keep source CSV files local in `data/content-intelligence/search-console/raw/`; that directory is ignored by Git except for its `.gitkeep` placeholder. Do not paste exports into issues, pull requests, or tracked documentation.

The importer writes a normalized, deduplicated processed dataset to `data/content-intelligence/search-console/processed/<fingerprint>.json`. This includes the supplied property, source filename, SHA-256 source fingerprint, dates where exported, and query/page performance data. Treat processed files and generated `analysis.json` / `analysis.md` as sensitive local analysis material too; review them before any sharing or commit.

## Import

Export a CSV from the intended Search Console property, then run this from the repository root:

```powershell
npm run content:gsc:import -- --file data/content-intelligence/search-console/raw/query-pages.csv --property https://www.traditionalhomes.gr/
```

`--file` and `--property` are both required. Relative files must stay under the repository root; an absolute path is also accepted. The property must be exact, with no leading or trailing whitespace, and must be either:

- a URL-prefix property such as `https://www.traditionalhomes.gr/` (including the relevant scheme, host and optional path); or
- a domain property such as `sc-domain:traditionalhomes.gr`.

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

## Baseline limits

This is a single exported baseline, not a trend or period-over-period report. If there is no date column, the output warns that the baseline period is unavailable. If dated records cover fewer than 90 days, it warns that the baseline is short; gap candidates are then guarded. Page-level evidence is also required before gap candidates are produced.

Do not infer traffic growth or decline, indexation state, causal ranking changes, keyword cannibalisation, or a need to create, delete, redirect, retitle, or canonicalize a URL from this output. Preserve the generated provenance and compare like-for-like properties and date ranges before any later manual decision.

## Phase 2B boundary

Phase 2B may introduce a separately approved comparison workflow for repeated, equivalent exports and explicit historical snapshots. It must retain the raw-local privacy model, provenance, property and date-range checks, and human approval for any editorial or technical change. Phase 2A intentionally contains no scheduling, API connection, trend calculation, or automatic action; it takes no automatic action.
