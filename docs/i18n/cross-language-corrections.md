# Cross-Language Correction Register

This file records suspected factual problems found while localizing content. It is not permission to correct one locale independently.

## Rule

English is the verified factual master for localization. When a claim appears wrong, outdated, unsupported, or volatile:

1. keep the translated locale factually aligned with the current English source;
2. record the issue here with repository/source evidence;
3. do not silently repair only one locale;
4. apply a correction to English and every affected locale together only after approval.

Load this register only when a translation task encounters a factual question or when an approved cross-language correction is being applied.

## Open proposals — not applied

| Claim in current English master | Concern | Repository/source evidence |
| --- | --- | --- |
| Spinalonga "leper colony (1903–1957)" | The colony start year may be 1904. | `docs/research/blog/spinalonga-multiple-lives/contradiction-register.md` records the first residents in 1904; the year is treated as secure there. |
| Spinalonga fortress "built 1579" | Works began in June 1579; construction was not completed that year. | Spinalonga research `claim-verification-register.md`, claim S01. |
| Olous as "an ancient Minoan metropolis" / "Minoan-era foundations" | Published repository content does not support that wording. | `src/content/blog/elounda-and-mirabello-bay.md`. |
| Elounda Canal "built by French military engineers in 1897–98" | The published article deliberately avoids assigning a construction date or responsible authority. | `src/content/blog/elounda-and-mirabello-bay.md`. |
| Elounda Salt Pans described simply as "Venetian-era" | Repository research records possible Byzantine origin, with Venetian use from the early period of Venetian rule. | `src/content/blog/elounda-salt-pans-and-poros-windmills.md`. |
| Salt pans described as a notable birdwatching spot | Not supported by verified repository content. | No verified repository evidence recorded. |
| Gournia described as "the only fully excavated Minoan city in Crete" | Not supported by verified repository content. | No verified repository evidence recorded. |
| Paleochristian Basilica of Poros mosaic claims | Not supported by verified repository content. | No verified repository evidence recorded. |
| Spinalonga admission €20 / €10 and under-25 wording | Official sources consulted in August 2026 disagreed on prices/eligibility. | Ephorate of Antiquities of Lasithi and Ministry of Culture pages recorded in the Vrouchas review. Recheck before publication. |
| Boat €10–€12 round trip / every 30 minutes | Operator-specific and volatile. | No official source recorded. |
| "Limited service runs between Elounda and Agios Nikolaos" | Needs current timetable verification. | Recheck against current KTEL Heraklion–Lasithi timetable. |
| Section title "(2026 Season)" | Dated information requires annual review. | Reverify in every locale before the next season. |

## Resolution format

When a proposal is approved, record:

- decision/date;
- corrected English source path;
- affected locale paths;
- source/evidence used;
- validation performed;
- commit/PR carrying the synchronized correction.
