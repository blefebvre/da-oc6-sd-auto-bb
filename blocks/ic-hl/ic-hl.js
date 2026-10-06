/**
 * ic-hl — the listing "Highlights" cards (live shortcode .custom-posts-grid inside Elementor
 * e-con 8514db4): one large card (65fr, two rows) and small cards (35fr) on a white → #f2f5f7
 * gradient; each card = thumbnail link, category pill, title link, excerpt, favourite button.
 * Decode tier: reconstructive (one row per card, node-slotted). Authoring: each row, one cell:
 *   <p><img></p>  <p><a href="…/category/…">Category</a></p>  <h3><a href="…">Title</a></h3>
 *   <p>Excerpt</p>   (category and excerpt optional; the first card is the large one)
 * Every node is MOVED into its role wrapper: the image p = thumbnail (wrapped in a link to the
 * title's href — generated, no authored text), a p before the heading = category, the heading =
 * title, any other p = excerpt (the class sits on the p itself, as the live .post-excerpt; the
 * category pill is a span, as the live .post-category-alt — unit-geometry pairs boxes by tag).
 * Generated control (no authored text; EW7): the favourite button (.favorite-btn) — toggles
 * .favorited, pulses 300 ms and dispatches `ar-favorite` {on} for the
 * ar-blogbar saved counter (progress.json listing.motion.implemented).
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

export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'ic-hl-grid';
  [...block.children].forEach((row, index) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const card = document.createElement('div');
    card.className = `ic-hl-card ${index === 0 ? 'ic-hl-card-large' : 'ic-hl-card-small'}`;
    const thumb = document.createElement('div');
    thumb.className = 'ic-hl-thumb';
    const content = document.createElement('div');
    content.className = 'ic-hl-content';
    let heading = null;
    const wrap = (el, cls, tag = 'div') => {
      const w = document.createElement(tag);
      w.className = cls;
      w.append(el);
      return w;
    };
    cells.forEach((cell) => {
      const kids = [...cell.children];
      kids.forEach((el, i) => {
        const next = kids[i + 1];
        if (el.querySelector('img, picture')) thumb.append(el);
        else if (/^H[1-6]$/.test(el.tagName)) {
          heading = el;
          content.append(wrap(el, 'ic-hl-title'));
        } else if (!heading && next && /^H[1-6]$/.test(next.tagName)) {
          content.append(wrap(wrap(el, 'ic-hl-category', 'span'), 'ic-hl-meta'));
        } else {
          el.classList.add('ic-hl-excerpt');
          content.append(el);
        }
      });
    });
    const href = heading && heading.querySelector('a[href]');
    if (thumb.children.length && href) {
      const link = document.createElement('a');
      link.href = href.getAttribute('href');
      link.setAttribute('aria-hidden', 'true');
      link.tabIndex = -1;
      link.append(...thumb.children);
      thumb.append(link);
    }
    if (thumb.children.length) card.append(thumb);
    card.append(content);
    const fav = document.createElement('div');
    fav.className = 'ic-hl-fav';
    fav.append(favoriteButton());
    card.append(fav);
    grid.append(card);
  });
  block.replaceChildren(grid);
}
