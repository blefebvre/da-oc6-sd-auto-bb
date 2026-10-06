/**
 * ld-band-heading — landing heading band (live Elementor boxed container with one centred h2:
 * "Discover our tailored offerings…", "Discover our products", "Stay updated…"). The band
 * values are canon (foundation .band-heading / .band-heading-pad40); the title ramp is lifted
 * from canon.css .band-heading__title. Variant `pad40` = the 40 px mobile padding (≤767).
 * Decode tier: template-slotted. Authoring (one row, one cell): <h2>…</h2> — a sibling may
 * author a <p> title; its role is kept (never promoted).
 * Editability (EW1–EW10): the authored title is MOVED into the generated .e-inner.
 */
export default function decorate(block) {
  block.classList.add('band-heading');
  if (block.classList.contains('pad40')) block.classList.add('band-heading-pad40');
  const inner = document.createElement('div');
  inner.className = 'e-inner';
  block.querySelectorAll(':scope > div > div > *').forEach((el) => inner.append(el));
  block.replaceChildren(inner);
}
