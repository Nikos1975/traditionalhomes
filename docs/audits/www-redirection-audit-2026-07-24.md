# WWW-to-Canonical Redirect Audit

Audit date: 2026-07-24

Repository: `D:\_projects\_traditional-homes`
Production host: `https://traditional-homes.gr`

## Final Result

**PASS — canonical-host consolidation is operating correctly.**

The Cloudflare rule redirects requests for `www.traditional-homes.gr` to the identical path on `traditional-homes.gr` with HTTP `301`. Normal website, blog, sitemap, and arbitrary nonexistent paths were verified. Tested query parameters are preserved.

`www /robots.txt` is the documented exception: Cloudflare Managed robots.txt returns a direct `200` response. This managed response does not alter the verified redirect behaviour of the other tested paths.

## Production Context

- PR #12 was squash-merged as `9f363529890ced38fce73c8f6d403efa632172a2`.
- The deployed Cloudflare dynamic redirect rule is named **Redirect www to canonical non-www**.
- The rule matches `(http.host eq "www.traditional-homes.gr")`.
- Its target expression is `concat("https://traditional-homes.gr", http.request.uri.path)`.
- Status code: `301`.
- Preserve query string: enabled.

## Raw curl Verification

| Requested www URL | Initial result | Canonical target / behaviour | Finding |
| --- | --- | --- | --- |
| `/en/` | `301` | Same `/en/` path | Pass |
| `/blog/` | `301` | Same `/blog/` path | Pass |
| `/sitemap-index.xml` | `301` | Same sitemap path | Pass |
| Arbitrary nonexistent path | `301` | Same arbitrary path, then canonical `404` | Pass |
| `/robots.txt` | `200` | Cloudflare Managed robots.txt response | Documented exception |

### Path and Query Preservation

The following raw-curl requests confirmed that the `Location` header retains the complete path and every tested query parameter:

- `/en/?source=www-test&campaign=canonical`
- `/blog/?source=www-test&campaign=verify`
- `/sitemap-index.xml?source=www-test`
- `/not-a-real-page?source=www-test&campaign=404`

The tested parameters were `source`, `campaign`, and `verify`; all were preserved.

## Cloudflare Managed robots.txt Exception

Cloudflare Managed robots.txt is enabled for the zone. Consequently, `https://www.traditional-homes.gr/robots.txt` returns its managed crawler-policy response directly rather than taking the redirect. This is an intentional Cloudflare-managed exception, not a canonical-host consolidation failure.

## Change Scope

No application source, DNS, sitemap configuration, or repository `robots.txt` configuration changed for this verification. The Cloudflare redirect, DNS, robots.txt, and sitemap configuration were not modified by this documentation task.

## Conclusion

- Canonical-host consolidation passes.
- Website, blog, sitemap, and arbitrary paths redirect correctly from www to the canonical host.
- Tested paths and all tested query parameters are preserved.
- `www /robots.txt` is a documented Cloudflare Managed exception.
- No application source, DNS, sitemap, or repository robots configuration changed.
