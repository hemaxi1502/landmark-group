/**
 * Run: node --test tests/
 * Fixtures mirror the exact shapes returned by the Landmark Group dev store.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildHomeSections, toRelativeUrl} from '../app/lib/home-content.js';
const img = (n, w = 410, h = 104) => ({
  __typename: 'MediaImage',
  image: {
    url: `https://cdn.shopify.com/s/files/1/0748/7022/7030/files/img${n}.jpg?v=1`,
    altText: '',
    width: w,
    height: h,
  },
});
const text = (key, value) => ({
  key,
  type: 'single_line_text_field',
  value,
  reference: null,
});
const fileField = (key, n) => ({
  key,
  type: 'file_reference',
  value: `gid://shopify/MediaImage/${n}`,
  reference: img(n),
});
const banner = (id, n, alt, collection) => ({
  __typename: 'Metaobject',
  id,
  type: 'banners',
  handle: id,
  fields: [
    fileField('file', n),
    text('alt', alt),
    {key: 'url', type: 'url', value: null, reference: null},
    {
      key: 'collections',
      type: 'collection_reference',
      value: collection ? 'gid://shopify/Collection/1' : null,
      reference: collection
        ? {__typename: 'Collection', handle: collection}
        : null,
    },
  ],
});
const card = (id, type, n, order, extra = []) => ({
  __typename: 'Metaobject',
  id,
  type,
  handle: id,
  fields: [
    fileField('image', n),
    text('alt', null),
    text('sort_order', String(order)),
    ...extra,
    {key: 'url', type: 'url', value: null, reference: null},
    {
      key: 'collection',
      type: 'collection_reference',
      value: null,
      reference: null,
    },
  ],
});
const rawSections = [
  {
    id: 'S-hero',
    handle: 'hero-slider',
    heading: {reference: null},
    order: {value: '1'},
    mobileBanner: {reference: null},
    data: {
      references: {
        nodes: [
          {id: 'H2', type: 'hero_slider'},
          {id: 'H1', type: 'hero_slider'},
        ],
      },
    },
  },
  {
    id: 'S-benefits',
    handle: 'our-benefits',
    heading: {reference: {title: {value: 'Our Benefits'}}},
    order: {value: '4'},
    mobileBanner: {reference: null},
    data: {
      references: {nodes: [{id: 'D-benefits', type: 'our_benefits_data'}]},
    },
  },
  {
    id: 'S-banner',
    handle: 'home-page-banner',
    heading: {reference: {title: {value: 'Home Page Banner'}}},
    order: {value: '2'},
    mobileBanner: {reference: {id: 'B-mobile'}},
    data: {references: {nodes: [{id: 'B-desk', type: 'banners'}]}},
  },
  {
    id: 'S-topcat',
    handle: 'top-categories',
    heading: {reference: {title: {value: 'Top Categories'}}},
    order: {value: '9'},
    mobileBanner: {reference: null},
    data: {
      references: {nodes: [{id: 'D-topcat', type: 'top_categories_data'}]},
    },
  },
];
const store = {
  H1: {
    __typename: 'Metaobject',
    id: 'H1',
    type: 'hero_slider',
    handle: 'hero-slider-1',
    fields: [
      fileField('desktop_image', 1),
      fileField('mobile_image', 2),
      text('sort_order', '1'),
      text('alt_text', 'B1G1'),
      {
        key: 'url',
        type: 'url',
        value: 'https://www.lifestylestores.com/in/en/search?q=b1g1',
        reference: null,
      },
      {
        key: 'collection',
        type: 'collection_reference',
        value: null,
        reference: null,
      },
    ],
  },
  H2: {
    __typename: 'Metaobject',
    id: 'H2',
    type: 'hero_slider',
    handle: 'slider-2',
    fields: [
      fileField('desktop_image', 3),
      text('sort_order', '2'),
      text('alt_text', 'Festive'),
      {key: 'url', type: 'url', value: null, reference: null},
      {
        key: 'collection',
        type: 'collection_reference',
        value: 'gid://shopify/Collection/9',
        reference: {__typename: 'Collection', handle: 'women'},
      },
    ],
  },
  'B-desk': banner('B-desk', 10, 'Buy 2 15% Off Desktop'),
  'B-mobile': banner('B-mobile', 11, 'Buy 2 15% Off Mobile'),
  'D-benefits': {
    __typename: 'Metaobject',
    id: 'D-benefits',
    type: 'our_benefits_data',
    handle: 'our-benefits-data',
    fields: [
      {
        key: 'our_benefits_bar',
        type: 'list.metaobject_reference',
        value: '["a","b"]',
        reference: null,
        references: {
          nodes: [
            card('bar2', 'our_benefits_bar', 21, 2, [
              text('heading', '250+ Global Brands'),
            ]),
            card('bar1', 'our_benefits_bar', 20, 1, [
              text('heading', 'Free Shipping'),
            ]),
          ],
        },
      },
      {
        key: 'our_benefits_collection_section',
        type: 'list.metaobject_reference',
        value: '["G1"]',
        reference: null,
        references: {
          nodes: [
            {
              __typename: 'Metaobject',
              id: 'G1',
              type: 'our_benefits_collection_section',
              handle: 'g1',
              fields: [
                fileField('heading_image', 30),
                {
                  key: 'our_benefits_collection_card',
                  type: 'list.metaobject_reference',
                  value: '["c1","c2"]',
                  reference: null,
                },
              ],
            },
          ],
        },
      },
      {
        key: 'our_benefits_banner',
        type: 'metaobject_reference',
        value: 'x',
        reference: banner('BB', 40, 'On All Orders'),
        references: null,
      },
      {
        key: 'chartbusters_banner_mobile',
        type: 'metaobject_reference',
        value: 'y',
        reference: banner('BBm', 41, 'On All Orders m'),
        references: null,
      },
    ],
  },
  G1: {
    __typename: 'Metaobject',
    id: 'G1',
    type: 'our_benefits_collection_section',
    handle: 'g1',
    fields: [
      {
        key: 'heading_image',
        type: 'file_reference',
        value: 'z',
        reference: img(30, 990, 100),
        references: null,
      },
      {
        key: 'our_benefits_collection_card',
        type: 'list.metaobject_reference',
        value: '["c1","c2"]',
        reference: null,
        references: {
          nodes: [
            card('c2', 'our_benefits_collection_card', 51, 2),
            card('c1', 'our_benefits_collection_card', 50, 1),
          ],
        },
      },
    ],
  },
  'D-topcat': {
    __typename: 'Metaobject',
    id: 'D-topcat',
    type: 'top_categories_data',
    handle: 'top-categories',
    fields: [
      {
        key: 'categories',
        type: 'list.metaobject_reference',
        value: '[]',
        reference: null,
        references: {
          nodes: [
            card('w1', 'top_categories_sub_categories', 60, 1, [
              text('name', 'New In'),
              text('category', 'Women'),
            ]),
            card('m1', 'top_categories_sub_categories', 61, 1, [
              text('name', 'T-Shirts'),
              text('category', 'Men'),
            ]),
            card('w2', 'top_categories_sub_categories', 62, 2, [
              text('name', 'Dresses'),
              text('category', 'Women'),
            ]),
          ],
        },
      },
    ],
  },
};
const calls = [];
const fetchNodes = async (ids) => {
  calls.push(ids);
  return ids.map((id) => store[id] ?? null);
};
test('builds every section type from the real store shapes', async () => {
  const sections = await buildHomeSections(rawSections, fetchNodes);
  assert.deepEqual(
    sections.map((s) => s.handle),
    ['hero-slider', 'home-page-banner', 'our-benefits', 'top-categories'],
  );
  const [hero, offer, benefits, topcat] = sections;
  // Hero: ordered by sort_order, desktop+mobile images, links resolved
  assert.equal(hero.dataType, 'hero_slider');
  assert.deepEqual(
    hero.lists.slides.map((s) => s.alt),
    ['B1G1', 'Festive'],
  );
  assert.ok(hero.lists.slides[0].mobileImage?.url.includes('img2'));
  assert.equal(hero.lists.slides[0].href, '/in/en/search?q=b1g1');
  assert.equal(hero.lists.slides[1].href, '/collections/women');
  // Standalone banner + separate mobile banner from home_page.mobile_banner
  assert.equal(offer.dataType, 'banners');
  assert.equal(offer.banner?.alt, 'Buy 2 15% Off Desktop');
  assert.equal(offer.bannerMobile?.alt, 'Buy 2 15% Off Mobile');
  // Benefits: bar list sorted, group resolved via pass 3, banners split desktop/mobile
  assert.deepEqual(
    benefits.lists.our_benefits_bar.map((c) => c.text.heading),
    ['Free Shipping', '250+ Global Brands'],
  );
  assert.equal(benefits.groups.length, 1);
  assert.ok(benefits.groups[0].headingImage?.url.includes('img30'));
  assert.deepEqual(
    benefits.groups[0].cards.map((c) => c.id),
    ['c1', 'c2'],
  );
  assert.equal(benefits.banner?.alt, 'On All Orders');
  assert.equal(benefits.bannerMobile?.alt, 'On All Orders m');
  // Top categories: card text fields kept for tab grouping
  assert.deepEqual(
    topcat.cards.map((c) => `${c.text.category}:${c.text.name}`),
    ['Women:New In', 'Men:T-Shirts', 'Women:Dresses'],
  );
  // Fetch plan: one call per section (+ mobile banner in the same call), one call for groups
  assert.equal(calls.length, 5);
  assert.deepEqual(calls[1], ['D-benefits']);
  assert.deepEqual(calls[2], ['B-desk', 'B-mobile']);
  assert.deepEqual(calls[4], ['G1']);
});
test('relative URL handling', () => {
  assert.equal(
    toRelativeUrl(
      'https://landmarkgroup-store.myshopify.com/collections/men?x=1',
    ),
    '/collections/men?x=1',
  );
  assert.equal(toRelativeUrl('#'), undefined);
  assert.equal(toRelativeUrl('https://example.com/a'), 'https://example.com/a');
  assert.equal(toRelativeUrl(null), undefined);
});
