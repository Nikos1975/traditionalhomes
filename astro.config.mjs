import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [
    tailwind(),
    sitemap({
      filter: (page) =>
        page !== 'https://traditional-homes.gr/' && !page.includes('/AGENTS/'),
    }),
  ],
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  site: 'https://traditional-homes.gr',
});
