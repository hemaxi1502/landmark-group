/**
 * Page builder: pages made of reusable blocks, edited in /editor → Pages.
 *
 * Shopify data:
 *   page_layout (metaobject)  handle = page address
 *                               "<slug>"            → /pages/<slug>
 *                               "department-<coll>" → top menu category page,
 *                                                     replaces /department/<coll>
 *                               "category-<coll>"   → sub category page, shown
 *                                                     above /collections/<coll>
 *     title, description, sections → [page_section]
 *   page_section (metaobject) kind + the settings below
 *
 * BLOCK_TYPES is the single list of blocks: the editor offers exactly these,
 * and PageBlocks renders each kind. Add a block = add an entry here, a case
 * in PageBlocks, and (if it needs data) a case in page-builder.server.js.
 */

export const LAYOUT_TYPE = 'page_layout';
export const SECTION_TYPE = 'page_section';

/** Settings a block can have (page_section fields). */
export const FIELD_INFO = {
  heading: {label: 'Heading', kind: 'text'},
  text: {label: 'Text', kind: 'multiline'},
  link: {label: 'Link', kind: 'text', hint: 'e.g. /collections/women'},
  collection: {label: 'Collection', kind: 'collection'},
  collections: {label: 'Collections', kind: 'collections'},
  count: {label: 'Number of products', kind: 'number', min: 1, max: 24},
  image: {label: 'Image (desktop)', kind: 'image'},
  mobile_image: {label: 'Image (mobile)', kind: 'image'},
  video: {label: 'Video (optional)', kind: 'video'},
  home_section: {label: 'Homepage section', kind: 'home_section'},
  items: {label: 'List', kind: 'lines'},
  ends_at: {label: 'Ends at', kind: 'datetime'},
  product: {label: 'Product', kind: 'product'},
  sort: {label: 'Sort by', kind: 'select'},
};

/** Product order for product blocks (sort field). */
export const SORT_OPTIONS = {
  best_selling: {
    label: 'Best sellers',
    sortKey: 'BEST_SELLING',
    reverse: false,
  },
  newest: {label: 'Newest first', sortKey: 'CREATED', reverse: true},
  price_asc: {label: 'Price: low to high', sortKey: 'PRICE', reverse: false},
  price_desc: {label: 'Price: high to low', sortKey: 'PRICE', reverse: true},
};

/** Trust badges shown when the block's list is left empty. */
export const DEFAULT_TRUST_BADGES = [
  'Free shipping | On all orders',
  'Easy 7-day returns | Online or in store',
  'Cash on delivery | Pay when it arrives',
  '100% original | Sold by Landmark Online India',
].join('\n');

export const BLOCK_TYPES = {
  banner: {
    label: 'Banner / Hero',
    description:
      'Full-width image or video, optionally clickable. Mobile image optional.',
    fields: ['image', 'mobile_image', 'video', 'link', 'heading'],
    labels: {heading: 'Description (alt text)'},
  },
  product_carousel: {
    label: 'Product carousel',
    description: 'A swipeable row of products from a collection.',
    fields: ['heading', 'collection', 'sort', 'count'],
    defaults: {count: 12},
  },
  product_grid: {
    label: 'Product grid',
    description: 'Products from a collection in a grid, with "View all".',
    fields: ['heading', 'collection', 'sort', 'count'],
    defaults: {count: 8},
  },
  category_tiles: {
    label: 'Category tiles',
    description: 'Picture tiles linking to the collections you pick.',
    fields: ['heading', 'collections'],
  },
  brand_tiles: {
    label: 'Brand tiles',
    description: 'The brands in a collection, each with a product photo.',
    fields: ['heading', 'collection'],
  },
  price_bands: {
    label: 'Shop by price',
    description: '"Under ₹499 / ₹999 / …" tiles for a collection.',
    fields: ['heading', 'collection'],
  },
  text: {
    label: 'Text',
    description: 'A heading, a paragraph and an optional button.',
    fields: ['heading', 'text', 'link'],
    labels: {link: 'Button link'},
  },
  home_section: {
    label: 'Homepage section',
    description: 'Any section from the homepage (hero, Top Categories, …).',
    fields: ['home_section'],
  },
  department: {
    label: 'Category page (automatic)',
    description:
      'The full automatic top menu category layout: hero, sub categories, best sellers, brands, prices.',
    fields: ['collection'],
  },

  /* ---- Conversion blocks ---- */
  offer_codes: {
    label: 'Offers & coupons',
    group: 'conversion',
    description: 'Coupon codes with a one-tap Copy button.',
    fields: ['heading', 'items'],
    labels: {items: 'Coupons'},
    hints: {
      items:
        'One coupon per line: CODE | what it gives. e.g. SAVE200 | ₹200 off on ₹1,999+. Codes must exist in Shopify → Discounts.',
    },
  },
  countdown: {
    label: 'Sale countdown',
    group: 'conversion',
    description:
      'Live timer to a real sale end time. Hides itself when the time is up.',
    fields: ['heading', 'text', 'ends_at', 'link'],
    labels: {link: 'Button link'},
  },
  trust_badges: {
    label: 'Trust badges',
    group: 'conversion',
    description: 'Free shipping, easy returns, COD, 100% original… in a row.',
    fields: ['items'],
    labels: {items: 'Badges'},
    hints: {
      items:
        'One per line: Title | short line. Leave empty for the standard four.',
    },
  },
  deals: {
    label: 'Deals',
    group: 'conversion',
    description:
      'Products with the biggest real discounts (MRP vs price), highest % off first.',
    fields: ['heading', 'collection', 'count'],
    labels: {collection: 'Collection (optional, all products if empty)'},
    defaults: {count: 12},
  },
  recently_viewed: {
    label: 'Recently viewed',
    group: 'conversion',
    description:
      "The shopper's own recently viewed products. Hidden for new visitors.",
    fields: ['heading'],
  },
  product_spotlight: {
    label: 'Product spotlight',
    group: 'conversion',
    description:
      'One hero product with photos, price, sizes and Add to basket.',
    fields: ['product', 'heading', 'text'],
    labels: {heading: 'Tagline (optional)', text: 'Why buy it (optional)'},
  },
  newsletter: {
    label: 'Email sign-up',
    group: 'conversion',
    description: 'Collects email subscribers (saved in Shopify → Customers).',
    fields: ['heading', 'text'],
  },
  faq: {
    label: 'FAQ',
    group: 'conversion',
    description:
      'Questions and answers that open on tap — answer sizing, delivery and return doubts before they cost a sale.',
    fields: ['heading', 'items'],
    labels: {items: 'Questions'},
    hints: {items: 'One per line: Question | Answer'},
  },
  image_text: {
    label: 'Image with text',
    group: 'conversion',
    description: 'A picture beside a heading, story and button.',
    fields: ['image', 'heading', 'text', 'link'],
    labels: {image: 'Image', link: 'Button link'},
  },
};

/** "A | B" lines → [{a, b}]; blank lines dropped. */
export function parseLines(text) {
  return String(text ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const i = line.indexOf('|');
      return i === -1
        ? {a: line, b: ''}
        : {a: line.slice(0, i).trim(), b: line.slice(i + 1).trim()};
    })
    .filter((x) => x.a);
}

/** Discounted products only (MRP above price), biggest % off first. */
export function rankDeals(products) {
  return products
    .map((p) => {
      const price = Number(p.priceRange?.minVariantPrice?.amount);
      const mrp = Number(p.compareAtPriceRange?.minVariantPrice?.amount);
      const off = mrp > price && price > 0 ? 1 - price / mrp : 0;
      return {p, off};
    })
    .filter((x) => x.off >= 0.01 && x.p.availableForSale !== false)
    .sort((a, b) => b.off - a.off)
    .map((x) => x.p);
}

export const blockLabel = (kind) => BLOCK_TYPES[kind]?.label ?? kind;

/** Page handle rules: lowercase letters, digits and dashes. */
export function slugify(value) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Page types offered when creating a page. */
export const PAGE_KINDS = {
  landing: {label: 'Landing page', prefix: ''},
  top: {label: 'Top menu category page', prefix: 'department-'},
  sub: {label: 'Sub category page', prefix: 'category-'},
};

/** Which kind of page a page_layout handle is. */
export function pageKindOf(handle = '') {
  if (handle.startsWith('department-')) return 'top';
  if (handle.startsWith('category-')) return 'sub';
  return 'landing';
}

/** Where a page_layout handle shows up on the site. */
export function layoutPath(handle = '') {
  const kind = pageKindOf(handle);
  if (kind === 'top')
    return `/department/${handle.slice('department-'.length)}`;
  if (kind === 'sub') return `/collections/${handle.slice('category-'.length)}`;
  return `/pages/${handle}`;
}

/**
 * What a block still needs before it can show, or '' when it's ready.
 * `v` holds the editor's values (ids), so this runs in the editor and on the
 * server before saving.
 */
export function missingFor(kind, v = {}) {
  switch (kind) {
    case 'banner':
      return v.image || v.mobile_image || v.video
        ? ''
        : 'Upload an image or a video.';
    case 'category_tiles':
      return v.collections?.length ? '' : 'Add at least one collection.';
    case 'text':
      return v.heading || v.text ? '' : 'Write a heading or some text.';
    case 'home_section':
      return v.home_section ? '' : 'Pick a homepage section.';
    case 'product_carousel':
    case 'product_grid':
    case 'brand_tiles':
    case 'price_bands':
    case 'department':
      return v.collection ? '' : 'Pick a collection.';
    case 'offer_codes':
      return parseLines(v.items).some((x) => x.b)
        ? ''
        : 'Add at least one coupon as CODE | what it gives.';
    case 'countdown':
      // A past end time isn't blocking: the timer simply hides itself, and
      // the page must stay editable after the sale ends.
      return v.ends_at ? '' : 'Set when the sale ends.';
    case 'product_spotlight':
      return v.product ? '' : 'Pick a product.';
    case 'faq':
      return parseLines(v.items).some((x) => x.b)
        ? ''
        : 'Add at least one line as Question | Answer.';
    case 'image_text':
      if (!v.image) return 'Upload an image.';
      return v.heading || v.text ? '' : 'Write a heading or some text.';
    case 'trust_badges':
    case 'deals':
    case 'recently_viewed':
    case 'newsletter':
      return '';
    default:
      return 'Unknown block type.';
  }
}

function value(fields, key) {
  return fields?.find((f) => f.key === key);
}

function imageOf(ref) {
  return ref?.image ?? null;
}

/** Storefront Video → {sources, poster}; null until Shopify has processed it. */
function videoOf(ref) {
  const sources = (ref?.sources ?? [])
    .filter((s) => s?.url && /mp4|webm/i.test(s.mimeType ?? s.format ?? ''))
    .sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  if (!sources.length) return null;
  return {sources, poster: ref.previewImage?.url ?? null};
}

/**
 * Storefront page_section node → plain block object. Unknown kinds and
 * hidden blocks are dropped by the caller.
 */
export function parseBlock(node) {
  const f = node?.fields ?? [];
  const kind = value(f, 'kind')?.value;
  const collectionRef = value(f, 'collection')?.reference;
  const count = Number(value(f, 'count')?.value);
  return {
    id: node.id,
    kind,
    heading: value(f, 'heading')?.value ?? '',
    text: value(f, 'text')?.value ?? '',
    link: value(f, 'link')?.value ?? '',
    count:
      Number.isFinite(count) && count > 0
        ? Math.min(count, 24)
        : (BLOCK_TYPES[kind]?.defaults?.count ?? 8),
    hidden: value(f, 'hidden')?.value === 'true',
    collection: collectionRef?.handle
      ? {handle: collectionRef.handle, title: collectionRef.title}
      : null,
    collections: (value(f, 'collections')?.references?.nodes ?? [])
      .filter((c) => c?.handle)
      .map((c) => ({
        handle: c.handle,
        title: c.title,
        image: c.image ?? c.products?.nodes?.[0]?.featuredImage ?? null,
        empty: !c.products?.nodes?.length,
      })),
    image: imageOf(value(f, 'image')?.reference),
    video: videoOf(value(f, 'video')?.reference),
    mobileImage: imageOf(value(f, 'mobile_image')?.reference),
    homeSection: value(f, 'home_section')?.reference?.handle ?? null,
    items: value(f, 'items')?.value ?? '',
    endsAt: value(f, 'ends_at')?.value ?? null,
    product: value(f, 'product')?.reference?.handle ?? null,
    sort: SORT_OPTIONS[value(f, 'sort')?.value]
      ? value(f, 'sort').value
      : 'best_selling',
  };
}

/** True when a block has what it needs to render. */
export function isRenderable(block) {
  switch (block.kind) {
    case 'banner':
      return Boolean(block.image || block.mobileImage || block.video);
    case 'product_carousel':
    case 'product_grid':
    case 'brand_tiles':
    case 'price_bands':
    case 'department':
      return Boolean(block.collection);
    case 'category_tiles':
      return block.collections.some((c) => !c.empty);
    case 'text':
      return Boolean(block.heading || block.text);
    case 'home_section':
      return Boolean(block.homeSection);
    case 'offer_codes':
      return parseLines(block.items).some((x) => x.b);
    case 'faq':
      return parseLines(block.items).some((x) => x.b);
    case 'countdown':
      return Boolean(block.endsAt) && new Date(block.endsAt) > new Date();
    case 'product_spotlight':
      return Boolean(block.product);
    case 'image_text':
      return Boolean(block.image && (block.heading || block.text));
    case 'trust_badges':
    case 'deals':
    case 'recently_viewed':
    case 'newsletter':
      return true;
    default:
      return false;
  }
}

/** Relative store links stay in-site; "www…" gets https. */
export function normalizeLink(link) {
  const l = String(link ?? '').trim();
  if (!l) return '';
  if (l.startsWith('/') || /^https?:\/\//i.test(l)) return l;
  if (/^[\w-]+(\.[\w-]+)+/.test(l)) return `https://${l}`;
  return `/${l}`;
}
