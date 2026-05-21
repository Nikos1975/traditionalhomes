---
name: astro-build-triage
description: Inspect an Astro repo, separate real build/code issues from Windows cache or lock issues, make the smallest safe fix, and verify with build.
---

# Purpose

Use this skill for Astro debugging, build fixes, content validation, and minimal repair work.

# Workflow

1. Inspect the actual repo state first.
2. Identify the issue category:
   - content/schema validation
   - code/type/build logic
   - Windows filesystem/cache lock
3. Do not begin broad refactors unless explicitly requested.
4. Prefer the smallest safe change set.
5. Before edits, summarize:
   - root cause
   - exact files to change
   - why broader refactors are excluded
6. After changes, run the build.
7. Report:
   - whether build passed
   - whether the issue was environmental or code/content related
   - optional Phase 2 refactors separately

# Constraints

- Preserve static-first behavior
- Avoid heavy JavaScript
- Avoid unnecessary dependencies
- Keep house pages stable unless required
- Treat duplication as backlog unless it blocks correctness