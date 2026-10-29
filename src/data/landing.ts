/**
 * Ad landing pages: one per incumbent BI tool, served at /<slug>-alternative/.
 * Each page is the same template (src/pages/[competitor]-alternative.astro)
 * fed from here. Claims about the competitor come from src/data/comparisons.ts
 * and the compare pages; re-verify before a campaign (STRATA.md §9.4).
 */

export type Landing = {
  /** URL segment: /<slug>-alternative/ */
  slug: string;
  competitor: string;
  /** <title>, 50 to 60 characters, keyword first. */
  title: string;
  /** Meta description, under 160 characters. */
  description: string;
  /** H1 is `headline` + accented `headlineAccent`. Carries "<competitor> alternative" for search. */
  headline: string;
  headlineAccent: string;
  subhead: string;
  /** Three pains, in the words of someone living with the tool. */
  pains: { title: string; body: string }[];
  /** Compact head to head. Keep every cell under ten words. */
  rows: { axis: string; them: string; strata: string }[];
  /** Slug of the full comparison page in src/content/compare, if published. */
  compareSlug?: string;
  /** Customer quote for the proof strip. */
  quote: { text: string; who: string };
  faq: { q: string; a: string }[];
};

const priceFaq = {
  q: 'What does Strata cost?',
  a: 'Entry starts at $99 a month for 25 users and one developer. Team starts at $499 a month for 100 users and three developers. Every edition includes a 14-day trial of everything in Team.',
};
const dataFaq = {
  q: 'Where does my data go?',
  a: 'It stays in your warehouse. Strata is hosted and connects to your warehouse from two fixed IP addresses you allowlist. It runs the queries it plans and returns the results.',
};
const setupFaq = {
  q: 'How long does setup take?',
  a: 'Sign up and you land in a demo project. Connecting a warehouse is one CLI command. Your engineer, or their coding agent, writes the semantic model in plain YAML and deploys it to the hosted app, so a first domain is typically modeled the same day.',
};
const warehouseFaq = {
  q: 'Which warehouses does it connect to?',
  a: 'Snowflake, Databricks, Redshift, Athena, SQL Server and Azure SQL, Postgres, MySQL, ClickHouse, Druid, Trino and DuckDB.',
};

export const landings: Landing[] = [
  {
    slug: 'power-bi',
    competitor: 'Power BI',
    title: 'Power BI Alternative for Self-Service Analytics | Strata',
    description:
      'Looking for a Power BI alternative? Strata makes non-technical users the operator: no DAX, no model per report, no wrong numbers. Hosted, from $99 a month.',
    headline: 'The Power BI alternative',
    headlineAccent: 'your operators can actually drive.',
    subhead:
      'Power BI gives technical authors enormous power and gives everyone else slicers. Strata makes the non-technical user the operator, on one governed model that cannot return a wrong number.',
    pains: [
      {
        title: 'DAX is the bottleneck.',
        body: 'Every closing balance, share of total and cohort is a CALCULATE that someone has to write, and that someone is already busy.',
      },
      {
        title: 'A model per report.',
        body: 'Every source becomes its own semantic model. Totals drift apart and nobody is sure which revenue number is right.',
      },
      {
        title: 'Self-service stops at slicers.',
        body: 'Non-technical users get the filters the author enabled. Everything else is a ticket.',
      },
    ],
    rows: [
      { axis: 'Who builds the report', them: 'Technical authors who know DAX', strata: 'The operator, validated on every keystroke' },
      { axis: 'Measures', them: 'DAX, per model', strata: 'Five measure types, one-click transforms, no new language' },
      { axis: 'Wrong numbers', them: 'Slice by the wrong dimension, get the grand total on every row', strata: 'Refused before the query runs' },
      { axis: 'Layout', them: 'Pixel perfect, by hand', strata: 'Beautiful by default' },
      { axis: 'AI', them: 'Copilot writes DAX on the model you authored', strata: 'The validation loop is the agent API' },
    ],
    compareSlug: 'strata-vs-power-bi',
    quote: {
      text: 'We got rid of all our slides on how to pull custom reports. It\'s so easy now.',
      who: 'Product Support Manager',
    },
    faq: [
      {
        q: 'Does Strata replace Power BI?',
        a: 'For governed self-service on your warehouse, yes. Strata is the tool your operators use to ask, build, explore and deliver. Power BI keeps the jobs it is built for: paginated reports, files and SaaS sources, and the Microsoft estate. Strata does not feed Power BI over XMLA; it stands in front of the warehouse on its own.',
      },
      {
        q: 'Do my users need to learn DAX or SQL?',
        a: 'No. Measures are defined once in the governed model. Users compose reports from them, add year over year, moving average or percent of total with one click, and type filters in plain English.',
      },
      priceFaq,
      setupFaq,
      dataFaq,
      warehouseFaq,
    ],
  },
  {
    slug: 'metabase',
    competitor: 'Metabase',
    title: 'Metabase Alternative for Non-Technical Teams | Strata',
    description:
      'A Metabase alternative for teams whose question-askers cannot write SQL. Strata starts from a measure, derives valid paths, cannot double count. Hosted, from $99 a month.',
    headline: 'The Metabase alternative',
    headlineAccent: 'for people who cannot write the query.',
    subhead:
      'Metabase is the fastest first chart for a technical team. When the people asking questions are not engineers, every question becomes a ticket. Strata starts from a measure, derives the valid paths, and cannot double count.',
    pains: [
      {
        title: 'Every question starts by picking a table.',
        body: 'Choose a table or a model, then its joins. That is already too hard for the people who need the answer.',
      },
      {
        title: 'Cross-domain means a fact-to-fact join.',
        body: 'Revenue beside tickets is one joined query, and nothing stops it from double counting.',
      },
      {
        title: 'Dashboards take work to be interactive.',
        body: 'A manual grid, heavy configuration, and the warehouse doing the work on every refresh.',
      },
    ],
    rows: [
      { axis: 'Asking a question', them: 'Pick a table or model first', strata: 'Start from a measure; Strata derives the rest' },
      { axis: 'Blending', them: 'One table or one joined query', strata: 'Each fact aggregated to grain, then joined. Cannot double count' },
      { axis: 'Measures', them: 'Aggregations on a fixed join', strata: 'Five measure types, transforms, segments' },
      { axis: 'Dashboards', them: 'Manual grid, configured interactivity', strata: 'Beautiful by default, interactive out of the box' },
      { axis: 'Speed', them: 'Caching, then the warehouse', strata: 'Aggregate-aware, hot-tier routing, sub second' },
    ],
    compareSlug: 'strata-vs-metabase',
    quote: {
      text: 'We got rid of all our slides on how to pull custom reports. It\'s so easy now.',
      who: 'Product Support Manager',
    },
    faq: [
      {
        q: 'Metabase is free. Why pay for Strata?',
        a: 'If everyone asking questions can write SQL and the warehouse is small, Metabase is the simpler tool. Strata earns its price when the people who need answers cannot write the query, when the warehouse spans several domains, or when AI agents need to ask questions safely. Entry starts at $99 a month for 25 users.',
      },
      {
        q: 'Can I still write SQL?',
        a: 'Not against the model, on purpose. Every query goes through the governed model so it is correct by construction. Engineers model in YAML, with a CLI that validates the model against the warehouse.',
      },
      priceFaq,
      setupFaq,
      dataFaq,
      warehouseFaq,
    ],
  },
  {
    slug: 'tableau',
    competitor: 'Tableau',
    title: 'Tableau Alternative With Governed Self-Service | Strata',
    description:
      'A Tableau alternative that takes the complexity down to nothing. Governed measures instead of per-workbook calculated fields, layouts done for you, no wrong numbers. From $99 a month.',
    headline: 'The Tableau alternative that takes the complexity',
    headlineAccent: 'down to nothing.',
    subhead:
      'Tableau is best in class at visualization, and every workbook carries its own calculated fields, extracts and LOD expressions. Strata lifts LOD into governed measures everyone shares, lays dashboards out for you, and refuses a wrong number before it runs.',
    pains: [
      {
        title: 'A Creator for every question.',
        body: 'Explorers and Viewers wait on the few Creator seats. The queue is the product.',
      },
      {
        title: 'Calculated fields per workbook.',
        body: 'The same measure defined five ways in five workbooks, and LOD expressions nobody else can read.',
      },
      {
        title: 'A datasource per question.',
        body: 'Every new question spawns a datasource. Redundant measures multiply and users need a map to find where to look.',
      },
    ],
    rows: [
      { axis: 'Who builds', them: 'Creators. Explorers and Viewers wait', strata: 'The operator, validated as they build' },
      { axis: 'Measures', them: 'Calculated fields and LOD per workbook', strata: 'Snapshot, LOD and Complex measures, defined once, shared' },
      { axis: 'Wrong numbers', them: 'Blends and joins trust the author', strata: 'Refused before the query runs' },
      { axis: 'Layout', them: 'Pixel-level dashboard building', strata: 'Beautiful by default' },
      { axis: 'Speed', them: 'Extracts and refresh schedules', strata: 'Aggregate-aware, hot-tier routing, live' },
    ],
    compareSlug: 'strata-vs-tableau',
    quote: {
      text: 'You took the complexity of Tableau and smashed it down to nothing.',
      who: 'Customer Service Product Manager, after moving 800 users off Tableau',
    },
    faq: [
      {
        q: 'Does Strata replace Tableau?',
        a: 'For governed self-service on your warehouse, yes. The customer service org in our case study moved 800 users off Tableau and went from five self-serve users a week to hundreds. Tableau remains the stronger tool for freeform visual exploration by analysts. Strata does not connect to Tableau; it stands in front of the warehouse on its own.',
      },
      {
        q: 'What happens to my LOD expressions?',
        a: 'They become governed measures. Strata has Inclusion and Exclusion LOD measure types, defined once in the model and reused by everyone, instead of a FIXED or EXCLUDE expression copied between workbooks.',
      },
      priceFaq,
      setupFaq,
      dataFaq,
      warehouseFaq,
    ],
  },
];
