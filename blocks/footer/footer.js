import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Footer — Elementor location footer rendered from the authored /footer document (per locale:
 * /footer, /es/footer, /pt/footer — overridable with the `footer` metadata). Sections, in order:
 *   1. about column  — heading + link list
 *   2. help column   — heading + link list
 *   3. social column — heading + list of icon links (img alt = network name)
 *   4. legal         — the disclosure paragraphs and list, verbatim
 *   5. logos         — the brand logo link + the badge images (Equal Housing Lender, FDIC)
 * Editability (EW1–EW10): every authored node is MOVED into the template; wrappers carry the
 * layout classes. The red divider bar at the top is decorative (CSS only).
 * @ew-exempt none
 */

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

function locale() {
  const l = getMetadata('locale') || window.location.pathname.split('/')[1];
  return ['es', 'pt'].includes(l) ? l : 'en';
}

function localePrefix() {
  const l = locale();
  return l === 'en' ? '' : `/${l}`;
}

/* alt / aria-label for the chrome icons: the pipeline emits :name: icons with alt="" */
const SOCIAL = {
  'icon-instagram': 'Instagram',
  'icon-linkedin': 'LinkedIn',
  'icon-youtube': 'YouTube',
};
const BADGE_ALT = {
  'bradesco_bank_black-1': 'Bradesco Bank homepage',
  'equal-housing-lender-1': 'Equal Housing Lender logo',
  'fdic-member-2': 'FDIC Member logo',
};

/** live renders the social icons as inline SVG (Elementor icon list); inline the icon files
 *  so the chrome paints identically — presentational, no authored text involved */
async function inlineSocialIcons(root) {
  const icons = [...root.querySelectorAll('img[data-icon-name^="icon-"]')];
  await Promise.all(icons.map(async (img) => {
    try {
      const resp = await fetch(img.src);
      if (!resp.ok) return;
      const span = img.closest('span.icon');
      const host = document.createElement('span');
      host.className = 'social-icon';
      host.innerHTML = await resp.text();
      const svg = host.querySelector('svg');
      if (!svg || !span) return;
      svg.setAttribute('aria-hidden', 'true');
      span.replaceWith(host);
    } catch (e) {
      // keep the <img> icon
    }
  }));
}

function labelIcons(root, lang) {
  root.querySelectorAll('img[data-icon-name]').forEach((img) => {
    const name = img.dataset.iconName;
    img.removeAttribute('width');
    img.removeAttribute('height');
    if (SOCIAL[name]) {
      img.alt = lang === 'pt' ? `Logo do ${SOCIAL[name]}` : SOCIAL[name];
      const link = img.closest('a');
      if (link) link.setAttribute('aria-label', SOCIAL[name]);
    } else if (BADGE_ALT[name]) {
      img.alt = BADGE_ALT[name];
    }
  });
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

function buildColumn(section, variant) {
  const col = el('div', `footer-col footer-col-${variant}`);
  moveChildren(section, col);
  return col;
}

function buildLinks(about, help, social) {
  const band = el('div', 'site-footer-links');
  const inner = el('div', 'e-inner');
  inner.append(buildColumn(about, 'about'));
  inner.append(buildColumn(help, 'help'));
  inner.append(buildColumn(social, 'social'));
  band.append(inner);
  return band;
}

function buildLegal(section) {
  const band = el('div', 'site-footer-legal');
  const inner = el('div', 'e-inner');
  const divider = el('div', 'footer-divider');
  divider.append(el('span'));
  const text = el('div', 'footer-legal-text');
  moveChildren(section, text);
  inner.append(divider, el('div', 'footer-spacer'), text);
  band.append(inner);
  return band;
}

function buildLogos(section) {
  const band = el('div', 'site-footer-logos');
  const inner = el('div', 'e-inner');
  const brand = el('div', 'footer-brand');
  brand.id = 'logo';
  const badges = el('div', 'container-logos');
  if (section) {
    const link = section.querySelector('a');
    if (link) brand.append(link.closest('p') || link);
    const images = [...section.querySelectorAll('picture, img')]
      .filter((img) => !brand.contains(img))
      .map((img) => img.closest('picture') || img);
    images.forEach((img, i) => {
      if (i > 0) badges.append(el('div', 'divisor'));
      const slot = el('span', i === 0 ? 'logo-equal' : 'logo-bradesco');
      slot.append(img);
      badges.append(slot);
    });
  }
  inner.append(brand, badges);
  band.append(inner);
  return band;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta
    ? new URL(footerMeta, window.location).pathname
    : `${localePrefix()}/footer`;
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  block.textContent = '';
  // authored sections, in order; the metadata section (removed by the pipeline) is skipped
  const sections = [...fragment.children]
    .filter((s) => s.querySelector('p, ul, h2, h3, picture, img'));
  const [about, help, social, legal, logos] = sections;

  const root = el('div', 'site-footer');
  // es/pt live footers paint the link lists and social icons as inline boxes (see footer.css)
  if (locale() !== 'en') root.classList.add('footer-inline-links');
  const bar = el('div', 'bar bar-mobile-slim');
  bar.setAttribute('aria-hidden', 'true');
  root.append(bar, buildLinks(about, help, social), buildLegal(legal), buildLogos(logos));
  labelIcons(root, locale());
  await inlineSocialIcons(root);
  block.append(root);
}
