import {Link} from 'react-router';
import {Money} from '@shopify/hydrogen';
import {useLocalProductList} from '~/lib/local-list';
import {Breadcrumb} from '~/components/ui/Breadcrumb';
import {Icon} from '~/components/ui/Icon';
import {withWidth} from '~/components/home/parts';
export const meta = () => [
  {title: 'Favourites | Lifestyle Stores'},
  {name: 'robots', content: 'noindex'},
];
/** Favourites page — reads the browser-stored wishlist (demo; see README for a synced wishlist). */
export default function Wishlist() {
  const {items, remove} = useLocalProductList('wishlist');
  return (
    <div className="container-site">
      <Breadcrumb items={[{label: 'Favourites'}]} />
      <h1 className="mb-6 text-xl font-bold md:text-2xl">
        Favourites ({items.length})
      </h1>
      {items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted">You haven&apos;t saved anything yet.</p>
          <Link
            to="/"
            className="mt-4 inline-block rounded bg-ink px-6 py-3 text-sm font-semibold text-white"
          >
            Continue shopping
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-4 lg:grid-cols-5">
          {items.map((p) => (
            <li key={p.handle} className="relative">
              <Link to={`/products/${p.handle}`} className="block">
                <div className="aspect-[3/4] overflow-hidden rounded bg-surface">
                  {p.image && (
                    <img
                      src={withWidth(p.image, 500)}
                      alt={p.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <p className="mt-2 truncate text-xs font-semibold uppercase">
                  {p.vendor}
                </p>
                <p className="truncate text-sm text-muted">{p.title}</p>
                {p.price && (
                  <p className="text-sm font-semibold">
                    <Money as="span" data={p.price} withoutTrailingZeros />
                  </p>
                )}
              </Link>
              <button
                type="button"
                onClick={() => remove(p.handle)}
                aria-label={`Remove ${p.title} from favourites`}
                className="absolute top-2 right-2 rounded-full bg-white p-1.5 shadow"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
