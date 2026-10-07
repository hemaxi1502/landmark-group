import {CartForm, Image, Money} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {useVariantUrl} from '~/lib/variants';
import {useAside} from '~/components/Aside';
import {useLocalProductList} from '~/lib/local-list';
import {discountPercent} from '~/lib/product-card';
import {Icon} from '~/components/ui/Icon';
import {IMAGE_SRCSET} from '~/lib/image';

/**
 * One basket line: image, brand, title, size/colour, price + MRP + % off,
 * quantity stepper, remove, and "Move to Favourites".
 * Bundle children (childrenMap) render as an indented list under the parent.
 *
 * @param {{
 *   layout: 'page' | 'aside';
 *   line: CartLine;
 *   childrenMap: Record<string, Array<CartLine>>;
 * }}
 */
export function CartLineItem({layout, line, childrenMap}) {
  const {id, merchandise, cost, isOptimistic} = line;
  const {product, title, image, selectedOptions} = merchandise;
  const lineItemUrl = useVariantUrl(product.handle, selectedOptions);
  const {close} = useAside();
  const wishlist = useLocalProductList('wishlist');
  const lineItemChildren = childrenMap[id];
  const unit = cost?.amountPerQuantity;
  const mrp = cost?.compareAtAmountPerQuantity;
  const off = discountPercent(unit?.amount, mrp?.amount);
  const options = selectedOptions.filter((o) => o.value !== 'Default Title');
  const compact = layout === 'aside';

  return (
    <li
      className={`border-b border-line last:border-b-0 ${compact ? 'py-2' : 'py-4'}`}
    >
      <div className="flex gap-3 md:gap-4">
        <Link
          to={lineItemUrl}
          prefetch="intent"
          onClick={() => layout === 'aside' && close()}
          className={`shrink-0 overflow-hidden rounded bg-surface ${compact ? 'h-20 w-15' : 'h-36 w-27 md:h-44 md:w-33'}`}
        >
          {image && (
            <Image
              srcSetOptions={IMAGE_SRCSET}
              alt={title}
              aspectRatio="3/4"
              data={image}
              loading="lazy"
              sizes="132px"
              className="h-full w-full object-cover"
            />
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-xs font-semibold uppercase tracking-wide">
            {product.vendor}
          </p>
          <Link
            to={lineItemUrl}
            prefetch="intent"
            onClick={() => layout === 'aside' && close()}
            className={`text-muted hover:text-ink ${compact ? 'truncate text-xs' : 'line-clamp-2 text-sm'}`}
          >
            {product.title}
          </Link>

          {options.length > 0 && !compact && (
            <p className="mt-1 text-xs text-muted">
              {options.map((o) => `${o.name}: ${o.value}`).join(' · ')}
            </p>
          )}

          <div
            className={`flex flex-wrap items-baseline gap-x-2 text-sm ${compact ? 'mt-0.5' : 'mt-1.5'}`}
          >
            {/* Drawer: size sits on the price line to save a row. */}
            {compact && options.length > 0 && (
              <span className="text-xs text-muted">
                {options.map((o) => `${o.name}: ${o.value}`).join(' · ')}
                <span aria-hidden="true"> ·</span>
              </span>
            )}
            {unit && (
              <span className="font-semibold">
                <Money as="span" data={unit} withoutTrailingZeros />
              </span>
            )}
            {off && mrp && (
              <>
                <s className="text-xs text-muted">
                  <Money as="span" data={mrp} withoutTrailingZeros />
                </s>
                <span className="text-xs font-semibold text-success">
                  {off}% off
                </span>
              </>
            )}
          </div>

          <div
            className={`mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 ${compact ? 'pt-1' : 'pt-3'}`}
          >
            <CartLineQuantity line={line} compact={compact} />
            <CartLineRemoveButton lineIds={[id]} disabled={!!isOptimistic} />
            {!compact && (
              <CartForm
                fetcherKey={`move-${id}`}
                route="/cart"
                action={CartForm.ACTIONS.LinesRemove}
                inputs={{lineIds: [id]}}
              >
                <button
                  type="submit"
                  disabled={!!isOptimistic}
                  onClick={() =>
                    wishlist.add({
                      handle: product.handle,
                      title: product.title,
                      vendor: product.vendor,
                      image: image?.url,
                      price: unit,
                    })
                  }
                  className="flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink"
                >
                  <Icon name="heart" className="h-3.5 w-3.5" /> Move to
                  Favourites
                </button>
              </CartForm>
            )}
          </div>
        </div>

        {!compact && cost?.totalAmount && (
          <p className="hidden shrink-0 text-sm font-semibold md:block">
            <Money as="span" data={cost.totalAmount} withoutTrailingZeros />
          </p>
        )}
      </div>

      {lineItemChildren ? (
        <div className="mt-3 pl-8">
          <p className="mb-1 text-xs text-muted">Includes</p>
          <ul>
            {lineItemChildren.map((childLine) => (
              <CartLineItem
                childrenMap={childrenMap}
                key={childLine.id}
                line={childLine}
                layout={layout}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

/**
 * Quantity stepper. Buttons are disabled while an optimistic update is pending.
 * @param {{line: CartLine}}
 */
function CartLineQuantity({line, compact}) {
  if (!line || typeof line?.quantity === 'undefined') return null;
  const {id: lineId, quantity, isOptimistic} = line;
  const prevQuantity = Number(Math.max(0, quantity - 1).toFixed(0));
  const nextQuantity = Number((quantity + 1).toFixed(0));

  return (
    <div className="flex items-center rounded border border-line">
      <CartLineUpdateButton lines={[{id: lineId, quantity: prevQuantity}]}>
        <button
          aria-label="Decrease quantity"
          disabled={quantity <= 1 || !!isOptimistic}
          name="decrease-quantity"
          value={prevQuantity}
          className={`flex items-center justify-center disabled:opacity-30 ${compact ? 'h-7 w-7' : 'h-8 w-8'}`}
        >
          <Icon name="minus" className="h-3.5 w-3.5" />
        </button>
      </CartLineUpdateButton>
      <span className="w-7 text-center text-sm" aria-live="polite">
        {quantity}
      </span>
      <CartLineUpdateButton lines={[{id: lineId, quantity: nextQuantity}]}>
        <button
          aria-label="Increase quantity"
          name="increase-quantity"
          value={nextQuantity}
          disabled={!!isOptimistic}
          className={`flex items-center justify-center disabled:opacity-30 ${compact ? 'h-7 w-7' : 'h-8 w-8'}`}
        >
          <Icon name="plus" className="h-3.5 w-3.5" />
        </button>
      </CartLineUpdateButton>
    </div>
  );
}

/**
 * @param {{lineIds: string[]; disabled: boolean}}
 */
function CartLineRemoveButton({lineIds, disabled}) {
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesRemove}
      inputs={{lineIds}}
    >
      <button
        disabled={disabled}
        type="submit"
        className="text-xs font-semibold text-muted underline hover:text-danger"
      >
        Remove
      </button>
    </CartForm>
  );
}

/**
 * @param {{children: React.ReactNode; lines: CartLineUpdateInput[]}}
 */
function CartLineUpdateButton({children, lines}) {
  const lineIds = lines.map((line) => line.id);
  return (
    <CartForm
      fetcherKey={getUpdateKey(lineIds)}
      route="/cart"
      action={CartForm.ACTIONS.LinesUpdate}
      inputs={{lines}}
    >
      {children}
    </CartForm>
  );
}

/**
 * Shared fetcher key so all updates to one line queue in order.
 * @param {string[]} lineIds
 */
function getUpdateKey(lineIds) {
  return [CartForm.ACTIONS.LinesUpdate, ...lineIds].join('-');
}

/** @typedef {OptimisticCartLine<CartApiQueryFragment>} CartLine */
/** @typedef {import('@shopify/hydrogen/storefront-api-types').CartLineUpdateInput} CartLineUpdateInput */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} OptimisticCartLine */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
