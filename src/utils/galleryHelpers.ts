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
  const first = srcset.split(',')[0]?.trim();
  return first ? first.split(/\s+/)[0] : '';
}
