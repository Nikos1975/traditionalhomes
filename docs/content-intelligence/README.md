# Traditional Homes Content Intelligence

An offline, deterministic planning layer for article inventory, topic discovery, seasonal calendars and historical video plans. It runs before editorial approval and before the existing social workflow; it cannot publish, call social commands, use credentials, APIs, scraping, or LLMs.

## Commands

```powershell
npm run content:inventory
npm run content:discover -- --month 9
npm run content:seasonal -- --month 9
npm run content:video -- --slug spinalonga-why-fortified-changing-uses
npm run content:status
```

Configuration is non-secret JSON in `config/content-intelligence/`; generated review records remain in `data/content-intelligence/`. Scores weight local relevance (25), evidence (20), seasonal fit (15), content gap (20), visuals (10), and stability (10), then subtract explicit penalties. Phase 1 tracks configuration, examples and reviewed plans; it excludes credentials, private analytics, scraped media, transcripts and property-sale data. Phase 2 may add optional public-interest and platform imports; Phase 3 may use Traditional Homes performance metrics only.
