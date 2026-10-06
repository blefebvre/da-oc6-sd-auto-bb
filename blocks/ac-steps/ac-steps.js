/**
 * ac-steps — activation step rows (live Elementor e-con-full 9b0cd4c / 8336b05 / f14b958 on
 * /en/visa-gold-activation/: a 1300 px row of two grey step cards — red head (number | title
 * [+ LOGIN CTA]) over a media box — and b403cd7, the final step: red head | picture, full width).
 * One block = one live row: a pair of steps, or `final` = the last step. Decode tier:
 * template-slotted.
 * Authoring: ONE ROW PER STEP, 4 cells — number (<h2>1.</h2>: the live number is a heading) |
 * title (<h2>, or a sibling's <p> — role kept) + optional body <p>s | CTA
 * (<p><strong><a>LOGIN</a></strong></p>, href verbatim; empty cell when none) | picture
 * (<p><img></p>). Cells may be merged or omitted: nodes are classified by role (picture, number
 * pattern, CTA link, first remaining text = title). `.ac-step-N` (the per-step lifted widths) is
 * read from the number text, falling back to the row position.
 * Editability (EW1–EW10): every authored node is MOVED; wrappers carry the classes.
 */
const div = (className) => Object.assign(document.createElement('div'), { className });
const isPicture = (el) => el.matches('picture, img') || !!el.querySelector('img');
const isNumber = (el) => /^\s*\d+\s*[.)]?\s*$/.test(el.textContent);
const isCta = (el) => {
  const a = el.querySelector('a');
  return !!a && el.textContent.trim() === a.textContent.trim();
};

function widget(className, nodes) {
  const w = div(`ac-widget ${className}`);
  const body = div('ac-body');
  body.append(...nodes);
  w.append(body);
  return w;
}

function classify(row) {
  const nodes = [...row.querySelectorAll(':scope > div')].flatMap((cell) => [...cell.children]);
  const step = {
    number: null, pictures: [], ctas: [], texts: [],
  };
  nodes.forEach((el) => {
    if (isPicture(el)) step.pictures.push(el);
    else if (!step.number && isNumber(el)) step.number = el;
    else if (isCta(el)) step.ctas.push(el);
    else step.texts.push(el);
  });
  return step;
}

function headOf(step, n, final) {
  const head = div(`ac-step-head${final ? ` ac-step-head-final ac-step-${n}` : ''}`);
  if (step.number) head.append(widget('ac-step-num', [step.number]));
  const title = widget('ac-step-title', step.texts);
  if (step.ctas.length) {
    const body = div('ac-step-body');
    body.append(title, widget('ac-step-cta', step.ctas));
    head.append(body);
  } else head.append(title);
  return head;
}

function mediaOf(step, n) {
  const media = div(`ac-step-media ac-step-media-${n}`);
  if (step.pictures.length) media.append(widget('ac-widget-image', step.pictures));
  return media;
}

export default function decorate(block) {
  const final = block.classList.contains('final');
  // classify every row BEFORE moving anything (EW1)
  const steps = [...block.children].map(classify);
  const parts = steps.map((step, i) => {
    const n = parseInt(step.number ? step.number.textContent : '', 10) || i + 1;
    const head = headOf(step, n, final);
    const media = mediaOf(step, n);
    if (final) return [head, media];
    const card = div(`ac-step ac-step-${n} ac-step-${i === 0 ? 'first' : 'second'}`);
    card.append(head, media);
    return [card];
  });
  block.replaceChildren(...parts.flat());
}
