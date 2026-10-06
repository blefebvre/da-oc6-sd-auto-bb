import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Header — Blocksy type-1 chrome rendered from the authored /nav document (per locale:
 * /nav, /es/nav, /pt/nav — overridable with the `nav` metadata). Sections, in order:
 *   1. FDIC row   — the two FDIC images (mobile, desktop)
 *   2. brand      — the logo link (white) + the sticky (black) logo image
 *   3. menu       — the nav <ul>; items with a nested <ul> are dropdowns; the last dropdown
 *                   is the LOGIN item
 *   4. language   — the WPML switcher <ul>; the active locale is the item without a link
 * Editability (EW1–EW10): every authored node is MOVED into the template; the off-canvas
 * panel holds a presentational clone with its instrumentation stripped (EW4).
 * Motion = the behaviours observed live (stardust/prototypes/motion.js): click dropdowns
 * (li.ct-active), off-canvas trigger (#offcanvas.active), sticky morph (data-sticky).
 * @ew-exempt none
 */

const CHEVRON = '<svg width="8" height="8" viewBox="0 0 15 15" aria-hidden="true">'
  + '<path d="M2.1,3.2l5.4,5.4l5.4-5.4L15,4.3l-7.5,7.5L0,4.3L2.1,3.2z"></path></svg>';
const BURGER = '<svg width="18" height="14" viewBox="0 0 18 14" aria-hidden="true">'
  + '<rect y="0.00" width="18" height="1.7" rx="1"></rect>'
  + '<rect y="6.15" width="18" height="1.7" rx="1"></rect>'
  + '<rect y="12.3" width="18" height="1.7" rx="1"></rect></svg>';
const CLOSE = '<svg width="15" height="15" viewBox="0 0 15 15" aria-hidden="true">'
  + '<path d="M1 1l13 13M14 1L1 14" stroke="currentColor" stroke-width="1.7" fill="none">'
  + '</path></svg>';

/* alt text for the chrome icons: the pipeline emits :name: icons with alt="", the live strings
   are per locale (WPML) */
const FDIC_ALT = 'FDIC Insured – Backed by the full faith and credit of the U.S. Government';
const ICON_ALT = {
  en: {
    us: 'Current language: english',
    'pt-br': 'Switch site language to portuguese',
    es: 'Switch site language to spanish',
  },
  es: {
    us: 'Cambiar el idioma del sitio a english',
    'pt-br': 'Cambiar el idioma del sitio a português',
    es: 'Idioma actual: español',
  },
  pt: {
    us: 'Alterar idioma do site para inglês',
    'pt-br': 'Idioma atual: português',
    es: 'Alterar idioma do site para espanhol',
  },
};

function labelIcons(root, lang) {
  const flags = ICON_ALT[lang] || ICON_ALT.en;
  root.querySelectorAll('img[data-icon-name]').forEach((img) => {
    const name = img.dataset.iconName;
    img.removeAttribute('width');
    img.removeAttribute('height');
    if (name.startsWith('fdic-logo')) img.alt = FDIC_ALT;
    else if (name.startsWith('bradesco_bank')) img.alt = 'Bradesco bank homepage';
    else if (flags[name]) img.alt = flags[name];
  });
}

function el(tag, className, attrs = {}) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
  return node;
}

/** EW4: a presentational clone carries no editor instrumentation */
function stripInstrumentation(node) {
  [node, ...node.querySelectorAll('*')].forEach((n) => {
    [...n.attributes].forEach((a) => {
      if (a.name.startsWith('data-') || a.name === 'id') n.removeAttribute(a.name);
    });
  });
  return node;
}

/** the pipeline wraps a list item's trigger link in a <p> on live (#98) — unwrap it */
function unwrapTriggers(list) {
  list.querySelectorAll(':scope > li > p').forEach((p) => {
    const li = p.parentElement;
    while (p.firstChild) li.insertBefore(p.firstChild, p);
    p.remove();
  });
}

function locale() {
  const l = getMetadata('locale') || window.location.pathname.split('/')[1];
  return ['es', 'pt'].includes(l) ? l : 'en';
}

function localePrefix() {
  const l = locale();
  return l === 'en' ? '' : `/${l}`;
}

/** EW8: move the authored children out of the section's content wrapper(s) */
function moveChildren(from, to) {
  if (!from) return;
  [...from.children].forEach((child) => {
    if (child.tagName === 'DIV' && !child.classList.contains('block')) {
      while (child.firstElementChild) to.append(child.firstElementChild);
      child.remove();
    } else {
      to.append(child);
    }
  });
}

function buildFdicRow(section) {
  const row = el('div', 'site-header-top');
  const container = el('div', 'container');
  const wrap = el('div', 'fdic-logo-wrap');
  const images = section ? [...section.querySelectorAll('picture, img')] : [];
  images.forEach((img, i) => {
    const slot = el('div', i === 0 ? 'fdic-logo-mobile' : 'fdic-logo-desktop');
    const host = img.closest('p') || img;
    slot.append(host);
    wrap.append(slot);
  });
  container.append(wrap);
  row.append(container);
  return row;
}

function buildBrand(section) {
  const branding = el('div', 'site-branding');
  const logo = el('div', 'site-logo-container');
  const link = section ? section.querySelector('a') : null;
  const images = section ? [...section.querySelectorAll('picture, img')] : [];
  if (link) {
    images.forEach((img, i) => {
      const slot = el('span', i === 0 ? 'default-logo' : 'sticky-logo');
      const picture = img.closest('picture') || img;
      slot.append(picture);
      link.append(slot);
    });
    logo.append(link);
  } else {
    moveChildren(section, logo);
  }
  branding.append(logo);
  return branding;
}

function decorateMenu(list) {
  unwrapTriggers(list);
  list.id = list.id || 'menu-principal';
  const parents = [...list.querySelectorAll(':scope > li')]
    .filter((li) => li.querySelector(':scope > ul'));
  parents.forEach((li, i) => {
    li.classList.add('menu-item-has-children');
    if (i === parents.length - 1 && parents.length > 1) li.classList.add('menu-item-login');
    const trigger = li.querySelector(':scope > a');
    if (trigger && !trigger.querySelector('.menu-toggle')) {
      const toggle = el('span', 'menu-toggle');
      toggle.innerHTML = CHEVRON;
      trigger.append(toggle);
    }
  });
}

function buildMobileMenu(list, langSwitcher, root) {
  const inner = el('div', 'ct-panel-content-inner');
  const nav = el('nav', 'mobile-menu', { 'aria-label': 'Principal' });
  const clone = stripInstrumentation(list.cloneNode(true));
  clone.querySelectorAll(':scope > li').forEach((li) => {
    const sub = li.querySelector(':scope > ul');
    const link = li.querySelector(':scope > a');
    if (!sub || !link) return;
    const parent = el('span', 'ct-sub-menu-parent');
    const button = el('button', 'ct-toggle-dropdown-mobile', {
      type: 'button',
      'aria-label': 'Expand dropdown menu',
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
    });
    button.innerHTML = CHEVRON;
    link.querySelectorAll('.menu-toggle').forEach((t) => t.remove());
    parent.append(link, button);
    li.prepend(parent);
    button.addEventListener('click', () => {
      const open = li.classList.contains('dropdown-active');
      button.setAttribute('aria-expanded', open ? 'false' : 'true');
      sub.classList.add('is-animating');
      const done = () => {
        sub.removeEventListener('transitionend', done);
        if (open) li.classList.remove('dropdown-active');
        sub.classList.remove('is-animating');
        sub.style.height = '';
      };
      sub.addEventListener('transitionend', done);
      if (open) {
        sub.style.height = `${sub.getBoundingClientRect().height}px`;
        requestAnimationFrame(() => { sub.style.height = '0px'; });
      } else {
        li.classList.add('dropdown-active');
        const h = sub.scrollHeight;
        sub.style.height = '0px';
        requestAnimationFrame(() => { sub.style.height = `${h}px`; });
      }
    });
  });
  nav.append(clone);
  if (langSwitcher) nav.append(stripInstrumentation(langSwitcher.cloneNode(true)));
  const stickyLogo = root.querySelector('.site-logo-container .sticky-logo');
  if (stickyLogo) {
    const logo = el('div', 'site-logo-container');
    logo.append(stripInstrumentation(stickyLogo.cloneNode(true)));
    inner.append(logo);
  }
  inner.append(nav);
  return inner;
}

function buildPanel(content, onClose) {
  const panel = el('aside', 'ct-panel', {
    id: 'offcanvas',
    role: 'dialog',
    'aria-label': 'Offcanvas modal',
    'aria-hidden': 'true',
    inert: '',
  });
  const inner = el('div', 'ct-panel-inner');
  const actions = el('div', 'ct-panel-actions');
  const close = el('button', 'ct-toggle-close', { type: 'button', 'aria-label': 'Close drawer' });
  close.innerHTML = CLOSE;
  close.addEventListener('click', onClose);
  actions.append(close);
  const body = el('div', 'ct-panel-content');
  body.append(content);
  inner.append(actions, body);
  panel.append(inner);
  panel.addEventListener('click', (e) => { if (e.target === panel) onClose(); });
  return panel;
}

/**
 * sticky morph: data-sticky="yes:shrink" on the middle row once scrollY passes the static
 * offset of the row (the FDIC row), removed below it
 */
function wireSticky(root, middle) {
  let threshold = 0;
  const measure = () => {
    const prev = middle.previousElementSibling;
    threshold = prev ? prev.getBoundingClientRect().height : 0;
  };
  const onScroll = () => {
    const on = window.scrollY > threshold;
    if (on && middle.getAttribute('data-sticky') !== 'yes:shrink') {
      middle.setAttribute('data-sticky', 'yes:shrink');
    } else if (!on && middle.hasAttribute('data-sticky')) {
      middle.removeAttribute('data-sticky');
    }
    root.classList.toggle('is-sticky', on);
  };
  measure();
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measure(); onScroll(); });
}

/** desktop dropdowns: click on a parent link toggles ct-active on its <li> */
function wireDropdowns(list) {
  const closeAll = () => {
    list.querySelectorAll(':scope > li.ct-active').forEach((o) => o.classList.remove('ct-active'));
  };
  list.querySelectorAll(':scope > li.menu-item-has-children > a').forEach((a) => {
    a.addEventListener('click', (e) => {
      if (a.getAttribute('href') === '#') e.preventDefault();
      const li = a.parentElement;
      const open = li.classList.contains('ct-active');
      closeAll();
      if (!open) li.classList.add('ct-active');
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.header .site-nav > ul > li.menu-item-has-children')) closeAll();
  });
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : `${localePrefix()}/nav`;
  const fragment = await loadFragment(navPath);
  if (!fragment) return;

  block.textContent = '';
  // authored sections, in order; the metadata section (removed by the pipeline) is skipped
  const sections = [...fragment.children].filter((s) => s.querySelector('p, ul, picture, img'));
  const [fdicSection, brandSection, menuSection, langSection] = sections;

  const root = el('div', 'site-header');
  const rows = el('div', 'site-header-rows');
  const middle = el('div', 'site-header-middle');
  const container = el('div', 'container');

  rows.append(buildFdicRow(fdicSection));
  container.append(buildBrand(brandSection));

  const nav = el('nav', 'site-nav', { 'aria-label': 'Principal' });
  const list = menuSection ? menuSection.querySelector('ul') : null;
  let langSwitcher = null;
  if (list) {
    decorateMenu(list);
    nav.append(list);
    wireDropdowns(list);
  }
  const langList = langSection ? langSection.querySelector('ul') : null;
  if (langList) {
    langSwitcher = el('div', 'lang-switcher');
    langSwitcher.append(langList);
    nav.append(langSwitcher);
  }
  container.append(nav);

  // mobile: trigger + off-canvas panel (a stripped clone of the menu, EW4)
  const trigger = el('button', 'header-trigger', {
    type: 'button',
    'aria-label': 'Menu',
    'aria-expanded': 'false',
    'aria-controls': 'offcanvas',
  });
  trigger.innerHTML = `<span class="ct-label">Menu</span>${BURGER}`;
  container.append(trigger);

  middle.append(container);
  rows.append(middle);
  root.append(rows);

  let panel = null;
  const setPanel = (open) => {
    if (!panel) return;
    panel.classList.toggle('active', open);
    panel.toggleAttribute('inert', !open);
    panel.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('ct-panel-open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  };
  if (list) {
    panel = buildPanel(buildMobileMenu(list, langSwitcher, root), () => setPanel(false));
    root.append(panel);
    trigger.addEventListener('click', () => setPanel(!panel.classList.contains('active')));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setPanel(false); });
  }

  labelIcons(root, locale());
  block.append(root);
  wireSticky(root, middle);
}
