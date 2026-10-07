import {adminGraphql} from './admin-api.server.js';

/**
 * Data layer for the /editor page.
 *
 * Reads the homepage metaobject tree through the Admin API:
 *   home_page entries → section_data / mobile_banner → (data containers) → cards
 * and exposes every entry with something the client can change — a link,
 * a position, an image or a text field — as an editable item. Entries that
 * only hold lists (…_data, …_section) are walked through.
 */

const SECTIONS_QUERY = `
  query EditorSections {
    metaobjects(type: "home_page", first: 50) {
      nodes {
        id
        handle
        displayName
        fields {
          key
          type
          value
          reference {
            ... on Metaobject {
              id
              fields { key value }
            }
          }
        }
      }
    }
  }
`;

const NODES_QUERY = `
  query EditorNodes($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Metaobject {
        id
        handle
        type
        displayName
        definition { name }
        fields {
          key
          type
          value
        }
      }
    }
  }
`;

// Images are loaded by id rather than through fields { reference }: resolving
// every reference would also resolve collection_reference fields, which needs
// the read_products scope the editor app doesn't have.
const IMAGES_QUERY = `
  query EditorImages($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on MediaImage { id image { url } }
    }
  }
`;

const METAOBJECT_GID = /^gid:\/\/shopify\/Metaobject\/\d+$/;
const MEDIA_IMAGE_GID = /^gid:\/\/shopify\/MediaImage\/\d+$/;

const UPDATE_FIELDS = `
  metaobject { id }
  userErrors { field message code }
`;

const MAX_DEPTH = 4;
const LABEL_KEYS = ['alt', 'alt_text', 'name', 'heading', 'title', 'text'];
const IMAGE_KEYS = ['image', 'desktop_image', 'file', 'icon', 'mobile_image'];

/* ------------------------------------------------------------------ */
/* Pure helpers (unit-tested)                                          */
/* ------------------------------------------------------------------ */

function fieldOf(node, key) {
  return node?.fields?.find((f) => f.key === key);
}

function parseIds(field) {
  if (!field?.value) return [];
  if (
    field.type === 'metaobject_reference' ||
    field.type === 'mixed_reference'
  ) {
    return [field.value];
  }
  if (
    field.type === 'list.metaobject_reference' ||
    field.type === 'list.mixed_reference'
  ) {
    try {
      const list = JSON.parse(field.value);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }
  return [];
}

function humanize(key) {
  const text = String(key ?? '')
    .replace(/[_-]+/g, ' ')
    .trim();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const IMAGE_LABELS = {
  file: 'Image',
  image: 'Image',
  desktop_image: 'Desktop',
  mobile_image: 'Mobile',
  icon: 'Icon',
};
const TEXT_TYPES = new Set(['single_line_text_field', 'multi_line_text_field']);
// Fields the editor never shows as text: positions and fixed choice lists.
const HIDDEN_TEXT_KEYS = new Set(['sort_order', 'category']);

function imageFields(node) {
  return (node?.fields ?? []).filter((f) => f.type === 'file_reference');
}

function textFields(node) {
  return (node?.fields ?? []).filter(
    (f) => TEXT_TYPES.has(f.type) && !HIDDEN_TEXT_KEYS.has(f.key),
  );
}

function isEditable(node) {
  return Boolean(
    fieldOf(node, 'url') ||
    fieldOf(node, 'sort_order') ||
    imageFields(node).length ||
    textFields(node).length,
  );
}

/** Converts an Admin API metaobject into the shape the editor UI uses. */
export function toEditorItem(node) {
  const label =
    LABEL_KEYS.map((k) => fieldOf(node, k)?.value).find(Boolean) ||
    node.displayName ||
    node.handle;
  const images = imageFields(node).map((f) => ({
    key: f.key,
    label: IMAGE_LABELS[f.key] ?? humanize(f.key),
    url: f.reference?.image?.url ?? null,
  }));
  // Primary image first so the row thumbnail is the one shoppers see most.
  images.sort(
    (a, b) =>
      (IMAGE_KEYS.indexOf(a.key) + 1 || 99) -
      (IMAGE_KEYS.indexOf(b.key) + 1 || 99),
  );
  const urlField = fieldOf(node, 'url');
  const sortField = fieldOf(node, 'sort_order');
  return {
    id: node.id,
    handle: node.handle,
    typeName: node.definition?.name ?? node.type,
    label,
    image: images.find((i) => i.url)?.url ?? null,
    images,
    texts: textFields(node).map((f) => ({
      key: f.key,
      label: humanize(f.key),
      value: f.value ?? '',
      multiline: f.type === 'multi_line_text_field',
    })),
    hasUrl: Boolean(urlField),
    url: urlField?.value ?? '',
    hasSort: Boolean(sortField),
    sortOrder: sortField?.value ?? '',
  };
}

/**
 * Builds the editor tree from the home_page entries and a lookup of every
 * referenced metaobject (id → node).
 *
 * @returns {{sections: EditorSection[], items: Record<string, EditorItem>}}
 */
export function buildEditorTree(homeNodes, nodesById) {
  const items = {};
  const sections = [];

  for (const home of homeNodes) {
    const headingRef = fieldOf(home, 'heading')?.reference;
    const heading = headingRef?.fields?.find((f) => f.key === 'heading')?.value;
    const hiddenField = fieldOf(home, 'hidden');
    const groups = [];
    const seen = new Set();

    const addGroup = (key, label, ids) => {
      const editable = ids
        .map((id) => nodesById[id])
        .filter((n) => n && isEditable(n));
      if (!editable.length) return;
      for (const n of editable) items[n.id] ??= toEditorItem(n);
      const baseLabel =
        label || editable[0].definition?.name || humanize(editable[0].type);
      // Cards tagged with a category (Top Categories: Women / Men / …) are
      // ordered within their category tab, so each category is its own list.
      const byCategory = new Map();
      for (const n of editable) {
        const category = fieldOf(n, 'category')?.value ?? '';
        if (!byCategory.has(category)) byCategory.set(category, []);
        byCategory.get(category).push(n.id);
      }
      for (const [category, itemIds] of byCategory) {
        groups.push({
          key: category ? `${key}:${category}` : key,
          label: category ? `${baseLabel} — ${category}` : baseLabel,
          itemIds,
        });
      }
    };

    /** Walks a list of referenced ids: editable ones form a group, containers are opened. */
    const walk = (ids, groupKey, groupLabel, depth) => {
      if (depth > MAX_DEPTH) return;
      addGroup(groupKey, groupLabel, ids);
      for (const id of ids) {
        const node = nodesById[id];
        if (!node || seen.has(id)) continue;
        seen.add(id);
        for (const f of node.fields ?? []) {
          const childIds = parseIds(f);
          if (childIds.length) {
            walk(childIds, `${id}:${f.key}`, humanize(f.key), depth + 1);
          }
        }
      }
    };

    walk(
      parseIds(fieldOf(home, 'section_data')),
      `${home.id}:section_data`,
      null,
      1,
    );
    walk(
      parseIds(fieldOf(home, 'mobile_banner')),
      `${home.id}:mobile_banner`,
      'Mobile banner',
      1,
    );

    // Cards inside a group are shown in their current sort_order.
    for (const g of groups) {
      g.itemIds.sort(
        (a, b) =>
          (Number(items[a].sortOrder) || 999) -
          (Number(items[b].sortOrder) || 999),
      );
      g.sortable =
        g.itemIds.length > 1 && g.itemIds.every((id) => items[id].hasSort);
    }

    sections.push({
      id: home.id,
      handle: home.handle,
      title: heading || humanize(home.handle),
      headingId: headingRef?.id ?? null,
      heading: heading ?? '',
      canHide: Boolean(hiddenField),
      hidden: hiddenField?.value === 'true',
      sortOrder: fieldOf(home, 'sort_order')?.value ?? '',
      groups,
    });
  }

  sections.sort(
    (a, b) => (Number(a.sortOrder) || 999) - (Number(b.sortOrder) || 999),
  );
  return {sections, items};
}

/**
 * Shopify's `url` field only accepts absolute URLs, so a path like
 * "/collections/women" is stored as https://<shop>/collections/women. The
 * storefront turns store URLs back into relative paths when rendering.
 *
 * @returns {{value: string} | {error: string}}
 */
export function normalizeUrl(input, shopDomain) {
  const raw = String(input ?? '').trim();
  if (!raw) return {value: ''};
  if (/^(mailto|tel|sms):/i.test(raw)) return {value: raw};

  let candidate = raw;
  if (raw.startsWith('/')) candidate = `https://${shopDomain}${raw}`;
  else if (!/^https?:\/\//i.test(raw)) {
    // "collections/women" → path; "www.example.com" → external site
    candidate =
      /^[\w-]+\.[\w.-]+(\/|$)/.test(raw) && !raw.startsWith('collections')
        ? `https://${raw}`
        : `https://${shopDomain}/${raw.replace(/^\/+/, '')}`;
  }
  try {
    const parsed = new URL(candidate);
    if (!/^https?:$/.test(parsed.protocol) || !parsed.hostname.includes('.')) {
      return {error: `"${raw}" is not a valid link`};
    }
    return {value: parsed.toString()};
  } catch {
    return {error: `"${raw}" is not a valid link`};
  }
}

/** Shows store URLs as paths in the editor ("/collections/women"). */
export function displayUrl(url, shopDomain) {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname === shopDomain ||
      parsed.hostname.endsWith('.myshopify.com') ||
      parsed.hostname.endsWith('lifestylestores.com')
    ) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}`;
    }
  } catch {
    /* fall through */
  }
  return url;
}

const MEDIA_IMAGE_ID = /^gid:\/\/shopify\/MediaImage\/\d+$/;
const MAX_TEXT = 1000;

/**
 * Validates submitted changes against the current tree, so the editor can
 * only write fields that the tree exposes, on entries that belong to the
 * homepage:
 *  - sections: `sort_order`, `hidden`
 *  - section headings: `heading`
 *  - items: `url`, `sort_order`, their text fields, their image fields
 *    (value = a MediaImage id from an upload)
 *
 * @param {Array<{id: string; fields: Record<string, string>}>} changes
 * @returns {{updates: Array<{id: string; fields: Array<{key: string; value: string}>}>, errors: string[]}}
 */
export function planUpdates(changes, tree, shopDomain) {
  const sections = new Map(tree.sections.map((s) => [s.id, s]));
  const headings = new Map(
    tree.sections.filter((s) => s.headingId).map((s) => [s.headingId, s]),
  );
  const updates = [];
  const errors = [];

  for (const change of Array.isArray(changes) ? changes : []) {
    const id = change?.id;
    const input =
      change?.fields && typeof change.fields === 'object' ? change.fields : {};
    const item = tree.items[id];
    const section = sections.get(id);
    const headingOf = headings.get(id);
    if (!item && !section && !headingOf) {
      errors.push('Skipped an entry that is not part of the homepage.');
      continue;
    }
    const name =
      item?.label ?? section?.title ?? headingOf?.title ?? 'an entry';
    const fields = [];
    let bad = false;

    for (const [key, raw] of Object.entries(input)) {
      const value = String(raw ?? '');
      if (key === 'sort_order' && (section || item?.hasSort)) {
        const n = Number(value);
        if (!Number.isInteger(n) || n < 0 || n > 9999) {
          errors.push(`Invalid position for ${name}.`);
          bad = true;
          break;
        }
        fields.push({key, value: String(n)});
      } else if (key === 'hidden' && section?.canHide) {
        fields.push({key, value: value === 'true' ? 'true' : 'false'});
      } else if (key === 'heading' && headingOf) {
        if (!value.trim() || value.length > 255) {
          errors.push(`${name}: the heading must be 1–255 characters.`);
          bad = true;
          break;
        }
        fields.push({key, value: value.trim()});
      } else if (key === 'url' && item?.hasUrl) {
        const result = normalizeUrl(value, shopDomain);
        if ('error' in result) {
          errors.push(`${name}: ${result.error}`);
          bad = true;
          break;
        }
        fields.push({key, value: result.value});
      } else if (item?.texts.some((t) => t.key === key)) {
        if (value.length > MAX_TEXT) {
          errors.push(`${name}: text is too long.`);
          bad = true;
          break;
        }
        fields.push({key, value});
      } else if (item?.images.some((i) => i.key === key)) {
        if (!MEDIA_IMAGE_ID.test(value)) {
          errors.push(`${name}: the new image did not upload.`);
          bad = true;
          break;
        }
        fields.push({key, value});
      } else {
        errors.push(`${name}: "${key}" can't be edited here.`);
        bad = true;
        break;
      }
    }
    if (!bad && fields.length) updates.push({id, fields});
  }
  return {updates, errors};
}

/* ------------------------------------------------------------------ */
/* Admin API calls                                                     */
/* ------------------------------------------------------------------ */

export async function loadEditorTree(env) {
  const data = await adminGraphql(env, SECTIONS_QUERY);
  const homeNodes = data?.metaobjects?.nodes ?? [];
  const nodesById = {};

  let pending = homeNodes.flatMap((h) => [
    ...parseIds(fieldOf(h, 'section_data')),
    ...parseIds(fieldOf(h, 'mobile_banner')),
  ]);
  for (let depth = 0; depth < MAX_DEPTH && pending.length; depth++) {
    // Only metaobjects are walked; mixed references may also point to collections.
    const ids = [...new Set(pending)].filter(
      (id) => METAOBJECT_GID.test(id) && !nodesById[id],
    );
    pending = [];
    for (let i = 0; i < ids.length; i += 100) {
      const page = await adminGraphql(env, NODES_QUERY, {
        ids: ids.slice(i, i + 100),
      });
      for (const node of page?.nodes ?? []) {
        if (!node?.id) continue;
        nodesById[node.id] = node;
        for (const f of node.fields ?? []) pending.push(...parseIds(f));
      }
    }
  }
  await attachImages(env, Object.values(nodesById));
  return buildEditorTree(homeNodes, nodesById);
}

/** Fills `field.reference.image.url` on file_reference fields, as the tree expects. */
async function attachImages(env, nodes) {
  const fields = nodes.flatMap((n) =>
    (n.fields ?? []).filter(
      (f) => f.type === 'file_reference' && MEDIA_IMAGE_GID.test(f.value ?? ''),
    ),
  );
  const ids = [...new Set(fields.map((f) => f.value))];
  const urls = {};
  for (let i = 0; i < ids.length; i += 100) {
    const page = await adminGraphql(env, IMAGES_QUERY, {
      ids: ids.slice(i, i + 100),
    });
    for (const img of page?.nodes ?? []) {
      if (img?.id) urls[img.id] = img.image?.url ?? null;
    }
  }
  for (const f of fields) {
    f.reference = urls[f.value] ? {image: {url: urls[f.value]}} : null;
  }
}

/** Applies updates in batches of 20 aliased metaobjectUpdate mutations. */
export async function applyUpdates(env, updates) {
  const errors = [];
  let saved = 0;
  for (let i = 0; i < updates.length; i += 20) {
    const batch = updates.slice(i, i + 20);
    const params = batch
      .map((_, j) => `$id${j}: ID!, $m${j}: MetaobjectUpdateInput!`)
      .join(', ');
    const body = batch
      .map(
        (_, j) =>
          `u${j}: metaobjectUpdate(id: $id${j}, metaobject: $m${j}) { ${UPDATE_FIELDS} }`,
      )
      .join('\n');
    const variables = {};
    batch.forEach((u, j) => {
      variables[`id${j}`] = u.id;
      variables[`m${j}`] = {fields: u.fields};
    });
    const data = await adminGraphql(
      env,
      `mutation EditorSave(${params}) {\n${body}\n}`,
      variables,
    );
    batch.forEach((u, j) => {
      const result = data?.[`u${j}`];
      if (result?.userErrors?.length) {
        errors.push(...result.userErrors.map((e) => e.message));
      } else if (result?.metaobject) {
        saved += 1;
      }
    });
  }
  return {saved, errors};
}

const ALLOWED_VIDEO_TYPES = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);
const MAX_VIDEO_BYTES = 30 * 1024 * 1024;

/**
 * Uploads a video to Shopify Files (same route as images). Shopify then
 * converts it, which can take a minute: the id is usable straight away and
 * the video starts playing on the site once processing finishes.
 */
export async function uploadVideo(env, file, alt = '') {
  if (!file || typeof file.arrayBuffer !== 'function' || !file.size) {
    return {error: 'Choose a video file.'};
  }
  if (!ALLOWED_VIDEO_TYPES.has(file.type)) {
    return {error: 'Use an MP4, WebM or MOV video.'};
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return {
      error: 'Videos must be 30 MB or smaller. Shorten or compress it first.',
    };
  }
  const filename = String(file.name || 'video').replace(/[^\w.-]+/g, '-');
  const staged = await adminGraphql(env, STAGE_UPLOAD, {
    input: [
      {
        filename,
        mimeType: file.type,
        resource: 'VIDEO',
        httpMethod: 'POST',
        fileSize: String(file.size),
      },
    ],
  });
  const stageErr = staged?.stagedUploadsCreate?.userErrors?.[0];
  const target = staged?.stagedUploadsCreate?.stagedTargets?.[0];
  if (stageErr || !target) {
    return {error: stageErr?.message ?? 'Shopify did not accept the upload.'};
  }
  const form = new FormData();
  for (const {name, value} of target.parameters) form.append(name, value);
  form.append('file', file, filename);
  const put = await fetch(target.url, {method: 'POST', body: form});
  if (!put.ok) return {error: `Upload failed (${put.status}). Try again.`};

  const created = await adminGraphql(env, CREATE_FILE, {
    files: [{originalSource: target.resourceUrl, contentType: 'VIDEO', alt}],
  });
  const createErr = created?.fileCreate?.userErrors?.[0];
  const media = created?.fileCreate?.files?.[0];
  if (createErr || !media?.id) {
    return {error: createErr?.message ?? 'Shopify could not save the video.'};
  }
  let preview = null;
  let status = media.fileStatus;
  for (let i = 0; i < 8 && status !== 'READY'; i++) {
    await new Promise((r) => setTimeout(r, 1000));
    const res = await adminGraphql(env, VIDEO_STATUS, {id: media.id});
    status = res?.node?.fileStatus ?? status;
    preview = res?.node?.preview?.image?.url ?? preview;
    if (status === 'FAILED') {
      return {error: 'Shopify could not process this video. Try another file.'};
    }
  }
  return {id: media.id, url: preview, processing: status !== 'READY'};
}

const VIDEO_STATUS = `
  query EditorVideoStatus($id: ID!) {
    node(id: $id) {
      ... on Video { id fileStatus preview { image { url } } }
    }
  }
`;

const STAGE_UPLOAD = `
  mutation EditorStage($input: [StagedUploadInput!]!) {
    stagedUploadsCreate(input: $input) {
      stagedTargets { url resourceUrl parameters { name value } }
      userErrors { field message }
    }
  }
`;

const CREATE_FILE = `
  mutation EditorCreateFile($files: [FileCreateInput!]!) {
    fileCreate(files: $files) {
      files { id fileStatus ... on MediaImage { image { url } } }
      userErrors { field message }
    }
  }
`;

const FILE_STATUS = `
  query EditorFileStatus($id: ID!) {
    node(id: $id) {
      ... on MediaImage { id fileStatus image { url width height } }
    }
  }
`;

const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);
export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/**
 * Uploads an image to Shopify Files (staged upload → fileCreate) and returns
 * its MediaImage id, plus the CDN url and size once Shopify has processed it
 * (usually 1–3 seconds; null if it takes longer — the id is still valid).
 *
 * @param {File} file
 */
export async function uploadImage(env, file, alt = '') {
  if (!file || typeof file.arrayBuffer !== 'function' || !file.size) {
    return {error: 'Choose an image file.'};
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {error: 'Use a JPG, PNG, WebP, GIF or AVIF image.'};
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {error: 'Images must be 20 MB or smaller.'};
  }
  const filename = String(file.name || 'image').replace(/[^\w.-]+/g, '-');

  const staged = await adminGraphql(env, STAGE_UPLOAD, {
    input: [
      {
        filename,
        mimeType: file.type,
        resource: 'IMAGE',
        httpMethod: 'POST',
        fileSize: String(file.size),
      },
    ],
  });
  const stageErr = staged?.stagedUploadsCreate?.userErrors?.[0];
  const target = staged?.stagedUploadsCreate?.stagedTargets?.[0];
  if (stageErr || !target) {
    return {error: stageErr?.message ?? 'Shopify did not accept the upload.'};
  }

  const form = new FormData();
  for (const {name, value} of target.parameters) form.append(name, value);
  form.append('file', file, filename);
  const put = await fetch(target.url, {method: 'POST', body: form});
  if (!put.ok) {
    return {error: `Upload failed (${put.status}). Try again.`};
  }

  const created = await adminGraphql(env, CREATE_FILE, {
    files: [{originalSource: target.resourceUrl, contentType: 'IMAGE', alt}],
  });
  const createErr = created?.fileCreate?.userErrors?.[0];
  const media = created?.fileCreate?.files?.[0];
  if (createErr || !media?.id) {
    return {error: createErr?.message ?? 'Shopify could not save the image.'};
  }

  // Wait briefly for processing so the editor can show the real image size.
  let info = media.image ? {url: media.image.url} : null;
  for (let i = 0; i < 6 && !info?.width; i++) {
    await new Promise((r) => setTimeout(r, 700));
    const status = await adminGraphql(env, FILE_STATUS, {id: media.id});
    const node = status?.node;
    if (node?.fileStatus === 'FAILED') {
      return {error: 'Shopify could not process this image. Try another file.'};
    }
    if (node?.image?.url) info = node.image;
  }
  return {
    id: media.id,
    url: info?.url ?? null,
    width: info?.width ?? null,
    height: info?.height ?? null,
  };
}

/**
 * @typedef {ReturnType<typeof toEditorItem>} EditorItem
 * @typedef {{id: string; handle: string; title: string; heading: string;
 *   headingId: string | null; canHide: boolean; hidden: boolean; sortOrder: string;
 *   groups: Array<{key: string; label: string; itemIds: string[]; sortable: boolean}>}} EditorSection
 */
