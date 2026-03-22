import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(), // This handles the date correctly
    author: z.string(),
    region: z.string(),
    image: z.string().optional(),
    layout: z.string(),
  }),
});

export const collections = {
  'blog': blog, // This activates the folder
};