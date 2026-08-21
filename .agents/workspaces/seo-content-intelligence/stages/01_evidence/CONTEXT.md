# Stage 01 — SEO Evidence

One job: acquire, import, inspect or validate first-party Search Console evidence and stop. This stage does not interpret evidence, does not recommend an editorial or technical action, and does not touch the site.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `docs/content-intelligence/search-console.md` | acquisition, import, property, provenance, compatibility and baseline-limit rules |
| L3 | `docs/content-intelligence/README.md` | what the content-intelligence system generates and where it writes |
| L3 | `docs/operations/agent-operating-model.md` | instruction hierarchy, staging and stop rules |
| L3 | `docs/architecture/source-of-truth.md` | evidence never becomes a factual authority |
| L4 | the exact Search Console property for this request, confirmed from the properties command rather than assumed | evidence scope |
| L4 | the exact evidence period, as an explicit start and end date | coverage |
| L4 | the exact dimensions or export shape requested, and only those | dataset identity |
| L4 | only the exact raw export being imported from `data/content-intelligence/search-console/raw/` | import source |
| L4 | only the exact processed datasets in `data/content-intelligence/search-console/processed/` whose compatibility with this request must be established | aggregation check |

Do not load every processed dataset, every raw export, every article, all of `docs/` or all of `tests/`. A baseline request names one property and one period.

## Process

1. Fix the request boundary: acquisition, import, inspection, or dataset-compatibility validation. One of them.
2. Identify the exact property. A domain property and a URL-prefix property are separate evidence scopes even where their URLs overlap; confirm the property is accessible rather than assuming it exists.
3. Identify the exact evidence period and the exact dimensions or export type. If either is unstated, stop and ask; never infer a period.
4. Acquire or import through the repository tooling only. Do not hand-write, hand-edit or synthesise a processed dataset, and do not fabricate a coverage date for an export that has none.
5. Let the tooling validate provenance, property compatibility, dimensions, duplication, overlap and truncation. Do not restate or reimplement those checks, and do not work around a rejection.
6. Report a rejection as the finding it is. Overlapping periods, mixed export shapes, mixed properties, a repeated dataset and unknown coverage are correct refusals, not obstacles.
7. Record what the evidence does and does not support: short baselines, missing page dimensions and incomplete acquisition all constrain every later stage.
8. Persist only to the approved evidence location. Write nothing to `src/`, `public/`, `docs/` or tracked data.
9. Stop. Interpretation belongs to Stage 02.

## Outputs

- the acquired or imported dataset in the approved evidence location, or the exact refusal that prevented it;
- a provenance statement naming property, evidence period, dimensions or export type, record count, completeness and any truncation;
- the stated limits of this evidence, including baseline warnings and absent page-level coverage;
- which existing datasets this one may and may not be combined with, and why;
- no interpretation, no opportunity list and no recommendation.

## Verify

Confirm the dataset exists in the approved evidence location, that its recorded property and period match what was requested, and that the status command reports the expected dataset count. Confirm no credential, token or account identifier appears in any output, report or file this stage produced. Confirm the working tree carries no change outside the approved evidence location: `git status --short` must show no new tracked modification produced by this stage. Run the focused content-intelligence tests when tooling behaviour was exercised; a production build and type check are not required because no site source changed.

## Stop conditions

Stop on an unstated or ambiguous property, an unstated evidence period, an export whose coverage cannot be established, a tooling rejection for overlap, duplication, property mismatch, dimension mismatch or export-shape mismatch, a request to hand-edit a processed dataset, a request to widen scope into analysis or recommendation, a credential or secret appearing anywhere in output, an attempt to write outside the approved evidence location, or any requested merge, deploy, publication, push or force push.
