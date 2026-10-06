# Changes — Homepage sections, PLP, PDP

Your existing work is untouched: `Header.jsx`, `AnnouncementBar.jsx`,
`HomePage/HeroSlider.jsx`, `HomePage/ShowcaseSection.jsx`, `HomePage/BabyShop.jsx`.

## Homepage (`app/routes/_index.jsx`)

All `home_page` metaobject entries now render in their admin **sort_order**:

| Section | Rendered by |
|---|---|
| hero-slider | your `HeroSlider` |
| bestseller, top-brands-on-lifestyle-collections, festive-edit, all-new-home-living-store, babyshop | your `ShowcaseSection` (same banner positions as before) |
| home-page-banner, lifestyle-exclusives, our-benefits, in-trend, top-categories, chartbusters | **new** `components/home/HomeSections.jsx` |

The new sections are loaded by `lib/home-content.js` in small per-section queries.
Do not fold them into `HOME_PAGE_SECTIONS_QUERY`: Top Categories has 40 cards
(that query caps at 12) and the full tree costs ~9,000 query points against
Shopify's 1,000 limit. Any new `home_page` entry added in admin renders
automatically as banner + tiles.

## PLP (`routes/collections.$handle.jsx`) — replaces the starter file
Breadcrumb, "Shop For" pills (from the main menu), filter sidebar (Search &
Discovery facets, hidden when none are configured), sort, product card,
Previous/Next pagination, SEO block, FAQ (`custom.faq`), Popular Searches
(menu `popular-searches`). `collections.all.jsx` uses the same product card.

## PDP (`routes/products.$handle.jsx`) — replaces the starter file
Gallery + zoom, info/price/MRP, coupons, colour + size + size guide, low stock,
Add to Basket + Favourite, share, membership banner, pincode check,
Click & Collect / EMI / returns / sold by, overview + specs (`custom.*`
metafields), ratings, Similar / You May Also Like / Recently Viewed.

## Footer — replaces the starter footer
Columns from the existing `footer-women`, `footer-men`, … menus + policy links.
(`lib/fragments.js` FOOTER_QUERY, `root.jsx`, `PageLayout.jsx` updated to match.)

## Other changes
- **`app/entry.server.jsx`** — CSP now allows Google Fonts. Before this, the
  Figtree font in `root.jsx` was blocked by the browser on every page.
- **`package-lock.json`** — regenerated. The old one was missing `@emnapi/*`
  entries, so `npm ci` (used by Shopify's GitHub → Oxygen deploys) failed.
- `app/styles/tailwind.css` — added colour tokens (matched to the header's
  #FAA619 accent) and `.container-site` (same 81rem width as `.page-width`).
- `AddToCartButton.jsx` — accepts `className`.
- New: `routes/wishlist.jsx`, `components/{home,plp,pdp,ui}/`, `lib/*.js`, `tests/`.
- `npm test` — homepage data-layer tests.

## Placeholders to confirm (`app/lib/site-config.js`)
PDP coupon codes, EMI threshold, returns text, membership banner, low-stock
threshold, spec field list. Pincode delivery estimate (`lib/pincode.js`) is a
stub — replace with the courier's serviceability API. Wishlist / Recently
Viewed use browser storage only.

## Store data needed
- Card metaobjects have empty `url`/`collection` → homepage tiles aren't clickable yet.
- Sample products have 0 inventory → show "Sold out".
- PLP filters need the Search & Discovery app.

## Pre-existing lint errors (not changed)
`npm run lint` reports 17 errors in `Header.jsx`, `AnnouncementBar.jsx` and some
starter routes (unused variables, autoFocus, a clickable div). They don't break
the build.

## Shopper journey up to checkout (round 2)

Tested end to end in a browser: header search → suggestions → results →
product → Add to Basket → drawer → quantity change → basket page → checkout
handoff, on desktop and mobile, with no console or hydration errors.

### Header search (`Header.jsx` — only the search inputs and dropdown changed)
The search boxes, popular-search chips and recent searches were static markup.
Now: typing shows live suggestions (queries, categories, products with price),
Enter / chips / "View all results" open `/search`, recent searches are
remembered (with Clear all), and Favorites falls back to `/wishlist` (the
`main_header` metaobject has no `favorite_url`). Logic lives in
`components/search/SearchSuggest.jsx`; your markup and styles are unchanged.

### Search results (`routes/search.jsx`)
Product grid with result count, Search & Discovery filters, sort
(Relevance / Price), pagination and empty states. Reuses the PLP components.
The suggestions endpoint (`/search?predictive=true`) is unchanged.

### Basket (`CartMain.jsx`, `CartLineItem.jsx`, `CartSummary.jsx`, `routes/cart.jsx`)
Drawer ("MY BASKET") and full page: brand, title, size/colour, price + MRP +
% off, quantity stepper, remove, Move to Favourites, coupon box with
tap-to-apply codes, price details (Total MRP, Discount on MRP, Coupon savings,
Delivery FREE, Total, You save), empty state, Proceed to Checkout.

### Checkout
"Proceed to Checkout" opens Shopify's hosted checkout (`cart.checkoutUrl`).
Hydrogen can't render checkout itself; brand it in Shopify admin →
Settings → Checkout (logo, colours, fonts — Plus allows more via checkout
extensions).

### Drawers
`Aside.jsx` — drawers (basket, search, mobile menu) now close when the page
changes. Before, "View Basket" opened the basket page with the drawer still
covering it.

### Removed
`components/SearchForm.jsx`, `components/SearchResults.jsx` (starter files no
longer used).

### Not built yet
Account pages (login, orders, addresses, profile), 404 page, blog and policy
styling — they still use the Shopify starter layout.

## Homepage editor (round 3) — `/editor`

A password-protected page where the client can, without touching Shopify admin:
- reorder homepage sections (writes `sort_order` on `home_page` entries),
- reorder the slides / cards inside each section (Top Categories is ordered per tab),
- change the link of every hero slide, banner and card.

Files: `routes/editor.jsx`, `lib/editor-content.server.js` (reads the
metaobject tree, validates and saves), `lib/admin-api.server.js` (Admin API
client), `tests/editor-content.test.js`. Images and text are still edited in
Content → Metaobjects.

Links can be typed as paths (`/collections/women`). Shopify's URL field only
stores full addresses, so the editor saves `https://<store>.myshopify.com/collections/women`
and the storefront turns it back into a path.

### Environment variables (Oxygen → Storefront settings → Environments and variables)
| Variable | Value |
|---|---|
| `EDITOR_PASSWORD` | password for /editor |
| `SHOPIFY_ADMIN_CLIENT_ID` | Client ID of a Dev Dashboard app installed on the store |
| `SHOPIFY_ADMIN_CLIENT_SECRET` | Client secret of that app (mark as secret) |
| `SHOPIFY_ADMIN_SHOP` | optional, e.g. `landmark-group-yk2c2n09.myshopify.com` |

App scopes: `read_metaobjects`, `write_metaobjects`, `read_metaobject_definitions`, `read_files`.
`SHOPIFY_ADMIN_API_TOKEN` can replace the client ID/secret if you already have
an Admin API token. `SHOPIFY_ADMIN_GRAPHQL_URL` is for local testing against a mock only.

### Link fix in existing components
`HomePage/HeroSlider.jsx` and `HomePage/ShowcaseSection.jsx` used card URLs
as stored. Most point at `landmarkgroup-store.myshopify.com` (a different
store), so tiles sent shoppers off-site. They now go through `toRelativeUrl`,
and Showcase banners also use the banner's own `url` field.
