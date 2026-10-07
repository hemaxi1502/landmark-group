/**
 * Department landing pages (/department/:handle) are built entirely from
 * store data, so every department works without editorial content:
 *
 *   hero            best-seller photos + live counts
 *   categories      the department's mega-menu children that have products
 *   brands          the collection's vendor filter, with a product photo each
 *   price bands     only bands that contain products
 *   styles          the "design" (or "type") product filter values
 *
 * Every tile links to the department's collection page, filtered the same
 * way the sidebar filters do, so nothing links to an empty page.
 */

const PRICE_BANDS = [499, 999, 1999, 2999, 4999];

/** "/collections/men" → "/department/men"; anything else unchanged. */
export function departmentPath(path) {
  return typeof path === 'string' && /^\/collections\/[^/?#]+$/.test(path)
    ? path.replace('/collections/', '/department/')
    : path;
}

function pathOf(url) {
  if (!url) return null;
  try {
    return new URL(url, 'https://x').pathname;
  } catch {
    return null;
  }
}

function cleanTitle(raw = '') {
  return raw.replace(/\s*[[(]https?:\/\/.*$/, '').trim();
}

/** The main-menu item whose link is this collection. */
export function findMenuItem(menu, handle) {
  return (menu?.items ?? []).find(
    (i) => pathOf(i.url) === `/collections/${handle}`,
  );
}

function filterValues(filters, idPart) {
  return (
    (filters ?? []).find((f) => f.id.includes(idPart))?.values ?? []
  ).filter((v) => v.count > 0);
}

function filterLink(handle, input) {
  return `/collections/${handle}?filter=${encodeURIComponent(input)}`;
}

/** Sub-category tiles from the mega menu; empty collections are skipped. */
export function buildCategories(menuItem) {
  const seen = new Set();
  return (menuItem?.items ?? [])
    .filter((c) => c.resource?.__typename === 'Collection')
    .filter((c) => c.resource.products?.nodes?.length)
    .filter((c) => !seen.has(c.resource.handle) && seen.add(c.resource.handle))
    .map((c) => ({
      id: c.id,
      title: cleanTitle(c.title),
      to: `/collections/${c.resource.handle}`,
      image:
        c.resource.image ?? c.resource.products.nodes[0].featuredImage ?? null,
    }));
}

/** Brand tiles from the vendor filter, each with a photo from its best seller. */
export function buildBrands(handle, filters, products, limit = 12) {
  return filterValues(filters, 'vendor')
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((v) => ({
      id: v.id,
      title: v.label,
      count: v.count,
      to: filterLink(handle, v.input),
      image:
        products.find((p) => p.vendor === v.label)?.images?.nodes?.[0] ?? null,
    }));
}

/**
 * "Under ₹499 / ₹999 / …" bands. A band is shown only when it adds products
 * over the previous one, and never when it would contain everything.
 */
export function buildPriceBands(handle, products) {
  const prices = products
    .map((p) => Number(p.priceRange?.minVariantPrice?.amount))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (!prices.length) return [];
  const bands = [];
  let previous = 0;
  for (const max of PRICE_BANDS) {
    const count = prices.filter((n) => n <= max).length;
    if (count > previous && count < prices.length) {
      bands.push({max, count, to: `/collections/${handle}?price_max=${max}`});
      previous = count;
    }
  }
  return bands;
}

/** Style chips from the "design" filter, else "type". */
export function buildStyles(handle, filters, limit = 10) {
  const values = filterValues(filters, 'custom.design').length
    ? filterValues(filters, 'custom.design')
    : filterValues(filters, 'custom.type');
  return values
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((v) => ({
      id: v.id,
      title: v.label,
      count: v.count,
      to: filterLink(handle, v.input),
    }));
}

/** Live counts for the hero line. */
export function buildStats(filters) {
  const inStock =
    filterValues(filters, 'availability').find((v) =>
      /"available":true/.test(v.input),
    )?.count ?? 0;
  const brands = filterValues(filters, 'vendor').length;
  return {inStock, brands};
}

/** Other main-menu departments, for the "Explore more" row. */
export function buildOtherDepartments(menu, handle) {
  return (menu?.items ?? [])
    .map((i) => ({id: i.id, title: cleanTitle(i.title), path: pathOf(i.url)}))
    .filter((i) => i.path?.startsWith('/collections/'))
    .filter((i) => i.path !== `/collections/${handle}`)
    .map((i) => ({id: i.id, title: i.title, to: departmentPath(i.path)}));
}
