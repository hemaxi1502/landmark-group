import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  isRenderable,
  layoutPath,
  normalizeLink,
  parseBlock,
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
  assert.equal(newLayoutHandle({kind: 'landing', title: 'Diwali Sale'}), 'diwali-sale');
  assert.equal(newLayoutHandle({kind: 'department', collectionHandle: 'home-living'}), 'department-home-living');
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
  assert.equal(parseBlock({id: 'x', fields: [{key: 'kind', value: 'product_grid'}]}).count, 8);
});

test('isRenderable needs each block type\'s essentials', () => {
  const base = {collections: [], heading: '', text: ''};
  assert.equal(isRenderable({...base, kind: 'banner'}), false);
  assert.equal(isRenderable({...base, kind: 'banner', image: {url: 'x'}}), true);
  assert.equal(isRenderable({...base, kind: 'product_grid', collection: null}), false);
  assert.equal(isRenderable({...base, kind: 'category_tiles', collections: [{empty: true}]}), false);
  assert.equal(isRenderable({...base, kind: 'text', heading: 'Hi'}), true);
  assert.equal(isRenderable({...base, kind: 'nope'}), false);
});

test('validateLayout accepts good input and clears unused settings', () => {
  const v = validateLayout({
    title: 'Sale',
    blocks: [
      {kind: 'product_grid', values: {heading: 'A', collection: C1, count: '6', text: 'ignored'}},
      {kind: 'category_tiles', values: {collections: [C1, C2, C1]}, hidden: true},
    ],
  });
  assert.deepEqual(v.errors, []);
  const f0 = Object.fromEntries(v.blocks[0].fields.map((f) => [f.key, f.value]));
  assert.equal(f0.kind, 'product_grid');
  assert.equal(f0.count, '6');
  assert.equal(f0.text, ''); // not a product_grid setting
  const f1 = Object.fromEntries(v.blocks[1].fields.map((f) => [f.key, f.value]));
  assert.equal(f1.collections, JSON.stringify([C1, C2]));
  assert.equal(f1.hidden, 'true');
});

test('validateLayout rejects bad input', () => {
  const v = validateLayout({
    title: '',
    blocks: [
      {kind: 'hack'},
      {kind: 'product_grid', values: {collection: 'gid://shopify/Product/1', count: '50'}},
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
  assert.ok(validateLayout({title: 'x', blocks: Array(41).fill({kind: 'text', values: {heading: 'a'}})}).errors.length > 0);
});
