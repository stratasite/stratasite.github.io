// The semantic layer matrix at /compare/semantic-layers/: Strata against Cube,
// dbt MetricFlow and Snowflake semantic views, one row per capability. The
// Strata column is the planner 0sql.io ships (the same rows appear at
// 0sql.io/#compare); the architecture and stack blocks are Strata's own.
//
// Every competitor cell is from that product's public documentation, read on
// the date in `verified`. A cell of "—" means no documented equivalent was
// found. Competitor features move quarterly (STRATA.md §9.4): re-check the
// sources below before editing a cell, and bump `verified` when you do.
//
//   Cube:       docs.cube.dev/reference/core-data-apis/rest-api/reference (/v1/load, /v1/sql)
//               docs.cube.dev/admin/connect-to-data/data-sources (35+ sources)
//               docs.cube.dev/docs/data-modeling/joins (primary keys vs fan-out, associative cube)
//               docs.cube.dev/docs/data-modeling/measures (multi-stage, time-shift, rolling window)
//               docs.cube.dev/docs/data-modeling/data-access-policies (row, member-level, masking)
//               cube.dev/docs/product/data-modeling/reference/segments
//               docs.cube.dev/docs/pre-aggregations/using-pre-aggregations (Cube Store)
//               docs.cube.dev/docs/explore-analyze/playground (developers; BI tool for end users)
//               docs.cube.dev/reference/core-data-apis (Cube for Sheets, Cube for Excel, SQL, MDX, REST, GraphQL)
//   MetricFlow: docs.getdbt.com/docs/build/about-metricflow (metric types, SQL generation)
//               docs.getdbt.com/docs/build/metricflow-commands (--compile shows SQL)
//               docs.getdbt.com/docs/use-dbt-semantic-layer/sl-architecture (gateway executes)
//               docs.getdbt.com/docs/build/join-logic (full outer join across fct, two hops)
//               docs.getdbt.com/docs/build/derived (offset_window, input_metrics filter)
//               docs.getdbt.com/docs/use-dbt-semantic-layer/sl-faqs (six platforms)
//               docs.getdbt.com/docs/use-dbt-semantic-layer/exports (exports write tables on a job)
//               docs.getdbt.com/docs/platform-integrations/avail-sl-integrations (Sheets, Excel, BI tools)
//   Snowflake:  docs.snowflake.com/en/sql-reference/sql/create-semantic-view (relationships, window metrics, PARTITION BY EXCLUDING)
//               docs.snowflake.com/en/user-guide/views-semantic/validation-rules (granularity, nested aggregation, derived metrics)
//               docs.snowflake.com/en/user-guide/views-semantic/querying (ad-hoc metrics, scalar expressions, WHERE on dimensions)
//               docs.snowflake.com/en/user-guide/views-semantic/materializations (Preview; planner picks covering one)
//               docs.snowflake.com/en/user-guide/views-semantic/best-practices-dev (policies propagate from base tables)
//               docs.snowflake.com/en/release-notes/2026/other/2026-03-05-semantic-views-semi-additive-metrics (NON ADDITIVE BY)
//               docs.snowflake.com/en/release-notes/2026/other/2026-03-05-semantic-views-tableau-tds (TDS export, Preview)
//               docs.snowflake.com/en/release-notes/new-features-2026 (standard SQL querying GA 2 March 2026)
//               docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst/rest-api (returns SQL text)
//               docs.snowflake.com/en/user-guide/snowflake-cortex/cortex-analyst-evaluations (verified queries, CI)
//               docs.snowflake.com/en/user-guide/snowflake-cortex/snowflake-cowork (chat with charts, Automations)
//               docs.snowflake.com/en/user-guide/querying-persisted-results (24 hour result cache)

export interface Row {
  feature: string;
  /** Where Strata shows the mechanism. Omit for a cell with nothing to show. */
  href?: string;
  strata: string;
  cube: string;
  mf: string;
  /** Snowflake semantic views. */
  sf: string;
}

/** The day the competitor cells were last read against their documentation. */
export const verified = '30 October 2026';

export const sources = [
  { label: 'Cube: data modeling, joins, measures, pre-aggregations, APIs', href: 'https://docs.cube.dev/' },
  { label: 'dbt MetricFlow: metrics, join logic, integrations, exports', href: 'https://docs.getdbt.com/docs/build/about-metricflow' },
  { label: 'Snowflake semantic views: CREATE SEMANTIC VIEW, validation rules, querying', href: 'https://docs.snowflake.com/en/user-guide/views-semantic/overview' },
  { label: 'Snowflake release notes 2026', href: 'https://docs.snowflake.com/en/release-notes/new-features-2026' },
  { label: 'Snowflake Cortex Analyst, Agents and CoWork', href: 'https://docs.snowflake.com/en/user-guide/snowflake-cortex/snowflake-cowork' },
];

const spec = '/docs/api/rest/query-spec/';

export const querying: Row[] = [
  {
    feature: 'Automatic data blending across many domains',
    href: '/docs/advanced/universe-formation/',
    strata: 'Measures from many facts in one query. No fan-out.',
    cube: 'Primary keys and views; many-to-many needs an associative cube.',
    mf: 'Full outer join across facts, two hops at most.',
    sf: 'Relationships to primary or unique keys; granularity validation.',
  },
  {
    feature: 'Standard aggregates',
    href: '/docs/semantic-model/fields/measures/',
    strata: 'Any SQL aggregate.',
    cube: 'A fixed list of aggregation types.',
    mf: 'Simple metrics over one column expression.',
    sf: 'Any aggregate function.',
  },
  {
    feature: 'Compound measures across facts',
    href: '/docs/semantic-model/fields/measures/compound/',
    strata: 'Formulas over measures from different facts, auto-leveled.',
    cube: 'Number measures inside one cube or view.',
    mf: 'Derived metrics.',
    sf: 'Derived metrics; a higher granularity needs explicit aggregation.',
  },
  {
    feature: 'Snapshot measures',
    href: '/docs/semantic-model/fields/measures/snapshot/',
    strata: 'Beginning or ending balance per period.',
    cube: '—',
    mf: '—',
    sf: 'NON ADDITIVE BY returns the last value per listed dimension.',
  },
  {
    feature: 'Exclusion level of detail',
    href: '/docs/advanced/exclusions/',
    strata: 'Percent of total and fixed denominators, in the model.',
    cube: 'Multi-stage measures.',
    mf: '—',
    sf: 'Window metrics with PARTITION BY EXCLUDING.',
  },
  {
    feature: 'Inclusion level of detail',
    href: '/docs/advanced/inclusions/',
    strata: 'Aggregate per entity first, then re-aggregate.',
    cube: 'Multi-stage measures.',
    mf: '—',
    sf: 'Nested aggregation, such as AVG(SUM(x)).',
  },
  {
    feature: 'Ratios',
    href: `${spec}#calculations`,
    strata: 'A compound measure, or a formula in the request.',
    cube: 'Number measures.',
    mf: 'Ratio metrics.',
    sf: 'A derived metric over two metrics.',
  },
  {
    feature: 'Running and moving windows',
    href: '/docs/advanced/decorators/window/',
    strata: 'A decorator in the request, or one click in the editor.',
    cube: 'Rolling-window measures, modeled.',
    mf: 'Cumulative metrics, modeled.',
    sf: 'Window metrics with ORDER BY and a frame, modeled.',
  },
  {
    feature: 'Period over period',
    href: '/docs/advanced/decorators/temporal/',
    strata: 'A decorator in the request, or one click in the editor.',
    cube: 'Time-shift measures, modeled.',
    mf: 'offset_window on a derived metric, modeled.',
    sf: '—',
  },
  {
    feature: 'Top-n and ranking',
    href: `${spec}#filters`,
    strata: 'A filter in the request.',
    cube: 'Rank, as a multi-stage measure.',
    mf: '—',
    sf: 'ORDER BY and LIMIT over the view.',
  },
  {
    feature: 'Conversion between events',
    href: `${spec}#segments`,
    strata: 'Cohort conversion through segments.',
    cube: '—',
    mf: 'Conversion metrics.',
    sf: '—',
  },
  {
    feature: 'Formulas in the request',
    href: `${spec}#calculations`,
    strata: 'Formulas over any measures, at query time. No deploy.',
    cube: 'Modeled first.',
    mf: 'Modeled first.',
    sf: 'Scalar expressions over metrics, and ad-hoc aggregates.',
  },
  {
    feature: 'Cohort beside baseline',
    href: `${spec}#segments`,
    strata: 'A segment on one measure or the view, with exclude mode.',
    cube: 'Segments filter the whole query.',
    mf: 'Per-metric filter in a derived metric.',
    sf: '—',
  },
  {
    feature: 'Partition-aware routing',
    href: '/docs/semantic-model/partitions/',
    strata: 'Routes to the table whose partition holds the data.',
    cube: 'Partitions its own pre-aggregations only.',
    mf: '—',
    sf: '—',
  },
  {
    feature: 'Routing across compute engines',
    href: '/docs/advanced/semantic-routing/',
    strata: 'A hot engine for the partitions it holds, colder ones for the rest.',
    cube: '—',
    mf: '—',
    sf: '—',
  },
  {
    feature: 'Aggregate-aware routing',
    href: '/docs/advanced/semantic-routing/',
    strata: 'The cheapest table you already own: tiers, costs, aggregates.',
    cube: "Pre-aggregations copied into Cube's own separate store.",
    mf: '—',
    sf: 'Materializations; the planner picks the lowest-cost covering one. Preview.',
  },
  {
    feature: 'Row-level security and masks',
    href: '/docs/security/',
    strata: 'Policies become WHERE or CASE masks.',
    cube: 'Access policies from a JWT context.',
    mf: 'Not in the layer. Warehouse grants.',
    sf: 'Base-table row access and masking policies propagate.',
  },
  {
    feature: 'Pinned SQL, tested on deploy',
    href: '/docs/cli/tests/',
    strata: 'assert_sql fails the deploy.',
    cube: '—',
    mf: '—',
    sf: 'Cortex Analyst evaluations replay verified queries.',
  },
  {
    feature: 'Built for agents',
    href: '/docs/api/ai-agents/',
    strata: 'Agent API, MCP server, typed refusals, llms.txt.',
    cube: 'Meta API. Chat APIs in Cube Cloud.',
    mf: 'dbt MCP server.',
    sf: 'Cortex Agents and Analyst, SHOW SEMANTIC DIMENSIONS, verified queries.',
  },
];

export const architecture: Row[] = [
  {
    feature: 'What comes back',
    href: '/docs/api/rest/results/',
    strata: 'Rows, charts and dashboards. Strata runs the SQL on your warehouse.',
    cube: 'Rows. SQL from /v1/sql, for debugging.',
    mf: 'Rows. --compile shows the SQL.',
    sf: 'Rows from SQL. Cortex Analyst returns SQL text.',
  },
  {
    feature: 'Needs your warehouse credentials',
    href: '/docs/semantic-model/datasources/',
    strata: 'Yes. One connection per datasource, stored encrypted.',
    cube: 'Yes.',
    mf: 'Yes, through dbt.',
    sf: 'It is Snowflake. Runs inside your account.',
  },
  {
    feature: 'Holds results or a cache',
    href: '/legal/license-agreement/',
    strata: 'A 24 hour result cache, scoped to your account.',
    cube: 'Relational cache and pre-aggregations.',
    mf: 'Exports materialize saved queries.',
    sf: 'The Snowflake result cache: exact-match reuse for 24 hours.',
  },
  {
    feature: 'Warehouses',
    href: '/docs/semantic-model/adapters/',
    strata: '12 adapters, any mix in one project.',
    cube: '35+ data sources.',
    mf: '6 platforms.',
    sf: 'Snowflake only.',
  },
  {
    feature: 'How you get it',
    href: '/pricing/',
    strata: 'Hosted. A 14 day trial, nothing to install. Self hosted on Enterprise.',
    cube: 'Apache 2.0 core, or Cube Cloud.',
    mf: 'Apache 2.0 engine. APIs need dbt Cloud.',
    sf: 'Any Snowflake account. SQL querying GA March 2026.',
  },
];

export const stack: Row[] = [
  {
    feature: 'Self-service and dashboards',
    href: '/product/business-intelligence/',
    strata: 'Built in. Beautiful by default, validated per keystroke.',
    cube: 'Playground for developers; a BI tool for end users.',
    mf: '—',
    sf: 'CoWork chat answers with charts. No dashboard builder documented.',
  },
  {
    feature: 'Spreadsheet delivery',
    href: '/product/business-intelligence/',
    strata: 'Google Sheets add-on with Strata’s own retrieval UX. Results stay live.',
    cube: 'Cube for Sheets and Cube for Excel.',
    mf: 'Google Sheets add-on and Excel add-in.',
    sf: '—',
  },
  {
    feature: 'Subscriptions and schedules',
    href: '/product/business-intelligence/',
    strata: 'Built in. Subscribe people to a report, run it on a schedule.',
    cube: '—',
    mf: 'Exports write tables on a job schedule. No delivery.',
    sf: 'CoWork Automations re-run a question and email the result.',
  },
  {
    feature: 'Headless access for other BI tools',
    href: '/product/semantic-layer/',
    strata: 'None, by design. Strata is the consumption layer, so its guarantees hold on every surface.',
    cube: 'SQL, MDX, REST and GraphQL APIs.',
    mf: 'JDBC, ADBC and GraphQL; Tableau, Power BI, Sigma, Hex.',
    sf: 'Any SQL client; TDS export to Tableau, Preview.',
  },
];
