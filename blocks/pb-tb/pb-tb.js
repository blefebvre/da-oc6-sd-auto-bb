/**
 * pb-tb — 'Frequently Asked Questions' topic board (grey band, two decorative corner graphics
 * in CSS): intro column (h2 + CTA) and a 2×2 grid of white topic links with an 8 px red rule.
 * Decode tier: template-slotted. Authoring: row 1 cell = h2 +
 * `<p><strong><a>See More</a></strong></p>`;
 * row 2 cell = `<ul><li><a href='…'>Topic</a></li>…</ul>`. Editability: all nodes MOVED.
 */
export default function decorate(block) {
  const [introRow, topicsRow] = block.children;
  const row = document.createElement('div');
  row.className = 'pb-econ pb-tb-row';
  const intro = document.createElement('div');
  intro.className = 'pb-econ pb-tb-intro';
  if (introRow?.firstElementChild) {
    const cell = introRow.firstElementChild;
    cell.querySelectorAll(':scope > h2, :scope > h3').forEach((h) => h.classList.add('pb-tb-title'));
    cell.querySelectorAll(':scope > p').forEach((p) => { if (p.querySelector('a.button')) p.classList.add('pb-btn-end'); });
    intro.append(...cell.children);
  }
  const topics = (topicsRow && topicsRow.querySelector('ul')) || document.createElement('ul');
  topics.className = 'pb-econ pb-tb-topics';
  topics.querySelectorAll(':scope > li').forEach((li) => {
    li.className = 'pb-econ pb-tb-cell';
    li.querySelectorAll('a').forEach((a) => { a.className = 'pb-tb-topic'; });
  });
  if (topicsRow) {
    // leftovers (anything authored beside the list) stay visible
    topicsRow.querySelectorAll(':scope > div > *').forEach((el) => { if (el !== topics) topics.append(el); });
  }
  block.querySelectorAll('a.button').forEach((a) => a.classList.add('upper', 'narrow', 'primary'));
  row.append(intro, topics);
  block.replaceChildren(row);
}
