import {useState} from 'react';
import {Link, useLocation, useNavigate} from 'react-router';
import {SORT_OPTIONS, resetPagination} from '~/lib/collection-filters';
import {Icon} from '~/components/ui/Icon';
/* ------------------------------------------------------------------ */
/* Sub-Category Pills ("Shop For")                                     */
/* ------------------------------------------------------------------ */
export function SubCategoryPills({links}) {
  if (!links.length) return null;
  return (
    <nav
      aria-label="Shop for"
      className="no-scrollbar -mx-4 mb-4 flex items-center gap-2 overflow-x-auto px-4 md:mx-0 md:px-0"
    >
      <span className="shrink-0 text-xs font-semibold text-muted">
        Shop For
      </span>
      {links.map((l) => (
        <Link
          // Two menu items can point to the same collection.
          key={`${l.to}-${l.label}`}
          to={l.to}
          prefetch="intent"
          aria-current={l.active ? 'page' : undefined}
          className={`shrink-0 rounded-full border px-4 py-1.5 text-xs transition ${l.active ? 'border-ink bg-ink text-white' : 'border-line hover:border-ink'}`}
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
/* ------------------------------------------------------------------ */
/* Sort Dropdown                                                       */
/* ------------------------------------------------------------------ */
export function SortDropdown({value}) {
  const {search} = useLocation();
  const navigate = useNavigate();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline">Sort by</span>
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(search);
          next.set('sort', e.target.value);
          resetPagination(next);
          void navigate(`?${next}`, {preventScrollReset: true});
        }}
        className="rounded border border-line bg-white px-3 py-2 text-sm"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
/* ------------------------------------------------------------------ */
/* Pagination (page-by-page, cursor based)                             */
/* ------------------------------------------------------------------ */
/**
 * The Storefront API is cursor-based and has no total product count, so this
 * shows "Page N" with Previous / Next rather than "Page N of 85".
 */
export function PlpPagination({pageInfo}) {
  const {search} = useLocation();
  const params = new URLSearchParams(search);
  const page = Number(params.get('page') ?? 1);
  if (!pageInfo.hasNextPage && !pageInfo.hasPreviousPage) return null;
  const link = (direction) => {
    const next = new URLSearchParams(params);
    next.set('direction', direction);
    next.set(
      'cursor',
      (direction === 'next' ? pageInfo.endCursor : pageInfo.startCursor) ?? '',
    );
    const target = direction === 'next' ? page + 1 : page - 1;
    if (target <= 1) {
      next.delete('page');
      next.delete('cursor');
      next.delete('direction');
    } else next.set('page', String(target));
    return `?${next}`;
  };
  const btn =
    'flex items-center gap-1 rounded border border-line px-4 py-2 text-sm font-medium hover:border-ink';
  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-4"
    >
      {pageInfo.hasPreviousPage ? (
        <Link to={link('previous')} className={btn} rel="prev">
          <Icon name="chevronLeft" className="h-4 w-4" /> Previous
        </Link>
      ) : (
        <span className={`${btn} pointer-events-none opacity-40`}>
          Previous
        </span>
      )}
      <span className="text-sm text-muted">Page {page}</span>
      {pageInfo.hasNextPage ? (
        <Link to={link('next')} className={btn} rel="next">
          Next <Icon name="chevronRight" className="h-4 w-4" />
        </Link>
      ) : (
        <span className={`${btn} pointer-events-none opacity-40`}>Next</span>
      )}
    </nav>
  );
}
/* ------------------------------------------------------------------ */
/* SEO Content Block                                                   */
/* ------------------------------------------------------------------ */
/** Collection description as an expandable SEO block below the grid. Server-rendered for crawlers. */
export function SeoContentBlock({html}) {
  const [open, setOpen] = useState(false);
  if (!html?.trim()) return null;
  return (
    <section className="mt-14 border-t border-line pt-8">
      <div
        className={`prose-sm relative overflow-hidden text-sm leading-relaxed text-muted [&_a]:text-ink [&_a]:underline [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3 ${open ? '' : 'max-h-40'}`}
        dangerouslySetInnerHTML={{__html: html}}
      />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="mt-2 text-sm font-semibold text-brand"
        aria-expanded={open}
      >
        {open ? 'Read less' : 'Read more'}
      </button>
    </section>
  );
}
/**
 * Reads collection metafield `custom.faq` (JSON: [{"question","answer"}]).
 * Emits FAQPage structured data for rich results.
 */
export function FaqAccordion({faqs, title}) {
  if (!faqs.length) return null;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: {'@type': 'Answer', text: f.answer},
    })),
  };
  return (
    <section className="mt-10">
      <h2 className="mb-3 text-lg font-semibold">FAQs for {title}</h2>
      <div className="divide-y divide-line border-y border-line">
        {faqs.map((f) => (
          <details key={f.question} className="group py-3">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
              {f.question}
              <Icon
                name="plus"
                className="h-4 w-4 shrink-0 transition group-open:rotate-45"
              />
            </summary>
            <p className="mt-2 text-sm whitespace-pre-line text-muted">
              {f.answer}
            </p>
          </details>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(schema)}}
      />
    </section>
  );
}
export function parseFaqs(raw) {
  if (!raw) return [];
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .map((d) => ({
        question: d.question ?? d.q ?? '',
        answer: d.answer ?? d.a ?? '',
      }))
      .filter((f) => f.question && f.answer);
  } catch {
    return [];
  }
}
/* ------------------------------------------------------------------ */
/* Popular Searches                                                    */
/* ------------------------------------------------------------------ */
/** Internal-link cloud from the Shopify menu with handle `popular-searches`. */
export function PopularSearches({links}) {
  if (!links.length) return null;
  return (
    <section className="mt-10">
      <h2 className="mb-2 text-sm font-semibold">Popular Searches:</h2>
      <p className="text-xs leading-6 text-muted">
        {links.map((l, i) => (
          <span key={l.to}>
            <Link to={l.to} className="hover:text-ink hover:underline">
              {l.label}
            </Link>
            {i < links.length - 1 && <span className="mx-1.5">|</span>}
          </span>
        ))}
      </p>
    </section>
  );
}
