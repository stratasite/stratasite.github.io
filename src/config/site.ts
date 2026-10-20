/**
 * Single source of truth for site-wide config: outbound URLs, the live demo
 * and book-a-call targets, and the primary navigation structure. Update the CTA in ONE place
 * here when the real scheduler (Calendly / Cal.com) is wired up.
 */

export const site = {
  name: 'Strata',
  domain: 'https://strata.do',
  description:
    'High-performance, AI-safe self-service analytics — a governed semantic layer fused with beautiful-by-default dashboards, for humans and agents.',

  /**
   * Book-a-call action (the secondary action site-wide). Single source of
   * truth for CtaButton action="demo" and the nav/footer links; update here
   * to swap schedulers.
   */
  demoUrl: 'https://calendar.app.google/KjU3TdPwfVNpfuSs5',
  demoLabel: 'Book a call',

  /**
   * Hosted live demo: a running Strata anyone can sign in to and play with,
   * nothing to install. The /try/ page leads with it; CtaButton
   * action="live-demo" and the footer link point here.
   */
  liveDemoUrl: 'https://demo.strata.do',
  liveDemoLabel: 'Try the live demo',

  /**
   * Free trial. The primary call to action site-wide: every CtaButton defaults
   * to it, with book-a-call as the secondary action. The page offers two
   * paths, the hosted live demo first, then the Docker install and CLI quick
   * start on your own machine.
   */
  trialUrl: '/try/',
  trialLabel: 'Try it free',

  // Documentation lives in this site: src/content/docs/, served at /docs/.
  docsUrl: '/docs/',
  // Outbound destinations (live on other domains today).
  blogUrl: 'https://blog.strata.do',

  /**
   * 0sql: the open source semantic layer inside Strata, published on its own
   * at 0sql.io under MIT. The free, self-hosted option for a team that only
   * needs the planner and the SQL it returns. Every mention on this site
   * links there (followed, with "0sql" in the anchor text, so the brand term
   * accrues to that domain); the docs and repository links are secondary.
   */
  zerosql: {
    name: '0sql',
    url: 'https://0sql.io/',
    docsUrl: 'https://0sql.io/docs/',
    repoUrl: 'https://github.com/stratasite/0sql',
    installCmd: 'curl -fsSL https://0sql.io/install.sh | sh',
    license: 'MIT',
  },
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
