/**
 * Numbers the headings of a legal document and gives every section a stable,
 * number-based anchor id.
 *
 * Legal text cross-references itself by number ("see Section 10.2(h)"), and
 * those references are quoted in contracts, emails, and other people's
 * documents. So the numbering can't live only in the prose (where an edit can
 * silently shift it) and the anchors can't be derived from heading text (where
 * two sections both titled "License" collide, and a wording tweak breaks every
 * inbound link). Both are derived here from document structure instead:
 *
 *   h2  ->  "7"          #section-7
 *   h3  ->  "7.2"        #section-7-2
 *   h4  ->  "7.2(c)"     #section-7-2-c
 *
 * The number is emitted as real text inside the heading (not a CSS counter) so
 * it survives copy/paste, in-page find, and printing.
 *
 * Opt in per document with `numbered: true` in frontmatter — the plugin is
 * registered globally but no-ops on every other page. It also writes a `toc`
 * array back onto the frontmatter, which the Legal layout reads via
 * `remarkPluginFrontmatter` so the table of contents can never disagree with
 * the body numbering.
 *
 * Must run AFTER rehype-slug, whose text-derived ids it deliberately replaces.
 */

const LEVELS = { h2: 2, h3: 3, h4: 4 };

/** Depth-first walk over hast element nodes. */
function walk(node, visit) {
  if (node.type === 'element') visit(node);
  for (const child of node.children ?? []) walk(child, visit);
}

/** Flatten a hast node's text content (headings are plain text in practice). */
function textOf(node) {
  if (node.type === 'text') return node.value;
  return (node.children ?? []).map(textOf).join('');
}

/** 1 -> "a", 2 -> "b" … lettering for the deepest level. */
function letter(n) {
  return String.fromCharCode(96 + n);
}

export function rehypeLegalSections() {
  return (tree, file) => {
    const frontmatter = file.data?.astro?.frontmatter;
    if (!frontmatter || frontmatter.numbered !== true) return;

    let major = 0;
    let minor = 0;
    let sub = 0;
    const toc = [];

    walk(tree, (node) => {
      const depth = LEVELS[node.tagName];
      if (!depth) return;

      let label;
      let id;
      if (depth === 2) {
        major += 1;
        minor = 0;
        sub = 0;
        label = `${major}`;
        id = `section-${major}`;
      } else if (depth === 3) {
        minor += 1;
        sub = 0;
        label = `${major}.${minor}`;
        id = `section-${major}-${minor}`;
      } else {
        sub += 1;
        label = `${major}.${minor}(${letter(sub)})`;
        id = `section-${major}-${minor}-${letter(sub)}`;
      }

      const text = textOf(node);
      node.properties = { ...node.properties, id };
      node.children = [
        {
          type: 'element',
          tagName: 'span',
          properties: { className: ['legal-num'] },
          children: [{ type: 'text', value: label }],
        },
        { type: 'text', value: ' ' },
        ...node.children,
      ];

      // The jump nav lists top-level sections and their direct subsections;
      // the lettered depth would drown it (10.2 alone has eleven).
      if (depth <= 3) toc.push({ id, label, text, depth });
    });

    frontmatter.toc = toc;
  };
}

export default rehypeLegalSections;
