/** Shared product-card data: PLP grid, recommendation carousels, search. */
export const PRODUCT_CARD_FRAGMENT = `#graphql
  fragment ProductCard on Product {
    id
    handle
    title
    vendor
    publishedAt
    availableForSale
    tags
    images(first: 2) {
      nodes {
        id
        url
        altText
        width
        height
      }
    }
    priceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    compareAtPriceRange {
      minVariantPrice {
        amount
        currencyCode
      }
    }
    rating: metafield(namespace: "reviews", key: "rating") {
      value
    }
    ratingCount: metafield(namespace: "reviews", key: "rating_count") {
      value
    }
  }
`;
/** Parses Shopify's standard `reviews.rating` metafield ({"value":"4.3",...}). */
export function parseRating(raw) {
  if (!raw) return undefined;
  try {
    const value = Number(JSON.parse(raw).value);
    return Number.isFinite(value) ? value : undefined;
  } catch {
    return undefined;
  }
}
export function discountPercent(price, compareAt) {
  const p = Number(price);
  const c = Number(compareAt);
  if (!p || !c || c <= p) return undefined;
  return Math.round(((c - p) / c) * 100);
}
