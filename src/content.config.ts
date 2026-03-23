import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const houses = defineCollection({
  loader: glob({ base: './src/content/houses', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    summary: z.string().optional(),
  }),
});

const villa = defineCollection({
  loader: glob({ base: './src/content/villa', pattern: '**/*.md' }),
  schema: z
    .object({
      title: z.string(),
      slug: z.string(),
      summary: z.string().optional(),
    })
    .passthrough(),
});

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    author: z.string().optional(),
    draft: z.boolean().default(false),
    subtitle: z.string().optional(),
    category: z.string().optional(),
    region: z.string().optional(),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    imageAlt: z.string().optional(),
  }),
});

export const collections = { houses, villa, blog };