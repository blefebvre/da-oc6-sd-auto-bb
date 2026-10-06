/**
 * accordion — the Block Collection accordion (details/summary), carrying the live Elementor
 * nested accordion of the exploring-investment-products articles (12 items, all collapsed,
 * at most one expanded). Authoring: one row per item: cell 1 = summary, cell 2 = body.
 * Editability (EW1): every authored node is MOVED into <summary> / .accordion-item-body.
 * @ew-exempt none
 */
export default function decorate(block) {
  const items = [...block.children].map((row) => {
    const [label, body] = [...row.children];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    if (label) summary.append(...label.childNodes);
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary);
    if (body) {
      body.className = 'accordion-item-body';
      details.append(body);
    }
    return details;
  });
  items.forEach((d) => {
    d.addEventListener('toggle', () => {
      if (d.open) items.forEach((o) => { if (o !== d && o.open) o.open = false; });
    });
  });
  block.replaceChildren(...items);
}
