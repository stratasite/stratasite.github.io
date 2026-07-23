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

/**
 * Customer case studies — long-form proof stories. Linked from the footer
 * Resources column and served at `/case-studies/[slug]`. Same article shell as
 * features/compare, plus an "at a glance" facts grid driven by frontmatter.
 */
const casestudies = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    eyebrow: z.string().default('Case study'),
    // Short label for compact link lists (e.g. the footer); falls back to title.
    navLabel: z.string().optional(),
    summary: z.string(),
    // "At a glance" facts rendered as a stat grid above the narrative.
    glance: z
      .array(z.object({ label: z.string(), value: z.string() }))
      .default([]),
    order: z.number().default(100),
    draft: z.boolean().default(false),
    sections: z.array(section).default([]),
  }),
});

/**
 * Legal documents — terms, privacy, and software licenses. Served at
 * `/legal/[slug]/` from one shared template (src/layouts/Legal.astro).
 *
 * These URLs are quoted in contracts, installers, and third-party documents, so
 * treat a slug as permanent: supersede a document with a new `version` in place
 * rather than renaming the file. Section anchors (`#section-10-2`) are generated
 * from structure by the rehype-legal-sections plugin and are equally permanent.
 */
const legal = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // Groups the document on the /legal/ index.
    docType: z.enum(['agreement', 'privacy', 'license']),
    // Short label for compact link lists (footer, index cards); falls back to title.
    navLabel: z.string().optional(),
    summary: z.string(),
    // Displayed verbatim in the document header, e.g. "1.0".
    version: z.string(),
    lastRevised: z.coerce.date(),
    // Only set when a document takes effect on a date other than its revision
    // date (e.g. a license that starts at install time).
    effective: z.coerce.date().optional(),
    // Automatic 1 / 1.1 / 1.1(a) numbering + #section-N anchors. On by default;
    // set false for short documents that read better unnumbered.
    numbered: z.boolean().default(true),
    order: z.number().default(100),
    draft: z.boolean().default(false),
  }),
});

export const collections = { features, compare, casestudies, legal };
