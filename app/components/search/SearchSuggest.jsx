import {useCallback, useEffect, useRef, useState} from 'react';
import {Link, useFetcher, useNavigate} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';

/* ------------------------------------------------------------------ */
/* Recent searches (browser storage)                                   */
/* ------------------------------------------------------------------ */

const RECENT_KEY = 'recent-searches';
const RECENT_EVENT = 'recent-searches-change';

function readRecent() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeRecent(list) {
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event(RECENT_EVENT));
  } catch {
    /* storage blocked */
  }
}

/** Saves a term to the shopper's recent searches (max 8, newest first). */
export function rememberSearch(term) {
  const clean = String(term ?? '').trim();
  if (!clean) return;
  writeRecent(
    [
      clean,
      ...readRecent().filter((t) => t.toLowerCase() !== clean.toLowerCase()),
    ].slice(0, 8),
  );
}

export function useRecentSearches() {
  const [recent, setRecent] = useState([]);
  useEffect(() => {
    const sync = () => setRecent(readRecent());
    sync();
    window.addEventListener(RECENT_EVENT, sync);
    return () => window.removeEventListener(RECENT_EVENT, sync);
  }, []);
  return {
    recent,
    clear: () => writeRecent([]),
    remove: (term) => writeRecent(readRecent().filter((t) => t !== term)),
  };
}

/* ------------------------------------------------------------------ */
/* Live suggestions                                                    */
/* ------------------------------------------------------------------ */

/**
 * Debounced product/collection/query suggestions from /search?predictive.
 * Returns the controlled `term` plus `setTerm` for the input.
 */
export function useSearchSuggest(delay = 250) {
  const fetcher = useFetcher({key: 'header-search'});
  const [term, setTermState] = useState('');
  const timer = useRef();

  const setTerm = useCallback(
    (value) => {
      setTermState(value);
      window.clearTimeout(timer.current);
      const q = value.trim();
      if (!q) return;
      timer.current = window.setTimeout(() => {
        void fetcher.load(
          `/search?predictive=true&limit=6&q=${encodeURIComponent(q)}`,
        );
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [delay],
  );

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const data = fetcher.data?.type === 'predictive' ? fetcher.data : null;
  const items =
    data && data.term?.trim() === term.trim() ? data.result?.items : null;

  return {
    term,
    setTerm,
    loading: fetcher.state === 'loading',
    products: items?.products ?? [],
    collections: items?.collections ?? [],
    queries: items?.queries ?? [],
  };
}

/** Submits a search: remembers it and navigates to the results page. */
export function useGoToSearch() {
  const navigate = useNavigate();
  return useCallback(
    (term) => {
      const q = String(term ?? '').trim();
      if (!q) return;
      rememberSearch(q);
      void navigate(`/search?q=${encodeURIComponent(q)}`);
    },
    [navigate],
  );
}

/* ------------------------------------------------------------------ */
/* Dropdown panel                                                      */
/* ------------------------------------------------------------------ */

/**
 * Contents of the search dropdown.
 * - No term: recent searches + popular searches (as links)
 * - With term: query suggestions, matching categories, product suggestions,
 *   and "View all results"
 *
 * Styling follows the existing header (Figtree, #FAA619 accent, pill chips).
 */
export function SearchSuggestPanel({suggest, popular = [], onNavigate}) {
  const {recent, clear, remove} = useRecentSearches();
  const goToSearch = useGoToSearch();
  const term = suggest.term.trim();

  const pick = (q) => {
    onNavigate?.();
    goToSearch(q);
  };

  if (!term) {
    return (
      <div>
        {recent.length > 0 && (
          <div className="mb-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-[14px] font-bold text-[#000000]">
                Recent searches
              </h3>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={clear}
                className="text-[12px] font-semibold text-[#FAA619]"
              >
                Clear all
              </button>
            </div>
            <ul>
              {recent.map((q) => (
                <li
                  key={q}
                  className="flex items-center justify-between border-b border-gray-50 py-2"
                >
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => pick(q)}
                    className="flex-1 text-left text-[13px] text-[#292D35]"
                  >
                    {q}
                  </button>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => remove(q)}
                    aria-label={`Remove ${q}`}
                    className="px-1 text-[16px] leading-none text-[#798086]"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {popular.length > 0 && (
          <div>
            <h3 className="mb-3 text-[14px] font-normal text-[#000000]">
              Popular searches
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {popular.map((q) => (
                <button
                  key={q}
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(q)}
                  className="flex h-[32px] items-center justify-center whitespace-nowrap rounded-full border border-gray-300 bg-white px-[12px] text-[13px] font-normal text-[#000000DE] transition-colors hover:bg-gray-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  const {products, collections, queries, loading} = suggest;
  const nothing =
    !loading && !products.length && !collections.length && !queries.length;

  return (
    <div className="space-y-5">
      {queries.length > 0 && (
        <ul>
          {queries.slice(0, 5).map((q) => (
            <li key={q.text}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(q.text)}
                className="w-full py-1.5 text-left text-[14px] text-[#292D35] hover:text-[#FAA619]"
                dangerouslySetInnerHTML={{__html: q.styledText ?? q.text}}
              />
            </li>
          ))}
        </ul>
      )}

      {collections.length > 0 && (
        <div>
          <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-[#798086]">
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {collections.slice(0, 4).map((c) => (
              <Link
                key={c.id}
                to={`/collections/${c.handle}`}
                onClick={onNavigate}
                className="rounded-full border border-gray-300 px-3 py-1 text-[13px] hover:border-[#FAA619]"
              >
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {products.length > 0 && (
        <div>
          <h3 className="mb-2 text-[12px] font-bold uppercase tracking-wide text-[#798086]">
            Products
          </h3>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {products.slice(0, 6).map((p) => {
              const variant = p.selectedOrFirstAvailableVariant;
              return (
                <li key={p.id}>
                  <Link
                    to={`/products/${p.handle}`}
                    onClick={() => {
                      rememberSearch(term);
                      onNavigate?.();
                    }}
                    className="flex items-center gap-3 rounded p-1.5 hover:bg-[#F4F4F4]"
                  >
                    <div className="h-14 w-11 shrink-0 overflow-hidden rounded bg-[#ECEDEB]">
                      {variant?.image && (
                        <Image
                          data={variant.image}
                          alt={p.title}
                          width={44}
                          height={56}
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] text-[#292D35]">
                        {p.title}
                      </span>
                      {variant?.price && (
                        <span className="text-[13px] font-semibold">
                          <Money
                            as="span"
                            data={variant.price}
                            withoutTrailingZeros
                          />
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {nothing && (
        <p className="text-[13px] text-[#798086]">
          No matches for “{term}”. Press Enter to search anyway.
        </p>
      )}
      {loading && !products.length && (
        <p className="text-[13px] text-[#798086]">Searching…</p>
      )}

      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => pick(term)}
        className="w-full rounded-[2px] border border-[#FAA619] py-2 text-[13px] font-semibold text-[#FAA619] hover:bg-[#FAA619] hover:text-white"
      >
        View all results for “{term}”
      </button>
    </div>
  );
}
