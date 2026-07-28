import { mkdir } from "node:fs/promises";
import path from "node:path";

function assertHttps(url, label) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") throw new Error(`${label} must be an absolute HTTPS URL.`);
  return parsed.toString();
}

export function validateInstagramMedia({ imageUrl, contentType, bytes, width, height }) {
  assertHttps(imageUrl, "Instagram media URL");
  if (contentType !== "image/jpeg") throw new Error("Instagram media must be JPEG.");
  if (!Number.isInteger(bytes) || bytes <= 0 || bytes > 8 * 1024 * 1024) throw new Error("Instagram media must be no larger than 8 MB.");
  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) throw new Error("Instagram media dimensions are required.");
  const ratio = width / height;
  if (ratio < 4 / 5 || ratio > 1.91) throw new Error("Instagram media aspect ratio must be from 4:5 through 1.91:1.");
  return { imageUrl: new URL(imageUrl).toString(), contentType, bytes, width, height };
}

export async function generateInstagramDerivative({ rootDir, slug, sourcePath, siteUrl, sharpModule }) {
  const sharp = sharpModule ?? (await import("sharp")).default;
  const outputRelativePath = `/images/social/${slug}-instagram-1080x1350.jpg`;
  const outputPath = path.join(rootDir, "public", outputRelativePath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await sharp(sourcePath).resize(1080, 1350, { fit: "cover" }).jpeg({ quality: 88 }).toFile(outputPath);
  const metadata = await sharp(outputPath).metadata();
  const { size } = await (await import("node:fs/promises")).stat(outputPath);
  return validateInstagramMedia({
    imageUrl: new URL(outputRelativePath, siteUrl).toString(), contentType: "image/jpeg", bytes: size,
    width: metadata.width, height: metadata.height,
  });
}
