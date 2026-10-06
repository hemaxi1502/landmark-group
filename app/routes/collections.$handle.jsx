import {redirect, useLoaderData, useRouteLoaderData} from 'react-router';
import {Analytics} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/product-card';
import {getFilters, getSort} from '~/lib/collection-filters';
import {menuItemUrl, parseMenuTitle} from '~/lib/menu';
import {Breadcrumb} from '~/components/ui/Breadcrumb';
import {ProductCard} from '~/components/plp/ProductCard';
import {ActiveFilterChips, FilterSidebar} from '~/components/plp/FilterSidebar';
import {
  FaqAccordion,
  parseFaqs,
  PlpPagination,
  PopularSearches,
  SeoContentBlock,
  SortDropdown,
  SubCategoryPills,
} from '~/components/plp/PlpParts';
const PAGE_SIZE = 24;
export const meta = ({data}) => {
  const c = data?.collection;
  return [
    {
      title: `${c?.seo.title || `Buy ${c?.title ?? ''} Online`} | Lifestyle Stores`,
    },
    {name: 'description', content: c?.seo.description || c?.description || ''},
    {rel: 'canonical', href: `/collections/${c?.handle}`},
  ];
};
export async function loader({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  if (!handle) throw redirect('/collections');
  const searchParams = new URL(request.url).searchParams;
  const {sortKey, reverse, value: sort} = getSort(searchParams);
  const filters = getFilters(searchParams);
  const cursor = searchParams.get('cursor') ?? undefined;
  const backwards = searchParams.get('direction') === 'previous';
  const pagination = cursor
    ? backwards
      ? {last: PAGE_SIZE, startCursor: cursor}
      : {first: PAGE_SIZE, endCursor: cursor}
    : {first: PAGE_SIZE};
  const [{collection}, popular] = await Promise.all([
    storefront.query(COLLECTION_PLP_QUERY, {
      variables: {handle, filters, sortKey, reverse, ...pagination},
    }),
    storefront
      .query(POPULAR_SEARCHES_QUERY, {cache: storefront.CacheLong()})
      .catch(() => null),
  ]);
  if (!collection) {
    throw new Response(`Collection ${handle} not found`, {status: 404});
  }
  redirectIfHandleIsLocalized(request, {handle, data: collection});
  return {
    collection,
    sort,
    faqs: parseFaqs(collection.faq?.value),
    popularSearches:
      popular?.menu?.items
        .filter((i) => i.url && i.url !== '#')
        .map((i) => ({
          label: i.title,
          to: new URL(i.url, 'https://x').pathname,
        })) ?? [],
  };
}
export default function Collection() {
  const {collection, sort, faqs, popularSearches} = useLoaderData();
  const root = useRouteLoaderData('root');
  const {crumbs, pills} = useMenuContext(
    collection.handle,
    collection.title,
    root,
  );
  const products = collection.products;
  return (
    <div className="container-site">
      <Breadcrumb items={crumbs} />

      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-xl font-bold md:text-2xl">{collection.title}</h1>
      </div>

      <SubCategoryPills links={pills} />

      <div className="flex gap-8">
        <FilterSidebar filters={products.filters} />

        <div className="min-w-0 flex-1">
          <div className="mb-4 flex items-center justify-between gap-3 lg:justify-end">
            <div className="lg:hidden">
              {/* mobile filter button is rendered by FilterSidebar */}
            </div>
            <SortDropdown value={sort} />
          </div>

          <ActiveFilterChips filters={products.filters} />

          {products.nodes.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
              {products.nodes.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  loading={i < 8 ? 'eager' : 'lazy'}
                />
              ))}
            </div>
          ) : (
            <p className="py-20 text-center text-muted">
              No products match these filters.
            </p>
          )}

          <PlpPagination pageInfo={products.pageInfo} />
        </div>
      </div>

      <SeoContentBlock html={collection.descriptionHtml} />
      <FaqAccordion faqs={faqs} title={collection.title} />
      <PopularSearches links={popularSearches} />

      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />
    </div>
  );
}
/**
 * Derives breadcrumb + "Shop For" pills from the main menu, so no extra data
 * is needed: if this collection is a top-level menu item its children become
 * pills; if it's a child, its siblings do.
 */
function useMenuContext(handle, title, root) {
  const items = root?.header.menu?.items ?? [];
  const domain = root?.publicStoreDomain ?? '';
  const primary = root?.header.shop.primaryDomain.url;
  const path = `/collections/${handle}`;
  const toUrl = (url) => menuItemUrl(url, domain, primary);
  for (const parent of items) {
    const parentUrl = toUrl(parent.url);
    const parentLabel = parseMenuTitle(parent.title).label;
    const childLinks = parent.items
      .map((c) => ({label: c.title, to: toUrl(c.url) ?? ''}))
      .filter((c) => c.to);
    if (parentUrl === path) {
      return {crumbs: [{label: parentLabel}], pills: childLinks};
    }
    if (parent.items.some((c) => toUrl(c.url) === path)) {
      return {
        crumbs: [{label: parentLabel, to: parentUrl}, {label: title}],
        pills: childLinks.map((c) => ({...c, active: c.to === path})),
      };
    }
  }
  return {crumbs: [{label: title}], pills: []};
}
const COLLECTION_PLP_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query CollectionPlp(
    $handle: String!
    $filters: [ProductFilter!]
    $sortKey: ProductCollectionSortKeys
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      id
      handle
      title
      description
      descriptionHtml
      seo {
        title
        description
      }
      faq: metafield(namespace: "custom", key: "faq") {
        value
      }
      products(
        first: $first
        last: $last
        before: $startCursor
        after: $endCursor
        filters: $filters
        sortKey: $sortKey
        reverse: $reverse
      ) {
        filters {
          id
          label
          type
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
        pageInfo {
          hasPreviousPage
          hasNextPage
          startCursor
          endCursor
        }
      }
    }
  }
`;
const POPULAR_SEARCHES_QUERY = `#graphql
  query PopularSearches($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    menu(handle: "popular-searches") {
      items {
        title
        url
      }
    }
  }
`;
