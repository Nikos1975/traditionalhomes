---
name: blog-research-article
description: Use when creating or revising Astro blog articles from project research folders under docs/research, especially Elounda history, guide, tourism, or local context posts that must follow the site brand voice, SEO rules, and build/typecheck workflow.
---

# Blog Research Article

Use this skill to turn research notes into publishable blog posts for the Astro site.

## Inputs

Research should live outside `src/`, usually:

```text
docs/research/elounda/<topic-slug>/
  sources.md
  facts.md
  angles.md
  draft-notes.md
  assets/
```

Published posts go only in:

```text
src/content/blog/
```

Never place research or internal instruction markdown under `src/pages/`.

## Read First

Before writing, read:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/agent-handoff-notes.md`
- `src/content.config.ts`
- related existing posts in `src/content/blog/`
- the topic folder's `sources.md`, `facts.md`, `angles.md`, and `draft-notes.md`

## Workflow

1. Classify the task:
   - new blog article
   - revision to an existing article
   - research organization
   - blog index/category follow-up

2. Screen facts before drafting:
   - Prefer `facts.md` over raw `sources.md`.
   - Treat `sources.md` as raw research, not publish-ready truth.
   - Omit uncertain dates, distances, investment figures, named-person claims, and dramatic anecdotes unless supported by a reliable source.
   - Put uncertain but useful ideas in `draft-notes.md`, not in the published article.

3. Choose one clear angle:
   - Match the article to one search intent.
   - Avoid duplicating existing posts.
   - If a topic overlaps an existing article, revise the existing article or narrow the new one.

4. Write in project voice:
   - calm, precise, understated
   - grounded, factual, useful
   - no hype, urgency, sales language, or generic travel phrasing
   - no booking-copy tone
   - concrete geography, practical context, quiet ending

5. Use schema-valid frontmatter from `src/content.config.ts`:

```yaml
---
title: "Specific Durable Title"
description: "Accurate one-sentence summary of the article."
pubDate: 2026-05-21
category: "Location Guide"
region: "Elounda, Lasithi, Eastern Crete"
tags:
  - elounda
  - crete
image: "/images/location-map.jpg"
imageAlt: "Plain description of the image"
---
```

6. Add internal links only when contextually useful:
   - `/en/location/`
   - `/en/houses/`
   - `/en/guide/mavrikiano/`
   - `/en/guide/vrouchas/`

7. Self-audit before verification:

```powershell
rg -n "luxury|exclusive|must-see|hidden gem|paradise|unforgettable|spectacular|best|perfect|world-class|premier|lavish|haunting|tragic|horror|desperate" src/content/blog/<article>.md
rg --files src/pages | rg "\.md$"
```

If matches are factual and restrained, they may stay. Otherwise rewrite.

8. Verify:

```powershell
npm run typecheck
npm run build
```

Run one command at a time on Windows. If build fails with `EPERM` on `.astro` or `node_modules/.astro`, classify it as a Windows filesystem/cache lock and retry once before changing code.

9. Update `docs/agent-handoff-notes.md` for multi-article work:
   - goal
   - files changed
   - verification
   - remaining work
   - blockers or facts needing confirmation

## Commit Boundaries

Keep blog work separate from unrelated local workflow files.

Usually stage:

```text
src/content/blog/<article>.md
docs/research/<topic>/
docs/superpowers/plans/<plan>.md
docs/agent-handoff-notes.md
.agents/skills/blog-research-article/SKILL.md
```

Do not stage unless explicitly requested:

```text
.agent/
.ai/
.claude/
.codex/
CLAUDE.md
package-lock.json
```
