import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {discountPercent, parseRating} from '~/lib/product-card';
import {NEW_BADGE_DAYS} from '~/lib/site-config';
import {useLocalProductList} from '~/lib/local-list';
import {Icon} from '~/components/ui/Icon';
/**
 * PLP · Product Card — image (second image on hover), badges, brand, name,
 * price, MRP strike-through, discount %, rating, wishlist heart.
 */
export function ProductCard({product, loading = 'lazy'}) {
  const [primary, secondary] = product.images.nodes;
  const price = product.priceRange.minVariantPrice;
  const compareAt = product.compareAtPriceRange.minVariantPrice;
  const off = discountPercent(price.amount, compareAt.amount);
  const rating = parseRating(product.rating?.value);
  const ratingCount = Number(product.ratingCount?.value ?? 0);
  const isNew =
    !!product.publishedAt &&
    Date.now() - new Date(product.publishedAt).getTime() <
      NEW_BADGE_DAYS * 864e5;
  const url = `/products/${product.handle}`;
  return (
    <article className="group relative">
      <Link to={url} prefetch="intent" className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded bg-surface">
          {primary && (
            <Image
              data={primary}
              alt={primary.altText || product.title}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              loading={loading}
              className="absolute inset-0 h-full w-full object-cover transition duration-300"
            />
          )}
          {secondary && (
            <Image
              data={secondary}
              alt=""
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition duration-300 group-hover:opacity-100"
            />
          )}
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
            {!product.availableForSale && <Badge tone="dark">Sold out</Badge>}
            {isNew && product.availableForSale && (
              <Badge tone="light">New</Badge>
            )}
          </div>
        </div>

        <div className="mt-2 space-y-0.5 pr-8">
          <p className="truncate text-xs font-semibold tracking-wide uppercase">
            {product.vendor}
          </p>
          <h3 className="truncate text-sm text-muted">{product.title}</h3>
          <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
            <span className="font-semibold">
              <Money as="span" data={price} withoutTrailingZeros />
            </span>
            {off && (
              <>
                <s className="text-xs text-muted">
                  <Money as="span" data={compareAt} withoutTrailingZeros />
                </s>
                <span className="text-xs font-semibold text-success">
                  {off}% off
                </span>
              </>
            )}
          </div>
          {rating !== undefined && (
            <p className="flex items-center gap-1 text-xs">
              <span className="inline-flex items-center gap-0.5 rounded bg-success px-1 py-0.5 text-white">
                {rating.toFixed(1)}
                <Icon name="star" filled className="h-3 w-3" />
              </span>
              {ratingCount > 0 && (
                <span className="text-muted">({ratingCount})</span>
              )}
            </p>
          )}
        </div>
      </Link>

      <WishlistButton product={product} />
    </article>
  );
}
function Badge({children, tone}) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${tone === 'dark' ? 'bg-ink text-white' : 'bg-white text-ink'}`}
    >
      {children}
    </span>
  );
}
function WishlistButton({product}) {
  const {has, toggle} = useLocalProductList('wishlist');
  const saved = has(product.handle);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? 'Remove from favourites' : 'Add to favourites'}
      onClick={() =>
        toggle({
          handle: product.handle,
          title: product.title,
          vendor: product.vendor,
          image: product.images.nodes[0]?.url,
          price: product.priceRange.minVariantPrice,
        })
      }
      className="absolute right-0 bottom-9 p-1.5"
    >
      <Icon
        name="heart"
        filled={saved}
        className={`h-5 w-5 ${saved ? 'text-brand' : ''}`}
      />
    </button>
  );
}
