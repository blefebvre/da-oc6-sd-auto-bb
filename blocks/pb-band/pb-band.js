/**
 * pb-band — full-bleed photo band with a copy column (title, text, CTA). Archetype variants:
 * `cards` ("Discover our cards", white copy, left column, preceded by the slim mobile bar) and
 * `mortgage` (copy on the right half; mobile = boxed 60 % column). Photos are decorative (CSS).
 * Sibling variants (program siblings, clone composition): `plain` / `text` (stacked copy),
 * `wallet` (copy + logo row), `buttons` (CTA row), `showcase` (one card per row: picture,
 * headings, CTA), `tabs` (2-cell rows: h3 tab + panel), `accordion` (2-cell rows: title +
 * body), `table` (n-cell rows → table; a first row with an empty first cell = header row;
 * a cell whose text is `✓` renders the live check icon, the glyph stays for AT/editors).
 * Decode tier: template-slotted. Authoring: 1-cell rows = copy (first heading = title, later
 * headings = sub-lines, `<p><strong><a>` = CTA, `<p><img>` = picture).
 * Editability: all authored nodes MOVED (accordion titles: the authored p moves into summary).
 * `columns` (program siblings): a multi-cell row = the live side-by-side child containers;
 * `boxes`: cards whose picture is the live child container's background photo (caption over it);
 * `carousel`: the live swiper's slides, one card per row, laid out as the static first view.
 * `photo` (program siblings): the first row holds the band's pictures — desktop, mobile, overlay —
 * moved whole into .pb-band-bg; the band's min-height, overlay and paint are the lifted per-band
 * `b-<live container id>` rules (band-styles.mjs --css). A photo band without copy rows is valid.
 */
const SIBLING = ['plain', 'text', 'table', 'accordion', 'tabs', 'showcase', 'wallet', 'buttons'];
const CHECK = '<svg viewBox="0 0 30 30" fill="none" aria-hidden="true" focusable="false">'
  + '<circle cx="15" cy="15" r="13" stroke="#1C1761" stroke-width="2"></circle>'
  + '<path d="M9.5 15L13.5 19L20.5 11" stroke="#1C1761" stroke-width="2" stroke-linecap="round"'
  + ' stroke-linejoin="round"></path></svg>';

function copyCol(cell) {
  const col = document.createElement('div');
  col.className = 'pb-econ pb-band-col';
  let titled = false;
  [...cell.children].forEach((el) => {
    if (/^H[1-6]$/.test(el.tagName)) {
      el.classList.add(titled ? 'pb-band-sub' : 'pb-band-title');
      titled = true;
    } else if (el.matches('picture')) { // the pipeline unwraps a lone picture paragraph: wrap it back (the picture node moves)
      const p = document.createElement('p');
      p.className = 'pb-band-pic';
      p.append(el);
      col.append(p);
      return;
    } else if (el.matches('p') && el.querySelector('a.button')) el.classList.add('pb-btn-end');
    else if (el.matches('p') && el.querySelector('img')) el.classList.add('pb-band-pic');
    else if (el.matches('p')) el.classList.add('pb-band-text');
    col.append(el);
  });
  // consecutive pictures (wallet logos) → one logo row
  let run = [];
  const wrapRun = () => {
    if (run.length > 1) {
      const logos = document.createElement('div');
      logos.className = 'pb-band-logos';
      run[0].before(logos);
      logos.append(...run);
    }
    run = [];
  };
  [...col.children].forEach((el) => {
    if (el.classList.contains('pb-band-pic')) run.push(el); else wrapRun();
  });
  wrapRun();
  const kids = [...col.children];
  if (kids.length && kids.every((el) => el.classList.contains('pb-btn-end'))) {
    col.classList.add('pb-band-buttons');
  }
  return col;
}

function tabsOf(items) {
  const wrap = document.createElement('div');
  wrap.className = 'pb-band-tabs';
  const list = document.createElement('div');
  list.setAttribute('role', 'tablist');
  list.className = 'pb-band-tablist';
  const panels = [];
  const uid = `pb-tab-${Math.random().toString(36).slice(2, 7)}`;
  items.forEach(([titleCell, bodyCell], i) => {
    const tab = titleCell.querySelector('h1, h2, h3, h4, h5, h6, p') || titleCell.firstElementChild;
    const panel = document.createElement('div');
    panel.className = 'pb-band-tabpanel';
    panel.id = `${uid}-p${i}`;
    panel.setAttribute('role', 'tabpanel');
    // a panel whose cells open with pictures is the live nested-tabs grid of boxed child containers (one card per
    // picture + its captions, the picture painted as the card background by .pb-band.boxes)
    const kids = [...bodyCell.children];
    const isPic = (el) => el.matches('p') && el.querySelector('img, picture');
    if (kids.length > 1 && isPic(kids[0]) && kids.filter(isPic).length > 1) {
      const cards = document.createElement('div');
      cards.className = 'pb-band-cards';
      let cell = null;
      kids.forEach((el) => {
        if (isPic(el) || !cell) { cell = document.createElement('div'); cards.append(cell); }
        cell.append(el); // the authored node moves whole
      });
      [...cards.children].forEach((c) => { const col = copyCol(c); col.classList.add('pb-band-card'); c.replaceWith(col); });
      panel.append(cards);
    } else panel.append(copyCol(bodyCell));
    if (tab) {
      tab.classList.add('pb-band-tab');
      tab.id = `${uid}-t${i}`;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panel.id);
      tab.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
      tab.tabIndex = i === 0 ? 0 : -1;
      panel.setAttribute('aria-labelledby', tab.id);
      list.append(tab);
    }
    panel.hidden = i !== 0;
    panels.push(panel);
  });
  const select = (idx) => {
    [...list.children].forEach((t, i) => {
      t.setAttribute('aria-selected', String(i === idx));
      t.tabIndex = i === idx ? 0 : -1;
      panels[i].hidden = i !== idx;
    });
    list.children[idx]?.focus();
  };
  list.addEventListener('click', (e) => {
    const t = e.target.closest('[role="tab"]');
    if (t) select([...list.children].indexOf(t));
  });
  list.addEventListener('keydown', (e) => {
    const cur = [...list.children].indexOf(document.activeElement);
    if (cur < 0) return;
    if (e.key === 'ArrowRight') select((cur + 1) % list.children.length);
    if (e.key === 'ArrowLeft') select((cur - 1 + list.children.length) % list.children.length);
  });
  wrap.append(list, ...panels);
  return wrap;
}

function accordionOf(items) {
  const wrap = document.createElement('div');
  wrap.className = 'pb-band-accordion';
  items.forEach(([titleCell, bodyCell]) => {
    const d = document.createElement('details');
    d.className = 'pb-band-acc-item';
    const s = document.createElement('summary');
    s.className = 'pb-band-acc-title';
    s.append(...titleCell.children); // the authored title node moves whole (p shown inline)
    const body = copyCol(bodyCell);
    body.classList.add('pb-band-acc-body');
    d.append(s, body);
    wrap.append(d);
  });
  return wrap;
}

// columns: a multi-cell row is the live container's side-by-side child containers (one copy column each)
function colsOf(rows) {
  const frag = document.createDocumentFragment();
  rows.forEach((cells) => {
    const cols = document.createElement('div');
    cols.className = 'pb-band-cols';
    cells.forEach((c) => cols.append(copyCol(c)));
    frag.append(cols);
  });
  return frag;
}

function tableOf(rows) {
  const card = document.createElement('div');
  card.className = 'pb-band-table-card';
  const table = document.createElement('table');
  table.className = 'pb-band-table';
  rows.forEach((cells, i) => {
    const head = i === 0 && cells[0].textContent.trim() === '';
    const tr = document.createElement('tr');
    cells.forEach((c, j) => {
      const td = document.createElement(head ? 'th' : 'td');
      if (head) td.scope = 'col';
      if (j === 0) td.classList.add('pb-band-td-feature');
      if (c.textContent.trim() === '✓') {
        const p = c.querySelector('p') || c;
        p.classList.add('pb-band-check');
        const vh = document.createElement('span');
        vh.className = 'pb-band-vh';
        vh.append(...p.childNodes); // the authored text node moves (never rebuilt)
        p.insertAdjacentHTML('afterbegin', CHECK);
        p.append(vh);
      }
      td.append(...c.children);
      tr.append(td);
    });
    if (head) table.createTHead().append(tr);
    else (table.tBodies[0] || table.createTBody()).append(tr);
  });
  card.append(table);
  return card;
}

function decorateVariant(block, variant) {
  const out = [];
  let multi = [];
  const flushMulti = () => {
    if (!multi.length) return;
    if (block.classList.contains('columns')) out.push(...colsOf(multi).children);
    else if (variant === 'tabs') out.push(tabsOf(multi));
    else if (variant === 'accordion') out.push(accordionOf(multi));
    else out.push(tableOf(multi));
    multi = [];
  };
  [...block.children].forEach((r) => {
    const cells = [...r.children];
    if (cells.length <= 1) {
      flushMulti();
      if (!cells.length) return;
      const col = copyCol(cells[0]);
      // showcase: a picture row is a card; in a carousel the intro row (icon + heading) stays a column
      if (variant === 'showcase' && col.querySelector('img') && !(block.classList.contains('carousel') && !out.length)) col.classList.add('pb-band-card');
      // boxes: two leading pictures are the live child's desktop and mobile background photos (unit 16)
      if (block.classList.contains('boxes')) {
        // copyCol wrapped the consecutive pictures as a logo row: unwrap them, first = desktop, second = mobile,
        // an optional third = the live tile's overlay picture (program.mjs boxPics, unit 21), shown at every width
        const logos = col.querySelector(':scope > .pb-band-logos');
        const pics = logos ? [...logos.children] : [];
        if ((pics.length === 2 || pics.length === 3) && pics.every((el) => el.classList.contains('pb-band-pic'))) {
          pics[0].classList.add('pb-band-pic-desktop'); pics[1].classList.add('pb-band-pic-mobile');
          if (pics[2]) pics[2].classList.add('pb-band-pic-overlay');
          logos.replaceWith(...pics);
        }
      }
      out.push(col);
      return;
    }
    multi.push(cells);
  });
  flushMulti();
  const children = [];
  let cards = null;
  out.forEach((el) => {
    if (el.classList.contains('pb-band-card')) {
      if (!cards) {
        cards = document.createElement('div');
        cards.className = 'pb-band-cards';
        children.push(cards);
      }
      cards.append(el);
    } else { cards = null; children.push(el); }
  });
  block.querySelectorAll('a.button').forEach((a) => a.classList.add('upper', 'narrow'));
  block.replaceChildren(...children);
  // accordion capture state (encoder options): `acc-open` = the first item is open on live; `acc-show-N` = the
  // live page's script hides the items after N until its "show more" link (the authored href="#" link) is clicked
  const items = [...block.querySelectorAll('.pb-band-acc-item')];
  if (items.length && block.classList.contains('acc-open')) items[0].open = true;
  const show = [...block.classList].map((c) => c.match(/^acc-show-(\d+)$/)).find(Boolean);
  if (show && items.length > +show[1]) {
    const hiddenItems = items.slice(+show[1]);
    hiddenItems.forEach((d) => { d.hidden = true; });
    const more = [...block.querySelectorAll('a[href="#"]')].pop();
    if (more) {
      more.addEventListener('click', (e) => {
        e.preventDefault();
        const open = hiddenItems[0].hidden;
        hiddenItems.forEach((d) => { d.hidden = !open; });
        more.closest('.pb-band-col')?.classList.toggle('pb-acc-expanded', open);
      });
    }
  }
}

// photo bands: first row = pictures only (desktop, mobile, overlay) → the background layer
function takeBg(block) {
  const first = block.firstElementChild;
  if (!first) return null;
  const cells = [...first.children];
  const pics = cells.map((c) => c.querySelector('picture, img'));
  if (!cells.length || !pics.every(Boolean) || cells.some((c) => c.textContent.trim())) return null;
  const bg = document.createElement('div');
  bg.className = 'pb-band-bg';
  bg.setAttribute('aria-hidden', 'true');
  const roles = ['pb-band-bg-desktop', 'pb-band-bg-mobile', 'pb-band-bg-overlay'];
  pics.forEach((p, i) => {
    const el = p.closest('picture') || p;
    el.classList.add(roles[i] || 'pb-band-bg-extra');
    bg.append(el); // the authored picture node moves whole
  });
  first.remove();
  return bg;
}

export default function decorate(block) {
  const photo = block.classList.contains('photo');
  const bg = photo ? takeBg(block) : null;
  const variant = SIBLING.find((v) => block.classList.contains(v)) || (photo ? 'plain' : null);
  if (variant) {
    decorateVariant(block, variant);
    if (bg) block.prepend(bg);
    return;
  }
  const col = document.createElement('div');
  col.className = 'pb-econ pb-band-col';
  const cell = block.querySelector(':scope > div > div');
  if (cell) {
    cell.querySelectorAll(':scope > h2, :scope > h3').forEach((h) => h.classList.add('pb-band-title'));
    cell.querySelectorAll(':scope > p').forEach((p) => p.classList.add(p.querySelector('a.button') ? 'pb-btn-end' : 'pb-band-text'));
    col.append(...cell.children);
  }
  block.querySelectorAll('a.button').forEach((a) => a.classList.add('upper', 'narrow'));
  const empty = document.createElement('div');
  empty.className = 'pb-econ pb-band-col pb-band-col-empty';
  const boxed = document.createElement('div');
  boxed.className = 'pb-band-boxed';
  const inner = document.createElement('div');
  inner.className = 'e-inner pb-band-boxed-inner';
  boxed.append(inner);
  if (block.classList.contains('mortgage')) {
    inner.append(col);
    block.replaceChildren(empty, boxed);
  } else {
    inner.append(col);
    block.replaceChildren(boxed, empty);
  }
  if (block.classList.contains('cards')) {
    const bar = document.createElement('div');
    bar.className = 'bar bar-mobile-slim';
    bar.setAttribute('role', 'presentation');
    block.before(bar);
  }
}
