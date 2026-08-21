# Topic Research Contract — Spinalonga: multiple lives

Layer 2.5 control point for one research project. Owned by `.agents/workspaces/editorial-research/stages/01_research/CONTEXT.md` and registered in `.agents/workspaces/editorial-research/stages/01_research/topic-contexts.md`. It controls the project; it does not restate its evidence.

## Scope

- **Central research question:** why this island was fortified, and how the same confined site was reused by successive systems.
- **Angle:** changing uses and physical adaptation of one island — defence, Venetian enclave, Ottoman settlement, compulsory isolation, archaeological site and public memory — not a general history of Crete, Venice or Hansen's disease.
- **Geographic scope:** the island at the mouth of the Gulf of Elounda, the shore opposite at Plaka, the Kalydon/Spinalonga peninsula and the Mirabello approaches. Wider Cretan or Mediterranean material is context only.
- **Chronological scope:** the earlier wall now interpreted as 7th–8th century CE, the 1571–1586 Venetian programme, the Cretan War and post-1669 enclave, the 1715 surrender, Ottoman settlement from 1718, the 1901–1957 isolation regime, and protection from 1970 onward.
- **Reader:** someone who wants the island's documented history; practical-visit pages keep the logistics job.

## Inputs

| Layer | Source | Use |
| --- | --- | --- |
| L3 | `.agents/workspaces/editorial-research/stages/01_research/CONTEXT.md` | stage contract; this file narrows it, never overrides it |
| L3 | `docs/operations/blog-production.md` | durable research/run structure |
| L3 | `.ai/prompts/blog-editorial-system.md` | editorial scope, evidence and angle rules |
| L3 | `.ai/brand/website-brand-style-guide.md` | voice and positioning constraints on framing |
| L4 | `docs/research/blog/spinalonga-multiple-lives/research-dossier.md` | current evidence-led synthesis and working chronology |
| L4 | `docs/research/blog/spinalonga-multiple-lives/source-bibliography.md` | the S-numbered identifiers every claim cites |
| L4 | `docs/research/blog/spinalonga-multiple-lives/claim-verification-register.md` | verified / conditional / blocked status per claim |
| L4 | `docs/research/blog/spinalonga-multiple-lives/contradiction-register.md` | recorded disagreement and safe wording |
| L4 | `docs/research/blog/spinalonga-multiple-lives/numerical-claims-register.md` | figures, counting basis and publication status |
| L4 | `docs/research/blog/spinalonga-multiple-lives/legal-records-register.md` | reported instruments and acquisition state |
| L4 | `docs/research/blog/spinalonga-multiple-lives/people-register.md` | named-person suitability and evidence limits |
| L4 | `docs/research/blog/spinalonga-multiple-lives/unresolved-questions.md` | P0/P1 gaps and the mainland-records gap |
| L4 | `docs/research/blog/spinalonga-multiple-lives/external-dossier-reconciliation.md` | intake rules for the AI dossiers under `docs/research/blog/spinalonga-multiple-lives/sources/` |
| L4 | `docs/research/blog/spinalonga-multiple-lives/image-rights-register.md` | archival image, map and plan rights status |
| L4 | `docs/research/blog/spinalonga-multiple-lives/user-owned-image-manifest.md` | the six cleared photographs and permitted roles |
| L4 | `docs/research/blog/spinalonga-multiple-lives/archive-acquisition-pack.md` | official routes and unsent request drafts |
| L4 | `docs/research/blog/spinalonga-multiple-lives/archive-acquisition-log.md` | sending controls and response intake |
| L4 | `docs/research/blog/spinalonga-multiple-lives/existing-content-overlap.md` | overlap with existing pages and the distinct angle |
| L4 | `docs/research/blog/spinalonga-multiple-lives/recommended-article-architecture.md` | evidence-led architecture and section discipline |
| L4 | `src/content/blog/spinalonga-why-fortified-changing-uses.md` | the published article, read-only in this stage |

Load only the files the current question requires. Do not import the whole folder by default, and open `docs/research/blog/spinalonga-multiple-lives/sources/` only under the intake rules.

## Source priority

1. Original legal instruments and archival records — the Official Gazette of the Cretan State and Greek Government Gazette, and transfer, census, property, customs, municipal, harbour and institutional files.
2. Ephorate of Antiquities of Lasithi official monument records (S01–S06).
3. UNESCO tentative-list record and the ICOMOS evaluation (S07–S08), used with attribution as State Party and advisory documents.
4. Peer-reviewed archaeological, Ottoman, medical and legal scholarship.
5. Local records, contemporary press and permissioned oral history.
6. The 2026-08-05 AI dossiers under `docs/research/blog/spinalonga-multiple-lives/sources/` — secondary leads only, one evidentiary chain, never corroboration.

Travel copy, blogs, social media and unattributed encyclopaedic chains are never evidence.

## Open verification targets

Work the priorities in `docs/research/blog/spinalonga-multiple-lives/unresolved-questions.md` and the disagreements in `docs/research/blog/spinalonga-multiple-lives/contradiction-register.md`. Do not restate them here. They cover the 1901–1903 legal instruments, first-transfer date and count, Ottoman demographic and property figures, the Plaka/Elounda mainland record, the name and Kalydon designation, the earlier-wall chronology, the current UNESCO position, and archival image rights.

## Exclusions

- No visitor logistics: hours, tickets, prices, boat timetables or queue advice.
- No "island of tears", must-see or tragedy rhetoric, invented scenes, composite characters or dialogue.
- No archival image, map or plan use. The six photographs in `docs/research/blog/spinalonga-multiple-lives/user-owned-image-manifest.md` are the only cleared images, and SPN-OWN-006 is modern context only.
- No identifiable medical information without a lawful basis and human legal review.
- No claim that a channel was cut to create the island, no single-cause salt-pans motive, no unqualified ancient-fortress claim, and no exact first-transfer count.
- No archive enquiry sent, form submitted or reproduction ordered without Nikos Pasparakis reviewing the route, draft, cost and rights question.

## Outputs

Update only the controlled records above:

- the claim, contradiction, numerical, legal, people and image registers when material changes status;
- `docs/research/blog/spinalonga-multiple-lives/unresolved-questions.md` when a gap opens or closes;
- `docs/research/blog/spinalonga-multiple-lives/archive-acquisition-log.md` for prepared routes and received responses;
- a concise stage report naming the L3 references loaded, the L4 files reviewed, status changes, remaining gaps and the next allowed action.

New file types, new registers or a rewritten dossier need explicit approval in the initiating task.

## Review gate

`research-only` stops at Stage 01: this contract must not draft, rewrite or edit article prose, and does not route onward to the drafting stage. `src/content/blog/spinalonga-why-fortified-changing-uses.md` is read-only here; evidence that changes a published claim produces a documented revision request routed as a separate approved editorial task through `BLOG_ORCHESTRATOR.md`. No publication, merge or deployment follows from research work.

**Next allowed action:** continue P0 acquisition preparation under the sending controls in `docs/research/blog/spinalonga-multiple-lives/archive-acquisition-log.md`, and record intake against the registers above.

## Stop conditions

Stop on an unclear question, an inaccessible record required for a material claim, a contradiction that changes the core conclusion, a rights question the manifest and register cannot resolve, pressure to upgrade a claim from secondary repetition alone, an identifiable-medical-information request, unexpected files, or any request to edit the published article, publish, merge or deploy.
