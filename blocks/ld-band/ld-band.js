/**
 * ld-band — generic landing band for a sibling section shape the landing encoder does not know
 * (never dropped content): stacked copy rows in the Elementor boxed inner (.e-inner); an n-cell
 * row (n ≥ 2) renders as a simple table. The variant class names the live section kind
 * (`plain` when it has none) so a later block can take the shape over.
 * Decode tier: template-slotted. Authoring: 1-cell rows = copy (headings, p, lists, pictures,
 * `<p><strong><a>` = CTA); n-cell rows = table rows.
 * Editability (EW1–EW10): every authored node is MOVED into the generated wrappers.
 */
export default function decorate(block) {
  const inner = document.createElement('div');
  inner.className = 'e-inner ld-band-inner';
  let table = null;
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    if (cells.length === 1) {
      table = null;
      const copy = document.createElement('div');
      copy.className = 'ld-band-copy';
      copy.append(...cells[0].children);
      inner.append(copy);
      return;
    }
    if (!table) {
      table = document.createElement('table');
      table.className = 'ld-band-table';
      inner.append(table);
    }
    const tr = document.createElement('tr');
    cells.forEach((c) => {
      const td = document.createElement('td');
      td.append(...c.children);
      tr.append(td);
    });
    (table.tBodies[0] || table.createTBody()).append(tr);
  });
  block.replaceChildren(inner);
}
