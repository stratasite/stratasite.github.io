// Wraps every markdown table in `div.table-wrap` so wide reference tables
// scroll sideways inside the column instead of breaking the page width. The
// table itself keeps `width: 100%`, which `display: block; overflow-x: auto`
// on the table element would lose.
import { visit } from 'unist-util-visit';

export function rehypeTableWrap() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'table' || !parent || index == null) return;
      if (parent.tagName === 'div' && parent.properties?.className?.includes?.('table-wrap')) return;
      parent.children[index] = {
        type: 'element',
        tagName: 'div',
        properties: { className: ['table-wrap'] },
        children: [node],
      };
    });
  };
}
