# Stage 02 — SEO Analysis

One job: turn already-validated Search Console evidence into reproducible findings and stop. Read-only with respect to production content and site source: this stage edits no page, no route, no redirect and no fact.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/content-intelligence/search-console.md` | baseline limits and what may never be inferred from this evidence |
| L3 | `docs/content-intelligence/editorial-policy.md` | evidence ordering, qualified wording, human gate |
| L3 | `docs/architecture/source-of-truth.md` | which authority owns a fact the analysis touches |
| L3 | `docs/audits/www-redirection-audit-2026-07-24.md` | established canonical-host consolidation |
| L3 | `docs/audits/robots-sitemap-verification-2026-07-24.md` | established indexation and sitemap position |
| L4 | the exact analysis question, written as one question | analysis boundary |
| L4 | only the exact compatible processed datasets for one property and one export shape | validated evidence |
| L4 | the exact production route inventory built by `scripts/content-intelligence/inventory.mjs` | which URLs exist, and their type |
| L4 | the exact redirect records in `public/_redirects` | legacy-URL resolution |
| L4 | only the exact page or query relation under investigation | scope |
| L4 | only the exact existing article or page being compared for overlap | overlap scope |
| L4 | the exact historical SEO report being reassessed, such as `docs/seo/elounda-pillar-plan.md`, when reassessment is the request | prior claim under review |

Do not load every processed dataset, every article, all content-intelligence output, all of `docs/`, all of `tests/`, or every historical report. A controlled sitewide analysis still names one compatible dataset set and one production inventory.

## Process

1. Write the exact question. One question, with the property and evidence period it is asked about.
2. Confirm the evidence is validated Stage 01 evidence and that the datasets are compatible. Unvalidated or incompatible evidence stops here.
3. Resolve every ranking URL against the production inventory and the redirect map before deciding anything. Classify each as live production URL, canonical URL, redirecting legacy URL, non-production URL, draft content or alternate locale URL, and never merge those classes into one performance entity except where the existing canonicalization rules already do.
4. Let the analyser decide the primary ranking page for a query. Do not hand-pick one, and do not promote a redirecting or SEO-ineligible URL into an actionable target.
5. Treat multiple ranking URLs as an observation. Record the observed ranking routes; do not label it cannibalization, and do not treat topical similarity alone as Search Console evidence of anything.
6. Separate evidence from interpretation in every line: the measured value, then what it may mean, then what it does not establish.
7. Apply the negative rules deliberately. Low clicks alone do not prove a page needs rewriting. High impressions alone do not prove a new article is needed. Content length is not a diagnosis. Imperfect wording is not a reason for a new URL. A redirect is never concluded without explicit evidence.
8. When reassessing an older report, compare each of its claims against current evidence and classify it as still supported, no longer supported, never evidenced, or untestable with the evidence at hand.
9. Output findings and stop. Do not proceed to recommendation unless Stage 03 is explicitly requested.

## Outputs

- the exact question, the property, the evidence period and the datasets used;
- findings, each stating its evidence, its interpretation and its explicit limits;
- URL classification for every ranking URL involved, including which are redirecting or draft;
- overlap observations with their category, kept separate from any conclusion;
- for a reassessment, a per-claim verdict against current evidence;
- no recommended action, no file change.

## Verify

Re-run the analysis from the same datasets and confirm the findings are identical; a finding that is not reproducible is not a finding. Confirm every ranking URL resolved through the production inventory and redirect map, that no draft or redirecting URL was reported as a target, that no fact outside Search Console evidence was asserted, and that no keyword-volume claim appears without a named data source. Confirm the working tree is unchanged: `git status --short` must show no modification produced by this stage. A production build and type check are not required because no site source changed.

## Stop conditions

Stop on an unvalidated or incompatible dataset, an unstated evidence period, a question that cannot be answered from the evidence at hand, a ranking URL that resolves to no known production route, a conflict between the route inventory and the redirect map, a request to conclude cannibalization from multiple ranking URLs alone, a request to assert search volume without a source, a request to edit content, routes, redirects or facts inside the analysis, or any requested merge, deploy, publication, push or force push.
