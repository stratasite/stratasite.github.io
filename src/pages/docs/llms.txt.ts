/**
 * /docs/llms.txt — the developer guide as one markdown file, for AI agents that
 * write Strata YAML. Linked from the docs and from `strata` CLI output, so the
 * path is permanent. Rules, canonical examples, and common mistakes are
 * hand-written in src/data/docs-ai/ and wrap the generated page content.
 */
import type { APIRoute } from 'astro';
import rules from '../../data/docs-ai/rules.md?raw';
import examples from '../../data/docs-ai/examples.md?raw';
import mistakes from '../../data/docs-ai/mistakes.md?raw';
import { SECTION_ORDER, cleanMdx, groupBySection, linksToAnchors, loadDocPages, toAnchor } from '../../data/docs-ai';

export const GET: APIRoute = async () => {
  const pages = await loadDocPages();
  const sections = groupBySection(pages);
  const ordered = SECTION_ORDER.map((id) => sections.find((s) => s.id === id)).filter(
    (s): s is NonNullable<typeof s> => Boolean(s)
  );

  const out: string[] = [
    '# Strata Semantic Modeling Reference',
    '',
    '> Complete reference for AI agents building semantic models with Strata CLI',
    '',
    'Strata is a semantic layer platform that transforms raw database tables into business-ready analytics models. Data engineers define semantic models using YAML files, which are version-controlled and deployed via CLI.',
    '',
    rules.trim(),
    '',
    '## Table of Contents',
    '',
  ];

  for (const s of ordered) {
    out.push(`- [${s.title}](#${toAnchor(s.title)})`);
    for (const p of s.items) if (p.leaf !== 'index') out.push(`  - [${p.title}](#${toAnchor(p.title)})`);
  }
  out.push('- [Canonical YAML Examples](#canonical-yaml-examples)');
  out.push('- [Common Mistakes to Avoid](#common-mistakes-to-avoid)', '');

  for (const s of ordered) {
    out.push('---', '', `## ${s.title}`, '');
    const items = [...s.items].sort((a, b) => {
      if (a.leaf === 'index') return -1;
      if (b.leaf === 'index') return 1;
      return a.id.localeCompare(b.id);
    });
    for (const p of items) {
      if (p.leaf !== 'index') out.push(`### ${p.title}`, '');
      out.push(cleanMdx(linksToAnchors(p.body, pages)), '');
    }
  }

  out.push('---', '', examples.trim(), '', '---', '', mistakes.trim(), '');

  return new Response(out.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
