import {useEffect, useMemo, useRef, useState} from 'react';
import {Link, useFetcher} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {Icon} from '~/components/ui/Icon';
import {IMAGE_SRCSET} from '~/lib/image';
import {
  DEFAULT_TRUST_BADGES,
  normalizeLink,
  parseLines,
} from '~/lib/page-builder';

/**
 * Conversion-focused page-builder blocks. Everything shown is real store
 * data or text the editor typed: no invented urgency or social proof.
 */

function Section({title, children, className = ''}) {
  return (
    <section className={`container-site mt-10 md:mt-14 ${className}`}>
      {title && (
        <h2 className="mb-4 text-[20px] font-bold md:text-[24px]">{title}</h2>
      )}
      {children}
    </section>
  );
}

function CtaLink({to, children, className}) {
  const href = normalizeLink(to);
  if (!href) return null;
  return /^https?:\/\//.test(href) ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <Link to={href} prefetch="intent" className={className}>
      {children}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Offers & coupons                                                    */
/* ------------------------------------------------------------------ */

export function OfferCodes({block}) {
  const offers = parseLines(block.items).filter((x) => x.b);
  return (
    <Section title={block.heading || 'Offers for you'}>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {offers.map((o) => (
          <OfferCard key={o.a} code={o.a} text={o.b} />
        ))}
      </ul>
    </Section>
  );
}

function OfferCard({code, text}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* clipboard blocked: the code is still visible to type */
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };
  return (
    <li className="flex items-center gap-3 rounded-[2px] border border-dashed border-[#FAA619] bg-[#FFF8EC] p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAA619] text-white">
        <Icon name="tag" className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-mono text-[15px] font-bold tracking-wide">
          {code}
        </span>
        <span className="block text-[13px] text-gray-600">{text}</span>
      </span>
      <button
        type="button"
        onClick={copy}
        className="shrink-0 rounded-[2px] border border-black px-3 py-1.5 text-[12px] font-bold uppercase hover:bg-black hover:text-white"
        aria-label={`Copy code ${code}`}
      >
        <span aria-live="polite">{copied ? 'Copied ✓' : 'Copy'}</span>
      </button>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Sale countdown                                                      */
/* ------------------------------------------------------------------ */

function remaining(endsAt) {
  const ms = new Date(endsAt).getTime() - Date.now();
  if (!(ms > 0)) return null;
  const s = Math.floor(ms / 1000);
  return {
    days: Math.floor(s / 86400),
    hours: Math.floor((s % 86400) / 3600),
    minutes: Math.floor((s % 3600) / 60),
    seconds: s % 60,
  };
}

export function Countdown({block}) {
  // Rendered on the client only: server and browser clocks differ.
  const [left, setLeft] = useState(undefined);
  useEffect(() => {
    const tick = () => setLeft(remaining(block.endsAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [block.endsAt]);
  if (left === null) return null; // sale over: hide
  const units = [
    ['days', 'Days'],
    ['hours', 'Hrs'],
    ['minutes', 'Min'],
    ['seconds', 'Sec'],
  ];
  return (
    <section className="container-site mt-10 md:mt-14">
      <div className="flex flex-col items-center gap-5 rounded-[2px] bg-gradient-to-r from-[#1F2328] to-[#3A2A12] px-6 py-8 text-center text-white md:flex-row md:justify-between md:px-10 md:text-left">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#FAA619]">
            Ends soon
          </p>
          <h2 className="mt-1 text-[22px] font-bold md:text-[28px]">
            {block.heading || 'Sale ends in'}
          </h2>
          {block.text && (
            <p className="mt-1 text-[14px] text-white/80">{block.text}</p>
          )}
        </div>
        <div className="flex items-center gap-2" role="timer" aria-live="off">
          {units.map(([key, label]) => (
            <span
              key={key}
              className="flex w-16 flex-col items-center rounded-[2px] bg-white/10 py-2"
            >
              <span className="text-[26px] font-bold tabular-nums">
                {left ? String(left[key]).padStart(2, '0') : '--'}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-white/70">
                {label}
              </span>
            </span>
          ))}
        </div>
        <CtaLink
          to={block.link}
          className="inline-flex h-11 shrink-0 items-center rounded-[2px] bg-[#FAA619] px-6 text-[14px] font-bold uppercase text-white hover:opacity-90"
        >
          Shop the sale
        </CtaLink>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Trust badges                                                        */
/* ------------------------------------------------------------------ */

function badgeIcon(title) {
  const t = title.toLowerCase();
  if (/ship|deliver/.test(t)) return 'truck';
  if (/return|exchange/.test(t)) return 'return';
  if (/cash|cod|pay|emi|card/.test(t)) return 'card';
  if (/store|collect|pick/.test(t)) return 'store';
  if (/original|genuine|authentic|quality/.test(t)) return 'check';
  if (/reward|point|member/.test(t)) return 'star';
  return 'tag';
}

export function TrustBadges({block}) {
  const badges = parseLines(block.items || DEFAULT_TRUST_BADGES).slice(0, 6);
  return (
    <section className="container-site mt-8 md:mt-10">
      <ul className="grid grid-cols-2 gap-3 rounded-[2px] bg-[#F7F8F7] p-4 md:grid-cols-4 md:p-6">
        {badges.map((b) => (
          <li key={b.a} className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#FAA619] shadow-sm">
              <Icon name={badgeIcon(b.a)} className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-[14px] font-bold">{b.a}</span>
              {b.b && (
                <span className="block text-[12px] text-gray-600">{b.b}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Product spotlight                                                   */
/* ------------------------------------------------------------------ */

export function ProductSpotlight({block}) {
  const p = block.spotlight;
  const {open} = useAside();
  const variants = p.variants.nodes;
  const sizeOption =
    p.options.find((o) => /size/i.test(o.name))?.name ??
    (variants.length > 1 ? p.options[0]?.name : null);
  const firstAvailable =
    variants.find((v) => v.availableForSale) ?? variants[0];
  const [selectedId, setSelectedId] = useState(
    sizeOption ? null : firstAvailable?.id,
  );
  const selected = variants.find((v) => v.id === selectedId) ?? null;
  const shown = selected ?? firstAvailable;
  const [imgIndex, setImgIndex] = useState(0);
  const images = p.images.nodes;
  const off =
    shown?.compareAtPrice &&
    Number(shown.compareAtPrice.amount) > Number(shown.price.amount)
      ? Math.round(
          (1 -
            Number(shown.price.amount) / Number(shown.compareAtPrice.amount)) *
            100,
        )
      : 0;

  return (
    <Section>
      <div className="grid gap-6 overflow-hidden rounded-[2px] bg-[#F7F8F7] md:grid-cols-2 md:gap-10">
        <div className="flex gap-2 p-3 md:p-4">
          {images.length > 1 && (
            <div className="hidden w-16 shrink-0 flex-col gap-2 sm:flex">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setImgIndex(i)}
                  aria-label={`Show photo ${i + 1}`}
                  className={`overflow-hidden rounded-[2px] border-2 ${i === imgIndex ? 'border-black' : 'border-transparent'}`}
                >
                  <Image
                    data={img}
                    aspectRatio="3/4"
                    sizes="64px"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          <Link
            to={`/products/${p.handle}`}
            prefetch="intent"
            className="block flex-1 overflow-hidden rounded-[2px] bg-white"
          >
            {images[imgIndex] && (
              <Image
                data={images[imgIndex]}
                alt={images[imgIndex].altText || p.title}
                aspectRatio="3/4"
                sizes="(min-width: 768px) 40vw, 90vw"
                srcSetOptions={IMAGE_SRCSET}
                className="h-full w-full object-cover"
              />
            )}
          </Link>
        </div>
        <div className="flex flex-col justify-center px-5 pb-6 md:px-0 md:pr-10 md:pb-0">
          {block.heading && (
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#FAA619]">
              {block.heading}
            </p>
          )}
          <p className="mt-2 text-[13px] font-bold uppercase tracking-wide">
            {p.vendor}
          </p>
          <h2 className="mt-1 text-[22px] font-bold leading-tight md:text-[28px]">
            <Link
              to={`/products/${p.handle}`}
              prefetch="intent"
              className="hover:underline"
            >
              {p.title}
            </Link>
          </h2>
          {shown && (
            <p className="mt-3 flex flex-wrap items-baseline gap-2">
              <span className="text-[22px] font-bold">
                <Money as="span" data={shown.price} withoutTrailingZeros />
              </span>
              {off > 0 && (
                <>
                  <s className="text-[15px] text-gray-500">
                    <Money
                      as="span"
                      data={shown.compareAtPrice}
                      withoutTrailingZeros
                    />
                  </s>
                  <span className="text-[15px] font-bold text-green-700">
                    {off}% off
                  </span>
                </>
              )}
            </p>
          )}
          {block.text && (
            <p className="mt-3 whitespace-pre-line text-[15px] text-gray-600">
              {block.text}
            </p>
          )}
          {sizeOption && (
            <fieldset className="mt-5">
              <legend className="mb-2 text-[13px] font-semibold">
                Select {sizeOption}
              </legend>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => {
                  const label =
                    v.selectedOptions.find((o) => o.name === sizeOption)
                      ?.value ?? v.title;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={!v.availableForSale}
                      onClick={() => setSelectedId(v.id)}
                      aria-pressed={v.id === selectedId}
                      className={`min-w-11 rounded-[2px] border px-3 py-2 text-[13px] font-semibold disabled:cursor-not-allowed disabled:text-gray-400 disabled:line-through ${v.id === selectedId ? 'border-black bg-black text-white' : 'border-gray-300 bg-white hover:border-black'}`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <AddToCartButton
              disabled={!selected || !selected.availableForSale}
              onClick={() => open('cart')}
              lines={
                selected
                  ? [
                      {
                        merchandiseId: selected.id,
                        quantity: 1,
                        // Lets the basket show the item instantly.
                        selectedVariant: {
                          ...selected,
                          image: selected.image ?? p.images?.nodes?.[0],
                          product: {
                            id: p.id,
                            handle: p.handle,
                            title: p.title,
                            vendor: p.vendor,
                          },
                        },
                      },
                    ]
                  : []
              }
              className="inline-flex h-12 items-center rounded-[2px] bg-[#FAA619] px-8 text-[14px] font-bold uppercase text-white hover:opacity-90 disabled:opacity-50"
            >
              {!p.availableForSale
                ? 'Sold out'
                : selected
                  ? 'Add to basket'
                  : `Select ${sizeOption?.toLowerCase() ?? 'an option'}`}
            </AddToCartButton>
            <Link
              to={`/products/${p.handle}`}
              prefetch="intent"
              className="inline-flex h-12 items-center rounded-[2px] border border-black px-6 text-[14px] font-semibold hover:bg-white"
            >
              View details
            </Link>
          </div>
        </div>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Email sign-up                                                       */
/* ------------------------------------------------------------------ */

export function NewsletterBlock({block}) {
  const fetcher = useFetcher();
  const formRef = useRef(null);
  const busy = fetcher.state !== 'idle';
  const result = fetcher.data;
  useEffect(() => {
    if (fetcher.state === 'idle' && result?.ok) formRef.current?.reset();
  }, [fetcher.state, result]);
  const id = `nl-${block.id.split('/').pop()}`;
  return (
    <section className="container-site mt-10 md:mt-14">
      <div className="flex flex-col items-center gap-4 rounded-[2px] bg-[#FFF4E0] px-6 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FAA619] text-white">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
          </svg>
        </span>
        <h2 className="text-[22px] font-bold md:text-[26px]">
          {block.heading || 'Get offers before everyone else'}
        </h2>
        <p className="max-w-lg text-[15px] text-gray-700">
          {block.text ||
            'New arrivals, members-only deals and sale alerts, straight to your inbox.'}
        </p>
        <fetcher.Form
          ref={formRef}
          method="post"
          action="/newsletter"
          className="mt-2 flex w-full max-w-md"
          noValidate
        >
          <label htmlFor={id} className="sr-only">
            Email address
          </label>
          <input
            id={id}
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="Your email address"
            className="h-12 min-w-0 flex-1 rounded-l-[2px] border border-r-0 border-gray-300 bg-white px-4 text-[14px] focus:border-black focus:outline-none"
          />
          <button
            type="submit"
            disabled={busy}
            className="h-12 shrink-0 rounded-r-[2px] bg-black px-6 text-[14px] font-bold uppercase text-white disabled:opacity-60"
          >
            {busy ? 'Signing up…' : 'Sign up'}
          </button>
        </fetcher.Form>
        <p
          role="status"
          className={`min-h-[1.25rem] text-[13px] ${result?.ok ? 'text-green-700' : 'text-red-600'}`}
        >
          {busy ? '' : result?.message}
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

export function FaqBlock({block}) {
  const faqs = parseLines(block.items).filter((x) => x.b);
  const jsonLd = useMemo(
    () =>
      JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.a,
          acceptedAnswer: {'@type': 'Answer', text: f.b},
        })),
      }).replace(/</g, '\\u003c'),
    [faqs],
  );
  return (
    <Section title={block.heading || 'Frequently asked questions'}>
      <div className="max-w-3xl divide-y divide-gray-200 border-y border-gray-200">
        {faqs.map((f) => (
          <details key={f.a} className="group py-1">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 text-[15px] font-semibold [&::-webkit-details-marker]:hidden">
              {f.a}
              <span
                aria-hidden="true"
                className="text-[20px] leading-none text-gray-500 transition group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="pb-4 text-[14px] leading-relaxed text-gray-600">
              {f.b}
            </p>
          </details>
        ))}
      </div>
      {/* Lets search engines show these as FAQ results. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: jsonLd}}
      />
    </Section>
  );
}

/* ------------------------------------------------------------------ */
/* Image with text                                                     */
/* ------------------------------------------------------------------ */

export function ImageText({block}) {
  return (
    <Section>
      <div className="grid items-center gap-6 md:grid-cols-2 md:gap-12">
        <div className="overflow-hidden rounded-[2px] bg-[#F7F8F7]">
          <Image
            data={block.image}
            alt={block.image.altText || block.heading || ''}
            sizes="(min-width: 768px) 50vw, 100vw"
            srcSetOptions={IMAGE_SRCSET}
            loading="lazy"
            className="h-auto w-full"
          />
        </div>
        <div>
          {block.heading && (
            <h2 className="text-[24px] font-bold leading-tight md:text-[32px]">
              {block.heading}
            </h2>
          )}
          {block.text && (
            <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-gray-600">
              {block.text}
            </p>
          )}
          <CtaLink
            to={block.link}
            className="mt-6 inline-flex h-11 items-center rounded-[2px] bg-black px-6 text-[14px] font-bold uppercase text-white hover:opacity-90"
          >
            Shop now
          </CtaLink>
        </div>
      </div>
    </Section>
  );
}
