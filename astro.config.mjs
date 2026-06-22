import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import rehypeSlug from 'rehype-slug';

// https://astro.build/config
export default defineConfig({
  site: 'https://strata.do',
  markdown: {
    // Add stable ids to headings so the Article scroll-spy jump nav can target
    // them. Inherited by MDX via Astro's extendMarkdownConfig (default).
    rehypePlugins: [rehypeSlug],
  },
  integrations: [
    // Use the brand Tailwind config as the source of truth; don't inject base styles
    // (brand/tokens.css owns the base layer).
    tailwind({ applyBaseStyles: false }),
    mdx(),
  ],
});
