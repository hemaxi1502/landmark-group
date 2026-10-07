import {PRODUCT_CARD_FRAGMENT} from '~/lib/product-card';
import {buildBrands, buildPriceBands} from '~/lib/department';
import {loadDepartment} from '~/lib/department-data';
import {loadHomeRenderData} from '~/components/home/HomeSectionByHandle';
import {isRenderable, parseBlock} from '~/lib/page-builder';

/**
 * Loads a page_layout by handle and the data each visible block needs.
 * Returns null when there's no such page. Blocks that can't render
 * (no collection picked, empty collection…) are left out.
 */
export async function loadPageLayout(storefront, handle) {
  if (!handle) return null;
  const {layout} = await storefront.query(PAGE_LAYOUT_QUERY, {
    variables: {handle},
    cache: storefront.CacheShort(),
  });
  if (!layout) return null;

  const blocks = (layout.sections?.references?.nodes ?? [])
    .filter(Boolean)
    .map(parseBlock)
    .filter((b) => !b.hidden && isRenderable(b));

  const needsHome = blocks.some((b) => b.kind === 'home_section');
  const home = needsHome
    ? await loadHomeRenderData(storefront, {includeHidden: true})
    : null;

  const resolved = await Promise.all(
    blocks.map((block) => resolveBlock(storefront, block, home)),
  );

  return {
    title: layout.title?.value ?? handle,
    description: layout.description?.value ?? '',
    blocks: resolved.filter(Boolean),
  };
}

async function resolveBlock(storefront, block, home) {
  try {
    switch (block.kind) {
      case 'product_carousel':
      case 'product_grid': {
        const {collection} = await storefront.query(BLOCK_PRODUCTS_QUERY, {
          variables: {handle: block.collection.handle, first: block.count},
          cache: storefront.CacheShort(),
        });
        const products = collection?.products?.nodes ?? [];
        return products.length ? {...block, products} : null;
      }
      case 'brand_tiles':
      case 'price_bands': {
        const {collection} = await storefront.query(BLOCK_FACETS_QUERY, {
          variables: {handle: block.collection.handle},
          cache: storefront.CacheShort(),
        });
        const products = collection?.products?.nodes ?? [];
        const filters = collection?.products?.filters ?? [];
        const items =
          block.kind === 'brand_tiles'
            ? buildBrands(block.collection.handle, filters, products)
            : buildPriceBands(block.collection.handle, products);
        return items.length ? {...block, items} : null;
      }
      case 'department': {
        const d = await loadDepartment(storefront, block.collection.handle);
        return d && !d.empty ? {...block, department: d} : null;
      }
      case 'home_section':
        return home ? {...block, home} : null;
      case 'category_tiles':
        return {
          ...block,
          collections: block.collections.filter((c) => !c.empty),
        };
      default:
        return block;
    }
  } catch (error) {
    // One broken block must not take the page down.
    console.error(`Page block ${block.id} (${block.kind})`, error);
    return null;
  }
}

const PAGE_LAYOUT_QUERY = `#graphql
  fragment PageBlockImage on Image {
    url
    altText
    width
    height
  }
  query PageLayout(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    layout: metaobject(handle: {type: "page_layout", handle: $handle}) {
      handle
      title: field(key: "title") {
        value
      }
      description: field(key: "description") {
        value
      }
      sections: field(key: "sections") {
        references(first: 40) {
          nodes {
            ... on Metaobject {
              id
              fields {
                key
                value
                reference {
                  __typename
                  ... on MediaImage {
                    image {
                      ...PageBlockImage
                    }
                  }
                  ... on Collection {
                    handle
                    title
                  }
                  ... on Metaobject {
                    handle
                  }
                }
                references(first: 12) {
                  nodes {
                    ... on Collection {
                      handle
                      title
                      image {
                        ...PageBlockImage
                      }
                      products(first: 1, sortKey: BEST_SELLING) {
                        nodes {
                          featuredImage {
                            ...PageBlockImage
                          }
                        }
                      }
                    }
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

const BLOCK_PRODUCTS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query PageBlockProducts(
    $handle: String!
    $first: Int!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: $first, sortKey: BEST_SELLING) {
        nodes {
          ...ProductCard
        }
      }
    }
  }
`;

const BLOCK_FACETS_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query PageBlockFacets(
    $handle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    collection(handle: $handle) {
      products(first: 48, sortKey: BEST_SELLING) {
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
    }
  }
`;
