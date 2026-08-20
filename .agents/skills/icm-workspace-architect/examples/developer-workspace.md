# Example — Developer Workspace

Use a workspace architecture because planning, implementation, documentation, and operations are different mental modes rather than a single strict linear pipeline.

```text
my-app/
├── AGENTS.md
├── planning/
│   ├── CONTEXT.md
│   ├── specs/
│   ├── architecture/
│   └── decisions/
├── src/
│   ├── CONTEXT.md
│   └── ...
├── docs/
│   ├── CONTEXT.md
│   └── ...
└── ops/
    ├── CONTEXT.md
    └── ...
```

Routing is the critical control:

| Task | Go to | Read | Skills/tools |
|---|---|---|---|
| Define feature | `/planning` | `CONTEXT.md` | — |
| Implement | `/src` | `CONTEXT.md` + approved spec | testing |
| Document | `/docs` | `CONTEXT.md` | doc-authoring |
| Deploy/debug infra | `/ops` | `CONTEXT.md` | deployment-verification |

Do not make `/planning` read implementation test fixtures by default, and do not load deployment credentials into documentation work.
