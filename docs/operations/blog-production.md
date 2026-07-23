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

Before creating `.blog-runs`, research directories, or files, scaffolding validates the slug and compares the proposed topic and slug with existing blog article titles/slugs and relevant research-topic folder names. The closest normalized three-word-shingle match controls the gate:

- low: report and continue
- medium: warn and continue
- high: block unless `--distinct-angle "<explanation>"` is supplied
- exact or near-exact duplicate: block

The distinct-angle explanation is stored in `topic-brief.md` and `run.json`. A duplicate or high-overlap proposal without the required angle makes no filesystem changes. Scaffolding also refuses an existing article, research directory, run directory, or dirty working tree.

Resume without replacing user-edited files:

```powershell
npm run blog:scaffold -- --resume <run-id>
```

Resume permits changes only in that run's research, article, source-image, and processed-image paths. Any unrelated changed file blocks the operation. If the run state is `blocked`, resume calls `resumeBlockedRun(run, now)`: it requires a valid recorded previous state, restores that state, clears `blocked`, preserves `completedStates`, and updates `updatedAt`. Non-blocked runs are reopened without a state transition.

Read-only inspection does not create a run, branch, or pull request:

```powershell
npm run blog:status -- --slug <slug> --simulate
```

Status reports whether an article exists, whether it is a draft, its research directory, baseline validator results, and overlap with other existing posts. The inspected slug's own exact match is reported separately as `selfMatch` and excluded from external overlap results. Simulation output has the shape `{ simulatedRun: { simulated: true, run: <schema-valid run> } }`; metadata is not added to the run object.

Overlap uses normalized three-word shingles. Subject similarity alone does not block a legitimate narrower or follow-up article when its distinct angle is explicit.

## Scope boundary and failures

- Phase 1A adds no dependencies and changes no article, image, route, page, or deployment configuration.
- Publication automation, expanded article/image validation, rendered-output verification, external-link checking, Cloudflare polling, and browser automation are outside Phase 1A.
- Do not retry by deleting source, research, or media.
- Preserve the branch and run record when blocked.
- Fix only the reported in-scope problem, then resume from the recorded state.
- Treat Windows `dist` or Vite `EPERM` failures according to `repeated-failures-playbook.md`.
- Do not normalize unrelated typecheck errors.
