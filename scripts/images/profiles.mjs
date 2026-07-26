export const PROFILES = Object.freeze({
  'homepage-hero': Object.freeze({
    widths: [480, 768, 1024, 1440, 1920, 2400],
    quality: 76,
    format: 'webp',
    lcpCritical: true,
  }),
  'blog-hero': Object.freeze({
    widths: [480, 768, 1200, 1600, 2400],
    quality: 84,
    format: 'webp',
    lcpCritical: false,
  }),
  'property-card': Object.freeze({ provisional: true, lazy: true, quality: 76 }),
  gallery: Object.freeze({ provisional: true, lazy: true, quality: 76 }),
  'social-image': Object.freeze({ requiresDimensions: true, requiresCropReview: true, quality: 76 }),
});

export function resolveProfile(name, widths) {
  const profile = PROFILES[name];
  if (!profile) throw new Error(`Unknown image profile "${name}".`);
  if (profile.provisional && (!widths || widths.length === 0)) {
    throw new Error(`Profile "${name}" is provisional and requires explicit --widths.`);
  }
  if (profile.requiresDimensions && (!widths || widths.length !== 1)) {
    throw new Error(`Profile "${name}" requires exactly one --width.`);
  }
  return profile;
}
