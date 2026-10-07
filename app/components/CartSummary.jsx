import {useState} from 'react';
import {CartForm, Money} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {PDP_COUPONS} from '~/lib/site-config';
import {Icon} from '~/components/ui/Icon';

/**
 * Price details + coupon + checkout.
 *
 * Total MRP and "Discount on MRP" are calculated from each line's
 * compare-at price; "Coupon savings" is what Shopify's discount engine took
 * off. Checkout hands off to Shopify's hosted checkout (cart.checkoutUrl).
 *
 * @param {CartSummaryProps}
 */
export function CartSummary({cart, layout}) {
  const lines = cart?.lines?.nodes ?? [];
  const currency = cart?.cost?.subtotalAmount?.currencyCode ?? 'INR';
  const money = (amount) => ({
    amount: String(Math.max(0, amount)),
    currencyCode: currency,
  });

  let mrpTotal = 0;
  let sellTotal = 0;
  for (const line of lines) {
    const unit = Number(line.cost?.amountPerQuantity?.amount ?? 0);
    const mrp = Number(line.cost?.compareAtAmountPerQuantity?.amount ?? 0);
    mrpTotal += Math.max(unit, mrp) * line.quantity;
    sellTotal += unit * line.quantity;
  }
  const mrpDiscount = mrpTotal - sellTotal;
  const subtotal = Number(cart?.cost?.subtotalAmount?.amount ?? sellTotal);
  const total = Number(cart?.cost?.totalAmount?.amount ?? subtotal);
  const couponSavings = subtotal - total;
  const totalSavings = mrpDiscount + Math.max(0, couponSavings);
  const compact = layout === 'aside';

  if (compact) {
    return (
      <AsideSummary
        cart={cart}
        rows={{mrpTotal, mrpDiscount, couponSavings, totalSavings}}
        money={money}
      />
    );
  }

  return (
    <div
      aria-labelledby="cart-summary"
      className={compact ? 'space-y-3' : 'space-y-4'}
    >
      <CartCoupons discountCodes={cart?.discountCodes} compact={compact} />

      <section className="rounded border border-line p-4">
        <h2
          id="cart-summary"
          className="mb-3 text-xs font-bold uppercase tracking-wide"
        >
          Price details ({cart?.totalQuantity ?? 0}{' '}
          {cart?.totalQuantity === 1 ? 'item' : 'items'})
        </h2>
        <dl className="space-y-2 text-sm">
          <Row
            label="Total MRP"
            value={
              <Money as="span" data={money(mrpTotal)} withoutTrailingZeros />
            }
          />
          {mrpDiscount > 0 && (
            <Row
              label="Discount on MRP"
              value={
                <span className="text-success">
                  −{' '}
                  <Money
                    as="span"
                    data={money(mrpDiscount)}
                    withoutTrailingZeros
                  />
                </span>
              }
            />
          )}
          {couponSavings > 0.5 && (
            <Row
              label="Coupon savings"
              value={
                <span className="text-success">
                  −{' '}
                  <Money
                    as="span"
                    data={money(couponSavings)}
                    withoutTrailingZeros
                  />
                </span>
              }
            />
          )}
          <Row
            label="Delivery"
            value={<span className="text-success">FREE</span>}
          />
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
            <dt>Total</dt>
            <dd>
              {cart?.cost?.totalAmount ? (
                <Money
                  as="span"
                  data={cart.cost.totalAmount}
                  withoutTrailingZeros
                />
              ) : (
                '-'
              )}
            </dd>
          </div>
        </dl>
        <p className="mt-1 text-xs text-muted">Inclusive of all taxes</p>
        {totalSavings > 0 && (
          <p className="mt-3 rounded bg-success/10 px-3 py-2 text-xs font-semibold text-success">
            You save{' '}
            <Money as="span" data={money(totalSavings)} withoutTrailingZeros />{' '}
            on this order
          </p>
        )}
      </section>

      <CartCheckoutActions checkoutUrl={cart?.checkoutUrl} layout={layout} />
    </div>
  );
}

/**
 * Drawer version: three slim rows (coupon · total · buttons) so the item list
 * gets most of the height. The price breakdown opens from the Total row.
 */
function AsideSummary({cart, rows, money}) {
  const [showDetails, setShowDetails] = useState(false);
  const {mrpTotal, mrpDiscount, couponSavings, totalSavings} = rows;
  const count = cart?.totalQuantity ?? 0;
  return (
    <div aria-labelledby="cart-summary" className="space-y-2">
      <CartCoupons discountCodes={cart?.discountCodes} compact />

      <section className="rounded border border-line">
        <button
          type="button"
          onClick={() => setShowDetails((o) => !o)}
          aria-expanded={showDetails}
          aria-controls="cart-summary-details"
          className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left"
        >
          <span>
            <span id="cart-summary" className="block text-sm font-bold">
              Total{' '}
              {cart?.cost?.totalAmount ? (
                <Money
                  as="span"
                  data={cart.cost.totalAmount}
                  withoutTrailingZeros
                />
              ) : (
                '-'
              )}
            </span>
            <span className="block text-[11px] text-muted">
              {count} {count === 1 ? 'item' : 'items'} · Free delivery · Incl.
              taxes
              {totalSavings > 0 && (
                <span className="font-semibold text-success">
                  {' '}
                  · Save{' '}
                  <Money
                    as="span"
                    data={money(totalSavings)}
                    withoutTrailingZeros
                  />
                </span>
              )}
            </span>
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-muted">
            Details
            <Icon
              name="chevronDown"
              className={`h-3.5 w-3.5 transition ${showDetails ? 'rotate-180' : ''}`}
            />
          </span>
        </button>
        {showDetails && (
          <dl
            id="cart-summary-details"
            className="space-y-1.5 border-t border-line px-3 py-2 text-xs"
          >
            <Row
              label="Total MRP"
              value={
                <Money as="span" data={money(mrpTotal)} withoutTrailingZeros />
              }
            />
            {mrpDiscount > 0 && (
              <Row
                label="Discount on MRP"
                value={
                  <span className="text-success">
                    −{' '}
                    <Money
                      as="span"
                      data={money(mrpDiscount)}
                      withoutTrailingZeros
                    />
                  </span>
                }
              />
            )}
            {couponSavings > 0.5 && (
              <Row
                label="Coupon savings"
                value={
                  <span className="text-success">
                    −{' '}
                    <Money
                      as="span"
                      data={money(couponSavings)}
                      withoutTrailingZeros
                    />
                  </span>
                }
              />
            )}
            <Row
              label="Delivery"
              value={<span className="text-success">FREE</span>}
            />
          </dl>
        )}
      </section>

      {cart?.checkoutUrl && (
        <div className="grid grid-cols-[2fr_3fr] gap-2">
          <Link
            to="/cart"
            className="flex h-11 items-center justify-center rounded border border-ink text-sm font-semibold hover:bg-surface"
          >
            View Basket
          </Link>
          <a
            href={cart.checkoutUrl}
            target="_self"
            className="flex h-11 items-center justify-center gap-1.5 rounded bg-ink text-sm font-bold uppercase tracking-wide text-white hover:bg-black"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            Checkout
          </a>
        </div>
      )}
    </div>
  );
}

function Row({label, value}) {
  return (
    <div className="flex justify-between">
      <dt className="text-muted">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/**
 * @param {{checkoutUrl?: string; layout: CartLayout}}
 */
function CartCheckoutActions({checkoutUrl, layout}) {
  if (!checkoutUrl) return null;
  return (
    <div className="space-y-2">
      <a
        href={checkoutUrl}
        target="_self"
        className="block w-full rounded bg-ink py-3.5 text-center text-sm font-bold uppercase tracking-wide text-white hover:bg-black"
      >
        Proceed to Checkout
      </a>
      {layout === 'aside' && (
        <Link
          to="/cart"
          className="block w-full rounded border border-ink py-3 text-center text-sm font-semibold hover:bg-surface"
        >
          View Basket
        </Link>
      )}
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        100% secure checkout by Shopify
      </p>
    </div>
  );
}

/**
 * Coupon box: shows applied codes with remove, a code input, and the
 * available coupons from site-config as tap-to-apply chips.
 *
 * @param {{discountCodes?: CartApiQueryFragment['discountCodes']; compact?: boolean}}
 */
function CartCoupons({discountCodes, compact}) {
  const [open, setOpen] = useState(!compact);
  const applied =
    discountCodes?.filter((d) => d.applicable).map((d) => d.code) ?? [];
  const rejected =
    discountCodes?.filter((d) => !d.applicable).map((d) => d.code) ?? [];

  return (
    <section
      className={`rounded border border-line ${compact ? 'px-3 py-2' : 'p-4'}`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`flex w-full items-center justify-between font-semibold ${compact ? 'text-xs' : 'text-sm'}`}
      >
        <span className="flex items-center gap-2">
          <Icon name="tag" className="h-4 w-4 text-brand" />
          {compact && applied.length > 0 && !open ? (
            <span className="text-success">{applied.join(', ')} applied</span>
          ) : (
            'Apply coupon'
          )}
        </span>
        <Icon
          name="chevronDown"
          className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {applied.length > 0 && (!compact || open) && (
        <ul className={`${compact ? 'mt-2' : 'mt-3'} space-y-2`}>
          {applied.map((code) => (
            <li
              key={code}
              className="flex items-center justify-between rounded bg-success/10 px-3 py-2 text-xs"
            >
              <span className="font-bold text-success">{code} applied</span>
              <UpdateDiscountForm
                discountCodes={applied.filter((c) => c !== code)}
              >
                <button
                  type="submit"
                  className="font-semibold text-muted underline"
                >
                  Remove
                </button>
              </UpdateDiscountForm>
            </li>
          ))}
        </ul>
      )}
      {rejected.length > 0 && (
        <p className="mt-2 text-xs text-danger">
          {rejected.join(', ')} can&apos;t be applied to this basket.
        </p>
      )}

      {open && (
        <div className="mt-3 space-y-3">
          <UpdateDiscountForm discountCodes={applied}>
            <div className="flex gap-2">
              <label htmlFor="discount-code-input" className="sr-only">
                Coupon code
              </label>
              <input
                id="discount-code-input"
                type="text"
                name="discountCode"
                placeholder="Enter coupon code"
                autoComplete="off"
                className="min-w-0 flex-1 rounded border border-line px-3 py-2 text-sm uppercase"
              />
              <button
                type="submit"
                className="rounded border border-ink px-4 text-sm font-semibold"
              >
                Apply
              </button>
            </div>
          </UpdateDiscountForm>
          <ul className="space-y-2">
            {PDP_COUPONS.filter((c) => !applied.includes(c.code)).map((c) => (
              <li
                key={c.code}
                className="flex items-center justify-between gap-2 rounded bg-surface px-3 py-2 text-xs"
              >
                <span>
                  <code className="font-bold text-ink">{c.code}</code>
                  <span className="ml-2 text-muted">{c.text}</span>
                </span>
                <UpdateDiscountForm discountCodes={[...applied, c.code]}>
                  <button type="submit" className="font-semibold text-brand">
                    Apply
                  </button>
                </UpdateDiscountForm>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/**
 * @param {{discountCodes?: string[]; children: React.ReactNode}}
 */
function UpdateDiscountForm({discountCodes, children}) {
  return (
    <CartForm
      route="/cart"
      action={CartForm.ACTIONS.DiscountCodesUpdate}
      inputs={{discountCodes: discountCodes || []}}
    >
      {children}
    </CartForm>
  );
}

/**
 * @typedef {{
 *   cart: OptimisticCart<CartApiQueryFragment | null>;
 *   layout: CartLayout;
 * }} CartSummaryProps
 */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('~/components/CartMain').CartLayout} CartLayout */
/** @typedef {import('@shopify/hydrogen').OptimisticCart} OptimisticCart */
