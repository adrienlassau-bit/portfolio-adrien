import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Domaine de production — à ajuster le jour de la mise en ligne.
const SITE = process.env.SITE_URL ?? 'https://adrienlassau.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'auto' },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/mentions-legales'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
