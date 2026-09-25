/**
 * Loads public/docs/openapi/strata-api-v1.yaml at build time and turns it into
 * what the API reference page renders: operations grouped by tag, with
 * resolved parameters, bodies, and responses; named schemas; property rows for
 * tables; and a generated example for any schema (the spec carries almost no
 * examples of its own). The YAML file stays the source of truth and is also
 * served as-is for download.
 */
import { parse } from 'yaml';
import specText from '../../public/docs/openapi/strata-api-v1.yaml?raw';

export interface Schema {
  type?: string;
  format?: string;
  description?: string;
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  enum?: (string | number)[];
  default?: unknown;
  maximum?: number;
  example?: unknown;
  allOf?: Schema[];
  $ref?: string;
  /** Component name when this schema came from a `$ref`. */
  ref?: string;
}

export interface Parameter {
  name: string;
  in: 'path' | 'query' | 'header';
  required?: boolean;
  description?: string;
  schema?: Schema;
}

export interface Response {
  status: string;
  description: string;
  schema?: Schema;
  example?: unknown;
  contentTypes: string[];
}

export interface Operation {
  id: string;
  method: string;
  path: string;
  summary: string;
  description?: string;
  tag: string;
  parameters: Parameter[];
  requestBody?: { required: boolean; schema: Schema };
  responses: Response[];
}

export interface TagGroup {
  name: string;
  id: string;
  description?: string;
  operations: Operation[];
}

export interface NamedSchema {
  name: string;
  id: string;
  schema: Schema;
}

export interface PropertyRow {
  name: string;
  type: string;
  /** Component name the type links to, if any. */
  refName?: string;
  required: boolean;
  description?: string;
  enum?: (string | number)[];
  default?: unknown;
  children: PropertyRow[];
}

const spec = parse(specText);

export const info: { title: string; version: string; description: string } = spec.info;
export const serverUrl: string = spec.servers?.[0]?.url ?? '{server}/api/v1';

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const schemaAnchor = (name: string) => `schema-${slug(name)}`;
export const tagAnchor = (name: string) => `tag-${slug(name)}`;

function resolve(ref: string): any {
  const parts = ref.replace(/^#\//, '').split('/');
  let node: any = spec;
  for (const p of parts) node = node?.[p];
  if (node === undefined) throw new Error(`Unresolved $ref ${ref}`);
  return node;
}

/** Resolve a `$ref` and merge `allOf` one level deep. Children stay lazy. */
export function expand(schema: Schema | undefined): Schema {
  if (!schema) return {};
  if (schema.$ref) {
    const name = schema.$ref.split('/').pop()!;
    return { ...expand(resolve(schema.$ref)), ref: name, ...(schema.description ? { description: schema.description } : {}) };
  }
  if (schema.allOf) {
    const merged: Schema = { type: 'object', properties: {}, required: [] };
    for (const part of schema.allOf) {
      const e = expand(part);
      Object.assign(merged.properties!, e.properties ?? {});
      merged.required!.push(...(e.required ?? []));
      if (e.description && !merged.description) merged.description = e.description;
    }
    return merged;
  }
  return schema;
}

/** Human type label for a schema, e.g. `array of Field`, `string (enum)`. */
export function typeLabel(schema: Schema): { label: string; refName?: string } {
  const e = expand(schema);
  if (e.ref && (e.type === 'object' || e.properties)) return { label: e.ref, refName: e.ref };
  if (e.type === 'array') {
    const inner = typeLabel(e.items ?? {});
    return { label: `array of ${inner.label}`, refName: inner.refName };
  }
  if (e.format === 'date-time') return { label: 'string (ISO 8601)' };
  return { label: e.type ?? 'object' };
}

/**
 * Property rows for a table. Nested objects and arrays of objects expand into
 * children; a property whose type is a named component links to that
 * component instead of repeating it, unless `inlineRefs` asks otherwise.
 */
export function propertyRows(schema: Schema, opts: { inlineRefs?: boolean; depth?: number } = {}): PropertyRow[] {
  const { inlineRefs = false, depth = 0 } = opts;
  const e = expand(schema);
  const required = new Set(e.required ?? []);
  return Object.entries(e.properties ?? {}).map(([name, prop]) => {
    const pe = expand(prop);
    const { label, refName } = typeLabel(prop);
    let children: PropertyRow[] = [];
    const target = pe.type === 'array' ? expand(pe.items) : pe;
    const namedRef = Boolean(target.ref);
    if (target.properties && depth < 4 && (!namedRef || inlineRefs)) {
      children = propertyRows(target, { inlineRefs: false, depth: depth + 1 });
    }
    return {
      name,
      type: label,
      refName: namedRef ? refName : undefined,
      required: required.has(name),
      description: prop.description ?? pe.description,
      enum: pe.enum,
      default: pe.default,
      children,
    };
  });
}

const STRING_HINTS: Record<string, string> = {
  uid: 'web_net_paid',
  name: 'Web Net Paid',
  description: 'Net amount paid on web orders',
  physical_name: 'web_sales',
  sql: 'SELECT "State", SUM(ws_net_paid) …',
  poll_url: '/api/v1/queries/42/result',
  message: 'No field named \'Not A Real Field\'',
  code: 'invalid_query_construction',
  field: 'Web Net Paid',
  alias: 'Sell Through Rate',
  branch: 'main',
  data_type: 'decimal',
  display_type: 'default',
  value: 'CA',
  value_end: '2024-12-31',
  error_message: 'relation "web_sales" does not exist',
  status: 'succeeded',
  as: 'Paired Sub Commodity',
  unit: '$',
  pattern: '%b %Y',
  extended_blend_group: 'activity_date',
};
const INT_HINTS: Record<string, number> = {
  id: 42,
  query_id: 42,
  project_id: 1,
  created_by_id: 5,
  page: 1,
  total_pages: 1,
  total_count: 3,
  limit: 25,
  offset: 0,
  row_count: 1,
  cost: 10,
  rank: 85,
  precision: 1,
  size: 7,
  buckets: 4,
  maximum: 100,
};

/** A plausible example value for a schema. Optional "… only" properties are left out. */
export function exampleFor(schema: Schema | undefined, name = '', depth = 0): unknown {
  const e = expand(schema);
  if (e.example !== undefined) return e.example;
  if (depth > 5 && (e.type === 'array' || e.type === 'object' || e.properties)) return e.type === 'array' ? [] : {};
  if (name === 'rows') return [['CA', 12345.67]];
  if (name === 'columns') return ['State', 'Web Net Paid'];
  if (e.enum?.length) return e.enum[0];
  if (e.default !== undefined) return e.default;
  switch (e.type) {
    case 'object': {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(e.properties ?? {})) {
        const desc = (v.description ?? expand(v).description ?? '').toLowerCase();
        if (/\bonly\b/.test(desc)) continue;
        out[k] = exampleFor(v, k, depth + 1);
      }
      return out;
    }
    case 'array': {
      const item = exampleFor(e.items, name === 'errors' ? 'error' : name.replace(/s$/, ''), depth + 1);
      return [item];
    }
    case 'integer':
      return INT_HINTS[name] ?? 1;
    case 'number':
      return name === 'wait_timeout' ? 3 : 12345.67;
    case 'boolean':
      return true;
    case 'string':
      if (e.format === 'date-time') return '2026-06-15T14:30:00Z';
      return STRING_HINTS[name] ?? 'string';
    default:
      return e.properties ? exampleFor({ ...e, type: 'object' }, name, depth) : {};
  }
}

function buildParameters(raw: any[] = []): Parameter[] {
  return raw.map((p) => (p.$ref ? resolve(p.$ref) : p));
}

function mergeParameters(pathLevel: Parameter[], opLevel: Parameter[]): Parameter[] {
  const key = (p: Parameter) => `${p.in}:${p.name}`;
  const map = new Map(pathLevel.map((p) => [key(p), p]));
  for (const p of opLevel) map.set(key(p), p);
  const order = { path: 0, query: 1, header: 2 };
  return Array.from(map.values()).sort((a, b) => order[a.in] - order[b.in]);
}

function buildResponses(raw: Record<string, any> = {}): Response[] {
  return Object.entries(raw).map(([status, r]) => {
    const res = r.$ref ? resolve(r.$ref) : r;
    const content = res.content ?? {};
    const json = content['application/json'];
    return {
      status,
      description: res.description ?? '',
      schema: json?.schema,
      example: json?.example,
      contentTypes: Object.keys(content),
    };
  });
}

const METHODS = ['get', 'post', 'put', 'patch', 'delete'];

export const operations: Operation[] = Object.entries<any>(spec.paths).flatMap(([path, item]) => {
  const pathParams = buildParameters(item.parameters);
  return METHODS.filter((m) => item[m]).map((method) => {
    const op = item[method];
    const body = op.requestBody?.content?.['application/json'];
    return {
      id: `op-${slug(op.operationId ?? `${method}-${path}`)}`,
      method,
      path,
      summary: op.summary ?? `${method.toUpperCase()} ${path}`,
      description: op.description,
      tag: op.tags?.[0] ?? 'Other',
      parameters: mergeParameters(pathParams, buildParameters(op.parameters)),
      requestBody: body ? { required: Boolean(op.requestBody.required), schema: body.schema } : undefined,
      responses: buildResponses(op.responses),
    };
  });
});

export const tags: TagGroup[] = (spec.tags ?? [])
  .map((t: any) => ({
    name: t.name,
    id: tagAnchor(t.name),
    description: t.description,
    operations: operations.filter((o) => o.tag === t.name),
  }))
  .filter((t: TagGroup) => t.operations.length);

export const schemas: NamedSchema[] = Object.entries<Schema>(spec.components?.schemas ?? {}).map(([name, schema]) => ({
  name,
  id: schemaAnchor(name),
  schema,
}));

/** Minimal markdown for spec descriptions: paragraphs, `code`, **bold**, [links](url). */
export function renderDescription(text: string | undefined): string {
  if (!text) return '';
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const inline = (s: string) =>
    esc(s)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  const out: string[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  for (const line of text.trim().split('\n')) {
    const m = line.match(/^(#{1,3})\s+(.+)$/);
    if (m) {
      flush();
      const level = Math.min(m[1].length + 1, 4);
      out.push(`<h${level}>${inline(m[2])}</h${level}>`);
    } else if (!line.trim()) {
      flush();
    } else {
      para.push(line.trim());
    }
  }
  flush();
  return out.join('\n');
}
