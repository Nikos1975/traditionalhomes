# Shared ICM Upstream

This project keeps a local installed copy of the cross-project ICM standard so agents do not depend on network access at runtime.

Canonical upstream:

- repository: `Nikos1975/nikos-agent-skills`
- path: `skills/shared/icm-workspace-architect/`
- pinned source commit: `786b382aab6fe65f6b45df882a4aadef195b5f1f`

The canonical cross-project rules file is `ICM_RULES.md`. Its pinned SHA-256 is recorded in `.agents/skills.lock.yaml`.

The Traditional Homes installation may retain project-useful supporting files that are not present in the minimal shared package. Those files are local extensions and must not change the meaning of the canonical ICM rules.

Updates are manual and reviewed. Do not replace the local copy from a floating branch.
