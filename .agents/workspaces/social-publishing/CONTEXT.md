# Social Publishing Workspace Router

This workspace is the control plane for preparing, approving, publishing, checking and reconciling social publications for one already-published article. Route one stage at a time and load only that stage's declared Layer 3 references and Layer 4 working material.

The three rules the workspace exists to enforce:

- Preparation is not approval.
- Approval is not publication.
- An unknown publication result is not permission to retry.

The workspace does not redesign the publisher. `scripts/social/` and its tests are the implementation and the authority on behavior; `docs/operations/social-publication.md` is the stable description of it. This router places that existing workflow behind explicit permission boundaries.

## Route the task

| Requested outcome | Stage |
| --- | --- |
| Read the current publication state of one article, or create or refresh its deterministic platform drafts and Instagram derivative | `stages/01_prepare/CONTEXT.md` |
| Record explicit human approval of one exact platform draft | `stages/02_approval/CONTEXT.md` |
| Publish one exact approved platform record to Meta | `stages/03_live_publish/CONTEXT.md` |
| Resolve one platform record left in `unknown` using verified remote evidence | `stages/04_reconcile/CONTEXT.md` |

Four stages, because each one is a different permission class. Stage 01 writes only local drafts and one derivative and reaches no network. Stage 02 writes one local approval and reaches no network. Stage 03 is the only stage that may mutate anything outside this repository. Stage 04 may read remote objects and may never create a publication. Reading status is the read-only entry to Stage 01, not a fifth stage: it is the same tooling with strictly fewer permissions, and it never continues into preparation unless preparation was requested.

NO LIVE PUBLICATION BY DEFAULT. A request to prepare a post, draft platform copy, show publication status, or approve a prepared draft never routes into Stage 03. Live publication requires an explicit request to publish.

## Authority model

| Question | Authority | Where it lives |
| --- | --- | --- |
| Whether an article may be prepared at all, and what metadata it yields | the published article and the loader that reads it | `src/content/blog/`, `scripts/social/article.mjs` |
| Draft shape, fingerprint, ledger schema, state machine, gates, media limits, polling and redaction | the publisher implementation, never restated as a competing rule | `scripts/social/`, `docs/operations/social-publication.md` |
| Current publication state of one article | its ledger record | `data/social-publications/` |
| Article wording and factual claims | editorial and research | `BLOG_ORCHESTRATOR.md` |
| Property capacity, amenities, distances and constraints | the canonical property record | `.agents/workspaces/property-content/CONTEXT.md` with `src/inventory/inventory.json` |
| Which media may be used and who owns it | media ownership policy | `docs/architecture/media-ownership.md` |

## Domains this workspace does not own

| Subject | Owner |
| --- | --- |
| Writing, revising, correcting or auditing the article a post is derived from | `BLOG_ORCHESTRATOR.md` with `.agents/workspaces/editorial-research/CONTEXT.md` |
| Property facts and property-page content | `.agents/workspaces/property-content/CONTEXT.md` |
| Search Console evidence, SEO analysis and SEO recommendation | `.agents/workspaces/seo-content-intelligence/CONTEXT.md` |
| Localized routes, hreflang, locale canonical and sitemap infrastructure | `.agents/workspaces/i18n/CONTEXT.md` |
| Route, component, template and site implementation, including image-delivery integration | `.agents/workspaces/site-engineering/CONTEXT.md` |
| Article image generation, processing and visual planning | `.agents/skills/traditional-homes-image-pipeline/SKILL.md` and `.agents/skills/traditional-homes-article-visual-plan/SKILL.md` |
| Deployment, Cloudflare account, DNS and edge administration, and production deployment state | `.agents/workspaces/operations-deployment/CONTEXT.md`; publishing a post never deploys the site |

Consuming a published article, a fact or a media rule is allowed. Becoming its authority is not. A weak social post is never repaired by editing the website article from here.

## Shared invariants

- One article, one ledger, one platform, one stage per run. Never load every ledger, every article, all of `scripts/social/`, all of `tests/` or all of `docs/`.
- Facebook and Instagram records are independent. Preparing or approving one platform never changes another platform's state.
- A `published` record is terminal, and its remote publication ID, publication timestamp and recorded fingerprint are never rewritten.
- Approval is explicit, platform-specific and fingerprint-bound. Changed article content makes an existing approval stale, and a stale record is prepared again before it can be approved again.
- `unknown` is not failure, is not approval, and is not permission to publish again. It is resolved only by Stage 04, and it is never downgraded to a failure state to make a retry possible.
- Never weaken a gate, a media check, the polling bound or the redaction rules to make a publication proceed. A blocked publication is a correct refusal.
- Meta tokens, Page and account identifiers are operational configuration. They never enter a context file, a ledger, a draft, a test fixture, a report, a commit or a pull request.
- Do not modify `scripts/social/`, `src/`, `functions/`, `public/` beyond the one generated Instagram derivative, the publication state machine, the fingerprint algorithm, the ledger schema, the media constraints or the retry behavior from this workspace. Record a suspected defect and stop instead of repairing it here.
- No merge, deploy, push, force push or destructive cleanup is authorized by completing a stage, and completing one stage never authorizes the next.

## Review boundaries

Preparation, approval, publication and reconciliation are separate mental modes with separate review gates. Stage 01 stops at drafts a human can read. Stage 02 stops at a recorded approval. Stage 03 stops at one platform's recorded outcome and never continues into a second platform. Stage 04 stops at either verified evidence or a preserved `unknown`.
