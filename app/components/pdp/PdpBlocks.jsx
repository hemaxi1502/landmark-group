import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {Icon} from '~/components/ui/Icon';
import {discountPercent} from '~/lib/product-card';
import {estimateDelivery, isValidPincode, usePincode} from '~/lib/pincode';
import {
  LOW_STOCK_THRESHOLD,
  MEMBERSHIP_BANNER,
  PDP_COUPONS,
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
                    <Money as="span" data={compareAtPrice} withoutTrailingZeros />
                  </s>
                </span>
                <span className="text-sm font-semibold text-success">
                  ({off}% OFF)
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-muted">Inclusive of all taxes</p>
          <Link
            to="/policies/shipping-policy"
            className="text-xs font-medium text-brand"
          >
            Free shipping on all orders
          </Link>
        </div>
      )}
    </div>
  );
}
/* ------------------------------------------------------------------ */
/* Offers / Coupons Carousel                                           */
/* ------------------------------------------------------------------ */
export function OffersCarousel() {
  const [copied, setCopied] = useState(null);
  return (
    <section
      aria-label="Offers and discounts"
      className="rounded border border-line p-3"
    >
      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
        <Icon name="tag" className="h-4 w-4 text-brand" /> Offers &amp;
        Discounts
      </h2>
      <div className="no-scrollbar flex snap-x gap-2 overflow-x-auto">
        {PDP_COUPONS.map((c) => (
          <div
            key={c.code}
            className="w-60 shrink-0 snap-start rounded bg-surface p-3 text-xs"
          >
            <p className="font-semibold">{c.title}</p>
            <p className="mt-0.5 text-muted">{c.text}</p>
            <div className="mt-2 flex items-center justify-between">
              <code className="rounded border border-dashed border-brand bg-white px-2 py-0.5 font-bold text-brand">
                {c.code}
              </code>
              <button
                type="button"
                onClick={() => {
                  void navigator.clipboard?.writeText(c.code);
                  setCopied(c.code);
                  window.setTimeout(() => setCopied(null), 1500);
                }}
                className="font-semibold text-ink underline"
              >
                {copied === c.code ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
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
    <Link
      to={MEMBERSHIP_BANNER.to}
      className="flex items-center justify-between gap-3 rounded bg-gradient-to-r from-brand to-brand-dark px-4 py-3 text-white"
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
    </Link>
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
      link: {label: 'Details', to: PDP_SERVICE_INFO.returnsUrl},
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
          <div>
            <p className="font-semibold">
              {r.title}
              {'link' in r && r.link && (
                <Link
                  to={r.link.to}
                  className="ml-2 text-xs font-normal text-brand underline"
                >
                  {r.link.label}
                </Link>
              )}
            </p>
            {r.text && <p className="text-xs text-muted">{r.text}</p>}
          </div>
        </div>
      ))}
      <p className="p-3 text-xs text-muted">
        Sold by:{' '}
        <span className="font-semibold text-ink">
          {PDP_SERVICE_INFO.soldBy}
        </span>
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
