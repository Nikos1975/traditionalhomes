# Blog Orchestrator

Read this file before blog, area-guide, village-guide, blog audit, publication, or blog-image work. It selects the canonical workspace/procedure; detailed work belongs only in the routed stage or skill.

## Route one initial mode

Choose the mode that matches the requested primary outcome. Supporting activities such as claim review, validation, and image processing do not create a second mode. Stop only when the outcome is genuinely ambiguous.

| Mode | Route | Canonical procedure |
| --- | --- | --- |
| `research-only` | `.agents/workspaces/editorial-research/CONTEXT.md` → Stage 01 | research workspace contract; no final article |
| `new-article` | `.agents/workspaces/editorial-research/CONTEXT.md` → Stage 01, review gate, then Stage 02 | `.agents/skills/blog-research-article/SKILL.md` |
| `revise-draft` | `.agents/workspaces/editorial-research/CONTEXT.md` → Stage 03 | `.agents/skills/blog-revise-draft/SKILL.md` |
| `audit` | `.agents/workspaces/editorial-research/CONTEXT.md` → Stage 04 | `.agents/skills/blog-content-audit/SKILL.md` |
| `publication` | direct skill | `.agents/skills/blog-publication/SKILL.md` |
| `visual-plan` | direct skill | `.agents/skills/traditional-homes-article-visual-plan/SKILL.md` |
| `image-only` | direct skill | `.agents/skills/traditional-homes-image-pipeline/SKILL.md` |

## Universal controls

- Read `AGENTS.md`, `CLAUDE.md`, this file, and then only the routed workspace/stage or direct skill plus the exact Layer 3/Layer 4 inputs it declares.
- `docs/operations/blog-production.md` remains the durable run/research convention. Do not import all research, handoff, `.ai/`, or skill material globally.
- Use the existing topic brief and research packet as the source of truth when they exist. A new research/article run may scaffold its packet before it exists; revision/audit modes stop and report a missing record rather than inventing one.
- `research-only` means research deliverables only. It must stop before final article drafting.
- Manual editorial approval is required before a publication workflow can change draft state. There is no automatic publication and no automatic merge.
- Keep an exact approved file scope. Stop on an unsupported claim, unclear image rights or attribution, unexpected files, missing required approval, or a failed required validation gate.

For the concise human lifecycle, see `docs/operations/blog-lifecycle.md`.
