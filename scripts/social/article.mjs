import { readFile, stat } from "node:fs/promises";
import path from "node:path";

export const SITE_URL = "https://traditional-homes.gr";

function valueFor(frontmatter, key) {
  const value = frontmatter.match(new RegExp(`^${key}:\\s*(.*)$`, "m"))?.[1]?.trim() ?? "";
  return value.replace(/^(?:"([\s\S]*)"|'([\s\S]*)')$/, "$1$2");
}

function excerptFrom(body) {
  return body
    .split(/\r?\n\r?\n/)
    .map((paragraph) => paragraph.replace(/^#+\s+.*$/gm, "").replace(/[*_`]/g, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\s+/g, " ").trim())
    .find(Boolean) ?? "";
}

function assertHttps(value, label) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error(`${label} must be a valid HTTPS URL.`);
  }
  if (url.protocol !== "https:") throw new Error(`HTTPS ${label} is required.`);
  return url.toString();
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadPublishedArticle({ rootDir, slug, siteUrl = SITE_URL }) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug ?? "")) throw new Error("slug must be lowercase kebab-case.");
  const articlePath = path.join(rootDir, "src", "content", "blog", `${slug}.md`);
  if (!(await exists(articlePath))) throw new Error(`Article not found: ${slug}.`);

  const source = await readFile(articlePath, "utf8");
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) throw new Error(`Article frontmatter is missing: ${slug}.`);
  const frontmatter = match[1];
  if (valueFor(frontmatter, "draft") === "true") throw new Error("Social publisher accepts published articles only.");

  const title = valueFor(frontmatter, "title");
  const description = valueFor(frontmatter, "description") || valueFor(frontmatter, "subtitle") || title;
  const image = valueFor(frontmatter, "image");
  const publicationDate = valueFor(frontmatter, "pubDate");
  if (!title || !publicationDate || !image) throw new Error("Published article is missing required social metadata.");

  const canonicalUrl = assertHttps(new URL(`/en/blog/${slug}/`, siteUrl).toString(), "canonical URL");
  const heroImageUrl = assertHttps(new URL(image, siteUrl).toString(), "hero image URL");
  return {
    slug,
    title,
    description,
    canonicalUrl,
    heroImageUrl,
    heroImageAlt: valueFor(frontmatter, "imageAlt"),
    excerpt: excerptFrom(source.slice(match[0].length)),
    publicationDate,
  };
}
