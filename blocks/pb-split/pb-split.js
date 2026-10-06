/**
 * pb-split — two photo halves: "Money Market & Savings" (title + icon list) and "Certificate of
 * Deposit" (title + text + CTA). Photos are decorative (CSS). Decode tier: template-slotted.
 * Authoring: row 1 cell = h2 + ul (one li per benefit); row 2 cell = h2 + p + CTA
 * (`<p><strong><a>Learn More</a></strong></p>` → .button upper narrow).
 * Editability: all authored nodes MOVED; the list icon (30×4 red gradient rule) is CSS.
 */
export default function decorate(block) {
  const halves = [...block.children].map((row, i) => {
    const half = document.createElement('div');
    half.className = `pb-split-half pb-split-half-${i === 0 ? 'mm' : 'cd'}`;
    const cell = row.firstElementChild;
    if (!cell) return half;
    cell.querySelectorAll(':scope > h2, :scope > h3').forEach((h) => h.classList.add('pb-split-title', ...(i ? ['pb-split-title-cd'] : [])));
    cell.querySelectorAll(':scope > ul').forEach((ul) => {
      ul.classList.add('pb-split-iconlist');
      ul.querySelectorAll(':scope > li').forEach((li) => {
        const text = document.createElement('span');
        text.className = 'pb-split-iconlist-text';
        while (li.firstChild) text.append(li.firstChild);
        const icon = document.createElement('span');
        icon.className = 'pb-split-iconlist-icon';
        icon.setAttribute('aria-hidden', 'true');
        li.append(icon, text);
      });
    });
    cell.querySelectorAll(':scope > p').forEach((p) => {
      if (p.querySelector('a.button')) p.classList.add('pb-btn-end');
      else p.classList.add('pb-split-text');
    });
    half.append(...cell.children);
    return half;
  });
  block.querySelectorAll('a.button').forEach((a) => a.classList.add('upper', 'narrow'));
  block.replaceChildren(...halves);
}
