---
name: property-content-audit
description: Use when auditing or rewriting Elounda Traditional Homes house or villa pages for inventory accuracy, brand voice, access clarity, SEO, and booking usefulness.
---

# Property Content Audit

Use this skill for house and villa page audits, rewrites, and content QA.

## Source Order

1. `src/inventory/inventory.json` for structured facts: sleeps, bedrooms, bathrooms, floors, stairs, pool, view, parking, access notes, constraints, official groups, and suggested pairings.
2. `src/content/houses/*.md` and `src/content/villa/*.md` for narrative copy.
3. Other project data files only when they clearly provide the missing fact.

Do not invent facts. If a useful detail is not supported by the project data, mark it as `[needs confirmation]`.

## Audit Checklist

- Check every narrative fact against inventory.
- Remove placeholders, bracketed draft text, and conditional copy.
- Flag contradictions between inventory and page copy.
- Remove hype, urgency, generic luxury language, and destination clichés.
- Preserve a calm, precise, understated brand voice.
- Make the page useful for booking decisions: layout, sleeping arrangement, outdoor space, pool, view, privacy, parking, access, constraints, and who the property suits.
- Keep official groups separate from suggested pairings.
- Avoid implying private or exclusive use unless inventory supports it.
- Confirm square-metre and history claims before keeping them.
- Keep SEO titles and descriptions specific to the property.

## Output Format

For an audit file, use a checklist:

- Global issues first.
- Priority fixes next.
- One checklist section per property.
- Mark uncertain facts as `[needs confirmation]`.
- Separate "must fix before publish" from "phase 2 improvements" when scope is large.

For rewrites, keep changes scoped to content files unless the user asks for component or data changes.
