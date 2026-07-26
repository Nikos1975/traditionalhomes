# Blog Orchestrator

Read this file before any blog post, area guide, village guide, historical article, blog revision, blog audit, publication, or blog-image task. It coordinates existing instructions; it does not replace editorial, research, validation, or media rules.

## Initial mode

Classify the request into exactly one initial mode before work begins:

- `new-article`: create a claim-reviewed draft from a new research run.
- `revise-draft`: revise an existing draft without changing its publication status.
- `audit`: inspect an article, research record, claims, links, or media without publishing.
- `publication`: prepare an approved draft for human publication review; publication remains manual.
- `image-only`: assess or process approved blog media without changing article copy or publication status.

Choose the mode that matches the requested primary outcome. Activities within that workflow, such as claim review, validation, or image processing, do not create another initial mode. Stop only when the requested primary outcome is genuinely ambiguous.

## Universal preflight

Every mode must read these in order before researching, drafting, editing, validating, processing media, or publishing:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `BLOG_ORCHESTRATOR.md`
4. `.ai/brand/website-brand-style-guide.md`
5. `.ai/prompts/blog-editorial-system.md`
6. The relevant repository skill
7. `docs/operations/blog-production.md`

## Staged research-record reads

The task-specific source of truth is `docs/research/blog/<slug>/topic-brief.md`.

### `new-article`

An explicit user topic request may initialize `npm run blog:scaffold`. The scaffold is allowed before `topic-brief.md`, `source-notes.md`, `sources.json`, and `claims.json` exist. After scaffolding, read and complete those files, then read the affected and related articles. Stop before research or drafting when the generated topic brief is inadequate. Do not infer missing angle, scope, claims, image rights, or publication plan.

### Existing-content modes

`revise-draft`, `audit`, `publication`, and `image-only` require an existing topic brief. Read applicable `source-notes.md`, `sources.json`, and `claims.json` before editing or publication work, as well as the affected and related articles. When older content has no research record, report that clearly instead of inventing one silently.

## Mode routing

| Mode | Required workflow |
| --- | --- |
| `new-article` | Use `blog-research-article`, scaffold the run, complete claim records, write only verified claims, keep the article at `draft: true`, and prepare a draft PR for review. |
| `revise-draft` | Read the topic brief, claims, sources, draft, and related articles; preserve `draft: true`; update only approved, verified material and validate the affected article. |
| `audit` | Inspect the defined scope read-only unless a follow-up edit is approved; report verified, rejected, and uncertain claims separately. |
| `publication` | Confirm manual editorial approval, verified claims, image rights, final validation, and exact file scope. Do not automatically publish, merge, or change a draft without that approval. |
| `image-only` | Use `traditional-homes-image-pipeline` after confirming the article, approved crop, ownership or licence, alt/decorative status, and destination. Do not alter article copy or publication status. |

## Required controls

- Use verified claims only. Record unsupported, conflicting, and uncertain claims instead of publishing them.
- New articles must use `draft: true`.
- Use owned or clearly licensed images only; stop when rights, attribution, crop approval, or source ownership is unclear.
- No automatic publication and no automatic merge. Manual editorial approval is required before publication work completes.
- Keep an exact file scope. Stop on unexpected files.
- Complete the applicable article, repository, build, link, typecheck, and diff validation before reporting completion.

### Draft article requirements

A draft article needs an adequate topic brief, completed source and claim records, verified claims only, `draft: true`, valid owned or licensed media (or an explicit documented omission), required internal links, and the validation required by the relevant skill.

### Publication candidate requirements

A publication candidate needs all draft requirements plus recorded manual editorial approval, confirmed publication timing, confirmed image rights and credits, a final review of related articles and links, clean full validation, and a human decision to publish. A candidate is not permission to publish or merge.

## Stop conditions

Stop and report the blocker for an unsupported claim, conflicting sources, unclear image rights, unclear article angle, missing or inadequate topic brief, unexpected files, a real build or validation failure, or missing publication approval.

## Final report

Report: mode; objective; files read; claims verified, rejected, and uncertain; article status; image status; validation; changed files; approval needed; and next allowed action.
