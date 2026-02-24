import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
// import sitemap from '@astrojs/sitemap';

export default defineConfig({
  integrations: [tailwind()], // remove sitemap()
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  site: 'https://traditional-homes.gr',
});
