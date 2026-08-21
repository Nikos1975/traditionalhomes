# Stage 04 — Reconcile

One job: resolve one platform record left in `unknown` using verified remote evidence, and stop. This stage may read remote objects. It may never create a Facebook post, an Instagram container or an Instagram media publication.

`unknown` is not failure, is not approval, and is not permission to publish again. Reconciliation exists so that an ambiguous outcome is settled by evidence instead of by a second publication.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/operations/social-publication.md` | what reconciliation verifies, what it may write, and when it must keep `unknown` |
| L3 | `docs/operations/agent-operating-model.md` | instruction hierarchy, staging and stop rules |
| L3 | `docs/architecture/source-of-truth.md` | verified remote evidence, never inference, decides the recorded state |
| L4 | the exact platform record in `unknown` for one slug, and no other platform | reconciliation target |
| L4 | only the exact candidate remote publication ID supplied or already recorded | evidence identity |
| L4 | only the exact non-secret account identity needed to verify ownership, never a token value | ownership check |
| L4 | the exact ledger for that slug, and no other ledger | persistence target |

Do not load every ledger, every article or the publication history of other slugs to reconcile one record.

## Process

1. Confirm the record is in `unknown` or `publishing`. A `prepared`, `approved`, `failed` or `published` record is not reconciled.
2. Establish one candidate remote publication ID: supplied by the user with explicit confirmation, or already recorded on the platform record. Without a candidate, the ledger is returned unchanged and nothing is fetched or written.
3. Read the remote object with `npm run social:reconcile -- --slug <slug> --platform <platform> --remote-id <id> --confirm`, or without the ID arguments when the record already carries one. Reconciliation performs reads only, and no step of this stage may create or publish anything.
4. Verify identity and ownership before believing the evidence. The returned ID must equal the candidate ID; a Facebook post that carries an originating Page must match the configured Page; Instagram media must carry an owner object whose numeric ID equals the configured account. A matching username is not ownership, and missing, null, scalar or non-numeric owner data fails closed.
5. Persist a reconciled `published` state atomically only when the evidence proves the publication, preserving any publication timestamp the record already carried.
6. Keep `unknown` when the evidence is absent, unverifiable or contradictory. Never downgrade `unknown` to a failure state, and never clear it, to make a retry possible.
7. Report what was proved and what was not. A record that stays `unknown` is a result, not a stalled task.
8. Stop. Reconciliation never continues into a republication, and a resolved record is terminal.

## Outputs

- the exact platform record, its final state, and the remote publication ID that was verified;
- the exact evidence that settled it: the object identity and the ownership check that passed;
- for an unresolved record, the exact check that failed and an explicit statement that `unknown` was preserved;
- an explicit statement that no publication was created by this stage.

## Verify

Confirm no create or publish request was issued and that every remote call this stage made was a read. Confirm a record promoted to `published` carries a verified remote publication ID and that ownership was checked against the configured account. Confirm an unresolved record is still `unknown` and was not rewritten to a failure state. Confirm the other platform record is unchanged and that no `published` record was replaced. Confirm no credential, token or account identifier appears in the ledger or the report. Run `node --test tests/social-live-publisher.test.mjs` when reconciliation behavior was exercised; those tests are fully mocked and no test may reach a real Meta endpoint.

## Stop conditions

Stop on a record that is not awaiting reconciliation, a supplied remote ID without explicit confirmation, an absent candidate ID, a remote object whose ID does not match, a Facebook post from another Page, Instagram media whose owner cannot be established as the configured account, any suggestion to publish again to settle the state, any attempt to convert `unknown` into a failure state to permit a retry, a credential appearing anywhere in output, or any requested merge, deploy, push or force push.
