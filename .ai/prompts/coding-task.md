# Coding Task Prompt Template

This file is a reference template for how coding prompts should be structured.

The actual prompt is assembled automatically by `run-ai.mjs` from the files in `.ai/memory/`.

## Prompt structure
- Project Architecture
- Conventions
- Current Task
- Relevant Decisions
- Known Bugs or Risks
- Relevant Files
- User Request

## Expected output
- Root cause
- Safest fix
- Exact code changes
- Risks, trade-offs, and follow-up work

## Rules
- Prefer simple, maintainable fixes
- Avoid unnecessary dependencies
- Preserve Astro static-first design
- Avoid heavy client-side JavaScript
- Keep content structured and reusable