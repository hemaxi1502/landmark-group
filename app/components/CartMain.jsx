import {useOptimisticCart} from '@shopify/hydrogen';
import {Link} from 'react-router';
import {useAside} from '~/components/Aside';
import {CartLineItem} from '~/components/CartLineItem';
import {CartSummary} from './CartSummary';
import {Icon} from '~/components/ui/Icon';

/**
 * Builds a map of parent line id → child lines (product bundles).
 * @param {CartLine[]} lines
 */
function getLineItemChildrenMap(lines) {
  const children = {};
  for (const line of lines) {
    if ('parentRelationship' in line && line.parentRelationship?.parent) {
      const parentId = line.parentRelationship.parent.id;
      if (!children[parentId]) children[parentId] = [];
      children[parentId].push(line);
    }
    if ('lineComponents' in line) {
      const lineChildren = getLineItemChildrenMap(line.lineComponents);
      for (const [parentId, childIds] of Object.entries(lineChildren)) {
        if (!children[parentId]) children[parentId] = [];
        children[parentId].push(...childIds);
      }
    }
  }
  return children;
}

/**
 * Basket contents, used by both the slide-out drawer (layout="aside") and
 * the /cart page (layout="page").
 *
 * @param {CartMainProps}
 */
export function CartMain({layout, cart: originalCart}) {
  // Applies pending add/update/remove actions immediately for instant feedback.
  const cart = useOptimisticCart(originalCart);
  const lines = cart?.lines?.nodes ?? [];
  const cartHasItems = cart?.totalQuantity ? cart.totalQuantity > 0 : false;
  const childrenMap = getLineItemChildrenMap(lines);

  if (!cartHasItems) return <CartEmpty layout={layout} />;

  const lineList = (
    <ul aria-label="Items in your basket">
      {lines.map((line) => {
        // child lines render under their parent
        if ('parentRelationship' in line && line.parentRelationship?.parent)
          return null;
        return (
          <CartLineItem
            key={line.id}
            line={line}
            layout={layout}
            childrenMap={childrenMap}
          />
        );
      })}
    </ul>
  );

  if (layout === 'aside') {
    return (
      // Only the item list scrolls; the totals and Checkout stay pinned at the bottom.
      <section
        aria-label="Basket drawer"
        className="flex h-full min-h-0 flex-col"
      >
        <FreeShippingNote />
        <div className="min-h-[120px] flex-1 overflow-y-auto overscroll-contain px-1">
          {lineList}
        </div>
        <div className="max-h-[65%] shrink-0 overflow-y-auto border-t border-line bg-white pt-3">
          <CartSummary cart={cart} layout="aside" />
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Basket"
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]"
    >
      <div className="min-w-0">
        <FreeShippingNote />
        <div className="rounded border border-line px-4">{lineList}</div>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-muted hover:text-ink"
        >
          <Icon name="chevronLeft" className="h-4 w-4" /> Continue shopping
        </Link>
      </div>
      <div className="lg:sticky lg:top-40 lg:self-start">
        <CartSummary cart={cart} layout="page" />
      </div>
    </section>
  );
}

function FreeShippingNote() {
  return (
    <p className="mb-3 flex items-center gap-2 rounded bg-surface px-3 py-2 text-xs">
      <Icon name="truck" className="h-4 w-4 shrink-0 text-brand" />
      <span>
        <strong>Free shipping</strong> on this order · Easy 7-day returns
      </span>
    </p>
  );
}

/**
 * @param {{layout?: CartMainProps['layout']}}
 */
function CartEmpty({layout}) {
  const {close} = useAside();
  return (
    <div className="flex flex-col items-center px-4 py-12 text-center">
      <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-surface">
        <Icon name="bag" className="h-9 w-9 text-muted" />
      </div>
      <h2 className="text-lg font-semibold">Your basket is empty</h2>
      <p className="mt-1 max-w-xs text-sm text-muted">
        Looks like you haven&rsquo;t added anything yet. Explore our latest
        arrivals.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {['women', 'men', 'kids'].map((h) => (
          <Link
            key={h}
            to={`/collections/${h}`}
            onClick={close}
            prefetch="viewport"
            className="rounded border border-ink px-5 py-2 text-sm font-semibold capitalize hover:bg-ink hover:text-white"
          >
            Shop {h}
          </Link>
        ))}
      </div>
      {layout === 'page' && (
        <Link to="/wishlist" className="mt-4 text-sm font-semibold text-brand">
          View your Favourites
        </Link>
      )}
    </div>
  );
}

/** @typedef {'page' | 'aside'} CartLayout */
/**
 * @typedef {{
 *   cart: CartApiQueryFragment | null;
 *   layout: CartLayout;
 * }} CartMainProps
 */
/** @typedef {import('storefrontapi.generated').CartApiQueryFragment} CartApiQueryFragment */
/** @typedef {import('@shopify/hydrogen').OptimisticCartLine} CartLine */
