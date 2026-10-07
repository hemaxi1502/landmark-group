/**
 * Homepage content model.
 *
 * The store models the homepage as a list of `home_page` metaobjects. Each one has:
 *   heading        → `headings` metaobject (text)
 *   sort_order     → position on the page
 *   mobile_banner  → optional `banners` metaobject
 *   section_data   → either the items themselves (hero_slider, banners) or ONE
 *                    "<name>_data" metaobject holding banners + lists of cards
 *
 * Every *_data type follows the same convention, so instead of one parser per
 * section we normalise them generically:
 *   - field → `banners` metaobject or image, key contains "mobile" → mobile banner
 *   - field → `banners` metaobject or image otherwise              → desktop banner
 *   - list field of card metaobjects (they have `image`)            → lists[key]
 *   - list field of group metaobjects (they have a nested list)     → groups[key]
 *
 * A new section type added in Shopify admin that follows the same convention
 * renders automatically through the generic fallback in <HomeSections>.
 */
/**
 * Fetching is split in passes because the full tree in one query exceeds
 * Shopify's query-complexity limit (measured: 8,960 vs a 1,000 cap):
 *   1. HOME_SECTIONS_QUERY — the section list + ids of each section's data entries
 *   2. HOME_NODES_QUERY    — one call per section (in parallel) for its data + cards
 *   3. HOME_NODES_QUERY    — only for "group" entries whose cards sit one level deeper
 *                            (e.g. our_benefits_collection_section)
 * Use `loadHomeSections()` from the route; it runs all passes.
 */
export const HOME_SECTIONS_QUERY = `#graphql
  query HomeSections($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    sections: metaobjects(type: "home_page", first: 20) {
      nodes {
        id
        handle
        heading: field(key: "heading") {
          reference {
            ... on Metaobject {
              title: field(key: "heading") {
                value
              }
            }
          }
        }
        order: field(key: "sort_order") {
          value
        }
        hidden: field(key: "hidden") {
          value
        }
        mobileBanner: field(key: "mobile_banner") {
          reference {
            ... on Metaobject {
              id
            }
          }
        }
        data: field(key: "section_data") {
          references(first: 10) {
            nodes {
              ... on Metaobject {
                id
                type
              }
            }
          }
        }
      }
    }
  }
`;
export const HOME_NODES_QUERY = `#graphql
  fragment HomeImage on MediaImage {
    image {
      url
      altText
      width
      height
    }
  }
  fragment HomeLeaf on Metaobject {
    id
    type
    handle
    fields {
      key
      type
      value
      reference {
        __typename
        ...HomeImage
        ... on Collection {
          handle
        }
      }
    }
  }
  query HomeNodes($ids: [ID!]!, $country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    nodes(ids: $ids) {
      __typename
      ... on Metaobject {
        id
        type
        handle
        fields {
          key
          type
          value
          reference {
            __typename
            ...HomeImage
            ... on Collection {
              handle
            }
            ...HomeLeaf
          }
          references(first: 50) {
            nodes {
              __typename
              ...HomeLeaf
            }
          }
        }
      }
    }
  }
`;
/** Turns an absolute store URL into a relative path so links stay inside Hydrogen. */
export function toRelativeUrl(url) {
  if (!url) return undefined;
  if (url.startsWith('/')) return url;
  if (url === '#') return undefined;
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname.endsWith('myshopify.com') ||
      parsed.hostname.endsWith('lifestylestores.com')
    ) {
      return `${parsed.pathname}${parsed.search}`;
    }
    return url;
  } catch {
    return undefined;
  }
}
function field(fields, key) {
  return fields?.find((f) => f.key === key);
}
function imageOf(ref) {
  return ref?.__typename === 'MediaImage' && ref.image ? ref.image : undefined;
}
/** Link precedence: collection reference → url field → nothing (tile is not clickable). */
function hrefOf(fields) {
  const collection =
    field(fields, 'collection')?.reference ??
    field(fields, 'collections')?.reference;
  if (collection?.__typename === 'Collection' && collection.handle) {
    return `/collections/${collection.handle}`;
  }
  return toRelativeUrl(field(fields, 'url')?.value);
}
function textFields(fields) {
  const out = {};
  for (const f of fields ?? []) {
    if (
      f.value &&
      (f.type === 'single_line_text_field' ||
        f.type === 'multi_line_text_field')
    ) {
      out[f.key] = f.value;
    }
  }
  return out;
}
function toCard(ref) {
  if (!ref?.fields) return undefined;
  const f = ref.fields;
  const image =
    imageOf(field(f, 'image')?.reference) ??
    imageOf(field(f, 'desktop_image')?.reference);
  const text = textFields(f);
  return {
    id: ref.id ?? ref.handle ?? Math.random().toString(36),
    image,
    mobileImage: imageOf(field(f, 'mobile_image')?.reference),
    alt:
      text.alt ??
      text.alt_text ??
      text.name ??
      text.title ??
      image?.altText ??
      '',
    href: hrefOf(f),
    order: Number(text.sort_order ?? 999),
    text,
  };
}
/** A `banners` metaobject (file + alt + url + collections) or a raw image field. */
function toBanner(ref) {
  const raw = imageOf(ref);
  if (raw) return {image: raw, alt: raw.altText ?? ''};
  if (!ref?.fields) return undefined;
  const image = imageOf(field(ref.fields, 'file')?.reference);
  if (!image) return undefined;
  return {
    image,
    alt: field(ref.fields, 'alt')?.value ?? image.altText ?? '',
    href: hrefOf(ref.fields),
  };
}
const byOrder = (a, b) => a.order - b.order;
function isBannerRef(ref) {
  return ref?.__typename === 'MediaImage' || ref?.type === 'banners';
}
/** Normalise one *_data metaobject into banners, card lists and groups. */
function readDataObject(target, data, groups) {
  for (const f of data?.fields ?? []) {
    if (f.reference && isBannerRef(f.reference)) {
      const banner = toBanner(f.reference);
      if (!banner) continue;
      if (f.key.includes('mobile')) target.bannerMobile ??= banner;
      else target.banner ??= banner;
      continue;
    }
    const nodes = f.references?.nodes?.filter(Boolean) ?? [];
    if (!nodes.length) continue;
    // A node pointing at a further list (e.g. our_benefits_collection_section) is a group;
    // its cards were fetched in pass 3.
    const isGroup = nodes.some((n) => n?.id && groups.has(n.id));
    if (isGroup) {
      for (const node of nodes) {
        const full = node?.id ? groups.get(node.id) : undefined;
        const listField = full?.fields?.find(
          (nf) => nf.references?.nodes?.length,
        );
        target.groups.push({
          id: node?.id ?? f.key,
          headingImage: imageOf(
            field(full?.fields ?? node?.fields, 'heading_image')?.reference,
          ),
          cards: (listField?.references?.nodes ?? [])
            .map(toCard)
            .filter((c) => !!c)
            .sort(byOrder),
        });
      }
      continue;
    }
    const cards = nodes
      .map(toCard)
      .filter((c) => !!c)
      .sort(byOrder);
    if (cards.length) target.lists[f.key] = cards;
  }
}
/** A list entry whose own list field has ids but no resolved references is a group (one level deeper). */
function groupIdsOf(node) {
  const ids = [];
  for (const f of node?.fields ?? []) {
    for (const ref of f.references?.nodes ?? []) {
      const nested = ref?.fields?.find(
        (nf) => nf.type === 'list.metaobject_reference' && nf.value,
      );
      if (nested && ref?.id) ids.push(ref.id);
    }
  }
  return ids;
}
/**
 * Runs all fetch passes and returns sections ready to render, in sort order.
 * `fetchNodes` is injected so the same logic is unit-testable without a network.
 */
export async function buildHomeSections(rawSections, fetchNodes) {
  // Pass 2 — each section's data entries (+ its mobile banner) in parallel
  const perSection = await Promise.all(
    rawSections.map((s) => {
      const ids = (s.data?.references?.nodes ?? [])
        .map((n) => n.id)
        .filter((id) => !!id);
      const mobileId = s.mobileBanner?.reference?.id;
      return ids.length || mobileId
        ? fetchNodes(mobileId ? [...ids, mobileId] : ids)
        : Promise.resolve([]);
    }),
  );
  // Pass 3 — group entries (one request for all of them)
  const groupIds = perSection.flat().flatMap(groupIdsOf);
  const groupNodes = groupIds.length ? await fetchNodes(groupIds) : [];
  const groups = new Map(groupNodes.filter(Boolean).map((g) => [g.id, g]));
  return rawSections
    .map((raw, i) => {
      const mobileId = raw.mobileBanner?.reference?.id;
      const fetched = perSection[i].filter(Boolean);
      const refs = fetched.filter((n) => n?.id !== mobileId);
      const mobile = fetched.find((n) => mobileId && n?.id === mobileId);
      const section = {
        id: raw.id,
        handle: raw.handle,
        heading: raw.heading?.reference?.title?.value ?? undefined,
        order: Number(raw.order?.value ?? 999),
        dataType:
          refs[0]?.type ?? raw.data?.references?.nodes[0]?.type ?? 'unknown',
        lists: {},
        cards: [],
        groups: [],
      };
      const isItemList =
        refs.length > 0 &&
        refs.every((r) => r?.type === 'hero_slider' || r?.type === 'banners');
      if (isItemList) {
        if (section.dataType === 'banners') section.banner = toBanner(refs[0]);
        else
          section.lists.slides = refs
            .map(toCard)
            .filter((c) => !!c)
            .sort(byOrder);
      } else {
        for (const ref of refs) readDataObject(section, ref, groups);
      }
      section.bannerMobile ??= toBanner(mobile ?? null);
      section.cards = Object.values(section.lists)[0] ?? [];
      return section;
    })
    .sort((a, b) => a.order - b.order);
}
/** Route helper: runs the passes against the Storefront API with caching. */
/**
 * Route helper: runs the passes against the Storefront API with caching.
 *
 * `skipHandles` are sections already rendered by other components
 * (HeroSlider / ShowcaseSection). They're returned in `order` so the page can
 * interleave everything by sort_order, but their data isn't fetched twice.
 *
 * @param {import('@shopify/hydrogen').Storefront} storefront
 * @param {{skipHandles?: string[]}} [options]
 * @returns {Promise<{order: Array<{handle: string, order: number}>, sections: Array<object>}>}
 */
export async function loadHomeSections(storefront, {skipHandles = []} = {}) {
  const cache = storefront.CacheShort();
  const {sections} = await storefront.query(HOME_SECTIONS_QUERY, {cache});
  const fetchNodes = async (ids) => {
    const res = await storefront.query(HOME_NODES_QUERY, {
      variables: {ids},
      cache,
    });
    return res.nodes;
  };
  const skip = new Set(skipHandles);
  // Sections switched off in the editor (or in admin: "Hide section").
  const visible = sections.nodes.filter((n) => n.hidden?.value !== 'true');
  const order = visible
    .map((n) => ({handle: n.handle, order: Number(n.order?.value ?? 999)}))
    .sort((x, y) => x.order - y.order);
  const built = await buildHomeSections(
    visible.filter((n) => !skip.has(n.handle)),
    fetchNodes,
  );
  return {order, sections: built};
}
