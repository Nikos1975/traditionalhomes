# Stage 01 — Research

One job: build or review the evidence packet for a bounded article/topic. Do not write the final article in this stage.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/operations/blog-production.md` | durable research/run structure and safeguards |
| L3 | `.ai/brand/website-brand-style-guide.md` | project voice and positioning constraints relevant to research framing |
| L3 | `.ai/prompts/blog-editorial-system.md` | editorial scope, evidence and article-angle rules |
| L3 | `docs/architecture/source-of-truth.md` | ownership boundaries for property/site facts when relevant |
| L4 | initiating research prompt/topic brief | exact question, angle, geography, exclusions and requested deliverables |
| L4 | exact topic folder under `docs/research/` when it exists | durable research packet and prior decisions |
| L4 | exact user-provided files, source URLs, archival records or current web evidence required by the topic | evidence under review |
| L4 | closely related live/source articles only when overlap must be assessed | duplication and angle control |

## Process

1. Fix the research boundary: central question, geography, period, intended article angle and explicit exclusions.
2. Inspect existing topic research before starting new retrieval. Preserve prior verified work; do not overwrite user-edited records.
3. Identify the claims/questions that require evidence and the best source class for each.
4. Research direct authoritative sources first. Treat snippets, generated summaries, raw drafts and unsourced tourism pages only as leads.
5. Record each material claim with source, URL or archival identifier, evidence status and concise reasoning.
6. Separate `verified`, `qualified/uncertain`, `rejected`, and `unresolved` material. Record source conflicts rather than choosing silently.
7. Maintain a source bibliography and, where relevant, people/entity registers, image-rights notes, chronology, route/table reconstruction, or overlap inventory requested by the topic.
8. Keep article-writing language out of the evidence packet except for short neutral synthesis needed to explain findings.
9. For `research-only`, stop here. For `new-article`, stop at the research review gate before Stage 02.

## Outputs

Produce only the research artifacts required by the topic, normally including:

- research dossier / source notes;
- bibliography or `sources.json`;
- claim-verification register or `claims.json`;
- unresolved questions and source conflicts;
- overlap/distinct-angle note when relevant;
- requested chronology, entity/person register, image-rights plan or other structured research tables;
- concise stage report listing Layer 3 references loaded, Layer 4 evidence reviewed, research gaps, and the next allowed action.

Phase 8 may add a topic-local `CONTEXT.md` that narrows these outputs for one article. Until then, the initiating brief defines the exact deliverables.

## Verify

- Every material factual conclusion is traceable to evidence in the packet.
- Unsupported, disputed and unresolved claims are clearly separated from verified claims.
- No final article has been drafted for a `research-only` task.
- No source text has been copied beyond what is necessary for short evidence notes.
- Existing article/research files outside the approved topic scope remain unchanged.
- Run `npm run context:audit` after any control-plane changes; research-only evidence work otherwise uses the topic's own verification requirements.

## Stop conditions

Stop on an unclear central question, missing essential evidence, inaccessible source required for a material claim, unresolved contradiction that changes the article's core conclusion, unclear image rights when an image plan is required, unexpected files, or any request to publish/merge/deploy without explicit approval. Do not advance to drafting merely because research exists.
