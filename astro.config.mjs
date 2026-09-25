import { readdirSync } from 'node:fs';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import pagefind from 'astro-pagefind';
import rehypeSlug from 'rehype-slug';
import remarkDirective from 'remark-directive';
import { rehypeLegalSections } from './src/plugins/rehype-legal-sections.mjs';
import { rehypeTableWrap } from './src/plugins/rehype-table-wrap.mjs';
import { remarkAdmonitions } from './src/plugins/remark-admonitions.mjs';

// Old self-hosting URLs (/developer-docs/self-hosting/x) map onto a nested
// path of the one docs route, which Astro's pattern redirects can't express,
// so they are listed page by page from the content directory.
const selfHostingRedirects = Object.fromEntries(
  readdirSync('src/content/docs/self-hosting', { recursive: true })
    .filter((f) => String(f).endsWith('.mdx'))
    .map((f) => String(f).replace(/\.mdx$/, '').replace(/(^|\/)index$/, ''))
    .map((p) => [`/developer-docs/self-hosting/${p}`.replace(/\/$/, ''), `/docs/self-hosting/${p}`.replace(/([^/])$/, '$1/')])
);

// https://astro.build/config
export default defineConfig({
  site: 'https://strata.do',
  markdown: {
    // Shiki with its `css-variables` theme: it emits no colors of its own, only
    // `var(--astro-code-*)` references, and those variables are defined from
    // brand tokens in global.css. So fenced code is highlighted (the docs are
    // mostly YAML and shell) while every color still comes from brand/tokens.css.
    syntaxHighlight: 'shiki',
    shikiConfig: { theme: 'css-variables' },
    // remark-directive + remarkAdmonitions give MDX the `:::tip` callout syntax
    // the docs are written in.
    remarkPlugins: [remarkDirective, remarkAdmonitions],
    // Add stable ids to headings so the Article scroll-spy jump nav can target
    // them. Inherited by MDX via Astro's extendMarkdownConfig (default).
    // rehypeLegalSections runs after rehypeSlug and replaces its text-derived
    // ids with stable `#section-10-2` anchors — but only on documents with
    // `numbered: true` (the legal collection). Everything else is untouched.
    // rehypeTableWrap makes wide reference tables scroll instead of overflow.
    rehypePlugins: [rehypeSlug, rehypeLegalSections, rehypeTableWrap],
  },
  integrations: [
    // Use the brand Tailwind config as the source of truth; don't inject base styles
    // (brand/tokens.css owns the base layer).
    tailwind({ applyBaseStyles: false }),
    mdx(),
    // sitemap-index.xml + sitemap-0.xml at the site root; linked from robots.txt.
    sitemap(),
    // Static search index for /docs/ (pages marked data-pagefind-body), built
    // into dist/pagefind/ after every build. See src/components/docs/SearchPanel.astro.
    pagefind(),
  ],
  // The docs used to live on a separate GitHub Pages project site at
  // /developer-docs/. Once that deployment is switched off these paths fall
  // through to this site, and these send them on to the new home.
  redirects: {
    '/developer-docs': '/docs/',
    '/developer-docs/developer-guide': '/docs/',
    '/developer-docs/developer-guide/[...slug]': '/docs/[...slug]',
    ...selfHostingRedirects,
    // Extended blending used to have a second page under Expressions.
    '/docs/semantic-model/expressions/extended-blending': '/docs/semantic-model/extended-blending-groups/',
    '/developer-docs/developer-guide/semantic-model/expressions/extended-blending': '/docs/semantic-model/extended-blending-groups/',
    // Extended blending groups and partitions moved out of Advanced into Semantic Model.
    '/docs/advanced/extended-blending-groups': '/docs/semantic-model/extended-blending-groups/',
    '/developer-docs/developer-guide/advanced/extended-blending-groups': '/docs/semantic-model/extended-blending-groups/',
    '/docs/advanced/partitions': '/docs/semantic-model/partitions/',
    '/developer-docs/developer-guide/advanced/partitions': '/docs/semantic-model/partitions/',
    // Multi-datasource queries were never a thing; routing is the answer.
    '/docs/advanced/multi-datasource': '/docs/advanced/semantic-routing/',
    '/developer-docs/developer-guide/advanced/multi-datasource': '/docs/advanced/semantic-routing/',
    '/developer-docs/api/rest/openapi': '/docs/api-reference/',
    '/developer-docs/llms.txt': '/docs/llms.txt',
    '/developer-docs/api/docs.json': '/docs/api/docs.json',
  },
});
