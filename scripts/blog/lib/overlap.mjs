function normalize(text) {
  return String(text ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shingles(text, size = 3) {
  const words = normalize(text).split(" ").filter(Boolean);
  if (words.length === 0) return new Set();
  if (words.length < size) return new Set([words.join(" ")]);
  return new Set(
    Array.from({ length: words.length - size + 1 }, (_, index) =>
      words.slice(index, index + size).join(" "),
    ),
  );
}

export function shingleSimilarity(left, right, size = 3) {
  const a = shingles(left, size);
  const b = shingles(right, size);
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const value of a) if (b.has(value)) intersection += 1;
  return intersection / (a.size + b.size - intersection);
}

export function assessOverlap(score) {
  if (score >= 0.9)
    return { level: "duplicate", blocked: true, requiresDistinctAngle: true };
  if (score >= 0.55)
    return { level: "high", blocked: false, requiresDistinctAngle: true };
  if (score >= 0.25)
    return { level: "medium", blocked: false, requiresDistinctAngle: false };
  return { level: "low", blocked: false, requiresDistinctAngle: false };
}

export function compareAgainstArticles({ candidate, articles }) {
  return articles
    .map((article) => {
      const score = shingleSimilarity(candidate, article.text);
      return { slug: article.slug, score, assessment: assessOverlap(score) };
    })
    .sort(
      (left, right) =>
        right.score - left.score || left.slug.localeCompare(right.slug),
    );
}

function bestFieldSimilarity(candidateFields, targetFields) {
  let best = 0;
  for (const candidate of candidateFields) {
    for (const target of targetFields) {
      best = Math.max(best, shingleSimilarity(candidate, target));
    }
  }
  return best;
}

export function compareProposedTopic({
  topic,
  slug,
  articles = [],
  researchTopics = [],
}) {
  const candidateFields = [topic, String(slug ?? "").replaceAll("-", " ")];
  const articleMatches = articles.map((article) => {
    const score = bestFieldSimilarity(candidateFields, [
      article.title,
      String(article.slug ?? "").replaceAll("-", " "),
    ]);
    return {
      kind: "article",
      slug: article.slug,
      score,
      assessment: assessOverlap(score),
    };
  });
  const researchMatches = researchTopics.map((researchTopic) => {
    const score = bestFieldSimilarity(candidateFields, [
      researchTopic.name,
      String(researchTopic.name ?? "").replaceAll("-", " "),
    ]);
    return {
      kind: "research",
      name: researchTopic.name,
      path: researchTopic.path,
      score,
      assessment: assessOverlap(score),
    };
  });
  return [...articleMatches, ...researchMatches].sort(
    (left, right) =>
      right.score - left.score ||
      left.kind.localeCompare(right.kind) ||
      (left.slug ?? left.path).localeCompare(right.slug ?? right.path),
  );
}
