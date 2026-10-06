/**
 * ar-calculator — the live "Simple Annual Compound Calculator" shortcode (.bdc-calc) on the
 * three the-power-of-compounding articles, rebuilt native (dynamic-features.md § Features).
 * Decode tier: template-slotted, positional rows (authors omit rows; every row is optional):
 *   row 0  title
 *   row 1  starting-amount label | default
 *   row 2  contribution label | default
 *   row 3  frequency label | <ul> option labels (first = monthly ×12, then annual ×1) | default
 *   row 4  annual-return label | default (%)
 *   row 5  years label | default (slider 0–30, the live range)
 *   row 6  result captions: final value | total invested | total interest
 *   row 7  table headers: year | start | interest | contribution | end
 *   row 8  the N/A label for year 0
 *   row 9  disclaimer paragraph
 * Arithmetic = the live script: yearly compounding, contributions added at year end,
 * annualContribution = contribution × frequency; values formatted en-US USD.
 * Generated controls (EW7): inputs, select, range slider, result values, the per-year table.
 * Authored labels, captions, headers and the disclaimer are MOVED into the generated shell.
 * @ew-exempt config — the default values (rows 1–5 cell 2/3), the frequency option labels and
 *   the N/A label drive generated controls / cells (input value, <option>, year-0 <td>).
 */

const fmt = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

function el(tag, cls, text) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text !== undefined) node.textContent = text;
  return node;
}

function field(id, labelNodes, input) {
  const wrap = el('div', 'bdc-field');
  const label = el('label');
  label.htmlFor = id;
  labelNodes.forEach((n) => label.append(n));
  input.id = id;
  wrap.append(label, input);
  return wrap;
}

function numberInput(value, attrs) {
  const input = el('input');
  input.type = 'number';
  input.value = value;
  Object.entries(attrs).forEach(([k, v]) => input.setAttribute(k, v));
  input.addEventListener('input', () => {
    const cleaned = input.value.replace(/[^0-9.]/g, '');
    if (cleaned !== input.value) input.value = cleaned;
  });
  return input;
}

export default function decorate(block) {
  const rows = [...block.children].map((r) => [...r.children]);
  const cellNodes = (row, i) => (rows[row] && rows[row][i] ? [...rows[row][i].childNodes] : []);
  const cellText = (row, i, fallback) => (rows[row] && rows[row][i]
    ? rows[row][i].textContent.trim() : fallback);
  const uid = `bdc-${Math.random().toString(36).slice(2, 7)}`;

  const calc = el('div', 'bdc-calc');
  const grid = el('div', 'bdc-calc-grid');
  const form = el('div', 'bdc-panel bdc-panel--form');
  const results = el('div', 'bdc-panel bdc-panel--results');
  grid.append(form, results);
  calc.append(grid);

  const title = el('div', 'bdc-calc-title');
  title.append(...cellNodes(0, 0));
  form.append(title);

  const startEl = numberInput(cellText(1, 1, '1000'), { min: 0, step: 100 });
  const contribEl = numberInput(cellText(2, 1, '0'), { min: 0, step: 50 });
  const freqEl = el('select');
  const opts = rows[3] && rows[3][1] ? [...rows[3][1].querySelectorAll('li')] : [];
  const freqDefault = cellText(3, 2, '');
  opts.forEach((li, i) => {
    const o = el('option', null, li.textContent.trim());
    o.value = i === 0 ? '12' : '1';
    if (li.textContent.trim() === freqDefault) o.selected = true;
    freqEl.append(o);
  });
  const rateEl = numberInput(cellText(4, 1, '10'), { min: 0, max: 50, step: 0.1 });
  const yearsEl = el('input', 'bdc-slider bdc-years');
  yearsEl.type = 'range';
  yearsEl.min = '0';
  yearsEl.max = '30';
  yearsEl.step = '1';
  yearsEl.value = cellText(5, 1, '4');
  const yearsVal = el('span', 'bdc-years-val', yearsEl.value);
  const unwrap = (row) => cellNodes(row, 0);
  const yearsSuffix = el('span', 'bdc-years-suffix');
  yearsSuffix.append(' (', yearsVal, ')');
  const yearsLabel = [...unwrap(5), yearsSuffix];

  const yearsField = field(`${uid}-years`, yearsLabel, yearsEl);
  const scale = el('div', 'bdc-slider-scale');
  for (let v = 0; v <= 30; v += 5) scale.append(el('span', null, String(v)));
  yearsField.append(scale);
  form.append(
    field(`${uid}-start`, unwrap(1), startEl),
    field(`${uid}-contrib`, unwrap(2), contribEl),
    field(`${uid}-freq`, unwrap(3), freqEl),
    field(`${uid}-rate`, unwrap(4), rateEl),
    yearsField,
  );

  const res = el('div', 'bdc-results');
  const finalLabel = el('div', 'bdc-results-label');
  finalLabel.append(...cellNodes(6, 0));
  const finalEl = el('p', 'bdc-results-value bdc-final');
  const split = el('div', 'bdc-results-split');
  const mk = (i, cls) => {
    const d = el('div');
    const cap = el('div', 'bdc-results-caption');
    cap.append(...cellNodes(6, i));
    const val = el('p', cls);
    d.append(cap, val);
    split.append(d);
    return val;
  };
  const investedEl = mk(1, 'bdc-invested');
  const interestEl = mk(2, 'bdc-interest');
  res.append(finalLabel, finalEl, split);

  const tableWrap = el('div', 'bdc-table-wrap');
  const table = el('table');
  const thead = el('thead');
  const headRow = el('tr');
  const defaults = ['Years', 'Start', 'Interest', 'Contribution', 'End'];
  const headers = defaults.map((d, i) => cellText(7, i, d));
  headers.forEach((h, i) => {
    const th = el('th');
    th.scope = 'col';
    const nodes = cellNodes(7, i);
    if (nodes.length) th.append(...nodes);
    else th.textContent = h;
    headRow.append(th);
  });
  thead.append(headRow);
  const tbody = el('tbody', 'bdc-tbody');
  table.append(thead, tbody);
  tableWrap.append(table);
  results.append(res, tableWrap);
  const na = cellText(8, 0, 'N/A');

  const disclaimer = el('div', 'bdc-disclaimer');
  disclaimer.append(...cellNodes(9, 0));
  calc.append(disclaimer);

  function calculate() {
    const start = Math.max(0, parseFloat(startEl.value) || 0);
    const contrib = Math.max(0, parseFloat(contribEl.value) || 0);
    const freq = parseInt(freqEl.value, 10) || 1;
    const rate = Math.max(0, parseFloat(rateEl.value) || 0) / 100;
    const years = parseInt(yearsEl.value, 10) || 0;
    const annual = contrib * freq;
    let balance = start;
    let invested = start;
    const data = [{ year: 0, end: balance }];
    for (let y = 1; y <= years; y += 1) {
      const yearStart = balance;
      const interest = yearStart * rate;
      balance = yearStart + interest + annual;
      invested += annual;
      data.push({
        year: y, start: yearStart, interest, contribution: annual, end: balance,
      });
    }
    finalEl.textContent = fmt(balance);
    investedEl.textContent = fmt(invested);
    interestEl.textContent = fmt(Math.max(0, balance - invested));
    tbody.replaceChildren(...data.map((r) => {
      const tr = el('tr');
      const cells = [String(r.year), r.start, r.interest, r.contribution, r.end];
      cells.forEach((v, i) => {
        const td = el('td');
        td.dataset.label = headers[i];
        if (i > 0 && v === undefined) {
          td.className = 'bdc-na';
          td.textContent = na;
        } else td.textContent = i === 0 ? v : fmt(v);
        tr.append(td);
      });
      return tr;
    }));
  }

  [startEl, contribEl, freqEl, rateEl].forEach((i) => i.addEventListener('input', calculate));
  yearsEl.addEventListener('input', () => {
    yearsVal.textContent = yearsEl.value;
    calculate();
  });
  calculate();
  block.replaceChildren(calc);
}
