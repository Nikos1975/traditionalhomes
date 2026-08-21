# Stage 02 — Approval

One job: record explicit human approval of one exact platform draft, and stop. Approval is a local decision. It reaches no network, sends nothing to Meta, and publishes nothing.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/operations/social-publication.md` | what is approvable, what makes an approval stale, what is terminal |
| L3 | `docs/operations/agent-operating-model.md` | instruction hierarchy, staging and stop rules |
| L3 | `.ai/brand/website-brand-style-guide.md` | whether the draft sounds like this business before a human is asked to approve it |
| L3 | `docs/architecture/source-of-truth.md` | a draft never restates a property fact the inventory does not support |
| L4 | the exact ledger for one slug, and no other ledger | approval target |
| L4 | the exact platform record named in the request, and no other platform | approval scope |
| L4 | the exact current article for that slug, read only to establish the current fingerprint | staleness check |
| L4 | only the exact draft text that approval would freeze | what the human is approving |

Do not load every ledger, every article or the whole social implementation to approve one draft.

## Process

1. Name the exact slug and the exact platform. Approval is never inferred from an earlier message, from a prepared state, or from the fact that another platform was approved.
2. Approve one platform. Approving both Facebook and Instagram requires the user to ask for both, and it remains two explicit approvals of two separate records.
3. Show the exact draft that would be approved, and let the human read it before confirming.
4. Confirm the record is approvable: it is in the `prepared` state and its fingerprint equals the current article fingerprint. A stale, approved, publishing, published, failed or unknown record is not approvable here.
5. Run `npm run social:approve -- --slug <slug> --platform <platform> --confirm` only after the human has confirmed this exact draft. The confirmation flag records a human decision; it is never supplied to make the command succeed.
6. If the article changed after preparation, the approval is stale by design. Return to Stage 01, prepare again, and let the human read the new draft. Never re-point an old approval at new content.
7. Stop. Publication belongs to Stage 03, and an approval never authorizes it.

## Outputs

- the exact platform record now recorded as approved, with its approval timestamp and the fingerprint it is bound to;
- the exact draft text that was approved, quoted as it will be published;
- confirmation that every other platform record is unchanged;
- an explicit statement that nothing has been published and that publication requires a separate request.

## Verify

Confirm exactly one platform record changed, that it moved from `prepared` to `approved`, and that its recorded fingerprint equals the current article fingerprint. Confirm no other platform record changed, that no `published` record was touched, and that no remote publication ID or publication timestamp was written. Confirm no network request was made and no credential appears in the ledger or the output. Run `node --test tests/social-publisher.test.mjs` when approval behavior was exercised; a production build and type check are not required because no site source changed.

## Stop conditions

Stop on an unstated slug or platform, a missing platform record, a record that is not in the `prepared` state, a fingerprint mismatch between the record and the current article, an approval inferred rather than explicitly given, a request to approve every platform at once without an explicit request covering each, a request to approve and publish in one step, a request to edit the draft text or the article to make it approvable, a credential appearing anywhere in output, or any requested merge, deploy, publication, push or force push.
