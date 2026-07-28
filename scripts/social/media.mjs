import { createHash } from "node:crypto";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

function assertHttps(url, label) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") throw new Error(`${label} must be an absolute HTTPS URL.`);
  return parsed.toString();
}

function contained(base, candidate, label) {
  const relative = path.relative(base, candidate);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) throw new Error(`${label} must remain inside its approved directory.`);
  return candidate;
}

export function resolvePublicSourcePath({ rootDir, pathname }) {
  if (!pathname || pathname.includes("\\") || pathname.includes("\0") || /%2f|%5c/i.test(pathname)) throw new Error("Unsafe public media path.");
  const decoded = decodeURIComponent(pathname);
  if (decoded.includes("\\") || decoded.includes("\0") || /^\/[A-Za-z]:|^\/\//.test(decoded)) throw new Error("Unsafe public media path.");
  const publicDir = path.resolve(rootDir, "public");
  return contained(publicDir, path.resolve(publicDir, `.${decoded}`), "Source media path");
}

export function validateInstagramMedia({ imageUrl, contentType, bytes, width, height }) {
  assertHttps(imageUrl, "Instagram media URL");
  if (contentType?.split(";")[0].toLowerCase() !== "image/jpeg") throw new Error("Instagram media must be JPEG.");
  if (!Number.isInteger(bytes) || bytes <= 0 || bytes > 8 * 1024 * 1024) throw new Error("Instagram media must be no larger than 8 MB.");
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) throw new Error("Instagram media dimensions are required.");
  const ratio = width / height;
  if (ratio < 4 / 5 || ratio > 1.91) throw new Error("Instagram media aspect ratio must be from 4:5 through 1.91:1.");
  return { imageUrl: new URL(imageUrl).toString(), contentType: "image/jpeg", bytes, width, height };
}

export async function generateInstagramDerivative({ rootDir, slug, sourcePath, siteUrl, articleFingerprint, sharpModule, now = new Date() }) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("Unsafe social image slug.");
  const sharp = sharpModule ?? (await import("sharp")).default;
  const publicDir = path.resolve(rootDir, "public");
  contained(publicDir, path.resolve(sourcePath), "Source media path");
  const outputRelativePath = `/images/social/${slug}-instagram-1080x1350.jpg`;
  const outputPath = contained(path.resolve(publicDir, "images", "social"), path.resolve(publicDir, `.${outputRelativePath}`), "Derivative media path");
  await mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(sourcePath).resize(1080, 1350, { fit: "cover" }).jpeg({ quality: 88 }).toFile(outputPath);
  const [metadata, info, bytes] = await Promise.all([sharp(outputPath).metadata(), stat(outputPath), readFile(outputPath)]);
  const media = validateInstagramMedia({ imageUrl: new URL(outputRelativePath, siteUrl).toString(), contentType: "image/jpeg", bytes: info.size, width: metadata.width, height: metadata.height });
  return { ...media, sourceHeroPath: sourcePath, derivativePath: outputRelativePath, sha256: createHash("sha256").update(bytes).digest("hex"), articleFingerprint, generatedAt: now.toISOString() };
}

export async function verifyDeployedInstagramDerivative({ fetchImpl, derivative, sharpModule }) {
  const response = await fetchImpl(derivative.imageUrl, { method: "GET", redirect: "error" });
  if (response.status !== 200) throw new Error("Instagram derivative deployment validation failed.");
  const contentType = response.headers?.get?.("content-type") ?? "";
  const bytes = Buffer.from(await response.arrayBuffer());
  const sharp = sharpModule ?? (await import("sharp")).default;
  const metadata = await sharp(bytes).metadata();
  const verified = validateInstagramMedia({ imageUrl: derivative.imageUrl, contentType, bytes: bytes.length, width: metadata.width, height: metadata.height });
  if (createHash("sha256").update(bytes).digest("hex") !== derivative.sha256) throw new Error("Instagram derivative deployment hash mismatch.");
  return { ...derivative, ...verified };
}
