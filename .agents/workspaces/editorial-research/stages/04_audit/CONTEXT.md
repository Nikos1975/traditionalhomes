# Stage 04 — Audit

One job: assess an article and its evidence trail read-only by default. Do not edit content during the audit.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `.agents/skills/blog-content-audit/SKILL.md` | canonical audit procedure |
| L3 | `docs/operations/blog-production.md` | research packet/run conventions |
| L3 | `.ai/prompts/blog-editorial-system.md` | editorial and evidence expectations |
| L4 | exact article and requested audit scope | audit target |
| L4 | topic brief, source notes, sources, claims and run summary where available | evidence trail |
| L4 | exact raw/linked sources and image-rights records named by the packet | verification material |
| L4 | only directly related articles needed for overlap/consistency review | bounded comparison |

## Process

1. Confirm the exact article, publication state and audit boundary.
2. Read the complete available research packet and the raw evidence it cites.
3. Compare each material claim against the evidence trail; do not treat snippets or generated summaries as evidence.
4. Check links, image rights/attribution and publication-relevant metadata only within scope.
5. Classify material as verified, qualified/uncertain, rejected or unreviewed and identify contradictions or missing evidence.
6. Return findings without editing files.
7. If remediation is requested later, route it as a separate Stage 03 revision or publication workflow with explicit scope.

## Outputs

- read-only audit report;
- verified, uncertain/qualified, rejected and unreviewed findings;
- evidence/source mapping for each material issue;
- missing evidence and next human decision;
- no content change by default.

## Verify

Confirm every material finding names its evidence basis, distinguishes missing evidence from rejected claims, and leaves the working tree unchanged. Use any read-only validators required by `.agents/skills/blog-content-audit/SKILL.md` without mutating publication state.

## Stop conditions

Stop for a missing article, unavailable essential raw evidence, unclear audit boundary, unclear image rights that prevent classification, unexpected writes, or a requested edit without separate explicit approval. Do not convert an audit into a revision implicitly.
