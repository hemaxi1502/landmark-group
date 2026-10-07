import {adminGraphql} from './admin-api.server.js';
import {
  BLOCK_TYPES,
  FIELD_INFO,
  LAYOUT_TYPE,
  SECTION_TYPE,
  slugify,
} from './page-builder.js';

/**
 * Admin API side of /editor/pages: list, read, create, save and delete
 * page_layout entries and their page_section blocks.
 *
 * References are kept as ids (not resolved): resolving collection references
 * through the Admin API would need read_products, which the editor app
 * doesn't have. The editor maps ids to names with Storefront data.
 */

const GID = {
  collection: /^gid:\/\/shopify\/Collection\/\d+$/,
  image: /^gid:\/\/shopify\/MediaImage\/\d+$/,
  metaobject: /^gid:\/\/shopify\/Metaobject\/\d+$/,
};
const MAX = {heading: 255, text: 2000, link: 500, title: 120, description: 320};
const MAX_BLOCKS = 40;

export async function listLayouts(env) {
  const data = await adminGraphql(env, LIST_QUERY);
  return (data?.metaobjects?.nodes ?? []).map((n) => ({
    id: n.id,
    handle: n.handle,
    title: n.title?.value ?? n.handle,
    blockCount: parseList(n.sections?.value).length,
    updatedAt: n.updatedAt,
  }));
}

export async function getLayout(env, id) {
  if (!GID.metaobject.test(id ?? '')) return null;
  const data = await adminGraphql(env, LAYOUT_QUERY, {id});
  const node = data?.node;
  if (!node || node.type !== LAYOUT_TYPE) return null;
  const blocks = (node.sections?.references?.nodes ?? [])
    .filter((b) => b?.id)
    .map(toEditorBlock);
  await attachImageUrls(env, blocks);
  return {
    id: node.id,
    handle: node.handle,
    title: node.title?.value ?? '',
    description: node.description?.value ?? '',
    blocks,
  };
}

function fieldValue(node, key) {
  return node.fields?.find((f) => f.key === key)?.value ?? '';
}

function parseList(value) {
  try {
    const list = JSON.parse(value || '[]');
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function toEditorBlock(node) {
  const kind = fieldValue(node, 'kind');
  return {
    id: node.id,
    kind,
    hidden: fieldValue(node, 'hidden') === 'true',
    values: {
      heading: fieldValue(node, 'heading'),
      text: fieldValue(node, 'text'),
      link: fieldValue(node, 'link'),
      collection: fieldValue(node, 'collection'),
      collections: parseList(fieldValue(node, 'collections')),
      count: fieldValue(node, 'count'),
      image: fieldValue(node, 'image'),
      mobile_image: fieldValue(node, 'mobile_image'),
      home_section: fieldValue(node, 'home_section'),
    },
    imageUrls: {},
  };
}

async function attachImageUrls(env, blocks) {
  const ids = [
    ...new Set(
      blocks.flatMap((b) =>
        ['image', 'mobile_image']
          .map((k) => b.values[k])
          .filter((v) => GID.image.test(v)),
      ),
    ),
  ];
  if (!ids.length) return;
  const data = await adminGraphql(env, IMAGES_QUERY, {ids});
  const urls = Object.fromEntries(
    (data?.nodes ?? []).filter(Boolean).map((n) => [n.id, n.image?.url]),
  );
  for (const b of blocks) {
    for (const k of ['image', 'mobile_image']) {
      if (urls[b.values[k]]) b.imageUrls[k] = urls[b.values[k]];
    }
  }
}

/* ------------------------------------------------------------------ */
/* Validation (pure, unit-tested)                                      */
/* ------------------------------------------------------------------ */

/**
 * Checks a page from the editor and turns each block into metaobject
 * fields. Returns {errors, title, description, blocks:[{id, fields}]}.
 */
export function validateLayout(input) {
  const errors = [];
  const title = String(input?.title ?? '').trim();
  const description = String(input?.description ?? '').trim();
  if (!title) errors.push('The page needs a title.');
  if (title.length > MAX.title) errors.push('The title is too long.');
  if (description.length > MAX.description)
    errors.push('The SEO description is too long (max 320 characters).');

  const rawBlocks = Array.isArray(input?.blocks) ? input.blocks : [];
  if (rawBlocks.length > MAX_BLOCKS)
    errors.push(`A page can have at most ${MAX_BLOCKS} blocks.`);

  const blocks = rawBlocks.slice(0, MAX_BLOCKS).map((b, i) => {
    const n = i + 1;
    const type = BLOCK_TYPES[b?.kind];
    if (!type) {
      errors.push(`Block ${n}: unknown block type.`);
      return null;
    }
    if (b.id && !GID.metaobject.test(b.id)) {
      errors.push(`Block ${n}: invalid id.`);
      return null;
    }
    const v = b.values ?? {};
    const fields = [
      {key: 'kind', value: b.kind},
      {key: 'hidden', value: b.hidden ? 'true' : 'false'},
    ];
    for (const key of Object.keys(FIELD_INFO)) {
      const used = type.fields.includes(key);
      const out = used ? cleanField(key, v[key], n, errors, type) : '';
      // Clear settings the block type doesn't use.
      fields.push({key, value: out});
    }
    return {id: b.id || null, kind: b.kind, fields};
  });

  return {errors, title, description, blocks: blocks.filter(Boolean)};
}

function cleanField(key, raw, n, errors, type) {
  const label = type.labels?.[key] ?? FIELD_INFO[key].label;
  switch (key) {
    case 'heading':
    case 'text':
    case 'link': {
      const s = String(raw ?? '').trim();
      if (s.length > MAX[key]) errors.push(`Block ${n}: ${label} is too long.`);
      return s.slice(0, MAX[key]);
    }
    case 'count': {
      if (raw === '' || raw == null) return '';
      const num = Number(raw);
      if (!Number.isInteger(num) || num < 1 || num > 24) {
        errors.push(
          `Block ${n}: ${label} must be a whole number from 1 to 24.`,
        );
        return '';
      }
      return String(num);
    }
    case 'collection':
      if (!raw) return '';
      if (!GID.collection.test(raw)) {
        errors.push(`Block ${n}: pick a collection from the list.`);
        return '';
      }
      return raw;
    case 'collections': {
      const list = Array.isArray(raw) ? raw.filter(Boolean) : [];
      if (list.some((id) => !GID.collection.test(id))) {
        errors.push(`Block ${n}: pick collections from the list.`);
        return '[]';
      }
      if (list.length > 12) errors.push(`Block ${n}: at most 12 collections.`);
      return JSON.stringify([...new Set(list)].slice(0, 12));
    }
    case 'image':
    case 'mobile_image':
      if (!raw) return '';
      if (!GID.image.test(raw)) {
        errors.push(`Block ${n}: invalid image.`);
        return '';
      }
      return raw;
    case 'home_section':
      if (!raw) return '';
      if (!GID.metaobject.test(raw)) {
        errors.push(`Block ${n}: pick a homepage section from the list.`);
        return '';
      }
      return raw;
    default:
      return '';
  }
}

/** Handle for a new page: "summer-sale" or "department-men". */
export function newLayoutHandle({kind, title, collectionHandle}) {
  if (kind === 'department') {
    const h = slugify(collectionHandle);
    return h ? `department-${h}` : '';
  }
  return slugify(title);
}

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

export async function createLayout(env, {handle, title}) {
  // Shopify silently renames a taken handle ("sale" → "sale-1"), so check first.
  const taken = await adminGraphql(env, BY_HANDLE_QUERY, {
    handle: {type: LAYOUT_TYPE, handle},
  });
  if (taken?.metaobjectByHandle) {
    throw new Error('A page with this address already exists.');
  }
  const data = await adminGraphql(env, CREATE_MUTATION, {
    metaobject: {
      type: LAYOUT_TYPE,
      handle,
      fields: [
        {key: 'title', value: title},
        {key: 'sections', value: '[]'},
      ],
    },
  });
  const err = data?.metaobjectCreate?.userErrors?.[0];
  if (err) {
    if (/taken|already/i.test(err.message))
      throw new Error('A page with this address already exists.');
    throw new Error(err.message);
  }
  const created = data.metaobjectCreate.metaobject;
  if (created.handle !== handle) {
    // Lost a race with another create: undo and report.
    await adminGraphql(env, DELETE_MUTATION, {id: created.id}).catch(
      () => null,
    );
    throw new Error('A page with this address already exists.');
  }
  return created;
}

/**
 * Saves a validated page: updates/creates its blocks, stores their order on
 * the page, then deletes blocks that were removed.
 */
export async function saveLayout(env, id, validated) {
  const existing = await adminGraphql(env, LAYOUT_IDS_QUERY, {id});
  if (existing?.node?.type !== LAYOUT_TYPE)
    throw new Error('This page no longer exists.');
  const before = parseList(
    existing.node.fields?.find((f) => f.key === 'sections')?.value,
  );

  const order = [];
  for (const block of validated.blocks) {
    // Only blocks that belong to this page can be updated.
    if (block.id && before.includes(block.id)) {
      const d = await adminGraphql(env, UPDATE_MUTATION, {
        id: block.id,
        metaobject: {fields: block.fields},
      });
      throwUserError(d?.metaobjectUpdate);
      order.push(block.id);
    } else {
      const d = await adminGraphql(env, CREATE_MUTATION, {
        metaobject: {type: SECTION_TYPE, fields: block.fields},
      });
      throwUserError(d?.metaobjectCreate);
      order.push(d.metaobjectCreate.metaobject.id);
    }
  }

  const d = await adminGraphql(env, UPDATE_MUTATION, {
    id,
    metaobject: {
      fields: [
        {key: 'title', value: validated.title},
        {key: 'description', value: validated.description},
        {key: 'sections', value: JSON.stringify(order)},
      ],
    },
  });
  throwUserError(d?.metaobjectUpdate);

  const removed = before.filter((b) => !order.includes(b));
  for (const blockId of removed) {
    await adminGraphql(env, DELETE_MUTATION, {id: blockId}).catch(() => null);
  }
  return {saved: order.length, removed: removed.length};
}

export async function deleteLayout(env, id) {
  const existing = await adminGraphql(env, LAYOUT_IDS_QUERY, {id});
  if (existing?.node?.type !== LAYOUT_TYPE) return;
  const blocks = parseList(
    existing.node.fields?.find((f) => f.key === 'sections')?.value,
  );
  await adminGraphql(env, DELETE_MUTATION, {id});
  for (const blockId of blocks) {
    await adminGraphql(env, DELETE_MUTATION, {id: blockId}).catch(() => null);
  }
}

function throwUserError(payload) {
  const err = payload?.userErrors?.[0];
  if (err) throw new Error(err.message);
}

/* Not tagged #graphql: codegen validates tagged queries against the
   Storefront schema, and these are Admin API operations. */

const LIST_QUERY = `
  query PageBuilderList {
    metaobjects(type: "page_layout", first: 100, sortKey: "updated_at", reverse: true) {
      nodes {
        id
        handle
        updatedAt
        title: field(key: "title") { value }
        sections: field(key: "sections") { value }
      }
    }
  }
`;

const BY_HANDLE_QUERY = `
  query PageBuilderByHandle($handle: MetaobjectHandleInput!) {
    metaobjectByHandle(handle: $handle) { id }
  }
`;

const LAYOUT_QUERY = `
  query PageBuilderLayout($id: ID!) {
    node(id: $id) {
      ... on Metaobject {
        id
        type
        handle
        title: field(key: "title") { value }
        description: field(key: "description") { value }
        sections: field(key: "sections") {
          references(first: 50) {
            nodes {
              ... on Metaobject {
                id
                fields { key value }
              }
            }
          }
        }
      }
    }
  }
`;

const LAYOUT_IDS_QUERY = `
  query PageBuilderLayoutIds($id: ID!) {
    node(id: $id) {
      ... on Metaobject { id type fields { key value } }
    }
  }
`;

const IMAGES_QUERY = `
  query PageBuilderImages($ids: [ID!]!) {
    nodes(ids: $ids) { ... on MediaImage { id image { url } } }
  }
`;

const CREATE_MUTATION = `
  mutation PageBuilderCreate($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id handle }
      userErrors { field message code }
    }
  }
`;

const UPDATE_MUTATION = `
  mutation PageBuilderUpdate($id: ID!, $metaobject: MetaobjectUpdateInput!) {
    metaobjectUpdate(id: $id, metaobject: $metaobject) {
      metaobject { id }
      userErrors { field message code }
    }
  }
`;

const DELETE_MUTATION = `
  mutation PageBuilderDelete($id: ID!) {
    metaobjectDelete(id: $id) {
      deletedId
      userErrors { field message }
    }
  }
`;
