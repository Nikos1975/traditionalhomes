# Blog Production Run Foundation

Phase 1A provides deterministic, local safeguards around the existing Codex-led editorial workflow. It does not research, verify claims, write articles, select images, publish content, create publication branches, or open pull requests.

## Local and durable state

Ignored operational state lives under:

```text
.blog-runs/<run-id>/
  run.json
  command-log.json
  transient-checks.json
```

`run.json` follows `scripts/blog/schemas/run.schema.json`. The run ID, topic, slug, base commit, and creation timestamp are immutable. Command records reject fields named like credentials, tokens, headers, or environment data. Transient checks may be replaced on retry.

Durable, reviewable research scaffolding lives under:

```text
docs/research/blog/<slug>/
  topic-brief.md
  source-notes.md
  sources.json
  claims.json
  run-summary.json
```

Do not store credentials, request headers, complete copyrighted source pages, private environment values, or raw browser sessions in either location.

## Run states

Phase 1A records the editorial run through manual approval:

```text
initialized
overlap-checked
researched
claims-reviewed
drafted
media-ready
validated
draft-pr-open
editorial-approved
```

`blocked` records the reason and preceding state without deleting completed work. Sequential transitions are enforced.

## Create, resume, and inspect

Start from a clean dedicated branch based on updated `origin/main`:

```powershell
npm run blog:scaffold -- --topic "<topic>" --slug <slug>
```

Scaffolding validates the slug and refuses an existing article, research directory, run directory, or dirty working tree.

Resume without replacing user-edited files:

```powershell
npm run blog:scaffold -- --resume <run-id>
```

Resume permits changes only in that run's research, article, source-image, and processed-image paths. Any unrelated changed file blocks the operation.

Read-only inspection does not create a run, branch, or pull request:

```powershell
npm run blog:status -- --slug <slug> --simulate
```

Status reports whether an article exists, whether it is a draft, its research directory, baseline validator results, overlap with existing posts, and an in-memory simulated run record.

Overlap uses normalized three-word shingles. Low overlap is informational, medium overlap warns, high overlap requires a distinct angle, and exact or near-exact duplication blocks. Subject similarity alone does not block a legitimate narrower or follow-up article.

## Scope boundary and failures

- Phase 1A adds no dependencies and changes no article, image, route, page, or deployment configuration.
- Publication automation, expanded article/image validation, rendered-output verification, external-link checking, Cloudflare polling, and browser automation are outside Phase 1A.
- Do not retry by deleting source, research, or media.
- Preserve the branch and run record when blocked.
- Fix only the reported in-scope problem, then resume from the recorded state.
- Treat Windows `dist` or Vite `EPERM` failures according to `repeated-failures-playbook.md`.
- Do not normalize unrelated typecheck errors.
