/**
 * Single source of truth for site-wide config: outbound URLs, the trial and
 * book-a-call targets, and the primary navigation structure.
 */

export const site = {
  name: 'Strata',
  domain: 'https://strata.do',
  description:
    'High-performance, AI-safe self-service analytics — a governed semantic layer fused with beautiful-by-default dashboards, for humans and agents.',

  /**
   * Book-a-call scheduler. Strata is self-serve SaaS, so this appears only on
   * the pricing page (Enterprise card and the help line under the sizer).
   */
  demoUrl: 'https://calendar.app.google/KjU3TdPwfVNpfuSs5',
  demoLabel: 'Book a call',
  salesEmail: 'sales@strata.do',

  /**
   * Free trial of the hosted app. The primary call to action site-wide: every
   * CtaButton defaults to it. The trial includes everything in Team.
   */
  trialUrl: 'https://app.strata.do/signup',
  /** The hosted app: the server the CLI deploys to and the API base URL. */
  appUrl: 'https://app.strata.do',
  trialLabel: 'Start 14-day trial',
  trialDays: 14,

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
