// Head-to-head data for /compare/[slug]. The comparison is organised by theme:
// each theme is one section on the page, made of a mini table (the rows below)
// followed by the prose that explains it (in the MDX, inside <VersusSection>).
// Strata's default cell per row is constant; a competitor may override it when
// the specific mechanism matters more than the generic claim, and may add rows
// of its own to a theme. Seeded from STRATA.md §5. Re-verify competitor cells
// before each publish; competitor features evolve quarterly (STRATA.md §9.4).

export interface Row {
  key: string;
  label: string;
  strata: string;
}
export interface Theme {
  key: string;
  title: string;
  rows: Row[];
}
export interface ExtraRow {
  label: string;
  them: string;
  strata: string;
}
export interface Competitor {
  /** Three sentences for the verdict strip at the top of the page. */
  verdict: string[];
  /** Month the competitor cells were last checked against the product. */
  verified: string;
  /** Competitor cell per row key. */
  cells: Record<string, string>;
  /** Strata cell overrides per row key, when the mechanism deserves naming. */
  strata?: Record<string, string>;
  /** Extra rows appended to a theme, keyed by theme key. */
  extra?: Record<string, ExtraRow[]>;
  /** "Where <competitor> is the better choice": honest rows, them first. */
  better: ExtraRow[];
}

export const themes: Theme[] = [
  {
    key: 'modeling',
    title: 'Modeling and correctness',
    rows: [
      {
        key: 'modeling',
        label: 'Modeling approach',
        strata: 'Model by naming in a Git versioned registry. Shared names conform, distinct names stay apart. No per combination view.',
      },
      {
        key: 'blending',
        label: 'Cross domain blending',
        strata: 'Automatic drill across: each fact aggregated to the common grain, then outer joined on conformed keys.',
      },
      {
        key: 'grain',
        label: 'Grain safety',
        strata: 'Guaranteed. Invalid combinations are refused before execution with the nearest valid alternative. There is no path to a wrong number.',
      },
    ],
  },
  {
    key: 'measures',
    title: 'Measures',
    rows: [
      {
        key: 'expressiveness',
        label: 'Measure types',
        strata: 'Standard, Complex, Snapshot, LOD, and ad hoc, plus one click YoY, moving average, and percent of total.',
      },
      {
        key: 'segments',
        label: 'Cohorts',
        strata: 'Segments at view or measure level: a cohort beside the baseline in one view.',
      },
    ],
  },
  {
    key: 'operator',
    title: 'Who operates it',
    rows: [
      {
        key: 'operator',
        label: 'Primary operator',
        strata: 'Non technical domain experts build reports, dashboards, agents, and exports. Engineers keep the model current.',
      },
      {
        key: 'dashboards',
        label: 'Self service and dashboards',
        strata: 'Built in and beautiful by default: drop zones, a layout engine, and validation on every keystroke.',
      },
    ],
  },
  {
    key: 'performance',
    title: 'Performance and engines',
    rows: [
      {
        key: 'performance',
        label: 'Performance',
        strata: 'Aggregate aware, with partition aware routing to OLAP hot tiers you own.',
      },
      {
        key: 'engines',
        label: 'Engines',
        strata: 'Snowflake, ClickHouse, Druid, Databricks, Trino, Redshift, Postgres and more, federated in one model.',
      },
    ],
  },
  {
    key: 'ai',
    title: 'AI and agents',
    rows: [
      {
        key: 'agents',
        label: 'Agents',
        strata: 'The validation loop is the agent API. Agents get the same refusals and correct answers a person does, on the governed model.',
      },
    ],
  },
];

export const competitors: Record<string, Competitor> = {
  'strata-vs-cube': {
    verified: 'September 2026',
    verdict: [
      'Cube needs a view for every combination of facts; Strata blends by naming and refuses anything invalid.',
      'Cube is built for the engineer; Strata makes the domain expert and the agent the operator.',
      'Cube is fast on Cube Store; Strata is fast on OLAP engines you own and can point other tools at.',
    ],
    cells: {
      modeling: 'Authored cubes plus a view for every blend combination. View sprawl is the maintenance model.',
      blending: 'Only through authored views. Mixing grains without the right view hits an unresolvable join path.',
      grain: 'On the model author. Dashboards surface "can\'t find join path" errors to the user.',
      expressiveness: 'Semi additive needs undocumented multi stage workarounds. Complex measures reference other measures, not dimensions.',
      segments: 'A filter applies to the whole query, so cohort beside baseline needs a second view.',
      operator: 'Analytics and data engineers. Non technical users consume the views others build.',
      dashboards: 'Cloud only workbooks. Click to place, manual layout, no query guardrails.',
      performance: 'Strong managed pre aggregations on Cube Store.',
      engines: 'Queries many warehouses, but the fast tier is always Cube Store.',
      agents: 'Built in chat. Inherits the quality and limits of your views. No custom model.',
    },
    extra: {
      measures: [
        {
          label: 'Generated SQL',
          them: 'Complex multi stage SQL. A simple semi additive measure ran past 100 lines.',
          strata: 'Grain safe drill across: each fact aggregated, then outer joined on conformed keys.',
        },
      ],
      performance: [
        {
          label: 'Fast tier',
          them: 'Cube Store only. Not queryable by other tools or swappable for your own engine.',
          strata: 'Any OLAP engine you own, queryable over SQL and swappable, with no lock in.',
        },
      ],
    },
    better: [
      {
        label: 'Headless access for existing BI',
        them: 'Broad SQL, REST, and GraphQL APIs feed Power BI, Tableau, Excel, and custom apps.',
        strata: 'Owned experiences only. No headless protocol access for foreign query builders, by design.',
      },
      {
        label: 'Managed fast tier',
        them: 'Cube Store is run for you. Nothing to operate.',
        strata: 'You bring and run the OLAP engine, such as ClickHouse or Druid.',
      },
      {
        label: 'Edit loop',
        them: 'Edit a model and it is live on the dev server in seconds.',
        strata: 'Audit, then deploy the branch. A few seconds more, with a validation pass in between.',
      },
    ],
  },

  'strata-vs-power-bi': {
    verified: 'September 2026',
    verdict: [
      'Power BI trusts the author to know every legal combination; Strata derives what is legal and refuses the rest.',
      'Power BI expressiveness runs through DAX; Strata ships five measure types with no new language.',
      'Power BI self service tops out at slicers; Strata makes the non technical user the operator.',
    ],
    cells: {
      modeling: 'Every source becomes its own semantic model. Git is opt in per model through Fabric and PBIP. Models proliferate.',
      blending: 'Conformed dimensions blend inside one model. The model relies on you to make legal queries.',
      grain: 'On the author. Slice a measure by an unrelated dimension and you get the grand total on every row, with a warning at most.',
      expressiveness: 'DAX is expressive but steep, and it is not one to one with SQL. A closing balance needs CALCULATE and ENDOFMONTH.',
      segments: 'Possible with CALCULATE and filter context, per measure, in DAX.',
      operator: 'Technical authors who know the model and DAX. Non technical users get the slicers the author enabled.',
      dashboards: 'Full BI with pixel perfect manual layout. As pretty or as ugly as the author makes it.',
      performance: 'Import, DirectQuery, or Composite. Fast, and tied to Microsoft.',
      engines: 'Vast connector list. One model per source unless you compose them yourself.',
      agents: 'Copilot on top of the model. Not grain safe retrieval.',
    },
    better: [
      {
        label: 'Microsoft estate',
        them: 'Native in Teams, Excel, SharePoint, and Fabric, with per user licensing already in place.',
        strata: 'No Power BI or Excel integration. Sheets through the Strata add on only.',
      },
      {
        label: 'Paginated and pixel perfect reports',
        them: 'Paginated reports and exact layout for print and regulatory output.',
        strata: 'A layout engine that arranges views for you. Not a print layout tool.',
      },
      {
        label: 'Connector breadth',
        them: 'Hundreds of connectors, including files and SaaS apps.',
        strata: 'Warehouses and OLAP engines. Land the data first.',
      },
    ],
  },

  'strata-vs-metabase': {
    verified: 'September 2026',
    verdict: [
      'Metabase starts every question by picking a table; Strata starts from a measure and derives the rest.',
      'Metabase measures live on one table or one joined query; Strata blends across facts at different grains and cannot double count.',
      'Metabase is the fastest first chart for a technical team; Strata is self service for everyone else.',
    ],
    cells: {
      modeling: 'No semantic layer. A "model" is a saved set of joins and filters, with no join pruning.',
      blending: 'One table or one joined query per question. No cross grain blending.',
      grain: 'On you. Nothing stops a fact to fact join that double counts.',
      expressiveness: 'Aggregations on a fixed join. Snapshot, LOD, and cross domain measures need hand written window SQL.',
      segments: 'Saved filters on a table. A cohort beside the baseline is two questions.',
      operator: 'Engineers and SQL comfortable analysts. Non technical users consume.',
      dashboards: 'Fast first dashboard. Fewer chart types, manual grid layout, heavy configuration for interactivity.',
      performance: 'Simple caching. Otherwise the warehouse does the work.',
      engines: 'Many connectors, one source per question.',
      agents: 'Metabot. Table and model selection blocks agents the same way it blocks people.',
    },
    extra: {
      operator: [
        {
          label: 'Query building',
          them: 'Choose a table or model first. Knowledge of the data model required.',
          strata: 'Start from a measure or dimension. The model is derived, not navigated.',
        },
      ],
    },
    better: [
      {
        label: 'Time to first chart',
        them: 'One docker run and two minutes of setup. No model to write.',
        strata: 'One command for the server, then a semantic model before the first chart. Your coding agent writes it, but it is a step.',
      },
      {
        label: 'Small technical team, small warehouse',
        them: 'Free, open source, and productive for anyone who can write SQL.',
        strata: 'Built for broad self service across domains. More than a five table warehouse needs.',
      },
      {
        label: 'Ad hoc SQL',
        them: 'A native SQL editor with sharing and saved questions.',
        strata: 'No raw SQL passthrough. Every query goes through the model, on purpose.',
      },
    ],
  },

  'strata-vs-metricflow': {
    verified: 'September 2026',
    verdict: [
      'MetricFlow links entities by name inside a dbt project; Strata conforms by name across a whole warehouse and adds blending groups where names differ.',
      'MetricFlow is headless and warehouse bound; Strata ships its own self service and routes to OLAP hot tiers.',
      'MetricFlow serves metrics to a BI tool through APIs; Strata is the consumption layer, for people and agents.',
    ],
    cells: {
      modeling: 'Semantic models and metrics as YAML in the dbt project. Entities link models by shared entity name.',
      blending: 'Aggregate then join across models through entities. Multi hop joins are supported, with rules to learn.',
      grain: 'Solid inside the metric spec. Correctness across models depends on how entities and dimensions were authored.',
      expressiveness: 'Simple, ratio, cumulative, derived, and conversion metrics, plus non additive dimensions for semi additive measures. No LOD.',
      segments: 'Metric filters and saved queries. A cohort beside the baseline is a second metric.',
      operator: 'Analytics engineers writing YAML. Consumers need a BI tool on top.',
      dashboards: 'None. Headless by design.',
      performance: 'Warehouse bound. Caching, no hot tier.',
      engines: 'Multi warehouse, one at a time per project.',
      agents: 'MCP server and APIs are growing. You build the retrieval experience.',
    },
    better: [
      {
        label: 'Metrics inside the dbt project',
        them: 'Metrics live next to the models that build them, in the same repo and CI.',
        strata: 'A separate project that sits on your dbt built marts. Metric definitions are not shared between the two.',
      },
      {
        label: 'Feeding existing BI tools',
        them: 'JDBC, GraphQL, and integrations with Tableau, Hex, Mode, and others.',
        strata: 'Owned experiences only. No headless access for foreign query builders.',
      },
      {
        label: 'dbt Cloud governance',
        them: 'One vendor for transformation, testing, and the semantic layer.',
        strata: 'Another server to run, plus an optional OLAP hot tier.',
      },
    ],
  },

  'strata-vs-semantic-views': {
    verified: 'September 2026',
    verdict: [
      'In Snowflake, two same named dimensions from different tables are an error you rename around; in Strata that shared name is the signal they are conformed.',
      'Semantic views live only in Snowflake; Strata fronts Snowflake with a hot tier and keeps it the system of record.',
      'Semantic views need a BI tool to be seen; Strata is the self service layer for people and agents.',
    ],
    cells: {
      modeling: 'Explicit relationships declared in the view, with AI assisted autopilot modeling.',
      blending: 'Join based. Facts must be related explicitly, and duplicate dimension names across tables are a compile error.',
      grain: 'Relationship based. Correctness depends on the declared relationships being right.',
      expressiveness: 'Semi additive is native through NON ADDITIVE BY. LOD is limited to a narrow window function exclusion.',
      segments: 'Filters in the query. A cohort beside the baseline is a second metric or a second query.',
      operator: 'Data engineers. Headless model. Consumers need a separate BI tool.',
      dashboards: 'None. Snowsight is not a self service BI product.',
      performance: 'Warehouse native. Every query is Snowflake compute.',
      engines: 'Snowflake only.',
      agents: 'Agent native through Cortex Analyst and Cortex Agents, inside Snowflake.',
    },
    better: [
      {
        label: 'Everything already in Snowflake',
        them: 'No new infrastructure. Governance, RLS, and masking are inherited from the account.',
        strata: 'A server to run, and RLS to declare in the model.',
      },
      {
        label: 'Cortex inside the platform',
        them: 'Agents and analyst chat without leaving Snowflake.',
        strata: 'Agents run against Strata, on top of Snowflake.',
      },
      {
        label: 'Reach into Power BI and Excel',
        them: 'XMLA through AtScale and a growing headless ecosystem.',
        strata: 'Owned experiences only. No headless access for foreign query builders.',
      },
    ],
  },

  'strata-vs-looker': {
    verified: 'September 2026',
    verdict: [
      'Looker makes you configure every explore in LookML; Strata derives what is legal from names.',
      'Looker handles a second fact through merged results; Strata blends at the common grain and cannot double count.',
      'Looker is one warehouse at a time; Strata federates across the engines you own.',
    ],
    cells: {
      modeling: 'LookML. Every explore, join, and field is configured by a developer.',
      blending: 'Merged results across explores, stitched in the browser. Awkward beyond two facts.',
      grain: 'Symmetric aggregates protect fan out inside an explore. Across explores it is on the author.',
      expressiveness: 'Measures and table calculations. Weak LOD and snapshot support.',
      segments: 'Filters apply to the whole query. Filtered measures cover simple cases.',
      operator: 'LookML developers build. Business users explore inside prebuilt guardrails.',
      dashboards: 'Full BI, self contained. Manual layout, mature.',
      performance: 'PDTs and aggregate awareness on one warehouse.',
      engines: 'Many SQL dialects, one connection per model.',
      agents: 'Gemini in Looker. A conversational layer on top, not grain safe retrieval.',
    },
    better: [
      {
        label: 'Existing LookML investment',
        them: 'Years of explores, a large ecosystem, and people who know it.',
        strata: 'A re model. Your coding agent writes the Strata YAML, but LookML does not import.',
      },
      {
        label: 'Google Cloud estate',
        them: 'BigQuery native, Looker Studio, and Google identity out of the box.',
        strata: 'BigQuery is not a supported engine today.',
      },
      {
        label: 'Embedded analytics',
        them: 'Mature embed SDK and per customer theming.',
        strata: 'Embeds through owned surfaces such as Google Sheets. No white label embed SDK.',
      },
    ],
  },
};
