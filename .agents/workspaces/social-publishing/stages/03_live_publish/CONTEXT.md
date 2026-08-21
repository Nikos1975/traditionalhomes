# Stage 03 — Live Publish

One job: publish one exact approved platform record to Meta, record the outcome, and stop. This is the only stage in this workspace that may mutate anything outside this repository, and it runs only when the user explicitly asks for publication.

NO LIVE PUBLICATION BY DEFAULT. Preparing a post, drafting copy, showing status and approving a draft never reach this stage.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/operations/social-publication.md` | the exact live gates, the state machine and the ambiguity rule |
| L3 | `docs/operations/agent-operating-model.md` | instruction hierarchy, staging and stop rules |
| L3 | `docs/architecture/media-ownership.md` | which media may be published and who owns it |
| L3 | `docs/operations/blog-lifecycle.md` | publication follows a live article; it never precedes one |
| L4 | the exact approved platform record for one slug, and no other platform | publication target |
| L4 | the exact current article for that slug, read only to confirm the fingerprint still matches | staleness gate |
| L4 | only the exact validated media this platform will publish | media gate |
| L4 | only the exact non-secret configuration needed to identify the target account, never a token value | target identity |

Do not load every ledger, every article, all of `scripts/social/` or all of `tests/` to publish one post.

## Process

1. Confirm the user asked for live publication of one exact platform of one exact slug. An implied, inferred or batched publication request is a stop condition.
2. Confirm the record is `approved` and its fingerprint equals the current article fingerprint. Nothing else is publishable, and `unknown`, `published`, `failed`, `publishing` and `prepared` are all refusals rather than starting points.
3. Confirm the live environment gates are configured: `SOCIAL_LIVE_PUBLISHING`, `META_GRAPH_VERSION`, `META_PAGE_ID`, `META_IG_USER_ID`, `META_PAGE_ACCESS_TOKEN` and `META_IG_ACCESS_TOKEN`. Report names only. Never read, echo, log, quote or commit a value.
4. Let the tooling verify the public article URL, the Facebook image URL, or the deployed Instagram derivative against the hash, content type, size and aspect ratio the ledger recorded. A media check that fails ends the run before any Meta write.
5. Run `npm run social:publish -- --slug <slug> --platform <platform> --confirm-live`. Publish one platform. A second platform is a second explicit request.
6. Let the publisher own the remote sequence, including the Instagram container, its bounded polling and its single `media_publish`. Do not create a second container, do not extend the polling budget, and do not call publish after a container has failed.
7. Record the outcome exactly as the ledger records it. A received HTTP rejection is a definite failure; an unprovable outcome is `unknown` and may already exist remotely.
8. Do not rerun the command after any outcome. A definite failure is investigated, not retried blindly; an `unknown` goes to Stage 04.
9. Stop. Report the exact recorded state, and never present an unverified publication as published.

## Outputs

- the exact platform record and its final state, with the remote publication ID when one was verified;
- the exact gates that were satisfied, by name, with no configuration values;
- what was published, to which named account, and at what time;
- for a failure, the sanitised reason and the fact that no retry was performed;
- for an `unknown`, an explicit statement that a remote publication may exist and that only Stage 04 may resolve it.

## Verify

Confirm exactly one platform record changed and that the other platform is unchanged. Confirm a `published` record carries a remote publication ID and a publication timestamp, and that no earlier `published` record was rewritten. Confirm no credential, token or account identifier appears in the ledger, the attempt history, the error text or the report. Confirm the ledger on disk matches the reported outcome. Run `node --test tests/social-live-publisher.test.mjs` when publisher behavior was exercised; those tests are fully mocked and no test may reach a real Meta endpoint.

## Stop conditions

Stop on any request that is not an explicit live publication request, a record that is not `approved`, a fingerprint mismatch, a missing or mismatched target identifier, a missing or unparsable live configuration value, a media validation failure, an attempt to weaken a gate, a media rule, the polling bound or the redaction rules, an attempt to publish two platforms in one authorization, an attempt to retry after a failure or an `unknown`, a credential appearing anywhere in output, or any requested merge, deploy, push or force push.
