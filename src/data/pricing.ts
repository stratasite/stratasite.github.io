// Editions, prices and the offering matrix. Single source of truth for the
// pricing page: the edition cards, the seat sizer and the comparison table.
// Prices are monthly and billed annually. Entry and Team start the 14-day
// trial; Enterprise is the one place on the site that books a call.

export type Cell = string | boolean | null; // string = text, true/false = yes/no, null = not applicable

export type SelfServeEdition = {
  key: 'entry' | 'team';
  name: string;
  /** Base price per month, covering the included seats. */
  price: number;
  users: { included: number; max: number; price: number };
  developers: { included: number; max: number; price: number };
  features: string[];
};

export const editions: SelfServeEdition[] = [
  {
    key: 'entry',
    name: 'Entry',
    price: 99,
    users: { included: 25, max: 99, price: 3 },
    developers: { included: 1, max: 5, price: 29 },
    features: ['2 data sources per project'],
  },
  {
    key: 'team',
    name: 'Team',
    price: 499,
    users: { included: 100, max: 400, price: 6 },
    developers: { included: 3, max: 25, price: 99 },
    features: ['Unlimited data sources per project', 'Row-level security'],
  },
];

export const enterprise = {
  key: 'enterprise',
  name: 'Enterprise',
  tagline: 'Cloud or self-hosted, your terms',
  features: ['Everything in Team', 'Airgapped deployment', 'Custom seats and support'],
} as const;

// Comparison matrix, grouped. Each row's `values` are ordered [Entry, Team, Enterprise].
export const featureGroups: {
  label: string;
  rows: { label: string; values: [Cell, Cell, Cell] }[];
}[] = [
  {
    label: 'Seats',
    rows: [
      { label: 'Users included', values: ['25, up to 99', '100, up to 400', 'Custom'] },
      { label: 'Developers included', values: ['1, up to 5', '3, up to 25', 'Custom'] },
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
      { label: 'Airgapped deployment', values: [false, false, true] },
      { label: 'Analytics opt-out', values: [false, false, true] },
    ],
  },
  {
    label: 'Support',
    rows: [
      {
        label: 'Support',
        values: ['Included', 'Included', 'Custom'],
      },
    ],
  },
];
