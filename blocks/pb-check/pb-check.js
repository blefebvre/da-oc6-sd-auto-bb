/**
 * pb-check — "Checking Account" grey band: intro copy (h2 + paragraphs), feature cards in rows
 * of two (white, 10 px red left rule), a footnote. Decode tier: reconstructive.
 * Authoring: row 1 = intro cell (h2, p…); rows with an h3 (or h2) = one card each (title + text);
 * a trailing row without a heading = footnote paragraph(s).
 * Editability: every authored element is MOVED; wrappers only add classes.
 */
export default function decorate(block) {
  const rows = [...block.children];
  const intro = document.createElement('div');
  intro.className = 'pb-econ pb-check-intro pb-check-rich';
  const body = document.createElement('div');
  body.className = 'pb-econ pb-check-body';
  let cardsRow = null;
  rows.forEach((row, i) => {
    const cell = row.firstElementChild;
    if (!cell) return;
    const heading = cell.querySelector('h2, h3, h4');
    if (i === 0) {
      intro.append(...cell.children);
      if (heading) heading.classList.add('pb-check-h');
      return;
    }
    if (heading) {
      if (!cardsRow || cardsRow.children.length === 2) {
        const group = document.createElement('div');
        group.className = 'pb-econ pb-check-cards';
        cardsRow = document.createElement('div');
        cardsRow.className = 'pb-econ pb-check-cards-row';
        group.append(cardsRow);
        body.append(group);
      }
      const card = document.createElement('div');
      card.className = 'pb-check-card';
      heading.classList.add('pb-check-card-title');
      cell.querySelectorAll('p').forEach((p) => p.classList.add('pb-check-card-text'));
      card.append(...cell.children);
      cardsRow.append(card);
      return;
    }
    cell.querySelectorAll('p').forEach((p) => p.classList.add('pb-check-footnote'));
    body.append(...cell.children);
  });
  block.replaceChildren(intro, body);
}
