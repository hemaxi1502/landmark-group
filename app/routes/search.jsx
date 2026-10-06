import {useEffect} from 'react';
import {Link, useLoaderData} from 'react-router';
import {Analytics} from '@shopify/hydrogen';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/product-card';
import {getFilters, resetPagination} from '~/lib/collection-filters';
import {ProductCard} from '~/components/plp/ProductCard';
import {Breadcrumb} from '~/components/ui/Breadcrumb';
import {ActiveFilterChips, FilterSidebar} from '~/components/plp/FilterSidebar';
import {PlpPagination} from '~/components/plp/PlpParts';
import {rememberSearch} from '~/components/search/SearchSuggest';
import {useLocation, useNavigate} from 'react-router';
import {getEmptyPredictiveSearchResult} from '~/lib/search';

const PAGE_SIZE = 24;

/** Search supports fewer sort keys than collections. */
const SEARCH_SORT = [
  {value: 'relevance', label: 'Relevance', key: 'RELEVANCE', reverse: false},
  {
    value: 'price-asc',
    label: 'Price: Low to High',
    key: 'PRICE',
    reverse: false,
  },
  {
    value: 'price-desc',
    label: 'Price: High to Low',
    key: 'PRICE',
    reverse: true,
  },
];

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  const term = data?.term;
  return [
    {
      title: term
        ? `Search results for “${term}” | Lifestyle Stores`
        : 'Search | Lifestyle Stores',
    },
    {name: 'robots', content: 'noindex'},
  ];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const url = new URL(request.url);
  if (url.searchParams.has('predictive')) {
    return predictiveSearch({request, context}).catch((error) => {
      console.error(error);
      return {type: 'predictive', term: '', result: null, error: error.message};
    });
  }
  return regularSearch({request, context});
}

/**
 * Search results page: product grid with the same filters, sort, cards and
 * pagination as collection pages.
 */
export default function SearchPage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  const term = data.type === 'predictive' ? '' : data.term;

  useEffect(() => {
    if (term) rememberSearch(term);
  }, [term]);

  if (data.type === 'predictive') return null;
  const {products, sort, error} = data;

  return (
    <div className="container-site pb-12">
      <Breadcrumb items={[{label: 'Search'}]} />

      <div className="mb-4">
        <h1 className="text-xl font-bold md:text-2xl">
          {term ? (
            <>
              Search results for <span className="text-brand">“{term}”</span>
            </>
          ) : (
            'Search'
          )}
        </h1>
        {products && (
          <p className="mt-1 text-sm text-muted">
            {products.totalCount}{' '}
            {products.totalCount === 1 ? 'product' : 'products'}
          </p>
        )}
      </div>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      {!term ? (
        <EmptyState
          title="What are you looking for?"
          text="Use the search bar above to find products, brands and categories."
        />
      ) : !products?.nodes.length && !products?.productFilters?.length ? (
        <EmptyState
          title={`No results for “${term}”`}
          text="Check the spelling, try a more general word, or browse our categories."
        />
      ) : (
        <div className="flex gap-8">
          <FilterSidebar filters={products.productFilters} />
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-end gap-3">
              <SearchSort value={sort} />
            </div>
            <ActiveFilterChips filters={products.productFilters} />
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
      )}

      <Analytics.SearchView
        data={{
          searchTerm: term,
          searchResults: {total: products?.totalCount ?? 0},
        }}
      />
    </div>
  );
}

function SearchSort({value}) {
  const {search} = useLocation();
  const navigate = useNavigate();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline">Sort by</span>
      <select
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(search);
          next.set('sort', e.target.value);
          resetPagination(next);
          void navigate(`?${next}`, {preventScrollReset: true});
        }}
        className="rounded border border-line bg-white px-3 py-2 text-sm"
      >
        {SEARCH_SORT.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function EmptyState({title, text}) {
  return (
    <div className="py-16 text-center">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{text}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {['women', 'men', 'kids', 'footwear', 'beauty'].map((h) => (
          <Link
            key={h}
            to={`/collections/${h}`}
            className="rounded-full border border-line px-4 py-1.5 text-sm capitalize hover:border-ink"
          >
            {h}
          </Link>
        ))}
      </div>
    </div>
  );
}

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/search
const SEARCH_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query SearchProducts(
    $term: String!
    $filters: [ProductFilter!]
    $sortKey: SearchSortKeys
    $reverse: Boolean
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products: search(
      query: $term
      types: [PRODUCT]
      productFilters: $filters
      sortKey: $sortKey
      reverse: $reverse
      first: $first
      last: $last
      before: $startCursor
      after: $endCursor
      unavailableProducts: LAST
    ) {
      totalCount
      productFilters {
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
        ... on Product {
          ...ProductCard
        }
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;

/**
 * @param {Pick<Route.LoaderArgs, 'request' | 'context'>}
 */
async function regularSearch({request, context}) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const term = String(params.get('q') || '').trim();
  const sortOption =
    SEARCH_SORT.find((o) => o.value === params.get('sort')) ?? SEARCH_SORT[0];

  if (!term)
    return {type: 'regular', term, products: null, sort: sortOption.value};

  const cursor = params.get('cursor') ?? undefined;
  const backwards = params.get('direction') === 'previous';
  const pagination = cursor
    ? backwards
      ? {last: PAGE_SIZE, startCursor: cursor}
      : {first: PAGE_SIZE, endCursor: cursor}
    : {first: PAGE_SIZE};

  try {
    const {products} = await context.storefront.query(SEARCH_PRODUCTS_QUERY, {
      variables: {
        term,
        filters: getFilters(params),
        sortKey: sortOption.key,
        reverse: sortOption.reverse,
        ...pagination,
      },
    });
    return {type: 'regular', term, products, sort: sortOption.value};
  } catch (error) {
    console.error(error);
    return {
      type: 'regular',
      term,
      products: null,
      sort: sortOption.value,
      error: 'Search is unavailable right now.',
    };
  }
}

/**
 * Predictive search query and fragments
 * (adjust as needed)
 */
const PREDICTIVE_SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment PredictiveArticle on Article {
    __typename
    id
    title
    handle
    blog {
      handle
    }
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_COLLECTION_FRAGMENT = `#graphql
  fragment PredictiveCollection on Collection {
    __typename
    id
    title
    handle
    image {
      url
      altText
      width
      height
    }
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_PAGE_FRAGMENT = `#graphql
  fragment PredictivePage on Page {
    __typename
    id
    title
    handle
    trackingParameters
  }
`;

const PREDICTIVE_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment PredictiveProduct on Product {
    __typename
    id
    title
    handle
    trackingParameters
    selectedOrFirstAvailableVariant(
      selectedOptions: []
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      id
      image {
        url
        altText
        width
        height
      }
      price {
        amount
        currencyCode
      }
    }
  }
`;

const PREDICTIVE_SEARCH_QUERY_FRAGMENT = `#graphql
  fragment PredictiveQuery on SearchQuerySuggestion {
    __typename
    text
    styledText
    trackingParameters
  }
`;

// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/predictiveSearch
const PREDICTIVE_SEARCH_QUERY = `#graphql
  query PredictiveSearch(
    $country: CountryCode
    $language: LanguageCode
    $limit: Int!
    $limitScope: PredictiveSearchLimitScope!
    $term: String!
    $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(
      limit: $limit,
      limitScope: $limitScope,
      query: $term,
      types: $types,
    ) {
      articles {
        ...PredictiveArticle
      }
      collections {
        ...PredictiveCollection
      }
      pages {
        ...PredictivePage
      }
      products {
        ...PredictiveProduct
      }
      queries {
        ...PredictiveQuery
      }
    }
  }
  ${PREDICTIVE_SEARCH_ARTICLE_FRAGMENT}
  ${PREDICTIVE_SEARCH_COLLECTION_FRAGMENT}
  ${PREDICTIVE_SEARCH_PAGE_FRAGMENT}
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
  ${PREDICTIVE_SEARCH_QUERY_FRAGMENT}
`;

/**
 * Predictive search fetcher
 * @param {Pick<
 *   Route.ActionArgs,
 *   'request' | 'context'
 * >}
 * @return {Promise<PredictiveSearchReturn>}
 */
async function predictiveSearch({request, context}) {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || 10);
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  // Predictively search articles, collections, pages, products, and queries (suggestions)
  const {predictiveSearch: items, errors} = await storefront.query(
    PREDICTIVE_SEARCH_QUERY,
    {
      variables: {
        // customize search options as needed
        limit,
        limitScope: 'EACH',
        term,
      },
    },
  );

  if (errors) {
    throw new Error(
      `Shopify API errors: ${errors.map(({message}) => message).join(', ')}`,
    );
  }

  if (!items) {
    throw new Error('No predictive search data returned from Shopify API');
  }

  const total = Object.values(items).reduce(
    (acc, item) => acc + item.length,
    0,
  );

  return {type, term, result: {items, total}};
}

/** @typedef {import('./+types/search').Route} Route */
/** @typedef {import('~/lib/search').RegularSearchReturn} RegularSearchReturn */
/** @typedef {import('~/lib/search').PredictiveSearchReturn} PredictiveSearchReturn */
/** @typedef {import('storefrontapi.generated').RegularSearchQuery} RegularSearchQuery */
/** @typedef {import('storefrontapi.generated').PredictiveSearchQuery} PredictiveSearchQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
