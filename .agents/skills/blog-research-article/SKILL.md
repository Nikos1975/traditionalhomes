---
name: blog-research-article
description: Use when creating or revising research-led Astro blog articles from docs/research. Produces a claim-reviewed draft in the site voice, validates it, and prepares a draft pull request without publishing.
---

# Blog Research Article

Use this skill for historical, cultural, architectural, or place-based articles that must move from a topic brief to a reviewable draft pull request.

## Required reading

Before writing, read:

- `BLOG_ORCHESTRATOR.md`
- `AGENTS.md`
- `CLAUDE.md`
- `.ai/brand/website-brand-style-guide.md`
- `.ai/prompts/blog-editorial-system.md`
- `docs/agent-handoff-notes.md`
- `src/content.config.ts`
- related posts in `src/content/blog/`
- every file in the topic's `docs/research/<area>/<topic>/` folder

`.ai/` is the canonical editorial path. Do not create a parallel `ai/` folder or another blog-writing skill.

## Topic brief

The initiating prompt or topic file must state:

- working title and intended reader
- article angle and geographic scope
- claims or questions to investigate
- owned-image location and publication permission, if available
- required internal links, if any
- target article path

If a raw draft is supplied, treat it only as an unverified research lead.

## Controlled workflow

Follow this sequence:

1. Start a dedicated branch from updated `origin/main`, then create the deterministic run scaffold with `npm run blog:scaffold -- --topic "<topic>" --slug <slug>`. Before creating run or research files, scaffolding compares the proposed topic and slug with existing article titles/slugs and relevant research-topic folder names. Low overlap reports and continues; medium overlap warns and continues; exact or near-exact duplication blocks without writing files. For high overlap, rerun only with an explicit, defensible angle: `--distinct-angle "<explanation>"`.
2. Read the topic brief and overlap report. A supplied distinct angle is stored in both `topic-brief.md` and the run record.
3. Research authoritative sources, preferring primary, institutional, ecclesiastical, archaeological, archival, and academic material.
4. Complete the scaffolded `source-notes.md`, `sources.json`, and `claims.json` before drafting. Record each important claim, source, URL, status (`verified`, `uncertain`, or `rejected`), and concise reasoning.
5. For historical or cultural work, complete the editorial-interpretation gate before drafting. Convert the verified claims into a coherent human history: central human question, life cycle, people, practical activity, physical setting, constraints, transition, what survives, useful comparison if any, one-sentence thesis, and narrative architecture. Record a compact `## Editorial interpretation` section in the existing `topic-brief.md`; do not create another planning file.
6. Draft only from verified claims and the approved editorial interpretation. Clearly distinguish documented history from tradition. Omit uncertain and rejected claims. The dossier constrains the article but does not dictate its section order.
7. Keep new articles at `draft: true` until manual approval.
8. Use owned images by default. Process an approved image with `npm run blog:image`. If rights or attribution are unclear, omit image frontmatter and report the required specification.
9. Before declaring the draft complete, compare it with the research dossier and claims register. Report whether any high-value verified material was omitted solely for brevity. If so, apply the Evidence-Led Depth rule in `.ai/prompts/blog-editorial-system.md`: reconsider the omission and incorporate it when leaving it out would materially reduce the reader's understanding.
10. Run `npm run blog:validate -- <article-path>`.
11. Run the repository tests, `npm run typecheck`, and `npm run build`, one command at a time on Windows.
12. Review the diff and stage only the topic research, article, validator/workflow files, and required handoff documentation.
13. Commit on the dedicated branch, push it, and open a draft pull request for manual approval.

Resume a stopped run with `npm run blog:scaffold -- --resume <run-id>`. When the run is blocked, resume uses `resumeBlockedRun(run, now)` to restore the recorded previous state, clear the block, preserve completed states, and update the timestamp. Resume preserves user-edited research and blocks unrelated changed files. Inspect an article without writing files with `npm run blog:status -- --slug <slug> --simulate`; status reports the inspected slug's self-match separately from external overlap and wraps simulation metadata around a schema-valid run.

Never auto-merge, push directly to `main`, or publish a draft article.

## Source review rules

- A search result, generated summary, travel article, or raw draft is a lead, not evidence.
- Prefer the most direct source available. Use secondary sources only when their authority and sourcing are clear.
- Record conflicts rather than silently choosing a convenient date or version.
- Do not publish unsupported dates, distances, opening hours, quotations, named-person claims, destruction narratives, or restoration timelines.
- Keep source wording out of the article unless a short quotation is essential and correctly attributed.

Recommended source-note table:

```markdown
| Claim | Supporting source | URL | Status | Reasoning |
| --- | --- | --- | --- | --- |
```

## Editorial-interpretation gate for historical / cultural articles

Claim review answers:

```text
What do we know?
How do we know it?
What remains uncertain?
```

Before drafting, the editorial interpretation must also answer:

```text
What is the central human question?
What is the life cycle of the place, object, or practice?
Who used it, and what did they actually do?
What physical and environmental conditions shaped that activity?
How was the activity organised materially?
What changed, declined, disappeared, or was reused?
What remains today?
Does a wider comparison genuinely clarify the local story?
What one-sentence thesis expresses the whole historical movement?
What narrative architecture best carries that thesis?
```

The preferred baseline is:

```text
PLACE
→ environment and physical setting
→ why the place existed or mattered
→ who used it
→ what people actually did there
→ how that activity fitted into everyday life
→ constraints: water, terrain, labour, economy, technology
→ how the activity was physically organised
→ what changed
→ why the former use declined, disappeared, or changed
→ what survives today
→ what the surviving place allows us to understand or remember
```

Human history comes first. Make daily life physically understandable where the evidence allows it, but do not invent scenes, conversations, tools, rituals, emotions, transport methods, or social detail.

Treat the place itself as evidence where appropriate: landscape, steps, walls, channels, machinery, water, paths, buildings, images, and field observations can explain how an activity worked or what survives. Do not infer dates, functions, or historical practices solely from present appearance.

Keep wider comparisons selective. Another Greek or Mediterranean example belongs only when it explains terminology, technology, environmental adaptation, or a shared practice without displacing Elounda or Mirabello as the centre.

Separate natural continuity from human change. A spring may still flow after its former household use ends; a windmill may remain after milling stops; a warehouse may survive after its commercial function disappears. State precisely what continued and what changed.

Detailed caveats belong mainly in the research record. The public article should remain evidence-safe without reading like a claim register. Qualify uncertainty where it materially changes understanding; do not repeat defensive wording in every paragraph.

Do not draft until this interpretation forms a coherent story. If the verified evidence cannot support a coherent life cycle, narrow the article angle rather than filling gaps.

## Article rules

- Follow the fields permitted by `src/content.config.ts`.
- Use a specific title, accurate description, ISO publication date, restrained category/region/tags, and `draft: true`.
- Start with a concrete geographical, architectural, documented historical, or present-day physical observation that serves the thesis.
- Keep the tone calm, human, factual, and non-promotional.
- For historical/cultural work, prefer place → people → work → conditions → change → surviving evidence → memory over fact → citation → caveat sequencing.
- End with the meaning of the place's historical change, not a recap or booking language.
- Historical articles must include `## Sources and Image Credits`.

## Required validation

```powershell
npm run blog:validate -- src/content/blog/<article>.md
node --test tests/contact-function.test.mjs tests/i18n-foundation.test.mjs tests/blog-article-validator.test.mjs
npm run typecheck
npm run build
```

The article validator checks permitted frontmatter fields, title, publication date, draft boolean, image existence and alt text, placeholders, internal links, and a sources section for historical posts.

If the build fails only because Windows locks generated output or Vite cache files, follow `docs/operations/repeated-failures-playbook.md`. Do not change source to repair an environment lock.

## Pull-request boundary

The pull request should contain only the reviewed topic research, article draft, workflow/validator changes, and required documentation updates. It must remain a draft until a human verifies the article, image rights, and publication timing.
