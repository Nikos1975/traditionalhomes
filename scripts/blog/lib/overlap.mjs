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
