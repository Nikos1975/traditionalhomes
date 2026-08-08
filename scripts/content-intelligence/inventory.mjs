import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { hash } from "./utils.mjs";
import { validateInventory } from "./schemas.mjs";
import { loadConfig } from "./config.mjs";

function frontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error("article frontmatter is missing.");
  const data = {};
  for (const line of match[1].split(/\r?\n/)) {
    const item = line.match(/^(\w+):\s*(.*)$/);
    if (item) data[item[1]] = item[2].replace(/^"|"$/g, "");
  }
  return { data, body: match[2] };
}

const list = (value) => (value?.match(/\[([^\]]*)\]/)?.[1] ?? "")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

export const deriveRoute = (slug) => `/en/blog/${slug}/`;

const normalizeRoute = (value) => {
  if (!value || typeof value !== "string") return value;
  const route = value.startsWith("/") ? value : `/${value}`;
  return route === "/" || route.endsWith("/") ? route : `${route}/`;
};

const pageTypeForRoute = (route) => {
  if (route === "/en/") return "homepage";
  if (route === "/en/houses/") return "collection";
  if (/^\/en\/houses\/[^/]+\/$/.test(route)) return "property";
  if (/^\/en\/villa\/[^/]+\/$/.test(route)) return "villa";
  if (route === "/en/location/") return "location";
  if (/^\/en\/guide\/[^/]+\/$/.test(route)) return "destination-guide";
  if (route === "/en/blog/") return "blog-index";
  if (/^\/en\/blog\/[^/]+\/$/.test(route)) return "blog";
  if (route === "/en/contact/" || route === "/en/policies/") return "utility";
  if (route === "/en/about/") return "about";
  if (route === "/en/faq/") return "faq";
  return "page";
};

const titleFromRoute = (route) => {
  const last = route.split("/").filter(Boolean).at(-1) ?? "Home";
  return last
    .split("-")
    .filter(Boolean)
    .map((item) => item.charAt(0).toUpperCase() + item.slice(1))
    .join(" ");
};

async function walkAstroFiles(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
      const absolute = path.join(directory, entry.name);
      if (entry.isDirectory()) files.push(...await walkAstroFiles(absolute));
      else if (entry.isFile() && entry.name.endsWith(".astro")) files.push(absolute);
    }
    return files;
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

function routeFromEnglishPage(rootDir, file) {
  const base = path.join(rootDir, "src", "pages", "en");
  let relative = path.relative(base, file).replaceAll("\\", "/");
  if (!relative.endsWith(".astro") || relative.includes("[")) return null;
  relative = relative.slice(0, -".astro".length);
  if (relative === "index") relative = "";
  else if (relative.endsWith("/index")) relative = relative.slice(0, -"/index".length);
  return normalizeRoute(relative ? `/en/${relative}` : "/en/");
}

function textFromH1(source) {
  const match = source.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
  if (!match) return null;
  const text = match[1]
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^}]+\}/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text || null;
}

async function readUnitPages(rootDir) {
  try {
    const units = JSON.parse(await readFile(path.join(rootDir, "src", "inventory", "inventory.json"), "utf8"));
    return units
      .filter((unit) => unit?.slug && (unit.type === "house" || unit.type === "villa"))
      .map((unit) => {
        const route = unit.type === "house"
          ? `/en/houses/${unit.slug}/`
          : `/en/villa/${unit.slug}/`;
        const keywords = [...new Set([
          unit.slug,
          unit.name,
          unit.location,
          unit.village,
          unit.area,
          ...(unit.aliases ?? []),
        ].filter(Boolean).flatMap((value) => String(value).toLowerCase().split(/[^\p{L}\p{N}]+/gu)).filter(Boolean))].sort();
        return {
          route,
          title: unit.name ?? titleFromRoute(route),
          description: [unit.location, unit.area].filter(Boolean).join(", "),
          keywords,
          type: unit.type === "house" ? "property" : "villa",
          source: "inventory-unit",
          draft: false,
          published: true,
          indexable: true,
          seoEligible: true,
        };
      });
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

async function readStaticEnglishPages(rootDir) {
  const base = path.join(rootDir, "src", "pages", "en");
  const files = await walkAstroFiles(base);
  const pages = [];
  for (const file of files) {
    const route = routeFromEnglishPage(rootDir, file);
    if (!route) continue;
    const source = await readFile(file, "utf8");
    const type = pageTypeForRoute(route);
    pages.push({
      route,
      title: textFromH1(source) ?? titleFromRoute(route),
      description: "",
      keywords: route.split("/").filter(Boolean).slice(1),
      type,
      source: "astro-page",
      draft: false,
      published: true,
      indexable: true,
      seoEligible: type !== "utility",
    });
  }
  return pages.sort((left, right) => left.route.localeCompare(right.route));
}

async function readRedirects(rootDir) {
  try {
    const source = await readFile(path.join(rootDir, "public", "_redirects"), "utf8");
    return source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => line.split(/\s+/))
      .filter(([from, to, status]) => from?.startsWith("/") && to?.startsWith("/") && !from.includes("*") && ["301", "302"].includes(status))
      .map(([from, to, status]) => ({ from: normalizeRoute(from), to: normalizeRoute(to), status: Number(status) }))
      .sort((left, right) => `${left.from}:${left.to}`.localeCompare(`${right.from}:${right.to}`));
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
}

function deduplicatePages(pages) {
  const byRoute = new Map();
  const priority = { "astro-page": 1, "blog-content": 2, "inventory-unit": 3 };
  for (const page of pages) {
    const current = byRoute.get(page.route);
    if (!current || (priority[page.source] ?? 0) >= (priority[current.source] ?? 0)) byRoute.set(page.route, page);
  }
  return [...byRoute.values()].sort((left, right) => left.route.localeCompare(right.route));
}

export async function buildInventory({ rootDir, includeDrafts = true }) {
  const { brand } = await loadConfig(rootDir);
  const directory = path.join(rootDir, "src", "content", "blog");
  let names = [];
  try {
    names = (await readdir(directory)).filter((name) => name.endsWith(".md")).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }

  const articles = [];
  for (const name of names) {
    const slug = path.basename(name, ".md");
    const source = await readFile(path.join(directory, name), "utf8");
    const { data, body } = frontmatter(source);
    const draft = data.draft === "true";
    if (!includeDrafts && draft) continue;
    const candidateDirectories = [slug, brand.researchDirectoryAliases?.[slug]].filter(Boolean);
    let relatedResearchDirectory = null;
    for (const candidate of candidateDirectories) {
      try {
        await readdir(path.join(rootDir, "docs", "research", "blog", candidate));
        relatedResearchDirectory = `docs/research/blog/${candidate}`;
        break;
      } catch {}
    }
    const internalLinks = [...body.matchAll(/\]\((\/en\/[^)]+)\)/g)].map((match) => match[1]).sort();
    const entities = (brand.entityVocabulary ?? []).filter((entity) => new RegExp(`\\b${entity}\\b`, "i").test(`${data.title ?? ""} ${body}`));
    const keywords = [...new Set([...(data.tags ? list(data.tags) : []), ...entities.map((entity) => entity.toLowerCase())])].sort();
    articles.push({
      slug,
      title: data.title,
      description: data.description ?? data.subtitle ?? "",
      pubDate: data.pubDate,
      draft,
      category: data.category ?? null,
      region: data.region ?? null,
      tags: list(data.tags),
      route: deriveRoute(slug),
      image: data.image ?? null,
      imageCredit: data.imageCredit ?? null,
      headings: [...body.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]),
      wordCount: (body.match(/[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu) ?? []).length,
      internalLinks,
      entities,
      keywords,
      relatedResearchDirectory,
      videoReadiness: draft ? "draft review required" : "human review required",
      sourceFingerprint: hash(source),
    });
  }

  const articlePages = articles.map((article) => ({
    route: article.route,
    title: article.title,
    description: article.description,
    keywords: article.keywords,
    type: "blog",
    source: "blog-content",
    draft: article.draft,
    published: !article.draft,
    indexable: !article.draft,
    seoEligible: !article.draft,
  }));
  const [staticPages, unitPages, redirects] = await Promise.all([
    readStaticEnglishPages(rootDir),
    readUnitPages(rootDir),
    readRedirects(rootDir),
  ]);
  const sitePages = deduplicatePages([...staticPages, ...articlePages, ...unitPages]);

  return validateInventory({
    schemaVersion: 4,
    generatedAt: "deterministic",
    includeDrafts,
    articles,
    sitePages,
    redirects,
  });
}

export function inventoryMarkdown(inventory) {
  return `# Content inventory\n\n| Title | Draft | Route | Words | Video readiness |\n| --- | --- | ---: | ---: | --- |\n${inventory.articles.map((article) => `| ${article.title} | ${article.draft ? "yes" : "no"} | ${article.route} | ${article.wordCount} | ${article.videoReadiness} |`).join("\n")}\n`;
}

export { frontmatter, pageTypeForRoute, normalizeRoute };
