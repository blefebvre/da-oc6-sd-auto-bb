/**
 * pb-lg — 'Start here' lead form (live WPForms 3258, static replica: no submit endpoint on EDS —
 * the button is disabled; the owner wires a form backend). Decorative graphics in CSS.
 * Decode tier: reconstructive. Authoring: row 1 cell = h2 + p (intro). Rows 2…n = one field per
 * row: cell 1 = label (its text ending in '*' marks required); cell 2 (optional) = options list
 * `<ul><li>…</li></ul>` — 2+ options = radio group, 1 option = checkbox (label hidden on live
 * when cell 1 is empty); cell 3 (optional) = description. Field type by label: 'mail' → email,
 * 'Comment' (es 'Comentarios', pt 'Comentário') → textarea, else text. Last row = one cell `<p>Send</p>` → the submit button text.
 * Editability: labels, options, descriptions, button text are MOVED.
 * @ew-exempt form-controls — the native inputs and the turnstile box are generated
 *   (no authored node behind them)
 */
export default function decorate(block) {
  const rows = [...block.children];
  const [introRow, ...fieldRows] = rows;
  const row = document.createElement('div');
  row.className = 'pb-econ pb-lg-row';
  const intro = document.createElement('div');
  intro.className = 'pb-econ pb-lg-intro';
  if (introRow?.firstElementChild) {
    const cell = introRow.firstElementChild;
    cell.querySelectorAll(':scope > h2, :scope > h3').forEach((h) => h.classList.add('pb-lg-title'));
    cell.querySelectorAll(':scope > p').forEach((p) => p.classList.add('pb-lg-text'));
    intro.append(...cell.children);
  }
  const formCol = document.createElement('div');
  formCol.className = 'pb-econ pb-lg-form-col';
  const form = document.createElement('form');
  form.className = 'pb-lg-form';
  form.addEventListener('submit', (e) => e.preventDefault());
  const note = document.createElement('p');
  note.className = 'pb-lg-instruction';
  note.textContent = 'Required fields are marked with an asterisk (*).';
  const fields = document.createElement('div');
  fields.className = 'pb-lg-fields';
  const submitRow = fieldRows.length && fieldRows[fieldRows.length - 1].children.length === 1
    && !fieldRows[fieldRows.length - 1].querySelector('ul') ? fieldRows.pop() : null;
  const uid = `pb-lg-${Math.random().toString(36).slice(2, 7)}`;
  fieldRows.forEach((r, i) => {
    const [labelCell, optCell, descCell] = r.children;
    const labelText = labelCell?.textContent.trim() || '';
    const required = /\*\s*$/.test(labelText);
    const options = optCell ? [...optCell.querySelectorAll('li')] : [];
    const field = document.createElement('div');
    field.className = 'pb-lg-field';
    const id = `${uid}-${i}`;
    const makeLabel = (tag) => {
      const l = document.createElement(tag);
      l.className = 'pb-lg-label';
      if (labelCell) l.append(...labelCell.children);
      if (required) {
        const walker = document.createTreeWalker(l, NodeFilter.SHOW_TEXT);
        let last = null;
        while (walker.nextNode()) last = walker.currentNode;
        if (last) last.data = last.data.replace(/\s*\*\s*$/, '');
        const req = document.createElement('span');
        req.className = 'pb-lg-required';
        req.textContent = ' *';
        l.append(req);
      }
      return l;
    };
    if (options.length) {
      const kind = options.length > 1 ? 'radio' : 'checkbox';
      field.classList.add(`pb-lg-field-${kind}`, ...(kind === 'radio' ? ['pb-lg-list-inline'] : []));
      const fs = document.createElement('fieldset');
      const legend = makeLabel('legend');
      if (!labelText) legend.classList.add('pb-lg-label-hide');
      fs.append(legend);
      const ul = optCell.querySelector('ul') || document.createElement('ul');
      options.forEach((li, j) => {
        const input = document.createElement('input');
        input.type = kind;
        input.name = id;
        input.id = `${id}-${j}`;
        const lab = document.createElement('label');
        lab.className = 'pb-lg-label-inline';
        lab.htmlFor = input.id;
        while (li.firstChild) lab.append(li.firstChild);
        li.append(input, lab);
        ul.append(li);
      });
      fs.append(ul);
      if (descCell) {
        const d = document.createElement('div');
        d.className = 'pb-lg-description';
        d.append(...descCell.children);
        fs.append(d);
      }
      field.append(fs);
    } else {
      const lower = labelText.toLowerCase();
      let type = 'text';
      if (/mail/.test(lower)) type = 'email';
      else if (/comment|coment/.test(lower)) type = 'textarea'; // en Comments / es Comentarios / pt Comentário (unit 15)
      field.classList.add(`pb-lg-field-${type}`);
      const label = makeLabel('label');
      label.htmlFor = id;
      const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
      if (type !== 'textarea') input.type = type;
      input.id = id;
      input.name = id;
      input.className = 'pb-lg-input';
      if (required) input.required = true;
      field.append(label, input);
      if (descCell) {
        const d = document.createElement('div');
        d.className = 'pb-lg-description';
        d.append(...descCell.children);
        field.append(d);
      }
    }
    fields.append(field);
  });
  const captcha = document.createElement('div');
  captcha.className = 'pb-lg-turnstile';
  captcha.setAttribute('role', 'presentation');
  const submitWrap = document.createElement('div');
  submitWrap.className = 'pb-lg-submit-wrap';
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'pb-lg-submit';
  button.disabled = true;
  if (submitRow) button.append(...submitRow.querySelectorAll(':scope > div > *'));
  if (!button.textContent.trim()) button.textContent = 'Send';
  submitWrap.append(button);
  form.append(note, fields, captcha, submitWrap);
  formCol.append(form);
  row.append(intro, formCol);
  block.replaceChildren(row);
}
