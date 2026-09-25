// Docusaurus-style admonitions for MDX:
//
//   :::tip[Optional title]
//   Body, any markdown.
//   :::
//
// Requires remark-directive ahead of it. Renders the same markup as
// src/components/Callout.astro (`aside.callout.callout-<kind>` with a
// `.callout-title`), so the two are styled by one rule set in global.css.
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';

const KINDS = {
  note: 'Note',
  tip: 'Tip',
  info: 'Info',
  warning: 'Warning',
  caution: 'Caution',
  danger: 'Danger',
};

export function remarkAdmonitions() {
  return (tree) => {
    visit(tree, 'containerDirective', (node) => {
      const kind = node.name in KINDS ? node.name : null;
      if (!kind) return;

      let title = KINDS[kind];
      const first = node.children[0];
      if (first?.data?.directiveLabel) {
        title = toString(first);
        node.children.shift();
      }

      node.data ??= {};
      node.data.hName = 'aside';
      node.data.hProperties = { class: `callout callout-${kind}` };
      node.children.unshift({
        type: 'paragraph',
        data: { hName: 'p', hProperties: { class: 'callout-title' } },
        children: [{ type: 'text', value: title }],
      });
    });
  };
}
