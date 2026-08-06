import { scoreTopic } from "./scoring.mjs";
export function discoverTopics({ seeds, rules, month, inventory }) {
  void month;
  const existing = new Set(inventory.articles.map((article) => article.slug));
  return seeds.map((seed) => {
    const scored = scoreTopic(seed, rules);
    return { id: seed.slug, slug: seed.slug, workingTitle: seed.title, title: seed.title, centralQuestion: seed.centralQuestion, pillar: seed.pillar, contentPillar: seed.pillar, targetAudience: seed.targetAudience, audienceValue: seed.audienceValue, existingCoverage: existing.has(seed.slug) ? "existing article" : "no exact article", overlapAssessment: seed.overlapState, evidenceState: seed.evidenceState, sourcesOrPrimarySourceNeeds: seed.sourcesNeeded, visualAvailability: seed.imageRightsState, archivalVisualNeed: seed.archivalVisualNeed, operationalVolatility: seed.operationalVolatility, confidentialityState: seed.confidentialityState, nextAction: seed.nextAction, ...scored };
  }).sort((a, b) => b.finalScore - a.finalScore || a.slug.localeCompare(b.slug));
}
