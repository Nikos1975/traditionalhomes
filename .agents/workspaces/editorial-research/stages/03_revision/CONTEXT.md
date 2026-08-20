# Stage 03 — Revision

One job: make a bounded revision to an existing unpublished research-backed draft. Do not expand scope, recover missing sources, or publish.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `.agents/skills/blog-revise-draft/SKILL.md` | canonical revision procedure |
| L3 | `.ai/brand/website-brand-style-guide.md` | public voice and positioning |
| L3 | `.ai/prompts/blog-editorial-system.md` | editorial consistency |
| L3 | `docs/operations/blog-production.md` | scope/run safeguards |
| L4 | exact draft article and approved revision request | bounded edit target |
| L4 | topic brief, source notes, sources and claims register | factual support for every change |
| L4 | only directly affected related articles/links when required | consistency check |

## Process

1. Confirm the article is still unpublished/draft and record the exact approved revision boundary.
2. Read the existing research packet before changing factual wording.
3. Map every factual change to an existing supported claim.
4. Make the smallest change that satisfies the revision request.
5. Preserve `draft: true`, article angle, source discipline and media-rights state unless separately approved.
6. If the revision requires new evidence or source recovery, stop and route that work to Stage 01 instead of improvising research here.
7. Run the canonical revision validation and inspect the exact diff.

## Outputs

- the bounded draft revision;
- only directly required validation/test changes;
- concise stage report with approved scope, evidence mapping, files changed, draft-state confirmation, validation and next allowed action.

## Verify

Run the checks required by `.agents/skills/blog-revise-draft/SKILL.md`. Confirm every factual edit is evidence-backed, `draft: true` is preserved, no unrelated files changed, and diagnostics do not worsen beyond baseline.

## Stop conditions

Stop for missing research, unsupported factual change, source recovery, scope expansion, publication-state change, unclear image rights, unexpected files, failed validation, or any merge/publication/deployment action without explicit approval.
