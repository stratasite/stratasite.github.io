/**
 * /docs/api/docs.json — machine discovery index for agents: every developer
 * guide page with a summary, the YAML file types with their JSON Schemas, the
 * CLI command registry, and the constraints a model must satisfy.
 */
import type { APIRoute } from 'astro';
import { absolute, groupBySection, loadDocPages, summarize } from '../../../data/docs-ai';

export const GET: APIRoute = async () => {
  const pages = await loadDocPages();
  const sections = groupBySection(pages);
  const schemaRoot = absolute('/docs/api/schema');

  const page = (p: (typeof pages)[number]) => ({
    id: p.leaf,
    title: p.title,
    url: absolute(p.url),
    section: p.section,
    path: `${p.id}.mdx`,
    summary: summarize(p),
  });

  const index = {
    version: '1.0',
    strata_version_compatibility: '>=0.9.0',
    docs_root: absolute('/docs'),
    docs_sections: sections.map((s) => ({
      id: s.id,
      title: s.title,
      url: absolute(s.url),
      item_count: s.items.length,
      items: s.items.map(page),
    })),
    docs_pages: pages.map(page),

    semantic_objects: {
      table: {
        schema: `${schemaRoot}/table.json`,
        file_pattern: 'tbl.*.yml',
        description: 'Semantic table definition with dimensions and measures',
      },
      relation: {
        schema: `${schemaRoot}/relation.json`,
        file_pattern: 'rel.*.yml',
        description: 'Table relationships and join definitions',
      },
      project: {
        schema: `${schemaRoot}/project.json`,
        file_pattern: 'project.yml',
        description: 'Project configuration and server connection',
      },
      datasources: {
        schema: `${schemaRoot}/datasources.json`,
        file_pattern: 'datasources.yml',
        description: 'Database connection configurations',
      },
      migration: {
        schema: `${schemaRoot}/migration.json`,
        file_pattern: 'migrations/*.yml',
        description: 'Schema migration for renaming/swapping',
      },
      test: {
        schema: `${schemaRoot}/test.json`,
        file_pattern: 'tests/*.yml',
        description: 'Query validation test definitions',
      },
    },

    cli_commands: {
      'strata init': 'Initialize new Strata project in current directory',
      'strata datasource add <name>': 'Add and configure a database connection',
      'strata datasource test <name>': 'Test database connection',
      'strata datasource list': 'List configured datasources',
      'strata create table <name>': 'Generate table YAML from database introspection',
      'strata create relation <name>': 'Generate relation YAML template',
      'strata audit': 'Validate semantic model (syntax + semantics)',
      'strata audit syntax': 'Check YAML syntax only',
      'strata audit models': 'Validate model semantics only',
      'strata deploy': 'Deploy semantic model to Strata server',
      'strata deploy --dry-run': 'Preview deployment without applying',
      'strata test': 'Run query validation tests',
      'strata migration create': 'Create a migration file for renaming',
    },

    critical_constraints: [
      'A field name is one concept across the entire semantic layer: the same name on several tables is merged (table chosen by requested dimensions, then lowest cost); never reuse a name for a different concept; names are scoped per type, so a dimension and a measure may share one',
      'No many_to_many relationships - use junction tables instead',
      'Measures must include aggregation function (sum, count, avg, min, max)',
      'Dimensions must NOT include aggregation functions',
      'Every table requires: datasource, name, physical_name, cost, fields',
      'Every field requires: type, name, data_type, expression',
    ],

    full_knowledge: absolute('/docs/llms.txt'),
  };

  return new Response(JSON.stringify(index, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
