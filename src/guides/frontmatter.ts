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
  /**
   * Short label for the breadcrumb trail. Optional: when a locale gives the page
   * a long SEO title, the breadcrumb can stay short. Falls back to `title`, so
   * a guide that does not set it renders exactly as before.
   */
  breadcrumbLabel?: string;
};

export function guideFrontmatter(frontmatter: Record<string, unknown>, source: string): GuideFrontmatter {
  const { title, description, breadcrumbLabel } = frontmatter;

  if (typeof title !== 'string' || title.trim() === '') {
    throw new Error(`Guide frontmatter in ${source} must define a non-empty string "title".`);
  }

  return {
    title,
    description: typeof description === 'string' && description.trim() !== '' ? description : undefined,
    breadcrumbLabel:
      typeof breadcrumbLabel === 'string' && breadcrumbLabel.trim() !== '' ? breadcrumbLabel : undefined,
  };
}
