/**
 * pb-invest — "Investment Opportunities" red band: intro column (title, lead, italic note, CTA)
 * and a row of white cells (icon, label, optional "Coming Soon" badge).
 * Decode tier: reconstructive. Authoring: row 1 = intro cell (h2, p lead, p em note,
 * `<p><strong><a>Learn More</a></strong></p>`);
 *   optional 2nd cell in row 1 = the mobile lead (live mobile variant carries different copy).
 * Rows 2…n = one cell per investment: `<p><img></p>` + `<p>Label</p>` [+ `<p>Coming Soon</p>`
 *   badge; wrap the badge in <em> for the mobile-only badge (live mobile variant)].
 * Editability: all authored nodes MOVED; on mobile the intro column is display:contents and
 * CSS order places the note + CTA after the grid (live mobile "foot").
 */
export default function decorate(block) {
  const rows = [...block.children];
  const intro = document.createElement('div');
  intro.className = 'pb-econ pb-invest-intro';
  const grid = document.createElement('div');
  grid.className = 'pb-econ pb-invest-grid';
  const [first, ...cells] = rows;
  if (first) {
    const [main, mobile] = first.children;
    if (main) {
      main.querySelectorAll(':scope > h2, :scope > h3').forEach((h) => h.classList.add('pb-invest-title'));
      main.querySelectorAll(':scope > p').forEach((p) => {
        if (p.querySelector('a.button')) p.classList.add('pb-btn-end');
        else if (p.querySelector(':scope > em, :scope > i') && p.children.length === 1) p.classList.add('pb-invest-note');
        else p.classList.add('pb-invest-text', 'pb-invest-text-dt');
        intro.append(p);
      });
      intro.prepend(...[...main.children].filter((el) => el.matches('h2, h3')));
    }
    if (mobile) {
      // a mobile-cell paragraph holding the CTA = the live mobile variant's own button text (es
      // "SABER MÁS" vs desktop "Más información", unit 19): shown ≤767px instead of the desktop CTA
      const mbCta = [...mobile.querySelectorAll(':scope > p')].filter((p) => p.querySelector('a.button'));
      mbCta.forEach((p) => p.classList.add('pb-btn-end', 'pb-btn-end-mb'));
      mobile.querySelectorAll(':scope > p:not(.pb-btn-end)').forEach((p) => p.classList.add('pb-invest-text', 'pb-invest-text-mb'));
      const dtCta = intro.querySelector('.pb-btn-end');
      if (dtCta && mbCta.length) { dtCta.classList.add('pb-btn-end-dt'); mbCta.forEach((p) => dtCta.after(p)); }
      const anchor = intro.querySelector('.pb-invest-note, .pb-btn-end');
      [...mobile.children].forEach((el) => (anchor ? anchor.before(el) : intro.append(el)));
    }
  }
  cells.forEach((row) => {
    const cell = row.firstElementChild;
    if (!cell) return;
    const c = document.createElement('div');
    c.className = 'pb-econ pb-invest-cell';
    const pic = cell.querySelector('picture, img');
    const badge = [...cell.querySelectorAll('p')].find((p) => !p.querySelector('picture, img') && p.querySelector(':scope > em') && p.children.length === 1)
      || [...cell.querySelectorAll('p')].filter((p) => !p.querySelector('picture, img'))[1];
    const label = [...cell.querySelectorAll('p')].find((p) => !p.querySelector('picture, img') && p !== badge);
    const picWrap = (pic && pic.closest('p')) || pic;
    if (picWrap) picWrap.classList.add('pb-invest-pic');
    const row2 = document.createElement('div');
    row2.className = 'pb-econ pb-invest-row';
    if (badge) {
      c.classList.add('pb-invest-cell-p');
      badge.classList.add('pb-invest-badge');
      const em = badge.querySelector(':scope > em');
      if (em) badge.classList.add('pb-invest-badge-mb');
      if (!em) { // live: inline-block bordered span inside the flex child
        const span = document.createElement('span');
        while (badge.firstChild) span.append(badge.firstChild);
        badge.append(span);
      }
      row2.classList.add('pb-invest-row-between');
      row2.append(badge);
    }
    if (picWrap) row2.append(picWrap);
    c.append(row2);
    if (label) { label.classList.add('pb-invest-label'); c.append(label); }
    cell.querySelectorAll(':scope > *').forEach((el) => c.append(el));
    grid.append(c);
  });
  block.querySelectorAll('a.button').forEach((a) => a.classList.add('upper', 'narrow', 'invert'));
  block.replaceChildren(intro, grid);
}
