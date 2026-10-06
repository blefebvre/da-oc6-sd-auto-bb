/**
 * st-band — static-template grey band (live Elementor boxed e-con, #F6F6F6 full width) with a
 * boxed inner (Blocksy container; 972 px at ≥768 for `card` / `note`). Variants:
 *   `heading`   centred title band (h2 32/55; a sibling may author a <p> title — role kept)
 *   `card`      white split card: ROW n = COLUMN n, every <h3> (or <p>) in the cell = one holiday
 *               ticker row (date<br>name) with the red-blue dash before it
 *   `note`      972 px footnote band (14 px, start-aligned)
 *   `tabs`      2-cell rows = tab (p title, role=tab — parity with the live <button>) | panel;
 *               1-cell rows around them = copy widgets; 3-cell rows after a tab row = that panel's live
 *               table of containers (privacy FACTS): row → `st-trow`, cell → `st-tcell` (an empty
 *               authored cell is dropped so cell positions match the live row), paint by position
 *               (band-styles rows/<band>.css)
 *   `accordion` 2-cell rows = details/summary (the authored title p moves into the summary);
 *               1-cell rows = copy widgets (the band title); `open-<n>` = item n starts expanded
 *   `tiles`     every 1-cell row = one tile (picture, title, text, CTA) in a wrapping grid;
 *               `tiles-3` = the live 3-up card grid (cra)
 *   none / any other class = `plain`: stacked copy rows in the Blocksy container (siblings);
 *               n-cell rows (n ≥ 2) render as a simple table; a picture-only row = the live
 *               photo container (`st-band-photo`: 50.6 % column beside the copy, or the whole
 *               `photo` band)
 * Decode tier: template-slotted. Authoring: 1-cell rows = copy (first heading = title, later
 * headings = sub-lines, `<p><strong><a>` = CTA, `<p><img>` = picture, text with an inline
 * <img> = text).
 * Editability (EW1–EW10): every authored node is MOVED into generated wrappers, never rebuilt.
 */
function classify(el) {
  if (/^H[1-6]$/.test(el.tagName)) return 'heading';
  // the delivery pipeline serves a picture-only cell as a bare <picture> (no <p>) — still the photo
  if (el.matches('picture, img')) return 'st-band-pic';
  if (!el.matches('p')) return '';
  if (el.querySelector('a.button')) return 'st-btn-end';
  if (el.querySelector('img') && !el.textContent.trim()) return 'st-band-pic';
  return 'st-band-text';
}

function fillBody(body, nodes) {
  let titled = false;
  nodes.forEach((el) => {
    const c = classify(el);
    if (c === 'heading') {
      el.classList.add(titled ? 'st-band-sub' : 'st-band-title');
      titled = true;
    } else if (c) el.classList.add(c);
    body.append(el);
  });
  return body;
}

function widgetOf(cell, extra) {
  const widget = document.createElement('div');
  widget.className = `st-band-widget${extra ? ` ${extra}` : ''}`;
  const body = document.createElement('div');
  body.className = 'st-band-body';
  widget.append(fillBody(body, [...cell.children]));
  // a picture-only widget = the live photo container (CSS background photo, no copy)
  const kids = [...body.children];
  if (kids.length && kids.every((el) => el.classList.contains('st-band-pic'))) {
    widget.classList.add('st-band-photo');
  }
  return widget;
}

function tickerOf(el) {
  const item = document.createElement('div');
  item.className = 'st-item';
  const inner = document.createElement('div');
  inner.className = 'st-item-inner';
  const ticker = document.createElement('div');
  ticker.className = 'st-ticker';
  const body = document.createElement('div');
  body.className = 'st-ticker-body';
  body.append(el);
  ticker.append(body);
  inner.append(ticker);
  item.append(inner);
  return item;
}

function cardOf(rows) {
  const card = document.createElement('div');
  card.className = 'st-card st-card-split';
  rows.forEach((r, i) => {
    const col = document.createElement('div');
    col.className = `st-card-col st-card-col-${i + 1}`;
    [...r.children].forEach((cell) => {
      [...cell.children].forEach((el) => col.append(tickerOf(el)));
    });
    if (col.children.length) card.append(col);
  });
  return card;
}

function noteOf(cell) {
  const note = document.createElement('div');
  note.className = 'st-note';
  const body = document.createElement('div');
  body.className = 'st-note-body';
  body.append(...cell.children);
  note.append(body);
  return note;
}

function tableOf(rows) {
  const table = document.createElement('table');
  table.className = 'st-band-table';
  const tbody = document.createElement('tbody');
  rows.forEach((r) => {
    const tr = document.createElement('tr');
    [...r.children].forEach((cell) => {
      const td = document.createElement('td');
      td.append(...cell.children);
      tr.append(td);
    });
    tbody.append(tr);
  });
  table.append(tbody);
  return table;
}

/* a panel's table rows: every non-empty authored cell becomes one flex cell, in order */
function trowsOf(rows) {
  const wrap = document.createElement('div');
  wrap.className = 'st-trows';
  rows.forEach((r) => {
    const tr = document.createElement('div');
    tr.className = 'st-trow';
    [...r.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('img, picture')) return;
      const td = document.createElement('div');
      td.className = 'st-tcell';
      td.append(...cell.children);
      tr.append(td);
    });
    wrap.append(tr);
  });
  return wrap;
}

/* tabs: [titleCell, panelCell, trows] triples → tablist of the authored title nodes + panels */
function tabsOf(pairs) {
  const wrap = document.createElement('div');
  wrap.className = 'st-tabs';
  const list = document.createElement('div');
  list.className = 'st-tablist';
  list.setAttribute('role', 'tablist');
  const uid = `st-tab-${Math.random().toString(36).slice(2, 7)}`;
  const panels = [];
  pairs.forEach(([titleCell, panelCell, trows], i) => {
    const tab = titleCell.querySelector('p, h1, h2, h3, h4, h5, h6') || titleCell.firstElementChild;
    const panel = document.createElement('div');
    panel.className = 'st-tabpanel';
    panel.id = `${uid}-p${i}`;
    panel.setAttribute('role', 'tabpanel');
    if (panelCell.children.length) panel.append(fillBody(Object.assign(document.createElement('div'), { className: 'st-band-body' }), [...panelCell.children]));
    if (trows && trows.length) panel.append(trowsOf(trows));
    if (tab) {
      tab.classList.add('st-tab');
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
    const n = list.children.length;
    if (e.key === 'ArrowRight') select((cur + 1) % n);
    if (e.key === 'ArrowLeft') select((cur - 1 + n) % n);
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(cur); }
  });
  wrap.append(list, ...panels);
  return wrap;
}

/* accordion: [titleCell, bodyCell] pairs → details/summary (authored title moves whole) */
function accordionOf(pairs, open) {
  const wrap = document.createElement('div');
  wrap.className = 'st-accordion';
  pairs.forEach(([titleCell, bodyCell], i) => {
    const d = document.createElement('details');
    d.className = 'st-acc-item';
    if (open.has(i + 1)) d.open = true;
    const s = document.createElement('summary');
    s.className = 'st-acc-title';
    s.append(...titleCell.children);
    const body = document.createElement('div');
    body.className = 'st-acc-body st-band-body';
    d.append(s, fillBody(body, [...bodyCell.children]));
    wrap.append(d);
  });
  return wrap;
}

export default function decorate(block) {
  const inner = document.createElement('div');
  inner.className = 'e-inner st-band-inner';
  const rows = [...block.children];
  const variant = ['card', 'note', 'tabs', 'accordion', 'tiles'].find((v) => block.classList.contains(v)) || 'plain';
  if (variant === 'card') {
    inner.classList.add('st-inner-972');
    inner.append(cardOf(rows));
  } else if (variant === 'note') {
    inner.classList.add('st-inner-972');
    rows.forEach((r) => [...r.children].forEach((cell) => inner.append(noteOf(cell))));
  } else if (variant === 'tiles') {
    const grid = document.createElement('div');
    grid.className = 'st-tiles';
    rows.forEach((r) => [...r.children].forEach((cell) => grid.append(widgetOf(cell, 'st-tile'))));
    inner.append(grid);
  } else {
    // `open-<n>` block classes = items expanded in the live capture (1-based): `accordion open-1`
    const open = new Set([...block.classList]
      .map((c) => +(c.match(/^open-(\d+)$/) || [])[1]).filter(Boolean));
    let multi = [];
    const flush = () => {
      if (!multi.length) return;
      if (variant === 'tabs') inner.append(tabsOf(multi));
      else if (variant === 'accordion') inner.append(accordionOf(multi, open));
      else inner.append(tableOf(multi));
      multi = [];
    };
    rows.forEach((r) => {
      const cells = [...r.children];
      if (cells.length <= 1) {
        flush();
        if (cells.length) inner.append(widgetOf(cells[0]));
        return;
      }
      if (variant === 'tabs' && cells.length >= 3 && multi.length) { multi[multi.length - 1][2].push(r); return; }
      multi.push(variant === 'tabs' ? [cells[0], cells[1], []] : variant === 'accordion' ? [cells[0], cells[1]] : r);
    });
    flush();
  }
  block.replaceChildren(inner);
}
