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
   * Demo call-to-action (the secondary action site-wide). Single source of
   * truth for CtaButton action="demo" and the nav/footer links; update here
   * to swap schedulers.
   */
  demoUrl: 'https://calendar.app.google/KjU3TdPwfVNpfuSs5',
  demoLabel: 'Schedule a demo',

  /**
   * Free trial. The primary call to action site-wide: every CtaButton defaults
   * to it, with the demo as the secondary action. The page itself walks a
   * visitor through the Docker install and the CLI quick start.
   */
  trialUrl: '/try/',
  trialLabel: 'Try it free',

  // Documentation lives in this site: src/content/docs/, served at /docs/.
  docsUrl: '/docs/',
  // Outbound destinations (live on other domains today).
  blogUrl: 'https://blog.strata.do',
} as const;

/**
 * The products the platform is sold as. These are the primary entries in the
 * Product dropdown; each gets a detail page at `/product/<slug>/`. Feature
 * pages sit underneath these, not beside them.
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
  {
    slug: 'open-olap',
    label: 'Open OLAP',
    summary: 'Bring any OLAP engine. Fast, cost effective, and swappable, with no lock in.',
    icon: 'plug',
  },
] as const;

/** Top-level navigation. The Product item is a dropdown of products + proof. */
export const nav = {
  // The Product dropdown is built from `products` above plus the `casestudies`
  // content collection at render time (see Nav.astro), so links never drift.
  links: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing/' },
    { label: 'Docs', href: site.docsUrl },
    { label: 'Blog', href: site.blogUrl, external: true },
  ],
} as const;
