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

## House layout writing rules

- Do not write generic property copy when layout facts are available.
- Describe the house as a guest would physically experience it.
- Use a spatial walkthrough where facts are known: approach to the house, entrance, what is on the left, what is on the right, what is ahead, bathroom position, kitchen or kitchenette position, fireplace position, stair position, ontas or raised sleeping area, bedroom position, and balcony, courtyard, veranda, or pool relation.
- Use `ontas` where relevant and explain it as the traditional raised sleeping area.
- Do not describe an ontas as a full second floor unless the house is truly arranged over two full floors.
- Do not invent dimensions, distances, historical claims, exclusivity claims, or views.
- Do not say "fully equipped kitchen" unless the inventory or source confirms it.
- Do not say "luxury," "perfect," "hidden gem," "ideal," or use generic booking language.
- Keep tone factual, calm, and understated.
- Preserve practical constraints: stairs, shared pool vs private pool, external bathroom if applicable, parking distance, step-free or not step-free access, and balcony, courtyard, veranda, or pool size limitations.
- Align house copy with `src/inventory/inventory.json` and visible At a Glance fields.
- If user-provided layout details conflict with inventory, stop and flag the conflict instead of silently choosing one.
- When changing a property page, update `docs/agent-handoff-notes.md` with a short factual note.

### Anti-generic examples

Bad:

> The house has one bedroom, one bathroom, living space, and a fully equipped kitchen.

Better:

> On entering the house, the fireplace is on the left. Ahead is the kitchen table, while the small kitchen sits to the right, tucked beneath the internal wooden stair. The stair leads first to the ontas, the traditional raised sleeping area.

### Required verification checklist

Before finishing a property rewrite, verify:

- No unsupported claims were added.
- No generic layout phrase remains if a more specific layout is known.
- Stairs, ontas, and floor wording is accurate.
- Shared/private pool wording is accurate.
- Bedroom, bathroom, and kitchen positions match user facts.
- Inventory and At a Glance remain consistent.
- Build result is reported, or Windows EPERM cache lock is reported as an environment issue.

## Output Format

For an audit file, use a checklist:

- Global issues first.
- Priority fixes next.
- One checklist section per property.
- Mark uncertain facts as `[needs confirmation]`.
- Separate "must fix before publish" from "phase 2 improvements" when scope is large.

For rewrites, keep changes scoped to content files unless the user asks for component or data changes.
