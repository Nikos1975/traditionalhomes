---
name: traditional-homes-article-visual-plan
description: Plan evidence-led visuals for Traditional Homes blog posts, area guides, village guides, and historical articles. Use when deciding whether an article needs photographs, archival images, maps, diagrams, or generated illustrations and when recording placement, purpose, provenance, rights, attribution, alt text, caption, crop, destination, and approval status. Produce or validate a visual-plan.md only; do not generate, process, insert, publish, or delete images.
---

# Traditional Homes Article Visual Plan

Produce a reviewable visual plan before any image generation, acquisition, processing, article integration, social reuse, or publication.

## Required reading

Read in this order:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `BLOG_ORCHESTRATOR.md`
4. `.ai/brand/website-brand-style-guide.md`
5. `.ai/prompts/blog-editorial-system.md`
6. the article or topic brief
7. the topic research packet, claim register, and image-rights register when present
8. `docs/architecture/blog-image-pipeline.md`
9. `.agents/skills/traditional-homes-image-pipeline/SKILL.md`

Treat repository evidence and rights records as authoritative. Do not turn a generated or reconstructed visual into evidence.

## Output boundary

Create or update only:

`docs/research/blog/<slug>/visual-plan.md`

Use [the visual-plan template](references/visual-plan-template.md). Keep the plan at `draft` unless Nikos explicitly approves it.

This skill may analyze source material and write the plan. It must not:

- generate or edit an image;
- download or acquire an asset;
- process a source through Sharp or another renderer;
- change article Markdown, frontmatter, routes, or public assets;
- create Open Graph or social files;
- publish, deploy, merge, send, or post anything;
- infer ownership, licence, permission, attribution, geography, dates, people, architecture, or historical appearance.

## Workflow

### 1. Identify the governed article

Confirm:

- article slug and target article path;
- article mode and status;
- research folder;
- verified claim register;
- existing image-rights register;
- exact requested scope.

Stop if the article, research folder, or scope is ambiguous.

### 2. Run the visual-necessity gate

For each possible visual, answer:

1. What information does it add that the text does not provide as clearly?
2. Which verified claim, location, object, route, spatial relationship, or architectural feature does it support?
3. Is a visual the smallest useful representation?
4. Can an existing owned or already approved asset do the job?
5. Could the visual mislead a reader about documentary evidence, geography, scale, chronology, or appearance?

Reject decorative filler, generic destination imagery, visual repetition, mood-only illustrations, invented historical scenes, and unnecessary maps or diagrams.

A valid plan may conclude `text-only`. Record the reason instead of inventing a visual quota.

### 3. Select the safest source class

Prefer, in order:

1. an owned photograph with confirmed subject and publication permission;
2. a licensed or public-domain archival asset with a durable rights record;
3. a factual map or diagram built only from verified data and required attribution;
4. a generated illustration only when no documentary interpretation is implied and Nikos has explicitly approved that medium.

For generated illustrations and reconstructions:

- label the documentary status accurately;
- state that the image is illustrative or reconstructed in the caption;
- prohibit unsupported people, buildings, dates, clothing, maps, inscriptions, flags, military equipment, or events;
- require a separate generation approval after the plan is approved.

### 4. Define each proposed visual

Record every required field from the template:

- placement anchor and destination role;
- information purpose;
- verified claim or evidence source;
- source class and source location;
- rights, owner/licensor, permission record, attribution, and modification limits;
- documentary status;
- output path, processing profile, crop/focal point;
- factual alt text and caption;
- approval state and blockers.

Use exact repository paths where they exist. Use `blocked` rather than guessing when a source, right, crop, or claim is unresolved.

### 5. Validate and stop

Run:

`node .agents/skills/traditional-homes-article-visual-plan/scripts/validate-visual-plan.mjs docs/research/blog/<slug>/visual-plan.md --slug <slug>`

Fix structural errors only. Do not resolve factual or rights blockers by assumption.

End with:

- plan path;
- plan decision;
- proposed, approved, and blocked visual counts;
- unresolved rights, evidence, crop, or attribution questions;
- next allowed action.

The next action after plan approval is a separate request routed through `traditional-homes-image-pipeline`. Plan approval does not authorize generation, processing, insertion, publication, social posting, deployment, or merge.

## Stop conditions

Stop and report when:

- the article or placement anchor is missing;
- a claim is unverified;
- source ownership or licence is unclear;
- attribution or modification permission is unclear;
- a crop could remove essential documentary context;
- a generated image could be mistaken for evidence;
- a map lacks verified geography or required provider attribution;
- the requested output path conflicts with repository media ownership;
- the user asks this planning skill to perform a downstream action.
