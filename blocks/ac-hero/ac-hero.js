/**
 * ac-hero — activation hero (live Elementor e-con-full 2ee2b11 on /en/visa-gold-activation/):
 * a 736 px photo band (cover) holding a boxed row of three equal-basis columns — spacer | card
 * picture | title + sub-line — followed by the 19 px red line (.ac-line; gradient image ≤767).
 * Variant = the photo (`gold`: header-desk-1 / Header-mob-1 ≤767, files in this folder); `bare` =
 * no line after the hero. Decode tier: template-slotted.
 * Authoring (one row): cell 1 = <p><img></p> the card picture; cell 2 = <p>title</p> <p>sub</p>
 * (role parity: the live hero texts are <p>, never promoted). Cells may be merged or omitted:
 * nodes are split by role (picture vs text), the first text is the title, the rest the sub-line.
 * Editability (EW1–EW10): every authored node is MOVED into the widget/body wrappers; the
 * wrappers carry the classes, texts are styled by descendant selectors.
 */
const div = (className) => Object.assign(document.createElement('div'), { className });
const isPicture = (el) => el.matches('picture, img') || !!el.querySelector('img');

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
  const inner = div('e-inner ac-hero-inner');
  const media = div('ac-hero-media');
  if (pictures.length) media.append(widget('ac-widget-image', pictures));
  const text = div('ac-hero-text');
  if (texts.length) text.append(widget('ac-hero-title', [texts[0]]));
  if (texts.length > 1) text.append(widget('ac-hero-sub', texts.slice(1)));
  inner.append(div('ac-hero-spacer'), media, text);
  block.replaceChildren(inner);
  if (block.classList.contains('bare')) return;
  const line = div('ac-line');
  line.setAttribute('role', 'presentation');
  block.after(line);
}
