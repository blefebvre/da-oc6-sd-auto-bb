/**
 * ld-digital — the landing "Simplify and enhance your life with our digital solutions" section:
 * a title and three items (title, text, CTA; the third with a decorative picture). On live the
 * whole Elementor section is hidden on every device (desktop, tablet, mobile); the gated
 * prototype keeps it as `display: none` and so does this block — the content is authored
 * verbatim (it is the live source) but not shown, exactly as live.
 * Decode tier: template-slotted. Authoring: row 1, one cell: <h2>; rows 2…n, one cell each:
 *   <p>Item title</p> <p>Item text</p> <p><strong><a href="…">CTA</a></strong></p> [<p><img></p>]
 * Editability (EW1–EW10): every authored node is MOVED into the item wrappers.
 */
export default function decorate(block) {
  const out = [];
  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    if (!cells.length) return;
    if (i === 0 && cells[0].querySelector('h1, h2, h3')) {
      out.push(...cells[0].children);
      return;
    }
    const item = document.createElement('div');
    item.className = 'ld-digital-item';
    cells.forEach((cell) => item.append(...cell.children));
    out.push(item);
  });
  block.replaceChildren(...out);
}
