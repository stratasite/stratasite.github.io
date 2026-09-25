// One-time migration of the Docusaurus docs (stratasite/developer-docs) into
// this site's `docs` content collection. Re-runnable: it overwrites
// src/content/docs/ from a checkout of the old repo, so late edits over there
// can be pulled across until that repo is archived.
//
//   node scripts/port-docs.mjs /path/to/developer-docs
//
// What it changes on the way in (everything else is copied verbatim):
//   - `docs/` → `src/content/docs/`, `server-docs/` → `src/content/docs/self-hosting/`
//   - the H1 becomes frontmatter `title`; the first paragraph becomes `description`
//   - `/developer-guide/x` → `/docs/x/`, `/self-hosting/x` → `/docs/self-hosting/x/`
//   - the Redoc route → `/docs/api-reference/`, llms.txt → `/docs/llms.txt`
//   - Docusaurus `:::tip Title` → remark-directive `:::tip[Title]`
//   - `@theme/Tabs` imports dropped (Tabs/TabItem are injected by the route)
//   - HTML comments → MDX comments
import { cpSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const src = process.argv[2];
if (!src) {
  console.error('usage: node scripts/port-docs.mjs <path to developer-docs checkout>');
  process.exit(1);
}

const root = new URL('../', import.meta.url).pathname;
const dest = join(root, 'src/content/docs');
rmSync(dest, { recursive: true, force: true });
mkdirSync(dest, { recursive: true });
cpSync(join(src, 'docs'), dest, { recursive: true });
cpSync(join(src, 'server-docs'), join(dest, 'self-hosting'), { recursive: true });

// The developer-guide overview was mounted at `/`; here it is the collection index.
cpSync(join(dest, 'overview.mdx'), join(dest, 'index.mdx'));
rmSync(join(dest, 'overview.mdx'));

// The OpenAPI spec is served as a static file next to the API reference page.
mkdirSync(join(root, 'public/docs/openapi'), { recursive: true });
cpSync(join(src, 'static/openapi/strata-api-v1.yaml'), join(root, 'public/docs/openapi/strata-api-v1.yaml'));

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith('.mdx')) yield p;
  }
}

const yamlString = (s) => JSON.stringify(s);

/** Site links end with a slash (`/pricing/`); keep anchors after it. */
function slashed(path) {
  const [p, hash] = path.split('#');
  const withSlash = p.endsWith('/') ? p : `${p}/`;
  return hash ? `${withSlash}#${hash}` : withSlash;
}

function rewriteLinks(body) {
  return body
    .replace(/\]\(pathname:\/\/\/api\/rest\/openapi\)/g, '](/docs/api-reference/)')
    .replace(/\]\(\/developer-guide\/?([^)]*)\)/g, (_, rest) => `](${slashed(`/docs/${rest}`)})`)
    .replace(/\]\(\/self-hosting\/?([^)]*)\)/g, (_, rest) => `](${slashed(`/docs/self-hosting/${rest}`)})`)
    .replace(/https:\/\/strata\.do\/developer-docs\/llms\.txt/g, 'https://strata.do/docs/llms.txt')
    .replace(/https:\/\/strata\.do\/developer-docs\/developer-guide\/?/g, 'https://strata.do/docs/')
    .replace(/https:\/\/strata\.do\/developer-docs\/?/g, 'https://strata.do/docs/');
}

/** Plain-text summary from the first body paragraph, for <meta description>. */
function firstParagraph(body) {
  const para = body
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .find((s) => s && !/^(#|```|:::|<|\||-|\d+\.|import )/.test(s));
  if (!para) return '';
  return para
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 200);
}

let count = 0;
for (const file of walk(dest)) {
  let text = readFileSync(file, 'utf8');

  // Split off any existing frontmatter.
  let fm = {};
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (m) {
    for (const line of m[1].split('\n')) {
      const kv = line.match(/^(\w+):\s*(.*)$/);
      if (kv) fm[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
    }
    text = text.slice(m[0].length);
  }
  delete fm.slug;

  // Lift the H1 into `title` and drop it from the body (the layout renders it).
  const h1 = text.match(/^#\s+(.+)\n/m);
  if (h1) {
    fm.title = fm.title ?? h1[1].trim();
    text = text.replace(h1[0], '');
  }
  text = text.replace(/^\n+/, '');

  text = text
    .replace(/^import\s+(Tabs|TabItem)\s+from\s+'@theme\/\w+';\s*\n/gm, '')
    .replace(/^:::(\w+)[ \t]+([^\n[]+?)\s*$/gm, (_, kind, title) => `:::${kind}[${title}]`)
    .replace(/<!--([\s\S]*?)-->/g, (_, c) => `{/*${c}*/}`);
  text = rewriteLinks(text);

  const description = fm.description ?? firstParagraph(text);
  const front = ['---', `title: ${yamlString(fm.title ?? 'Untitled')}`];
  if (description) front.push(`description: ${yamlString(description)}`);
  front.push('---', '');

  writeFileSync(file, front.join('\n') + text.replace(/^\n+/, ''));
  count++;
}

console.log(`✓ ported ${count} pages → ${relative(root, dest)}`);
