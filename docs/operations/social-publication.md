# Social Publication

This file records how the existing social publisher behaves. It is stable Layer 3 policy for `.agents/workspaces/social-publishing/CONTEXT.md`. It documents the implementation in `scripts/social/`; it does not extend it, and the code remains authoritative wherever this description is less exact.

The three rules the workflow exists to enforce:

- Preparation is not approval.
- Approval is not publication.
- An unknown publication result is not permission to retry.

## Commands

| Command | Reads | Writes locally | External network |
| --- | --- | --- | --- |
| `npm run social:status -- --slug <slug>` | one ledger | nothing | none |
| `npm run social:prepare -- --slug <slug>` | one published article, one existing ledger | one ledger, one Instagram derivative under `public/images/social/` | none |
| `npm run social:approve -- --slug <slug> --platform <platform> --confirm` | one ledger, the current article | one ledger | none |
| `npm run social:publish -- --slug <slug> --platform <platform> --confirm-live` | one ledger, the current article | one ledger, repeatedly | Meta Graph writes |
| `npm run social:reconcile -- --slug <slug> --platform <platform> --remote-id <id> --confirm` | one ledger | one ledger | Meta Graph reads only |

Every command requires `--slug`. Approval, publication and reconciliation additionally require `--platform`.

## Article eligibility and derived metadata

Preparation accepts one article at `src/content/blog/<slug>.md` whose frontmatter is not `draft: true` and which carries `title`, `pubDate` and `image`. The slug must be lowercase kebab-case. The canonical URL is derived as `/en/blog/<slug>/` against `https://traditional-homes.gr` and must be HTTPS; the hero URL is the frontmatter `image` resolved against the same origin and must be HTTPS. Description falls back to `subtitle` and then `title`. The excerpt is the first non-empty body paragraph with headings, emphasis and link syntax removed.

The publication fingerprint is a SHA-256 over slug, title, description, canonical URL, hero image URL, hero image alt, excerpt and publication date. Any change to those inputs produces a different fingerprint, which is what makes an earlier approval stale.

Drafts are generated deterministically from that metadata for `facebook`, `instagram`, `threads`, `linkedin` and `bluesky`, each with an exact field set enforced by the draft schema. Live publication and reconciliation are implemented for Facebook and Instagram only; the other three records are local drafts that the tooling cannot publish.

## Ledger and state machine

One ledger per article at `data/social-publications/<slug>.json`, written atomically through a temporary file and a rename. Platform states are `prepared`, `approved`, `publishing`, `published`, `failed` and `unknown`.

```text
missing --prepare--> prepared --approve (explicit, fingerprint-bound)--> approved
approved --publish (explicit live gates)--> publishing
publishing --verified remote id--> published        (terminal)
publishing --received HTTP failure--> failed
publishing --unprovable outcome--> unknown
unknown --reconcile with verified remote evidence--> published
unknown --evidence absent or unverifiable--> unknown
```

Facebook and Instagram carry independent records; one platform never transitions because another did. A `published` record is terminal: approval refuses it, live publishing refuses anything that is not `approved`, preparation preserves it, and the ledger writer rejects any replacement of a published record. Preparation refreshes a draft only where the record is still untouched — state `prepared`, no approval or publication timestamp, no remote post ID and no attempts. A `failed` record is not re-approved and not reset by preparation; recovering from it is an explicit human decision, not an automatic retry.

## Live publication gates

Live publication requires all of: an implemented live platform, `--confirm-live`, an existing platform record whose fingerprint equals the current article fingerprint, state `approved`, an HTTPS article URL in the ledger, `SOCIAL_LIVE_PUBLISHING=true`, `META_GRAPH_VERSION` in `vNN.N` form, numeric `META_PAGE_ID` and `META_IG_USER_ID`, both `META_PAGE_ACCESS_TOKEN` and `META_IG_ACCESS_TOKEN` present, agreement between the configured target ID and any target ID already recorded, and a successful public fetch of the article URL. Facebook additionally verifies its public image URL. Instagram additionally re-verifies the deployed derivative and fails before any Meta write when that check does not pass.

`publishing` is persisted before the first remote write, so an interrupted run leaves evidence rather than a silent gap.

Instagram publishes as create container, bounded status polling, then `media_publish`. Polling is bounded; only `FINISHED` proceeds. `ERROR`, `EXPIRED` and an exhausted poll budget all end as `failed` without a second container and without `media_publish`.

## Media

Preparation generates `public/images/social/<slug>-instagram-1080x1350.jpg` from the article hero, which must live on the public site. Source and derivative paths are constrained to `public/`. The derivative must be JPEG, at most 8 MB, with a real pixel size and an aspect ratio from 4:5 through 1.91:1, and its SHA-256 is recorded. Before an Instagram publication the deployed derivative is fetched without following redirects and must match content type, size, dimensions, ratio and recorded hash. Media validation is never relaxed to make a publication proceed, and this workflow never generates or replaces article media beyond that one derivative.

## Ambiguous results

A received HTTP failure is a definite failure: the request reached Meta and was rejected, so the platform record becomes `failed`. Any other failure — transport error, timeout, malformed success payload — cannot prove whether a remote publication exists, so the record becomes `unknown`.

`unknown` is not failure, is not approval, and is not permission to publish again. Live publishing refuses every state that is not `approved`, so an `unknown` record cannot be retried by rerunning the publish command. Only reconciliation can resolve it.

## Reconciliation

Reconciliation applies to a record in `unknown` or `publishing`. It reads remote objects and never creates a Facebook post, an Instagram container or an Instagram media publication. A supplied `--remote-id` requires `--confirm`; without any candidate ID the ledger is returned unchanged and nothing is fetched or written.

Evidence must identify the object and its owner: the returned ID must equal the candidate ID; a Facebook post carrying a `from.id` must match the configured Page; Instagram media must carry an `owner` object whose numeric `id` equals the configured account. A matching username is not ownership. Missing, null, scalar or non-numeric owner data fails closed. Only verified evidence promotes a record to `published`; otherwise the record stays `unknown`, and it is never downgraded to `failed` to make a retry possible.

## Credentials

Tokens, Page and account identifiers are operational configuration supplied through the environment. They never enter a context file, a ledger, a draft, a report, a commit or a pull request; the draft and ledger schemas reject any field whose name looks credential-bearing, publisher output is redacted, and Meta error messages are sanitised and truncated before they are stored or shown. Never test against live Meta APIs; the repository's social tests are fully mocked.
