import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const houses = defineCollection({
    loader: glob({ base: './src/content/houses', pattern: '**/*.md' }),
    schema: z.object({
        title: z.string(),
        slug: z.string(),
        summary: z.string().optional()
    })
});

const villa = defineCollection({
    loader: glob({ base: './src/content/villa', pattern: '**/*.md' }),
    schema: z.object({
        title: z.string(),
        slug: z.string(),
        summary: z.string().optional()
    }).passthrough()
});

export const collections = { houses, villa };