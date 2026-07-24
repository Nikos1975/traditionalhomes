# Robots and Sitemap Verification

Audit date: 2026-07-24

Repository: `D:\_projects\_traditional-homes`

Audit worktree: `C:\Users\Nikos\.config\superpowers\worktrees\traditional-homes\robots-sitemap-verification`

Branch: `codex/robots-sitemap-verification`

Audited commit: `37fee169b2bb180ede72a8fed5daf94e8fca614d` (`origin/main` after PR #11)

Production host: `https://traditional-homes.gr`

Cloudflare Pages preview: `https://9cf4c2af.traditionalhomes.pages.dev`

## Executive Summary

- PR #11 was squash-merged as `37fee169b2bb180ede72a8fed5daf94e8fca614d`. Both Cloudflare Pages and Workers Builds succeeded for that commit. The two new legacy redirects are live, which independently confirms the production deployment.
- `npm ci`, `node --test` (57/57), and `npm run build` succeeded.
- The generated `robots.txt`, sitemap index, and child sitemap are well-formed and internally consistent.
- The sitemap index references one child file, `sitemap-0.xml`. That child contains 34 unique absolute HTTPS URLs.
- All 34 sitemap page URLs return direct `200` responses in the local Cloudflare Pages emulator and in production. The robots file, sitemap index, and child sitemap also return direct `200` responses.
- No redirect, `4xx`, `403`, or `5xx` sitemap entry was found.
- No user-agent-specific HTTP blocking or Cloudflare challenge was reproduced for a browser, Googlebot, Bingbot, or a generic SEO crawler. The exact Labrica/Labrika user-agent string could not be established from the repository, available logs, or public product documentation.
- Three generated test pages are deliberately `noindex` but are incorrectly included in the sitemap. This is a confirmed sitemap defect.
- The `www` host serves the same resources with `200` instead of redirecting to the canonical non-`www` host. This is a confirmed canonical-host configuration defect.
- Production `robots.txt` is modified by Cloudflare Managed `robots.txt`: Cloudflare prepends Content Signals and named AI-crawler groups to the repository file. This explains why production differs from local/preview and can explain a third-party parser warning, but it did not block Googlebot, Bingbot, or the generic crawler in these tests.

## Labrica Evidence Limitations

The Labrica export reported one robots error, three sitemap warnings, a `403` for `/en/`, and only one successfully crawled page. It did not include the exact robots rule or the exact sitemap warning rows. Because only one page was crawled, its aggregate counts are not a complete site audit.

The current sitemap has 34 page URLs plus one child-sitemap reference. That provides a plausible explanation for the export's “Number of items: 35.” The two physical sitemap files are `sitemap-index.xml` and `sitemap-0.xml`, which explains “Number of sitemap files found: 2.” A tool looking specifically for `/sitemap.xml` could report “Sitemap.xml file found: No” even though `robots.txt` correctly advertises `/sitemap-index.xml`.

The three live `noindex` URLs in the sitemap are a strong match for the reported count of three sitemap warnings, but the omitted Labrica rows prevent definitive attribution. The reported production `403` was not reproducible.

## robots.txt Verification

### Generated and preview file

Generated filename: `dist/robots.txt`

```text
User-agent: *
Allow: /

Sitemap: https://traditional-homes.gr/sitemap-index.xml
```

Verification:

| Check                           | Result                                                           |
| ------------------------------- | ---------------------------------------------------------------- |
| Local Cloudflare Pages response | `200`, `text/plain; charset=utf-8`, no redirect                  |
| Pages preview response          | `200`, `text/plain; charset=utf-8`, no redirect                  |
| User-agent groups               | One wildcard group                                               |
| `Allow: /`                      | Valid, harmless, and redundant because there is no disallow rule |
| Sitemap directive               | Absolute HTTPS URL; target returns direct `200`                  |
| Contradictory `Disallow`        | None                                                             |
| Encoding                        | UTF-8, no BOM                                                    |
| Line endings                    | Normal LF                                                        |
| Hidden characters               | None found                                                       |

No repository `robots.txt` edit is warranted.

### Production file

Production returns `200`, `text/plain; charset=utf-8`, with no redirect, UTF-8 encoding, LF endings, and no BOM. It is not byte-for-byte equal to the generated or preview file.

Cloudflare prepends a managed block containing:

- a wildcard group with `Content-Signal: search=yes,ai-train=no,use=reference` and `Allow: /`;
- `Disallow: /` groups for Amazonbot, Applebot-Extended, Bytespider, CCBot, ClaudeBot, CloudflareBrowserRenderingCrawler, Google-Extended, GPTBot, and meta-externalagent;
- the repository wildcard group and sitemap directive after the managed block.

The two wildcard groups both allow `/`; they are not contradictory. Unknown directives such as `Content-Signal` are not a search-crawler block, although third-party validators may report them as unrecognized syntax. Cloudflare documents that Managed `robots.txt` prepends its content to an existing file and notes that some tools may report newer Content Signals syntax: [Cloudflare Managed robots.txt](https://developers.cloudflare.com/bots/additional-configurations/managed-robots-txt/).

The managed block is a confirmed production configuration divergence, not a repository defect. Whether the AI-crawler exclusions are intended is an owner policy decision. This audit did not change Cloudflare settings.

## Sitemap Index Verification

Generated filename: `dist/sitemap-index.xml`

| Check                        | Result                                        |
| ---------------------------- | --------------------------------------------- |
| XML parsing                  | Passed using .NET `XmlDocument`               |
| Root element                 | `sitemapindex`                                |
| Root namespace               | `http://www.sitemaps.org/schemas/sitemap/0.9` |
| Child references             | 1                                             |
| Referenced URL               | `https://traditional-homes.gr/sitemap-0.xml`  |
| Referenced local file exists | Yes, `dist/sitemap-0.xml`                     |
| Local response               | `200 application/xml`, no redirect            |
| Production response          | `200 application/xml`, no redirect            |
| Pages preview response       | `200 application/xml`, no redirect            |

## Child Sitemap Verification

Exact generated child filename: `dist/sitemap-0.xml`

| Check                          | Result                                        |
| ------------------------------ | --------------------------------------------- |
| XML parsing                    | Passed using .NET `XmlDocument`               |
| Root element                   | `urlset`                                      |
| Root namespace                 | `http://www.sitemaps.org/schemas/sitemap/0.9` |
| URL count                      | 34                                            |
| Duplicate `<loc>` values       | 0                                             |
| Non-absolute or non-HTTPS URLs | 0                                             |
| Wrong hosts                    | 0                                             |
| `www` URLs                     | 0                                             |
| `pages.dev` or localhost URLs  | 0                                             |
| Fragment URLs                  | 0                                             |
| Query-string URLs              | 0                                             |
| Local response                 | `200 application/xml`, no redirect            |
| Production response            | `200 application/xml`, no redirect            |

## Sitemap URL Validation

All 34 sitemap URLs have the correct HTTPS non-`www` host and trailing slash, match their generated and live canonical URL, and are allowed by the wildcard robots group. All return direct `200` responses in production.

| Sitemap URL                                                                  | Status | Redirects | Canonical match | Indexable          |
| ---------------------------------------------------------------------------- | -----: | --------: | --------------- | ------------------ |
| `https://traditional-homes.gr/blog/`                                         |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/blog/areti-monastery-mirabello-crete/`         |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/blog/elounda-guide-style-1/`                   |    200 |         0 | Yes             | **No — `noindex`** |
| `https://traditional-homes.gr/blog/elounda-guide-style-2/`                   |    200 |         0 | Yes             | **No — `noindex`** |
| `https://traditional-homes.gr/blog/elounda-guide-style-3/`                   |    200 |         0 | Yes             | **No — `noindex`** |
| `https://traditional-homes.gr/blog/elounda-guide/`                           |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/blog/elounda-history-through-its-shoreline/`   |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/blog/elounda-salt-pans-and-poros-windmills/`   |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/blog/elounda-visitor-economy/`                 |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/blog/elounda-wartime-memory/`                  |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/blog/key-phases-in-elounda-hotel-development/` |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/blog/mavrikiano-distances-and-guide/`          |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/blog/walking-around-elounda/`                  |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/blog/welcome-to-elounda/`                      |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/`                                           |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/about/`                                     |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/contact/`                                   |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/faq/`                                       |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/guide/mavrikiano/`                          |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/guide/vrouchas/`                            |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/houses/`                                    |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/houses/argyro/`                             |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/houses/clio/`                               |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/houses/demetra/`                            |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/houses/efterpi/`                            |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/houses/erato/`                              |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/houses/kalliopi/`                           |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/houses/leonidas/`                           |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/houses/margarita/`                          |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/houses/monastiri/`                          |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/houses/penelope/`                           |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/location/`                                  |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/policies/`                                  |    200 |         0 | Yes             | Yes                |
| `https://traditional-homes.gr/en/villa/almond-tree-villa/`                   |    200 |         0 | Yes             | Yes                |

Totals:

- 34 sitemap URLs;
- 34 direct `200` responses;
- 0 redirects;
- 0 `4xx`;
- 0 `403`;
- 0 `5xx`;
- 34 matching canonicals;
- 31 indexable pages;
- 3 `noindex` pages unexpectedly included.

`priority`, `changefreq`, and `lastmod` are absent. No defect is assigned because these fields are optional and no reliable modification dates should be fabricated.

### Local Cloudflare Pages response matrix

The build was served with `wrangler pages dev dist --port 8788`, which applies the Cloudflare Pages static-asset and `_redirects` behavior.

| URL                                              | Status | Content-Type                | Redirect Count | Final URL |
| ------------------------------------------------ | -----: | --------------------------- | -------------: | --------- |
| `/robots.txt`                                    |    200 | `text/plain; charset=utf-8` |              0 | Same URL  |
| `/sitemap-index.xml`                             |    200 | `application/xml`           |              0 | Same URL  |
| `/sitemap-0.xml`                                 |    200 | `application/xml`           |              0 | Same URL  |
| `/blog/`                                         |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/blog/areti-monastery-mirabello-crete/`         |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/blog/elounda-guide-style-1/`                   |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/blog/elounda-guide-style-2/`                   |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/blog/elounda-guide-style-3/`                   |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/blog/elounda-guide/`                           |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/blog/elounda-history-through-its-shoreline/`   |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/blog/elounda-salt-pans-and-poros-windmills/`   |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/blog/elounda-visitor-economy/`                 |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/blog/elounda-wartime-memory/`                  |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/blog/key-phases-in-elounda-hotel-development/` |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/blog/mavrikiano-distances-and-guide/`          |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/blog/walking-around-elounda/`                  |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/blog/welcome-to-elounda/`                      |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/`                                           |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/about/`                                     |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/contact/`                                   |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/faq/`                                       |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/guide/mavrikiano/`                          |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/guide/vrouchas/`                            |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/houses/`                                    |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/houses/argyro/`                             |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/houses/clio/`                               |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/houses/demetra/`                            |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/houses/efterpi/`                            |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/houses/erato/`                              |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/houses/kalliopi/`                           |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/houses/leonidas/`                           |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/houses/margarita/`                          |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/houses/monastiri/`                          |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/houses/penelope/`                           |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/location/`                                  |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/policies/`                                  |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |
| `/en/villa/almond-tree-villa/`                   |    200 | `text/html; charset=utf-8`  |              0 | Same URL  |

## Generated Route Comparison

The Astro build generated 36 page outputs. The sitemap contains 34 of them.

| Classification                          | Count | Routes/evidence                                                                                |
| --------------------------------------- | ----: | ---------------------------------------------------------------------------------------------- |
| Included correctly                      |    31 | Generated, direct `200`, canonical match, indexable                                            |
| Unexpectedly included                   |     3 | `/blog/elounda-guide-style-1/`, `/blog/elounda-guide-style-2/`, `/blog/elounda-guide-style-3/` |
| Intentionally excluded generated output |     2 | `/` is a redirect-only root; `/404.html` is the noindex error page                             |
| Unexpectedly missing                    |     0 | No generated indexable route was missing                                                       |

Explicit exclusion checks:

| Route class                   | Result                                                                                |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| `/`                           | Excluded; generated stub is superseded by a `301` Pages redirect to `/en/`            |
| `/AGENTS/`                    | No generated route; no sitemap URL; Astro sitemap filter also excludes this pattern   |
| Draft blog articles           | `getStaticPaths()` excludes `draft: true`; no current content entry has `draft: true` |
| Redirect-only URLs            | All 27 `_redirects` source paths are absent from the sitemap                          |
| `/index.php/` legacy URLs     | Absent                                                                                |
| Nonexistent `/en/villa/`      | Absent                                                                                |
| Private parking detail URL    | `/en/houses/private-car-parking/` is absent                                           |
| `pages.dev` or localhost URLs | Absent                                                                                |
| Test/preview routes           | Three `elounda-guide-style-*` test routes are incorrectly included                    |

Repository evidence for the test-route defect is in `src/pages/blog/[...slug].astro`: `isEloundaGuideTest` recognizes the three route slugs and passes `noindex={isEloundaGuideTest}`, while the Astro sitemap filter excludes only `/` and `/AGENTS/`.

## User-Agent and Cloudflare Tests

The following paths were tested against production and the successful PR #11 Pages preview:

- `/en/`
- `/robots.txt`
- `/sitemap-index.xml`

Test agents:

- normal Chrome browser string;
- Googlebot;
- Bingbot;
- generic `SEOAuditCrawler/1.0`.

The exact Labrica/Labrika crawler string was not found in repository logs or public Labrika documentation, so no invented Labrica string was used.

All responses were served by `server: cloudflare`, included a Cloudflare Ray identifier, had zero redirects, and returned no `cf-mitigated` header or challenge page.

| Environment   | User agent          | `/en/`           | `/robots.txt`          | `/sitemap-index.xml` | Challenge/block |
| ------------- | ------------------- | ---------------- | ---------------------- | -------------------- | --------------- |
| Production    | Browser             | 200 HTML, direct | 200 plain text, direct | 200 XML, direct      | No              |
| Production    | Googlebot           | 200 HTML, direct | 200 plain text, direct | 200 XML, direct      | No              |
| Production    | Bingbot             | 200 HTML, direct | 200 plain text, direct | 200 XML, direct      | No              |
| Production    | Generic SEO crawler | 200 HTML, direct | 200 plain text, direct | 200 XML, direct      | No              |
| Pages preview | Browser             | 200 HTML, direct | 200 plain text, direct | 200 XML, direct      | No              |
| Pages preview | Googlebot           | 200 HTML, direct | 200 plain text, direct | 200 XML, direct      | No              |
| Pages preview | Bingbot             | 200 HTML, direct | 200 plain text, direct | 200 XML, direct      | No              |
| Pages preview | Generic SEO crawler | 200 HTML, direct | 200 plain text, direct | 200 XML, direct      | No              |

Representative production Cloudflare Ray IDs from the final run ranged from `a2023eda2e905043-ATH` through `a2023f13ed9feecc-ATH`; preview IDs ranged from `a2023f14c99cd235-ATH` through `a2023f1e99147fd2-ATH`.

An additional request using `CloudflareBrowserRenderingCrawler/1.0` also received direct `200` responses for all three paths on production and preview. Production robots policy asks that crawler not to crawl, but it is an advisory robots rule, not an HTTP/WAF block.

Conclusion: the Labrica `403` was not reproduced and cannot currently be attributed to a Cloudflare user-agent rule. A transient request characteristic, IP reputation event, rate limit, or incomplete Labrica run remains possible, but there is no evidence here for a current crawler-wide block.

## WWW and Canonical Host Findings

| URL                                                  | Status | Redirects | Final URL      |
| ---------------------------------------------------- | -----: | --------: | -------------- |
| `https://traditional-homes.gr/robots.txt`            |    200 |         0 | Same URL       |
| `https://www.traditional-homes.gr/robots.txt`        |    200 |         0 | Same `www` URL |
| `https://traditional-homes.gr/sitemap-index.xml`     |    200 |         0 | Same URL       |
| `https://www.traditional-homes.gr/sitemap-index.xml` |    200 |         0 | Same `www` URL |
| `https://traditional-homes.gr/en/`                   |    200 |         0 | Same URL       |
| `https://www.traditional-homes.gr/en/`               |    200 |         0 | Same `www` URL |

The HTML served on the `www` page declares the non-`www` canonical, but the host does not redirect. The sitemap itself correctly contains only non-`www` URLs. Canonical tags mitigate duplication but do not constitute host consolidation.

This is a confirmed Cloudflare/DNS/host-routing configuration defect. It was not changed in this audit.

## Confirmed Defects

### 1. Three `noindex` test pages are included in the sitemap

Exact URLs:

1. `https://traditional-homes.gr/blog/elounda-guide-style-1/`
2. `https://traditional-homes.gr/blog/elounda-guide-style-2/`
3. `https://traditional-homes.gr/blog/elounda-guide-style-3/`

Evidence:

- all three are present in `sitemap-0.xml`;
- all three return direct `200`;
- all three have self-referencing canonical URLs;
- all three render `<meta name="robots" content="noindex">`;
- repository code explicitly identifies them as test pages.

Final repair decision: retain all three source files for internal reference and mark each one `draft: true`. The existing blog route generation already excludes drafts, so this removes the public routes and consequently removes them from the generated sitemap. No special sitemap-prefix exclusion is required. Do not remove `noindex` merely to make the sitemap warning disappear.

### 2. The `www` host is not permanently consolidated

Exact evidence:

- `https://www.traditional-homes.gr/en/` returns direct `200`;
- `https://www.traditional-homes.gr/robots.txt` returns direct `200`;
- `https://www.traditional-homes.gr/sitemap-index.xml` returns direct `200`;
- none redirects to `https://traditional-homes.gr/...`.

Disposition: address in a separate, explicitly approved Cloudflare canonical-host task. Do not mix it into the sitemap repair.

### Configuration divergence requiring owner confirmation

Cloudflare Managed `robots.txt` changes the production response and adds AI-crawler exclusions. This is confirmed behavior, but it is not classified as a defect without a policy decision. It did not reproduce the reported `403`.

## False Positives or Unsupported Warnings

- The repository and preview `robots.txt` are valid. `Allow: /` is harmless but redundant and should not be removed for style alone.
- The sitemap index and child XML are well-formed.
- The sitemap exists even though there is no file named exactly `/sitemap.xml`; the advertised index is `/sitemap-index.xml`.
- “Two sitemap files” is correct: one index and one child.
- “35 items” is consistent with one child reference plus 34 page URLs.
- No sitemap redirect, `4xx`, `403`, or `5xx` was found.
- No malformed URL, duplicate URL, fragment, query string, wrong host, `pages.dev`, or localhost URL was found.
- The precise Labrica robots error is unsupported because the export omitted the row. The production-only Cloudflare `Content-Signal` directive and merged groups are plausible parser-warning triggers, not proven matches.
- The exact Labrica user-agent was not publicly identifiable, so a Labrica-specific WAF conclusion is unsupported.

## Recommended Repair Scope

One narrowly scoped source PR is justified:

1. add `draft: true` to the three `elounda-guide-style-*` content files while preserving their complete contents;
2. rely on the existing draft filters for route generation, the blog index, and related posts;
3. verify the three routes are not generated and consequently do not appear in the sitemap;
4. preserve all 31 currently valid indexable sitemap URLs;
5. do not add a special sitemap-prefix exclusion;
6. do not edit `robots.txt`;
7. do not fabricate `lastmod`, `priority`, or `changefreq`;
8. do not combine the `www` host fix or Cloudflare Managed `robots.txt` policy with this PR.

Separately:

- decide whether Cloudflare Managed `robots.txt` and its AI-crawler policy are intentional;
- plan canonical-host consolidation as its own Cloudflare configuration task.

### Approved repair verification

The approved repair marks all three internal guide-style files `draft: true` without deleting or rewriting them. A clean Astro build confirms:

- none of the three test routes is generated;
- all three routes return direct `404` responses through the local Cloudflare Pages emulator;
- no test slug appears in generated blog-index or related-post HTML;
- no test slug appears in sitemap XML;
- the child sitemap contains 31 indexable URLs instead of the pre-repair 34;
- all ten published blog article routes remain generated;
- no special sitemap-prefix exclusion was added.

## No-Change Recommendation

No change is recommended for the repository `public/robots.txt`, sitemap XML structure, sitemap hostname, sitemap protocol, trailing-slash policy, or optional sitemap metadata.

Do not use a robots edit to address the unsubstantiated Labrica `403`. If that response recurs, capture the exact timestamp, user-agent, source IP/ASN, Cloudflare Ray ID, and matching Security Events entry before changing WAF or bot settings.

This report originated as an audit-only artifact and now records the approved repair disposition for the three internal test guides. No robots, sitemap configuration, canonical-host behavior, or Cloudflare setting change is part of that repair.
