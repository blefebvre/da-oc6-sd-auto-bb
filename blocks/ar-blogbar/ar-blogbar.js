/**
 * ar-blogbar — the blog menu bar shared by the article and listing templates (live
 * shortcode .blog-menu-wrapper + .VoltarLink inside Elementor e-con e780a37/1472ad4).
 * The paint lives in the shared layer (styles/styles.css § blog chrome: .ar-blogbar,
 * .ar-blogmenu-*, .ar-back, .fixed); this block only slots the authored nodes and
 * ports the observed behaviours.
 *
 * Schema: stardust/eds-schema/en-reits.json § ar-blogbar. Decode tier: node-slotted (generic:
 * no article-only assumptions — the listing template reuses it as is).
 * Authoring (rows in any order, one cell each):
 *   <ul>        the menu links, one <li><a> per item — moved into div.ar-blogmenu-links
 *               (the wrapper carries the grid; the authored list is display: contents);
 *               an item whose href contains "saved" is the bookmark item (li.ar-blogmenu-saved)
 *               and hosts the runtime counter "(n)".
 *   <p><a>      the back link (plain <a>, never <strong>/<em>) — moved as its <p> into div.ar-back
 * Generated controls (no authored text; EW7): the ≤768 toggle button — its "Menu" label is a
 * control label, allowlisted — the active-item line and the saved counter (runtime value).
 * Motion (stardust/replica/progress.json article.motion.implemented): .fixed on scroll with an
 * integer-height spacer; mobile toggle .active (closes on item / outside click); the saved
 * counter listens for the `ar-favorite` event the ar-body favorite button dispatches.
 * @ew-exempt none
 */

const TOGGLE = '<span class="ar-hamburger"><span></span><span></span><span></span></span>'
  + '<span class="ar-blogmenu-label">Menu</span>';
const COUNTER = '(<span class="count">0</span>)';

function menuFixed(block) {
  const section = block.closest('.section');
  if (!section) return;
  let above = section.previousElementSibling;
  while (above && above.offsetHeight === 0) above = above.previousElementSibling;
  if (!above) return;
  let fixed = false;
  const update = () => {
    const base = above.getBoundingClientRect().bottom;
    let limit = 100;
    if (window.innerWidth >= 1000) limit = 120;
    else if (window.innerWidth >= 690) limit = 70;
    const hysteresis = 10;
    let spacer = block.parentNode.querySelector(':scope > .ar-blogbar-spacer');
    if (!fixed && base <= limit) {
      fixed = true;
      if (!spacer) {
        spacer = document.createElement('div');
        spacer.className = 'ar-blogbar-spacer';
        spacer.style.height = `${block.offsetHeight}px`;
        block.parentNode.insertBefore(spacer, block);
      }
      block.classList.add('fixed');
    } else if (fixed && base > limit + hysteresis) {
      fixed = false;
      if (spacer) spacer.remove();
      block.classList.remove('fixed');
    }
  };
  window.addEventListener('scroll', () => {
    window.requestAnimationFrame(update);
  }, { passive: true });
}

function mobileToggle(menu, toggle, links) {
  const close = () => {
    toggle.classList.remove('active');
    links.classList.remove('active');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const open = !toggle.classList.contains('active');
    toggle.classList.toggle('active', open);
    links.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('li a').forEach((a) => {
    a.addEventListener('click', close);
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.ar-blogmenu') || !menu.contains(e.target)) close();
  });
}

function savedCounter(block) {
  const counter = block.querySelector('.ar-blogmenu-counter');
  if (!counter) return;
  let saved = 0;
  document.addEventListener('ar-favorite', (e) => {
    saved += e.detail && e.detail.on ? 1 : -1;
    if (saved < 0) saved = 0;
    const n = counter.querySelector('.count');
    if (n) n.textContent = String(saved);
    counter.classList.toggle('hidden', saved === 0);
  });
}

export default function decorate(block) {
  const inner = document.createElement('div');
  inner.className = 'e-inner ar-blogbar-inner';
  const menu = document.createElement('div');
  menu.className = 'ar-blogmenu';

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'ar-blogmenu-toggle';
  toggle.setAttribute('aria-label', 'Toggle menu');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.innerHTML = TOGGLE;

  const links = document.createElement('div');
  links.className = 'ar-blogmenu-links';
  const list = block.querySelector('ul, ol');
  if (list) {
    links.append(list);
    [...list.children].forEach((li) => {
      const a = li.querySelector('a[href]');
      if (a && /saved/i.test(a.getAttribute('href'))) {
        li.classList.add('ar-blogmenu-saved');
        const counter = document.createElement('span');
        counter.className = 'ar-blogmenu-counter hidden';
        counter.innerHTML = COUNTER;
        a.append(' ', counter);
      }
    });
    if (list.children.length > 1) {
      menu.style.setProperty('--items', String(list.children.length + 1));
    }
  }
  const line = document.createElement('span');
  line.className = 'ar-blogmenu-line';
  line.setAttribute('aria-hidden', 'true');
  links.append(line);
  menu.append(toggle, links);
  inner.append(menu);

  const backLink = [...block.querySelectorAll('a[href]')].find((a) => !a.closest('ul, ol'));
  if (backLink) {
    const back = document.createElement('div');
    back.className = 'ar-back';
    back.append(backLink.closest('p') || backLink);
    inner.append(back);
  }

  // leftovers pass — any other authored element stays visible
  block.querySelectorAll(':scope > div > div > *').forEach((el) => {
    inner.append(el);
  });

  block.replaceChildren(inner);
  mobileToggle(menu, toggle, links);
  savedCounter(block);
  menuFixed(block);
}
