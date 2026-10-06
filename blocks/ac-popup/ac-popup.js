/**
 * ac-popup — the activation page's agreements modal. On live it is an Elementor Pro popup
 * (`elementor-popup-modal-<id>`) whose body is AJAX-injected when "SEE MORE" is clicked and
 * absent from every static capture (dynamics row 13 m-activation-popup, rebuild-native):
 * captured by stardust/scripts/dynamics/popup-capture.mjs → stardust/dynamics/popups/<slug>.*
 * and authored VERBATIM by encoders/activation.mjs — one row per document: cell 1 = <p>label</p>,
 * cell 2 = <p><strong><a href=…pdf>Download</a></strong></p> (a row may hold one cell).
 * Hidden until opened; `ac-close` opens it (CustomEvent `ac-popup:open`, detail.trigger) as a
 * modal: role=dialog + aria-modal, close button / overlay click / Escape close, focus moved to
 * the close button and restored to the opener, body scroll locked while open — exactly what
 * fired on live (stardust/replica/motion/en-visa-gold-activation.json: dialog-lightbox-* body
 * classes, display none after Escape), nothing more. Values from the captured computed styles.
 * EW1–EW10: every authored node is MOVED; wrappers carry the classes.
 */
const div = (className) => Object.assign(document.createElement('div'), { className });
const hasLink = (el) => !!el.querySelector('a[href]');
const CLOSE_ICON = '<svg viewBox="0 0 1000 1000" width="36" height="36" aria-hidden="true" focusable="false">'
  + '<path fill="currentColor" d="M742 167L500 408 258 167c-13-13-33-13-46 0s-13 33 0 46l241 242-241 '
  + '241c-13 13-13 33 0 46s33 13 46 0l242-241 242 241c13 13 33 13 46 0s13-33 0-46L546 455l242-242c13-13 '
  + '13-33 0-46s-33-13-46 0z"/></svg>';

export default function decorate(block) {
  // capture every authored node BEFORE moving anything (EW1)
  const cells = [...block.querySelectorAll(':scope > div > div')];
  const nodes = cells.flatMap((cell) => [...cell.children]);
  const dialog = div('ac-popup-dialog');
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.tabIndex = -1;
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'ac-popup-close';
  close.setAttribute('aria-label', 'Close');
  close.innerHTML = CLOSE_ICON;
  const body = div('ac-popup-body');
  nodes.forEach((el) => {
    const w = div(`ac-widget ${hasLink(el) ? 'ac-popup-link' : 'ac-popup-label'}`);
    const b = div('ac-body');
    b.append(el);
    w.append(b);
    body.append(w);
  });
  dialog.append(close, body);
  block.replaceChildren(dialog);
  block.setAttribute('aria-hidden', 'true');

  let opener = null;
  let bodyOverflow = '';
  const shut = () => {
    if (!block.classList.contains('is-open')) return;
    block.classList.remove('is-open');
    block.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = bodyOverflow;
    if (opener) {
      if (opener.hasAttribute('aria-expanded')) opener.setAttribute('aria-expanded', 'false');
      opener.focus();
    }
    opener = null;
  };
  const onKey = (e) => {
    if (e.key === 'Escape' && block.classList.contains('is-open')) { e.preventDefault(); shut(); }
  };
  const open = (trigger) => {
    opener = trigger || document.activeElement;
    bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    block.classList.add('is-open');
    block.removeAttribute('aria-hidden');
    if (opener && opener.hasAttribute('aria-expanded')) opener.setAttribute('aria-expanded', 'true');
    close.focus();
  };
  close.addEventListener('click', shut);
  block.addEventListener('click', (e) => { if (e.target === block) shut(); });
  document.addEventListener('keydown', onKey);
  block.addEventListener('ac-popup:open', (e) => open(e.detail && e.detail.trigger));
}
