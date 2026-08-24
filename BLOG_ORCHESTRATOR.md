# Blog Orchestrator

Read this file before blog, area-guide, village-guide, blog audit, publication, or blog-image work. It selects the canonical procedure; detailed work belongs only in that procedure.

## Route one initial mode

Choose the mode that matches the requested primary outcome. Supporting activities such as claim review, validation, and image processing do not create a second mode. Stop only when the outcome is genuinely ambiguous.

| Mode | Canonical skill |
| --- | --- |
| `new-article` | `.agents/skills/blog-research-article/SKILL.md` |
| `revise-draft` | `.agents/skills/blog-revise-draft/SKILL.md` |
| `audit` | `.agents/skills/blog-content-audit/SKILL.md` |
| `publication` | `.agents/skills/blog-publication/SKILL.md` |
| `visual-plan` | `.agents/skills/traditional-homes-article-visual-plan/SKILL.md` |
| `image-only` | `.agents/skills/traditional-homes-image-pipeline/SKILL.md` |

## Universal controls

- Assume the runtime has already loaded the root project instructions. Do not reread unchanged `AGENTS.md` or `CLAUDE.md` inside the same task. Read this file, the one routed skill, and `docs/operations/blog-production.md`; load brand/editorial references only when the routed skill or editorial judgment requires them.
- Use the existing topic brief and research packet as the source of truth when they exist. A new-article run may scaffold its packet before it exists; all other modes stop and report a missing record rather than inventing one.
- Search `docs/agent-handoff-notes.md` only for the exact article slug, PR, or blocker when historical context is required. Do not read the full handoff archive by default.
- Manual editorial approval is required before a publication workflow can change draft state. There is no automatic publication and no automatic merge.
- Keep an exact approved file scope. Stop on an unsupported claim, unclear image rights or attribution, unexpected files, missing required approval, or a failed required validation gate.

For the concise human lifecycle, see `docs/operations/blog-lifecycle.md`.
