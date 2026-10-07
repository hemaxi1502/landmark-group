import {Link, redirect, useLoaderData} from 'react-router';
import {Analytics, Image} from '@shopify/hydrogen';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/product-card';
import {IMAGE_SRCSET} from '~/lib/image';
import {
  buildBrands,
  buildCategories,
  buildOtherDepartments,
  buildPriceBands,
  buildStats,
  buildStyles,
  findMenuItem,
} from '~/lib/department';
import {Breadcrumb} from '~/components/ui/Breadcrumb';
import {Carousel} from '~/components/ui/Carousel';
import {ProductCard} from '~/components/plp/ProductCard';

/**
 * Department landing page, e.g. /department/men — the page the main-menu
 * tiles open, like lifestylestores.com/in/en/department/men. Built from store
 * data only (see ~/lib/department). "Shop all" goes to /collections/:handle.
 */

export const meta = ({data}) => {
  const c = data?.collection;
  return [
    {title: `${c?.title ?? 'Shop'} | Fashion & More Online | Lifestyle Stores`},
    {
      name: 'description',
      content:
        c?.seo?.description ||
        c?.description ||
        `Shop ${c?.title ?? ''} online at Lifestyle: best sellers, new arrivals and top brands.`,
    },
    {rel: 'canonical', href: `/department/${c?.handle}`},
  ];
};

/** @param {import('react-router').LoaderFunctionArgs} */
export async function loader({params, context}) {
  const {handle} = params;
  const {storefront} = context;
  const {collection, menu} = await storefront.query(DEPARTMENT_QUERY, {
    variables: {handle},
    cache: storefront.CacheShort(),
  });
  if (!collection) {
    throw new Response(`Department ${handle} not found`, {status: 404});
  }
  const bestSellers = collection.bestSellers.nodes;
  // Nothing to show: the collection page has the "coming soon" state.
  if (!bestSellers.length) throw redirect(`/collections/${handle}`);

  const filters = collection.bestSellers.filters;
  const menuItem = findMenuItem(menu, handle);
  // New arrivals exclude what Best sellers already shows (small catalogues
  // return the same order for both sorts); hidden if fewer than 4 remain.
  const shown = new Set(bestSellers.slice(0, 12).map((p) => p.id));
  const newArrivals = collection.newArrivals.nodes.filter(
    (p) => !shown.has(p.id),
  );

  return {
    collection: {
      id: collection.id,
      handle: collection.handle,
      title: collection.title,
      description: collection.description,
      seo: collection.seo,
    },
    stats: buildStats(filters),
    hero: bestSellers.filter((p) => p.images.nodes[0]).slice(0, 3),
    categories: buildCategories(menuItem),
    bestSellers: bestSellers.slice(0, 12),
    brands: buildBrands(handle, filters, bestSellers),
    newArrivals: newArrivals.length >= 4 ? newArrivals.slice(0, 12) : [],
    priceBands: buildPriceBands(handle, bestSellers),
    styles: buildStyles(handle, filters),
    others: buildOtherDepartments(menu, handle),
  };
}

export default function Department() {
  const d = useLoaderData();
  const shopAll = `/collections/${d.collection.handle}`;
  return (
    <div className="container-site pb-12">
      <Breadcrumb items={[{label: d.collection.title}]} />
      <Hero d={d} shopAll={shopAll} />

      {d.categories.length > 0 && (
        <Section title={`Shop ${d.collection.title} by category`}>
          <Carousel
            itemClassName="basis-[38%] sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
            ariaLabel="Categories"
          >
            {d.categories.map((c) => (
              <ImageTile key={c.id} to={c.to} image={c.image} title={c.title} />
            ))}
          </Carousel>
        </Section>
      )}

      <ProductRow
        title="Best sellers"
        products={d.bestSellers}
        viewAll={`${shopAll}?sort=best-selling`}
      />

      {d.brands.length > 1 && (
        <Section title="Shop by brand">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 md:gap-4">
            {d.brands.map((b) => (
              <ImageTile
                key={b.id}
                to={b.to}
                image={b.image}
                title={b.title}
                sub={`${b.count} ${b.count === 1 ? 'style' : 'styles'}`}
                square
              />
            ))}
          </div>
        </Section>
      )}

      <ProductRow
        title="New arrivals"
        products={d.newArrivals}
        viewAll={`${shopAll}?sort=newest`}
      />

      {d.priceBands.length > 0 && (
        <Section title="Shop by price">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {d.priceBands.map((b) => (
              <Link
                key={b.max}
                to={b.to}
                prefetch="intent"
                className="group flex flex-col items-center justify-center rounded-[2px] bg-[#FFF4E0] px-3 py-6 text-center transition-colors hover:bg-[#FAA619]"
              >
                <span className="text-[12px] font-semibold uppercase tracking-wide text-[#8A5A00] group-hover:text-white">
                  Under
                </span>
                <span className="text-[24px] font-bold text-black group-hover:text-white">
                  ₹{b.max.toLocaleString('en-IN')}
                </span>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {d.styles.length > 1 && (
        <Section title="Shop by style">
          <ul className="flex flex-wrap gap-2">
            {d.styles.map((s) => (
              <li key={s.id}>
                <Link
                  to={s.to}
                  prefetch="intent"
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 px-4 py-2 text-[14px] hover:border-black"
                >
                  {s.title}
                  <span className="text-[12px] text-gray-500">{s.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      {d.others.length > 0 && (
        <Section title="Explore more">
          <ul className="flex flex-wrap gap-2">
            {d.others.map((o) => (
              <li key={o.id}>
                <Link
                  to={o.to}
                  prefetch="intent"
                  className="inline-block rounded-[2px] border border-black px-4 py-2 text-[14px] font-semibold hover:bg-black hover:text-white"
                >
                  {o.title}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Analytics.CollectionView
        data={{
          collection: {id: d.collection.id, handle: d.collection.handle},
        }}
      />
    </div>
  );
}

function Hero({d, shopAll}) {
  const {inStock, brands} = d.stats;
  return (
    <section className="grid overflow-hidden rounded-[2px] bg-[#F7F8F7] md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      <div className="flex flex-col justify-center px-5 py-8 md:px-10">
        <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[#FAA619]">
          Lifestyle
        </p>
        <h1 className="mt-1 text-[32px] font-bold leading-tight md:text-[44px]">
          {d.collection.title}
        </h1>
        {(inStock > 0 || brands > 0) && (
          <p className="mt-2 text-[15px] text-gray-600">
            {[
              inStock > 0 && `${inStock} styles in stock`,
              brands > 1 && `${brands} brands`,
              'Free delivery',
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={shopAll}
            prefetch="intent"
            className="inline-flex h-11 items-center rounded-[2px] bg-black px-6 text-[14px] font-semibold uppercase text-white hover:opacity-90"
          >
            Shop all {d.collection.title}
          </Link>
          {d.newArrivals.length > 0 && (
            <Link
              to={`${shopAll}?sort=newest`}
              prefetch="intent"
              className="inline-flex h-11 items-center rounded-[2px] border border-black px-6 text-[14px] font-semibold hover:bg-white"
            >
              New arrivals
            </Link>
          )}
        </div>
      </div>
      <div
        className={`grid gap-1 ${d.hero.length >= 3 ? 'grid-cols-3' : d.hero.length === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}
      >
        {d.hero.map((p, i) => (
          <Link
            key={p.id}
            to={`/products/${p.handle}`}
            prefetch="intent"
            className="block overflow-hidden bg-white"
          >
            <Image
              data={p.images.nodes[0]}
              alt={p.images.nodes[0].altText || p.title}
              aspectRatio="3/4"
              sizes="(min-width: 768px) 20vw, 33vw"
              srcSetOptions={IMAGE_SRCSET}
              loading={i === 0 ? 'eager' : 'lazy'}
              className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

function Section({title, children}) {
  return (
    <section className="mt-10 md:mt-14">
      <h2 className="mb-4 text-[20px] font-bold md:text-[24px]">{title}</h2>
      {children}
    </section>
  );
}

function ProductRow({title, products, viewAll}) {
  if (!products.length) return null;
  return (
    <section className="mt-10 md:mt-14">
      <div className="mb-4 flex items-end justify-between gap-3">
        <h2 className="text-[20px] font-bold md:text-[24px]">{title}</h2>
        <Link
          to={viewAll}
          prefetch="intent"
          className="shrink-0 text-[14px] font-semibold text-[#FAA619] hover:underline"
        >
          View all →
        </Link>
      </div>
      <Carousel
        itemClassName="basis-[46%] sm:basis-1/3 md:basis-1/4 lg:basis-1/5"
        ariaLabel={title}
      >
        {products.map((p) => (
          <ProductCard key={p.id} product={p} loading="lazy" />
        ))}
      </Carousel>
    </section>
  );
}

function ImageTile({to, image, title, sub, square}) {
  return (
    <Link to={to} prefetch="intent" className="group block text-center">
      <div
        className={`overflow-hidden rounded-[2px] bg-[#F7F8F7] ${square ? 'aspect-square' : 'aspect-[3/4]'}`}
      >
        {image ? (
          <Image
            data={image}
            alt=""
            aspectRatio={square ? '1/1' : '3/4'}
            sizes="(min-width: 1024px) 16vw, (min-width: 640px) 25vw, 38vw"
            srcSetOptions={IMAGE_SRCSET}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full items-center justify-center px-2 text-[15px] font-bold">
            {title}
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-[14px] font-semibold group-hover:text-[#FAA619]">
        {title}
      </p>
      {sub && <p className="text-[12px] text-gray-500">{sub}</p>}
    </Link>
  );
}

const DEPARTMENT_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  fragment DepartmentImage on Image {
    url
    altText
    width
    height
  }
  query Department(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      seo {
        description
      }
      bestSellers: products(first: 48, sortKey: BEST_SELLING) {
        filters {
          id
          values {
            id
            label
            count
            input
          }
        }
        nodes {
          ...ProductCard
        }
      }
      newArrivals: products(first: 30, sortKey: CREATED, reverse: true) {
        nodes {
          ...ProductCard
        }
      }
    }
    menu(handle: "main-menu") {
      items {
        id
        title
        url
        items {
          id
          title
          url
          resource {
            __typename
            ... on Collection {
              handle
              image {
                ...DepartmentImage
              }
              products(first: 1, sortKey: BEST_SELLING) {
                nodes {
                  featuredImage {
                    ...DepartmentImage
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;
