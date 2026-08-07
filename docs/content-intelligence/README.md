# Traditional Homes Content Intelligence

Offline, deterministic editorial planning records. Phase 1 never uses network access, LLMs, credentials or social publishing.

## Scoring and gates

Scores total 100: Elounda/East Crete relevance 25, audience usefulness 20, evidence readiness 15, distinctness 15, visual/video potential 10, seasonal relevance 10 and internal-link value 5. Deterministic deductions cover inadequate evidence, duplication, unclear image rights, unsupported numerical precision, generic-list framing and confidentiality risk. Evidence and confidentiality gates can downgrade the score band.

## Outputs and commands

`content:inventory`, `content:discover -- --month 9`, `content:seasonal -- --month 9` and `content:video -- --slug spinalonga-why-fortified-changing-uses` each write JSON and meaningful Markdown below `data/content-intelligence/`. September is the only tracked discovery example. `content:status` is readable; `content:status -- --json` is machine-readable and both are read-only.

Seasonal selection is metadata-led, not alphabetical. Every plan requires human factual, source and rights review before publication.

## Claim and season controls

Only `claim-verification-register.md` and `unresolved-questions.md` may supply factual-scope records. Bibliography and image-rights registers are metadata only. Claims use `verified`, `qualified`, `unresolved`, or `omitted`, with `parsed` or `review required` parse state; unfamiliar or malformed rows remain review-required and never become verified by inference.

Month discovery uses each seed's preferred months, deterministic secondary months, or explicitly evergreen theme metadata. Existing-content seasonal recommendations require an article theme configured in `seasonal-calendar.json`; generic Elounda or Mirabello geography and history/archive wording do not create seasonal relevance on their own.
