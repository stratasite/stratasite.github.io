/**
 * Shared plumbing for the machine-readable docs exports: /docs/llms.txt (the
 * whole developer guide as one markdown file for AI agents) and
 * /docs/api/docs.json (a discovery index). Ported from the old developer-docs
 * build plugin; reads the `docs` collection instead of the filesystem.
 */
import { getCollection } from 'astro:content';
import { docHref, docId } from '../config/docs';
import { site } from '../config/site';

export interface DocPage {
  /** Page id, e.g. `cli/tables`. */
  id: string;
  /** Last path segment, `index` for section overviews. */
  leaf: string;
  title: string;
  description?: string;
  url: string;
  section: string;
  body: string;
}

export interface DocSection {
  id: string;
  title: string;
  url: string;
  items: DocPage[];
}

export const SECTION_ORDER = [
  'getting-started',
  'cli',
  'semantic-model',
  'advanced',
  'examples',
  'troubleshooting',
];

const SECTION_TITLES: Record<string, string> = {
  'getting-started': 'Getting Started',
  cli: 'CLI Reference',
  'semantic-model': 'Semantic Model',
  advanced: 'Advanced Features',
  examples: 'Examples',
  troubleshooting: 'Troubleshooting',
};

export function sectionTitle(id: string) {
  if (id === 'root') return 'Documentation';
  return (
    SECTION_TITLES[id] ??
    id
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  );
}

export const absolute = (path: string) => `${site.domain}${path}`;

/**
 * The developer guide pages, in the same shape the old plugin produced. The
 * self-hosting guide and the REST API pages are left out, as before: the
 * export is the semantic-modeling knowledge an agent needs to write YAML.
 */
export async function loadDocPages(): Promise<DocPage[]> {
  const entries = await getCollection('docs', ({ data }) => !data.draft);
  return entries
    .map((e) => {
      const id = docId(e.id);
      const parts = id.split('/');
      return {
        id,
        leaf: parts[parts.length - 1],
        title: e.data.title,
        description: e.data.description,
        url: docHref(id),
        section: parts.length > 1 ? parts[0] : 'root',
        body: e.body.trim(),
      };
    })
    .filter((p) => !p.id.startsWith('self-hosting/') && !p.id.startsWith('api/'))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function groupBySection(pages: DocPage[]): DocSection[] {
  const map = new Map<string, DocSection>();
  for (const p of pages) {
    if (!map.has(p.section)) {
      map.set(p.section, {
        id: p.section,
        title: sectionTitle(p.section),
        url: p.section === 'root' ? '/docs/' : `/docs/${p.section}/`,
        items: [],
      });
    }
    map.get(p.section)!.items.push(p);
  }
  const rank = (id: string) => {
    const i = SECTION_ORDER.indexOf(id);
    return i === -1 ? SECTION_ORDER.length : i;
  };
  return Array.from(map.values()).sort((a, b) => rank(a.id) - rank(b.id) || a.id.localeCompare(b.id));
}

export function toAnchor(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/** Internal links become anchors into the single-file export. */
export function linksToAnchors(content: string, pages: DocPage[]) {
  return content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
    if (/^https?:\/\//.test(url) || url.includes('/api/schema/') || url.startsWith('#')) return match;
    const target = url.replace(/^\/docs\/?/, '').replace(/\/$/, '').split('#')[0];
    const page = pages.find((p) => p.id === target || p.id === `${target}/index` || (target === '' && p.id === 'index'));
    return `[${text}](#${toAnchor(page ? page.title : text)})`;
  });
}

/** Strip MDX-only syntax so the export reads as plain markdown. */
export function cleanMdx(content: string) {
  return content
    .replace(/^import\s+.*$/gm, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/^:::(\w+)\[([^\]]*)\]\s*$/gm, '**$1: $2**')
    .replace(/^:::(\w+)\s*$/gm, '**$1:**')
    .replace(/^:::\s*$/gm, '')
    .replace(/<TabItem[^>]*label="([^"]*)"[^>]*>/g, '**$1:**')
    .replace(/<\/?TabItem[^>]*>/g, '')
    .replace(/<\/?Tabs[^>]*>/g, '')
    .replace(/<[A-Z][^>]*>([\s\S]*?)<\/[A-Z][^>]*>/g, '$1')
    .replace(/<[A-Z][^/>]*\/>/g, '')
    .replace(/^\n+/, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function summarize(page: DocPage) {
  if (page.description?.trim()) return page.description.trim();
  const cleaned = cleanMdx(page.body)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
  if (!cleaned) return '';
  const first = cleaned.match(/.*?[.!?](\s|$)/);
  const s = first ? first[0].trim() : cleaned.slice(0, 180).trim();
  return s.length <= 220 ? s : `${s.slice(0, 217).trimEnd()}...`;
}
