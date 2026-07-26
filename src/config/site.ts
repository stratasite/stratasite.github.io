/**
 * Single source of truth for site-wide config: outbound URLs, the demo CTA
 * target, and the primary navigation structure. Update the CTA in ONE place
 * here when the real scheduler (Calendly / Cal.com) is wired up.
 */

export const site = {
  name: 'Strata',
  domain: 'https://strata.do',
  description:
    'High-performance, AI-safe self-service analytics — a governed semantic layer fused with beautiful-by-default dashboards, for humans and agents.',

  /**
   * Demo call-to-action. Single source of truth for every CTA (CtaButton) and
   * the footer link — update here to swap schedulers.
   */
  demoUrl: 'https://calendar.app.google/KjU3TdPwfVNpfuSs5',
  demoLabel: 'Schedule a demo',

  // Outbound destinations (live on other domains/paths today).
  docsUrl: 'https://strata.do/developer-docs/',
  blogUrl: 'https://blog.strata.do',
} as const;

/**
 * The three products the platform is sold as. These are the primary entries in
 * the Product dropdown; each gets a detail page at `/product/<slug>/`.
 * Feature pages sit underneath these, not beside them.
 */
export const products = [
  {
    slug: 'business-intelligence',
    label: 'Business Intelligence',
    summary: 'Beautiful by default dashboards and deep self service for everyone.',
    icon: 'dashboard',
  },
  {
    slug: 'semantic-layer',
    label: 'Semantic Layer',
    summary: 'Model by naming. Grain safe blending, five measure types, federated routing.',
    icon: 'layers',
  },
  {
    slug: 'ai-analytics',
    label: 'AI Analytics',
    summary: 'Agents that ask broad questions and get correct answers, on a governed model.',
    icon: 'sparkles',
  },
] as const;

/** Top-level navigation. The Product item is a dropdown of products + proof. */
export const nav = {
  // The Product dropdown is built from `products` above plus the `casestudies`
  // content collection at render time (see Nav.astro), so links never drift.
  links: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing/' },
    { label: 'Docs', href: site.docsUrl, external: true },
    { label: 'Blog', href: site.blogUrl, external: true },
  ],
} as const;
