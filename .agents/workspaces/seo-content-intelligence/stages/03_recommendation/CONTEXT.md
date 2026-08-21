# Stage 03 — SEO Recommendation

One job: convert verified Stage 02 findings into bounded, reviewable recommendations, and hand each one to the workspace that would own its implementation. This stage is recommendation-only. It implements nothing.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/content-intelligence/editorial-policy.md` | evidence standards, qualified wording, human approval gate |
| L3 | `docs/content-intelligence/search-console.md` | what this evidence may and may not be used to justify |
| L3 | `docs/architecture/source-of-truth.md` | which authority owns any fact a recommendation touches |
| L3 | `docs/operations/agent-operating-model.md` | instruction hierarchy and stop rules |
| L4 | only the exact verified findings from Stage 02 that this recommendation rests on | evidence base |
| L4 | the exact canonical production route or routes affected | target scope |
| L4 | only the exact existing article or page considered for overlap or consolidation | alternatives considered |
| L4 | the exact historical recommendation being retired, when a stale claim is being withdrawn | prior claim |

Do not load every finding, every article, every processed dataset, all historical reports, all of `docs/` or all of `tests/`. One recommendation names the evidence it rests on and nothing more.

## Process

1. Confirm each finding is a verified Stage 02 finding. An intuition, a generic checklist item or an unreassessed older report is not a finding.
2. Prefer the smallest sufficient action. Revising an existing article, adding one contextual internal link, improving title or meta wording, preserving the current URL, or investigating a query cluster all rank ahead of creating or moving a URL.
3. Apply the safeguards before writing the recommendation. A new URL requires reviewed overlap and a materially distinct angle. A redirect requires evidence and a preservation analysis. A thin-content claim requires more than length. No property, historical or local fact may be created here. No search volume may be claimed without a named source.
4. Write each recommendation with all seven parts below. A recommendation missing any part is not ready for review.
5. Route the implementation. Name exactly one owning workspace and stop; do not restate its procedure.
6. Withdraw stale recommendations explicitly. Say which older claim is retired and on what current evidence.
7. Stop at the review gate. Approval is a human act, and an approved recommendation is executed by its owner under its own contract.

Every recommendation states: 1. evidence; 2. finding; 3. recommended action; 4. confidence; 5. risk and downside, including what could be lost; 6. owning implementation workspace; 7. whether human approval is required.

## Implementation routing

| Approved change | Owner |
| --- | --- |
| Revise, consolidate or audit an existing article or guide | `BLOG_ORCHESTRATOR.md` with `.agents/workspaces/editorial-research/CONTEXT.md` |
| Research a genuinely new article | `BLOG_ORCHESTRATOR.md`, research first and stop at its review gate |
| Property page content | `.agents/workspaces/property-content/CONTEXT.md` |
| A change to a property fact | `.agents/workspaces/property-content/CONTEXT.md`, fact-correction stage, on an explicit authoritative correction only |
| Route, component, template, title and meta implementation, canonical or redirect implementation | `.agents/workspaces/site-engineering/CONTEXT.md` |
| Localized SEO, hreflang, locale canonical and sitemap infrastructure, localized titles and meta | `.agents/workspaces/i18n/CONTEXT.md` |
| Deployment, Cloudflare account, DNS and edge redirect administration | no ICM workspace yet; stop and report |

## Outputs

- the recommendation set, each with its seven parts and exactly one named owning workspace;
- the actions explicitly not recommended, and why the evidence does not support them;
- stale recommendations retired, with the current evidence that retires them;
- open questions that need more evidence rather than a decision;
- no content, route, redirect, metadata, translation or fact change.

## Verify

Confirm every recommendation names its evidence and its owning workspace, that no recommendation implements itself, that no new URL, redirect or fact was introduced without the evidence its safeguard requires, and that confidence and downside are stated rather than implied. Confirm the working tree is unchanged: `git status --short` must show no modification produced by this stage. A production build and type check are not required because no site source changed.

## Stop conditions

Stop on a recommendation without verified evidence, a missing part of the seven-part form, a new URL without reviewed overlap, a redirect without preservation analysis, a thin-content claim resting on length, an invented property, historical or local fact, a keyword-volume claim without a named source, a request to implement the recommendation inside this stage, an implementation that has no clear owning workspace, or any requested merge, deploy, publication, push or force push.
