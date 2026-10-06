/**
 * ld-hero — landing (home) hero: a Vimeo background player (embed passthrough — the live page
 * ships a desktop 16:9 id and a mobile 9:16 id in two Elementor sections, switched at 1080 px)
 * under the bottom-right h1 (bottom-left ≤1080), then the 19 px deep-red divider bar (canon
 * .bar).
 * Decode tier: template-slotted. Authoring (one row, one cell, flat siblings):
 *   <p><a href="https://player.vimeo.com/video/…">title</a></p>  desktop player (first link)
 *   <p><a href="https://player.vimeo.com/video/…">title</a></p>  mobile player (second, optional)
 *   <h1>…</h1>  the page title (+ optional <p> lead, kept in the copy column)
 * Variant `bare` = no divider after the hero.
 * Editability (EW1–EW10): the title and every leftover node are MOVED into the copy wrappers.
 * @ew-exempt vimeo-embed — the player.vimeo.com links become the background iframes
 *   (embed passthrough; the authored link text is the iframe title)
 */
export default function decorate(block) {
  const video = document.createElement('div');
  video.className = 'ld-hero-video';
  video.setAttribute('role', 'presentation');
  [...block.querySelectorAll('a[href*="player.vimeo.com"]')].forEach((a, i) => {
    const frame = document.createElement('iframe');
    frame.src = a.href;
    frame.title = a.textContent.trim();
    frame.setAttribute('allow', 'autoplay; fullscreen');
    frame.setAttribute('loading', 'lazy');
    frame.tabIndex = -1;
    frame.className = i === 0 ? 'ld-hero-frame-dt' : 'ld-hero-frame-mb';
    video.append(frame);
    (a.closest('p') || a).remove();
  });
  const inner = document.createElement('div');
  inner.className = 'e-inner ld-hero-inner';
  const spacer = document.createElement('div');
  spacer.className = 'ld-hero-spacer';
  const copy = document.createElement('div');
  copy.className = 'ld-hero-copy';
  const copyInner = document.createElement('div');
  copyInner.className = 'ld-hero-copy-inner';
  const titleWrap = document.createElement('div');
  titleWrap.className = 'ld-hero-title-wrap';
  block.querySelectorAll(':scope > div > div > *').forEach((el) => titleWrap.append(el));
  copyInner.append(titleWrap);
  copy.append(copyInner);
  inner.append(spacer, copy);
  block.replaceChildren(video, inner);
  if (block.classList.contains('bare')) return;
  const bar = document.createElement('div');
  bar.className = 'bar';
  bar.setAttribute('role', 'presentation');
  block.after(bar);
}
