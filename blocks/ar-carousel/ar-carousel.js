/**
 * ar-carousel — the live Elementor nested carousel of investor-profile cards on
 * /en/investing-for-different-client-profiles (swiper: 1 slide per view, arrows, infinite,
 * autoplay 5000 ms paused on hover, speed 500). Decode tier: reconstructive, node-slotted:
 *   one row per card: cell 1 = the profile icon (`:profile-…:`), cell 2 = heading + paragraphs.
 * Generated controls (EW7): previous / next buttons, the 4-segment position bar.
 * Behaviours implemented per stardust/replica/motion/en-investing-for-different-client-profiles
 * .json (motion-observe: only what fired on the live page).
 * @ew-exempt none
 */

const ARROW = '<svg xmlns="http://www.w3.org/2000/svg" width="34.65" height="34.65" '
  + 'viewBox="0 0 34.65 34.65" aria-hidden="true" focusable="false">'
  + '<path d="M17.32,0h0c9.57,0,17.32,7.76,17.32,17.32h0c0,9.57-7.76,17.32-17.32,17.32h0'
  + 'C7.76,34.65,0,26.89,0,17.32h0C0,7.76,7.76,0,17.32,0Z" fill="#cd0a30"/>'
  + '<path d="M21.56,9.24l-9.24,7.7,9.24,7.7" fill="none" stroke="#fff" stroke-linecap="round" '
  + 'stroke-linejoin="round" stroke-width="2"/></svg>';

export default function decorate(block) {
  const rows = [...block.children];
  const track = document.createElement('div');
  track.className = 'ar-carousel-track';
  track.setAttribute('aria-live', 'off');
  const slides = rows.map((row, i) => {
    const slide = document.createElement('div');
    slide.className = 'ar-carousel-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${i + 1} / ${rows.length}`);
    const [iconCell, bodyCell] = row.children;
    if (iconCell) {
      iconCell.className = 'ar-carousel-icon';
      slide.append(iconCell);
    }
    const bar = document.createElement('div');
    bar.className = 'ar-carousel-bars';
    bar.setAttribute('aria-hidden', 'true');
    rows.forEach((_, j) => {
      const seg = document.createElement('span');
      if (j === i) seg.className = 'active';
      bar.append(seg);
    });
    slide.append(bar);
    if (bodyCell) {
      bodyCell.className = 'ar-carousel-body';
      slide.append(bodyCell);
    }
    track.append(slide);
    return slide;
  });

  let index = 0;
  const show = (n) => {
    index = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    slides.forEach((s, i) => {
      const on = i === index;
      s.classList.toggle('active', on);
      s.setAttribute('aria-hidden', String(!on));
      if (on) s.removeAttribute('inert');
      else s.setAttribute('inert', '');
    });
  };

  const mkBtn = (dir, label) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `ar-carousel-button ar-carousel-button-${dir}`;
    b.setAttribute('aria-label', label);
    b.innerHTML = ARROW;
    b.addEventListener('click', () => show(index + (dir === 'next' ? 1 : -1)));
    return b;
  };

  const region = document.createElement('div');
  region.className = 'ar-carousel-region';
  region.setAttribute('aria-roledescription', 'carousel');
  region.setAttribute('aria-label', 'Carousel');
  const viewport = document.createElement('div');
  viewport.className = 'ar-carousel-viewport';
  viewport.append(track);
  region.append(mkBtn('prev', 'Previous slide'), viewport, mkBtn('next', 'Next slide'));

  let timer = 0;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = () => {
    if (reduce || slides.length < 2) return;
    window.clearInterval(timer);
    timer = window.setInterval(() => show(index + 1), 5000);
  };
  region.addEventListener('mouseenter', () => window.clearInterval(timer));
  region.addEventListener('mouseleave', start);
  region.addEventListener('focusin', () => window.clearInterval(timer));

  show(0);
  // autoplay runs while the carousel is on screen (the live swiper autoplays regardless;
  // pausing it off-screen saves work and keeps the harness asserts deterministic)
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? start() : window.clearInterval(timer)));
    }, { threshold: 0.25 });
    io.observe(region);
  } else start();
  block.replaceChildren(region);
}
