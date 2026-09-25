/** /docs/api/schema/<name>.json — JSON Schema for each Strata YAML file type. */
import type { APIRoute } from 'astro';
import { docsSchemas, schemaNames } from '../../../../data/docs-schemas';
import { absolute } from '../../../../data/docs-ai';

export function getStaticPaths() {
  return schemaNames.map((name) => ({ params: { name } }));
}

export const GET: APIRoute = ({ params }) => {
  const schemas = docsSchemas(absolute('/docs/api/schema'));
  const schema = schemas[params.name as keyof typeof schemas];
  return new Response(JSON.stringify(schema, null, 2), {
    headers: { 'Content-Type': 'application/schema+json; charset=utf-8' },
  });
};
