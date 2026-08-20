/**
 * Shared frontmatter contract for guide markdown.
 *
 * Astro types markdown frontmatter as `Record<string, any>`, so guide routes
 * cannot pass it straight into a typed page renderer. This narrows it once, at
 * the route boundary, and fails the build when a guide is missing its title
 * instead of rendering an empty heading.
 */
export type GuideFrontmatter = {
  title: string;
  description?: string;
};

export function guideFrontmatter(frontmatter: Record<string, unknown>, source: string): GuideFrontmatter {
  const { title, description } = frontmatter;

  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error(`Guide frontmatter in ${source} must define a non-empty string "title".`);
  }

  return {
    title,
    description: typeof description === 'string' && description.trim() !== '' ? description : undefined,
  };
}
