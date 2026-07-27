---
name: blog-content-audit
description: Audit a blog article and its evidence trail read-only by default, separating verified, uncertain, rejected, and unreviewed material.
---

# Blog Content Audit

## Purpose

Assess an article, its raw sources, claims, research packet, links, and media evidence without changing content by default.

## Entry Conditions

- An exact article or audit scope and an existing article path.
- The available topic brief and research packet, or explicit acknowledgement that older content lacks them.

## Required Reading

1. `AGENTS.md`, `CLAUDE.md`, and `BLOG_ORCHESTRATOR.md`.
2. The article, complete topic brief, `source-notes.md`, `sources.json`, `claims.json`, and run summary where available.
3. Every raw source named by the research packet, applicable image licence/attribution record, and relevant related articles.
4. `docs/operations/blog-production.md`.

## Allowed File Scope

Read-only operation by default. Do not edit an article, frontmatter, research packet, image, route, script, or publication state. A separate new explicit approval is required before any edit.

## Ordered Procedure

1. Define the audit boundary and confirm the current article and publication state.
2. Perform a full raw-source scan; do not treat search snippets, summaries, or unstated assumptions as evidence.
3. Compare each material claim against the topic brief, raw sources, source notes, claims record, and draft wording.
4. Check internal links, image ownership/licence, attribution, and any publication-relevant metadata within the stated scope.
5. Separate findings into verified, uncertain, rejected, and unreviewed material. Identify contradictions and the evidence needed to resolve them.
6. Return findings without edits.

## Required Human Decisions

- The audit scope and any source access limitations.
- New explicit approval before editing, revising claims records, changing media, or changing publication status.

## Validation

- Every material claim is classified as verified, uncertain, rejected, or unreviewed.
- The report identifies the source comparison used for each finding and distinguishes missing evidence from rejected claims.
- The working tree remains unchanged unless new editing approval is recorded.

## Stop Conditions

Stop and report a missing article, inaccessible raw evidence, unclear audit scope, unclear image rights, or a requested edit without new explicit approval. No edits without a new explicit approval.

## Commit and PR Rules

No commit or PR for the default read-only audit. If a later approved remediation is requested, route it as a new `revise-draft` or `publication` workflow with an exact file scope.

## Required Final Report

Report audit scope, files and raw sources reviewed, verified material, uncertain material, rejected material, unreviewed material, current publication state, and the next human decision required.
