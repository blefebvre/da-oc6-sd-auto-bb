/**
 * ld-trends — the landing market-trends band ("Exclusive Content for You"): a full-bleed photo
 * band with one copy box (title, text, narrow uppercase CTA) on the left 40 %. The photo is
 * decorative (CSS, file in this folder).
 * Decode tier: reconstructive (one row per box, node-slotted). Authoring: each row, one cell:
 *   <h3>Title</h3> <p>Text</p> <p><strong><a href="…">CTA</a></strong></p>
 * Editability (EW1–EW10): every authored node is MOVED into the box wrapper.
 */
export default function decorate(block) {
  const boxes = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const box = document.createElement('div');
    box.className = 'ld-trends-box';
    cells.forEach((cell) => {
      [...cell.children].forEach((el) => {
        if (el.matches('p') && el.querySelector('a.button')) {
          const cta = document.createElement('div');
          cta.className = 'ld-trends-cta';
          el.querySelectorAll('a.button').forEach((a) => a.classList.add('upper', 'narrow'));
          cta.append(el);
          box.append(cta);
          return;
        }
        box.append(el);
      });
    });
    boxes.push(box);
  });
  block.replaceChildren(...boxes);
}
