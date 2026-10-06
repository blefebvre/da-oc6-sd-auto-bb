/**
 * pb-con — the five photo tiles (anchor 'services' row of the program template). Each tile is
 * a live Elementor e-con anchor with a cover photo (CSS, decorative) and a centred title;
 * hover
 * scales the tile 1.1 (live :hover rule). Decode tier: reconstructive (one row per tile).
 * Authoring: row n = one cell `<p><a href='#section-id'>Tile title</a></p>` (plain link).
 * Editability: the anchor is MOVED and becomes the tile; its authored holder becomes the title.
 * Variant: none (tile n gets `pb-con-tile-n` for its photo).
 */
export default function decorate(block) {
  const nav = document.createElement('nav');
  nav.className = 'pb-con-services';
  nav.setAttribute('aria-label', block.closest('[aria-label]')?.getAttribute('aria-label') || 'Services');
  [...block.children].forEach((row, i) => {
    const a = row.querySelector('a');
    if (!a) return;
    a.className = `pb-con-tile pb-con-tile-${i + 1}`;
    const p = a.closest('p, h1, h2, h3, h4');
    nav.append(a); // out of its <p> first (that <p> becomes the title inside the tile)
    const wrap = document.createElement('div');
    wrap.className = 'pb-con-tile-title-wrap';
    const h = p || document.createElement('p');
    h.className = 'pb-con-tile-title';
    h.removeAttribute('id'); // the section h2 owns the anchor id, not the tile label
    while (a.firstChild) h.append(a.firstChild);
    // live tile 2: "Money Market & Savings <span>|</span> Certificate of Deposit" (bar = span)
    [...h.childNodes].filter((n) => n.nodeType === 3 && n.data.includes('|')).forEach((n) => {
      const at = n.data.indexOf('|');
      const rest = n.splitText(at);
      const bar = document.createElement('span');
      bar.textContent = '|';
      rest.data = rest.data.slice(1);
      n.after(bar);
    });
    wrap.append(h);
    a.append(wrap);
    // anything else authored in the row stays visible inside the tile
    row.querySelectorAll(':scope > div > *').forEach((el) => { if (el.textContent.trim()) wrap.append(el); });
  });
  block.replaceChildren(nav);
}
