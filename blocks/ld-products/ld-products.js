/**
 * ld-products — the landing product tiles (live: two Elementor rows of two photo cards —
 * Investments | Real Estate Lending, Credit Cards | Zelle): each card is a cover photo with the
 * copy bottom-left (eyebrow, title, description) and a pill CTA; the Zelle card carries the logo,
 * a text line and the footnote under its CTA. Variants `first` / `second` = the live row
 * (photos are decorative CSS keyed by variant + card position, files in this folder).
 * Decode tier: reconstructive (one row per card, node-slotted). Authoring: each row, one cell:
 *   <p>Eyebrow</p> <h3>Title</h3> <p>Description</p> <p><strong><a href="…">CTA</a></strong></p>
 *   (Zelle: <p><img></p> <p>text<sup>1</sup></p> CTA <p><sup>1</sup>footnote</p>)
 * Everything before the CTA is the card body (each node MOVED into its own role wrapper:
 * eyebrow = the p before a heading, title, logo = p with an img, desc = any other p), everything
 * after it is the footnote; a card with no eyebrow (title first) renders the live regular-weight
 * title. Editability (EW1–EW10): every authored node is MOVED, never rebuilt.
 */
export default function decorate(block) {
  const cards = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const card = document.createElement('div');
    card.className = 'ld-product';
    const body = document.createElement('div');
    body.className = 'ld-product-body';
    const note = document.createElement('div');
    note.className = 'ld-product-note';
    let cta = null;
    const wrap = (el, cls) => {
      const w = document.createElement('div');
      w.className = cls;
      w.append(el);
      return w;
    };
    cells.forEach((cell) => {
      const kids = [...cell.children];
      kids.forEach((el, i) => {
        if (!cta && el.matches('p') && el.querySelector('a.button')) {
          cta = el;
          el.querySelectorAll('a.button').forEach((a) => a.classList.add('upper'));
          return;
        }
        if (cta) { note.append(el); return; }
        const next = kids[i + 1];
        if (/^H[1-6]$/.test(el.tagName)) body.append(wrap(el, 'ld-product-title'));
        else if (el.querySelector('img')) body.append(wrap(el, 'ld-product-logo'));
        else if (next && /^H[1-6]$/.test(next.tagName)) body.append(wrap(el, 'ld-product-eyebrow'));
        else body.append(wrap(el, 'ld-product-desc'));
      });
    });
    card.append(body);
    if (cta) card.append(cta);
    if (note.children.length) card.append(note);
    cards.push(card);
  });
  block.replaceChildren(...cards);
}
