import {PRODUCT_CARD_FRAGMENT} from '~/lib/product-card';
import {
  buildBrands,
  buildCategories,
  buildOtherDepartments,
  buildPriceBands,
  buildStats,
  buildStyles,
  findMenuItem,
} from '~/lib/department';

/**
 * Loads everything a department view needs. Returns null when the
 * collection doesn't exist and {empty: true} when it has no products.
 */
export async function loadDepartment(storefront, handle) {
  const {collection, menu} = await storefront.query(DEPARTMENT_QUERY, {
    variables: {handle},
    cache: storefront.CacheShort(),
  });
  if (!collection) return null;
  const bestSellers = collection.bestSellers.nodes;
  if (!bestSellers.length) return {empty: true, handle};

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

export const DEPARTMENT_QUERY = `#graphql
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
