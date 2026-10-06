/**
 * pb-hero — program hero (live Elementor hero on bradescobank.com/en/personal-bank/): a Vimeo
 * background player (embed passthrough — desktop 16:9 and mobile 9:16 ids) under a 20 % black
 * overlay, the title and the lead paragraph bottom-left, then the 19 px red divider bar (CSS).
 * Decode tier: template-slotted. Authoring (one row, one cell, flat siblings):
 *   <p><a href="https://player.vimeo.com/video/…">title</a></p>  desktop player (first link)
 *   <p><a href="https://player.vimeo.com/video/…">title</a></p>  mobile player (second, optional)
 *   <h1>…</h1>  the page title     <p>…</p>  the lead
 * Editability (EW1–EW10): title/lead/leftovers are MOVED; the Vimeo links become iframes

 * @ew-exempt vimeo-embed — the player.vimeo.com links become the background iframes
 *   (embed passthrough; the authored link text is the iframe title)
 */
export default function decorate(block) {
  const video = document.createElement('div');
  video.className = 'pb-hero-video';
  video.setAttribute('role', 'presentation');
  // sibling variants: `video` = hosted mp4 (link → muted looping <video>), `plain` = no player;
  // decorative pictures (`<p><img>`) stay in the body as .pb-hero-pic; no red bar after them
  const sibling = block.classList.contains('video') || block.classList.contains('plain');
  block.querySelectorAll('a[href$=".mp4"]').forEach((a) => {
    const v = document.createElement('video');
    v.src = a.href;
    v.muted = true;
    v.loop = true;
    v.autoplay = true;
    v.playsInline = true;
    v.setAttribute('aria-label', a.textContent.trim());
    v.className = 'pb-hero-mp4';
    video.append(v);
    (a.closest('p') || a).remove();
  });
  block.querySelectorAll(':scope > div > div > p > img').forEach((i) => i.closest('p').classList.add('pb-hero-pic'));
  const links = [...block.querySelectorAll('a[href*="player.vimeo.com"]')];
  links.forEach((a, i) => {
    const frame = document.createElement('iframe');
    frame.src = a.href;
    frame.title = a.textContent.trim();
    frame.setAttribute('allow', 'autoplay; fullscreen');
    frame.setAttribute('loading', 'lazy');
    frame.className = i === 0 ? 'pb-hero-frame-dt' : 'pb-hero-frame-mb';
    video.append(frame);
    const p = a.closest('p') || a;
    p.remove();
  });
  const body = document.createElement('div');
  body.className = 'pb-hero-body';
  const heading = block.querySelector('h1, h2, h3');
  if (heading) heading.classList.add('pb-hero-title');
  block.querySelectorAll(':scope > div > div > *').forEach((el) => {
    if (el.matches('p') && !el.classList.length) el.classList.add('pb-hero-lead');
    body.append(el);
  });
  const bar = document.createElement('div');
  bar.className = 'bar';
  bar.setAttribute('role', 'presentation');
  block.replaceChildren(video, body);
  if (!sibling) block.after(bar);
}
