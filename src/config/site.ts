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

/** Top-level navigation. The Product item is a dropdown of feature pages. */
export const nav = {
  // The Product dropdown is generated from the `features` content collection at
  // render time (see Nav.astro), so feature links never drift from the pages.
  links: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing/' },
    { label: 'Docs', href: site.docsUrl, external: true },
    { label: 'Blog', href: site.blogUrl, external: true },
  ],
} as const;
