import {adminGraphql} from './admin-api.server.js';

/**
 * Data layer for the /editor page.
 *
 * Reads the homepage metaobject tree through the Admin API:
 *   home_page entries → section_data / mobile_banner → (data containers) → cards
 * and exposes every entry that has a `url` and/or `sort_order` field as an
 * editable item. Containers (…_data, …_section) are walked through, not shown.
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
          reference {
            ... on MediaImage { image { url } }
          }
        }
      }
    }
  }
`;

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

function isEditable(node) {
  return Boolean(fieldOf(node, 'url') || fieldOf(node, 'sort_order'));
}

/** Converts an Admin API metaobject into the shape the editor UI uses. */
export function toEditorItem(node) {
  const label =
    LABEL_KEYS.map((k) => fieldOf(node, k)?.value).find(Boolean) ||
    node.displayName ||
    node.handle;
  const imageField = IMAGE_KEYS.map((k) => fieldOf(node, k)).find(
    (f) => f?.reference?.image?.url,
  );
  const urlField = fieldOf(node, 'url');
  const sortField = fieldOf(node, 'sort_order');
  return {
    id: node.id,
    handle: node.handle,
    typeName: node.definition?.name ?? node.type,
    label,
    image: imageField?.reference?.image?.url ?? null,
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
        if (!node || isEditable(node) || seen.has(id)) continue;
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

/**
 * Validates submitted changes against the current tree, so the editor can only
 * write `url` / `sort_order` on entries that belong to the homepage.
 *
 * @param {Array<{id: string; url?: string; sortOrder?: string}>} changes
 * @returns {{updates: Array<{id: string; fields: Array<{key: string; value: string}>}>, errors: string[]}}
 */
export function planUpdates(changes, tree, shopDomain) {
  const sectionIds = new Set(tree.sections.map((s) => s.id));
  const updates = [];
  const errors = [];

  for (const change of Array.isArray(changes) ? changes : []) {
    const item = tree.items[change?.id];
    const isSection = sectionIds.has(change?.id);
    if (!item && !isSection) {
      errors.push('Skipped an entry that is not part of the homepage.');
      continue;
    }
    const fields = [];
    if (change.sortOrder !== undefined) {
      const n = Number(change.sortOrder);
      if (!Number.isInteger(n) || n < 0 || n > 9999) {
        errors.push(`Invalid position for ${item?.label ?? 'a section'}.`);
        continue;
      }
      if (isSection || item.hasSort)
        fields.push({key: 'sort_order', value: String(n)});
    }
    if (change.url !== undefined && item?.hasUrl) {
      const result = normalizeUrl(change.url, shopDomain);
      if ('error' in result) {
        errors.push(`${item.label}: ${result.error}`);
        continue;
      }
      fields.push({key: 'url', value: result.value});
    }
    if (fields.length) updates.push({id: change.id, fields});
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
    const ids = [...new Set(pending)].filter((id) => !nodesById[id]);
    pending = [];
    for (let i = 0; i < ids.length; i += 100) {
      const page = await adminGraphql(env, NODES_QUERY, {
        ids: ids.slice(i, i + 100),
      });
      for (const node of page?.nodes ?? []) {
        if (!node?.id) continue;
        nodesById[node.id] = node;
        if (!isEditable(node)) {
          for (const f of node.fields ?? []) pending.push(...parseIds(f));
        }
      }
    }
  }
  return buildEditorTree(homeNodes, nodesById);
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

/**
 * @typedef {ReturnType<typeof toEditorItem>} EditorItem
 * @typedef {{id: string; handle: string; title: string; sortOrder: string;
 *   groups: Array<{key: string; label: string; itemIds: string[]; sortable: boolean}>}} EditorSection
 */
