# Example — Hybrid Workspace

Use a hybrid when one area is a pipeline but other work is independent.

```text
business-project/
├── AGENTS.md
├── content/
│   ├── CONTEXT.md
│   └── stages/
│       ├── 01_research/
│       ├── 02_draft/
│       └── 03_distribution-prep/
├── website/
│   └── CONTEXT.md
├── operations/
│   └── CONTEXT.md
└── _config/
    └── shared/
```

The content pipeline has ordered handoffs. Website and operations are separate mental modes and should not be forced into the same stage sequence.
