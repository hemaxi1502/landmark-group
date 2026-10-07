import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router';
import {CartForm, Money} from '@shopify/hydrogen';
import {Modal} from '~/components/ui/Modal';
import {Icon} from '~/components/ui/Icon';
import {discountPercent} from '~/lib/product-card';
import {estimateDelivery, isValidPincode, usePincode} from '~/lib/pincode';
import {
  LOW_STOCK_THRESHOLD,
  MEMBERSHIP_BANNER,
  PDP_COUPONS,
  PDP_INFO_PANELS,
  PDP_SERVICE_INFO,
} from '~/lib/site-config';
/* ------------------------------------------------------------------ */
/* Product Info — brand, title, rating, price, MRP, taxes              */
/* ------------------------------------------------------------------ */
export function ProductInfo({
  vendor,
  title,
  rating,
  ratingCount,
  price,
  compareAtPrice,
}) {
  const off = discountPercent(price?.amount, compareAtPrice?.amount);
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold tracking-wide uppercase">{vendor}</p>
      <h1 className="text-lg leading-snug text-ink md:text-xl">{title}</h1>
      {rating !== undefined && (
        <a href="#reviews" className="inline-flex items-center gap-1.5 text-sm">
          <span className="inline-flex items-center gap-0.5 rounded bg-success px-1.5 py-0.5 text-xs text-white">
            {rating.toFixed(1)} <Icon name="star" filled className="h-3 w-3" />
          </span>
          {!!ratingCount && (
            <span className="text-muted">{ratingCount} ratings</span>
          )}
        </a>
      )}
      {price && (
        <div className="pt-2">
          <div className="flex flex-wrap items-baseline gap-x-3">
            {!off && <span className="text-sm text-muted">MRP</span>}
            <span className="text-2xl font-bold">
              <Money as="span" data={price} withoutTrailingZeros />
            </span>
            {off && compareAtPrice && (
              <>
                <span className="text-sm text-muted">
                  MRP{' '}
                  <s>
                    <Money
                      as="span"
                      data={compareAtPrice}
                      withoutTrailingZeros
                    />
                  </s>
                </span>
                <span className="text-sm font-semibold text-success">
                  ({off}% OFF)
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-muted">Inclusive of all taxes</p>
          <InfoButton
            panel="shipping"
            className="text-xs font-medium text-brand"
          >
            Free shipping on all orders
          </InfoButton>
        </div>
      )}
    </div>
  );
}
/* ------------------------------------------------------------------ */
/* Offers / Coupons Carousel                                           */
/* ------------------------------------------------------------------ */
export function OffersCarousel() {
  const track = useRef(null);
  const [copied, setCopied] = useState(null);
  const [edges, setEdges] = useState({start: true, end: false});

  const updateEdges = () => {
    const el = track.current;
    if (!el) return;
    setEdges({
      start: el.scrollLeft <= 4,
      end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  };
  useEffect(() => {
    updateEdges();
    window.addEventListener('resize', updateEdges);
    return () => window.removeEventListener('resize', updateEdges);
  }, []);

  const scroll = (dir) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild;
    const step = card ? card.getBoundingClientRect().width + 8 : el.clientWidth;
    el.scrollBy({left: dir * step, behavior: 'smooth'});
  };

  const copy = (code) => {
    void navigator.clipboard?.writeText(code);
    setCopied(code);
    window.setTimeout(() => setCopied(null), 1500);
  };

  const arrow =
    'flex h-7 w-7 items-center justify-center rounded-full border border-line bg-white disabled:opacity-30';

  return (
    <section
      aria-label="Offers and discounts"
      className="rounded border border-line p-3"
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold">
          <Icon name="tag" className="h-4 w-4 text-brand" /> Offers &amp;
          Discounts
        </h2>
        {PDP_COUPONS.length > 1 && (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => scroll(-1)}
              disabled={edges.start}
              aria-label="Previous offer"
              className={arrow}
            >
              <Icon name="chevronLeft" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              disabled={edges.end}
              aria-label="Next offer"
              className={arrow}
            >
              <Icon name="chevronRight" className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
      <div
        ref={track}
        onScroll={updateEdges}
        className="no-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth"
      >
        {PDP_COUPONS.map((c) => (
          <div
            key={c.code}
            className="w-[85%] shrink-0 snap-start rounded bg-surface p-3 text-xs sm:w-60"
          >
            <p className="font-semibold">{c.title}</p>
            <p className="mt-0.5 text-muted">{c.text}</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => copy(c.code)}
                title="Copy code"
                className="rounded border border-dashed border-brand bg-white px-2 py-0.5 font-mono font-bold text-brand"
              >
                {copied === c.code ? 'Copied!' : c.code}
              </button>
              <ApplyCoupon code={c.code} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/**
 * Saves the code on the basket. Shopify applies it once the basket meets the
 * coupon's minimum; until then it answers with a DISCOUNT_* warning, which
 * the label reflects.
 */
function ApplyCoupon({code}) {
  return (
    <CartForm
      route="/cart"
      fetcherKey={`coupon-${code}`}
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{discountCodes: [code]}}
    >
      {(fetcher) => {
        const busy = fetcher.state !== 'idle';
        const done = !busy && fetcher.data;
        const pending = fetcher.data?.warnings?.some((w) =>
          String(w?.code ?? '').startsWith('DISCOUNT'),
        );
        let label = 'Apply';
        if (busy) label = 'Applying…';
        else if (done)
          label = pending ? 'Saved · applies at min. value' : 'Applied ✓';
        return (
          <button
            type="submit"
            disabled={busy}
            aria-live="polite"
            className={`text-right font-semibold underline disabled:opacity-50 ${done ? (pending ? 'text-muted' : 'text-success') : 'text-ink'}`}
          >
            {label}
          </button>
        );
      }}
    </CartForm>
  );
}

/* ------------------------------------------------------------------ */
/* Info pop-ups (Click & Collect, returns, seller, shipping, rewards)  */
/* ------------------------------------------------------------------ */
export function InfoButton({panel, className, children}) {
  const [open, setOpen] = useState(false);
  const info = PDP_INFO_PANELS[panel];
  if (!info) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className={className}
      >
        {children}
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        label={info.title}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded bg-white p-5"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold">{info.title}</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
          >
            <Icon name="close" />
          </button>
        </div>
        <ol className="list-decimal space-y-2 pl-5 text-sm">
          {info.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        {info.note && <p className="mt-3 text-xs text-muted">{info.note}</p>}
        {info.policy && (
          <Link
            to={info.policy}
            onClick={() => setOpen(false)}
            className="mt-4 inline-block text-sm font-semibold text-brand underline"
          >
            Read full policy
          </Link>
        )}
      </Modal>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Low-Stock Message                                                   */
/* ------------------------------------------------------------------ */
export function LowStockMessage({quantity}) {
  if (quantity == null || quantity <= 0 || quantity > LOW_STOCK_THRESHOLD)
    return null;
  return (
    <p className="text-sm font-semibold text-danger" role="status">
      Order now, only {quantity} left!
    </p>
  );
}
/* ------------------------------------------------------------------ */
/* Social Share                                                        */
/* ------------------------------------------------------------------ */
export function SocialShare({title}) {
  const [url, setUrl] = useState('');
  const [copied, setCopied] = useState(false);
  useEffect(() => setUrl(window.location.href.split('?')[0]), []);
  const enc = encodeURIComponent;
  const links = [
    {label: 'WhatsApp', href: `https://wa.me/?text=${enc(`${title} ${url}`)}`},
    {
      label: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`,
    },
    {
      label: 'X',
      href: `https://twitter.com/intent/tweet?url=${enc(url)}&text=${enc(title)}`,
    },
    {
      label: 'Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${enc(url)}&description=${enc(title)}`,
    },
  ];
  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      <span className="flex items-center gap-1 font-semibold">
        <Icon name="share" className="h-4 w-4" /> Share
      </span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted hover:text-ink"
        >
          {l.label}
        </a>
      ))}
      <button
        type="button"
        onClick={() => {
          void navigator.clipboard?.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1500);
        }}
        className="text-muted hover:text-ink"
      >
        {copied ? 'Link copied' : 'Copy link'}
      </button>
    </div>
  );
}
/* ------------------------------------------------------------------ */
/* Membership Banner                                                   */
/* ------------------------------------------------------------------ */
export function MembershipBanner() {
  return (
    <InfoButton
      panel="rewards"
      className="flex w-full items-center justify-between gap-3 rounded bg-gradient-to-r from-brand to-brand-dark px-4 py-3 text-left text-white"
    >
      <span>
        <span className="block text-sm font-bold">
          {MEMBERSHIP_BANNER.title}
        </span>
        <span className="block text-xs opacity-90">
          {MEMBERSHIP_BANNER.text}
        </span>
      </span>
      <span className="shrink-0 text-xs font-semibold underline">
        {MEMBERSHIP_BANNER.cta}
      </span>
    </InfoButton>
  );
}
/* ------------------------------------------------------------------ */
/* Pincode Delivery Check                                              */
/* ------------------------------------------------------------------ */
export function PincodeCheck() {
  const {pincode, setPincode} = usePincode();
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  useEffect(() => setDraft(pincode), [pincode]);
  return (
    <section aria-label="Delivery" className="space-y-2">
      <h2 className="text-sm font-semibold">When will I receive my order?</h2>
      <form
        className="flex max-w-sm gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!isValidPincode(draft)) {
            setError('Enter a valid 6-digit pincode');
            return;
          }
          setError('');
          setPincode(draft);
        }}
      >
        <input
          inputMode="numeric"
          maxLength={6}
          value={draft}
          onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
          placeholder="Enter pincode"
          aria-label="Pincode"
          aria-invalid={!!error}
          className="flex-1 rounded border border-line px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded border border-ink px-4 text-sm font-semibold"
        >
          Check
        </button>
      </form>
      {error && <p className="text-xs text-danger">{error}</p>}
      {!error && isValidPincode(pincode) && (
        <p className="text-xs text-success">
          Expected delivery by <strong>{estimateDelivery(pincode)}</strong> to{' '}
          {pincode}
        </p>
      )}
    </section>
  );
}
/* ------------------------------------------------------------------ */
/* Click & Collect · EMI · Returns · Sold By                           */
/* ------------------------------------------------------------------ */
export function ServiceInfo({price}) {
  const emiEligible =
    Number(price?.amount ?? 0) >= PDP_SERVICE_INFO.emiThreshold;
  const rows = [
    {
      icon: 'store',
      title: 'Click & Collect',
      text: PDP_SERVICE_INFO.clickAndCollect,
      panel: 'clickAndCollect',
      cta: 'How it works',
    },
    ...(emiEligible
      ? [
          {
            icon: 'card',
            title: 'Pay in instalments',
            text: PDP_SERVICE_INFO.emi,
          },
        ]
      : []),
    {
      icon: 'return',
      title: PDP_SERVICE_INFO.returns,
      text: '',
      panel: 'returns',
      cta: 'Details',
    },
  ];
  return (
    <section
      aria-label="Services"
      className="divide-y divide-line rounded border border-line"
    >
      {rows.map((r) => (
        <div key={r.title} className="flex gap-3 p-3 text-sm">
          <Icon name={r.icon} className="mt-0.5 h-5 w-5 shrink-0 text-brand" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold">
              {r.title}
              {r.panel && (
                <InfoButton
                  panel={r.panel}
                  className="ml-2 text-xs font-normal text-brand underline"
                >
                  {r.cta}
                </InfoButton>
              )}
            </p>
            {r.text && <p className="text-xs text-muted">{r.text}</p>}
          </div>
        </div>
      ))}
      <p className="p-3 text-xs text-muted">
        Sold by:{' '}
        <InfoButton
          panel="soldBy"
          className="font-semibold text-ink underline decoration-dotted underline-offset-2"
        >
          {PDP_SERVICE_INFO.soldBy}
        </InfoButton>
      </p>
    </section>
  );
}
/* ------------------------------------------------------------------ */
/* Product Description + Specifications                                */
/* ------------------------------------------------------------------ */
export function ProductDetails({descriptionHtml, specs}) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? specs : specs.slice(0, 8);
  return (
    <section aria-label="Product details" className="space-y-5">
      {descriptionHtml && (
        <div>
          <h2 className="mb-2 text-sm font-bold tracking-wide uppercase">
            Overview
          </h2>
          <div
            className="text-sm leading-relaxed text-muted [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-2"
            dangerouslySetInnerHTML={{__html: descriptionHtml}}
          />
        </div>
      )}
      {specs.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-bold tracking-wide uppercase">
            Details
          </h2>
          <dl className="grid grid-cols-1 gap-x-6 text-sm sm:grid-cols-2">
            {visible.map((s) => (
              <div key={s.label} className="border-b border-line py-2">
                <dt className="text-xs text-muted">{s.label}</dt>
                <dd className="whitespace-pre-line">{s.value}</dd>
              </div>
            ))}
          </dl>
          {specs.length > 8 && (
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              className="mt-2 text-sm font-semibold text-brand"
              aria-expanded={expanded}
            >
              {expanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
/* ------------------------------------------------------------------ */
/* Ratings & Reviews                                                   */
/* ------------------------------------------------------------------ */
/**
 * Summary from Shopify's standard `reviews.rating` / `reviews.rating_count`
 * metafields (written by Judge.me, Yotpo, Okendo…). The review list itself
 * comes from the chosen app's widget or API — mount it at the marked slot.
 */
export function RatingsReviews({rating, count}) {
  return (
    <section
      id="reviews"
      aria-label="Ratings and reviews"
      className="scroll-mt-32"
    >
      <h2 className="mb-4 text-lg font-semibold">Ratings &amp; Reviews</h2>
      {rating !== undefined ? (
        <div className="flex items-center gap-4">
          <span className="text-4xl font-bold">{rating.toFixed(1)}</span>
          <div>
            <div
              className="flex text-brand"
              aria-label={`${rating.toFixed(1)} out of 5`}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <Icon
                  key={n}
                  name="star"
                  filled={n <= Math.round(rating)}
                  className="h-5 w-5"
                />
              ))}
            </div>
            {!!count && (
              <p className="text-sm text-muted">Based on {count} ratings</p>
            )}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted">No reviews yet.</p>
      )}
      {/* REVIEWS APP SLOT — render the review list / write-a-review widget here */}
      <div data-reviews-app-slot className="mt-6" />
    </section>
  );
}
