import {useState} from 'react';
import {Form, Link, useLocation, useNavigation} from 'react-router';
import {toggleFilterParam} from '~/lib/collection-filters';
import {Icon} from '~/components/ui/Icon';
/**
 * PLP · Filter Sidebar.
 *
 * Facets come straight from the Storefront API (`products.filters`), which
 * returns whatever is enabled in the Shopify **Search & Discovery** app —
 * Colour, Size, Fit, Fabric, Brand… are configured there, not in code.
 * Every option is a real link, so filtering works without JavaScript and
 * filtered URLs are shareable.
 *
 * Desktop: sticky sidebar. Mobile: full-screen drawer behind a "Filter" button.
 */
export function FilterSidebar({filters}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const {search} = useLocation();
  const params = new URLSearchParams(search);
  const activeCount =
    params.getAll('filter').length +
    (params.get('price_min') || params.get('price_max') ? 1 : 0);
  // Nothing configured in Search & Discovery and nothing active → no sidebar at all.
  if (!filters.some((f) => f.values.length) && !activeCount) return null;
  const panel = (
    <FilterPanel
      filters={filters}
      params={params}
      activeCount={activeCount}
      onNavigate={() => setMobileOpen(false)}
    />
  );
  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex items-center gap-2 rounded border border-line px-3 py-2 text-sm lg:hidden"
      >
        <Icon name="filter" className="h-4 w-4" />
        Filter{activeCount ? ` (${activeCount})` : ''}
      </button>

      <div
        role="complementary"
        className="hidden w-60 shrink-0 lg:block"
        aria-label="Filters"
      >
        <div className="sticky top-32 max-h-[calc(100vh-9rem)] overflow-y-auto pr-2">
          {panel}
        </div>
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-white lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Filters"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-semibold">Filters</span>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close filters"
            >
              <Icon name="close" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4">{panel}</div>
          <div className="border-t border-line p-3">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="w-full rounded bg-ink py-3 text-sm font-semibold text-white"
            >
              Show results
            </button>
          </div>
        </div>
      )}
    </>
  );
}
function FilterPanel({filters, params, activeCount, onNavigate}) {
  const active = new Set(params.getAll('filter'));
  const navigation = useNavigation();
  const clearAll = new URLSearchParams(params);
  ['filter', 'price_min', 'price_max', 'cursor', 'direction', 'page'].forEach(
    (k) => clearAll.delete(k),
  );
  return (
    <div
      className={navigation.state === 'loading' ? 'opacity-60 transition' : ''}
    >
      <div className="flex items-center justify-between py-3">
        <h2 className="text-xs font-bold tracking-widest uppercase">Filters</h2>
        {activeCount > 0 && (
          <Link
            to={`?${clearAll}`}
            preventScrollReset
            className="text-xs font-semibold text-brand"
          >
            Clear all
          </Link>
        )}
      </div>

      {filters.map((filter) =>
        filter.type === 'PRICE_RANGE' ? (
          <PriceRange key={filter.id} params={params} label={filter.label} />
        ) : filter.values.length ? (
          <details
            key={filter.id}
            open
            className="group border-t border-line py-3"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
              {filter.label}
              <Icon
                name="chevronDown"
                className="h-4 w-4 transition group-open:rotate-180"
              />
            </summary>
            <ul className="mt-2 max-h-56 space-y-1.5 overflow-y-auto">
              {filter.values.map((value) => {
                const checked = active.has(value.input);
                return (
                  <li key={value.id}>
                    <Link
                      to={toggleFilterParam(params, value.input)}
                      preventScrollReset
                      onClick={onNavigate}
                      className="flex items-center gap-2 text-sm"
                      aria-checked={checked}
                      role="checkbox"
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-sm border ${checked ? 'border-brand bg-brand text-white' : 'border-muted'}`}
                      >
                        {checked && <Icon name="check" className="h-3 w-3" />}
                      </span>
                      <span className="flex-1">{value.label}</span>
                      <span className="text-xs text-muted">{value.count}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </details>
        ) : null,
      )}
    </div>
  );
}
function PriceRange({params, label}) {
  const keep = [...params.entries()].filter(
    ([k]) =>
      !['price_min', 'price_max', 'cursor', 'direction', 'page'].includes(k),
  );
  return (
    <details open className="group border-t border-line py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
        {label}
        <Icon
          name="chevronDown"
          className="h-4 w-4 transition group-open:rotate-180"
        />
      </summary>
      <Form
        method="get"
        preventScrollReset
        className="mt-2 flex items-end gap-2"
      >
        {keep.map(([k, v], i) => (
          <input key={`${k}-${i}`} type="hidden" name={k} value={v} />
        ))}
        <label className="flex-1 text-xs text-muted">
          Min ₹
          <input
            name="price_min"
            type="number"
            min={0}
            defaultValue={params.get('price_min') ?? ''}
            className="mt-1 w-full rounded border border-line px-2 py-1.5 text-sm text-ink"
          />
        </label>
        <label className="flex-1 text-xs text-muted">
          Max ₹
          <input
            name="price_max"
            type="number"
            min={0}
            defaultValue={params.get('price_max') ?? ''}
            className="mt-1 w-full rounded border border-line px-2 py-1.5 text-sm text-ink"
          />
        </label>
        <button
          type="submit"
          className="rounded bg-ink px-3 py-1.5 text-xs font-semibold text-white"
        >
          Go
        </button>
      </Form>
    </details>
  );
}
/** Removable chips for the active filters, shown above the grid. */
export function ActiveFilterChips({filters}) {
  const {search} = useLocation();
  const params = new URLSearchParams(search);
  const labels = new Map();
  for (const f of filters)
    for (const v of f.values) labels.set(v.input, v.label);
  const chips = params
    .getAll('filter')
    .map((input) => ({input, label: labels.get(input) ?? 'Filter'}));
  const min = params.get('price_min');
  const max = params.get('price_max');
  if (!chips.length && !min && !max) return null;
  const priceRemoved = new URLSearchParams(params);
  priceRemoved.delete('price_min');
  priceRemoved.delete('price_max');
  return (
    <ul className="mb-4 flex flex-wrap gap-2">
      {chips.map((chip) => (
        <li key={chip.input}>
          <Link
            to={toggleFilterParam(params, chip.input)}
            preventScrollReset
            className="flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs hover:border-ink"
          >
            {chip.label}
            <Icon name="close" className="h-3 w-3" />
          </Link>
        </li>
      ))}
      {(min || max) && (
        <li>
          <Link
            to={`?${priceRemoved}`}
            preventScrollReset
            className="flex items-center gap-1 rounded-full border border-line px-3 py-1 text-xs hover:border-ink"
          >
            ₹{min || 0} – {max ? `₹${max}` : 'any'}
            <Icon name="close" className="h-3 w-3" />
          </Link>
        </li>
      )}
    </ul>
  );
}
