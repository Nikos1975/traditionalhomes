# Generated-site link validation

Run the production build before link validation:

```powershell
npm run build
npm run seo:links
```

`seo:links` serves `dist` from a temporary local server and runs Linkinator against that generated output. It follows internal links recursively, resolves Astro's extensionless output URLs, validates HTML fragments, treats HTTP links as errors, warns on redirects, and fails 4xx and 5xx responses. The local server avoids false `fetch failed` responses from Linkinator's built-in Windows directory server; it does not change the generated site.

The following narrow external exclusions are necessary because their bot protection returns 403 to automated requests. They remain normal user-facing links:

- `traditionalhomes.reserve-online.net` — booking engine; owner: WebHotelier.
- `iwm.org.uk` — Imperial War Museums article; owner: Imperial War Museums.
- `hospitalitynet.org` — Hospitality Net article; owner: Hospitality Net.

Do not exclude internal URLs. If a future external URL needs to be skipped because it is unreliable or inaccessible to automated checks, add a narrow exception and document the exact URL, reason, and owner in this file.
