import {toRelativeUrl} from './home-content';
/**
 * The store's main menu encodes the mega-menu tile image inside the title:
 *   "Women (https://cdn.shopify.com/…/Nav-Women-Tile.webp)"
 * This splits it back into a clean label and an image URL.
 *
 * Recommended long-term fix: move the image to a collection image or a
 * menu-item metafield and keep titles clean (see README).
 */
export function parseMenuTitle(title) {
  const match = title.match(/^(.*?)\s*\((https?:\/\/[^\s)]+)\)+\s*$/);
  if (!match) return {label: title.trim()};
  return {label: match[1].trim(), image: match[2]};
}
export function menuItemUrl(url, publicStoreDomain, primaryDomainUrl) {
  if (!url || url === '#') return undefined;
  if (
    url.includes('myshopify.com') ||
    url.includes(publicStoreDomain) ||
    (primaryDomainUrl && url.includes(primaryDomainUrl))
  ) {
    return new URL(url).pathname;
  }
  return toRelativeUrl(url);
}
