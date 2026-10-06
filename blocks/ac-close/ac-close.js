/**
 * ac-close — activation closing band (live Elementor e-con-full 8685a5c on
 * /en/visa-gold-activation/): card picture (50 %) | boxed text — the agreements title and the
 * "SEE MORE" control. Decode tier: template-slotted.
 * Authoring (one row): cell 1 = <p><img></p>; cell 2 = <p>title</p> then the control. On live
 * the control is an Elementor Pro popup trigger (`a[href="#elementor-action…popup…"]`) whose
 * body is AJAX-injected and absent from every capture (dynamics row 13 m-activation-popup): it
 * is authored as a NON-LINK control carrying the captured label — <p><strong>SEE MORE</strong></p>
 * — styled as the grey pill; a sibling with a real target authors
 * <p><strong><a href>…</a></strong></p> (same pill via a.button). The popup click-capture +
 * native rebuild is the cluster unit's (blocks/ac-popup, dynamics row 13): when the page holds an
 * `ac-popup` block and the control is the non-link label, a transparent
 * span[role=button].ac-close-trigger sibling is laid over the pill inside `.ac-close-control`
 * and opens the modal (CustomEvent
 * `ac-popup:open`); the authored <p> is never moved into a <button> (EW7). Without a popup block or
 * with a real-href control nothing is added.
 * Cells may be merged: nodes split by role (picture / control / first remaining text = title).
 * Editability (EW1–EW10): every authored node is MOVED; wrappers carry the classes.
 */
const div = (className) => Object.assign(document.createElement('div'), { className });
const isPicture = (el) => el.matches('picture, img') || !!el.querySelector('img');
const isControl = (el) => {
  const mark = el.firstElementChild;
  return el.matches('p') && !!mark && el.children.length === 1
    && mark.matches('strong, em, a') && el.textContent.trim() === mark.textContent.trim();
};

function widget(className, nodes) {
  const w = div(`ac-widget ${className}`);
  const body = div('ac-body');
  body.append(...nodes);
  w.append(body);
  return w;
}

export default function decorate(block) {
  // capture every authored node BEFORE moving anything (EW1)
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const nodes = cells.flatMap((cell) => [...cell.children]);
  const pictures = nodes.filter(isPicture);
  const texts = nodes.filter((el) => !isPicture(el));
  const title = texts.find((el) => !isControl(el)) || texts[0];
  const controls = texts.filter((el) => el !== title && isControl(el));
  const copy = texts.filter((el) => el !== title && !isControl(el));
  const media = div('ac-close-media');
  if (pictures.length) media.append(widget('ac-widget-image ac-close-image', pictures));
  const text = div('ac-close-text');
  const inner = div('e-inner ac-close-inner');
  if (title) inner.append(widget('ac-close-title', [title, ...copy]));
  if (controls.length) inner.append(widget('ac-close-cta', controls));
  const popup = document.querySelector('.ac-popup');
  const cta = inner.querySelector('.ac-close-cta');
  if (cta && popup && !controls.some((c) => c.querySelector('a[href]'))) {
    // the trigger is a span[role=button], NOT a <button>: generic overlay dismissers (the gate's
    // stitch pass closes `[class*=popup]` roots through `button[class*=close]`) clicked the
    // transparent <button> inside this `ac-close` block and left the modal open in every
    // 360 capture (round 0). Same a11y contract: role, tabindex, Enter/Space, aria-haspopup.
    const control = div('ac-close-control');
    const label = cta.querySelector('.ac-body');
    const open = document.createElement('span');
    open.className = 'ac-close-trigger';
    open.setAttribute('role', 'button');
    open.tabIndex = 0;
    open.setAttribute('aria-haspopup', 'dialog');
    open.setAttribute('aria-expanded', 'false');
    open.setAttribute('aria-label', controls.map((c) => c.textContent.trim()).join(' '));
    label.setAttribute('aria-hidden', 'true');
    const fire = () => popup.dispatchEvent(new CustomEvent('ac-popup:open', { detail: { trigger: open } }));
    open.addEventListener('click', fire);
    open.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fire(); }
    });
    control.append(label, open);
    cta.append(control);
  }
  const hashLink = cta && popup && controls.map((c) => c.querySelector('a[href^="#"]')).find(Boolean);
  if (hashLink) {
    // the live control is an <a href="#elementor-action…popup…"> — a same-page hash link that opens
    // the popup; authored as <p><strong><a href="#see-more">…</a></strong></p> it keeps that contract:
    // the anchor itself is the trigger (click/Enter → ac-popup:open, default navigation suppressed).
    hashLink.setAttribute('role', 'button');
    hashLink.setAttribute('aria-haspopup', 'dialog');
    hashLink.setAttribute('aria-expanded', 'false');
    hashLink.addEventListener('click', (e) => {
      e.preventDefault();
      popup.dispatchEvent(new CustomEvent('ac-popup:open', { detail: { trigger: hashLink } }));
    });
  }
  text.append(inner);
  block.replaceChildren(media, text);
}
