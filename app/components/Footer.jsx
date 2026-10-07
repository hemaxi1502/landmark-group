import {Suspense, useEffect, useRef, useState} from 'react';
import {Await, Link, useFetcher} from 'react-router';
import {menuItemUrl} from '~/lib/menu';
import {
  FaApple,
  FaFacebookF,
  FaGooglePlay,
  FaInstagram,
  FaXTwitter,
} from 'react-icons/fa6';
import {FOOTER_CONFIG} from '~/lib/site-config';

/**
 * Footer, laid out like lifestylestores.com:
 *   1. Subscribe form + app badges
 *   2. Link grid (5 columns × 2 rows) from the footer-* / more / help menus
 *   3. Contact row (footer_main → footer_contacts metaobjects) + socials
 *   4. Logo, copyright and legal links (footer_main → footer_copyright)
 */
const COLUMNS = [
  ['women', 'Women'],
  ['men', 'Men'],
  ['kids', 'Kids'],
  ['beauty', 'Beauty'],
  ['footwear', 'Footwear'],
  ['bags', 'Bags'],
  ['homeLiving', 'Home & Living'],
  ['babyshop', 'Babyshop'],
  ['more', 'More'],
  ['help', 'Help'],
];

export function Footer({footer, publicStoreDomain, primaryDomainUrl}) {
  return (
    <Suspense>
      <Await resolve={footer}>
        {(data) =>
          data ? (
            <FooterContent
              data={data}
              publicStoreDomain={publicStoreDomain}
              primaryDomainUrl={primaryDomainUrl}
            />
          ) : null
        }
      </Await>
    </Suspense>
  );
}

function FooterContent({data, publicStoreDomain, primaryDomainUrl}) {
  const columns = COLUMNS.map(([key, title]) => ({
    key,
    title,
    items: data[key]?.items ?? [],
  })).filter((c) => c.items.length);

  const contacts = bySort(data.footerMain?.contacts?.references?.nodes);
  const copyright = data.footerMain?.copyright?.reference;
  const logo =
    copyright?.logo?.reference?.image ??
    data.headerLogo?.nodes?.[0]?.logo?.reference?.image;
  const legalLinks = bySort(copyright?.links?.references?.nodes).map((l) => ({
    id: l.id,
    text: l.text?.value,
    href: legalHref(l.handle, data.shop),
  }));

  return (
    <footer className="mt-16 border-t border-line bg-white text-ink">
      <div className="container-site">
        <TopRow />
        <hr className="border-line" />

        <nav
          aria-label="Footer"
          className="grid grid-cols-1 py-4 md:grid-cols-3 md:gap-x-8 md:gap-y-10 md:py-12 lg:grid-cols-5"
        >
          {columns.map((col) => (
            <FooterColumn
              key={col.key}
              column={col}
              toUrl={(url) =>
                menuItemUrl(url, publicStoreDomain, primaryDomainUrl)
              }
            />
          ))}
        </nav>
        <hr className="border-line" />

        <div className="flex flex-col gap-6 py-8 lg:flex-row lg:items-center lg:justify-between">
          <ul className="flex flex-col gap-6 sm:flex-row sm:flex-wrap sm:gap-x-12">
            {contacts.map((c) => (
              <ContactItem key={c.id} contact={c} />
            ))}
          </ul>
          <ul className="flex items-center gap-3" aria-label="Follow us">
            {FOOTER_CONFIG.socials.map((s) => (
              <li key={s.icon}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                  className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:text-[#FAA619]"
                >
                  <SocialIcon name={s.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <hr className="border-line" />

        <div className="flex flex-col gap-3 py-6 text-[13px] text-[#6B6B6B] md:flex-row md:items-center md:gap-8">
          {logo && (
            <Link to="/" aria-label="Home" className="shrink-0">
              <img
                src={logo.url}
                alt={logo.altText || data.shop.name}
                width={logo.width}
                height={logo.height}
                className="h-8 w-auto rounded-none"
                loading="lazy"
              />
            </Link>
          )}
          <p>
            {copyright?.text?.value ??
              `© ${new Date().getFullYear()} ${data.shop.name}.`}
          </p>
          {legalLinks.length > 0 && (
            <p>
              {legalLinks.map((l, i) => (
                <span key={l.id}>
                  {i > 0 && ' - '}
                  {l.href ? (
                    <Link to={l.href} className="hover:text-ink">
                      {l.text}
                    </Link>
                  ) : (
                    l.text
                  )}
                </span>
              ))}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}

function TopRow() {
  const {subscribe, apps} = FOOTER_CONFIG;
  return (
    <div className="flex flex-col gap-10 py-10 lg:flex-row lg:items-end lg:justify-between">
      <div className="w-full max-w-[560px]">
        <h2 className="text-[18px] font-bold">{subscribe.heading}</h2>
        <p className="mt-1 text-[14px] text-[#6B6B6B]">{subscribe.text}</p>
        <SubscribeForm />
      </div>
      <div>
        <h2 className="text-[18px] font-bold">{apps.heading}</h2>
        <p className="mt-1 text-[14px] text-[#6B6B6B]">{apps.text}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <StoreBadge href={apps.appStore} kind="apple" />
          <StoreBadge href={apps.googlePlay} kind="google" />
        </div>
      </div>
    </div>
  );
}

function SubscribeForm() {
  const fetcher = useFetcher({key: 'newsletter'});
  const formRef = useRef(null);
  const busy = fetcher.state !== 'idle';
  const result = fetcher.data;

  useEffect(() => {
    if (fetcher.state === 'idle' && result?.ok) formRef.current?.reset();
  }, [fetcher.state, result]);

  return (
    <fetcher.Form
      ref={formRef}
      method="post"
      action="/newsletter"
      className="mt-4"
      noValidate
    >
      <div className="flex">
        <label htmlFor="footer-email" className="sr-only">
          Email address
        </label>
        <input
          id="footer-email"
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder={FOOTER_CONFIG.subscribe.placeholder}
          aria-describedby="footer-email-status"
          className="h-12 min-w-0 flex-1 rounded-none border-0 bg-[#F2F2F2] px-4 text-[14px] text-ink placeholder:text-[#8A8A8A] focus:ring-1 focus:ring-ink focus:outline-none"
        />
        <button
          type="submit"
          disabled={busy}
          className="h-12 shrink-0 bg-black px-8 text-[14px] font-semibold text-white transition-opacity hover:opacity-85 disabled:opacity-60"
        >
          {busy ? 'Subscribing…' : FOOTER_CONFIG.subscribe.button}
        </button>
      </div>
      <p
        id="footer-email-status"
        role="status"
        className={`mt-2 min-h-[1.25rem] text-[13px] ${result?.ok ? 'text-green-700' : 'text-red-600'}`}
      >
        {busy ? '' : result?.message}
      </p>
    </fetcher.Form>
  );
}

function FooterColumn({column, toUrl}) {
  const [open, setOpen] = useState(false);
  const listId = `footer-col-${column.key}`;
  return (
    <div className="border-b border-line last:border-b-0 md:border-0">
      <h3 className="text-[16px] font-bold">
        {/* Accordion on mobile; always open from md up. */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between py-4 text-left md:hidden"
        >
          {column.title}
          <span aria-hidden="true" className="text-xl leading-none">
            {open ? '−' : '+'}
          </span>
        </button>
        <span className="hidden md:block">{column.title}</span>
      </h3>
      <ul
        id={listId}
        className={`${open ? 'block' : 'hidden'} pb-4 md:mt-3 md:block md:pb-0`}
      >
        {column.items.map((item) => {
          const url = toUrl(item.url);
          const cls = 'block py-[7px] text-[14px] text-[#6B6B6B]';
          return (
            <li key={item.id}>
              {url && /^https?:\/\//.test(url) ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${cls} hover:text-ink`}
                >
                  {item.title}
                </a>
              ) : url ? (
                <Link
                  to={url}
                  prefetch="intent"
                  className={`${cls} hover:text-ink`}
                >
                  {item.title}
                </Link>
              ) : (
                <span className={cls}>{item.title}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function ContactItem({contact}) {
  const value = contact.contact?.value ?? '';
  const kind = /@/.test(value)
    ? 'mail'
    : /^[\d\s+()-]+$/.test(value)
      ? 'phone'
      : 'help';
  const href =
    kind === 'mail'
      ? `mailto:${value}`
      : kind === 'phone'
        ? `tel:${value.replace(/[^\d+]/g, '')}`
        : /^https?:\/\//.test(value)
          ? value
          : FOOTER_CONFIG.helpCentreUrl || `https://${value}`;
  return (
    <li>
      <a
        href={href}
        {...(kind === 'help' && {target: '_blank', rel: 'noopener noreferrer'})}
        className="group flex items-center gap-3"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink">
          <ContactIcon kind={kind} />
        </span>
        <span className="flex flex-col">
          <span className="text-[13px] text-[#6B6B6B]">
            {contact.name?.value}
          </span>
          <span className="text-[15px] font-semibold group-hover:text-[#FAA619]">
            {value}
          </span>
        </span>
      </a>
    </li>
  );
}

function StoreBadge({href, kind}) {
  const apple = kind === 'apple';
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-11 items-center gap-2 rounded-md bg-black px-3 text-white transition-opacity hover:opacity-85"
      aria-label={apple ? 'Download on the App Store' : 'Get it on Google Play'}
    >
      {apple ? (
        <FaApple className="h-6 w-6" aria-hidden="true" />
      ) : (
        <FaGooglePlay className="h-5 w-5" aria-hidden="true" />
      )}
      <span className="flex flex-col leading-none">
        <span className="text-[9px] uppercase tracking-wide">
          {apple ? 'Download on the' : 'Get it on'}
        </span>
        <span className="mt-0.5 text-[16px] font-semibold">
          {apple ? 'App Store' : 'Google Play'}
        </span>
      </span>
    </a>
  );
}

function ContactIcon({kind}) {
  const common = {
    viewBox: '0 0 24 24',
    className: 'h-5 w-5',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.6,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };
  if (kind === 'phone')
    return (
      <svg {...common}>
        <path d="M5 4h3l1.5 4-2 1.2a11 11 0 0 0 5.3 5.3L14 12.5l4 1.5v3a2 2 0 0 1-2 2A13 13 0 0 1 3 6a2 2 0 0 1 2-2z" />
      </svg>
    );
  if (kind === 'mail')
    return (
      <svg {...common}>
        <rect x="3" y="5" width="18" height="14" rx="1.5" />
        <path d="m3.5 6 8.5 7 8.5-7" />
      </svg>
    );
  return (
    <svg {...common}>
      <path d="M9.2 9a2.9 2.9 0 0 1 5.6 1c0 2-2.8 2.5-2.8 4" />
      <circle cx="12" cy="17.5" r=".6" fill="currentColor" />
    </svg>
  );
}

const SOCIAL_ICONS = {
  facebook: FaFacebookF,
  x: FaXTwitter,
  instagram: FaInstagram,
};

function SocialIcon({name}) {
  const Icon = SOCIAL_ICONS[name];
  return Icon ? <Icon className="h-5 w-5" aria-hidden="true" /> : null;
}

/**
 * "terms-conditions" / "privacy-policy" entries → the shop policy when it is
 * set in Settings → Policies, else the matching Shopify page.
 */
function legalHref(handle = '', shop) {
  const pick = (policy, page) => (policy ? `/policies/${policy.handle}` : page);
  if (/terms/.test(handle))
    return pick(shop.termsOfService, '/pages/terms-and-conditions');
  if (/privacy/.test(handle)) return pick(shop.privacyPolicy, null);
  if (/refund|return/.test(handle))
    return pick(shop.refundPolicy, '/pages/returns');
  if (/shipping/.test(handle))
    return pick(shop.shippingPolicy, '/pages/shipping');
  return null;
}

function bySort(nodes = []) {
  return [...(nodes ?? [])].sort(
    (a, b) => Number(a.sortOrder?.value ?? 0) - Number(b.sortOrder?.value ?? 0),
  );
}
