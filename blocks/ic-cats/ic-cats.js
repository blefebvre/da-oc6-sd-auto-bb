/**
 * ic-cats — the listing category banners (live Elementor e-con 84ac3c9: two 50 % cover-photo
 * columns 0ecc2be "Educational" / 5d70220 "Market Insight", copy bottom-left, pill CTA). The
 * photos are decorative CSS keyed by banner position (files in this folder).
 * Decode tier: reconstructive (one row per banner, node-slotted). Authoring: each row, one cell:
 *   <h3>Title</h3> <p>Description</p> <p><strong><a href="…">CTA</a></strong></p>
 * Everything before the CTA is the banner copy (each node MOVED into its role wrapper: heading =
 * title, any other node = description); the CTA keeps its paragraph and is rendered uppercase
 * (live: "LEARN MORE" literal on the first banner, `btn--upper` on the second — same paint).
 * Editability (EW1–EW10): every authored node is MOVED, never rebuilt.
 * @ew-exempt none
 */
export default function decorate(block) {
  const banners = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const banner = document.createElement('div');
    banner.className = 'ic-cat';
    const inner = document.createElement('div');
    inner.className = 'e-inner ic-cat-inner';
    let cta = null;
    cells.forEach((cell) => {
      [...cell.children].forEach((el) => {
        if (!cta && el.matches('p') && el.querySelector('a.button')) {
          cta = el;
          el.classList.add('ic-cat-cta');
          el.querySelectorAll('a.button').forEach((a) => a.classList.add('upper'));
          return;
        }
        const w = document.createElement('div');
        w.className = /^H[1-6]$/.test(el.tagName) ? 'ic-cat-title' : 'ic-cat-desc';
        w.append(el);
        inner.append(w);
      });
    });
    banner.append(inner);
    if (cta) banner.append(cta);
    banners.push(banner);
  });
  block.replaceChildren(...banners);
}
