/**
 * ld-services — the four photo tiles of the landing page ("Private Bank", "Personal Bank",
 * "US Residents", "Business"): live = four Elementor <a class="e-con"> tiles, each a cover photo
 * with the title bottom-centre; row at >1080, stacked below. The photos are decorative (CSS, one
 * pair desktop/mobile per tile position, files in this folder).
 * Decode tier: reconstructive (one row per tile, node-slotted). Authoring: each row, one cell:
 *   <p><a href="…">Private Bank</a></p>   (role parity: the live title is a <p>, never a heading)
 * The authored link is the tile's link; the whole tile is clickable through its stretched ::after.
 * Editability (EW1–EW10): the authored node is MOVED into the tile wrapper.
 */
export default function decorate(block) {
  const tiles = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    const tile = document.createElement('div');
    tile.className = 'ld-services-tile';
    const wrap = document.createElement('div');
    wrap.className = 'ld-services-title-wrap';
    cells.forEach((cell) => wrap.append(...cell.children));
    tile.append(wrap);
    tiles.push(tile);
  });
  block.replaceChildren(...tiles);
}
