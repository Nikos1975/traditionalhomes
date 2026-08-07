# Search Console Phase 2B Design

## Scope and boundary

Phase 2B adds an optional, local, read-only acquisition path alongside the existing Phase 2A CSV importer. It does not alter Phase 1 inventory, scoring, discovery, seasonal planning, video planning, the CSV importer, or analysis rules. The only module permitted to make network requests is the Search Console transport used by the new fetch and property-list commands.

The implementation will use the Search Console Sites `list` endpoint for available properties and Search Analytics `query` for rows. Both accept the `https://www.googleapis.com/auth/webmasters.readonly` scope. The API requires explicit inclusive `YYYY-MM-DD` start and end dates, and uses the supplied dimension order for each row's keys. [Sites API](https://developers.google.com/webmaster-tools/v1/sites/list) · [Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query)

## Proposed architecture

```text
CLI commands
  -> argument/property/date validation (no network)
  -> LocalUserAdcAuthProvider (local user ADC only)
  -> SearchConsoleTransport (the only network boundary)
  -> API response normalizer (pure)
  -> shared processed-dataset builder/persistence (local)
  -> existing gsc-analyze / gsc-status (local)
```

Implementation units:

- `gsc-auth.mjs`: an injectable `getAccessToken()` provider. Production resolves only the platform's local Application Default Credentials file created for a user and verifies it is an `authorized_user` credential. It requests only `webmasters.readonly`, never accepts a credential path/JSON/token CLI option, and redacts all credential-bearing error details.
- `gsc-transport.mjs`: injectable `listSites(accessToken)` and `querySearchAnalytics(accessToken, request)` functions. This is the only module allowed to call `fetch` and it talks only to `https://www.googleapis.com/webmasters/v3/`.
- `gsc-api-normalize.mjs`: pure validators and converters for property entries, request dimensions, API rows, dates, metrics, coverage, and stable fingerprint input.
- `gsc-dataset.mjs`: shared pure builder plus persistence adapter used by both API fetches and Phase 2A imports where their normalized fields overlap. It preserves existing CSV provenance fields and adds API-specific provenance without changing analysis inputs.
- `cli.mjs`: validates CLI syntax, coordinates the above interfaces, and does no direct authentication or HTTP work.

No `gcloud` executable is spawned or listed as a package/runtime dependency. A developer may create local user ADC with Google tooling outside the repository; that local credential file and its refresh token never enter repository paths, process output, config, fixtures, or LLM context.

## Authentication and property discovery

The production provider accepts only local user ADC. A missing, unreadable, non-user, expired/unrefreshable, or scope-insufficient credential produces a blocked authentication error and no dataset. Service-account key files, `GOOGLE_APPLICATION_CREDENTIALS`, repo configuration, and CLI credential arguments are unsupported and rejected/ignored by the acquisition path.

`properties` calls Sites `list`, validates every returned `siteUrl` as either a URL-prefix property or an `sc-domain:` property, and displays only property identifier plus permission level. It never displays tokens or query data.

`fetch` validates an explicitly supplied `--property` against the discovered list before making a Search Analytics request. It does not derive a property from a page, hostname, URL, or source file. If `--property` is omitted, it lists accessible properties and exits successfully without fetching. It therefore never auto-selects one property, including when several appear compatible. An explicit property that is syntactically invalid, absent from the Sites response, or rejected by Search Analytics is a failure, not an empty dataset.

## CLI contract

Existing Phase 2A commands remain unchanged.

```powershell
npm run content:gsc:properties
npm run content:gsc:properties -- --json

npm run content:gsc:fetch -- --property "sc-domain:traditional-homes.gr" --start-date 2026-01-01 --end-date 2026-03-31 --dimensions query,page
npm run content:gsc:analyze [-- --high-impressions N --low-clicks N --near-rank N]
npm run content:gsc:status [-- --json]
```

`content:gsc:fetch` accepts exactly these flags: `--property`, `--start-date`, `--end-date`, `--dimensions`, and optional `--row-limit`. The first four are required for a fetch. Dates must be real ISO dates, `start-date <= end-date`, and the inclusive requested range must be at most 365 days. `--dimensions` is a comma-separated ordered value that must be exactly one of `query`, `page`, `date`, `query,page`, `query,date`, or `page,date`; no other dimensions, repeated dimensions, filters, search types, aggregation controls, pagination controls, or implicit defaults are accepted. `--row-limit` is an integer from 1 to 25,000 and defaults to 25,000.

The command sends `type: "web"`, `dataState: "final"`, `aggregationType: "auto"`, and one request with the selected row limit. It does not fetch fresh/partial data, paginate, retry automatically, scrape, or call other Google APIs. Because Search Analytics can return only top rows, a successful result represents the API response for the recorded request, not a claim of exhaustive property traffic.

`content:gsc:status` remains read-only: it lists local processed metadata/counts and makes no authentication or network call. `content:gsc:analyze` remains local-only and reads both Phase 2A and Phase 2B processed datasets.

## API and local data contract

The API request is:

```json
{
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "dimensions": ["query", "page"],
  "type": "web",
  "dataState": "final",
  "aggregationType": "auto",
  "rowLimit": 25000
}
```

Each API row must contain a `keys` array whose length and order exactly match `dimensions`, plus finite non-negative `clicks`, `impressions`, `ctr` (0..1), and `position`. The normalizer maps `keys` to named fields, canonicalizes API page URLs through the existing property compatibility rules, computes deterministic metric rounding/deduplication, and rejects malformed rows or an invalid response shape. An absent/empty `rows` array is a valid empty result only after a successful, well-formed API response; the persisted dataset records `recordCount: 0` and remains analyzable only when combined with another non-empty dataset.

The persisted format remains Phase 2A-compatible:

```json
{
  "schemaVersion": 1,
  "property": "sc-domain:traditional-homes.gr",
  "exportType": "combined",
  "baselineOnly": false,
  "baseline": { "startDate": "2026-01-01", "endDate": "2026-03-31", "days": 90, "warning": null },
  "provenance": {
    "source": "google-search-console-api",
    "apiSource": "search-console-v3/searchAnalytics.query",
    "importedAt": "ISO-8601 timestamp",
    "coverageStart": "2026-01-01",
    "coverageEnd": "2026-03-31",
    "coverageDays": 90,
    "property": "sc-domain:traditional-homes.gr",
    "recordCount": 0,
    "dimensions": ["query", "page"],
    "requestFingerprint": "sha256"
  },
  "fingerprint": "sha256",
  "records": []
}
```

`fingerprint` is SHA-256 over a canonical stable object containing the schema version, source identifier, API source, property, requested coverage, dimensions, final-data request settings, row limit, and normalized sorted records. It deliberately excludes `importedAt` and credentials. Repeating the identical request with identical normalized rows reuses the same processed file and preserves its first `importedAt`; changed rows, dates, dimensions, property, or row limit create a distinct file. CSV imports retain `source: "google-search-console"` and their existing `sourceFilename`/`sourceFingerprint` provenance.

Coverage is the requested inclusive range, not an inference from returned date keys. The existing safeguard is retained: under 90 days is `baselineOnly: true`; 90 days or more is false; only Phase 2A datasets without date coverage are unknown and therefore true. One month is baseline evidence only. Analysis must retain the existing warning and must not introduce month-over-month, year-over-year, seasonality, annual projection, or acceleration conclusions.

## Privacy and failure behaviour

Raw exports, processed datasets, and generated analysis remain ignored by Git exactly as in Phase 2A. API responses are normalized directly to the private processed directory; raw HTTP payloads, response headers, access tokens, and user credentials are never persisted. Tests use hand-written synthetic response objects only.

Authentication failure, 401/403 permission failure, property absence/inaccessibility, 429 quota response, non-2xx API response, malformed JSON/rows, unsupported dimensions, invalid ranges, and invalid metrics fail with a bounded user-facing error category. They never create, overwrite, or return an empty valid dataset. A successful response with an explicit empty or absent `rows` list is the only path that persists an empty dataset.

## Test strategy

- Unit-test local ADC classification with injected filesystem/token clients; assert no token value appears in errors or logs and service-account/env credential paths are rejected.
- Unit-test the transport with injected `fetch` for Sites listing, encoded property paths, readonly authorization use, request body, 401/403/429/5xx mapping, malformed JSON, and no retries.
- Unit-test the pure normalizer for all six dimension combinations, key-order mapping, URL-prefix/domain validation, finite metrics, empty valid responses, date validation, deterministic sorting/deduplication, coverage, and fingerprints.
- Test persistence idempotence: equal synthetic responses preserve `importedAt`; a changed request/normalized response produces a different fingerprint; API and CSV provenance remain distinct.
- Extend CLI tests for strict flags, no-property discovery-only behavior, inaccessible property rejection before query, and `gsc-status` non-mutation/no-network.
- Keep existing Phase 2A and Phase 1 scoring tests unchanged; add a regression assertion that analysis accepts mixed CSV/API processed datasets but emits no comparison/trend fields.

## Self-review

Checked against the requested constraints: the API path is optional, local-user authenticated, scoped read-only, property-explicit, network-isolated, deterministic, private, and mockable. The CLI has no implicit date, dimension, or property selection; the data contract preserves Phase 2A provenance distinction and baseline behaviour. No scheduler, write endpoint, service account, API key, scraper, LLM, publishing path, or Phase 1 score change is proposed.

## Unresolved decisions

None. The deliberately bounded first implementation will not paginate; any separately approved pagination revision must add explicit truncation metadata without changing this contract.
