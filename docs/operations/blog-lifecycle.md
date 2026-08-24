# Blog Lifecycle

The blog workflow is deliberately staged so factual review, editorial interpretation, and human approval happen before a post becomes public.

```text
topic approval → scaffold → research packet → claim review → editorial interpretation → draft
→ visual plan → plan approval → image approval → draft PR → human review → unpublished merge
→ publication branch → local validation → push publication branch → draft publication PR
→ Cloudflare Pages preview → final evidence → explicit merge approval → mark ready → squash merge
→ production verification → optional social campaign
```

`new-article` begins with the [research-to-draft procedure](../../.agents/skills/blog-research-article/SKILL.md). For historical and cultural work, the verified research packet must first be converted into an editorial interpretation: central human question, life cycle, people, practical activity, physical setting, constraints, transition, what survives, useful comparison if any, one-sentence thesis, and narrative architecture. Only then does it create a claim-reviewed `draft: true` article and a draft PR; human review may merge it while it remains unpublished.

The research packet establishes what can responsibly be said. The editorial interpretation establishes what the article is actually about. For historical microhistory, the default narrative movement is place → people → work → conditions → change → surviving evidence → memory. The dossier constrains the story; it does not dictate the article's section order.

`visual-plan` uses the [article visual planning procedure](../../.agents/skills/traditional-homes-article-visual-plan/SKILL.md). It may create or validate only `docs/research/blog/<slug>/visual-plan.md`; it does not authorize generation, processing, article edits, publication, social posting, deployment, or merge.

`image-only` uses the [image pipeline](../../.agents/skills/traditional-homes-image-pipeline/SKILL.md) after media ownership, licence, attribution, crop, and alt-text decisions are approved.

`revise-draft` uses the [draft revision procedure](../../.agents/skills/blog-revise-draft/SKILL.md); it is limited to approved, verified changes and preserves `draft: true`.

`audit` uses the [content audit procedure](../../.agents/skills/blog-content-audit/SKILL.md), which is read-only unless new editing approval is given.

`publication` uses the [publication procedure](../../.agents/skills/blog-publication/SKILL.md). It requires recorded editorial approval, local and generated-site validation, a draft PR, Pages preview, final evidence, explicit merge approval, and separate production verification. It never auto-publishes or auto-merges.

`BLOG_ORCHESTRATOR.md` selects the mode. `docs/operations/blog-production.md` remains the reference for deterministic local run state and scaffold/status commands.
