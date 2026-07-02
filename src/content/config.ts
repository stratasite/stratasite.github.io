import { defineCollection, z } from 'astro:content';

/** A jump-nav section within an article (id must match an in-page anchor). */
const section = z.object({
  id: z.string(),
  label: z.string(),
});

/**
 * Feature detail pages — drive the homepage Features section, the Product nav
 * dropdown, and `/features/[slug]`. Body authored in MDX.
 */
const features = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // One-line teaser used on rows and the nav mega-menu.
    summary: z.string(),
    // Icon name (see src/components/Icon.astro) for the nav mega-menu.
    icon: z.string().optional(),
    // Optional hero/card image (path under /public or imported asset URL).
    image: z.string().optional(),
    // Optional looping product video (path under /public). When set, the
    // feature row shows this instead of the generated strata graphic.
    video: z.string().optional(),
    // Optional named diagram component for the homepage row (e.g. 'blending').
    // See src/components/FeatureVisual.astro for the registry.
    diagram: z.string().optional(),
    // Display order on the homepage + dropdown (lower = earlier).
    order: z.number().default(100),
    draft: z.boolean().default(false),
    // Right-side scroll-spy jump nav for the detail page.
    sections: z.array(section).default([]),
  }),
});

/**
 * Competitor comparison articles — drive the links under "How We Stack Up" and
 * `/compare/[slug]`. Same article shell as features.
 */
const compare = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    competitor: z.string(),
    summary: z.string(),
    // Which comparison tab this belongs under on the homepage "How we stack up"
    // section (see src/components/StackUp.astro).
    category: z.enum(['semantic-layer', 'bi-tool']),
    order: z.number().default(100),
    draft: z.boolean().default(false),
    sections: z.array(section).default([]),
  }),
});

export const collections = { features, compare };
