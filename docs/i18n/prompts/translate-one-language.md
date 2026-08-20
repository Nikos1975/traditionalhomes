# Superseded: Translate One Language Prompt

This file is retained for history only. Do not use it as the active translation procedure.

The repository now routes multilingual work through the ICM control plane:

```text
CONTEXT.md
  → .agents/workspaces/i18n/CONTEXT.md
      → stages/01_infrastructure/CONTEXT.md   (when route/rendering infrastructure is required)
      → review gate
      → stages/02_translation/CONTEXT.md      (for localization of an already-supported route)
```

The active Layer 3 translation procedure is:

`.agents/skills/traditional-homes-i18n-translation/SKILL.md`

The active infrastructure procedure is:

`.agents/skills/traditional-homes-astro-i18n-infrastructure/SKILL.md`

Why this prompt was retired:

- it instructed agents to load a broad fixed document set instead of letting the Layer 2 stage contract select only relevant context;
- it incorrectly said to preserve public slugs rather than separating stable internal identities from locale-specific public URLs;
- it did not include generated visible-language completeness checks;
- it did not encode the facts-vs-presentation boundary proven by the German reference implementation;
- it mixed translation instructions with infrastructure and operational safety rules that now belong to separate scoped layers.

Do not delete this file until the ICM migration is complete and all active references to it have been removed.

---

## Historical prompt

The former procedure translated one approved language scope from English, preserved factual parity, avoided unsupported claims, kept shared media paths, protected contact/Cloudflare/email behavior, ran relevant validation, and reported changed files and unresolved facts.

Those durable requirements have been moved into the current Stage 02 contract and translation skill. Future changes should be made at those canonical sources rather than editing this historical prompt.
