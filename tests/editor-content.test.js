/**
 * Run: node --test tests/
 * Fixtures mirror the Admin API shapes from the Landmark Group dev store.
 */
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {
  buildEditorTree,
  displayUrl,
  normalizeUrl,
  planUpdates,
} from '../app/lib/editor-content.server.js';

const SHOP = 'landmark-group-yk2c2n09.myshopify.com';
const img = (n) => ({image: {url: `https://cdn.shopify.com/img${n}.jpg?v=1`}});
const card = (id, sort, url = null, type = 'bestsellers_collections_card') => ({
  id,
  handle: id.split('/').pop(),
  type,
  displayName: id,
  definition: {name: 'Bestsellers Collections Card'},
  fields: [
    {key: 'image', type: 'file_reference', value: 'x', reference: img(id)},
    {key: 'alt', type: 'single_line_text_field', value: null, reference: null},
    {key: 'sort_order', type: 'single_line_text_field', value: String(sort), reference: null},
    {key: 'url', type: 'url', value: url, reference: null},
  ],
});
const home = (id, handle, sort, sectionData, heading) => ({
  id,
  handle,
  displayName: handle,
  fields: [
    {
      key: 'heading',
      type: 'metaobject_reference',
      value: heading ? 'h' : null,
      reference: heading ? {fields: [{key: 'heading', value: heading}]} : null,
    },
    {key: 'section_data', type: 'list.mixed_reference', value: JSON.stringify(sectionData), reference: null},
    {key: 'sort_order', type: 'single_line_text_field', value: String(sort), reference: null},
    {key: 'mobile_banner', type: 'metaobject_reference', value: null, reference: null},
  ],
});

const nodes = {
  c1: card('c1', 2, 'https://landmarkgroup-store.myshopify.com/collections/tops'),
  c2: card('c2', 1),
  data: {
    id: 'data',
    handle: 'bestsellers-data',
    type: 'bestsellers_data',
    definition: {name: 'Bestsellers Data'},
    fields: [
      {key: 'bestsellers_collections_card', type: 'list.metaobject_reference', value: '["c1","c2"]'},
      {key: 'bestsellers_banner', type: 'metaobject_reference', value: 'b1'},
    ],
  },
  b1: {
    id: 'b1',
    handle: 'banner',
    type: 'banners',
    definition: {name: 'Banners'},
    fields: [
      {key: 'file', type: 'file_reference', value: 'x', reference: img('b1')},
      {key: 'alt', type: 'single_line_text_field', value: 'Big banner'},
      {key: 'url', type: 'url', value: null},
    ],
  },
  s1: card('s1', 1, null, 'hero_slider'),
};

const tree = buildEditorTree(
  [home('H2', 'bestseller', 5, ['data'], 'Bestsellers'), home('H1', 'hero-slider', 1, ['s1'])],
  nodes,
);

test('sections are ordered by sort_order and titled from the heading', () => {
  assert.deepEqual(tree.sections.map((s) => s.handle), ['hero-slider', 'bestseller']);
  assert.equal(tree.sections[1].title, 'Bestsellers');
  assert.equal(tree.sections[0].title, 'Hero slider');
});

test('data containers are walked through; cards are grouped and sorted', () => {
  const groups = tree.sections[1].groups;
  assert.deepEqual(groups.map((g) => g.label), ['Bestsellers collections card', 'Bestsellers banner']);
  assert.deepEqual(groups[0].itemIds, ['c2', 'c1']);
  assert.equal(groups[0].sortable, true);
  assert.equal(groups[1].sortable, false);
  assert.equal(tree.items.b1.label, 'Big banner');
  assert.equal(tree.items.b1.image, 'https://cdn.shopify.com/imgb1.jpg?v=1');
  assert.equal(tree.items.data, undefined);
});

test('normalizeUrl makes paths absolute on the store domain', () => {
  assert.deepEqual(normalizeUrl('/collections/women', SHOP), {value: `https://${SHOP}/collections/women`});
  assert.deepEqual(normalizeUrl('collections/women', SHOP), {value: `https://${SHOP}/collections/women`});
  assert.deepEqual(normalizeUrl('https://example.com/a', SHOP), {value: 'https://example.com/a'});
  assert.deepEqual(normalizeUrl('www.example.com', SHOP), {value: 'https://www.example.com/'});
  assert.deepEqual(normalizeUrl('  ', SHOP), {value: ''});
  assert.ok('error' in normalizeUrl('http://', SHOP));
});

test('displayUrl shows store links as paths and leaves others alone', () => {
  assert.equal(displayUrl('https://landmarkgroup-store.myshopify.com/collections/tops', SHOP), '/collections/tops');
  assert.equal(displayUrl('https://example.com/x', SHOP), 'https://example.com/x');
  assert.equal(displayUrl(null, SHOP), '');
});

test('planUpdates only writes allowed fields on homepage entries', () => {
  const plan = planUpdates(
    [
      {id: 'H2', sortOrder: 1},
      {id: 'c1', sortOrder: 1, url: '/collections/tops'},
      {id: 'not-on-homepage', url: '/x'},
      {id: 'data', sortOrder: 3},
    ],
    tree,
    SHOP,
  );
  assert.deepEqual(plan.updates, [
    {id: 'H2', fields: [{key: 'sort_order', value: '1'}]},
    {
      id: 'c1',
      fields: [
        {key: 'sort_order', value: '1'},
        {key: 'url', value: `https://${SHOP}/collections/tops`},
      ],
    },
  ]);
  assert.equal(plan.errors.length, 2);
});

test('planUpdates rejects bad positions and links', () => {
  const plan = planUpdates([{id: 'c1', sortOrder: -2}, {id: 'b1', url: 'http://'}], tree, SHOP);
  assert.equal(plan.updates.length, 0);
  assert.equal(plan.errors.length, 2);
});

test('cards with a category are split into one list per category', () => {
  const cat = (id, category, sort) => {
    const n = card(id, sort, null, 'top_categories_sub_categories');
    n.definition = {name: 'Top Categories - Sub Categories'};
    n.fields.push({key: 'category', type: 'single_line_text_field', value: category});
    return n;
  };
  const byId = {
    w1: cat('w1', 'Women', 1),
    m1: cat('m1', 'Men', 1),
    w2: cat('w2', 'Women', 2),
    td: {id: 'td', type: 'top_categories_data', fields: [{key: 'categories', type: 'list.metaobject_reference', value: '["w2","m1","w1"]'}]},
  };
  const t = buildEditorTree([home('H', 'top-categories', 9, ['td'], 'Top Categories')], byId);
  assert.deepEqual(
    t.sections[0].groups.map((g) => [g.label, g.itemIds]),
    [
      ['Categories — Women', ['w1', 'w2']],
      ['Categories — Men', ['m1']],
    ],
  );
});
