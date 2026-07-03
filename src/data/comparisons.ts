// Per-competitor head-to-head data for /compare/[slug]. The axes and the Strata
// column are constant; each competitor supplies its own cells in the same order.
// Seeded from STRATA.md §5. Re-verify competitor cells before each publish —
// competitor features evolve quarterly (STRATA.md §9.4).

// The comparison axes and Strata's constant position on each.
export const strataCells: { capability: string; strata: string }[] = [
  { capability: 'Primary operator', strata: 'Non-technical users build reports, dashboards, agents, and exports; engineers set up and lightly maintain.' },
  { capability: 'Modeling approach', strata: 'Convention over configuration. Model by naming, versioned in Git.' },
  { capability: 'Cross-domain blending', strata: 'Automatic and grain-safe, conformed by shared names.' },
  { capability: 'Grain safety', strata: 'Guaranteed. Invalid combinations are refused before they run.' },
  { capability: 'Measure expressiveness', strata: 'Five measure types, plus one-click YoY, moving average, % of total.' },
  { capability: 'Performance', strata: 'Aggregate-aware, federated OLAP hot tiers, partition-aware routing.' },
  { capability: 'Engine independence', strata: 'Any engine. Federate across many at once.' },
  { capability: 'Self-service & dashboards', strata: 'Beautiful by default, built in.' },
  { capability: 'AI & agents', strata: 'Grain-safe retrieval. The validation loop is the agent API.' },
];

// Competitor cells, keyed by compare slug, in the same row order as strataCells.
export const competitorCells: Record<string, string[]> = {
  'strata-vs-semantic-views': [
    'Data engineers. Headless model; consumers need a separate BI tool',
    'Explicit relationships; AI-assisted autopilot modeling',
    'Join-based; two same-named dimensions break the view',
    'Relationship-based; correctness depends on the model',
    'Semi-additive native, but LOD is limited',
    'Warehouse-native, Snowflake only',
    'Snowflake only',
    'None; needs a separate BI tool',
    'Agent-native via Cortex, but Snowflake only',
  ],
  'strata-vs-metricflow': [
    'Analytics engineers writing YAML; consumers need a BI tool on top',
    'Per-model YAML; entities linked by name',
    'Semi-automatic via entities',
    'Solid within a model; author-dependent across models',
    'Basic metrics; limited beyond that',
    'Warehouse-bound; no hot tier',
    'Multi-warehouse',
    'Headless; no dashboards',
    'Growing, but you build the retrieval',
  ],
  'strata-vs-cube': [
    'Developers. Headless; end users consume through another tool',
    'Authored cubes and views; high config burden',
    'Only through authored views',
    'Depends on cube and view design',
    'Weak LOD and snapshot support',
    'Managed pre-aggregations and caching',
    'Multi-engine',
    'Headless; no native dashboards',
    'API-first; you build the agent logic',
  ],
  'strata-vs-looker': [
    'LookML developers build; business users explore within prebuilt guardrails',
    'LookML; configure every explore',
    'Merged results across explores',
    'Manual; awkward multi-fact handling',
    'Weak LOD and snapshot',
    'PDTs and aggregate awareness, one warehouse',
    'Many SQL dialects, one at a time',
    'Full BI, self-contained',
    'Bolt-on assistant; not grain-safe retrieval',
  ],
  'strata-vs-tableau': [
    'Data analysts. Non-technical users mostly consume finished workbooks',
    'Per-workbook; no governed semantic layer',
    'Data blending; fragile across sources',
    'On you; LOD helps but stays manual',
    'LOD expressions (FIXED/EXCLUDE), per workbook',
    'Extracts; no federation or hot tier',
    'Many connectors, not federated',
    'Best-in-class visualization',
    'Bolt-on chat; not agent-native',
  ],
  'strata-vs-power-bi': [
    'Analysts fluent in DAX; non-technical users mostly consume reports',
    'DAX model; grows complex fast',
    'Model relationships; manual',
    'On you; easy to trip on DAX',
    'DAX measures; capable but complex',
    'Import and refresh bound to the model',
    'Many connectors; strong XMLA reach',
    'Full BI, ubiquitous',
    'Copilot bolt-on; not grain-safe retrieval',
  ],
  'strata-vs-metabase': [
    'Technical users. Non-technical users are passive, limited to consuming what others build',
    'No semantic layer. "Models" are fixed join sets, no join pruning',
    'Single table or one joined query; no cross-grain blending',
    'On you; snapshot and LOD only via hand-written window SQL',
    'Basic aggregations on a fixed join; no snapshot, LOD, or complex',
    'Queries the source directly; caching keyed on query duration',
    'Many connectors, one source per question',
    'Fast first dashboard, but limited viz and manual layout',
    'Metabot bolt-on; model-table selection blocks agents',
  ],
  'strata-vs-superset': [
    'Engineers and SQL-fluent analysts; non-technical users just view',
    'Thin semantic layer; SQL-first',
    'Manual, in SQL',
    'On you',
    'Basic; limited expressiveness',
    'Query-through; no hot tier',
    'Many SQL dialects',
    'Open-source BI; real effort to polish',
    'None native; bolt-on only',
  ],
};

// Optional competitor-specific rows, appended after the shared axes. Use these
// for axes that only matter against one kind of tool (e.g. BI-tool ergonomics),
// so the shared matrix stays clean for headless semantic layers.
export const extraRows: Record<
  string,
  { capability: string; them: string; strata: string }[]
> = {
  'strata-vs-metabase': [
    {
      capability: 'Query building',
      them: 'Start by picking a model and its joins; hard for non-technical users, limiting for technical ones',
      strata: 'Start from a question, validated per keystroke, no SQL or join keys required',
    },
    {
      capability: 'Visualization',
      them: 'Basic chart types only; no agent-built views',
      strata: 'Beautiful by default, and agents can build views the same way people do',
    },
    {
      capability: 'Dashboard layout',
      them: 'Manual snap-to-grid; extensive config to make dashboards interactive',
      strata: 'Auto layout engine; views arrange themselves, interactive by default',
    },
    {
      capability: 'Export',
      them: 'Google Sheets export only on Metabase Cloud',
      strata: 'Export built into the product, no paid tier gate',
    },
  ],
};
