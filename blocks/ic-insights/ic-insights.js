/**
 * ic-insights — the listing "Latest Insights" band (live Elementor e-con f7af171, 1150 shell):
 * a heading over the loop grid (08b96a1, template 12464: 3 / 2 / 1 columns) of post cards —
 * featured image link, date | category pill, title link, excerpt, favourite button.
 * Decode tier: reconstructive (one row per card, node-slotted). Authoring, rows of one cell:
 *   title row  <h3>Latest Insights</h3>            (no image, no link → the band heading)
 *   card rows  <p><img></p>  <p>MM/DD/YYYY</p>  <p><a href="…/category/…">Category</a></p>
 *              <h3><a href="…">Title</a></h3>  <p>Excerpt</p>  (date / category / excerpt optional)
 * Every node is MOVED into its role wrapper: the image p = media (wrapped in a link to the
 * title's href — generated, no authored text); before the heading a p with a link = category,
 * any other p = date; the heading = title; after it every p = excerpt. Generated control (no
 * authored text; EW7): the favourite button. The excerpt class sits on the p itself (the live
 * widget-container is the text element) and the category pill is a span (live .post-category-alt).
 * The button (.favorite-btn) toggles .favorited, pulses 300 ms and dispatches `ar-favorite`
 * {on} for the ar-blogbar saved counter.
 * @ew-exempt none
 */

const FAV_LABEL = {
  en: 'Add to favorites',
  es: 'Añadir a favoritos',
  pt: 'Adicionar aos favoritos',
};

const ICON = '<span class="favorite-icon"><svg viewBox="0 0 24 28" aria-hidden="true" '
  + 'focusable="false"></svg></span>';

function favoriteButton() {
  const container = document.createElement('div');
  container.className = 'favorite-container';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'favorite-btn';
  const locale = (document.querySelector('meta[name="locale"]')?.content || 'en').toLowerCase();
  btn.setAttribute('aria-label', FAV_LABEL[locale] || FAV_LABEL.en);
  btn.setAttribute('aria-pressed', 'false');
  btn.innerHTML = ICON;
  btn.addEventListener('click', () => {
    const on = !btn.classList.contains('favorited');
    btn.classList.toggle('favorited', on);
    btn.setAttribute('aria-pressed', String(on));
    btn.classList.add('pulse');
    window.setTimeout(() => {
      btn.classList.remove('pulse');
    }, 300);
    document.dispatchEvent(new CustomEvent('ar-favorite', { detail: { on } }));
  });
  container.append(btn);
  return container;
}

function wrap(el, cls, tag = 'div') {
  const w = document.createElement(tag);
  w.className = cls;
  w.append(el);
  return w;
}

function card(nodes) {
  const item = document.createElement('div');
  item.className = 'ic-item';
  const box = document.createElement('div');
  box.className = 'ic-item-box';
  const media = document.createElement('div');
  media.className = 'ic-item-media';
  const meta = document.createElement('div');
  meta.className = 'ic-item-meta';
  const dateCol = document.createElement('div');
  dateCol.className = 'ic-item-date-col';
  const catCol = document.createElement('div');
  catCol.className = 'ic-item-cat-col';
  const titleWrap = document.createElement('div');
  titleWrap.className = 'ic-item-title-wrap';
  const after = [];
  let heading = null;
  nodes.forEach((el) => {
    if (el.querySelector('img, picture')) media.append(el);
    else if (/^H[1-6]$/.test(el.tagName)) {
      heading = el;
      titleWrap.append(wrap(el, 'ic-item-title'));
    } else if (heading) {
      el.classList.add('ic-item-excerpt');
      after.push(el);
    } else if (el.querySelector('a[href]')) {
      const pill = wrap(wrap(el, 'ic-item-category', 'span'), 'ic-item-meta-pill');
      catCol.append(wrap(pill, 'ic-item-cat'));
    } else {
      dateCol.append(wrap(wrap(el, 'ic-item-date-text'), 'ic-item-date'));
    }
  });
  const href = heading && heading.querySelector('a[href]');
  if (media.children.length && href) {
    const link = document.createElement('a');
    link.href = href.getAttribute('href');
    link.setAttribute('aria-hidden', 'true');
    link.tabIndex = -1;
    link.append(...media.children);
    media.append(link);
  }
  if (media.children.length) box.append(media);
  meta.append(dateCol, catCol);
  box.append(meta);
  if (heading) box.append(titleWrap);
  after.forEach((el) => box.append(el));
  const fav = document.createElement('div');
  fav.className = 'ic-item-fav';
  fav.append(favoriteButton());
  box.append(fav);
  item.append(box);
  return item;
}

export default function decorate(block) {
  const inner = document.createElement('div');
  inner.className = 'e-inner ic-insights-inner';
  const loop = document.createElement('div');
  loop.className = 'ic-loop';
  [...block.children].forEach((row) => {
    const nodes = [...row.children].flatMap((cell) => [...cell.children]);
    if (!nodes.length) return;
    const isTitle = !row.querySelector('img, picture, a[href]');
    if (isTitle) {
      nodes.forEach((el) => {
        inner.append(wrap(el, 'ic-insights-title'));
      });
      return;
    }
    loop.append(card(nodes));
  });
  if (loop.children.length) inner.append(loop);
  block.replaceChildren(inner);
}
