# Workspace Context

## Purpose

[Describe the overall workflow and why these workspaces/stages exist.]

## Flow

```text
[input] → [stage/workspace] → [stage/workspace] → [output]
```

## Shared references

| Path | Layer | Purpose |
|---|---|---|
| `_config/shared/[file].md` | L3 | [stable rule] |

## Handoff rules

- [Which stage may consume which output.]
- [What must be approved before the next stage.]

## Global exclusions

- Do not load [large/irrelevant area] unless a routed task requires it.
- Do not treat run-specific artifacts as persistent policy.
