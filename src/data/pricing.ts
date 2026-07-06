// Pricing tiers and the full offering matrix. Single source of truth for the
// pricing page (cards + comparison table). Every tier's CTA is the site-wide
// "Schedule a demo" action, so no prices are hardcoded here.

export type Cell = string | boolean | null; // string = text, true/false = yes/no, null = not applicable

export const tiers = [
  {
    key: 'free',
    name: 'Free',
    tagline: 'Evaluate Strata and ship small projects.',
    highlighted: false,
  },
  {
    key: 'team',
    name: 'Team',
    tagline: 'Scale governed self-service across a team.',
    highlighted: true,
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    tagline: 'Security, compliance, and scale for the whole org.',
    highlighted: false,
  },
] as const;

// Comparison matrix, grouped. Each row's `values` are ordered [Free, Team, Enterprise].
export const featureGroups: {
  label: string;
  rows: { label: string; values: [Cell, Cell, Cell] }[];
}[] = [
  {
    label: 'Seats',
    rows: [
      { label: 'Developers', values: ['1', '3', 'Custom'] },
      { label: 'Users', values: ['25', '50', 'Custom'] },
    ],
  },
  {
    label: 'Workspace',
    rows: [
      { label: 'Data sources per project', values: ['2', 'Unlimited', 'Unlimited'] },
      { label: 'Projects', values: ['Unlimited', 'Unlimited', 'Unlimited'] },
      { label: 'Branches', values: ['Unlimited', 'Unlimited', 'Unlimited'] },
    ],
  },
  {
    label: 'Security and governance',
    rows: [
      { label: 'SSO', values: [false, true, true] },
      { label: 'Row-level security', values: [false, true, true] },
      { label: 'Triggered schedules', values: [false, true, true] },
      { label: 'Airgapped deployment', values: [null, null, true] },
      { label: 'Analytics opt-out', values: [null, null, true] },
    ],
  },
  {
    label: 'Support',
    rows: [
      {
        label: 'Support',
        values: [
          'Email (3-day), Docs, Community',
          'Everything in Free, plus 24-hour response aim',
          'Custom',
        ],
      },
    ],
  },
];
