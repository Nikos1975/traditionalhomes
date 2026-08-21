# Repeated Failures Playbook

Use this playbook when a known repo failure pattern appears. Do not turn environment locks or workflow mistakes into source changes.

| Failure | Symptom | Correct response | Forbidden response | Build required? | Where rule lives |
|---|---|---|---|---:|---|
| Windows `EPERM` on `dist/` | Build fails while unlinking a file under `dist/`, often `apple-touch-icon.png` | Treat as generated-output lock. Clear `dist/` once and rerun build for source/content/package changes. For docs-only commits, proceed only after exact staged-file verification. | Edit source files, rename public assets, or commit generated output to fix the lock. | Yes for source/content/package; no for exact docs-only | `CLAUDE.md`, `agent-operating-model.md`, this playbook |
| Windows `EPERM` on `node_modules/.vite/` | Build fails while unlinking Vite optimized dependency files | Treat as generated-cache lock. Clear `node_modules/.vite/` once and rerun build when build is required. | Change dependencies, package files, or source code to fix a cache lock. | Yes when the underlying task requires build | `agent-operating-model.md`, this playbook |
| Broad staging risk | Dirty tree contains unrelated docs, media, lockfile, local memory, or research files | Review status and diffs, classify files, stage explicit paths only. | Use `git add .` or `git add -A`. | Depends on staged scope | `agent-operating-model.md` |
| Phase mixing | One commit would include UI, content, docs, package noise, or backlog together | Split into one reviewed phase per commit. | Commit mixed changes for convenience. | Depends on phase | `CLAUDE.md`, `agent-operating-model.md` |
| `package-lock.json` metadata noise | Lockfile adds metadata such as `"dev": true` across many packages while `package.json` is unchanged | Classify as review-needed; usually revert or leave uncommitted unless dependency work is intentional. | Commit lockfile churn in a content/docs/UI commit. | Yes if intentionally committing package changes | `agent-operating-model.md`, this playbook |
| `.ai/memory/conventions.md` local/session memory | `.ai/memory` changes reflect agent preferences or session state | Treat as local/session memory unless Nikos explicitly asks to commit it. | Commit local memory as project process rules. | No | `CLAUDE.md` commit policy, this playbook |
| Untracked research/media backlog | `docs/research`, `docs/integrations`, `docs/superpowers`, or media files appear as untracked backlog | Classify, archive outside repo if requested, or commit later with related content. | Stage backlog with product changes. | No unless converted into live content | `source-of-truth.md`, `agent-operating-model.md`, this playbook |
| Orphaned blog images | Files in `public/images/blog/` are not referenced by live content | Report as orphaned or archive outside repo. Commit only with the article that references them. | Commit orphaned images as a standalone product change. | Yes if referenced by live page/content | `media-ownership.md`, this playbook |
| Public vs `src` image placement confusion | Unsure whether image belongs in `public/images` or `src/assets/images` | Use `public/images` for stable URLs and Markdown/frontmatter. Use `src/assets/images` for Astro imports. | Move images broadly without reference audit. | Yes if live references change | `media-ownership.md`, `agent-operating-model.md` |
| `public/en/images/` legacy folder risk | New work tries to place images under `public/en/images/` | Avoid for new work. Prefer `/images/...` public URLs unless reference audit proves otherwise. | Add new assets to legacy folder because an old path exists. | Yes if live references change | `media-ownership.md`, this playbook |
| Unsupported property/about copy claims | Copy says or implies unsupported heritage, oldest, first, built-in, luxury, exclusive, distance, or square-metre claims | Verify against inventory/source docs, use safer wording, or flag `[needs confirmation]`. | Polish unsupported claims into confident marketing copy. | Yes for live content changes | `CLAUDE.md`, `source-of-truth.md`, `.agents/workspaces/property-content/CONTEXT.md` |
| Missing image file/path mismatch | Page shows alt text or image 404; requested asset path does not exist | Confirm actual file exists before editing. If the required file is missing, stop and report. | Invent another path, use legacy folder, or move unrelated images. | Yes if source/reference changes | `media-ownership.md`, this playbook |
| Docs-only commits blocked by `EPERM` | Build is requested for docs-only scope and fails only on generated output | If staged list is exact and docs-only, commit may proceed when Nikos approves or requested process allows it. | Edit source or abandon docs commit as if it were an app error. | No, after exact docs-only verification | `agent-operating-model.md`, this playbook |
| Source commits attempted without build | Source/component/content/package files are ready to commit but build was skipped | Run build first. If generated-output `EPERM` blocks it, clear cache/output and rerun before committing. | Commit source changes without build because the diff looks small. | Yes | `CLAUDE.md`, `agent-operating-model.md` |
| Accidental push risk | Agent creates a commit and might continue to publish | Stop after local commit unless Nikos explicitly asks to push. | Push automatically after commit. | N/A | `agent-operating-model.md`, task instructions |

## Fast response commands

Check status:

```powershell
git status --short
```

Check staged files:

```powershell
git diff --cached --name-only
```

Clear `dist`:

```powershell
Remove-Item -LiteralPath .\dist -Recurse -Force -ErrorAction SilentlyContinue
```

Clear `.vite`:

```powershell
Remove-Item -LiteralPath .\node_modules\.vite -Recurse -Force -ErrorAction SilentlyContinue
```

Run build:

```powershell
npm run build
```
