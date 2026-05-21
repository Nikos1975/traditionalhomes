# Clean Commit Plan

Generated: 2026-05-21 16:49:19

## Summary

- `01-product-content-data`: 0 path(s)
- `02-ui-map-behavior`: 0 path(s)
- `03-build-deploy-tooling`: 0 path(s)
- `04-agent-project-docs`: 6 path(s)
- `98-review-needed`: 6 path(s)
- `99-excluded-local-workflow`: 5 path(s)

## Recommended Commit Order

1. `01-product-content-data` - property copy, inventory facts, content display data.
2. `02-ui-map-behavior` - UI, maps, templates, shared visual behavior.
3. `03-build-deploy-tooling` - build/deploy config and scripts after review.
4. `04-agent-project-docs` - only if project agent docs/skills should be versioned.

## Stage Commands

```powershell
git add --pathspec-from-file=docs/commit-plan/groups/01-product-content-data.txt
git diff --cached --stat
npm run build
npm run typecheck
```

```powershell
git add --pathspec-from-file=docs/commit-plan/groups/02-ui-map-behavior.txt
git diff --cached --stat
npm run build
npm run typecheck
```

```powershell
git add --pathspec-from-file=docs/commit-plan/groups/03-build-deploy-tooling.txt
git diff --cached --stat
npm run build
npm run typecheck
```

```powershell
git add --pathspec-from-file=docs/commit-plan/groups/04-agent-project-docs.txt
git diff --cached --stat
npm run build
npm run typecheck
```

## Review Notes

- Do not stage `99-excluded-local-workflow` unless explicitly requested.
- Inspect `98-review-needed` manually before deciding where each path belongs.
- If staging deploy header changes, confirm whether `public/_headers.txt` was intentionally renamed to `public/_headers`.
- If `package-lock.json` is in review-needed, commit it only if npm lockfile metadata churn is intentional.

## 01-product-content-data

- None

## 02-ui-map-behavior

- None

## 03-build-deploy-tooling

- None

## 04-agent-project-docs

- `CLAUDE.md`
- `docs/agent-handoff-notes.md`
- `docs/commit-plan/clean-commit-plan.md`
- `docs/commit-plan/groups/02-ui-map-behavior.txt`
- `docs/commit-plan/groups/04-agent-project-docs.txt`
- `docs/commit-plan/groups/98-review-needed.txt`

## 98-review-needed

- `docs/codex-5-3-router.md`
- `package-lock.json`
- `scripts/audit_blog_metadata.py`
- `scripts/audit_brand_language.py`
- `scripts/audit_public_markdown.py`
- `scripts/blog_index_summary.py`

## 99-excluded-local-workflow

- `.agent/`
- `.ai/memory/conventions.md`
- `.ai/memory/conventions.md.tmp.4907.1775928805346`
- `.claude/`
- `.codex/`

