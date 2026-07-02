// Per-competitor head-to-head data for /compare/[slug]. The axes and the Strata
// column are constant; each competitor supplies its own cells in the same order.
// Seeded from STRATA.md §5. Re-verify competitor cells before each publish —
// competitor features evolve quarterly (STRATA.md §9.4).

// The comparison axes and Strata's constant position on each.
export const strataCells: { capability: string; strata: string }[] = [
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
    'Lightweight models and metrics; thin semantics',
    'Manual joins; no governed blending',
    'On you; no grain guardrails',
    'Basic aggregations; simple metrics only',
    'Queries the source directly; result caching only',
    'Many connectors, one source per question',
    'Friendly, easy self-service (its calling card)',
    'Metabot bolt-on; not agent-native',
  ],
  'strata-vs-superset': [
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
