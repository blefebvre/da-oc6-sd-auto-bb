/**
 * ar-body — article meta row (live Elementor e-con 0fa6826 → .ar-meta: date + favorite
 * button) and the shell of the article body section. The article prose is DEFAULT CONTENT
 * in the same section (David's Model D1) and the data table is the Block Collection `table`
 * block — a table cannot nest in a DA cell; ar-body.css styles both through the section's
 * .ar-body-container.
 *
 * Schema: stardust/eds-schema/en-reits.json § ar-body (.ar-meta). Decode tier: template-slotted.
 * Authoring (one row, one cell):
 *   <p>  the publication date as displayed (e.g. 07/10/2026) — moved into .ar-meta-date
 * Generated control (no authored text; EW7): the favorite button (.favorite-btn) — toggles
 * .favorited, pulses 300 ms (.pulse) and dispatches `ar-favorite` {on} on document for
 * the ar-blogbar saved counter (progress.json article.motion.implemented).
 * State is in-memory (live persists it in localStorage; not observed as a visible behaviour).
 * @ew-exempt none
 */

const FAV_LABEL = {
  en: 'Add to favorites',
  es: 'Añadir a favoritos',
  pt: 'Adicionar aos favoritos',
};

const ICON = '<span class="favorite-icon"><svg viewBox="0 0 24 28" aria-hidden="true" focusable="false"></svg></span>';

export default function decorate(block) {
  // the section is the live post-content region (.ar-content): the prose and the table block
  // are its default-content and block siblings, declared units pair on it
  const section = block.closest('.section');
  if (section) {
    section.classList.add('ar-content');
    // `flush` variant: the live post-content has no spacer paragraphs (p margin 0)
    if (block.classList.contains('flush')) section.classList.add('ar-content-flush');
  }
  const meta = document.createElement('div');
  meta.className = 'ar-meta';
  const date = document.createElement('div');
  date.className = 'ar-meta-date';
  block.querySelectorAll(':scope > div > div > *').forEach((el) => {
    date.append(el);
  });

  const fav = document.createElement('div');
  fav.className = 'ar-meta-fav';
  const container = document.createElement('div');
  container.className = 'favorite-container';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'favorite-btn';
  const locale = (document.querySelector('meta[name="locale"]')?.content || 'en').toLowerCase();
  btn.setAttribute('aria-label', FAV_LABEL[locale] || FAV_LABEL.en);
  btn.setAttribute('aria-pressed', 'false');
  btn.innerHTML = ICON;
  container.append(btn);
  fav.append(container);

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

  meta.append(date, fav);
  block.replaceChildren(meta);
}
