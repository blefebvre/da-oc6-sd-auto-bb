/**
 * st-hero — static-template hero (the live Elementor e-con-full on /en/bank-holidays/):
 * a full-width photo band (85vh, cover, centred) with the centred white title, followed by the
 * 19 px deep-red divider line (CSS; a gradient image at ≤767). Variant = the photo (`holidays`);
 * `bare` = no divider after the hero. Decode tier: template-slotted.
 * Authoring (one row, one cell, flat siblings): <h1>…</h1> the title; optional <p> lead,
 * optional <p><img> decorative picture (kept in the body as .st-hero-pic).
 * Editability (EW1–EW10): every authored node is MOVED into the widget/body wrappers.
 */
export default function decorate(block) {
  const widget = document.createElement('div');
  widget.className = 'st-hero-widget';
  const body = document.createElement('div');
  body.className = 'st-hero-body';
  const heading = block.querySelector('h1, h2, h3');
  if (heading) heading.classList.add('st-hero-title');
  block.querySelectorAll(':scope > div > div > *').forEach((el) => {
    if (el.matches('p')) el.classList.add(el.querySelector('img') ? 'st-hero-pic' : 'st-hero-lead');
    body.append(el);
  });
  widget.append(body);
  block.replaceChildren(widget);
  if (block.classList.contains('bare')) return;
  const divider = document.createElement('div');
  divider.className = 'st-divider';
  divider.setAttribute('role', 'presentation');
  block.after(divider);
}
