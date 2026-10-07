import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  isRenderable,
  layoutPath,
  missingFor,
  pageKindOf,
  normalizeLink,
  parseBlock,
  parseLines,
  rankDeals,
  slugify,
} from '../app/lib/page-builder.js';
import {
  newLayoutHandle,
  validateLayout,
} from '../app/lib/page-builder-admin.server.js';

const C1 = 'gid://shopify/Collection/1';
const C2 = 'gid://shopify/Collection/2';

test('page addresses', () => {
  assert.equal(slugify('  Diwali Sale 2026! '), 'diwali-sale-2026');
  assert.equal(layoutPath('diwali-sale'), '/pages/diwali-sale');
  assert.equal(layoutPath('department-men'), '/department/men');
  assert.equal(
    newLayoutHandle({kind: 'landing', title: 'Diwali Sale'}),
    'diwali-sale',
  );
  assert.equal(
    newLayoutHandle({kind: 'top', collectionHandle: 'home-living'}),
    'department-home-living',
  );
  assert.equal(
    newLayoutHandle({kind: 'sub', collectionHandle: 'topwear'}),
    'category-topwear',
  );
  assert.equal(layoutPath('category-topwear'), '/collections/topwear');
  assert.equal(pageKindOf('category-topwear'), 'sub');
  assert.equal(pageKindOf('department-men'), 'top');
  assert.equal(pageKindOf('festive-sale'), 'landing');
  assert.equal(newLayoutHandle({kind: 'landing', title: '!!!'}), '');
});

test('links', () => {
  assert.equal(normalizeLink('/collections/men'), '/collections/men');
  assert.equal(normalizeLink('collections/men'), '/collections/men');
  assert.equal(normalizeLink('www.example.com/x'), 'https://www.example.com/x');
  assert.equal(normalizeLink('https://a.com'), 'https://a.com');
  assert.equal(normalizeLink('  '), '');
});

test('parseBlock reads storefront fields and applies defaults', () => {
  const b = parseBlock({
    id: 'gid://shopify/Metaobject/9',
    fields: [
      {key: 'kind', value: 'product_carousel'},
      {key: 'heading', value: 'Picks'},
      {key: 'collection', value: C1, reference: {handle: 'men', title: 'Men'}},
      {key: 'count', value: '99'},
      {key: 'hidden', value: 'false'},
    ],
  });
  assert.equal(b.kind, 'product_carousel');
  assert.deepEqual(b.collection, {handle: 'men', title: 'Men'});
  assert.equal(b.count, 24);
  assert.equal(b.hidden, false);
  assert.equal(
    parseBlock({id: 'x', fields: [{key: 'kind', value: 'product_grid'}]}).count,
    8,
  );
});

test("isRenderable needs each block type's essentials", () => {
  const base = {collections: [], heading: '', text: ''};
  assert.equal(isRenderable({...base, kind: 'banner'}), false);
  assert.equal(
    isRenderable({...base, kind: 'banner', image: {url: 'x'}}),
    true,
  );
  assert.equal(
    isRenderable({...base, kind: 'product_grid', collection: null}),
    false,
  );
  assert.equal(
    isRenderable({
      ...base,
      kind: 'category_tiles',
      collections: [{empty: true}],
    }),
    false,
  );
  assert.equal(isRenderable({...base, kind: 'text', heading: 'Hi'}), true);
  assert.equal(isRenderable({...base, kind: 'nope'}), false);
});

test('validateLayout accepts good input and clears unused settings', () => {
  const v = validateLayout({
    title: 'Sale',
    blocks: [
      {
        kind: 'product_grid',
        values: {heading: 'A', collection: C1, count: '6', text: 'ignored'},
      },
      {
        kind: 'category_tiles',
        values: {collections: [C1, C2, C1]},
        hidden: true,
      },
    ],
  });
  assert.deepEqual(v.errors, []);
  const f0 = Object.fromEntries(
    v.blocks[0].fields.map((f) => [f.key, f.value]),
  );
  assert.equal(f0.kind, 'product_grid');
  assert.equal(f0.count, '6');
  assert.equal(f0.text, ''); // not a product_grid setting
  const f1 = Object.fromEntries(
    v.blocks[1].fields.map((f) => [f.key, f.value]),
  );
  assert.equal(f1.collections, JSON.stringify([C1, C2]));
  assert.equal(f1.hidden, 'true');
});

test('validateLayout rejects bad input', () => {
  const v = validateLayout({
    title: '',
    blocks: [
      {kind: 'hack'},
      {
        kind: 'product_grid',
        values: {collection: 'gid://shopify/Product/1', count: '50'},
      },
      {kind: 'banner', values: {image: 'https://evil/x.jpg'}},
      {id: 'not-a-gid', kind: 'text', values: {heading: 'x'}},
    ],
  });
  assert.ok(v.errors.includes('The page needs a title.'));
  assert.ok(v.errors.some((e) => /Block 1: unknown block type/.test(e)));
  assert.ok(v.errors.some((e) => /Block 2: pick a collection/.test(e)));
  assert.ok(v.errors.some((e) => /Block 2: Number of products/.test(e)));
  assert.ok(v.errors.some((e) => /Block 3: invalid image/.test(e)));
  assert.ok(v.errors.some((e) => /Block 4: invalid id/.test(e)));
  assert.ok(
    validateLayout({
      title: 'x',
      blocks: Array(41).fill({kind: 'text', values: {heading: 'a'}}),
    }).errors.length > 0,
  );
});

test('shown blocks must have their data; hidden blocks may be unfinished', () => {
  assert.equal(missingFor('banner', {}), 'Upload an image or a video.');
  assert.equal(missingFor('banner', {video: 'gid://shopify/Video/1'}), '');
  assert.equal(
    missingFor('category_tiles', {collections: []}),
    'Add at least one collection.',
  );
  assert.equal(missingFor('product_grid', {collection: C1}), '');
  const v = validateLayout({
    title: 'Sale',
    blocks: [
      {kind: 'product_carousel', values: {heading: 'x'}},
      {kind: 'banner', values: {}, hidden: true},
      {kind: 'banner', values: {video: 'gid://shopify/Video/42'}},
    ],
  });
  assert.deepEqual(v.errors, [
    'Block 1 (Product carousel): Pick a collection.',
  ]);
  const f = Object.fromEntries(v.blocks[2].fields.map((x) => [x.key, x.value]));
  assert.equal(f.video, 'gid://shopify/Video/42');
  assert.ok(
    validateLayout({
      title: 'x',
      blocks: [{kind: 'banner', values: {video: 'https://x.mp4'}}],
    }).errors.some((e) => /invalid video/.test(e)),
  );
});

test('parseLines splits "A | B" lines and drops blanks', () => {
  assert.deepEqual(
    parseLines(' SAVE200 | ₹200 off \n\nNEW15|15% | first order\nloose'),
    [
      {a: 'SAVE200', b: '₹200 off'},
      {a: 'NEW15', b: '15% | first order'},
      {a: 'loose', b: ''},
    ],
  );
  assert.deepEqual(parseLines(undefined), []);
  assert.deepEqual(parseLines(' | orphan'), []);
});

test('conversion blocks: what each needs before it can show', () => {
  assert.match(
    missingFor('offer_codes', {items: 'SAVE200'}),
    /CODE \| what it gives/,
  );
  assert.equal(missingFor('offer_codes', {items: 'SAVE200 | ₹200 off'}), '');
  assert.match(
    missingFor('faq', {items: 'Just a question?'}),
    /Question \| Answer/,
  );
  assert.equal(missingFor('faq', {items: 'Returns? | 7 days'}), '');
  assert.equal(missingFor('countdown', {}), 'Set when the sale ends.');
  // An ended sale must not lock the page: the timer just hides.
  assert.equal(missingFor('countdown', {ends_at: '2020-01-01T00:00:00Z'}), '');
  assert.equal(missingFor('product_spotlight', {}), 'Pick a product.');
  assert.equal(missingFor('image_text', {heading: 'x'}), 'Upload an image.');
  assert.equal(
    missingFor('image_text', {image: 'gid://shopify/MediaImage/1'}),
    'Write a heading or some text.',
  );
  for (const k of ['trust_badges', 'deals', 'recently_viewed', 'newsletter']) {
    assert.equal(missingFor(k, {}), '', k);
  }
});

test('expired countdowns never render', () => {
  const future = new Date(Date.now() + 3600e3).toISOString();
  assert.equal(isRenderable({kind: 'countdown', endsAt: future}), true);
  assert.equal(
    isRenderable({kind: 'countdown', endsAt: '2020-01-01T00:00:00Z'}),
    false,
  );
  assert.equal(isRenderable({kind: 'countdown', endsAt: null}), false);
});

test('rankDeals keeps real discounts only, biggest % off first', () => {
  const p = (id, price, mrp, availableForSale = true) => ({
    id,
    availableForSale,
    priceRange: {minVariantPrice: {amount: String(price)}},
    compareAtPriceRange: {minVariantPrice: {amount: String(mrp)}},
  });
  const out = rankDeals([
    p('full', 999, 0),
    p('ten', 900, 1000),
    p('half', 500, 1000),
    p('soldout', 100, 1000, false),
    p('tiny', 999.5, 1000), // 0.05% off: noise, not a deal
    p('free', 0, 1000), // ₹0 price is a data error, not a deal
  ]);
  assert.deepEqual(
    out.map((x) => x.id),
    ['half', 'ten'],
  );
});

test('validateLayout cleans conversion fields', () => {
  const v = validateLayout({
    title: 'Sale',
    blocks: [
      {
        kind: 'countdown',
        values: {
          heading: 'Ends soon',
          ends_at: '2030-01-01T10:00:00+05:30',
          text: 'x',
        },
      },
      {
        kind: 'product_spotlight',
        values: {product: 'gid://shopify/Product/9', items: 'not used'},
      },
      {kind: 'product_grid', values: {collection: C1, sort: 'price_asc'}},
      {kind: 'product_carousel', values: {collection: C1, sort: 'DROP TABLE'}},
    ],
  });
  assert.deepEqual(v.errors, []);
  const f = (i) =>
    Object.fromEntries(v.blocks[i].fields.map((x) => [x.key, x.value]));
  assert.equal(f(0).ends_at, '2030-01-01T04:30:00.000Z');
  assert.equal(f(1).product, 'gid://shopify/Product/9');
  assert.equal(f(1).items, ''); // not a spotlight setting
  assert.equal(f(2).sort, 'price_asc');
  assert.equal(f(3).sort, ''); // unknown sort ignored
  const bad = validateLayout({
    title: 'x',
    blocks: [
      {kind: 'product_spotlight', values: {product: C1}},
      {kind: 'countdown', values: {ends_at: 'someday'}},
      {kind: 'faq', values: {items: 'Q | ' + 'a'.repeat(5000)}},
    ],
  });
  assert.ok(bad.errors.some((e) => /Block 1: pick a product/.test(e)));
  assert.ok(
    bad.errors.some((e) => /Block 2: Ends at is not a valid date/.test(e)),
  );
  assert.ok(bad.errors.some((e) => /Block 3: Questions is too long/.test(e)));
});
