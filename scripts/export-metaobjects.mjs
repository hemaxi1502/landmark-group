/**
 * Reads every custom metaobject in the store and saves it to metaobjects.json.
 *
 * Run (Node 18+):
 *   SHOP=landmark-group-yk2c2n09.myshopify.com \
 *   CLIENT_ID=... CLIENT_SECRET=... \
 *   node scripts/export-metaobjects.mjs
 *
 * Uses the "editor - land mark" app (client credentials grant). Shopify's
 * standard product-attribute types (shopify--color, shopify--size, …) are
 * skipped; pass ALL=1 to include them.
 */
import {writeFile} from 'node:fs/promises';

const {SHOP, CLIENT_ID, CLIENT_SECRET, ALL} = process.env;
const API = '2026-04';
if (!SHOP || !CLIENT_ID || !CLIENT_SECRET) {
  console.error('Set SHOP, CLIENT_ID and CLIENT_SECRET first.');
  process.exit(1);
}

const tokenRes = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  body: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  }),
});
if (!tokenRes.ok)
  throw new Error(
    `Token request failed: ${tokenRes.status} ${await tokenRes.text()}`,
  );
const {access_token} = await tokenRes.json();

async function gql(query, variables = {}) {
  const res = await fetch(`https://${SHOP}/admin/api/${API}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': access_token,
    },
    body: JSON.stringify({query, variables}),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const TYPES = `query ListTypes($after: String) {
  metaobjectDefinitions(first: 100, after: $after) {
    nodes { type name metaobjectsCount fieldDefinitions { key name type { name } } }
    pageInfo { hasNextPage endCursor }
  }
}`;

const ENTRIES = `query EntriesOfType($type: String!, $after: String) {
  metaobjects(type: $type, first: 100, after: $after) {
    nodes {
      id handle displayName updatedAt
      fields {
        key type value
        reference {
          ... on MediaImage { image { url altText } }
          ... on Metaobject { id handle type }
        }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

const definitions = [];
for (let after = null; ;) {
  const d = (await gql(TYPES, {after})).metaobjectDefinitions;
  definitions.push(...d.nodes);
  if (!d.pageInfo.hasNextPage) break;
  after = d.pageInfo.endCursor;
}

const out = {};
for (const def of definitions) {
  if (!ALL && def.type.startsWith('shopify--')) continue;
  const entries = [];
  for (let after = null; ;) {
    const m = (await gql(ENTRIES, {type: def.type, after})).metaobjects;
    for (const n of m.nodes) {
      entries.push({
        id: n.id,
        handle: n.handle,
        name: n.displayName,
        updatedAt: n.updatedAt,
        fields: Object.fromEntries(
          n.fields.map((f) => [
            f.key,
            f.reference?.image?.url ??
              (f.type.includes('list.') && f.value
                ? JSON.parse(f.value)
                : f.value),
          ]),
        ),
      });
    }
    if (!m.pageInfo.hasNextPage) break;
    after = m.pageInfo.endCursor;
  }
  out[def.type] = {
    name: def.name,
    fields: def.fieldDefinitions.map((f) => `${f.key} (${f.type.name})`),
    entries,
  };
  console.log(`${def.name.padEnd(45)} ${entries.length}`);
}

await writeFile('metaobjects.json', JSON.stringify(out, null, 2));
console.log(`\nSaved ${Object.keys(out).length} types to metaobjects.json`);
