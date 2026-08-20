---
name: traditional-homes-i18n-translation
description: Project-local translation/localization skill for traditional-homes.gr. Use for translating an already-supported route family from the verified English master into a target locale, including natural wording, target-locale content availability for an existing dynamic route, title/meta/H1, UI strings, alt/captions, terminology, and visible-language completeness. Do not use to redesign multilingual infrastructure.
---

# Traditional Homes I18N Translation

Use this skill only through the I18N workspace Stage 02 contract:

`../../workspaces/i18n/stages/02_translation/CONTEXT.md`

## Purpose

Produce complete, natural, target-language pages while preserving the verified English facts, uncertainty, practical cautions, and source ownership.

## Required references

Load only what the Stage 02 Inputs table requires. This skill adds stable Layer 3 references when relevant:

- `references/translation-contract.md`
- `references/seo-localization-boundary.md`
- `references/visible-language-policy.md`
- `references/locales/<target-locale>.md` when that locale reference exists

The current German reference is `references/locales/de.md`. Do not load it for another locale.

## Core rules

1. English is the verified factual and substantive master.
2. Translate faithfully and naturally; do not mechanically mirror English syntax.
3. Preserve every fact, qualification, uncertainty, caution, date, distance, price, condition, and practical limitation unless an approved cross-language correction changes the source.
4. Do not add claims, hype, luxury framing, booking pressure, or SEO assertions absent from the English master.
5. Proper names generally remain unchanged unless there is an established localized form.
6. Localize generic route/UI terminology, headings, title/meta/H1, accessibility text, image captions, and descriptive presentation strings.
7. Do not create a second factual inventory. Presentation mappings may localize how factual values are rendered, but facts remain owned by their structured sources.
8. A page declared as translated must not leave substantive visible interface/content text in English, except proper names, brands, codes, URLs, bare technical identifiers, or intentional English fallback links.
9. The target locale must already have the required route family, generic path segments, route wrapper and shared renderer. For an existing dynamic route family, this stage may add the target-locale `routeMap.content` slug for the new content id, but only in the same bounded change as the complete localized page.
10. If a new route family, generic segment, wrapper, renderer or fallback architecture is required, stop and route to Stage 01 infrastructure.
11. If an English fact appears wrong or outdated, record a proposed cross-language correction. Do not fix only the translation.

## Workflow

### 1. Confirm the route family exists

Use `src/i18n/route-map.ts` and the built route source. The locale must already have the dynamic route family and rendering architecture. A content id that is not yet localized may be activated here by adding its locale slug only when the complete translation ships in the same change. Never create a phantom route.

### 2. Load the exact English source and target working files

Do not read unrelated property pages, blog posts, or locale resources.

For property work, read the relevant structured fact source only for facts the page presents.

### 3. Translate the substantive page

Maintain the same information coverage and degree of certainty as English while using natural target-language structure.

### 4. Localize presentation layers

Review all visible surfaces for the target route:

- title and meta description;
- H1 and headings;
- navigation/breadcrumb labels;
- buttons, filters, forms, map labels;
- aria labels, alt, title, placeholder;
- inventory-derived descriptions;
- group/pairing summaries;
- gallery captions and alt text.

Use stable semantic keys or presentation mappings. Do not move factual values into locale dictionaries merely to make a string translatable.

### 5. Perform visible-language QA

Compare generated target HTML against the English counterpart and scan for untranslated visible strings. Do not use a naive English-word rejection rule; allow proper names, brands, codes, URLs, and deliberate English fallbacks.

### 6. Report cross-language issues separately

Do not silently correct one locale.

### 7. Verify and hand off

Use `scripts/validate-localized-output.mjs` when available and run the Stage 02 verification commands.

Report:

- English source paths;
- target paths;
- terminology decisions;
- Layer 3 references loaded;
- Layer 4 inputs loaded;
- files changed;
- validation;
- unresolved facts/corrections;
- next allowed action.

## Stop conditions

Stop when:

- the locale route family does not exist;
- a new generic route segment, wrapper, renderer, or route architecture is required;
- the English source is ambiguous or factually disputed;
- translation would require a new rendering architecture;
- structured facts would be duplicated into locale resources;
- English output changes unexpectedly;
- validation worsens;
- merge, deploy, publication, or destructive operations require approval.
