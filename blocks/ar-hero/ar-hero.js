/**
 * ar-hero — article hero (live Elementor e-con b710887 on bradescobank.com/en/reits/):
 * a full-bleed cover image under a 40 % black overlay, the page <h1> centred in the
 * Blocksy container (padding 250/80, 200/80 ≤1080, 180/60 ≤767), followed by the
 * 19 px gradient divider (df751d4; decorative, CSS only).
 *
 * Schema: stardust/eds-schema/en-reits.json § ar-hero. Decode tier: template-slotted.
 * Authoring (one row, one cell, flat siblings — order free):
 *   <img>  editorial background (DA media, scope article) — moved as its <p><picture>
 *   <h1>   the article title — moved into .ar-hero-title
 * Editability (EW1–EW10): every authored node is MOVED; wrappers carry the classes.
 * Leftovers (any other authored element) land after the title so nothing vanishes.
 * @ew-exempt none
 */
export default function decorate(block) {
  const band = document.createElement('div');
  band.className = 'ar-hero-band';
  const inner = document.createElement('div');
  inner.className = 'e-inner ar-hero-inner';
  const title = document.createElement('div');
  title.className = 'ar-hero-title';

  const media = block.querySelector('picture, img');
  if (media) {
    const layer = media.closest('p') || media;
    layer.classList.add('ar-hero-media');
    const img = layer.matches('img') ? layer : layer.querySelector('img');
    if (img) {
      img.loading = 'eager';
      img.fetchPriority = 'high';
    }
    band.append(layer);
  }

  const heading = block.querySelector('h1, h2, h3');
  if (heading) title.append(heading);
  inner.append(title);

  // leftovers pass — anything else the author wrote stays visible after the title
  block.querySelectorAll(':scope > div > div > *').forEach((el) => {
    if (!el.closest('.ar-hero-band')) inner.append(el);
  });

  band.append(inner);
  const divider = document.createElement('div');
  divider.className = 'ar-divider';
  divider.setAttribute('role', 'presentation');
  block.replaceChildren(band, divider);
}
