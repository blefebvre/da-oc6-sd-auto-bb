/**
 * table — the Block Collection data table (D11): one authored row per table row, the first row
 * is the header unless the block carries the `no-header` variant.
 * Editability (EW1): every cell's authored nodes are MOVED into the <td>/<th>; the live table
 * on bradescobank.com renders Blocksy defaults (border #e1e8ed, padding .7em 1em).
 * @ew-exempt none
 */
export default function decorate(block) {
  const table = document.createElement('table');
  const header = !block.classList.contains('no-header');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  if (header) table.append(thead);
  table.append(tbody);

  [...block.children].forEach((row, i) => {
    const tr = document.createElement('tr');
    const isHead = header && i === 0;
    (isHead ? thead : tbody).append(tr);
    [...row.children].forEach((col) => {
      const cell = document.createElement(isHead ? 'th' : 'td');
      if (isHead) cell.setAttribute('scope', 'col');
      cell.append(...col.childNodes);
      tr.append(cell);
    });
  });

  block.replaceChildren(table);
}
