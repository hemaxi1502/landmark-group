import {Suspense} from 'react';
import {Await, useLoaderData, useRouteLoaderData} from 'react-router';
import {
  Analytics,
  getAdjacentAndFirstAvailableVariants,
  getProductOptions,
  getSelectedProductOptions,
  useOptimisticVariant,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {PRODUCT_CARD_FRAGMENT, parseRating} from '~/lib/product-card';
import {SPEC_METAFIELDS} from '~/lib/site-config';
import {menuItemUrl, parseMenuTitle} from '~/lib/menu';
import {useLocalProductList} from '~/lib/local-list';
import {Breadcrumb} from '~/components/ui/Breadcrumb';
import {Icon} from '~/components/ui/Icon';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {ProductGallery} from '~/components/pdp/ProductGallery';
import {ProductOptions} from '~/components/pdp/ProductOptions';
import {
  LowStockMessage,
  MembershipBanner,
  OffersCarousel,
  PincodeCheck,
  ProductDetails,
  ProductInfo,
  RatingsReviews,
  ServiceInfo,
  SocialShare,
} from '~/components/pdp/PdpBlocks';
import {
  RecentlyViewed,
  RecommendationCarousel,
} from '~/components/pdp/ProductCarousels';
export const meta = ({data}) => {
  const p = data?.product;
  return [
    {title: `${p?.seo.title || `Buy ${p?.title ?? ''}`} | Lifestyle Stores`},
    {
      name: 'description',
      content: p?.seo.description || p?.description?.slice(0, 155) || '',
    },
    {rel: 'canonical', href: `/products/${p?.handle}`},
  ];
};
export async function loader({context, params, request}) {
  const {handle} = params;
  const {storefront} = context;
  if (!handle) throw new Error('Expected product handle to be defined');
  const {product} = await storefront.query(PRODUCT_QUERY, {
    variables: {
      handle,
      selectedOptions: getSelectedProductOptions(request),
      specs: SPEC_METAFIELDS.map(({key}) => ({namespace: 'custom', key})),
    },
  });
  if (!product?.id) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: product});
  // Below-the-fold carousels stream in after the page renders.
  const recommend = (intent) =>
    storefront
      .query(RECOMMENDATIONS_QUERY, {
        variables: {productId: product.id, intent},
      })
      .then((r) => r.productRecommendations?.slice(0, 12) ?? null)
      .catch((error) => {
        console.error(error);
        return null;
      });
  // `metafields(identifiers)` returns results in the same order as SPEC_METAFIELDS
  const specs = [];
  product.specs.forEach((m, i) => {
    if (m?.value) specs.push({label: SPEC_METAFIELDS[i].label, value: m.value});
  });
  // Inventory counts need the `unauthenticated_read_product_inventory` token scope.
  // Fetched separately so a missing scope only hides the low-stock message.
  const stock = storefront
    .query(STOCK_QUERY, {variables: {handle}})
    .then((r) =>
      Object.fromEntries(
        (r.product?.variants.nodes ?? []).map((v) => [
          v.id,
          v.quantityAvailable ?? null,
        ]),
      ),
    )
    .catch(() => ({}));
  return {
    product,
    specs,
    stock,
    similar: recommend('RELATED'),
    alsoLike: recommend('COMPLEMENTARY'),
  };
}
export default function Product() {
  const {product, specs, stock, similar, alsoLike} = useLoaderData();
  const root = useRouteLoaderData('root');
  const {open} = useAside();
  const wishlist = useLocalProductList('wishlist');
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });
  const rating = parseRating(product.rating?.value);
  const ratingCount = Number(product.ratingCount?.value ?? 0) || undefined;
  const images = product.images.nodes;
  const stored = {
    handle: product.handle,
    title: product.title,
    vendor: product.vendor,
    image: images[0]?.url,
    price: selectedVariant?.price,
  };
  const saved = wishlist.has(product.handle);
  const sizeChart =
    product.sizeChart?.reference?.__typename === 'MediaImage'
      ? product.sizeChart.reference.image?.url
      : null;
  return (
    <div className="container-site">
      <Breadcrumb
        items={productCrumbs(product.collections.nodes, product.title, root)}
      />

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:gap-12 [&>*]:min-w-0">
        <ProductGallery
          images={images}
          selectedImageUrl={selectedVariant?.image?.url}
          title={product.title}
        />

        <div className="space-y-6">
          <ProductInfo
            vendor={product.vendor}
            title={product.title}
            rating={rating}
            ratingCount={ratingCount}
            price={selectedVariant?.price}
            compareAtPrice={selectedVariant?.compareAtPrice}
          />

          <OffersCarousel />

          <ProductOptions options={productOptions} sizeChartUrl={sizeChart} />

          <Suspense fallback={null}>
            <Await resolve={stock} errorElement={null}>
              {(byVariant) => (
                <LowStockMessage
                  quantity={byVariant[selectedVariant?.id ?? '']}
                />
              )}
            </Await>
          </Suspense>

          <div className="flex gap-3">
            <div className="flex-1 [&_form]:w-full">
              <AddToCartButton
                disabled={!selectedVariant?.availableForSale}
                onClick={() => open('cart')}
                className="w-full rounded bg-ink py-3.5 text-sm font-bold tracking-wide text-white uppercase transition hover:bg-black disabled:cursor-not-allowed disabled:bg-muted"
                lines={
                  selectedVariant
                    ? [
                        {
                          merchandiseId: selectedVariant.id,
                          quantity: 1,
                          selectedVariant,
                        },
                      ]
                    : []
                }
              >
                {selectedVariant?.availableForSale
                  ? 'Add to Basket'
                  : 'Sold out'}
              </AddToCartButton>
            </div>
            <button
              type="button"
              onClick={() => wishlist.toggle(stored)}
              aria-pressed={saved}
              className="flex items-center gap-2 rounded border border-line px-4 text-sm font-semibold hover:border-ink"
            >
              <Icon
                name="heart"
                filled={saved}
                className={`h-5 w-5 ${saved ? 'text-brand' : ''}`}
              />
              <span className="hidden sm:inline">
                {saved ? 'Saved' : 'Favourite'}
              </span>
            </button>
          </div>

          <SocialShare title={product.title} />
          <MembershipBanner />
          <PincodeCheck />
          <ServiceInfo price={selectedVariant?.price} />
          <ProductDetails
            descriptionHtml={product.descriptionHtml}
            specs={specs}
          />
        </div>
      </div>

      <div className="mt-14 border-t border-line pt-10">
        <RatingsReviews rating={rating} count={ratingCount} />
      </div>

      <RecommendationCarousel title="Similar Products" products={similar} />
      <RecommendationCarousel title="You May Also Like" products={alsoLike} />
      <RecentlyViewed current={stored} />

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}
/** Home › Department › Collection › Product, using the main menu to find the department. */
function productCrumbs(collections, title, root) {
  const items = root?.header.menu?.items ?? [];
  const domain = root?.publicStoreDomain ?? '';
  const primary = root?.header.shop.primaryDomain.url;
  const handles = new Set(collections.map((c) => c.handle));
  for (const parent of items) {
    for (const child of parent.items) {
      const url = menuItemUrl(child.url, domain, primary);
      const handle = url?.split('/collections/')[1];
      if (handle && handles.has(handle)) {
        return [
          {
            label: parseMenuTitle(parent.title).label,
            to: menuItemUrl(parent.url, domain, primary),
          },
          {label: child.title, to: url},
          {label: title},
        ];
      }
    }
  }
  const first = collections[0];
  return first
    ? [{label: first.title, to: `/collections/${first.handle}`}, {label: title}]
    : [{label: title}];
}
const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
`;
const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 12) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    collections(first: 10) {
      nodes {
        handle
        title
      }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(
      selectedOptions: $selectedOptions
      ignoreUnknownOptions: true
      caseInsensitiveMatch: true
    ) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    specs: metafields(identifiers: $specs) {
      key
      value
    }
    sizeChart: metafield(namespace: "custom", key: "size_chart") {
      reference {
        __typename
        ... on MediaImage {
          image {
            url
          }
        }
      }
    }
    rating: metafield(namespace: "reviews", key: "rating") {
      value
    }
    ratingCount: metafield(namespace: "reviews", key: "rating_count") {
      value
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
`;
const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
    $specs: [HasMetafieldsIdentifier!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
`;
const RECOMMENDATIONS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query ProductRecommendations(
    $productId: ID!
    $intent: ProductRecommendationIntent
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    productRecommendations(productId: $productId, intent: $intent) {
      ...ProductCard
    }
  }
`;
const STOCK_QUERY = `#graphql
  query ProductStock($handle: String!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      variants(first: 100) {
        nodes {
          id
          quantityAvailable
        }
      }
    }
  }
`;
