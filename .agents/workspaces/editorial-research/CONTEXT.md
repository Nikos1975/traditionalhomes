# Editorial / Research Workspace Router

Use this workspace for research-led blog and guide work after `BLOG_ORCHESTRATOR.md` selects an editorial mode. Route one stage at a time and load only that stage's declared Layer 3 references and Layer 4 working material.

## Route the task

| Requested outcome | Stage |
| --- | --- |
| Research only, source verification, dossier, bibliography, claims register, unresolved questions, overlap review | `stages/01_research/CONTEXT.md` |
| Draft a new article from a reviewed research packet | `stages/02_drafting/CONTEXT.md` |
| Revise an existing unpublished research-backed draft within an approved scope | `stages/03_revision/CONTEXT.md` |
| Audit an article and its evidence trail without editing by default | `stages/04_audit/CONTEXT.md` |

## Mode flow

- `research-only` stops after Stage 01 and returns the research deliverables. Do not draft the article.
- `new-article` runs Stage 01 first, stops at the research review gate, then Stage 02 only when drafting is requested or already authorized by the initiating task.
- `revise-draft` routes directly to Stage 03 when its research packet already exists.
- `audit` routes directly to Stage 04.
- Publication, visual-plan, and image-only work remain routed by `BLOG_ORCHESTRATOR.md`; they are not editorial-research stages.

## Shared invariants

- Research evidence and article prose are separate artifacts.
- Search results, snippets, generated summaries, raw drafts, and tourism copy are leads, not evidence.
- Prefer direct primary, institutional, archival, archaeological, academic, ecclesiastical, government, or other authoritative sources appropriate to the claim.
- Record disagreement and uncertainty instead of silently reconciling sources.
- Draft only from claims that the research packet supports at the required confidence.
- Do not change publication state, merge, deploy, or publish without explicit approval.
- Keep geographic scope and article angle explicit; do not let background research turn into a generic history of the wider subject.
- Existing durable research lives under `docs/research/`; operational run state remains under `.blog-runs/` and is not imported globally.

## Review boundaries

Research and drafting are separate mental modes. Stage 01 must produce a reviewable evidence packet before Stage 02 writes prose. Stage 03 may not recover missing evidence implicitly; route back to Stage 01 if new research is required. Stage 04 is read-only unless a separate remediation task is approved.
