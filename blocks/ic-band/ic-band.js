/**
 * ic-band — generic listing band: the authored copy inside a boxed .e-inner. The listing
 * encoder uses it for the "Highlights" title band (variant `hl-title`: live Elementor e-con
 * 65b7b51 + heading widget c5e1a42) and as the fallback for a sibling section shape it does not
 * know (variant = the section's modifier, `plain` when none) — content is never dropped.
 * Decode tier: template-slotted. Authoring (rows of one cell; every row's nodes keep their order):
 *   <p>Highlights</p>   (a sibling's <h2> keeps its tag — role parity, same paint)
 * Editability (EW1–EW10): every authored node is MOVED into the text wrapper.
 * @ew-exempt none
 */
export default function decorate(block) {
  const inner = document.createElement('div');
  inner.className = 'e-inner ic-band-inner';
  const text = document.createElement('div');
  text.className = 'ic-band-text';
  block.querySelectorAll(':scope > div > div > *').forEach((el) => text.append(el));
  inner.append(text);
  block.replaceChildren(inner);
}
