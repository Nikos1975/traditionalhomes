---
name: traditional-homes-astro-i18n-infrastructure
description: Project-local Astro multilingual infrastructure skill for traditional-homes.gr. Use for locale routes, route-map entries, shared renderers, locale-aware components, fallbacks, canonical/hreflang, sitemap, llms.txt, and structural multilingual validation. Do not use for broad translation.
---

# Traditional Homes Astro I18N Infrastructure

Use this skill only through the I18N workspace Stage 01 contract:

`../../workspaces/i18n/stages/01_infrastructure/CONTEXT.md`

## Purpose

Keep multilingual infrastructure explicit, static-first, fail-closed, and tied only to routes that really exist.

## Required references

Load only what the Stage 01 Inputs table requires. This skill adds the following stable Layer 3 references when relevant:

- `references/route-contract.md`
- `references/shared-renderer-contract.md`
- `references/seo-hreflang-sitemap-contract.md`
- `references/validation-baseline.md`

Use `src/i18n/route-map.ts` as the live authority for implemented localized routes. Do not copy its current route list into this skill.

## Core rules

1. Stable internal identity is separate from locale-specific public URLs.
2. A localized route must be explicitly declared; never infer or fabricate one.
3. A non-default locale route must not build unless its substantive localized content exists.
4. Shared renderers receive locale explicitly. Do not create per-locale copies of page markup when one renderer can serve both.
5. `src/inventory/inventory.json` remains the factual property source. Infrastructure must not create a second factual inventory.
6. English remains the verified factual master. Preserve English public URLs and rendered behavior unless the task explicitly authorizes a cross-language correction.
7. Canonical, hreflang, sitemap, `llms.txt`, language links, and fallbacks must derive from real route availability.
8. Keep one global sitemap entry point and one global `llms.txt` unless an explicitly approved architecture change says otherwise.
9. Do not add browser/IP language redirects or a client-side translation runtime.
10. Serialize only the active locale into browser payloads when localized UI data must reach client-side code.

## Workflow

### 1. Classify the request

Determine whether the requested change is infrastructure, translation, or both.

If broad translation is also required, implement infrastructure first and stop at the Stage 01 review boundary before translation begins.

### 2. Inspect the minimum live state

Read only:

- `src/i18n/route-map.ts`;
- the relevant i18n helper(s);
- the affected route wrapper(s);
- the affected shared renderer/component(s);
- the focused tests for the same behavior.

Do not read all locale resources or all pages unless the task genuinely spans them.

### 3. Implement the smallest structural change

Prefer:

- route-map data over duplicated path literals;
- thin route wrappers over copied page implementations;
- locale presentation mappings over translated factual duplication;
- build-time locale selection over runtime translation;
- fail-closed behavior over silent fallback for pages claimed as localized.

### 4. Preserve facts and English behavior

If a display value comes from factual data stored in English, localize only its presentation. The German completion in PR #59 demonstrates the intended separation: stable ids/slugs/source strings identify presentation mappings while factual values remain owned by inventory/location/group data.

Do not independently correct an English fact in one locale.

### 5. Verify before handoff

Run the Stage 01 verification contract. Use `scripts/validate-i18n-structure.mjs` as an additional deterministic guard; focused repository tests remain authoritative for behavioral invariants.

Report:

- base SHA;
- route(s) affected;
- Layer 3 references loaded;
- Layer 4 files inspected;
- files changed;
- validation results;
- unresolved issues;
- whether Stage 02 may proceed.

## Stop conditions

Stop and report instead of broadening scope when:

- a requested locale page has no approved substantive translation;
- a factual correction is required;
- English behavior changes unexpectedly;
- a phantom locale URL would be created;
- structured property facts would be duplicated into locale resources;
- the task requires merge, deploy, publication, or destructive repository operations without explicit approval.
