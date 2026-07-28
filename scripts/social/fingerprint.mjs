import { createHash } from "node:crypto";

export function fingerprintArticle(article) {
  const payload = JSON.stringify({
    slug: article.slug,
    title: article.title,
    description: article.description,
    canonicalUrl: article.canonicalUrl,
    heroImageUrl: article.heroImageUrl,
    heroImageAlt: article.heroImageAlt,
    excerpt: article.excerpt,
    publicationDate: article.publicationDate,
  });
  return createHash("sha256").update(payload).digest("hex");
}
