# Stage 01 — Prepare

One job: read the current publication state of one article, or create or refresh its deterministic platform drafts, and stop. This stage does not approve anything, does not reach the network, and does not publish.

Inspection is the read-only entry to this stage. A request to show status runs the status command, reports it and stops; it never continues into preparation unless preparation was requested.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/operations/social-publication.md` | eligibility, derived metadata, fingerprint, ledger, states and media rules |
| L3 | `docs/operations/agent-operating-model.md` | instruction hierarchy, staging and stop rules |
| L3 | `docs/architecture/media-ownership.md` | which media may be used and who owns it |
| L3 | `docs/architecture/source-of-truth.md` | a social draft never becomes a factual authority |
| L3 | `docs/operations/blog-lifecycle.md` | a social campaign follows publication; it is not part of it |
| L4 | the exact published article for this request, and only that article | preparation source |
| L4 | only the exact existing ledger for that slug, when one exists | current platform state |
| L4 | only the exact hero image the article already declares | derivative source |
| L4 | the exact platform records this request names, and no other platform | reporting scope |

Do not load every ledger under `data/social-publications/`, every article under `src/content/blog/`, all of `scripts/social/`, all of `tests/` or all of `docs/`. One preparation names one slug.

## Process

1. Fix the request boundary: inspection, or preparation. One of them.
2. Name the exact slug. An unstated or ambiguous slug is a stop condition, never a guess.
3. For inspection, run `npm run social:status -- --slug <slug>`, report each platform's state and staleness, and stop.
4. For preparation, let the tooling establish eligibility. A draft article, a missing article, missing required frontmatter, a non-HTTPS canonical or hero URL and a hero image outside the public site are correct refusals, not obstacles to work around.
5. Do not hand-write, hand-edit or synthesise a ledger, a draft, a fingerprint or a derivative, and do not edit the article to make preparation succeed.
6. Run `npm run social:prepare -- --slug <slug>` and let it derive the metadata, drafts, fingerprint and Instagram derivative deterministically.
7. Confirm the tooling preserved every protected record. An approved, publishing, published, failed or unknown platform record is carried forward unchanged; only an untouched prepared record is refreshed.
8. Read the resulting drafts as a human reader would and report what they say. Report a weak draft; do not repair it by editing the website article.
9. Stop. Approval belongs to Stage 02, and nothing in this stage authorizes it.

## Outputs

- the reported publication state of the named article, or the refreshed ledger and derivative that preparation produced;
- the exact platform records that changed and the exact records that were preserved;
- the current article fingerprint, and which platform records are now stale against it;
- the exact generated derivative path, or the media blocker that prevented one;
- no approval, no publication, no recommendation to publish.

## Verify

Confirm the ledger for this slug exists and records the current fingerprint, that every platform this run did not prepare is byte-for-byte unchanged, and that no platform state advanced past `prepared` in this stage. Confirm the derivative exists at the path the ledger records. Confirm no credential, token or account identifier appears in the ledger, the drafts or any output of this stage. Confirm the working tree carries no change outside the ledger and the generated derivative. Run `node --test tests/social-publisher.test.mjs` when tooling behavior was exercised; a production build and type check are not required because no site source changed.

## Stop conditions

Stop on an unstated or ambiguous slug, an article that is still a draft, missing or invalid article metadata, a hero image that is missing, invalid or outside the public site, a derivative that fails media validation, a request to hand-edit the ledger or a draft, a request to correct the article from here, a request to approve or publish in this stage, a credential appearing anywhere in output, an attempt to write outside the ledger and the generated derivative, or any requested merge, deploy, publication, push or force push.
