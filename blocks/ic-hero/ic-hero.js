/**
 * ic-hero — listing (investments-content) hero: the cover photo (decorative CSS, file in this
 * folder) under a bottom-left lead paragraph at 85vh (live Elementor e-con 582fe00 / c1566db /
 * 9e53e12 + the empty 58 % spacer bbeb03d), then the 19 px deep-red divider bar (canon .bar,
 * 62594cb).
 * Decode tier: template-slotted. Authoring (one row, one cell, flat siblings):
 *   <p>lead</p>  (a sibling's <h1>/<h2> keeps its tag — role parity, same paint)
 * Variant `bare` = no divider after the hero.
 * Editability (EW1–EW10): every authored node is MOVED into the text wrapper.
 * @ew-exempt none
 */
export default function decorate(block) {
  const inner = document.createElement('div');
  inner.className = 'e-inner ic-hero-inner';
  const col = document.createElement('div');
  col.className = 'ic-hero-col';
  const text = document.createElement('div');
  text.className = 'ic-hero-text';
  block.querySelectorAll(':scope > div > div > *').forEach((el) => text.append(el));
  col.append(text);
  const spacer = document.createElement('div');
  spacer.className = 'ic-hero-spacer';
  spacer.setAttribute('role', 'presentation');
  inner.append(col, spacer);
  block.replaceChildren(inner);
  if (block.classList.contains('bare')) return;
  const bar = document.createElement('div');
  bar.className = 'bar';
  bar.setAttribute('role', 'presentation');
  block.after(bar);
}
