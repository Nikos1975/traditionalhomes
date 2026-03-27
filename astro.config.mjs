import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import cloudflare from "@astrojs/cloudflare";
// import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // remove sitemap()
  integrations: [tailwind()],

  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  site: 'https://traditional-homes.gr',
  adapter: cloudflare()
});