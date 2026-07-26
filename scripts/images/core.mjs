import fs from 'node:fs/promises';
import path from 'node:path';
import { resolveProfile } from './profiles.mjs';

const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const SHARP_POSITIONS = new Set(['center', 'centre', 'north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'entropy', 'attention']);
let sharpPromise;

export async function getSharp() {
  if (!sharpPromise) {
    sharpPromise = import('sharp')
      .then(module => module.default)
      .catch(error => {
        sharpPromise = undefined;
        if (error?.code === 'ERR_MODULE_NOT_FOUND') {
          throw new Error('The "sharp" package is required. Install it before running this script.');
        }
        throw error;
      });
  }
  return sharpPromise;
}

export async function inspectRaster(sourcePath) {
  const sharp = await getSharp();
  const metadata = await sharp(sourcePath, { failOn: 'warning' }).metadata();
  if (!metadata.width || !metadata.height || !metadata.format) {
    throw new Error('Could not read source image dimensions and format.');
  }
  return metadata;
}

export async function writeWebpCandidate({ sourcePath, width, height, position, quality, outputPath }) {
  const sharp = await getSharp();
  const resize = height
    ? { width, height, fit: 'cover', position, withoutEnlargement: true }
    : { width, withoutEnlargement: true };
  const { data, info } = await sharp(sourcePath, { failOn: 'warning' })
    .rotate()
    .resize(resize)
    .webp({ quality })
    .toBuffer({ resolveWithObject: true });
  await fs.writeFile(outputPath, data);
  if (info.width !== width || (height && info.height !== height) || !info.height || data.byteLength === 0) {
    throw new Error(`Generated candidate verification failed for ${path.basename(outputPath)}.`);
  }
  return { width: info.width, height: info.height, format: info.format, bytes: data.byteLength };
}

function safeName(value) {
  if (!value || value.includes('/') || value.includes('\\') || value.includes('..') || !/^[A-Za-z0-9][A-Za-z0-9-]*$/.test(value)) {
    throw new Error('Name must be a safe filename segment containing letters, numbers, or hyphens.');
  }
  return value;
}

function safeOutputDirectory(value) {
  if (!value || value.split(/[\\/]+/).includes('..')) {
    throw new Error('Output directory must not contain path traversal segments.');
  }
  return path.resolve(value);
}

function parseWidths(widths) {
  const values = Array.isArray(widths) ? widths : String(widths || '').split(',');
  const tokens = values.map(value => String(value).trim());
  const parsed = tokens.map(value => Number(value));
  if (parsed.length === 0 || tokens.some(value => !/^[1-9]\d*$/.test(value)) || new Set(parsed).size !== parsed.length) {
    throw new Error('Widths must be a comma-separated list of unique positive integers.');
  }
  return parsed.sort((a, b) => a - b);
}

function parseHeight(height) {
  if (height === undefined) throw new Error('Profile "social-image" requires --height.');
  const token = String(height).trim();
  if (!/^[1-9]\d*$/.test(token)) throw new Error('Height must be a positive integer.');
  const parsed = Number(token);
  return parsed;
}

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function nearestExistingDirectory(start) {
  let current = start;
  while (!(await exists(current))) {
    const parent = path.dirname(current);
    if (parent === current) throw new Error(`Could not find an existing parent directory for ${start}.`);
    current = parent;
  }
  return current;
}

function outputReport(output, sourceBytes) {
  return {
    path: output.path,
    width: output.metadata.width,
    height: output.metadata.height,
    bytes: output.bytes,
    compressionRatio: Number((output.bytes / sourceBytes).toFixed(4)),
  };
}

export async function processImage({ source, profile, name, outputDir, quality, widths, height, position = 'center', dryRun = false, overwrite = false, cropReviewed = false }) {
  const sourcePath = path.resolve(source || '');
  const sourceExt = path.extname(sourcePath).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(sourceExt)) {
    throw new Error(`Unsupported source type "${sourceExt || '(none)'}". Use JPG/JPEG or PNG.`);
  }
  if (!(await exists(sourcePath))) throw new Error(`Source image not found: ${sourcePath}`);
  const outputName = safeName(name);
  const finalOutputDir = safeOutputDirectory(outputDir);
  const explicitWidths = widths ? parseWidths(widths) : undefined;
  const profileConfig = resolveProfile(profile, explicitWidths);
  const targetHeight = profile === 'social-image' ? parseHeight(height) : undefined;
  if (profile === 'social-image' && !SHARP_POSITIONS.has(position)) {
    throw new Error('Position must be a Sharp-supported safe position.');
  }
  if (profileConfig.requiresCropReview && !cropReviewed) {
    throw new Error(`Profile "${profile}" requires explicit crop review (--crop-reviewed).`);
  }
  const selectedQuality = quality === undefined ? profileConfig.quality : Number(quality);
  if (!Number.isInteger(selectedQuality) || selectedQuality < 1 || selectedQuality > 100) {
    throw new Error('Quality must be an integer from 1 to 100.');
  }

  const sourceBytes = (await fs.stat(sourcePath)).size;
  const sourceMetadata = await inspectRaster(sourcePath);
  const requestedWidths = explicitWidths || profileConfig.widths;
  const generatedWidths = requestedWidths.filter(width => width <= sourceMetadata.width);
  if (generatedWidths.length === 0) {
    throw new Error(`Source width is ${sourceMetadata.width}px, below the smallest requested width (${requestedWidths[0]}px). Refusing to upscale.`);
  }

  const finalPaths = generatedWidths.map(width => path.join(finalOutputDir, `${outputName}-${width}.webp`));
  if (dryRun) {
    return {
      source: { path: sourcePath, format: sourceMetadata.format, width: sourceMetadata.width, height: sourceMetadata.height, bytes: sourceBytes },
      profile,
      quality: selectedQuality,
      dryRun: true,
      outputs: finalPaths.map((filePath, index) => ({ path: filePath, width: generatedWidths[index], height: targetHeight || Math.round((sourceMetadata.height / sourceMetadata.width) * generatedWidths[index]), bytes: null, compressionRatio: null })),
      warnings: generatedWidths.length !== requestedWidths.length ? ['Source is smaller than one or more requested widths; no upscaling was performed.'] : [],
      totalOutputBytes: 0,
    };
  }

  const tempParent = await nearestExistingDirectory(path.dirname(finalOutputDir));
  const tempDir = await fs.mkdtemp(path.join(tempParent, '.image-process-'));
  const warnings = generatedWidths.length !== requestedWidths.length ? ['Source is smaller than one or more requested widths; no upscaling was performed.'] : [];
  const temporaryOutputs = [];
  try {
    for (const width of generatedWidths) {
      const temporaryPath = path.join(tempDir, `${outputName}-${width}.webp`);
      const metadata = await writeWebpCandidate({ sourcePath, width, height: targetHeight, position, quality: selectedQuality, outputPath: temporaryPath });
      const bytes = metadata.bytes;
      temporaryOutputs.push({ temporaryPath, path: path.join(finalOutputDir, path.basename(temporaryPath)), metadata, bytes });
    }

    const collisions = [];
    for (const output of temporaryOutputs) if (await exists(output.path)) collisions.push(output.path);
    if (collisions.length > 0 && !overwrite) {
      throw new Error(`Refusing to overwrite existing files:\n${collisions.map(filePath => `- ${filePath}`).join('\n')}`);
    }

    await fs.mkdir(finalOutputDir, { recursive: true });
    const backups = [];
    const published = [];
    try {
      if (overwrite) {
        for (const output of temporaryOutputs) {
          if (await exists(output.path)) {
            const backupPath = path.join(tempDir, `.backup-${path.basename(output.path)}`);
            await fs.rename(output.path, backupPath);
            backups.push({ original: output.path, backup: backupPath });
          }
        }
      }
      for (const output of temporaryOutputs) {
        await fs.rename(output.temporaryPath, output.path);
        published.push(output.path);
      }
    } catch (error) {
      await Promise.all(published.map(filePath => fs.rm(filePath, { force: true })));
      await Promise.all(backups.map(({ original, backup }) => fs.rename(backup, original)));
      throw error;
    }

    const outputs = temporaryOutputs.map(output => outputReport(output, sourceBytes));
    for (const output of outputs) {
      if (output.bytes >= sourceBytes) warnings.push(`${path.basename(output.path)} is larger than the source image.`);
    }
    return {
      source: { path: sourcePath, format: sourceMetadata.format, width: sourceMetadata.width, height: sourceMetadata.height, bytes: sourceBytes },
      profile,
      quality: selectedQuality,
      dryRun: false,
      outputs,
      warnings,
      totalOutputBytes: outputs.reduce((sum, output) => sum + output.bytes, 0),
    };
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  }
}
