import {Suspense, useEffect} from 'react';
import {Await, Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {Carousel} from '~/components/ui/Carousel';
import {ProductCard} from '~/components/plp/ProductCard';
import {useLocalProductList} from '~/lib/local-list';
import {withWidth} from '~/components/home/parts';
/**
 * PDP · Similar Products / You May Also Like.
 * Uses Shopify's productRecommendations (RELATED / COMPLEMENTARY intents).
 * COMPLEMENTARY needs products set up in the Search & Discovery app; when
 * it's empty the carousel simply doesn't render.
 */
export function RecommendationCarousel({title, products}) {
  return (
    <Suspense fallback={<CarouselSkeleton title={title} />}>
      <Await resolve={products} errorElement={null}>
        {(items) =>
          items?.length ? (
            <section className="mt-14" aria-label={title}>
              <h2 className="mb-4 text-lg font-semibold">{title}</h2>
              <Carousel
                itemClassName="basis-[45%] md:basis-1/4 lg:basis-1/5"
                ariaLabel={title}
              >
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </Carousel>
            </section>
          ) : null
        }
      </Await>
    </Suspense>
  );
}
function CarouselSkeleton({title}) {
  return (
    <section className="mt-14" aria-hidden="true">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      <div className="flex gap-4 overflow-hidden">
        {Array.from({length: 5}).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] basis-[45%] shrink-0 animate-pulse rounded bg-surface md:basis-1/5"
          />
        ))}
      </div>
    </section>
  );
}
/**
 * PDP · Recently Viewed — records the current product in localStorage and
 * shows the shopper's other recently viewed products.
 */
export function RecentlyViewed({current}) {
  const {items, add} = useLocalProductList('recently-viewed', 12);
  useEffect(() => {
    add(current);
    // record once per product page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.handle]);
  const others = items.filter((i) => i.handle !== current.handle);
  if (!others.length) return null;
  return (
    <section className="mt-14" aria-label="Recently viewed">
      <h2 className="mb-4 text-lg font-semibold">Recently Viewed</h2>
      <Carousel
        itemClassName="basis-[40%] md:basis-1/5 lg:basis-1/6"
        ariaLabel="Recently viewed"
      >
        {others.map((p) => (
          <Link
            key={p.handle}
            to={`/products/${p.handle}`}
            prefetch="intent"
            className="block"
          >
            <div className="aspect-[3/4] overflow-hidden rounded bg-surface">
              {p.image && (
                <img
                  src={withWidth(p.image, 400)}
                  alt={p.title}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <p className="mt-2 truncate text-xs font-semibold uppercase">
              {p.vendor}
            </p>
            <p className="truncate text-xs text-muted">{p.title}</p>
            {p.price && (
              <p className="text-sm font-semibold">
                <Money as="span" data={p.price} withoutTrailingZeros />
              </p>
            )}
          </Link>
        ))}
      </Carousel>
    </section>
  );
}
