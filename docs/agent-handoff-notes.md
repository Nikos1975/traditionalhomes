# Agent Handoff Notes

### 2026-08-31 - GSC legacy mailto 5xx fixed in production (PR #84)

- Google Search Console reported the legacy Joomla `component/mailto` URL as a 5xx, so one exact permanent redirect to `/en/contact/` was added.
- PR #84 implemented the redirect at `32ce1e7021d64330452952de540f3f523c74866e`; merge commit: `81b8f15bb3c5eeccb83f8f5e43a20b31ed18f6f0`.
- Production verification on 2026-08-31: the exact GSC URL returned HTTP 301 to `/en/contact/` with its legacy query parameters preserved, then HTTP 200 after one redirect; no redirect loop or chain. `/en/contact/` has the self-canonical `https://traditional-homes.gr/en/contact/`.
- **FIXED IN PRODUCTION — Google recrawl/revalidation pending.**

### 2026-08-26 - RESUMED and completed: German non-blog site, ready for review (PR #80)

Supersedes the checkpoint entry below, which stays as the record of the pause. Nothing pushed, PR #80 not merged.

- Resumed from the checkpoint. Branch `feat/i18n-german-property-details`, PR #80 open and already targeting `main`.
- **Conflict resolution audited file by file, not taken on trust.** The `origin/main` merge produced three conflicts. For each one: `src/i18n/language-switcher.ts` and `tests/i18n-language-switcher.test.mjs` are add/add (absent at the merge base `80d7615`), `tests/i18n-german-route-pilot.test.mjs` is a content conflict. In all three, `origin/main`'s blob is **byte-identical** to the same file at `5e73dfb`, PR #79's tip — the squash commit introduced no change of its own — so `--ours` discarded nothing from main. Confirmed twice over: the merge result equals our pre-merge blob in every case, and the whole merged tree hash equals `98541a0`'s tree. `git diff --stat 5e73dfb 4423565` is empty.
- **Typecheck regression found and fixed during validation.** The first full run showed **7** errors, not the predicted 2: `FaqPage.astro` and `PoliciesPage.astro` indexed their typed copy objects with a plain `string` from the JSON `order` array, giving five `ts(7053)` implicit-any errors. Fixed by narrowing the order array once per component (`type CategoryId = keyof typeof copy.categories`, `type SectionId = keyof typeof copy.sections`) rather than loosening the types.
- **Documentation completed** (the outstanding item at checkpoint): `docs/architecture/repo-wireframe.md` and `.mmd` (four new shared renderers, the German cluster now covering the whole non-blog site), `docs/i18n/02_ROUTE_AND_FILE_STRUCTURE.md` (About/Contact/Faq/Policies renderers implemented; only the blog renderers remain proposals), and `docs/i18n/03_TRANSLATION_STATUS.md` (six status rows moved to Localized, the German cluster table extended to twenty routes, the slug rationale recorded, the `site-copy` presentation layer documented, and the "not yet German" paragraph reduced to the blog with the enforcing test named).

#### Full validation, all run after the final edit

| Check | Result |
|---|---|
| `npm test` | **414 tests, 413 pass, 1 fail** |
| `npm run typecheck` | **2 errors, 0 warnings, 3 hints** (161 files) |
| `npm run build` | **57 pages** |
| `npm run seo:links` | exit **0**, no findings |
| `git diff --check` | clean |

The single test failure is `warns when WebP is larger than a practical PNG source and accepts Windows source paths`, which asserts Windows backslash handling and cannot pass on Linux; it fails identically on unmodified `origin/main`. It should pass on Windows.

Typecheck difference against `origin/main`, per file rather than by count: `origin/main` has three errors — `src/components/UnitCard.astro` `ts(2339)`, `src/components/booking/BookingHandoffForm.astro` `ts(2322)`, and `src/pages/en/guide/mavrikiano.astro` `ts(2345)`. The first two are unchanged. The third is **gone** because that page moved onto the shared `GuidePage` renderer, which takes narrowed frontmatter through `guideFrontmatter`. That is a baseline improvement, not a regression, and no new diagnostic was introduced.

#### Locale contract, verified against the built site

Of the 20 German pages, the only internal `/en/` destinations reached from `/de/**` are `/en/blog/` (footer, every page) and `/en/blog/elounda-and-mirabello-bay/` (two contextual links) — the intended exception. Every other cross-locale link is a marked language-selector target. `tests/i18n-locale-leakage.test.mjs` enforces this and proves the exception is a route family, not a `/en/` prefix wildcard.

#### State at handover

37 files differ from the pushed head `98541a0`: 21 new, 16 modified. Not committed on the Windows worktree, not pushed, PR #80 untouched.

Remaining: commit, push, rewrite the PR #80 description (it still claims a property-only scope), and verify the Cloudflare preview on desktop and mobile — the footer especially, plus the mobile menu, the language selector and long German labels.

### 2026-08-26 - CHECKPOINT: German non-blog site completion, work in progress (PR #80)

**Status: paused mid-task at the user's request. Nothing is broken, nothing is half-edited, nothing was pushed.**

- Objective: no `/de/**` page should send a visitor to an English internal page, with the blog as the one intentional exception. Follows the merged German property-detail work already on this branch.
- Branch `feat/i18n-german-property-details`. Local HEAD `a3b1bfc` — a merge commit that brings `origin/main` `4423565` into the branch. PR #80 is **open** and already targets **main**; no retarget was needed and none was made.
- The merge was necessary because PR #79 was squash-merged, so the branch and main had diverged at `80d7615`. `git merge origin/main` produced three add/add conflicts (`src/i18n/language-switcher.ts`, `tests/i18n-german-route-pilot.test.mjs`, `tests/i18n-language-switcher.test.mjs`). `origin/main`'s tree is byte-identical to `5e73dfb` (PR #79's tip), so all three were resolved with `--ours`; the merged tree hash equals `98541a0`'s tree exactly, i.e. the merge changed no file content. No force-push, no history rewrite.

#### Link audit that drove the work

All 15 German pages were scanned in the built output. Non-language-switcher `/en/` destinations reached from `/de/**` were: `/en/about/` (16), `/en/contact/` (31), `/en/faq/` (16), `/en/policies/` (31), `/en/policies/#access` (16), `/en/guide/mavrikiano/` (2), plus the blog (`/en/blog/` on every page and one contextual article link). No stale or broken links. `Hausordnung`, `Richtlinien` and `Barrierefreiheit` proved to be three labels for the **same** page, so one German policies page serves all three — no duplicates were created. The English FAQ page emits **no** FAQ structured data (`FAQPage` JSON-LD), so there was no schema to mirror.

#### Completed in this session

- Five new German routes, all declared in `src/i18n/route-map.ts`, none inferred from the English path: `/de/ueber-uns/`, `/de/kontakt/`, `/de/faq/`, `/de/richtlinien/`, `/de/reisefuehrer/mavrikiano/`. Slugs translate the *route id* the way `location`→`lage` does; `faq` stays `faq` for the same reason `villa` stays `villa`.
- Four new shared renderers — `AboutPage`, `ContactPage`, `FaqPage`, `PoliciesPage` in `src/components/pages/` — with the English routes reduced to thin wrappers, matching the existing `HouseDetailPage`/`VillaDetailPage`/`GuidePage` pattern. Mavrikiano moved onto the existing `GuidePage`, so both guides now share one renderer.
- `src/guides/de/Mavrikiano-Guide.md`: full German translation of the English master, tables and all. The open cross-language correction proposals recorded in `docs/i18n/03_TRANSLATION_STATUS.md` (Elounda Canal attribution, salt-pan dating, Gournia, Spinalonga admission prices, boat fares, bus service) were translated **as they stand**, per the documented contract that locales stay factually aligned until a correction is approved for every language at once.
- New locale resources: `en|de/about.json`, `en|de/faq.json`, `en|de/policies.json`, `en|de/contact.json`, wired through `src/i18n/translate.ts` with `getAboutCopy`/`getFaqCopy`/`getPoliciesCopy`/`getContactCopy`.
- New `src/i18n/site-copy.ts` + `src/i18n/locales/de/site-copy.json`: the `inventory-display.ts` pattern applied to `src/data/siteCopy.json`, so check-in/out times, the pet and Wi-Fi rules, quiet hours, the cancellation reference and the access note stay a single factual source and German only presents them. No second German copy of a policy fact.
- Contact security preserved exactly: one `action="/api/contact"`, the honeypot, `required`/`minlength`/`maxlength`, the Turnstile widget and all three callbacks, and the submit-gating logic are unchanged and locale-independent. `functions/api/contact.js` untouched. Only presentation strings were localized, including the ones previously hardcoded inside the inline script (`Sending...`, the success panel, the error fallback), now passed via `define:vars` so German success and error states render in German. Form field `name`/`value` attributes are byte-identical, so the API contract cannot shift.
- German primary navigation extended from `[Häuser, Lage]` to `[Häuser, Villa, Lage, FAQ, Über uns, Kontakt]` — the English set minus Blog, so every entry is a real German page. The footer needed no href change: its entries are authored English paths resolved through the route map.
- `public/llms.txt` now lists all 20 real German routes.
- New `tests/i18n-locale-leakage.test.mjs`: scans every built `/de/**` page and fails on any internal `/en/` link that is neither the marked language selector nor inside the blog route family — and the blog prefixes are derived from the route map rather than allow-listed, with a unit test proving `/en/`, `/en/faq/`, `/en/blogging/` and friends are **not** accepted. It also checks the reverse direction and that every German route the map declares has a generated page.

#### Verified state at checkpoint

- `npm run build`: **57 pages** (52 before this session, +5 as predicted).
- Link audit re-run on the built site: the **only** non-switcher `/en/` destinations left from `/de/**` are `/en/blog/` and `/en/blog/elounda-and-mirabello-bay/` — exactly the intended exception.
- Visible-language parity re-run across all 20 German pages against their English counterparts: clean. Four strings are shared by design and were added to the existing allow-list (`Pools`, `Name`, `Website`, and an email-address pattern) rather than granted a blanket exemption.
- Focused suites, all green: `i18n-locale-leakage` 5/5, `i18n-german-visible-language` 31/31, and `i18n-foundation` + `i18n-language-switcher` + `i18n-german-route-pilot` + `i18n-german-property-details` + `llms-txt` together **89/89**.

#### Not yet done

- Full `npm test`, `npm run typecheck`, `npm run seo:links`, `git diff --check`. Expect the typecheck baseline to move from **3 errors to 2**: moving `src/pages/en/guide/mavrikiano.astro` onto `GuidePage` removes the `ts(2345)` `Record<string, any>` error. That is a baseline improvement, not a regression — report the per-file difference against `origin/main` rather than the count alone.
- Documentation: `docs/architecture/repo-wireframe.md` / `.mmd`, `docs/i18n/02_ROUTE_AND_FILE_STRUCTURE.md` and `docs/i18n/03_TRANSLATION_STATUS.md` still describe the pre-session route set.
- Cloudflare preview verification (desktop + mobile, footer especially), which needs the branch pushed.
- Commit, push, and the PR #80 description rewrite — the description still claims a property-only scope.

#### Unresolved issues and decisions

1. **Push is blocked from the agent environment.** The cloud container's git proxy refuses `Nikos1975/traditionalhomes` ("not in this session's authorized repository set"), there is no `gh` CLI, and the GitHub API is gated. Read access works. **Nikos must run the commit, the push and the PR edit.**
2. **Stale `index.lock` still present** at `D:\_projects\_traditional-homes\.git\worktrees\_traditional-homes-german-properties\index.lock`. Every git command in that worktree fails until it is deleted. This is the first step on resume.
3. `src/pages/en/contact.astro`'s property `<select>` offers value `dimitra` labelled "House Dimitra", while `inventory.json` has slug `demetra` / name "House Demetra". Pre-existing; the value is submitted to the API, so it was left exactly as-is and the German label mirrors it ("Haus Dimitra"). Worth a separate decision.
4. The About page restates villa figures (230 m², five sleeping rooms, 9 m x 4 m pool) in prose in both locales. This follows the established precedent of the German property markdown masters — long-form prose restates facts per locale, structured display derives from inventory — but it is prose duplication either way.
5. `docs/i18n/03_TRANSLATION_STATUS.md` still carries a "Deferred: language switcher" section that PR #79 made stale. Left untouched deliberately.

## Resume Here

Everything below runs on Windows in `D:\_projects\_traditional-homes-german-properties`.

**Step 1 — unblock git (required first, one command):**

```
del "D:\_projects\_traditional-homes\.git\worktrees\_traditional-homes-german-properties\index.lock"
```

**Step 2 — confirm the state matches this note:**

```
git status
git branch --show-current          :: expect feat/i18n-german-property-details
git log -1 --oneline               :: expect the merge of origin/main into the branch
```

Expect 15 modified and 21 new files (36 paths) on top of `98541a0`.

**The merge of `origin/main` has not been applied on this machine.** It must be done, and the order matters: the delivered work touches two of the three files that conflict, so commit first, then merge.

```
git add -A
git commit -m "wip: checkpoint German i18n completion"
git fetch origin
git merge origin/main
:: three add/add conflicts are expected and are a squash-merge artifact only
git checkout --ours src/i18n/language-switcher.ts tests/i18n-german-route-pilot.test.mjs tests/i18n-language-switcher.test.mjs
git add src/i18n/language-switcher.ts tests/i18n-german-route-pilot.test.mjs tests/i18n-language-switcher.test.mjs
git commit --no-edit
```

`origin/main`'s tree is byte-identical to `5e73dfb`, so `--ours` discards nothing: verify with `git diff --stat HEAD^1 HEAD` — it must be empty.

**Step 3 — run the validation that was not reached:**

```
npm ci
npm test
npm run typecheck
npm run build
npm run seo:links
git diff --check
```

Expected: build **57 pages**; typecheck **2 errors, 0 warnings, 3 hints** (down from the 3-error baseline because the Mavrikiano guide moved onto the shared renderer — confirm the missing one is the `src/pages/en/guide/mavrikiano.astro` `ts(2345)` error and report the difference against `origin/main`). The only expected `npm test` failure on Linux is the Windows-path WebP test, which should **pass** on Windows.

**Step 4 — finish the documentation (not started):**

Update `docs/architecture/repo-wireframe.md` and `.mmd` (add the four new shared renderers and the five new German routes), `docs/i18n/02_ROUTE_AND_FILE_STRUCTURE.md` (About/Contact/Faq/Policies renderers are now implemented, not proposals) and `docs/i18n/03_TRANSLATION_STATUS.md` (German now owns 20 routes; only the blog remains English).

**Step 5 — commit and push (only after step 3 is green):**

```
git add -A
git status
git diff --cached --stat
git commit -m "feat(i18n): complete the German site outside the blog"
git push origin feat/i18n-german-property-details
```

**Step 6 — PR #80:** it already targets `main`; do not retarget and do not merge. Rewrite the description, which still claims a property-only scope, to cover: German property details, the five remaining non-blog German pages, the Mavrikiano guide, the locale-safe link audit, the intentional blog exception, the routing/SEO contracts, the validation results and the preview status.

**Step 7 — Cloudflare preview**, desktop and mobile: `/de/`, `/de/ferienhaeuser/`, one house, `/de/villa/almond-tree-villa/`, `/de/lage/`, `/de/ueber-uns/`, `/de/kontakt/` (submit the form once), `/de/faq/`, `/de/richtlinien/`, `/de/reisefuehrer/mavrikiano/`. Check the footer specifically, plus the mobile menu, the language selector and long German labels for overflow.

**Do not merge PR #80.**


### 2026-08-26 - German property detail layer completed (branch feat/i18n-german-property-details)

- Objective: give the remaining nine houses and Almond Tree Villa real German detail pages so the language selector resolves every property to its exact German equivalent, and the German property cards stop falling back to English.
- Branch `feat/i18n-german-property-details`, base `origin/feat/i18n-language-switcher` `5e73dfb`. Verified against the remote before editing: `refs/heads/feat/i18n-language-switcher`, `refs/pull/79/head` and the local branch head are all `5e73dfbe503c408c8121879413e988142f84e98e`, so the base is current and PR #79 is untouched.
- Content coverage, not more fallback logic. Nine German house markdown masters under `src/content/houses/de/` and `src/content/villa/de/almond-tree-villa.md`, plus German slug declarations in `src/i18n/route-map.ts`. `src/pages/de/ferienhaeuser/[slug].astro` needed no change: its `getStaticPaths` already asks `publicSlug('de', 'house', ...)`, so declaring the slug and shipping the content is what creates the route.
- German villa URL: `/de/villa/almond-tree-villa/`. "Villa" is the German generic noun as well, so `villa` declares `segments: { en: ['villa'], de: ['villa'] }` — a declared German segment, not an `/en/` → `/de/` substitution — and the property's proper name keeps its stable slug, exactly as `argyro` and `vrouchas` do.
- One new shared renderer was unavoidable. `src/pages/en/villa/[slug].astro` was a 300-line English-only page with hardcoded strings; it is now a thin wrapper over the new `src/components/pages/VillaDetailPage.astro`, alongside a new `src/pages/de/villa/[slug].astro`. `docs/i18n/02_ROUTE_AND_FILE_STRUCTURE.md` had already named `VillaDetailPage.astro` as the planned renderer. No per-locale fork; the house renderer was not touched beyond one line.
- Three English-only strings that blocked German were moved into locale resources: the shared-pool notice in `AtAGlance.astro` (`ui.property.detail.sharedPool`), the villa page copy (`detail.villa` in `properties.json`), and the villa SEO description sentence that was hardcoded inside `src/i18n/seo.ts` (`templates.villa.description`). English wording is unchanged in all three.
- Two real defects found and fixed while scaling: the sidebar "View" row in `HouseDetailPage.astro` fell back to the raw English inventory value for Demetra, Penelope, Erato and Kalliopi (no curated label existed), and the shared-pool notice in `AtAGlance.astro` derived the neighbouring property's visible name from its routing slug. Both now route through the locale's presentation of the authoritative factual value: the notice resolves `sharedPoolWith` against `inventory.json` and renders `unitName(locale, slug, name)`, so English shows the factual inventory name and German its established localized presentation, while the href stays route-derived.
- Facts stay in inventory. `src/i18n/locales/de/inventory-display.json` gained `view`, `parking`, `pets`, `kitchen`, `amenities` and `hardConstraints` for the nine houses and the villa. Every entry is presentation of an English factual string, list for list, with no number that is not in the English source. No German locale file declares `sleeps`, `bedrooms`, `bathrooms`, `areaSqm`, `floors` or `pool`.
- 81 gallery caption phrases added to `src/i18n/locales/de/gallery-tokens.json` so every image on the ten new German pages has natural German alt text instead of a token-by-token join. No image file was renamed and no asset was duplicated.
- Visible-language completeness re-audited empirically across all fifteen German routes: zero visible strings shared with the English counterpart outside the existing proper-name allow-list. `tests/i18n-german-visible-language.test.mjs` now derives its route pairs from the property ids, so a newly translated property cannot be added without being compared.
- Language selector: every one of the eleven properties now resolves to its exact equivalent in both directions, with `fallback: 'none'`. The parent and homepage fallback tiers are unchanged and still cover genuinely untranslated content (contact, FAQ, policies, about, the Mavrikiano guide, blog). Because no real page exercises the parent tier any more, `getLanguageSwitcherLinks` and `matchLocalizedPath` accept an optional route map — the same injectable-map pattern `resolveRoute` and its siblings already use — so both tiers stay under deterministic test coverage against a fixture rather than against a page that no longer exists.
- German cards: `UnitCard.astro` needed no change. With the routes declared, `resolveLocalizedLink` reports `isFallback: false`, so the "Details auf Englisch" label disappears by itself. The generic fallback mechanism is intentionally left in place. Verified against the built collection page: all eleven property cards link only to `/de/`, none carries `hreflang`, none carries the fallback label.
- SEO: self-referencing canonicals on both sides of all eleven new pairs, reciprocal `en`/`de` alternates plus `x-default` to English, and nothing else. The sitemap holds exactly fifteen German URLs, all built. `public/llms.txt` now lists all fifteen real German routes; the "other pages are English only" sentence was corrected to name the sections that really are.
- English master preserved. Compared the built English HTML page by page against a clean build of the base commit. Ten English files changed, all intentionally: the nine house pages and the villa page gained their hreflang alternates and their language-selector target moved from `/de/ferienhaeuser/` to the property's own German page. At visible-text level only two differences remain, both intended: `This property's` is now emitted as `This property&#39;s` because the string comes from JSON (same rendered text), and the shared-pool link on the Demetra and Penelope pages now reads the factual inventory name `House Penelope` / `House Demetra` instead of the routing slug `penelope` / `demetra` that CSS was capitalising.
- Validation in a clean Linux checkout with `npm install`: `node --test` 403 tests, 402 passing; `astro check` 3 errors, 0 warnings, 3 hints across 150 files; `npm run build` 52 pages; `npm run seo:links` exit 0; `git diff --check` clean.
- Baseline on the same machine from an unmodified `5e73dfb` worktree: `node --test` 371 tests, 370 passing; `astro check` 3 errors, 0 warnings, 3 hints across 147 files - the same three errors in the same three files; `npm run build` 42 pages. The single failure on both sides is `warns when WebP is larger than a practical PNG source and accepts Windows source paths`, which asserts Windows backslash handling and cannot pass on Linux. No new diagnostic and no new failure. 42 + 9 houses + 1 villa = 52; nothing else changed the route count.
- `npm run seo:links` again reports `[502] /` under this sandbox's egress proxy, which intercepts the loopback crawl. Bypassing the proxy for loopback makes it exit 0 with no findings. Re-run it on the workstation for an independent result.
- Not done here, by instruction: no commit, no push, no PR, no merge, no change to PR #79 or PR #78, no deployment, no Cloudflare, DNS, booking-provider or contact-backend change. German primary navigation was deliberately left as `Häuser` + `Lage`; adding the villa to it is a separate decision.
- Open items: `public/images/houses/erato/1024/EratoHouseElounda17-1024.webp` has no descriptive filename, so its English `alt` is the bare identifier `EratoHouseElounda17`; German maps it to the property's proper name `Haus Erato` rather than inventing a description. Fixing the English alt is a separate data task. The "Deferred: language switcher" section in `docs/i18n/03_TRANSLATION_STATUS.md` is stale since PR #79 and was left untouched here.

### 2026-08-25 - German Stage 4 reconciled onto current main (replaces PR #59)

- Objective: recover only the genuine Stage 4 delta and reconcile it onto today's `main`, without replaying Stage 3 (squash-merged as PR #58, commit `fd50f06`) and without regressing any work merged after it.
- Branch `agent/i18n-stage-4-german-reconcile`, base `origin/main` `649ecda` ("perf: add responsive Spinalonga inline images", #76). Old Stage 4 head `c101baf` on `codex/i18n-stage-4-german-core-cluster`, old base `eea07e6`.
- Recovered exactly four commits, cherry-picked in order onto fresh main: `08125d5` (shared page renderers + German core cluster), `3c07765` (unused imports), `436cadf` (visible German on the five German routes), `c101baf` (QA corrections). No Stage 3 content was replayed.
- Pre-flight blob comparison of all 53 Stage 4 files at `eea07e6` versus `649ecda`: 52 identical, one diverged (`public/llms.txt`). All four cherry-picks applied without a conflict; git's three-way merge resolved `llms.txt` correctly. Verified by hand afterwards: all thirteen blog entries added on main by #74 are intact, and the only change is the "Language versions" block, which now lists the four new German routes plus the Vrouchas guide. One global `llms.txt`, unchanged location.
- One reconcile-only commit follows the four: this entry, plus restoring `(PR #58)` on the Stage 3 Vrouchas-guide handoff entry. The Stage 4 branch had relabelled that entry `(PR #59)`; main's record is authoritative.
- No later main work was touched. The Stage 4 delta versus `origin/main` is byte-for-byte the same shape as the original delta versus its old base: 53 files, +3603/-1446. Responsive-image work, blog publication work, the editorial baseline, the ICM standard and every later fix are untouched.
- Architecture verified against the built site, not the source. Five German routes exist and only five: `/de/`, `/de/ferienhaeuser/`, `/de/ferienhaeuser/argyro/`, `/de/lage/`, `/de/reisefuehrer/vrouchas/`. Self-canonicals on all 42 pages. Reciprocal `en`/`de` hreflang plus `x-default` to English on exactly the ten pages that form five real equivalent pairs; pages without a German equivalent emit no alternates at all. No FR/RU/ZH/AR/HE directory, route or hreflang. Sitemap holds 40 URLs, all `https://traditional-homes.gr` with trailing slashes, excluding only `/404.html` and the noindex root redirect stub, with no fabricated `priority`, `changefreq` or `lastmod`.
- German visible language checked empirically: of 372 English dictionary leaves, the German overlay covers 356. Of the 17 that would fall back, the only ones that actually render on a German page are the brand name "Elounda Traditional Homes". The rest are the brand name, an email address, `/en/` and the SEO metadata for contact/FAQ/policies/about, which have no German route. No English UI string leaks into German, and no German string appears on an English page.
- Every English link on a German page carries `hreflang="en"`. No German URL is fabricated: `src/i18n/route-map.ts` declares German only for pages that exist, and `HouseDetailPage.astro` throws when a non-default locale has no content entry, so a German house route cannot render without German house content.
- English factual master preserved. Compared the built English HTML page by page against a clean `origin/main` build. After normalising the bundled CSS filename hash, 22 of 35 English pages and `/404.html` are byte-identical; the 13 that differ are exactly the pages the refactor touched. At text level the only differences are: the intended hreflang alternates on the five pages that now have German equivalents; `&` rendering as `&amp;` in "Location & Travel" on `/en/` (correct escaping, same rendered text); and paragraph whitespace inside one `<p>` on `/en/houses/`. No English wording, number, link or alt text changed.
- German Argyro content re-checked against the English master: 85 m2, sleeps 4, 2 bedrooms, built 1905, ten-minute walk, shared parking about 80 metres away for up to five cars, not step-free. No fact added, removed or corrected in German only.
- Validation, all in a clean Linux checkout with `npm ci`: `node --test` 361 tests, 360 passing; `astro check` 3 errors, 0 warnings, 3 hints across 145 files; `npm run build` 42 pages; `npm run seo:links` exit 0; `git diff --check` clean.
- Baseline comparison on the same machine, from an unmodified `origin/main` worktree: `node --test` 338 tests, 337 passing; `astro check` 3 errors, 0 warnings, 3 hints across 135 files - the same three errors in the same three files; `npm run build` 38 pages; `npm run seo:links` exit 0. The single test failure on both sides is `warns when WebP is larger than a practical PNG source and accepts Windows source paths`, which asserts Windows backslash path handling and cannot pass on Linux. No new diagnostic and no new failure was introduced.
- `npm run seo:links` reports `[502] /` under this sandbox's egress proxy, which intercepts the script's loopback crawl. Bypassing the proxy for loopback makes it pass on the branch and on unmodified `origin/main` alike. Re-run it on the workstation for an independent result.
- Not done here, by instruction: no push, no new PR, no merge, no change to PR #59, no deployment, no Cloudflare, DNS, booking-provider or contact-backend change.
- Still deferred from Stage 4 itself: the language switcher, the remaining nine houses, Almond Tree Villa, contact, FAQ, policies, about and the blog. Those links appear on German pages with their English URL and an explicit `hreflang="en"`.

### 2026-08-20 - German visible-language completeness review (PR #59)

- Audited the fully rendered HTML of all five German routes for visible English before scaling to more properties. No route, property or locale was added.
- Two independent audits back the result: an EN↔DE parity scan (a visible string identical on both the German page and its English counterpart is a suspect unless it is a proper name, brand, code or bare number) and an English-vocabulary scan of visible text and of `aria-label`, `alt`, `title` and `placeholder`. Both are clean; every remaining match is a proper name or a word German shares.
- Localized presentation, not facts. `src/inventory/inventory.json`, `src/data/locations.ts`, `src/inventory/groups.json` and `src/inventory/suggested-pairings.json` remain the single factual source. `src/i18n/inventory-display.ts` maps a locale's rendering of a descriptive value, keyed by the stable slug, id, or — new in this change — the exact English source string, so a line the factual source repeats across ten houses is translated once. The default locale always renders the factual value verbatim, so English cannot drift.
- Derived display strings that lived as English literals inside components moved into locale resources keyed by a stable semantic key, not by translated text: `ui.property.derived.layout`, `ui.property.derived.access` and `ui.property.derived.bathroom` in `common.json`, `detail.regionName` in `properties.json`, `map.heading` and `welcome.hostNames` in `location.json`, and four gallery caption templates in `ui.gallery`.
- Image captions: an authored alt is the English master and renders verbatim in English. Another locale renders the same picture through the shared gallery vocabulary in `src/i18n/locales/de/gallery-tokens.json` (`localizedAlt` in `src/utils/galleryHelpers.ts`), so a German page never falls back to an English caption. 38 phrases were added, including the Almond Tree Villa vocabulary, so the villa's future German page starts with natural captions.
- German wording QA: `Brotkrümelnavigation` → `Navigationspfad` (three files), `Gebietsführer` → `Reiseführer` (four strings), and awkward token-joined captions such as `Wohnbereich Raum Kamin` → `Wohnzimmer mit Kamin`.
- Three English defects introduced by the Stage 4 refactor were repaired at the same time, restoring the pre-refactor English output: the "How to arrive" paragraph on every English house page rendered empty (`propertyCopy.detail.arrivalInstructions` read from the wrong namespace); gallery thumbnails lost their `Select …` aria prefix and their authored `alt`; and the Erato and villa bathroom counts rendered as `1 Bath` / `2 Baths` instead of `1 bathroom` / `2 bathrooms`.
- New tests: `tests/i18n-german-visible-language.test.mjs`, 16 tests. Nine inspect generated HTML — the parity scan per route, the German rendering of inventory-derived descriptions and map cards, German gallery captions, and a guard that the English master wording is unchanged. Seven bind the German presentation mappings to the factual source: unknown slugs, invented numbers, list length, phrase keys that no longer exist in `src/data/locations.ts`, unknown location ids and pairing summaries, and a proper name a translation must not change.
- `src/i18n/translate.ts` now types a locale overlay as a deep partial. The previous `Partial<SourceDictionary>` cast produced two `astro check` errors as soon as a namespace was partially translated.
- Verified in a clean Linux checkout: `astro check` 3 errors, 0 warnings, 3 hints — the documented baseline. `npm run build` produced 41 pages. English output is unchanged: 34 of 36 pages are byte-identical after normalising Astro's scoped-style hashes and chunk names; `/en/location/` differs only by paragraph whitespace inside `<p>` and `/en/` only by `&` rendering as `&amp;`, both from Stage 4 and neither visible.
- Not verified here: `npm run seo:links` still fails with `[502] /` in this sandbox and fails identically on unmodified `origin/main`, because its loopback crawl is intercepted by the egress proxy. Re-run it on the workstation.
- Unchanged and deliberately so: routes, canonical and hreflang architecture, one global `/sitemap-index.xml`, one global `/llms.txt`, English fallbacks marked `hreflang="en"`, no new locales, no client-side translation runtime, no merge and no deployment.

### 2026-08-20 - German core cluster: shared page renderers and four reference routes (PR #59)

- Added `/de/`, `/de/ferienhaeuser/`, `/de/lage/` and `/de/ferienhaeuser/argyro/` on top of the existing `/de/reisefuehrer/vrouchas/`. Argyro is the reference house; the other nine houses and Almond Tree Villa are deliberately not localized yet.
- Extracted four shared page renderers into `src/components/pages/`: `HomePage`, `CollectionPage`, `LocationPage`, `HouseDetailPage`. Together with `GuidePage` these serve both locales. Every route file under `src/pages/` is now a thin wrapper that passes `locale` explicitly; no renderer reads `Astro.url`, `Astro.params` or `Astro.currentLocale` for locale.
- Made the components these four routes need locale-aware by adding an explicit optional `locale` prop defaulting to `defaultLocale`: `FilterBar`, `HouseGallery`, `MapPreview`, `MasterLocationMap`, `SinglePinMap`, `LeafletMap`, plus fallback-marking in `UnitCard` and `GroupCard`. `GalleryA` was deliberately left alone — no page renders it.
- Client-side payloads carry one locale only. Each page serialises the active locale's strings at build time; a test asserts the German page ships no English label values and the English page ships no German ones. No i18n client library was added.
- Every internal link resolves through the route map. German pages now link to German equivalents where they exist, and every remaining English link carries `hreflang="en"` — verified at zero unmarked fallbacks across all five German pages.
- New German locale resources: `home.json`, `location.json`, `properties.json`, `seo.json`, and additions to `forms.json`. `getPropertySeo` was templatized so the property description assembles from locale strings instead of hardcoded English.
- German long-form property copy lives in `src/content/houses/de/argyro.md`, a faithful localization of the English entry. `HouseDetailPage` requires a locale content entry for any non-default locale and throws otherwise, so a German route cannot exist without German content.
- English output preserved: 34 of 35 pages are byte-identical to `origin/main` after normalising Astro's scoped-style hash. The one difference is `/en/location/`, where paragraph whitespace inside `<p>` changed because the village paragraphs now render from an array; the text is identical.
- Verified in a clean Linux checkout: `node --test` 328 tests with 327 passing and the single pre-existing `warns when WebP is larger than a practical PNG source` failure that also fails on unmodified `origin/main` here. `astro check` 3 errors, 0 warnings — the same three unrelated errors — and 9 hints, up from 3 because the refactor left six imports unused. Those imports were removed in a follow-up commit, returning the baseline to 3 errors, 0 warnings, 3 hints. `npm run build` produced 41 pages. `git diff --check` passed. An independent walk of `dist` checked 2661 internal links with 0 broken targets, 0 broken fragments and 0 phantom locale links.
- Not verified here: `npm run seo:links` still fails with `[502] /` in this sandbox and fails identically on unmodified `origin/main`, because its loopback crawl is intercepted by the egress proxy. Re-run it on the workstation.
- Six existing test files were repointed at the shared renderers because the code they grepped moved: `i18n-foundation`, `i18n-german-route-pilot`, `home-hero`, `homepage-image-delivery`, `labrica-repair-batch-1`. All behavioural assertions were kept.
- Deferred: the language switcher. `routeLocales` already answers "does an equivalent exist in locale X", so it is a small component, not an architectural change.
- Remaining: nine houses, the villa, contact/FAQ/policies/about, blog. No merge, no deployment, no Cloudflare, DNS, booking-provider or contact-backend change.

### 2026-08-20 - German Vrouchas guide: faithful localization of the English master (PR #58)

- Replaced the Stage 3 German excerpt with a complete faithful localization at `/de/reisefuehrer/vrouchas/`. All seven sections and three subsections of `src/guides/Vrouchas-Guide.md` are present in German with the same facts, dates, distances, descriptions, historical statements, transport notes, itinerary, packing list and Spinalonga visitor information, including hours and prices.
- The governing rule is now recorded in `docs/i18n/03_TRANSLATION_STATUS.md`: English is the verified factual master, a locale carries the same facts, and a suspected error is raised as a cross-language correction applied to every locale at once rather than fixed in one language. An earlier draft of this page corrected several English claims in German only; that divergence was reverted.
- Twelve claims are listed there as proposed cross-language corrections and deliberately left unchanged in both languages, among them the 1903 colony start year (the repository register says 1904), Olous described as Minoan, the 1897-98 French canal attribution, "Venetian-era" salt pans, and the Spinalonga admission prices, where the Ephorate of Antiquities of Lasithi and the Ministry of Culture Odysseus page currently publish different figures.
- Only editorial deviation: the middle distance-table column header renders as "Beschreibung" rather than a literal translation of "National Geographic Style Description". That header is an internal authoring label; every description in the column is localized in full.
- German SEO: title `Vrouchas auf Kreta: Lage, Anreise & Tipps` (69 characters rendered, against 73 on the English page), H1 `Vrouchas auf Kreta: Lage, Anreise und praktische Informationen`, meta description 148 characters. No German `seo.json` was needed - the brand title template is shared.
- Added an optional `breadcrumbLabel` to guide frontmatter so a locale can carry a long SEO title without a long breadcrumb. It defaults to `title`, so the English page renders exactly as before.
- `public/llms.txt` gained one restrained `## Language versions` entry. One global file only; no per-language llms variants and no language-specific sitemap. The existing llms.txt test builds the site and resolves every listed URL.
- No structured data added: the repository has no JSON-LD anywhere, so there was nothing to localize, and no FAQPage markup was introduced.
- Route architecture unchanged. Internal ids stay stable; `/de/ferienhaeuser/`, `/de/lage/` and `/de/kontakt/` remain expressible in the route map but are deliberately not created.
- Verified in a clean Linux checkout: `node --test` 321 tests with 320 passing and the single pre-existing `warns when WebP is larger than a practical PNG source` failure that also fails on unmodified `origin/main` here. 33 tests in `tests/i18n-german-route-pilot.test.mjs`, including section-parity and fact-parity checks against the English master. `astro check` 3 errors, 0 warnings, 3 hints - unchanged. `npm run build` produced 37 pages. `git diff --check` passed. An independent walk of `dist` found 0 broken internal links and 0 broken fragments.
- Not verified here: `npm run seo:links` still fails with `[502] /` in this sandbox and fails identically on unmodified `origin/main`, because its loopback crawl is intercepted by the egress proxy. Re-run it on the workstation.
- Remaining: the proposed cross-language corrections need a decision. A language switcher, German SEO templates and any further German route are later stages. No merge, no deployment, no Cloudflare, DNS or email change.

### 2026-08-20 - i18n Stage 3: locale route map and German guide pilot

- Objective: prove the shared page-rendering and locale-routing architecture with one non-English route, without translating the site. Branch `codex/i18n-stage-3-german-route-pilot`, based on `de7bc95` (PR #57).
- Added `src/i18n/route-map.ts` as the single source of truth for public URLs. It separates stable internal identifiers (`guide` + `vrouchas`) from locale-specific public paths, so each locale may own its own route segments (`guide` vs `reisefuehrer`) and its own content slugs. Same-slug-across-locales is explicitly **not** assumed anywhere.
- Resolution is fail-closed: `resolveRoute` returns `null` for a locale with no page, `routePath` / `assertRoute` throw, and `routeAlternates` only lists locales that really render the route. No locale route, hreflang entry or sitemap entry can be produced for a page that does not exist.
- `src/i18n/routes.ts` keeps the low-level path primitive and its helpers now resolve through the route map; they fall back to the English URL instead of fabricating a locale URL. `Header.astro` and `Footer.astro` resolve their authored English hrefs through the map too, and tag cross-locale fallbacks with `hreflang`.
- Extracted `src/components/pages/GuidePage.astro`, the first shared page renderer. `src/pages/en/guide/vrouchas.astro` and the new `src/pages/de/reisefuehrer/vrouchas.astro` are thin wrappers that pass locale and internal id explicitly. The renderer never reads `Astro.url`, `Astro.params` or `Astro.currentLocale`.
- `src/i18n/translate.ts` now deep-merges a partial `de` overlay over the complete English dictionary, so a missing German string resolves to English by documented design rather than by accident. `hasTranslations` exposes that state. `defaultItemName` (analytics) and `chatPopupEmail` are deliberately left untranslated.
- German content is bounded: `src/guides/de/Vrouchas-Guide.md` carries the access note, the distance table with identical figures, and a pointer to the full English guide. No long-form editorial was machine-translated and no claim was expanded. No inventory fact was copied into any locale file.
- Added `src/guides/frontmatter.ts` to narrow markdown frontmatter once at the route boundary. This removed the pre-existing `src/pages/en/guide/vrouchas.astro` typecheck error as a by-product of the refactor. `mavrikiano.astro` was deliberately left alone.
- English output is preserved: 34 of the 35 pages built from `origin/main` are byte-identical, and the pilot page differs only by three added `rel="alternate"` links plus whitespace. The only other delta is a Vite shared-CSS chunk rename (`about.*.css` to `vrouchas.*.css`) whose bytes are identical (md5 `f66cdf4f...`).
- Verified in a clean Linux checkout: `node --test` 314 tests, 313 passing, with the single pre-existing `warns when WebP is larger than a practical PNG source` failure that also fails on unmodified `origin/main` here. 26 new tests in `tests/i18n-german-route-pilot.test.mjs`. `astro check` 3 errors, 0 warnings, 3 hints, down from the 4-error baseline and with no new diagnostics. `npm run build` produced 37 pages. `git diff --check` passed.
- Three existing source-shape assertions were updated because the code they grepped moved: two in `tests/i18n-foundation.test.mjs` and one in `tests/blog-en-route-migration.test.mjs`. All behavioural assertions in those files were kept and still pass.
- Not verified here: `npm run seo:links` fails with `[502] /` in this sandbox and fails identically on unmodified `origin/main`, because its loopback crawl is intercepted by an egress proxy; the crawl aborts at the seed URL and validates nothing. As a substitute, an independent walk of `dist` checked 2260 internal links and assets with 0 broken targets and 0 broken fragments. Re-run `npm run seo:links` on the project workstation.
- Remaining: language switcher, German SEO templates, migrating `navigation.json` / `common.json` link entries from authored hrefs to route ids, and any further locale. RTL routes for `ar` / `he` are still not introduced; their `dir: 'rtl'` configuration is unchanged and asserted by test.
- Not done: no merge, no deployment, no public content change, no Cloudflare, DNS or email change. `functions/api/contact.js`, booking handoff and inventory are untouched.

### 2026-08-19 - Blog route casing in the content-intelligence inventory (PR #56)

- Closed the defect found by the real Search Console smoke test. Astro's content loader slugs each blog entry id from the source filename, so `src/content/blog/Mavrikiano-Distances-And-Guide.md` publishes at `/en/blog/mavrikiano-distances-and-guide/`. `deriveRoute` used the raw filesystem basename, so the inventory recorded `/en/blog/Mavrikiano-Distances-And-Guide/` and the live production page was reported as `existingPageFirst: false` with `existingPage: null`.
- `deriveRoute` now canonicalises the blog slug (trim, whitespace to hyphen, lowercase) before building the route, and authored blog internal links have the same slug canonicalisation applied without altering any other part of the link. No other URL is lowercased. `article.slug` deliberately remains the on-disk basename so `createVideoPlan` can still read the source file on a case-sensitive filesystem.
- The same canonical route now flows into `article.route`, the `sitePages` blog entry, internal-link source matching and Search Console `existingPageFirst` matching. Verified against the real build: all 34 published `sitePages` routes have a generated `index.html` in `dist`, where previously `/en/blog/Mavrikiano-Distances-And-Guide/` had none.
- The dataset aggregation guard, canonical-route re-aggregation, redirect-collapsed source merging, unmatched-route fail-closed opportunity filtering, ownership semantics and `MULTIPLE_RANKING_URLS` semantics are unchanged.
- Verified in a clean Linux checkout: sitewide tests 13/13, aggregation-guard tests 20/20, `node --test` 279 tests with 278 passing and the single pre-existing `warns when WebP is larger than a practical PNG source` failure that also fails on unmodified `origin/main` here. `astro check` 4 errors, 0 warnings, 3 hints at the same locations as `origin/main`. `npm run build` produced 36 pages. `git diff --check` passed.
- Note: the tracked generated artefacts `data/content-intelligence/inventory.json` and `inventory.md` are stale for the whole of PR #56 — they predate the `sitePages` block and still contain the old uppercase route. They were deliberately restored rather than regenerated in this commit; regenerating them with `npm run content:inventory` is a separate decision.
- Not verified here: `npm run seo:links` fails with `[502] /` in this sandbox and fails identically on unmodified `origin/main`, because its loopback crawl is intercepted by an egress proxy. Re-run it on the project workstation.

### 2026-08-19 - Search Console analyzer review repairs (PR #56)

- Closed review finding P1. `decorateQueryPages` resolved each raw `(query, page)` row to a `canonicalRoute` but never re-aggregated by it, so when several source URLs resolved to one production page only the highest-impression row reached ownership and opportunity analysis. Two cases were reproduced: 60 + 45 impressions on `/en/` were reported as 60, and a redirecting source outranking the live URL removed the query from every opportunity list. `mergeByCanonicalRoute` now merges rows by `(query, canonicalRoute)` before ownership, summing clicks and impressions, recomputing CTR from those sums, computing an impression-weighted position across contributors, retaining each contributing source route and URL with its own redirect flag and metrics, and marking the merged relation `redirected` only when every contributing source redirects. `MULTIPLE_RANKING_URLS` still means several distinct canonical production routes and is not raised by host variants collapsing to one route.
- Closed review finding P2. The inventory deliberately ignores wildcard rules such as `/blog/* /en/blog/:splat 301`, so a legacy `/blog/<slug>/` ranking URL resolves to itself, is not redirected, and had no production page — yet it passed the opportunity filter because `seoEligible` defaults to true for an unknown target. `primaryQueryPages` now also requires `existingPageFirst`. Such relations remain visible as evidence but never become high-impression, near-rank or internal-link leads. Wildcard redirect parsing was deliberately not implemented.
- Corrected the Markdown relationship line to show the redirect target whenever the reported source route differs from the canonical route, since a merged relation with one live contributor is no longer flagged `redirected`.
- The `assertDatasetsAggregable` guard was not weakened or redesigned. Added three hardening tests: a running-maximum overlap case (Jan 1–Mar 31, Feb 1–Feb 15, Apr 1–Apr 30), a later-range overlap behind a short intervening range, and three adjacent non-overlapping periods that remain aggregable.
- Verified in a clean Linux checkout: aggregation-guard tests 20/20, sitewide tests 9/9, `node --test` 275/276 with the single pre-existing failure `warns when WebP is larger than a practical PNG source and accepts Windows source paths`, which fails identically on unmodified `origin/main` in the same environment. `astro check` reports 4 errors, 0 warnings, 3 hints at identical locations to `origin/main`; no new diagnostics. `npm run build` produced 36 pages. `git diff --check` passed.
- Not verified here: `npm run seo:links` fails with `[502] /` in this sandbox and fails identically on unmodified `origin/main`, because its loopback crawl is intercepted by an egress proxy. It must be re-run on the project workstation.
- Remaining: no live Search Console acquisition was performed in this environment. P3 items logged as future work only — page-only exports analyse to an empty result with a misleading `gaps.status`, `npm test` rewrites the tracked `data/content-intelligence/inventory.json`, and a malformed `baseline` date silently falls back to `provenance` coverage. No merge, deployment or public content change was made.

### 2026-08-19 - Search Console aggregation safety (PR #56)

- Closed the P1 correctness defect carried from PR #49: `analyzeSearchConsole` flattened every processed dataset into one record pool before any compatibility check, so two exports could silently double-count clicks and impressions, distort impression-weighted average position, cross opportunity thresholds and create false gap candidates.
- Added `assertDatasetsAggregable` in `scripts/content-intelligence/gsc-analysis.mjs`, invoked before any flattening or aggregation. It is fail-closed: it rejects mixed Search Console properties, a provenance property that contradicts its dataset property, mixed `exportType` values, mixed API dimension sets, the same processed dataset supplied twice, any dataset whose evidence period is unknown when more than one dataset is supplied, and any overlapping evidence periods. Compatibility is decided from property, export shape and evidence dates, not from source-file fingerprints, because re-exporting one period with different row ordering produces a different fingerprint. Adjacent non-overlapping periods from one property and one export shape remain aggregable. Partitioned multi-property reporting was deliberately not implemented.
- Fixed a second defect in the PR #56 branch: when page-level evidence existed but every relation was redirected or SEO-ineligible, the opportunity source fell back to blended query-level metrics. The fallback now applies only when the evidence carries no page dimension at all, which is what the branch's own redirect test required.
- Corrected `docs/content-intelligence/search-console.md`: the worked examples used `https://www.traditionalhomes.gr/` and `sc-domain:traditionalhomes.gr`, neither of which is this project's property. The documented property is now `sc-domain:traditional-homes.gr`, with a note to confirm any URL-prefix property from `content:gsc:properties` before using one. Added a dataset-compatibility section.
- Verified in a clean Linux checkout: 18 targeted aggregation-guard tests pass; 52 content-intelligence tests pass; `node --test` reports 266/267 with the single failure `warns when WebP is larger than a practical PNG source and accepts Windows source paths`, which fails identically on unmodified `origin/main` in the same environment and is an image-encoder environment difference. `astro check` reports 4 errors, 0 warnings and 3 hints at identical locations on both `origin/main` and this branch, so no new diagnostics. `npm run build` produced 36 pages. `git diff --check` passed.
- Not verified here: `npm run seo:links` fails with `[502] /` on this branch and identically on unmodified `origin/main` in the same sandbox because its loopback crawl is intercepted by an egress proxy. It must be re-run on the project workstation.
- Remaining: no live Search Console acquisition was performed. The sandbox has no Google ADC and no route to the Search Console API, so `content:gsc:properties`, `content:gsc:fetch`, `content:gsc:status` and `content:gsc:analyze` against `sc-domain:traditional-homes.gr` are still outstanding and must run on the workstation. No merge, deployment or public content change was made.

### 2026-08-16 - Article visual-plan skill pilot

- Added a project-local planning-only skill for evidence-led article visuals, with a fixed `docs/research/blog/<slug>/visual-plan.md` contract and deterministic validator.
- Added a `visual-plan` Blog Orchestrator mode, lifecycle and operating-model documentation, and focused tests for text-only decisions, rights blockers, generated-image disclosure, downstream-action prohibition, and orchestration routing.
- The skill does not generate, process, insert, publish, deploy, post, or merge anything. A separate explicit approval remains required before the existing image pipeline may act.

### 2026-08-08 - Search Console Phase 2B

- Added local-user ADC Search Console property discovery and paginated Search Analytics acquisition.
- API datasets are normalized and persisted privately alongside CSV imports; acquisitions reaching the 100-batch safety cap are marked incomplete and analysis remains guarded.
- Added focused coverage for authentication redaction, transport behavior, property validation, one/multi-page pagination, cap truncation, persistence, CLI validation, and mixed CSV/API analysis.
- Remaining: run `gcloud auth application-default login --scopes=https://www.googleapis.com/auth/webmasters.readonly` locally before using live acquisition, if ADC is not already configured.


### 2026-08-08 - Search Console Phase 2B design only

- Added `docs/superpowers/specs/2026-08-08-search-console-phase-2b-design.md`: a self-reviewed, implementation-free specification for optional local-user-ADC Search Console acquisition. It fixes the read-only network boundary, explicit property/date/dimension CLI contract, processed-data provenance and fingerprints, privacy, failure semantics, and mocked test seams.
- No application code, dependency, credentials, configuration, dataset, analysis output, commit, push, or PR was created. Implementation requires separate user approval.

### 2026-08-07 - Content Intelligence Search Console Phase 2A

- Added `docs/content-intelligence/search-console.md` for the local-only CSV import, status and analysis workflow, including exact command/property contracts, raw-data privacy, outputs, provenance and baseline warnings, and the no-trends/no-automatic-action boundary.
- Documentation verification: command names, flags, property forms, output paths and baseline behaviour were checked against the Phase 2A CLI/import/analysis implementation. Phase 2B remains a separately approved historical-comparison workflow; no raw export or generated analysis was added to Git.

### 2026-08-06 - Spinalonga provisional article draft

- Added the review-stage historical article `src/content/blog/spinalonga-why-fortified-changing-uses.md`; its draft route will be `/en/blog/spinalonga-why-fortified-changing-uses/` when editorial approval changes `draft: true`.
- Added six cleared Nikos Pasparakis WebP photographs at `public/images/blog/spinalonga-why-fortified-changing-uses/`; the hero and four inline figures use explicit credit, and the boat figure is labelled as a modern view rather than historical evidence.
- Updated the controlled Spinalonga research records to replace the former drafting block with user-authorised provisional publication. The archive-acquisition tracker remains active and unsent; legal, numerical, local-mainland, medical and archival-image gaps remain open for a documented future revision.
- Pending: article validation, typecheck, build, link checks, rendered-route review, commit and fast-forward push to PR #46. No deployment, merge or change to PR #45 is authorised.

### 2026-08-03 - Elounda beaches publication PR

- Recorded the approved publication change for `src/content/blog/elounda-beaches.md`: `draft: false` with the existing `pubDate: 2026-08-03`. The public route is `/en/blog/elounda-beaches/`; its research packet and user-owned, approved image attribution remain unchanged.
- Added one reciprocal contextual link from `src/content/blog/elounda-and-mirabello-bay.md`. Article validation, 185 tests, production build (35 pages), generated-link validation, generated route, sitemap XML and image-path checks passed in a fresh temporary validation worktree because the normal worktree has an Administrator-owned stale `node_modules/.astro_locked_stage21` directory that prevents `npm ci`.
- Added the canonical article URL and concise factual description to the curated `public/llms.txt` discovery file. The rebuilt `dist/llms.txt`, sitemap index and child sitemap include the article as expected; the generated page has the canonical URL and no `noindex` marker. No submission was made to Google.
- Cloudflare Pages preview for the publication article passed at 390 × 844 and 1440 × 900; a new branch deployment will be checked after the `llms.txt` commit. The PR stays draft; explicit human merge approval remains required and no merge or production verification has occurred.

### 2026-08-03 - Elounda beaches draft: verified location links

- Added five coordinate-based Google Maps links to the draft article's “At a glance” table: Schisma, Chiona, Kolokytha, the main Plaka beach and the Phaea Blue sector. The four municipal beach pages supply the first four coordinate pins; the Phaea Blue pin uses the official Blue Flag sector marker near the Agia Marina church-side shoreline approach, not the hotel reception pin.
- Recorded the coordinates, source basis, confidence and scope limits in the existing source notes. The article remains `draft: true`; images and article wording are unchanged.

### 2026-08-03 - Elounda beaches draft: corrected Kolokytha image and editorial revision

- Selected the owner-supplied `kolokytha-beach-sandy-shore.png` as an inline image after visual inspection: the removed date stamp is absent and no retouching artefact is visible. The other corrected PNG retains a visible white retouching artefact and was excluded.
- The automated blog pipeline copied the selected PNG source and generated 480, 768, 1200 and 1600 px WebP outputs without upscaling. The Plaka/Spinalonga hero remains unchanged; the article now has three inline images (Kolokytha, public Plaka and Plaka shoreline).
- Revised visitor-facing wording only: retained the verified-local Kolokytha, Plaka and Phaea Blue boundaries while replacing internal verification language. The article remains `draft: true`; no publication, merge or PR-ready action is authorised.

### 2026-08-03 - Elounda beaches draft: owner local verification

- Created research branch `codex/elounda-beaches-research` from refreshed `origin/main` and scaffolded run `20260803T155017Z-elounda-beaches-81484e` at `docs/research/blog/elounda-beaches/`.
- Imported the ChatGPT and Gemini dossiers verbatim under `raw/`; SHA-256 checks matched the supplied Downloads files.
- Recorded owner-supplied local observations separately from web sources and marked operational details volatile. The packet now says Kolokytha is unorganised with a rough, mostly single-lane approach and uneven informal natural-ground parking; higher clearance is more suitable, without claiming an SUV is mandatory or ordinary cars cannot reach it.
- Corrected the distinction between the public, organised main Plaka beach and adjacent hotel-operated facilities. It also records that Phaea Blue adjoins the beach, operates facilities in its sector, and has an independent church-side shoreline approach; it makes no exclusive-private-shoreline or non-guest-facility claim.
- Drafted `src/content/blog/elounda-beaches.md` with `draft: true`, the approved title, a claim-coverage map, and the selected owner-authorised Plaka image derivatives. The draft uses the current evidence boundary: it does not state hotel guest policy, facility availability, lifeguards, accessibility, crowd or boat timing, fixed travel distances, or minor-cove directions.
- Verified: both JSON files parse; article validation, `npm test` (185 passing), production build (34 pages), generated-link validation, and `git diff --check` passed. Typecheck retains four unrelated existing errors and three hints, with none in the new article or image files. The draft is correctly omitted from the static build until editorial approval changes its publication state; current hotel policy, beach services, parking rules, road changes and footpath conditions remain volatile.

### 2026-08-03 - Agent-readable site index

- Replaced the existing static `public/llms.txt` with the approved UTF-8 Markdown index for Elounda Traditional Homes of Crete; no Astro route or generator was added.
- Added `tests/llms-txt.test.mjs`, which builds to an OS temporary directory and verifies the document contract, byte-for-byte generated output, canonical trailing-slash links, generated route targets, and absence of an HTML `/llms/` route.
- Verified in an isolated worktree: `npm ci`, `npm test` (185 tests), a 34-page temporary-output build, and `npm run seo:links` passed; no `/llms/` HTML route was generated. Typecheck retains the documented four unrelated errors and three hints, with no diagnostic in the new test. `robots.txt`, sitemap, redirects, Cloudflare configuration, and WebMCP remain unchanged.

### 2026-08-02 - Elounda geographic pillar first-stage internal links

- Goal: strengthen intentional internal links to and from `/en/blog/elounda-and-mirabello-bay/` without changing the established SEO architecture.
- Changed: `elounda-and-mirabello-bay.md`, `welcome-to-elounda.md`, `walking-around-elounda.md`, `elounda-history-through-its-shoreline.md`, `elounda-salt-pans-and-poros-windmills.md`, `/en/`, `/en/location/`, and `docs/seo/elounda-pillar-plan.md`.
- Retained the pillar URL; made no metadata, route, redirect, canonical, image, or publication-state changes.
- Validation: `git diff --check`, all five targeted blog validators, and `npm run seo:links` passed. `npm test` is not defined; `node --test` has one existing redirect-fixture mismatch. Build remains blocked by an existing Windows `dist` EPERM lock; typecheck is polluted by the protected untracked SEO audit package and has no changed-source diagnostic.
- Deferred: generated-page inspection after the Windows output lock is released; Search Console-led consolidation, title changes, claim remediation, redirects, and canonical changes remain out of scope.

### 2026-08-02 - Contact Turnstile Pages preview hostnames

- Turnstile hostname validation now normalizes Siteverify hostnames and accepts the production domains plus the Pages root and genuine `*.traditionalhomes.pages.dev` preview hostnames. Lookalike suffix/prefix domains remain rejected; the `contact` action check is unchanged.
- Added production, Pages root, hash-preview, branch-alias-preview, and lookalike hostname coverage. Preview deployments can now exercise the contact form before production merge.

### 2026-08-02 - Contact form Turnstile protection

- Added a managed Cloudflare Turnstile widget to the English contact form. Submission is disabled until it returns a token; errors and expiry are explained in plain language, and failed submissions reset the widget.
- The Pages Function now rejects honeypot, malformed, unapproved-property, missing-token, unverified-token, wrong-action, and wrong-hostname submissions before email delivery. Siteverify receives the configured secret, token, and CF-Connecting-IP when present; the existing Email Service REST flow is unchanged.
- Added Node test-runner coverage and an `npm test` script. Build passes; typecheck retains four unrelated errors in `UnitCard.astro`, `BookingHandoffForm.astro`, and both English guide pages.
- Remaining manual work: configure `PUBLIC_TURNSTILE_SITE_KEY` for the build and `TURNSTILE_SECRET_KEY` in Cloudflare Pages, then register the production hostnames in the Turnstile dashboard.

### 2026-07-28 - Social Publisher live layer

- Added the Facebook Page and Instagram Professional live-publishing layer on top of the local social core. It uses only configured numeric target IDs, an explicit Meta Graph version, injected HTTP clients, and no public endpoint, workflow, scheduler, dashboard, webhook, or other platform integration.
- Live publishing requires an approved matching fingerprint, `--confirm-live`, and `SOCIAL_LIVE_PUBLISHING=true`. The ledger is atomically moved to `publishing` before a POST; ambiguous POST results become `unknown` without a retry, while Facebook and Instagram states remain independent.
- Preparation now retains source-hero, Facebook, and generated 1080 × 1350 JPEG Instagram media records. Instagram fails closed unless its public HTTPS JPEG is no larger than 8 MB and within the permitted aspect-ratio range. Reconciliation performs GET-only confirmation and never creates a post.

### 2026-07-28 - Social Publisher Core v1

- Added a local-only Node social-publisher core for one published English blog article at a time. It derives canonical article and hero URLs from the existing `/en/blog/<slug>/` route convention, creates non-secret platform drafts, and writes one tracked ledger record per slug.
- Preparation is non-networked and unapproved by default. Approval requires an existing matching fingerprint, one named platform, and `--confirm`; it cannot publish or overwrite a terminal published platform record. No social API client, credentials, GitHub workflow, scheduler, analytics, article, or content-schema change was added.
- Verified: `git diff --check`, 134 Node tests, build, and generated-link validation passed. Typecheck retains four pre-existing unrelated errors and has no changed-file diagnostics.

### 2026-07-28 - English blog canonical migration

- Moved the only rendered blog routes to `src/pages/en/blog/`; `/blog/**` now redirects permanently to `/en/blog/**` through ordered Cloudflare Pages rules.
- Kept the 11 published article slugs and content intact, kept the three style variants as drafts, and moved all live internal blog links, canonicals, Open Graph URLs, navigation, 404, and Markdown cross-links to `/en/blog/**`.
- Added explicit locale blog route helpers and validator coverage that rejects legacy Markdown links while preserving `/images/blog/**` validation.
- No translated blog route, hreflang, language selector, RSS, category route, tag route, image replacement, or draft repair was added.
- Verified: 124 Node tests passed; build generated `/en/blog/` plus 11 article pages and no `dist/blog/**`; sitemap, canonical, `og:url`, generated-link validation, and all 11 article-validator runs passed. Cloudflare Pages preview verified `/blog`, `/blog/`, and every legacy article URL as one-hop 301 redirects to the exact `/en/blog/**` URL; all canonical pages returned 200; `/blog/nonexistent-slug/` redirected once and its canonical target returned 404.

### 2026-07-28 - Stage 2.1 locale route and count contracts

- Made `housePath` and `villaPath` require an explicit locale, and updated every existing caller to pass either its component locale or `defaultLocale`; English output remains under `/en/` and no translated routes were added.
- Added locale-owned complete property count templates with an `Intl.PluralRules` formatter. Property cards and detail facts now use complete messages; the existing `AtAGlance` `Bath`/`Baths`, Clio, Erato, and Almond Tree Villa wording is intentionally preserved.
- SEO copy, booking/contact flows, blog routes, hreflang, language selector, sitemap expansion, and locale content beyond English remain out of scope.

### 2026-07-28 - Stage 2 shared property UI extraction

- Extracted reusable English property-interface labels into `common.json` and wired the existing property cards and house/villa detail chrome to those values. Inventory facts, editorial prose, booking/contact flows, routes, and blog files remain unchanged.
- Reusable `AtAGlance`, `UnitCard`, and `GroupCard` components now accept an optional locale and resolve property UI copy from it; English routes continue to supply the default locale during this foundation stage.
- Documented the future translated-route contract: English remains `/en/`; `/blog/` remains unprefixed; route publication, hreflang, selector, and sitemap expansion need a separate approval; `GuidePage.astro` remains a later pilot.
- Source commit `fa1ed69` was used only as a donor patch on a fresh branch; its one-off group booking instruction was kept as component prose rather than added to locale resources.
- Verified in clean detached worktrees: 115 Node tests passed; build and generated-link validation passed; the candidate retains the base typecheck result of four unrelated errors and three hints. Representative English and unprefixed blog output is equivalent after normal HTML entity and whitespace serialization.

### 2026-07-27 - Chat popup static-load initialization

- Fixed the floating chat trigger so its idempotent initializer runs on ordinary static page loads and again on `astro:page-load` when client navigation is present. The popup remains localized, retains its mailto link and five-second dismissal, avoids duplicates, and updates `aria-expanded` while visible.
- Added generated-browser-script coverage for immediate initialization, repeat initialization, duplicate prevention, popup dismissal/reopening, localized popup markup, and unchanged mobile booking-bar setup.
- Physical-device review on a Xiaomi Redmi Note 14 Pro using Chrome on Android passed: one tap opened the localized popup above the mobile booking bar; the email link worked; repeated taps created no duplicates; five-second dismissal reset `aria-expanded` and allowed reopening; ARRIVAL, ADULTS, and CHECK remained usable; no horizontal overflow or visible browser error was observed.

### 2026-07-27 - Blog mobile swipe and article availability CTA

- Added pointer-event swipe navigation to the featured blog slider while retaining the existing buttons, thumbnails, counter, keyboard navigation, wrapping, reduced-motion rules, and no-autoplay behaviour. The featured stage uses `touch-action: pan-y`; a confirmed horizontal swipe must exceed a 48 px threshold and vertical movement, and only its immediately following article-link click is suppressed.
- Added the single shared availability CTA after rendered article content and before Related Reading. It links to `/en/houses/` and uses `siteCopy.bookingEngineUrl` for the external availability action. No article Markdown, frontmatter, publication state, i18n file, locale route, hreflang output, sitemap, or booking configuration changed.
- Added `tests/blog-ui-interactions.test.mjs`; `node --test` exited 0 with 111 passing assertions, including the existing i18n foundation suite. `git diff --check` passed.
- Corrected the CTA location wording to Mavrikiano only and added explicit slider-handler types for `nextIndex` and `PointerEvent`; focused tests cover both corrections.
- Clean validation at PR head `1119e6c9c91c48d54674a2a641a1a2915889523d` passed `npm ci`, `git diff --check`, `node --test` (111 passes), build, and generated-link validation. Typecheck has no changed-file diagnostics and retains only four existing errors plus two existing hints elsewhere in the repository. The lockfile audit reports 20 dependency vulnerabilities (2 low, 6 moderate, 12 high) for separate maintenance work.
- Generated output includes `/blog/`, 11 article routes, `/en/houses/`, and a sitemap; the CTA appears once on articles and never on the blog index. The successful Cloudflare Pages preview was reviewed with browser touch emulation at 390 × 844 and desktop viewports at 1440 × 900 and 1920 × 1080. No horizontal overflow or browser errors were observed; no physical touch device was used.
- Physical-device review on a Xiaomi Redmi Note 14 Pro using Chrome on Android (version not recorded): left and right featured-slider swipes, vertical scrolling, normal hero-link taps, post-swipe link suppression, arrows, thumbnails, article CTA appearance, both article CTA actions, and mobile layout/overflow passed. Earlier swipe and CTA failure reports were testing mistakes; no product issue was found.

### 2026-07-27 - Publication-gate hardening

- Hardened the existing publication skill from the verified publication acceptance case without adding an article-specific workflow or a second publication skill.
- The skill now requires clean dependency installation, detailed generated-route/XML-sitemap/robots checks, three viewport reviews, hero/network checks, Pages preview authority, structured PR evidence, explicit ready/squash approval, and separate production verification.
- No article, article frontmatter, research packet, image, route, sitemap or deployment configuration changed.

### 2026-07-27 - Blog lifecycle hardening

- Added canonical procedures for draft revision, read-only content audit, and controlled publication; the existing research and image skills remain the new-article and image-only procedures.
- Reduced `BLOG_ORCHESTRATOR.md` to mode routing and universal manual controls, and added `docs/operations/blog-lifecycle.md` as the concise human lifecycle.
- Added contract tests for five-mode routing, manual/no-auto-publication controls, publication gates, audit read-only default, draft preservation, and duplicate blog-skill prevention.
- No article, article frontmatter, research packet, public image, route, or publication state changed.

### 2026-07-27 - Elounda and Mirabello Bay publication

- Published `/blog/elounda-and-mirabello-bay/` after manual editorial approval.
- The article explains the official, settlement-level and broader geographic meanings of Elounda; Plaka remains correctly distinguished under the Local Community of Vrouchas.
- The article uses the approved Evangelos Mpikakis / Unsplash hero and retains linked attribution.
- Final article validation, Node tests, build, generated-link check and typecheck-baseline comparison were completed before merge; the generated output confirms the route and its metadata.
- The MDPI technical figure and Google Earth screenshot remain excluded.

### 2026-07-27 - Elounda and Mirabello Bay draft hero

- Added the approved Evangelos Mpikakis Unsplash photograph (photo ID `hmp9alkCaQw`) through the repository blog-image pipeline.
- Generated the 480, 768, 1200, 1600, and 2400 px WebP candidates and added the supported image, alt, caption, credit, and credit-URL frontmatter fields.
- The article remains `draft: true`; nothing was published or pushed.
- The original was verified at 2400 × 1350, 890,296 bytes, SHA-256 `E18B23C6B33E10529CBD44EB7FA82F717B5467B59055AB944524EBFBFB4C1562`.

### 2026-07-27 - Persistent blog orchestrator

- Added root `BLOG_ORCHESTRATOR.md` as the routing entry point for blog, guide, audit, publication, and blog-image work; it coordinates existing canonical rules without duplicating them.
- Added concise mandatory references from `AGENTS.md`, `CLAUDE.md`, and the blog research skill, and expanded new topic-brief scaffolds while preserving edited briefs during resume.
- The orchestrator uses a staged read model: a user topic may create a new scaffold before its research records exist, while existing-content work requires the available research record before edits or publication work.
- No articles, public images, routes, pages, validators, or publication state changed. Verified: 97 Node tests, build, generated-link validation, diff check, and the unchanged five-error/two-hint typecheck baseline.

### 2026-07-27 - Image pipeline PR acceptance fixes

- Added quality-76 defaults for `property-card`, `gallery`, and `social-image`; card and gallery still require explicit widths.
- `social-image` now requires exactly one width, positive height, and crop review; it uses cover resizing with a validated Sharp position (default `center`) and reports exact dimensions.
- Width parsing now rejects any malformed token, and lazy Sharp loading gives both image CLIs the stable missing-dependency error.
- Added focused regression coverage for defaults, width validation, social dimensions/validation, and missing-Sharp CLI behavior. No production images, AVIF, or migrations were added.

### 2026-07-27 - Reusable raster-image pipeline skill

- Added `.agents/skills/traditional-homes-image-pipeline/SKILL.md`, profile-driven WebP processing, structured reporting, and `npm run image:process` without production image migration or page changes.
- `npm run blog:image` remains unchanged and is regression-tested for CLI forwarding, slug handling, source copy, generated files, refusal behavior, warnings, and snippet output.
- Future work: use the skill for raster-image tasks; measure property-card/gallery rendered widths before assigning defaults.

### 2026-07-26 - Generated-site link validation

- Goal: add a repeatable link and fragment check for the built Astro site.
- Files changed:
  - `package.json`
  - `package-lock.json`
  - `scripts/validate-generated-links.mjs`
  - `tests/i18n-foundation.test.mjs`
  - `src/layouts/Base.astro`
  - `src/i18n/locales/en/seo.json`
  - `docs/operations/generated-site-link-validation.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added Linkinator as a development dependency and `npm run seo:links` for generated `dist` output.
  - The command recursively checks links, Astro clean URLs and fragments; requires HTTPS; warns on redirects; and treats 4xx/5xx responses as errors.
  - The default OG image now uses the existing brand hero image instead of the missing placeholder.
  - The only external exclusions are the bot-protected booking-engine domain and the two exact documented Imperial War Museums and Hospitality Net article URLs.
- Verified:
  - `node --test` passed: 72 tests, 0 failures.
  - `npm run build` passed.
  - `npm run typecheck` returned the expected baseline: 6 errors, 0 warnings, 3 hints.
  - `npm run seo:links` passed after fixing the OG fallback and using the generated-site server wrapper.
- Remaining:
  - None after the final verification commands complete.

Use this file when work becomes multi-step, paused, or important enough that another agent may need to continue it.

Keep notes short and factual. Do not duplicate every git diff. Record the decisions, current state, blockers, and the next useful action.

## Current Status

- Astro static website for Elounda Traditional Homes.
- Sitemap is configured with `@astrojs/sitemap`.
- Property page visual work has been adjusted recently: orange primary booking/rate buttons, green hover states, gallery button color changes, and mobile breadcrumb fixes.
- Content audit completed for house and villa pages in `docs/content-audit-property-pages-checklist.md`.
- Project-specific content audit skill added at `.agents/skills/property-content-audit/SKILL.md`.
- `AGENTS.md` and `CLAUDE.md` now include property-page source-of-truth and content workflow rules.

## Current Content Plan

- Fix factual blockers first:
  - Villa page has live placeholders and conditional draft copy.
  - Demetra has a bedroom-count mismatch between inventory and narrative copy.
- Then verify or remove unsupported square-metre and history claims.
- Then rewrite property pages for practical clarity: layout, sleeping arrangement, pool, view, parking, access, constraints, and who each property suits.
- Finally review SEO titles, descriptions, and repeated phrases across the collection.

## Handoff Template

When pausing or finishing a substantial task, add a dated note below with:

- Date
- Goal
- Files changed
- What was verified
- What remains
- Blockers or facts needing confirmation

### 2026-07-24 - Labrica repair batch 1

- Goal: repair only the two confirmed internal 404 links and two exact trailing-slash Joomla redirect gaps from the Labrica audit.
- Parking is a non-inventory map marker, so its invalid Details links are suppressed in both the location card and Leaflet popup data; its external Google Maps action remains.
- The Almond Tree Villa breadcrumb now links to the generated `/en/houses/` collection route.
- Added exact `301` rules for `/index.php/` to `/en/` and `/index.php/en/about-us-2/` to `/en/houses/`; the existing redirect table is snapshot-tested, with no wildcard, loop, or chain.
- Verified `node --test` passes 57 tests, `npm run build` builds 36 pages, and Cloudflare Pages local preview returns one-hop `301` responses with the exact targets and final `200` responses.
- `npm run typecheck` matches the starting baseline: the same 6 errors, 0 warnings, and 3 hints in unchanged files. No Labrica batch file adds a diagnostic.
- No robots, sitemap, host-consolidation, Apartments, metadata, content, performance, or dependency changes were made.

### 2026-07-22 - Reusable blog research workflow and Moni Aretiou draft

- Goal: add a controlled topic-to-draft-PR blog workflow and use Moni Aretiou as the first claim-reviewed article.
- Restored and tightened `.agents/skills/blog-research-article/SKILL.md`; `.ai/` remains the only canonical editorial folder.
- Added a test-covered article validator and `npm run blog:validate -- <article-path>`.
- Added `docs/research/elounda/moni-aretiou/source-notes.md` and the `draft: true` article `src/content/blog/areti-monastery-mirabello-crete.md`.
- Verified foundation/location, dedication, layout, 17th-century painting, 1821 destruction, and conservative restoration chronology against ecclesiastical and public sources. Omitted unsupported 1723, episcopal-seat, wartime-damage, elevation, opening-hours, and exact 1618 claims.
- No owned Moni Aretiou image was found. Five clearly licensed Wikimedia Commons candidates were compared; Jerzy Strzelecki's 4592 × 2398 exterior landscape (`Moni Areti (Crete)00(js).jpg`, CC BY-SA 3.0) was selected and processed with the existing blog-image script. The article uses `hero-1600.webp` with visible alt text, caption, linked photographer credit, licence, change disclosure, and share-alike notice; full candidate and file details are in `docs/research/elounda/moni-aretiou/source-notes.md`.
- Article validation, 25 tests, visual 16:9 browser review, and production build pass. The article remains `draft: true` and is absent from generated routes and the blog index. A clean detached `origin/main` worktree and this branch both report the same six Astro typecheck errors at the same files, lines, and error codes; this change introduces no new typecheck errors and does not modify the affected files. Manual work remains article and image approval, changing `draft` to `false`, draft-PR approval, and merge.

## Notes

### 2026-07-22 - Blog automation Phase 1A foundation

- Added ignored, resumable local blog-run state, safe scaffold/resume commands, read-only status reporting, overlap scoring, slug/overwrite safeguards, and Git-scope checks.
- Phase 1A correction: scaffolding now runs the article/research-topic overlap gate before writes, records required distinct angles, blocked resume restores the validated previous state, and status keeps self-match/simulation metadata outside external/schema-valid run data.
- Phase 1A changes only workflow tooling, tests, and documentation; articles, media, routes, deployment, validation expansion, publication automation, and rendered-output verification remain unchanged.
- Moni Aretiou is the read-only acceptance fixture. Verification results are recorded in the Phase 1A pull request.

### 2026-07-15 - Stage 2I shared UI label extraction

- Goal: extract shared English UI labels from Base, filter, gallery, and map components before adding non-English routes.
- Files changed locally:
  - `src/i18n/locales/en/common.json`
  - `src/i18n/locales/en/forms.json`
  - `src/layouts/Base.astro`
  - `src/components/FilterBar.astro`
  - `src/components/GalleryA.astro`
  - `src/components/gallery/HouseGallery.astro`
  - `src/components/maps/MapPreview.astro`
  - `src/components/maps/MasterLocationMap.astro`
  - `src/components/maps/LeafletMap.astro`
  - `src/components/maps/SinglePinMap.astro`
  - `tests/i18n-foundation.test.mjs`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added `common.ui.filters`, `common.ui.gallery`, and `common.ui.map` English label namespaces.
  - Added Base chat popup text to `forms.contact` and reused existing booking form labels in the mobile booking bar.
  - Wired only the requested shared UI surfaces to English i18n sources.
  - Left page body copy, contact page form copy, property detail labels, inventory facts, guide Markdown, `/blog/`, route folders, translations, and hreflang unchanged.
- Verified:
  - Targeted i18n test failed before the shared labels existed and passed after migration.
  - Full validation passed: `git diff --check`, `node --test tests/contact-function.test.mjs tests/i18n-foundation.test.mjs`, `npx tsc --noEmit`, and `npm run build`.
  - Generated checks passed for `/en/`, `/en/houses/`, `/en/houses/argyro/`, `/en/villa/almond-tree-villa/`, `/en/guide/mavrikiano/`, and `/blog/`.
  - Generated output did not contain `/en/blog/`, `/he/`, rendered hreflang links, or non-English route folders.
  - Contact form output still posts to `/api/contact`.
  - `npm run build` initially hit a Windows ACL/lock issue on stale generated `dist`; moving the stale generated output to `dist_locked_20260715_0831/` allowed a clean fresh build.
- Remaining:
  - Await approval before commit.
  - Extract property detail labels, contact page labels, and page body copy in later stages before public translated routes.
- Blockers:
  - The ignored `dist_locked_20260715_0831/` generated-output backup still has Windows ACL restrictions and could not be fully removed from this session.

### 2026-07-14 - Stage 2G dynamic SEO helper formatting

- Goal: move dynamic house, villa, and guide SEO formatting into helper functions without changing rendered English SEO output.
- Files changed locally:
  - `src/i18n/seo.ts`
  - `src/pages/en/houses/[slug].astro`
  - `src/pages/en/villa/[slug].astro`
  - `src/pages/en/guide/mavrikiano.astro`
  - `src/pages/en/guide/vrouchas.astro`
  - `tests/i18n-foundation.test.mjs`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added `getPropertySeo()`, `getVillaSeo()`, and `getGuideSeo()` as formatting-only helpers.
  - Updated the requested dynamic pages to call the helpers while keeping facts in inventory/frontmatter/page-local labels.
  - Left `/blog/`, route folders, translations, hreflang rendering, `Base.astro`, and contact behavior unchanged.
- Verified:
  - Targeted i18n test failed before helper implementation and passed after migration.
  - Full validation passed: `git diff --check`, targeted Node tests, `npx tsc --noEmit`, and `npm run build`.
  - Generated sample title, description, and canonical values for `argyro`, Almond Tree Villa, Mavrikiano guide, and Vrouchas guide matched the pre-change baseline.
- Remaining:
  - Await approval before commit.
- Blockers:
  - None currently.

### 2026-07-14 - Stage 2E static English SEO centralization

- Goal: centralize static English `/en/` page SEO titles and descriptions into the English i18n SEO source without changing rendered output.
- Files changed locally:
  - `src/i18n/locales/en/seo.json`
  - `src/i18n/seo.ts`
  - `src/pages/en/index.astro`
  - `src/pages/en/houses/index.astro`
  - `src/pages/en/location.astro`
  - `src/pages/en/contact.astro`
  - `src/pages/en/faq.astro`
  - `src/pages/en/policies.astro`
  - `src/pages/en/about.astro`
  - `src/data/siteCopy.json`
  - `src/types.ts`
  - `tests/i18n-foundation.test.mjs`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added page-level static SEO keys for existing low-risk English pages to `src/i18n/locales/en/seo.json`.
  - Added `getPageSeo()` in `src/i18n/seo.ts`.
  - Updated seven static `/en/` pages to read `title` and `description` from `seo.json`.
  - Removed the duplicate static SEO description fields from `src/data/siteCopy.json` and `SiteCopy`.
  - Left dynamic house/villa SEO, guide frontmatter SEO, `/blog/`, `404.astro`, and hreflang rendering unchanged.
- Verified:
  - Targeted i18n test failed before centralization because `seo.json.pages` was missing.
- Remaining:
  - Run full validation before approval or commit: `git diff --check`, targeted Node tests, `npx tsc --noEmit`, and `npm run build`.
- Blockers:
  - None currently.

### 2026-07-14 - Stage 2D SEO/hreflang readiness audit

- Goal: audit SEO/meta and hreflang readiness before adding localized route folders or translated content.
- Files changed locally:
  - `src/i18n/seo.ts`
  - `tests/i18n-foundation.test.mjs`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a pure `localizedHreflangAlternates()` helper that returns alternates only for explicitly supplied existing locale paths.
  - Added a regression test confirming hreflang helper infrastructure exists but `Base.astro` does not render alternate links yet.
  - Left `/blog/` SEO/canonicals untouched for the separate blog migration plan.
- Verified:
  - Targeted i18n test failed before the helper existed, then passed after adding it.
- Remaining:
  - Run full validation before commit approval: `git diff --check`, targeted Node tests, `npx tsc --noEmit`, and `npm run build`.
  - Do not render hreflang links until localized routes actually exist and blog migration rules are approved.
- Blockers:
  - None currently.

### 2026-07-14 - Add Hebrew to i18n target locale list

- Goal: add Hebrew for Israel to the approved i18n target locale metadata without translating content or creating `/he/` route folders.
- Files changed locally:
  - `src/i18n/config.ts`
  - `tests/i18n-foundation.test.mjs`
  - `docs/i18n/00_I18N_MASTER_PLAN.md`
  - `docs/i18n/01_TRANSLATION_STYLE_GUIDE.md`
  - `docs/i18n/02_ROUTE_AND_FILE_STRUCTURE.md`
  - `docs/i18n/03_TRANSLATION_STATUS.md`
  - `docs/i18n/04_QA_CHECKLIST.md`
  - `docs/i18n/prompts/translate-one-language.md`
  - `docs/i18n/prompts/codex-i18n-foundation.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added `he` to `supportedLocales` with native label `עברית`, `lang="he"`, `dir="rtl"`, and `ogLocale="he_IL"`.
  - Updated i18n planning docs, QA checklist, and prompts to include Hebrew as a future stable-slug RTL locale.
  - Did not create `/he/` routes or translate Hebrew content.
- Verified:
  - Targeted i18n test failed before config metadata was updated.
  - `node --test tests/i18n-foundation.test.mjs` passed after updating config and docs.
  - Full validation passed: `git diff --check`, `node --test tests/contact-function.test.mjs tests/i18n-foundation.test.mjs`, `npx tsc --noEmit`, and `npm run build`.
  - Generated output did not create `dist/he`; source routes did not create `src/pages/he`; `/en/`, `/blog/`, and contact form output remained present.
- Remaining:
  - Await approval before committing or pushing.
- Blockers:
  - None currently.

### 2026-07-14 - Stage 2C production smoke 404 fallback fix

- Goal: fix the production smoke issue where missing `/en/blog/` returned the root redirect stub as HTTP 200 before starting Stage 2D.
- Files changed locally:
  - `src/pages/404.astro`
  - `tests/i18n-foundation.test.mjs`
  - `docs/architecture/repo-wireframe.md`
  - `docs/architecture/repo-wireframe.mmd`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a static custom 404 page so missing locale-prefixed routes are not served the root `/` redirect stub.
  - Added a targeted i18n regression test requiring the explicit 404 page and preserving no `/en/blog/` route.
  - Left `/blog/`, `/`, existing `/en/` routes, and the contact form endpoint unchanged.
- Verified:
  - Regression test failed before `src/pages/404.astro` existed, then passed after adding it.
  - `git diff --check`, `node --test tests/contact-function.test.mjs tests/i18n-foundation.test.mjs`, `npx tsc --noEmit`, and `npm run build` passed.
  - Built output contains `dist/404.html`, `dist/blog/index.html`, and `dist/en/index.html`; does not contain `dist/en/blog`; root `dist/index.html` still redirects to `/en/`; contact page output still posts to `/api/contact`.
- Remaining:
  - Deploy through the normal approved process, then repeat the production smoke check for `/en/blog/`.
  - Do not start Stage 2D until the production smoke issue is confirmed resolved.
- Blockers:
  - None in local validation.

### 2026-07-14 - Stage 2C static English i18n cleanup

- Goal: convert low-risk static English page links, breadcrumbs, and canonicals to existing i18n route/SEO helpers while preserving current `/en/` behavior.
- Files changed locally:
  - `src/pages/en/index.astro`
  - `src/pages/en/about.astro`
  - `src/pages/en/contact.astro`
  - `src/pages/en/faq.astro`
  - `src/pages/en/policies.astro`
  - `src/pages/en/houses/index.astro`
  - `src/pages/en/guide/mavrikiano.astro`
  - `src/pages/en/guide/vrouchas.astro`
  - `tests/i18n-foundation.test.mjs`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Replaced static hardcoded English route links and hardcoded static canonicals with `localizedPath`, `housePath`, `villaPath`, `guidePath`, and `localizedCanonical`.
  - Added explicit helper-built canonicals for the two English guide pages.
  - Kept `/blog/` separate and kept the contact form action at `/api/contact`.
- Verified:
  - Focused i18n regression test failed before implementation and passed after helper conversion.
  - Full validation passed: `git diff --check`, `node --test tests/contact-function.test.mjs tests/i18n-foundation.test.mjs`, `npx tsc --noEmit`, and `npm run build`.
  - Generated output kept exact English canonical URLs, kept `/blog/`, did not generate `/en/blog/`, and kept contact form posts to `/api/contact`.
- Remaining:
  - Await approval before commit.
  - `/blog/` still needs its separate redirect/canonical/hreflang/sitemap migration plan before any locale-prefix work.
- Blockers:
  - None currently.

### 2026-07-13 - Stage 2B i18n route helper audit

- Goal: audit hardcoded internal English/blog links and move low-risk repeated property/map links to existing i18n route helpers without adding non-English routes.
- Files changed locally:
  - `src/components/AtAGlance.astro`
  - `src/components/GroupCard.astro`
  - `src/components/UnitCard.astro`
  - `src/components/maps/MapPreview.astro`
  - `src/components/maps/MasterLocationMap.astro`
  - `src/components/maps/SinglePinMap.astro`
  - `src/pages/en/houses/[slug].astro`
  - `src/pages/en/location.astro`
  - `src/pages/en/villa/[slug].astro`
  - `tests/i18n-foundation.test.mjs`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Replaced repeated dynamic `/en/houses/${...}/`, `/en/villa/${...}/`, selected breadcrumbs, selected contact/location/guide links, redirects, and dynamic page canonicals with `localizedPath`, `housePath`, `villaPath`, `guidePath`, and `localizedCanonical`.
  - Left `/blog/` routes and broader one-off hardcoded page links unchanged for the separate blog/canonical migration plan.
- Verified:
  - Production smoke check before work: `/en/` returned 200 and `/` redirected to `/en/`.
  - Focused i18n test failed before implementation and passed after helper conversion.
  - Full validation passed: `git diff --check`, focused Node tests, `npx tsc --noEmit`, and `npm run build`.
  - No non-English route folders were created under `src/pages/`.
- Remaining:
  - Await approval before commit.
  - Later stages can convert static page breadcrumbs/canonicals in a broader locale-page pass.
- Blockers:
  - None currently.

### 2026-07-13 - Stage 2A i18n English source freeze/extraction

- Goal: audit English source copy and extract only low-risk repeated shared UI strings before starting non-English translation work.
- Files changed:
  - `src/i18n/locales/en/forms.json`
  - `src/components/booking/BookingHandoffForm.astro`
  - `tests/i18n-foundation.test.mjs`
  - `docs/i18n/03_TRANSLATION_STATUS.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Moved booking handoff default title, description, field labels, submit fallback, secondary search label, and final availability note into English `forms.json`.
  - Wired `BookingHandoffForm.astro` to `getFormsCopy(locale)` while preserving current English defaults and `/en/` routes.
  - Left long-form page, property, policy, FAQ, location, and blog copy in place for later content-collection planning.
- Verified:
  - Focused i18n test passed after the extraction.
- Remaining:
  - Run full Stage 2A validation before committing.
  - Later stages should move route links to helpers and plan long-form content extraction before adding non-English route folders.
- Blockers:
  - None currently.

### 2026-07-13 - Stage 1 i18n foundation

- Goal: add English-only i18n helpers and shared Header/Footer locale wiring without changing public routes.
- Files changed:
  - `src/i18n/config.ts`
  - `src/i18n/routes.ts`
  - `src/i18n/translate.ts`
  - `src/i18n/seo.ts`
  - `src/i18n/locales/en/common.json`
  - `src/i18n/locales/en/navigation.json`
  - `src/i18n/locales/en/forms.json`
  - `src/i18n/locales/en/seo.json`
  - `src/layouts/Base.astro`
  - `src/components/Header.astro`
  - `src/components/Footer.astro`
  - `tests/i18n-foundation.test.mjs`
  - `docs/architecture/repo-wireframe.md`
  - `docs/architecture/repo-wireframe.mmd`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added locale metadata for `en`, `de`, `fr`, `ru`, `zh`, and `ar`, with English as default and Arabic marked RTL for future use.
  - Added English JSON files for shared UI strings and SEO/form templates.
  - Updated `Base.astro` to derive `html lang`, `dir`, and Open Graph locale from locale metadata, defaulting to English.
  - Updated Header/Footer to read English labels and links from locale JSON while preserving current `/en/` and `/blog/` links.
- Verified:
  - `node --test tests/i18n-foundation.test.mjs` passed.
  - `npm run typecheck` and `npm run build` both stopped before project diagnostics with the known Astro/Vite logger/cache failure: `TypeError: msg.includes is not a function` in `astro/dist/core/logger/vite.js` on Node v22.11.0.
- Remaining:
  - Re-run Astro typecheck/build after the local Astro/Vite cache/logger issue is cleared.
  - Stage 2 should add no non-English routes until a reviewed implementation prompt approves it.
- Blockers:
  - Local Astro/Vite logger/cache failure blocks full build verification in this environment.

### 2026-07-13 - I18N documentation control folder

- Goal: create permanent documentation and prompt controls for the planned multilingual implementation.
- Files changed:
  - `AGENTS.md`
  - `docs/i18n/00_I18N_MASTER_PLAN.md`
  - `docs/i18n/01_TRANSLATION_STYLE_GUIDE.md`
  - `docs/i18n/02_ROUTE_AND_FILE_STRUCTURE.md`
  - `docs/i18n/03_TRANSLATION_STATUS.md`
  - `docs/i18n/04_QA_CHECKLIST.md`
  - `docs/i18n/prompts/codex-i18n-foundation.md`
  - `docs/i18n/prompts/translate-one-language.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Documented the approved i18n strategy with English at `/en/`, stable slugs, and locales `en`, `de`, `fr`, `ru`, `zh`, and `ar`.
  - Added route/file structure guidance, translation tone rules, translation status tracking, QA checklist, and future Codex prompts.
  - Added a root `AGENTS.md` instruction requiring agents to read the i18n master plan before multilingual work.
- Verified:
  - Documentation-only change. No Astro routes, config, source code, contact function, DNS, Cloudflare variables, email setup, deploy, commit, or push were changed.
- Remaining:
  - Next safe implementation step is Stage 1 foundation helpers and English locale JSON only, using `docs/i18n/prompts/codex-i18n-foundation.md`.
- Blockers:
  - None.

### 2026-06-25 - Old-site URL inventory and redirect preparation

- Goal: prepare controlled old-site URL inventory and redirect map files for the transition from the old Joomla site to the new Astro site.
- Files changed:
  - `docs/seo/old-site-url-inventory.csv`
  - `docs/seo/redirect-map.csv`
  - `public/_redirects`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added an old-site URL inventory for discovered `traditional-homes.gr` legacy URLs. This is not a sitemap.
  - Added a redirect map with confidence levels and a flag for whether each mapping is included in `public/_redirects`.
  - Replaced the broad `/index.php/en/*` redirect with exact high-confidence 301 redirects only.
  - Recorded that the old `sitemap.xml` is unusable for this task because it points to `boutiquevillaszante.gr`.
- Verified:
  - CSV validation passed: 39 inventory rows and 39 redirect-map rows, with every inventory URL represented in the redirect map.
  - Redirect validation passed: no broad `/index.php/en/*` wildcard remains, and every legacy `public/_redirects` entry is marked `high` confidence and `yes` in the redirect map.
  - `git diff --check` passed.
- Remaining:
  - Review medium/low-confidence entries, especially `/index.php/en/apartments`, `/index.php/en/links`, `/index.php/en/links/2-uncategorised`, and the legacy PDF.
- Blockers:
  - `npm run build` is blocked by the known Windows Vite cache `EPERM` lock unlinking `node_modules\.vite\deps\astro___aria-query.js.map`, even after clearing `node_modules\.vite` once.

### 2026-06-25 - Almond Tree Villa laundry amenity correction

- Goal: remove an unsupported Almond Tree Villa laundry amenity claim.
- Files changed:
  - `src/inventory/inventory.json`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Removed `Laundry facilities` from Almond Tree Villa because the villa does not have them.
- Verified:
  - Inventory JSON parse check passed.
  - Local preview of `/en/villa/almond-tree-villa/` on port 4321 returned 200 and the rendered amenities list no longer included laundry, washing-machine, or washer wording.
- Remaining:
  - None expected.
- Blockers:
  - `npm run build` is blocked by a Windows Vite cache `EPERM` lock unlinking `node_modules\.vite\deps\astro___aria-query.js`.

### 2026-06-25 - Almond Tree Villa wording refinement

- Goal: refine Almond Tree Villa page text while keeping the villa name, route, and page design unchanged.
- Files changed:
  - `src/content/villa/almond-tree-villa.md`
  - `src/inventory/inventory.json`
  - `src/pages/en/villa/[slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Refined Almond Tree Villa wording for the intro, compact facts, meta description, and before-booking notes.
  - Clarified parking/access as free public road parking about 30 metres from the house.
  - Kept Almond Tree Villa as the main name.
- Verified:
  - Inventory JSON parse check passed.
  - Local preview of `/en/villa/almond-tree-villa/` on port 4321 rendered the updated name, location line, meta description, compact facts, pool-size symbol, parking/access notice, and warning text.
- Remaining:
  - None expected.
- Blockers:
  - `npm run build` is blocked by a Windows Vite cache `EPERM` lock unlinking `node_modules\.vite\deps\astro___axobject-query.js`.

### 2026-06-25 - Almond Tree Villa before-booking access note

- Goal: clarify the Almond Tree Villa "Before you book" notice without changing the villa route or page design.
- Files changed:
  - `src/inventory/inventory.json`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added the nearby free public road parking note, village terrain/steps wording, access-point step wording, and village-path suitability wording to the data-driven sidebar notice.
- Verified:
  - Local preview of `/en/villa/almond-tree-villa/` on port 4321 returned 200 and showed the updated sidebar notice text.
- Remaining:
  - None expected.
- Blockers:
  - `npm run build` is blocked by a Windows Vite cache `EPERM` lock unlinking `node_modules\.vite\deps\astro___aria-query.js`.

### 2026-06-25 - Visitor economy and hotel development duplicate image cleanup

- Goal: keep repeated article images as lead images only and remove duplicate inline figures.
- Files changed:
  - `src/content/blog/elounda-visitor-economy.md`
  - `src/content/blog/key-phases-in-elounda-hotel-development.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Removed duplicate inline figures using `/images/blog/elounda-visitor-economy/elounda-bay-resort-development.jfif` from the visitor economy and hotel development posts.
  - Added visitor economy frontmatter caption: "Modern resort development overlooking Elounda Bay."
  - Added hotel development frontmatter caption: "Hotel development overlooking Elounda Bay."
  - Kept PanosKarapanagiotis / Getty Images credit in lead-image frontmatter for both posts.
- Verified:
  - Local server check on `/blog/elounda-visitor-economy/` found one article image for the lead image path, visible caption, and visible credit.
  - Local server check on `/blog/key-phases-in-elounda-hotel-development/` found one article image for the lead image path, visible caption, and visible credit.
  - Local server check on `/blog/` found 8 published posts and no hidden style variant links.
  - `/blog/elounda-guide-style-1/` still rendered `robots: noindex`.
- Blocker:
  - `npm run build` is blocked by a Windows `EPERM` lock in `node_modules\.vite\deps\astro___aria-query.js.map`.

### 2026-06-25 - Footer detail refinement

- Goal: lightly refine the existing dark editorial footer without redesigning it.
- Files changed:
  - `src/components/Footer.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Increased the footer brand mark from 40 px to 48 px and slightly raised its opacity.
  - Added a Blog link to the footer information navigation.
  - Improved bottom-row readability with clearer copyright/link contrast, cleaner wrapping, and a non-wrapping domain link.
  - Kept the dark footer design, domain text, and chat button behavior unchanged.
- Verified:
  - Local server checks on `/en/`, `/blog/`, and `/en/houses/argyro/` confirmed the dark footer, larger logo class, Blog link, domain text, no inactive social links, and unchanged chat trigger.
- Blocker:
  - `npm run build` is blocked by a Windows `EPERM` lock in `node_modules\.vite\deps\astro___aria-query.js.map`.

### 2026-06-25 - Welcome blog Mavrikiano-Elounda lead image

- Goal: process the owned local `mavrikiano-elounda` image for the welcome blog article.
- Files changed:
  - `src/content/blog/welcome-to-elounda.md`
  - `src/assets/blog-source/welcome-to-elounda/mavrikiano-elounda.jpg`
  - `public/images/blog/welcome-to-elounda/mavrikiano-elounda-480.webp`
  - `public/images/blog/welcome-to-elounda/mavrikiano-elounda-768.webp`
  - `public/images/blog/welcome-to-elounda/mavrikiano-elounda-1200.webp`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Processed `C:\Users\Nikos\Downloads\mavrikiano-elounda.jpg` through `npm run blog:image`.
  - Updated the article lead image to `/images/blog/welcome-to-elounda/mavrikiano-elounda-1200.webp`.
  - Caption: "Mavrikiano village above Elounda Bay."
  - Credit: "Elounda Traditional Homes of Crete."
- Remaining:
  - The source image is 1400 px wide, so the pipeline generated up to 1200 px only; no 1600 or 2400 WebP was generated.
- Verified:
  - Local server checks on `/blog/welcome-to-elounda/` found the new image path, alt text, caption, and credit.
  - Local server check on `/blog/` found 8 published posts, no hidden style variant links, and the new welcome image.
  - `/blog/elounda-guide-style-1/` still rendered `robots: noindex`.
- Blocker:
  - `npm run build` is blocked by a Windows `EPERM` lock in `node_modules\.vite\deps\astro___aria-query.js.map`.

### 2026-06-25 - Published blog internal cross-links

- Goal: add careful internal cross-links between existing published blog articles only.
- Files changed:
  - `src/content/blog/welcome-to-elounda.md`
  - `src/content/blog/Mavrikiano-Distances-And-Guide.md`
  - `src/content/blog/key-phases-in-elounda-hotel-development.md`
  - `src/content/blog/elounda-wartime-memory.md`
  - `src/content/blog/elounda-visitor-economy.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added contextual links only to published `/blog/` articles documented in `docs/architecture/blog-content-index.md`.
  - Added a short related-reading section to the Mavrikiano distances article.
  - Did not link to `elounda-guide-style-1`, `elounda-guide-style-2`, or `elounda-guide-style-3`.
- Verified:
  - Source checks found 8 published blog files and 3 hidden `elounda-guide-style-*` variants.
  - All unique article-body `/blog/` links resolve to known published blog content files.
  - `src/pages/blog/[...slug].astro` still sets `noindex` for `elounda-guide-style-*` routes.
- Blocker:
  - `npm run build` is blocked by a Windows `EPERM` lock in `node_modules\.vite\deps\astro___aria-query.js.map`.

### 2026-06-24 - Elounda guide Argyro veranda lead image

- Goal: use an existing Argyro veranda sea-view image as the Elounda guide blog lead image without changing routes, slugs, layout, or article body text.
- Files changed:
  - `src/content/blog/elounda-guide.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Elounda guide blog lead image changed to reuse `/images/houses/argyro/1600/argyro-veranda-dining-sea-view-03-1600.webp`.
  - Image alt/caption wording: "View across Mirabello Bay from the stone verandas of Mavrikiano, eastern Crete".
  - Visible source/credit: "Elounda Traditional Homes of Crete."

### 2026-06-24 - Elounda guide Mavrikiano elevation correction

- Goal: correct Mavrikiano elevation wording in the Elounda guide article only.
- Files changed:
  - `src/content/blog/elounda-guide.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Corrected Mavrikiano elevation in `elounda-guide.md` from 300 feet / 25 metres to 25–32 metres.

### 2026-06-24 - Blog article grid card refinement

- Goal: refine `/blog/` article grid cards without changing the featured hero carousel, blog routes, article content, ordering, or hidden style-variant behavior.
- Files changed:
  - `src/pages/blog/index.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Improved article card padding, metadata hierarchy, title scale, bottom tag alignment, and hover treatment.
  - Kept tags visible, limited visible tag chips to three plus a count when more tags exist, and preserved the existing hover image reveal for posts with images.
- Verified:
  - `npm run build` passed.
  - Browser checks on `http://127.0.0.1:4331/blog/` confirmed 8 listed posts, category sections, visible tags, working hover image reveal, no broken images, unchanged hero carousel counts, no horizontal overflow at 1440 px, 90% zoom approximation, and 390 px mobile.
  - `elounda-guide-style-1` remained directly accessible at `/blog/elounda-guide-style-1/` with `robots: noindex`, and hidden style variants remained absent from `/blog/`.

### 2026-06-24 - Elounda history and Salt Pans image updates

- Goal: keep the Salt Pans-suitable image on the Salt Pans article and process the Evangelos Mpikakis Unsplash image as the new Elounda history lead image.
- Files changed:
  - `src/content.config.ts`
  - `src/pages/blog/[...slug].astro`
  - `src/content/blog/elounda-history-through-its-shoreline.md`
  - `src/content/blog/elounda-salt-pans-and-poros-windmills.md`
  - `public/images/blog/elounda-salt-pans/elounda-salt-pans-poros-windmills.jfif`
  - `src/assets/blog-source/elounda-history-through-its-shoreline/elounda-gulf.jpg`
  - `public/images/blog/elounda-history-through-its-shoreline/elounda-gulf-480.webp`
  - `public/images/blog/elounda-history-through-its-shoreline/elounda-gulf-768.webp`
  - `public/images/blog/elounda-history-through-its-shoreline/elounda-gulf-1200.webp`
  - `public/images/blog/elounda-history-through-its-shoreline/elounda-gulf-1600.webp`
  - `public/images/blog/elounda-history-through-its-shoreline/elounda-gulf-2400.webp`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Salt Pans keeps the reassigned local image at `/images/blog/elounda-salt-pans/elounda-salt-pans-poros-windmills.jfif`.
  - The Salt Pans lead image visible credit uses the original local caption source: "Source: WhitcombeRD / Getty Images."
  - The History article now uses `/images/blog/elounda-history-through-its-shoreline/elounda-gulf-1600.webp` with alt text "View across the Gulf of Elounda."
  - The source file used was `C:\Users\Nikos\Downloads\evangelos-mpikakis-hmp9alkCaQw-unsplash.jpg`.
  - Added supported `imageCaption`, `imageCredit`, and `imageCreditUrl` blog frontmatter fields and rendered lead-image captions/credits under article lead images.
  - Author credit: "Photo by Evangelos Mpikakis on Unsplash." is now visible under the History lead image.
- Remaining:
  - Confirm exact source URLs for the WhitcombeRD / Getty Images source and the Evangelos Mpikakis Unsplash profile before adding `imageCreditUrl`.

### 2026-06-24 - Reassigned Elounda history image to Salt Pans

- Goal: use the image previously assigned to the Elounda history article for the Salt Pans and Poros Windmills article.
- Files changed:
  - `src/content/blog/elounda-history-through-its-shoreline.md`
  - `src/content/blog/elounda-salt-pans-and-poros-windmills.md`
  - `public/images/blog/elounda-salt-pans/elounda-salt-pans-poros-windmills.jfif`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Copied the existing local image from the history image folder into the Salt Pans image folder.
  - Updated the Salt Pans frontmatter `image` and `imageAlt`.
  - Removed the History article image frontmatter and the matching inline image figure so it no longer shows the reassigned Salt Pans image.
- Remaining:
  - Find or process a better dedicated image for the History article before adding a new lead image there.

### 2026-06-24 - Blog image pipeline CLI command convention

- Goal: make the blog image pipeline command clearer on Windows/npm without touching blog visual files or article body text.
- Files changed:
  - `scripts/process-blog-image.mjs`
  - `docs/architecture/blog-image-pipeline.md`
  - `.agents/skills/blog-image-pipeline/SKILL.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - The pipeline parser now tolerates the normal npm form and the extra-`--` fallback form.
  - Documentation now shows the preferred command and notes the Windows/npm fallback when npm strips option names or intercepts help.
  - The printed frontmatter snippet uses the current `image` and `imageAlt` fields, not `heroImage`.
- Remaining:
  - Re-run command checks after any future npm/package-manager changes.

### 2026-06-24 - Mavrikiano Distances blog image

- Goal: process the local Mavrikiano/Spinalonga image through the blog image pipeline and connect it to the Mavrikiano Distances blog post without changing article body text, route, slug, or visibility behavior.
- Files changed:
  - `src/content/blog/Mavrikiano-Distances-And-Guide.md`
  - `src/assets/blog-source/mavrikiano-distances-and-guide/hero.jpg`
  - `public/images/blog/mavrikiano-distances-and-guide/hero-480.webp`
  - `public/images/blog/mavrikiano-distances-and-guide/hero-768.webp`
  - `public/images/blog/mavrikiano-distances-and-guide/hero-1200.webp`
  - `public/images/blog/mavrikiano-distances-and-guide/hero-1600.webp`
  - `public/images/blog/mavrikiano-distances-and-guide/hero-2400.webp`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Source image `C:\Users\Nikos\Downloads\elounda-mavrikiano-spinalonga.jpg` was copied into the blog source folder and generated into five WebP sizes.
  - Updated the post frontmatter `image`, `imageAlt`, `imageCaption`, and `imageCredit` fields to use the new `hero-1600.webp` image, factual caption text, and visible photographer credit: "Photo by Milada Vigerova."
  - Normalized the generated folder casing to lowercase after the pipeline matched the mixed-case markdown filename.
- Verified:
  - `npm run build` passed, with the existing duplicate-id warning for the mixed-case Mavrikiano blog filename.
  - `npx astro dev --host 127.0.0.1 --port 4331` was blocked by the known `.astro/data-store.json` Windows `EPERM` cache lock, while the already-running 4331 server was stale.
  - Browser verification used `astro preview` on `http://127.0.0.1:4334/` and confirmed the article lead image, `/blog/` carousel/card image, 8 listed posts, hidden style variants, `noindex` on a style variant route, and preserved card hover image layers.

### 2026-06-24 - Blog cascading featured hero

- Goal: convert the `/blog/` static featured article hero into a lightweight cascading carousel using existing blog frontmatter images only.
- Files changed:
  - `src/pages/blog/index.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Replaced the single image-left/content-right hero with a multi-article image-led hero using the preferred featured blog posts that already have local images.
  - Added previous/next controls, thumbnail article selectors, a `1 / 5` counter, arrow-key handling, and reduced-motion-safe transitions.
  - Did not add autoplay, dependencies, routes, slug changes, article content changes, or image pipeline changes.
- Verified:
  - `npm run build` passed.
  - Dev server ran on `http://127.0.0.1:4333/` because ports 4331 and 4332 were already in use.
  - Browser checks confirmed five featured slides, working keyboard controls, working thumbnail selection, local image URLs, 8 listed posts, hidden style variants, preserved card hover image layers, and no horizontal overflow at 390 px.

### 2026-06-24 - Blog image pipeline and featured hero panel refinement

- Goal: add an automated blog image resizing pipeline and soften the `/blog/` featured hero panel without changing blog content, routes, slugs, or visibility behavior.
- Files changed:
  - `package.json`
  - `scripts/process-blog-image.mjs`
  - `docs/architecture/blog-image-pipeline.md`
  - `.agents/skills/blog-image-pipeline/SKILL.md`
  - `src/pages/blog/index.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added `npm run blog:image` for copying one source image into `src/assets/blog-source/{post-slug}/` and generating non-upscaled WebP sizes in `public/images/blog/{post-slug}/`.
  - Documented accepted source types, recommended source dimensions, generated sizes, folder conventions, command examples, and manual alt/caption requirements.
  - Added a project skill requiring future blog image work to use the pipeline and update handoff notes when image conventions change.
  - Replaced the `/blog/` featured hero's black content panel with a light stone editorial panel using dark stone text, primary terracotta label/link accents, and subtle stone borders.
  - Increased `/blog/` top padding from `py-16 md:py-24` to `pb-16 pt-20 md:pb-24 md:pt-28` so the title area sits more comfortably below the sticky header.
  - Kept drop caps, blog card hover-image behavior, featured hero structure, test variants, `noindex`, and `/blog/` filtering unchanged.
- Verification notes:
  - `sharp` was already present in `package.json` and `package-lock.json`; no dependency was added.
  - `node --check scripts/process-blog-image.mjs` passed.
  - `npm run blog:image -- --help` is intercepted by this Windows/npm setup and prints npm's own help. `npm run blog:image -- -- --help` reaches the script and prints the pipeline help.
  - Test run used `public/images/brand/home-hero-spinalonga.jpg` with slug `elounda-wartime-memory` and name `codex-pipeline-test`, generated all five WebP sizes, verified a 1600 WebP had no EXIF/ICC metadata, then removed the test artifacts.
  - Skill validation was blocked because the local Python environment is missing `yaml`.
  - No blog-content-index architecture update was needed because content mapping, route behavior, published/hidden behavior, and noindex behavior did not change.

### 2026-06-24 - Blog article layout refinement

- Goal: refine blog article page structure and aesthetics without rewriting article content or changing slugs/routes.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a static, image-led featured article hero to `/blog/`, using the existing local image for `elounda-history-through-its-shoreline`.
  - Added a wider frontmatter-driven lead image treatment to article pages when an existing `image` field is available, with captions from existing `imageAlt` metadata.
  - Reworked article pages into a calmer editorial layout with breadcrumb, readable metadata, restrained title/dek treatment, a wider 736 px desktop article column, documentary image/caption styling, optional h2-based "In this article" navigation, simple related reading, and Back to Blog.
  - Kept the standard article drop-cap treatment, but refined its size and mobile behavior so it reads as an editorial accent without overpowering the first paragraph.
  - Kept existing blog index card hover-image behavior untouched.
  - Replaced the decorative hotel timeline/sidebar presentation with the quieter h2-based article navigation.
  - Restored subtle in-article figure hover behavior with a smaller radius and lighter overlay.
  - Related reading uses published, non-draft posts and excludes `elounda-guide-style-*` test variants.
  - Blog route generation, `/blog/` index filtering, style-test direct routes, and style-test `noindex` behavior were preserved.
- Verified:
  - `npm run build` was blocked by the known Windows Vite cache `EPERM` lock at `node_modules/.vite/deps/astro___aria-query.js`, not by a source error.
  - Dev server started on `http://127.0.0.1:4332/` because port 4331 was already in use.
  - Browser checks covered `/blog/`, `/blog/key-phases-in-elounda-hotel-development/`, `/blog/elounda-wartime-memory/`, `/blog/elounda-guide/`, and `/blog/elounda-guide-style-1/`.
  - Browser checks confirmed the blog index has no style-variant links, normal articles remain indexable, the style variant remains `noindex`, article width is 736 px on desktop, drop caps remain active, and related reading excludes style variants.
  - Browser DOM/source checks confirmed blog cards still include the hover image layer and `group-hover/card:opacity-10` behavior; the headless hover command did not alter computed opacity, but the route source and live DOM retain the behavior.
  - Mobile browser check at 390 px confirmed the refined drop cap stays inside the article column with no horizontal overflow.
- Remaining:
  - Re-run `npm run build` after the Windows Vite cache lock is released.
  - No blog-content-index architecture docs update was needed because content mapping, slugs, routes, index inclusion, and noindex behavior did not change.

### 2026-06-24 - Blog content index and indexing skill

- Goal: add a Graphify-style blog content map and a project skill for keeping it current.
- Files changed:
  - `.agents/skills/blog-content-index/SKILL.md`
  - `docs/architecture/blog-content-index.md`
  - `docs/architecture/blog-content-index.mmd`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added blog content index documentation for `/blog/`, current listed posts, hidden noindex style variants, and guide files outside the blog collection.
  - Added a blog indexing skill requiring future blog, guide/blog boundary, route logic, slug, draft/noindex/testVariant, and `/blog/` visibility changes to update the index docs and handoff notes.

### 2026-06-24 - Blog test-page robots metadata

- Goal: remove conflicting robots metadata from directly routable blog style-test pages.
- Files changed:
  - `src/layouts/Base.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - `Base.astro` now emits one robots meta tag. Pages passed `noindex` receive `noindex`; normal pages keep the existing `index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1` policy.
  - The blog style-test pages remain controlled by the existing `noindex={isEloundaGuideTest}` route logic and remain excluded from `/blog/`.
- Remaining:
  - Architecture docs were not updated because no route structure, content collection, component relationship, or user-facing flow changed.

### 2026-06-23 - Almond Tree Villa access wording correction

- Goal: correct Almond Tree Villa access wording in the visible "Before you book" and practical notes.
- Files changed:
  - `src/inventory/inventory.json`
  - `src/content/villa/almond-tree-villa.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Removed the inaccurate steep road warning for Almond Tree Villa.
  - Kept factual access notes for several steps from parking, split-level layout, internal stairs, and stepped levels.
- Remaining:
  - Re-run build after releasing any Windows Vite cache lock if it blocks verification.
  - No architecture documentation update is needed because no route, page structure, or component relationship changed.

### 2026-06-23 - Wi-Fi amenity wording cleanup

- Goal: replace the stronger Wi-Fi speed claim in amenity labels with the safer "Wi-Fi Included" wording across property "What's included" sections.
- Files changed:
  - `src/inventory/inventory.json`
  - `src/content/houses/margarita.md`
  - `docs/agent-handoff-notes.md`
- Verified:
  - Repo search found no remaining old Wi-Fi speed label in property content, villa content, inventory, components, or data paths checked.
  - Browser checks on `/en/houses/monastiri/`, `/en/houses/penelope/`, and `/en/houses/leonidas/` showed `Wi-Fi Included` and not the old Wi-Fi speed label.
- Blocker:
  - `npm run build` remains blocked by the known Windows Vite cache `EPERM` lock at `node_modules/.vite/deps/astro___aria-query.js`.
- Remaining:
  - Re-run build after releasing the Vite cache lock.
  - No architecture documentation update is needed because no route, page structure, or component relationship changed.

### 2026-06-23 - Margarita arrival and courtyard correction

- Goal: update House Margarita copy so the arrival point, arched gate, open courtyard, and first-floor veranda are described accurately.
- Files changed:
  - `src/content/houses/margarita.md`
  - `src/inventory/inventory.json`
  - `src/components/AtAGlance.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Revised the overview to place House Margarita in Mavrikiano, above Schisma, Elounda, a few metres beyond House Leonidas, with the main gate on the right beneath an arch.
  - Reworked the layout and outdoor sections to describe the open stone courtyard as entry/access to the main kitchen and bathroom, not a shaded sitting area.
  - Kept the first-floor sea-view veranda as the primary outdoor living and dining space.
  - Updated Margarita inventory constraints and At a Glance access label to mention courtyard entry and internal stairs.
- Remaining:
  - Re-run build and browser verification after releasing Windows cache locks if they block verification.
  - No architecture documentation update is needed because no route or page structure changed.

### 2026-06-23 - Penelope access and veranda route correction

- Goal: update House Penelope copy so guests can understand the route from shared parking to the road, gate, shared pool/barbecue area, covered veranda, external mini kitchen, and house entrance.
- Files changed:
  - `src/content/houses/penelope.md`
  - `src/inventory/inventory.json`
  - `src/components/AtAGlance.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Rewrote the outdoor kitchen/shared pool and access sections to describe the parking route, about 10 metres of uphill village road, gate, shared pool/barbecue area, steps to the tiled-roof veranda, and internal wooden stairs to the ontas.
  - Updated Penelope inventory constraints and At a Glance access label to reflect external steps plus internal stairs to the ontas.
  - Replaced the shared-pool notice wording that implied a "private estate" with a more precise note about one group using both houses around the same shared pool area.
- Remaining:
  - Re-run build and browser verification after releasing Windows cache locks.
  - No architecture documentation update is needed because no route or page structure changed.

### 2026-06-23 - Leonidas layout copy correction

- Goal: update House Leonidas copy so guests can visualize the entrance, fireplace, bathroom, small kitchen, ontas, main bedroom, and balcony sequence.
- Files changed:
  - `src/content/houses/leonidas.md`
  - `src/inventory/inventory.json`
  - `src/components/AtAGlance.astro`
  - `src/components/booking/BookingHandoffForm.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Replaced generic two-floor wording with a spatial walkthrough from the village steps and entrance through the living space, internal wooden stair, ontas, main bedroom, and sea-view balcony.
  - Updated Leonidas inventory and At a Glance labels to describe a main living space plus ontas, internal wooden stairs, and a small kitchen area.
  - Added `rel="noopener noreferrer"` to the existing booking handoff form that already opens in a new tab.
- Verified:
  - Source checks confirmed the old "arranged over two floors" wording is gone from `src/content/houses/leonidas.md` and the requested balcony details are present.
  - `npm run build` was blocked by the known Windows Vite cache `EPERM` lock at `node_modules/.vite/deps/astro___aria-query.js`, not by a source error.
  - A fresh dev server on port 4322 was blocked by an Astro generated-cache `EPERM` lock on `.astro/data-store.json`.
  - Existing port 4321 browser checks showed the new At a Glance label and no horizontal overflow, but the markdown body was stale because the content cache could not refresh.
- Remaining:
  - Re-run build and fresh browser verification after releasing Windows cache locks.
  - No architecture documentation update is needed because no route or page structure changed.

### 2026-06-23 - Mavrikiano property-content corrections

- Goal: document commit `c64d1fd` (`fix: correct Mavrikiano house details`) covering House Efterpi, House Kalliopi, House Monastiri, and House Penelope.
- Files changed in that correction set:
  - `src/content/houses/efterpi.md`
  - `src/content/houses/kalliopi.md`
  - `src/content/houses/monastiri.md`
  - `src/content/houses/penelope.md`
  - `src/inventory/inventory.json`
  - `src/components/AtAGlance.astro`
  - `src/pages/en/houses/[slug].astro`
- What changed:
  - Corrected the Mavrikiano house copy around layout, access, outdoor space, parking wording, and visible property facts.
  - Corrected Penelope from a full two-floor description to a main living space plus ontas, with wooden beds rather than built-in stone beds.
  - Updated Monastiri as a multi-level sea-view house with internal stairs, private courtyard, dipping pool, balconies, and nearby shared parking.
  - Kept Monastiri wording to the safe church fact: beside or near the small church of Profitis Ilias. Do not add unsupported monastery-history claims or the 1950 date.
  - Aligned `inventory.json` and visible At a Glance data with the corrected property facts.
  - Adjusted `AtAGlance.astro` and the house detail page only for corrected visible labels/data; no routes, page structure, or data-flow architecture changed.
- Verified:
  - `npm run build` was blocked by the known Windows Vite cache `EPERM` lock at `node_modules/.vite/deps/astro___aria-query.js`, not by a source error.
- Remaining:
  - Re-run build after clearing or releasing the Windows Vite cache lock.
  - No architecture documentation update was needed for this copy/data-label correction set.

### 2026-06-17 - Location collection metadata

- Goal: improve the `/en/location/` collection list and update one Mavrikiano distance sentence.
- Files changed:
  - `src/pages/en/location.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Changed the Mavrikiano sentence from a 3-minute drive to a 10-minute drive.
  - Reworked the Location page collection list into quiet property clusters with muted metadata badges for village, view, floor, pool, standalone, and villa distinctions.
- Verified:
  - `npm test` was not run because no `test` script exists in `package.json`.
  - `npm run build` was blocked by a known Windows generated-cache `EPERM` lock under `node_modules/.vite`.
  - `npm run dev -- --host 127.0.0.1 --port 4331` was blocked by a generated Astro content-store `EPERM` lock under `.astro`.
  - Browser verification was blocked because the local dev server could not start.
- Remaining:
  - Re-run build and browser verification after the Windows generated-output/cache locks are released.
- Blockers:
  - Windows `EPERM` locks on generated cache/output files only; no source-code fix should be made for these locks.

### 2026-05-25 - Blog and houses listing design research

- Goal: create standalone HTML design mockups for blog article pages, blog index, and houses listing — all using brand tokens and brand voice. No Astro source files were modified.
- Files created in `docs/research/elounda/blog/`:
  - Blog article variants: `v4b3-refined.html` (meta strip #E7F0ED sage-soft), `v4b4-refined.html` (meta #FFFBEB warm cream), `v4b5-refined.html` (meta #B44B2A terracotta, white text). All have caption centered below photo, article title vertically centered (middle-left) using `top:50%; transform:translateY(-50%)`.
  - Blog index: `blog-index-v1-magazine.html` (featured article + 3-col card grid), `blog-index-v2-list.html` (no images, horizontal rule rows), `blog-index-v3-categories.html` (sticky sidebar + per-category sections), `blog-index-v4-mosaic.html` (80vh hero photo + CSS grid mosaic tiles), `blog-index-v5-timeline.html` (year markers + reverse-chronological rows with thumbnails).
  - Houses listing: `houses-v1-list.html` (directory table, column headers), `houses-v2-grid.html` (3-col square-corner card grid, flat badges), `houses-v3-editorial.html` (sticky 280px sidebar + wide horizontal property entries).
- All mockups use real photos from `http://localhost:4321/en/images/houses/` and `http://localhost:4321/en/images/villa/`, real article/property links, brand tokens (--bg, --fg, --accent, --sage, etc.), Cormorant Garamond + Work Sans.
- Known image quirk: Clio hero filename has a space — encoded as `clio-hero-interior-balcony-view-01%20-1024.webp`. Kalliopi hero is 706px (no 1024 version exists).
- Design critiques given:
  - Current /blog/ index: generic SaaS-style cards, no featured article, no visible photos on load, no visual hierarchy.
  - Current /en/houses/: copy violates brand voice ("discerning traveler", "soul of Crete", "meticulously restored"), cards are Airbnb-style (rounded-[2rem], backdrop-blur-md), "Book Now" is urgency language, BookingHandoffForm appears before the property grid.
- Recommendations: blog-index-v2 or v3 for the blog; houses-v3 (editorial sidebar + horizontal entries) for the houses listing.
- Next action: decide which houses listing design to implement, then make targeted changes to `src/pages/en/houses/index.astro` and `src/components/UnitCard.astro` — keeping the Astro data pipeline (inventory.json, FilterBar, GroupCard, groups.json) intact but replacing visual design and copy.
- No build verification needed (no source changes were made this session).
- Blockers: None.

### 2026-05-22 - Elounda guide style test copies

- Goal: create three live local test copies of the Elounda guide article for paragraph separator/style comparison.
- Files changed:
  - `src/content/blog/elounda-guide-style-1.md`
  - `src/content/blog/elounda-guide-style-2.md`
  - `src/content/blog/elounda-guide-style-3.md`
  - `src/pages/blog/[...slug].astro`
  - `src/pages/blog/index.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added live local test routes `/blog/elounda-guide-style-1/`, `/blog/elounda-guide-style-2/`, and `/blog/elounda-guide-style-3/` using the same article content as `/blog/elounda-guide/`.
  - Style 1 hides visible `hr` separators and uses whitespace only.
  - Style 2 uses full-width light section rules.
  - Style 3 uses a short editorial rule with a small dot marker.
  - Marked the three style test routes `noindex` and excluded them from `/blog/`.
- Verified:
  - Static red/green setup check failed before the copies existed and passed after the copy/style setup.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 33 pages.
  - Static output check confirmed all three test pages generated, have `noindex`, include their variant classes, and are absent from the blog index.
  - `python scripts/audit_public_markdown.py` passed.
- Remaining:
  - Visually compare the three local URLs and choose which treatment to keep or refine.
- Blockers:
  - None.

### 2026-05-22 - Elounda guide location-style hero spacing

- Goal: match the `/blog/elounda-guide/` hero subtitle spacing and measure to the `/en/location/` hero introduction without changing colors.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added explicit green-variant header spacing of `5rem`.
  - Set the guide subtitle to the location hero measure: 24 px font size, `1.625` line-height, and `42rem` max width.
  - Preserved the existing title, subtitle, and tag colors.
- Verified:
  - Static red/green check failed before the CSS rules and passed after the update.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed.
  - Browser CDP check confirmed subtitle color remains `rgb(154, 143, 126)`, font size is 24 px, line-height is 39 px, max width is 672 px, header bottom margin is 80 px, and no horizontal overflow.
- Remaining:
  - None.
- Blockers:
  - None.

### 2026-05-22 - Elounda guide left-aligned article block

- Goal: move the `/blog/elounda-guide/` article block to the left instead of centering it.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Removed `mx-auto` from the green guide variant article wrapper while keeping other standard blog posts centered.
- Verified:
  - Static red/green check failed before the class-logic change and passed after the update.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed.
  - Browser CDP check confirmed the guide wrapper class is `max-w-3xl blog-location-variant blog-location-green-variant` with no `mx-auto` and no horizontal overflow.
- Remaining:
  - None.
- Blockers:
  - None.

### 2026-05-22 - Elounda guide tag visibility

- Goal: make the `/blog/elounda-guide/` tag labels visible after the green variant color changes.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a `blog-post-tags` hook and set green variant tag text to `rgb(107, 95, 80)`.
- Verified:
  - Static red/green check failed before the rule and passed after the update.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed.
  - Browser CDP check at 390 px confirmed all six guide tags render as `rgb(107, 95, 80)` with no horizontal overflow.
- Remaining:
  - None.
- Blockers:
  - None.

### 2026-05-22 - Elounda guide one-line title and subtitle color

- Goal: keep the `/blog/elounda-guide/` title on one line and set the subtitle to the stone accent color.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a `blog-title-single-line` hook for the green blog variant title with fixed breakpoint font sizes and `white-space: nowrap`.
  - Set the green variant subtitle color to `rgb(154, 143, 126)`.
- Verified:
  - Static check confirmed the guide title hook, subtitle color rule, and no-wrap rule are present.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed.
  - Browser CDP checks at 390 px and desktop confirmed the title is one line, subtitle color is `rgb(154, 143, 126)`, and `scrollWidth` equals viewport width.
- Remaining:
  - None.
- Blockers:
  - None.

### 2026-05-22 - Elounda guide title accent split

- Goal: adjust the `/blog/elounda-guide/` title so longer titles begin the italic colored accent from the third word.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Changed the green blog title accent for `Where the Sea Holds Memory` from `the Sea Holds Memory` to `Sea Holds Memory`, leaving `Where the` in the normal title style.
- Verified:
  - Static red/green check failed before the change and passed after the template update.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed.
  - Static output check confirmed the built title renders `Where the` before a `blog-title-accent-v2` span containing `Sea Holds Memory`.
- Remaining:
  - None.
- Blockers:
  - None.

### 2026-05-22 - Blog and location visual review

- Goal: visually review the two styled blog articles and the location page on desktop and mobile.
- Files changed:
  - `src/components/Header.astro`
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Tightened the mobile header masthead so it fits alongside the menu button without horizontal overflow.
  - Allowed long blog breadcrumbs and italic title accents to wrap cleanly on narrow screens.
- Verified:
  - Browser screenshots checked `/blog/elounda-visitor-economy/`, `/blog/elounda-guide/`, and `/en/location/` at desktop and 390 px mobile widths.
  - CDP metrics showed `scrollWidth` equals viewport width on all three target pages at 390 px.
  - Location map popup was opened on desktop and mobile; `Book Now` appears in the popup.
  - `python scripts/audit_public_markdown.py` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed.
- Remaining:
  - None for this visual review pass.
- Blockers:
  - None.

### 2026-05-22 - Blog article location-style variants

- Goal: create two blog article visual variants based on the `/en/location/` page style.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `src/content/blog/elounda-visitor-economy.md`
  - `src/content/blog/elounda-guide.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added route-specific article styling for `/blog/elounda-visitor-economy/` to use location-page scale, spacing, typography, and muted color rhythm.
  - Added a second route-specific variant for `/blog/elounda-guide/` that swaps the stone-400 accent treatment toward the location-page light green.
  - Changed the article drop cap to use the serif title treatment in dark text.
  - Updated the title treatment to keep a dual-color title effect. Version 1 italicizes the final word with `Cormorant Garamond`, weight 300, `rgb(154, 143, 126)`, 24 px / 39 px. Version 2 keeps `Where` normal and italicizes `the Sea Holds Memory` in `rgb(152, 188, 180)`.
  - Set the Version 2 subtitle `A journey through Elounda and the stone villages of eastern Crete` to 24 px / 39 px.
  - Removed duplicated body H1 titles from the two target markdown articles; titles now come from frontmatter and the blog article template.
  - Removed the duplicated markdown subtitle from `elounda-guide.md` because the subtitle already comes from frontmatter.
- Verified:
  - `python scripts/audit_public_markdown.py` passed.
  - Target article body-H1 duplicate check passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 30 pages.
  - Static output check confirmed each target page has one `<h1>`, visitor economy has `blog-location-variant`, and elounda guide has `blog-location-variant blog-location-green-variant`.
  - Static output check confirmed visitor economy has `blog-title-accent-v1`, elounda guide has `blog-title-accent-v2`, and each target page still has one `<h1>`.
  - Static source check confirmed Version 2 title accent starts at `the Sea Holds Memory`, and subtitle sizing is 24 px / 39 px.
- Remaining:
  - Visual browser review recommended on the two target URLs.
- Blockers:
  - None.

### 2026-05-22 - Location map popup Book Now buttons

- Goal: add direct booking actions to property popups on `/en/location/`.
- Files changed:
  - `src/components/maps/LeafletMap.astro`
  - `src/components/maps/MasterLocationMap.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added optional `bookingUrl` to Leaflet marker data.
  - Passed each mapped inventory unit's `availabilityUrl` into the marker data.
  - Rendered a sage `Book Now` popup button under `View Details` when a marker has a booking URL.
- Verified:
  - One-off red/green Node check confirmed marker data and popup rendering include `bookingUrl` / `Book Now`.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 30 pages.
  - Static build output confirms `/en/location/` marker JSON includes booking URLs such as `https://traditionalhomes.reserve-online.net/?room=HARGYR` and `?room=ASP3SV`, and the compiled Leaflet popup script renders `Book Now`.
- Remaining:
  - Browser automation could not be completed because the bundled Playwright package failed to load `playwright-core`; visually confirm in the running browser.
- Blockers:
  - None for code/build.

### 2026-05-22 - WebHotelier mobile caption visibility

- Goal: make mobile captions/labels above WebHotelier booking options visible.
- Files changed:
  - `docs/integrations/webhotelier/webhotelier/traditional-homes-webhotelier-theme.css`
  - `docs/integrations/webhotelier/webhotelier/traditional-homes-webhotelier-mobile.css`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added explicit mobile styling for labels, captions, field captions, and legends inside the booking search panels.
  - Updated the standalone mobile CSS panels to use the same lighter site-like background treatment as the combined theme.
  - Added mobile side gutters, inner padding, `box-sizing`, and full-width input/select/textarea rules so the check-in field does not sit against the left edge.
  - Tightened responsive behavior by centering booking/search boxes with calculated mobile width and auto margins.
  - Added stronger mobile button color rules so WebHotelier's blue mobile defaults are overridden by the site sage/rust palette.
  - Added broader mobile button selectors for WebHotelier classes/IDs containing button, btn, book, reserve, reservation, continue, or search.
  - Added scoped mobile float/width resets inside booking search panels so form controls do not keep desktop column spacing on small screens.
  - Removed the broad `[class*="search"]` color override because it also matched search panel containers and caused a tall green mobile search box.
  - Kept search color overrides only on clickable `a`, `button`, and `input` elements, and added row/column padding resets for mobile spacing.
- Verified:
  - CSS brace check passed for the combined theme and standalone mobile CSS.
  - Scan found no `display: none`, `visibility: hidden`, `pointer-events: none`, or `opacity: 0`.
- Remaining:
  - Paste into WebHotelier and confirm against the live mobile booking markup.
  - Change the visible `Villa/Apartments` wording to `Houses & Villa` in WebHotelier language/template settings, or capture the exact rendered HTML selector for a CSS-only visual override.
- Blockers:
  - CSS cannot safely change real select option text without an exact markup selector or WebHotelier template setting.

### 2026-05-22 - Cloudflare go-live roadmap

- Goal: document the final pre-live sequence before uploading or promoting the site on Cloudflare.
- Files changed:
  - `docs/releases/2026-05-22-cloudflare-go-live-roadmap.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a staged go-live roadmap with WebHotelier calendar coordination as the required blocker before Cloudflare upload or promotion.
  - Documented final scope freeze, verification commands, route smoke tests, clean commit rules, Cloudflare preview checks, and post-live checks.
- Verified:
  - `python scripts/audit_public_markdown.py` passed.
- Remaining:
  - Complete WebHotelier calendar coordination and record the decision before final Cloudflare deployment.
- Blockers:
  - WebHotelier calendar/property mapping decisions are not yet recorded.

### 2026-05-22 - WebHotelier booking funnel strategy

- Goal: add the booking funnel strategy to the Cloudflare go-live roadmap.
- Files changed:
  - `docs/releases/2026-05-22-cloudflare-go-live-roadmap.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Documented the Intelligent Handoff approach: site-styled date/guest selection builds a direct WebHotelier URL with `checkin`, `nights`, `adults`, and `room` parameters.
  - Recorded that WebHotelier remains the transaction engine and the public static site must not call authenticated REST booking or availability endpoints directly.
  - Added GA4 cross-domain tracking and event ownership checks for `view_item`, `select_item`, `begin_checkout`, and `purchase`.
  - Marked collection-page live availability fallback as a later secure/server-side phase unless WebHotelier provides a safe public mechanism.
- Verified:
  - Pending lightweight markdown/public-route audit after this note.
- Remaining:
  - Confirm exact WebHotelier direct-link parameter names, room-code mapping, alternative-property behavior, and GA4/GTM support on WebHotelier pages.
- Blockers:
  - WebHotelier booking/calendar configuration and analytics ownership are not yet confirmed.

### 2026-05-22 - Phase 1 WebHotelier handoff implementation

- Goal: implement the approved Intelligent Handoff booking flow without authenticated API calls.
- Files changed:
  - `src/components/booking/BookingHandoffForm.astro`
  - `src/pages/en/index.astro`
  - `src/pages/en/houses/index.astro`
  - `src/pages/en/houses/[slug].astro`
  - `src/pages/en/villa/[slug].astro`
  - `src/components/Header.astro`
  - `src/components/Footer.astro`
  - `docs/releases/2026-05-22-cloudflare-go-live-roadmap.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a reusable form-based WebHotelier handoff component.
  - Property and villa sidebars now submit `checkin`, `nights`, `adults`, and the unit `bookingId` as `room`.
  - Homepage and collection search forms submit `checkin`, `nights`, and `adults` without a room code.
  - Added `dataLayer` pushes for `view_item` on property forms and `select_item` on availability form submit.
  - Changed header and footer booking links from `http` to `https`.
- Verified:
  - `python scripts/audit_public_markdown.py` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 30 pages.
  - Browser check on `/en/houses/argyro/` generated `https://traditionalhomes.reserve-online.net/?checkin=2026-07-10&nights=5&adults=3&room=HARGYR` and confirmed `view_item` was pushed.
  - Browser check on `/en/houses/` generated `https://traditionalhomes.reserve-online.net/?checkin=2026-08-01&nights=4&adults=2` without a room code and confirmed `select_item` can be pushed.
  - Mobile browser check confirmed the Argyro sidebar form fits the booking card without page-breaking overflow.
- Remaining:
  - Confirm with WebHotelier that these direct-link parameters are accepted exactly as implemented.
  - Confirm GA4 cross-domain linking and WebHotelier-side `begin_checkout` / `purchase` support.
- Blockers:
  - Do not promote to Cloudflare production until WebHotelier parameter mapping and analytics ownership are confirmed.

### 2026-05-22 - Mobile sticky booking CTA

- Goal: add a persistent mobile-first booking footer for high-intent mobile users.
- Files changed:
  - `src/layouts/Base.astro`
  - `src/styles/global.css`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a mobile-only sticky booking bar with arrival date, nights, adults, and submit controls.
  - The sticky bar reads the current page's existing `data-booking-handoff` form, so property pages inherit the correct WebHotelier `room` code.
  - Generic pages submit dates, nights, and adults without a room code.
  - Mobile chat button is lifted above the sticky booking bar.
- Verified:
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 30 pages.
  - Browser mobile check on `/en/houses/argyro/` confirmed the sticky bar generated `https://traditionalhomes.reserve-online.net/?checkin=2026-07-10&nights=5&adults=3&room=HARGYR`.
  - Browser mobile check confirmed the sticky bar and chat trigger do not overlap at 390 px.
  - Browser desktop check confirmed the sticky bar is hidden at 1280 px.
- Remaining:
  - Confirm WebHotelier accepts the direct-link parameters exactly as implemented.
- Blockers:
  - Same WebHotelier parameter and analytics confirmation gate as the wider booking handoff.

### 2026-05-22 - Booking fallback search

- Goal: give guests a clear path to other houses if the selected property is unavailable.
- Files changed:
  - `src/components/booking/BookingHandoffForm.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a secondary `Search all available houses` submit action to room-specific booking forms.
  - The primary submit keeps the selected property `room` code.
  - The fallback submit preserves `checkin`, `nights`, and `adults` but disables the `room` field so WebHotelier receives a collection-wide search.
  - Updated the helper copy to mention alternatives in WebHotelier.
- Verified:
  - `python scripts/audit_public_markdown.py` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 30 pages.
  - Browser check on `/en/houses/argyro/` confirmed primary URL includes `room=HARGYR`.
  - Browser check on `/en/houses/argyro/` confirmed fallback URL preserves the same dates and guests but omits `room`.
- Remaining:
  - Confirm WebHotelier automatically shows alternative available houses when a room-specific search is unavailable.
- Blockers:
  - WebHotelier alternative-property behavior still needs confirmation before go-live.

### 2026-05-22 - WebHotelier visual theme CSS

- Goal: provide paste-ready WebHotelier CSS so the hosted booking flow feels closer to the main site.
- Files changed:
  - `docs/integrations/webhotelier/webhotelier/README.md`
  - `docs/integrations/webhotelier/webhotelier/traditional-homes-webhotelier-theme.css`
  - `docs/integrations/webhotelier/webhotelier/traditional-homes-webhotelier-mobile.css`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Replaced the generic WebHotelier README with project-specific integration notes.
  - Added a desktop/shared WebHotelier theme using the site's stone, sage, and rust palette.
  - Added a mobile append CSS file that keeps controls visible and improves touch sizing.
  - Kept the CSS limited to visual styling; no native WebHotelier booking functionality is hidden or removed.
  - Revised the theme files to parser-safe legacy CSS after WebHotelier reported `CssSyntaxError: Unknown word`; removed CSS variables, `fit-content`, keyframes, and grouped selector blocks around important booking elements.
- Verified:
  - `python scripts/audit_public_markdown.py` passed.
  - CSS brace check passed for desktop/shared and mobile WebHotelier CSS files.
  - CSS scan found no CSS variables, `fit-content`, keyframes, `display: none`, `visibility: hidden`, `pointer-events: none`, or `opacity: 0` rules in the WebHotelier theme files.
- Remaining:
  - Paste CSS into WebHotelier's custom CSS fields and visually inspect on desktop and mobile.
  - Confirm final background image URL; current CSS uses the WebHotelier CDN image from the provided template.
- Blockers:
  - WebHotelier template output must be visually reviewed after CSS is applied in their system.

### 2026-05-22 - New session handoff after blog timeline UI work

- Current branch: `codex/property-content-ui-map-version`.
- Draft PR: `https://github.com/Nikos1975/traditionalhomes/pull/2`.
- Current blog state:
  - Blog has 8 posts: 3 History, 4 Location Guide, 1 Updates.
  - New article title: `Key Phases in Elounda's Hotel Development`.
  - New article route: `/blog/key-phases-in-elounda-hotel-development/`.
  - Old route `/blog/elounda-hotel-clusters-timeline/` is no longer generated.
- Product/content files changed or added in this latest blog pass:
  - `src/content/blog/key-phases-in-elounda-hotel-development.md`
  - `src/components/blog/EloundaHotelTimeline.astro`
  - `src/pages/blog/[...slug].astro`
  - `src/pages/blog/index.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added the new Elounda hotel development article using the user's local HTML research files as context only.
  - Added a left-side anchor-linked timeline component for that article only.
  - Renamed the article slug and component from `hotel-clusters` wording to the clearer `key-phases-in-elounda-hotel-development` / `EloundaHotelTimeline`.
  - Added blog-card hover image reveal using each post's `image` metadata.
  - Rounded blog article images, enlarged the first-letter treatment, and matched blog image hover behavior to the photo gallery: slow scale inside a clipped rounded frame with a subtle dark overlay.
  - Homepage index was intentionally not changed.
- Latest verification:
  - `python scripts/audit_blog_metadata.py` passed.
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/audit_brand_language.py` still reports only existing unrelated `best` matches in `elounda-guide.md`, `kalliopi.md`, and `leonidas.md`.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 30 pages.
  - Browser check confirmed the new route renders with the new title and the timeline appears beside the article on desktop.
  - Mobile browser check at 390 px confirmed the timeline, article text, and images render without page-breaking overflow; only a small pre-existing header width measurement was detected.
- Known dirty or local files to leave alone unless explicitly requested:
  - `.ai/memory/conventions.md`
  - `.ai/memory/conventions.md.tmp.4907.1775928805346`
  - `.agent/`
  - `.claude/`
  - `.codex/`
  - `CLAUDE.md`
  - `package-lock.json`
  - `docs/commit-plan/**`
  - `docs/integrations/webhotelier/**`
  - `docs/research/elounda/**/*.html`
- Next useful action:
  - If committing, stage only the intended product/content files and keep local workflow/private files excluded.
- Blockers:
  - None.

### 2026-05-22 - Elounda hotel development timeline article

- Goal: add a factual, restrained article on the key phases in Elounda hotel development.
- Files changed:
  - `src/components/blog/EloundaHotelTimeline.astro`
  - `src/content/blog/key-phases-in-elounda-hotel-development.md`
  - `src/pages/blog/[...slug].astro`
  - `src/pages/blog/index.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Used the user's local HTML research files under `docs/research/elounda/**` as context without editing them.
  - Added a new Location Guide article covering central Elounda, Plaka/Spinalonga-facing resorts, international brand affiliations, asset repositioning, and mixed-use development.
  - Added a left-side, anchor-linked vertical timeline for the Elounda hotel development article using an Astro component.
  - Rounded blog-post body images, enlarged the first-letter treatment on the first article paragraph, and matched the photo-gallery hover effect with a slow image scale and subtle overlay.
  - Added the same subtle blog-card image reveal effect used by the location map cards, using each blog post's `image` metadata.
  - Avoided promotional framing and kept unsupported claims out of the article.
- Verified:
  - `python scripts/audit_blog_metadata.py` passed.
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/audit_brand_language.py` did not flag the new hotel development article after source-label cleanup; remaining matches are existing items in `elounda-guide.md`, `kalliopi.md`, and `leonidas.md`.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 30 pages.
  - Browser check confirmed the timeline appears beside the article on desktop and its links jump to the matching article headings.
  - Mobile browser check at 390 px confirmed the timeline, article text, and images render without page-breaking overflow; only a small pre-existing header width measurement was detected.
- Remaining:
  - None for the hotel development article pass.
- Blockers:
  - None.

### 2026-05-21 - New session blog handoff checkpoint

- Goal: preserve current blog/content state before continuing in a fresh session.
- Current branch:
  - `codex/property-content-ui-map-version`
- Draft PR:
  - `https://github.com/Nikos1975/traditionalhomes/pull/2`
- Current blog state:
  - Blog now has 7 posts: 3 History, 3 Location Guide, 1 Updates.
  - The Elounda history pillar article is now `A Short Chronological History of Elounda`.
  - The user's chronological draft was adapted into the pillar article while removing luxury framing, dramatic phrasing, and unsupported claims.
  - Local blog images were added under `public/images/blog/` and used in the history, wartime memory, and visitor-economy articles.
  - Research files under `docs/research/**` were used as context only and were not edited.
- Product/content files currently changed or added:
  - `public/images/blog/elounda-history/ancient-olous-sunken-remains.jfif`
  - `public/images/blog/elounda-wartime-memory/spinalonga-venetian-fortifications.jfif`
  - `public/images/blog/elounda-visitor-economy/elounda-bay-resort-development.jfif`
  - `src/content/blog/Mavrikiano-Distances-And-Guide.md`
  - `src/content/blog/elounda-history-through-its-shoreline.md`
  - `src/content/blog/elounda-visitor-economy.md`
  - `src/content/blog/elounda-wartime-memory.md`
  - `src/content/blog/elounda-salt-pans-and-poros-windmills.md`
  - `docs/agent-handoff-notes.md`
- Known dirty files to leave alone unless explicitly requested:
  - `.ai/memory/conventions.md`
  - `.agent/`
  - `.ai/memory/conventions.md.tmp.4907.1775928805346`
  - `.claude/`
  - `.codex/`
  - `CLAUDE.md`
  - `package-lock.json`
- Latest verification:
  - `python scripts/audit_blog_metadata.py` passed.
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/audit_brand_language.py` does not flag the touched/new blog articles; remaining matches are existing items in `elounda-guide.md`, `kalliopi.md`, and `leonidas.md`.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints; content sync may print duplicate-id loader notices after edits.
  - `npm run build` passed and generated 29 pages.
  - `agent-browser` confirmed local blog images render on the intended article pages.
- Next useful action:
  - Review the blog visually again after any new copy edits.
  - Optional: remove duplicate Markdown `#` headings from older untouched posts such as `elounda-guide.md` and `elounda-visitor-economy.md`.
  - Optional: decide whether to stage/commit only the blog/product files, excluding local workflow files and `package-lock.json`.
- Blockers:
  - None.

### 2026-05-21 - Source-backed Elounda history blog articles

- Goal: turn the Elounda history and wartime research into humble, factual blog articles with relevant internet photos and citations.
- Files changed:
  - `public/images/blog/elounda-history/ancient-olous-sunken-remains.jfif`
  - `public/images/blog/elounda-wartime-memory/spinalonga-venetian-fortifications.jfif`
  - `public/images/blog/elounda-visitor-economy/elounda-bay-resort-development.jfif`
  - `src/content/blog/elounda-history-through-its-shoreline.md`
  - `src/content/blog/elounda-visitor-economy.md`
  - `src/content/blog/elounda-wartime-memory.md`
  - `src/content/blog/elounda-salt-pans-and-poros-windmills.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Revised the shoreline history article as the pillar history piece, with official Ministry/Ephorate sources and Wikimedia image credits.
  - Revised the wartime memory article to keep the Battle of Crete and Spinalonga war-years material restrained and source-backed.
  - Added a focused article on Elounda salt pans and the Poros windmills.
  - Added user-provided local Getty-sourced images to the shoreline history, wartime memory, and visitor-economy articles, with captions/credits.
  - Adapted the user's chronological Elounda history draft into the pillar article structure while removing luxury framing, dramatic phrasing, and unsupported claims.
  - Removed Markdown `#` headings from the revised/new articles so the template page title remains the only main heading.
- Verified:
  - `python scripts/audit_blog_metadata.py` passed.
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/audit_brand_language.py` did not flag the revised/new history articles or the visitor-economy image edit; remaining matches are existing review items in `elounda-guide.md`, `kalliopi.md`, and `leonidas.md`.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints; content sync printed duplicate-id loader notices for the two rewritten article files.
  - `npm run build` passed and generated 29 pages.
  - `agent-browser` confirmed the updated local images render on the shoreline history, wartime memory, and visitor-economy article pages.
- Remaining:
  - Consider a later pass to remove duplicate Markdown `#` headings from older untouched blog posts.
- Blockers:
  - None.

### 2026-05-21 - Blog visual review and Mavrikiano guide cleanup

- Goal: visually review the blog routes and clean up the older Mavrikiano guide language flagged by the brand audit.
- Files changed:
  - `src/content/blog/Mavrikiano-Distances-And-Guide.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Reviewed `/blog/`, `/blog/elounda-guide/`, and `/blog/mavrikiano-distances-and-guide/` with `agent-browser` against the local preview server.
  - Replaced the visible draft-style table label with `Practical Notes`.
  - Rewrote the Mavrikiano guide's promotional descriptions, itinerary notes, packing notes, and final Spinalonga note in a calmer, practical style.
  - Kept existing route links and distance/time values.
- Verified:
  - `python scripts/audit_blog_metadata.py` passed.
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/audit_brand_language.py` no longer flags the Mavrikiano guide; remaining matches are existing review items in other blog/property content.
  - `npm run typecheck` passed.
  - `npm run build` passed.
  - `agent-browser` confirmed the updated Mavrikiano table renders from local preview.
- Remaining:
  - Article pages still render a template title plus Markdown `#` headings; consider a separate blog-content/template pass if duplicate H1s should be removed across all posts.
- Blockers:
  - Initial dev-server attempt hit a Windows `.astro/data-store.json` EPERM cache rename lock; existing preview on port 4322 was used for browser checks.

### 2026-05-21 - Booking CTA green-first treatment

- Goal: reverse booking CTA colors and align the blog drop cap with the green system color.
- Files changed:
  - `src/styles/global.css`
  - `src/pages/blog/[...slug].astro`
  - `src/pages/en/contact.astro`
  - `src/components/Footer.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - `booking-cta` buttons now use sage green by default and rust/orange on hover.
  - Blog article drop cap now uses sage green.
  - Contact form submit button no longer uses `booking-cta`, so it is not treated as a booking/date action.
  - Footer `Check Availability` text link now starts in sage and hovers to rust.
- Verified:
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 28 pages.
  - `agent-browser` opened `/blog/elounda-guide/`, `/en/`, and `/en/houses/` successfully from local preview.
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/audit_blog_metadata.py` passed.
- Remaining:
  - None for this color pass.
- Blockers:
  - None.

### 2026-05-21 - Blog article drop cap

- Goal: restore the old magazine-style first-letter treatment inside the current blog article template.
- Files changed:
  - `src/pages/blog/[...slug].astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a blog-only drop cap on the first article paragraph using the active Cormorant Garamond font and site primary color.
  - Confirmed downloaded fonts are active through `src/styles/global.css` and `Base.astro`; legacy `MagazineLayout.astro` still references placeholder font paths and remains unused.
- Verified:
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated 28 pages.
  - `agent-browser batch --bail "open http://127.0.0.1:4322/blog/elounda-guide/" "get url" "close"` passed.
  - Static preview HTML includes the `blog-article` class, drop-cap CSS, and Cormorant font asset references.
- Remaining:
  - Visual review at `http://127.0.0.1:4322/blog/elounda-guide/`.
- Blockers:
  - None.

### 2026-05-21 - Superpowers coordination rule

- Goal: document use of `obra/superpowers` with GPT-5.5 coordination and Codex 5.3 execution.
- Files changed:
  - `docs/codex-5-3-router.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added the `obra/superpowers` `.codex-plugin` reference to the router.
  - Defined priority order: project/user rules first, project skills second, Superpowers process skills third.
  - Added guidance for GPT-5.5 as coordinator, Codex 5.3 as bounded executor, `agent-browser` for visual checks, and Python scripts for compact audits.
- Verified:
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/blog_index_summary.py` passed.
  - `agent-browser --version` returned `0.27.0`.
- Remaining:
  - None.
- Blockers:
  - None.

### 2026-05-21 - Agent browser and content audit scripts

- Goal: support the GPT-5.5 coordinator / Codex 5.3 executor workflow with browser tooling and compact repo-local audits.
- Files changed:
  - `scripts/audit_blog_metadata.py`
  - `scripts/audit_public_markdown.py`
  - `scripts/audit_brand_language.py`
  - `scripts/blog_index_summary.py`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Updated global `agent-browser` CLI to `0.27.0`, installed Chrome for Testing, and installed the `vercel-labs/agent-browser@agent-browser` skill into the user-level skills folder.
  - Installed the closest available ULTRA-style skill, `intellectronica/agent-skills@ultrathink`, into the user-level skills folder.
  - Added dependency-free Python scripts for blog metadata, public markdown placement, brand-language review, and compact blog index summaries.
- Verified:
  - `agent-browser batch --bail "open about:blank" "get url" "close"` passed.
  - `python scripts/audit_blog_metadata.py` passed.
  - `python scripts/audit_public_markdown.py` passed.
  - `python scripts/blog_index_summary.py` passed.
  - `python scripts/audit_brand_language.py` ran and flagged existing review items, mostly in the older Mavrikiano guide.
- Remaining:
  - Restart Codex to pick up newly installed user-level skills in future sessions.
  - Optional future cleanup: revise the flagged older Mavrikiano guide language.
- Blockers:
  - None.

### 2026-05-21 - Blog structure and SEO

- Goal: improve the blog index for a larger post set without adding client-side filtering.
- Files changed:
  - `src/pages/blog/index.astro`
  - `src/pages/blog/[...slug].astro`
  - `src/content/blog/welcome-to-elounda.md`
  - `src/content/blog/Mavrikiano-Distances-And-Guide.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added static category grouping and category anchor links to the blog index.
  - Made card metadata show date, region, tags, and category consistently.
  - Added fallback category display on individual blog pages.
  - Added missing category, region, tags, and image metadata to two older posts.
- Verified:
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints. Astro printed duplicate-id loader notices for two existing blog slugs during content sync, but diagnostics passed and build did not repeat them.
  - `npm run build` passed and generated 28 pages.
  - `rg --files src/pages | rg "\.md$"` returned no markdown under `src/pages`.
  - Local dev-server HTML checks confirmed `/blog/` includes Location Guide, History, Updates, and region metadata; `/blog/mavrikiano-distances-and-guide/` includes the revised title, category, and region.
- Remaining:
  - Optional browser visual review if the browser tool or Playwright is available later.
- Blockers:
  - In-app browser tooling was not exposed in this session, and Playwright is not installed in the repo.

### 2026-05-21 - New session coordinator handoff

- Goal: preserve state before continuing in a new session with GPT-5.5 coordinating Codex 5.3 execution.
- Current state:
  - Active branch: `codex/property-content-ui-map-version`.
  - Draft PR: `https://github.com/Nikos1975/traditionalhomes/pull/2`.
  - PR already includes property content/data fixes, UI/map fixes, build/deploy tooling, project agent docs, Elounda blog research folders, three new/revised blog posts, and the blog research skill.
  - Added coordinator router at `docs/codex-5-3-router.md`.
- Next useful action:
  - In the new session, read `AGENTS.md`, `CLAUDE.md`, `docs/agent-handoff-notes.md`, and `docs/codex-5-3-router.md`.
  - Use the router to send one task packet at a time to Codex 5.3.
  - Recommended next work: Phase 2 blog structure and SEO for `src/pages/blog/index.astro` and `src/pages/blog/[...slug].astro`.
- Verification:
  - Latest blog/content verification before this handoff: `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints; `npm run build` passed and generated 28 pages.
- Remaining dirty files to keep excluded unless explicitly requested:
  - `.ai/memory/conventions.md`
  - `package-lock.json`
  - `.agent/`
  - `.ai/memory/conventions.md.tmp.4907.1775928805346`
  - `.claude/`
  - `.codex/`
  - `CLAUDE.md`
- Blockers:
  - None for continuation. Official skill validation still cannot run in local Python because `yaml` is missing.

### 2026-05-21 - Elounda blog research articles

- Goal: create Phase 1 Elounda blog articles from organized research.
- Files changed:
  - `.agents/skills/blog-research-article/SKILL.md`
  - `src/content/blog/elounda-history-through-its-shoreline.md`
  - `src/content/blog/elounda-visitor-economy.md`
  - `src/content/blog/elounda-wartime-memory.md`
  - `docs/superpowers/plans/2026-05-21-elounda-blog-content-phase-1.md`
- What changed:
  - Added `.agents/skills/blog-research-article/SKILL.md` for reusable research-to-blog workflows.
  - Added a checklist implementation plan for the Elounda blog research phase.
  - Revised the shoreline history article to be more specific and restrained.
  - Added visitor-economy and wartime-memory articles using conservative, low-risk claims.
- Verified:
  - Tone scans found no issue except one intentional factual use of "high-end hospitality" to describe public image.
  - `rg --files src/pages | rg "\.md$"` found no markdown under `src/pages`.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed and generated the new blog routes.
- Remaining:
  - Phase 2 blog index/category improvements.
- Blockers:
  - Official skill validator could not run because the local Python environment is missing `yaml`.

### 2026-05-21 - Product content group staged

- Goal: continue clean commit preparation from the generated commit plan.
- Current state:
  - Re-read project instructions, handoff notes, clean commit planner skill, and generated clean commit plan.
  - Re-ran `.agents/skills/clean-commit-planner/scripts/plan-clean-commits.ps1` because this handoff file had changed after the previous plan.
  - Staged only `docs/commit-plan/groups/01-product-content-data.txt`.
- Verified:
  - `npm run build` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
- Remaining:
  - Commit or unstage the first group before staging the next group, otherwise the staged index will mix groups.
  - Continue with `02-ui-map-behavior` after the first group decision.
- Blockers:
  - None.

### 2026-05-21 - New chat handoff checkpoint

- Goal: preserve current state before continuing in a fresh chat.
- Current state:
  - Property copy, inventory size data, At a Glance size display, UI green-color fixes, map initialization fixes, map popup link fixes, and contact Group Gatherings color fix are implemented in the working tree.
  - Fresh verification already passed after the latest user-facing changes: `npm run build` and `npm run typecheck` both passed with 0 errors, 0 warnings, 0 hints.
  - Clean commit planning skill exists at `.agents/skills/clean-commit-planner/SKILL.md`.
  - Current generated commit plan is at `docs/commit-plan/clean-commit-plan.md`.
  - Current pathspec groups are in `docs/commit-plan/groups/`.
- Next useful action:
  - In the new chat, first read `AGENTS.md`, `CLAUDE.md`, this handoff file, `.agents/skills/clean-commit-planner/SKILL.md`, and `docs/commit-plan/clean-commit-plan.md`.
  - Re-run `& .agents/skills/clean-commit-planner/scripts/plan-clean-commits.ps1` if any files changed after this note.
  - Review/stage one pathspec group at a time; do not use `git add .`.
- Commit plan:
  - `01-product-content-data`: property copy, inventory facts, content display.
  - `02-ui-map-behavior`: UI, map behavior, templates, shared styles.
  - `03-build-deploy-tooling`: Astro/build/deploy/tooling config, after review.
  - `04-agent-project-docs`: project instructions, skills, audit docs, handoff notes, only if these should be versioned.
  - `98-review-needed`: currently `package-lock.json`; only commit if lockfile churn is intentional.
  - `99-excluded-local-workflow`: `.agent/`, `.ai/`, `.claude/`, `.codex/`, and temp local workflow files; do not commit unless explicitly requested.
- Blockers:
  - None. The next decision is whether to stage/commit by group, and whether project agent docs/skills should be committed.

### 2026-05-21 - Clean commit planner skill

- Goal: automate dirty-tree review and clean commit grouping without staging everything.
- Files changed:
  - `.agents/skills/clean-commit-planner/SKILL.md`
  - `.agents/skills/clean-commit-planner/scripts/plan-clean-commits.ps1`
  - `docs/commit-plan/clean-commit-plan.md`
  - `docs/commit-plan/groups/*.txt`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added a project skill for classifying product content/data, UI/map behavior, build/deploy tooling, agent docs, review-needed files, and excluded local workflow files.
  - Added a PowerShell planner script that generates a Markdown report and Git pathspec files.
- Verified:
  - Planner script ran successfully.
  - `git add --dry-run --pathspec-from-file=...` passed for product content/data, UI/map behavior, build/deploy tooling, and agent project docs groups.
- Remaining:
  - `package-lock.json` remains in `98-review-needed` because `package.json` was not changed.
  - `.agent/`, `.ai/`, `.claude/`, and `.codex/` remain excluded from the clean commit plan.
- Blockers:
  - None.

### 2026-05-21 - Contact group card color

- Goal: replace the remaining black Group Gatherings card on `/en/contact/` with the green system treatment.
- Files changed:
  - `src/pages/en/contact.astro`
  - `docs/agent-handoff-notes.md`
- Verified:
  - Browser checked `http://localhost:4321/en/contact/`: Group Gatherings card uses `bg-accent-sage-soft`, `border-accent-sage/60`, and dark stone text.
  - `npm run build` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
- Blockers:
  - None.

### 2026-05-21 - Map popup link and filter color follow-up

- Goal: fix house-page map popup links resolving to `undefined` and use the green system color for location map filter buttons.
- Files changed:
  - `src/components/maps/SinglePinMap.astro`
  - `src/components/maps/LeafletMap.astro`
  - `src/components/maps/MasterLocationMap.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Single-pin map markers now include the correct property detail URL and subtitle.
  - Leaflet popup detail buttons are omitted when a marker has no URL, preventing `undefined` hrefs.
  - Master location map filter buttons now use `accent-sage` for active and hover states instead of black.
- Verified:
  - Browser checked `http://localhost:4321/en/houses/demetra/`: popup detail link href is `/en/houses/demetra/`.
  - Browser checked `http://localhost:4321/en/location/?id=demetra#map-section`: active filter button remains wired with no console errors.
  - `npm run build` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
- Blockers:
  - None.

### 2026-05-21 - Village map initialization fix

- Goal: restore house-page village maps and `/en/location/?id=...#map-section` deep links.
- Files changed:
  - `src/components/maps/LeafletMap.astro`
  - `src/components/maps/MasterLocationMap.astro`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Map scripts now initialize on normal `DOMContentLoaded`/ready state as well as `astro:page-load`.
  - Master location map controls are guarded against duplicate setup and only mark ready after the Leaflet map exists.
- Verified:
  - Browser checked `http://localhost:4321/en/houses/demetra/`: single map rendered with tiles and marker.
  - Browser clicked the house-page `View map` link to `http://localhost:4321/en/location/?id=demetra#map-section`: master map rendered, Demetra card activated, popup opened.
  - Browser loaded `http://localhost:4321/en/location/?id=demetra#map-section` directly with the same result.
  - `npm run build` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
- Remaining:
  - None for the reported map/deep-link regression.
- Blockers:
  - None.

### 2026-05-21 - Resume verification after Phase 2

- Goal: continue from the property Phase 2 handoff and confirm whether work remained.
- Checked:
  - Reviewed `AGENTS.md`, `CLAUDE.md`, audit checklist, Phase 2 plan, and property content audit skill.
  - `rg` found no flagged placeholders, unsupported history/square-metre phrases, or flagged hype terms in live property content.
  - Node inventory check confirmed all 11 inventory entries have numeric `areaSqm`.
- Verified:
  - `npm run build` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
- Remaining:
  - No property Phase 2 tasks remain in the current plan.
  - Owner confirmation is still required before reintroducing historical claims, exact walk/drive times, or exclusive pool/barbecue pairing language.
- Blockers:
  - None.

### 2026-05-21 - Confirmed property sizes

- Goal: add owner-confirmed property sizes to inventory, public copy, and the At a Glance UI.
- Files changed:
  - `src/inventory/inventory.json`
  - `src/types.ts`
  - `src/components/AtAGlance.astro`
  - `src/content/houses/argyro.md`
  - `src/content/houses/leonidas.md`
  - `src/content/houses/margarita.md`
  - `src/content/houses/demetra.md`
  - `src/content/houses/penelope.md`
  - `src/content/houses/erato.md`
  - `src/content/houses/clio.md`
  - `src/content/houses/efterpi.md`
  - `src/content/houses/kalliopi.md`
  - `src/content/houses/monastiri.md`
  - `src/content/villa/almond-tree-villa.md`
- What changed:
  - Added `areaSqm` to every inventory unit.
  - Added size display to `AtAGlance`.
  - Added confirmed `m2` values to property summaries and interior copy.
- Confirmed values:
  - Argyro: 85 m2
  - Leonidas: 50 m2
  - Margarita: 120 m2
  - Demetra: 50 m2
  - Penelope: 65 m2
  - Erato: 55 m2
  - Clio: 55 m2
  - Efterpi: 55 m2
  - Kalliopi: 55 m2
  - Monastiri: 120 m2
  - Almond Tree Villa: 230 m2
- Verified:
  - Node inventory check confirmed all 11 entries have numeric `areaSqm`.
  - `rg` confirmed no old `sqm`, `square metres`, `square-metre`, or `m²` wording remains in property content/inventory.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - `npm run build` passed cleanly on rerun.
- Blockers:
  - None.

### 2026-05-22 - WebHotelier CSS fast theme

- Goal: provide a paste-ready WebHotelier custom CSS theme that resembles the main site without affecting booking functionality.
- Files changed:
  - `docs/integrations/webhotelier/webhotelier/traditional-homes-webhotelier-theme.css`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Replaced the older expanded WebHotelier stylesheet with a variable-based fast theme using the site stone, rust, sage, blue, border, and typography language.
  - Kept selectors limited to visible styling for page, header, panels, form fields, buttons, labels, rates, tables, and mobile layout.
- Verified:
  - Brace-balance check passed.
  - Checked for `display: none`, `visibility: hidden`, `pointer-events: none`, and `opacity: 0`; none found.
- Remaining:
  - Paste into WebHotelier and visually confirm against the live booking markup.
- Blockers:
  - None.

### 2026-07-09 - Contact email destination

- Goal: update the public guest inquiry address from the legacy Gmail destination to Google Workspace `info@traditional-homes.gr` and document the existing contact form behavior.
- Files changed:
  - `src/pages/en/contact.astro`
  - `src/layouts/Base.astro`
  - `tests/contact-function.test.mjs`
  - `.env.example`
  - `README.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Added visible `mailto:info@traditional-homes.gr` fallback links on the contact page and chat placeholder.
  - Updated contact function tests so `CONTACT_EMAIL_TO` points at `info@traditional-homes.gr`.
  - Added `.env.example` and README notes for the Cloudflare Pages Function runtime variables.
- Contact form behavior:
  - Frontend form posts to `/api/contact`.
  - `functions/api/contact.js` sends via Cloudflare Email Service REST API using `CONTACT_EMAIL_TO`, `CONTACT_EMAIL_FROM`, `CLOUDFLARE_ACCOUNT_ID`, and `CLOUDFLARE_EMAIL_API_TOKEN`.
  - A visible "Unable to send this message" response means the function reached the send path and either the Cloudflare REST request failed or the provider rejected the send; missing config returns "Email service is not configured."
- Verified:
  - `npm test` could not run because `package.json` does not define a `test` script.
  - `node --test tests/contact-function.test.mjs` passed: 7 tests, 0 failures.
  - `git diff --check` passed.
  - Targeted `rg` search found no remaining `eloundavilla@gmail.com` references outside excluded generated/vendor content; `mailto:` references point to `info@traditional-homes.gr`.
  - `npm run build` failed before site compilation in Astro/Vite cache cleanup: `TypeError: msg.includes is not a function` at `astro/dist/core/logger/vite.js`, using Node v22.11.0. Clearing `node_modules/.vite` once did not resolve it.
- Remaining:
  - Set or update Cloudflare Pages runtime variable `CONTACT_EMAIL_TO=info@traditional-homes.gr`.
  - Confirm `CONTACT_EMAIL_FROM` is an allowed sender for Cloudflare Email Service.
- Blockers:
  - No real email was sent during this task.

### 2026-05-21 - Phase 2 property fixes

- Goal: complete browser review, fix remaining UI friction, and keep a fact-confirmation list for future property work.
- Files changed:
  - `src/pages/en/villa/[slug].astro`
  - `src/styles/global.css`
  - `src/pages/en/about.astro`
  - `src/pages/en/location.astro`
  - `src/pages/en/contact.astro`
  - `src/components/maps/MapPreview.astro`
  - `docs/superpowers/plans/2026-05-21-property-pages-phase-2-fixes.md`
  - `docs/agent-handoff-notes.md`
- What changed:
  - Browser-reviewed all 10 house pages plus Almond Tree Villa.
  - Moved villa-specific access warnings out of the early main content and into the sidebar "Before you book" card.
  - Removed the duplicated generic "Access reminder" from the villa sidebar.
  - Changed remaining explicit black button hover treatments to the green/sage system.
  - Verified the mobile menu opens and closes three times in a row at a 390 px viewport.
- Verified:
  - Browser checked all property pages for new headings and absence of flagged old copy.
  - Browser checked `http://localhost:4321/en/villa/almond-tree-villa/`, `http://localhost:4321/en/about/`, `http://localhost:4321/en/location/`, and `http://localhost:4321/en/contact/`.
  - `rg` check found no remaining flagged placeholders, unsupported square-metre/history phrases, or flagged hype terms in `src/content/houses` and `src/content/villa`.
  - `npm run build` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
- Remaining:
  - Owner should confirm any facts before reintroducing square metres, historical claims, exact walk/drive times, or exclusive pool/barbecue pairing language.
- Blockers:
  - None.

### 2026-05-21 - Property page copy rewrite

- Goal: continue the property content plan by fixing live content blockers and tightening house/villa copy.
- Files changed:
  - `src/content/houses/argyro.md`
  - `src/content/houses/leonidas.md`
  - `src/content/houses/margarita.md`
  - `src/content/houses/demetra.md`
  - `src/content/houses/penelope.md`
  - `src/content/houses/erato.md`
  - `src/content/houses/clio.md`
  - `src/content/houses/efterpi.md`
  - `src/content/houses/kalliopi.md`
  - `src/content/houses/monastiri.md`
  - `src/content/villa/almond-tree-villa.md`
  - `docs/content-audit-property-pages-checklist.md`
- What changed:
  - Removed live villa placeholders and conditional pool copy.
  - Corrected Demetra copy to match inventory: 1 bedroom, sleeps 4, shared pool with Penelope.
  - Removed unsupported square-metre and history claims from property pages.
  - Rewrote summaries and body sections in a calmer, fact-first style.
  - Added access, stairs, parking, pool sharing, and pairing notes into the live copy.
- Verified:
  - `rg` check found no remaining placeholders, unsupported square-metre/history phrases, or the flagged hype terms in `src/content/houses` and `src/content/villa`.
  - `npm run build` passed when run alone, with no duplicate content warnings.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - Browser checked `http://localhost:4321/en/villa/almond-tree-villa/`, `http://localhost:4321/en/houses/demetra/`, and `http://localhost:4321/en/houses/`.
- Remaining:
  - Optional deeper browser-review of every individual property page for final rhythm and spacing.
- Blockers:
  - None for this rewrite pass. Any exact history or square-metre claims should stay out until confirmed by a reliable source.

### 2026-05-21 - Property content audit

- Goal: audit house and villa page content and create a reusable workflow for future content work.
- Files changed:
  - `docs/content-audit-property-pages-checklist.md`
  - `.agents/skills/property-content-audit/SKILL.md`
  - `AGENTS.md`
  - `CLAUDE.md`
- Verified:
  - `npm run build` passed.
  - `npm run typecheck` passed with 0 errors, 0 warnings, 0 hints.
  - Skill frontmatter structure checked locally.
- Remaining:
  - Rewrite live property content using the audit checklist.
  - Confirm square-metre and history claims before keeping them.
  - Resolve villa placeholders and Demetra bedroom mismatch first.
- Blockers:
  - Official skill validator could not run because the local Python environment is missing `yaml`.
