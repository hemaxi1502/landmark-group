/**
 * URL contract for the PLP (shareable, SEO-safe, works without JS):
 *   ?filter=<json ProductFilter>   repeatable, value = Storefront filter `input`
 *   ?price_min=100&price_max=999   price range
 *   ?sort=price-asc                see SORT_OPTIONS
 *   ?cursor=…&direction=next|previous&page=2   pagination
 */
export const SORT_OPTIONS = [
  {
    value: 'featured',
    label: 'Relevance',
    key: 'COLLECTION_DEFAULT',
    reverse: false,
  },
  {
    value: 'best-selling',
    label: 'Popularity',
    key: 'BEST_SELLING',
    reverse: false,
  },
  {value: 'newest', label: 'New Arrivals', key: 'CREATED', reverse: true},
  {
    value: 'price-asc',
    label: 'Price: Low to High',
    key: 'PRICE',
    reverse: false,
  },
  {
    value: 'price-desc',
    label: 'Price: High to Low',
    key: 'PRICE',
    reverse: true,
  },
];
export function getSort(searchParams) {
  const option =
    SORT_OPTIONS.find((o) => o.value === searchParams.get('sort')) ??
    SORT_OPTIONS[0];
  return {sortKey: option.key, reverse: option.reverse, value: option.value};
}
export function getFilters(searchParams) {
  const filters = [];
  for (const raw of searchParams.getAll('filter')) {
    try {
      filters.push(JSON.parse(raw));
    } catch {
      // ignore malformed values from hand-edited URLs
    }
  }
  const min = Number(searchParams.get('price_min'));
  const max = Number(searchParams.get('price_max'));
  if (min || max) {
    filters.push({price: {...(min ? {min} : {}), ...(max ? {max} : {})}});
  }
  return filters;
}
/** Returns a new search string with a filter toggled on/off and pagination reset. */
export function toggleFilterParam(searchParams, input) {
  const next = new URLSearchParams(searchParams);
  const current = next.getAll('filter');
  next.delete('filter');
  const exists = current.includes(input);
  for (const f of current) if (f !== input) next.append('filter', f);
  if (!exists) next.append('filter', input);
  resetPagination(next);
  return `?${next.toString()}`;
}
export function resetPagination(params) {
  params.delete('cursor');
  params.delete('direction');
  params.delete('page');
}
