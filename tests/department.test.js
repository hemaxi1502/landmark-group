import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBrands,
  buildCategories,
  buildOtherDepartments,
  buildPriceBands,
  buildStats,
  buildStyles,
  departmentPath,
  findMenuItem,
} from '../app/lib/department.js';

const img = (n) => ({url: `https://cdn/${n}.jpg`, width: 800, height: 1000});
const product = (vendor, price) => ({
  vendor,
  priceRange: {minVariantPrice: {amount: String(price)}},
  images: {nodes: [img(vendor)]},
});
const filters = [
  {
    id: 'filter.v.availability',
    values: [
      {id: 'a1', label: 'In stock', count: 18, input: '{"available":true}'},
      {id: 'a2', label: 'Out of stock', count: 0, input: '{"available":false}'},
    ],
  },
  {
    id: 'filter.p.vendor',
    values: [
      {id: 'v1', label: 'FORCA', count: 3, input: '{"productVendor":"FORCA"}'},
      {
        id: 'v2',
        label: 'BOSSINI',
        count: 7,
        input: '{"productVendor":"BOSSINI"}',
      },
      {id: 'v3', label: 'EMPTY', count: 0, input: '{"productVendor":"EMPTY"}'},
    ],
  },
  {
    id: 'filter.p.m.custom.design',
    values: [
      {
        id: 'd1',
        label: 'Solid',
        count: 9,
        input: '{"productMetafield":{"key":"design","value":"Solid"}}',
      },
      {
        id: 'd2',
        label: 'Printed',
        count: 4,
        input: '{"productMetafield":{"key":"design","value":"Printed"}}',
      },
    ],
  },
];
const menu = {
  items: [
    {
      id: 'm1',
      title: 'Men (https://cdn/x.webp)',
      url: 'https://shop.myshopify.com/collections/men',
      items: [
        {
          id: 'c1',
          title: 'Topwear',
          resource: {
            __typename: 'Collection',
            handle: 'topwear',
            image: null,
            products: {nodes: [{featuredImage: img('top')}]},
          },
        },
        {
          id: 'c2',
          title: 'Empty',
          resource: {
            __typename: 'Collection',
            handle: 'empty',
            image: null,
            products: {nodes: []},
          },
        },
        {
          id: 'c3',
          title: 'Topwear again',
          resource: {
            __typename: 'Collection',
            handle: 'topwear',
            image: null,
            products: {nodes: [{featuredImage: img('top')}]},
          },
        },
        {id: 'c4', title: 'A page', resource: {__typename: 'Page'}},
      ],
    },
    {
      id: 'm2',
      title: 'Women',
      url: 'https://shop.myshopify.com/collections/women',
      items: [],
    },
    {
      id: 'm3',
      title: 'Offers',
      url: 'https://shop.myshopify.com/pages/offers',
      items: [],
    },
  ],
};

test('departmentPath only rewrites plain collection paths', () => {
  assert.equal(departmentPath('/collections/men'), '/department/men');
  assert.equal(
    departmentPath('/collections/men?sort=x'),
    '/collections/men?sort=x',
  );
  assert.equal(departmentPath('/pages/about'), '/pages/about');
  assert.equal(departmentPath(null), null);
});

test('categories skip empty collections, duplicates and non-collections', () => {
  const cats = buildCategories(findMenuItem(menu, 'men'));
  assert.deepEqual(
    cats.map((c) => c.to),
    ['/collections/topwear'],
  );
  assert.equal(cats[0].image.url, 'https://cdn/top.jpg');
});

test('brands are sorted by count, skip empty ones and get a product photo', () => {
  const brands = buildBrands('men', filters, [
    product('FORCA', 999),
    product('BOSSINI', 1499),
  ]);
  assert.deepEqual(
    brands.map((b) => b.title),
    ['BOSSINI', 'FORCA'],
  );
  assert.equal(brands[0].image.url, 'https://cdn/BOSSINI.jpg');
  assert.match(brands[0].to, /^\/collections\/men\?filter=/);
  assert.equal(
    JSON.parse(decodeURIComponent(brands[0].to.split('filter=')[1]))
      .productVendor,
    'BOSSINI',
  );
});

test('price bands only appear when they add products and never contain everything', () => {
  const bands = buildPriceBands(
    'men',
    [399, 450, 899, 1499, 2599, 6000].map((p) => product('X', p)),
  );
  assert.deepEqual(
    bands.map((b) => [b.max, b.count]),
    [
      [499, 2],
      [999, 3],
      [1999, 4],
      [2999, 5],
    ],
  );
  assert.equal(buildPriceBands('men', [product('X', 300)]).length, 0);
});

test('styles, stats and other departments', () => {
  assert.deepEqual(
    buildStyles('men', filters).map((s) => s.title),
    ['Solid', 'Printed'],
  );
  assert.deepEqual(buildStats(filters), {inStock: 18, brands: 2});
  assert.deepEqual(
    buildOtherDepartments(menu, 'men').map((o) => o.to),
    ['/department/women'],
  );
});
