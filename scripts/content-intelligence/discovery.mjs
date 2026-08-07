import { scoreTopic } from "./scoring.mjs";
export function discoverTopics({ seeds, rules, month, inventory, calendar }) {
  const themes = new Set(calendar?.months?.[month - 1]?.themes ?? []);
  const existing = new Set(inventory.articles.map((article) => article.slug));
  return seeds.map((seed) => {
    const preferredMonths = seed.preferredMonths ?? seed.months ?? [];
    const fit = preferredMonths.includes(month) ? "preferred month" : (seed.secondaryMonths ?? []).includes(month) ? "secondary month" : seed.evergreen && (seed.seasonalThemes ?? []).some((theme) => themes.has(theme)) ? "evergreen theme" : null;
    if (!fit) return null;
    const scored = scoreTopic(seed, rules);
    return { id: seed.slug, slug: seed.slug, seasonalFit: fit, workingTitle: seed.title, title: seed.title, centralQuestion: seed.centralQuestion, pillar: seed.pillar, contentPillar: seed.pillar, targetAudience: seed.targetAudience, audienceValue: seed.audienceValue, existingCoverage: existing.has(seed.slug) ? "existing article" : "no exact article", overlapAssessment: seed.overlapState, evidenceState: seed.evidenceState, sourcesOrPrimarySourceNeeds: seed.sourcesNeeded, visualAvailability: seed.imageRightsState, archivalVisualNeed: seed.archivalVisualNeed, operationalVolatility: seed.operationalVolatility, confidentialityState: seed.confidentialityState, nextAction: seed.nextAction, ...scored };
  }).filter(Boolean).sort((a, b) => ["preferred month", "secondary month", "evergreen theme"].indexOf(a.seasonalFit) - ["preferred month", "secondary month", "evergreen theme"].indexOf(b.seasonalFit) || b.finalScore - a.finalScore || a.slug.localeCompare(b.slug));
}
