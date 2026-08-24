# Example — Sequential Content Pipeline

Use numbered stages because each stage intentionally hands an artifact to the next.

```text
content-pipeline/
├── CLAUDE.md
├── CONTEXT.md
├── stages/
│   ├── 01_research/
│   │   ├── CONTEXT.md
│   │   ├── references/
│   │   └── output/
│   ├── 02_draft/
│   │   ├── CONTEXT.md
│   │   ├── references/
│   │   └── output/
│   └── 03_publish-prep/
│       ├── CONTEXT.md
│       ├── references/
│       └── output/
└── _config/
    └── shared/
        ├── voice.md
        ├── citation-policy.md
        └── format-patterns.md
```

- L3: voice, citation policy, reusable format patterns.
- L4: current topic brief, research dossier, article draft, publication package.
- Human review: after research and before any publication action.
- Deterministic scripts: link checks, frontmatter validation, image metadata checks.
