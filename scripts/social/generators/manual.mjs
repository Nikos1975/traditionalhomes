import { assertDrafts } from "../draft-schema.mjs";

export function createManualDrafts(article) {
  const lead = `${article.title}\n\n${article.description}`;
  const drafts = {
    facebook: { text: `${lead}\n\n${article.canonicalUrl}`, url: article.canonicalUrl },
    instagram: { caption: `${lead}\n\nRead the article via the link in our profile.`, imageUrl: article.heroImageUrl, altText: article.heroImageAlt },
    threads: { text: `${article.title}\n\n${article.excerpt}\n\n${article.canonicalUrl}`, url: article.canonicalUrl },
    linkedin: { commentary: `${lead}\n\n${article.canonicalUrl}`, url: article.canonicalUrl },
    bluesky: {
      text: `${article.title}\n\n${article.excerpt}`,
      card: { url: article.canonicalUrl, title: article.title, description: article.description, imageUrl: article.heroImageUrl },
    },
  };
  assertDrafts(drafts);
  return drafts;
}
