/**
 * Extract the first (smallest) URL from a srcset string.
 *
 * gallery.json srcset format:
 *   "/images/.../480/foo-480.webp 480w, /images/.../768/foo-768.webp 768w, ..."
 *
 * Used to derive a low-resolution blur placeholder without
 * hardcoding path conventions.
 */
export function placeholderSrc(srcset: string): string {
  const first = srcset.split(",")[0]?.trim();
  return first ? first.split(/\s+/)[0] : "";
}

const propertySlugTokens = [
  "almond-tree-villa",
  "margarita",
  "leonidas",
  "demetra",
  "argyro",
  "erato",
  "clio",
  "efterpi",
  "kalliopi",
  "penelope",
  "monastiri",
];

const technicalTokens = new Set([
  "hero",
  "320",
  "480",
  "513",
  "684",
  "706",
  "768",
  "1024",
  "1068",
  "1600",
  "2400",
]);

function sentenceCase(label: string): string {
  return label ? label.charAt(0).toUpperCase() + label.slice(1) : "";
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function reorderViewPhrase(tokens: string[]): string[] {
  const lastThree = tokens.slice(-3).join("-");
  if (lastThree === "terrace-sea-view")
    return ["sea-view", ...tokens.slice(0, -3), "terrace"];
  if (lastThree === "veranda-sea-view")
    return ["sea-view", ...tokens.slice(0, -3), "veranda"];
  if (lastThree === "balcony-sea-view")
    return ["sea-view", ...tokens.slice(0, -3), "balcony"];
  if (tokens.join("-") === "view-sea") return ["sea", "view"];
  return tokens;
}

export function filenameLabel(src: string, fallback = "Photo"): string {
  const filePath = safeDecode(src.split(/[?#]/)[0] ?? "");
  const fileName = filePath.split("/").pop() ?? "";
  const baseName = fileName.replace(/\.[^.]+$/, "");
  let normalized = baseName
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  propertySlugTokens.forEach((slug) => {
    normalized = normalized
      .replace(new RegExp(`(^|-)${slug}(?=-|$)`, "g"), "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  });

  const tokens = reorderViewPhrase(
    normalized
      .split("-")
      .filter(Boolean)
      .map((token) => (token === "siiting" ? "sitting" : token))
      .map((token) => (token === "dinning" ? "dining" : token))
      .filter((token) => !technicalTokens.has(token))
      .filter((token) => !/^\d+$/.test(token)),
  );

  const label = tokens
    .join(" ")
    .replace(/\bbbq\b/g, "barbecue")
    .replace(/\bview sea\b/g, "sea view")
    .replace(/\bsea view\b/g, "sea-view")
    .trim();
  return sentenceCase(label || fallback);
}
