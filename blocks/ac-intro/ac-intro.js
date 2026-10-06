/**
 * ac-intro — activation intro band (live Elementor boxed e-con 9feccb9 on
 * /en/visa-gold-activation/): the centred "Start enjoying your card in just 7 steps" heading in
 * the Blocksy container, padding 75 / 72. Decode tier: template-slotted.
 * Authoring (one row, one cell, flat siblings): <h2>…</h2> (a sibling's <p> title keeps its
 * role).
 * Any other variant class = a generic boxed copy band for a section shape the encoder does not
 * know (rows stack as widgets; nothing is dropped).
 * Editability (EW1–EW10): every authored node is MOVED into the widget/body wrappers.
 */
const div = (className) => Object.assign(document.createElement('div'), { className });

export default function decorate(block) {
  const inner = div('e-inner ac-intro-inner');
  // capture the cells BEFORE moving anything (EW1)
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => {
    const widget = div('ac-widget ac-intro-widget');
    const body = div('ac-body');
    body.append(...cell.children);
    widget.append(body);
    inner.append(widget);
  });
  block.replaceChildren(inner);
}
