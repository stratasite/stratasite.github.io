import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import rehypeSlug from 'rehype-slug';
import { rehypeLegalSections } from './src/plugins/rehype-legal-sections.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://strata.do',
  markdown: {
    // Disable Shiki's baked-in theme (inline dark bg + multicolor token styles)
    // so fenced code blocks are styled purely from brand tokens in global.css
    // (ink terminal surface, peach default text). See `.prose-strata pre`.
    syntaxHighlight: false,
    // Add stable ids to headings so the Article scroll-spy jump nav can target
    // them. Inherited by MDX via Astro's extendMarkdownConfig (default).
    // rehypeLegalSections runs after rehypeSlug and replaces its text-derived
    // ids with stable `#section-10-2` anchors — but only on documents with
    // `numbered: true` (the legal collection). Everything else is untouched.
    rehypePlugins: [rehypeSlug, rehypeLegalSections],
  },
  integrations: [
    // Use the brand Tailwind config as the source of truth; don't inject base styles
    // (brand/tokens.css owns the base layer).
    tailwind({ applyBaseStyles: false }),
    mdx(),
  ],
});
