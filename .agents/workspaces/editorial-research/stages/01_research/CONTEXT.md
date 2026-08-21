# Stage 01 — Research

One job: build or review the evidence packet for a bounded article/topic. Do not write the final article in this stage.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/operations/blog-production.md` | durable research/run structure and safeguards |
| L3 | `.ai/brand/website-brand-style-guide.md` | project voice and positioning constraints relevant to research framing |
| L3 | `.ai/prompts/blog-editorial-system.md` | editorial scope, evidence and article-angle rules |
| L3 | `docs/architecture/source-of-truth.md` | ownership boundaries for property/site facts when relevant |
| L2.5 | `.agents/workspaces/editorial-research/stages/01_research/topic-contexts.md` | registry of research projects that own a topic-local control contract |
| L4 | initiating research prompt/topic brief | exact question, angle, geography, exclusions and requested deliverables |
| L4 | exact topic folder under `docs/research/` when it exists | durable research packet and prior decisions |
| L4 | exact user-provided files, source URLs, archival records or current web evidence required by the topic | evidence under review |
| L4 | closely related live/source articles only when overlap must be assessed | duplication and angle control |

## Topic-local research context

A substantial or persistent research project may own one small control contract at `docs/research/blog/<slug>/CONTEXT.md`, beside the evidence it routes to. It is a Layer 2.5 control point between this stage and the topic’s Layer 4 material, and it is optional.

- Resolve the path from the topic slug already used by the research folder. Load a contract only when `.agents/workspaces/editorial-research/stages/01_research/topic-contexts.md` registers it; an unregistered folder under `docs/research/` is inert evidence and is never loaded because it exists.
- Use a contract when scoped context materially improves the workflow: a multi-file evidence packet, an open acquisition programme, contested or unresolved claims, controlled image rights, or a published article awaiting evidence-triggered revision. A single-run or small topic does not need one.
- A missing contract is not a failure. Continue from the initiating brief and this stage. Propose registering a contract only when the task scope allows it.
- A contract narrows this stage for one project. It may not widen stage permissions, authorise drafting, or route to `.agents/workspaces/editorial-research/stages/02_drafting/CONTEXT.md`. `research-only` still stops at this stage.
- A contract routes to evidence instead of restating it. Dossiers, source notes, claim registers, bibliographies, image records and article prose stay in Layer 4 files, named by exact repository-root-relative path.
- Keep topic detail out of this stage, the workspace router, `CONTEXT.md` and `CLAUDE.md`.

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

A registered topic-local `CONTEXT.md` narrows these outputs and names the exact output files for one project. Without one, the initiating brief defines the exact deliverables.

## Verify

- Every material factual conclusion is traceable to evidence in the packet.
- Unsupported, disputed and unresolved claims are clearly separated from verified claims.
- No final article has been drafted for a `research-only` task.
- No source text has been copied beyond what is necessary for short evidence notes.
- Existing article/research files outside the approved topic scope remain unchanged.
- Run `npm run context:audit` after any control-plane changes; research-only evidence work otherwise uses the topic's own verification requirements.

## Stop conditions

Stop on an unclear central question, missing essential evidence, inaccessible source required for a material claim, unresolved contradiction that changes the article's core conclusion, unclear image rights when an image plan is required, unexpected files, or any request to publish/merge/deploy without explicit approval. Do not advance to drafting merely because research exists.
