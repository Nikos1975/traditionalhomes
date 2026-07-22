---
name: blog-research-article
description: Use when creating or revising research-led Astro blog articles from docs/research. Produces a claim-reviewed draft in the site voice, validates it, and prepares a draft pull request without publishing.
---

# Blog Research Article

Use this skill for historical, cultural, architectural, or place-based articles that must move from a topic brief to a reviewable draft pull request.

## Required reading

Before writing, read:

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

1. Start a dedicated branch from updated `origin/main`, then create the deterministic run scaffold with `npm run blog:scaffold -- --topic "<topic>" --slug <slug>`.
2. Read the topic brief and use the reported overlap as a decision aid. A high-overlap article needs a recorded distinct angle; an exact or near-exact duplicate is blocked.
3. Research authoritative sources, preferring primary, institutional, ecclesiastical, archaeological, and academic material.
4. Complete the scaffolded `source-notes.md`, `sources.json`, and `claims.json` before drafting. Record each important claim, source, URL, status (`verified`, `uncertain`, or `rejected`), and concise reasoning.
5. Draft only from verified claims. Clearly distinguish documented history from tradition. Omit uncertain and rejected claims.
6. Keep new articles at `draft: true` until manual approval.
7. Use owned images by default. Process an approved image with `npm run blog:image`. If rights or attribution are unclear, omit image frontmatter and report the required specification.
8. Run `npm run blog:validate -- <article-path>`.
9. Run the repository tests, `npm run typecheck`, and `npm run build`, one command at a time on Windows.
10. Review the diff and stage only the topic research, article, validator/workflow files, and required handoff documentation.
11. Commit on the dedicated branch, push it, and open a draft pull request for manual approval.

Resume a stopped run with `npm run blog:scaffold -- --resume <run-id>`. Resume preserves user-edited research and blocks unrelated changed files. Inspect an article without writing files with `npm run blog:status -- --slug <slug> --simulate`.

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

## Article rules

- Follow the fields permitted by `src/content.config.ts`.
- Use a specific title, accurate description, ISO publication date, restrained category/region/tags, and `draft: true`.
- Start with a concrete geographical, architectural, or documented historical observation.
- Keep the tone calm, human, factual, and non-promotional.
- End quietly, without booking language.
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
