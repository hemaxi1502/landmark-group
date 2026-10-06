/**
 * Minimal Shopify Admin GraphQL client for server-side use (the /editor page).
 *
 * Credentials come from Oxygen environment variables — never from the browser:
 *
 *   SHOPIFY_ADMIN_CLIENT_ID      ┐ a Dev Dashboard app installed on the store
 *   SHOPIFY_ADMIN_CLIENT_SECRET  ┘ (client credentials grant, token refreshed every 24h)
 *   SHOPIFY_ADMIN_API_TOKEN        alternative: a fixed Admin API token (legacy custom app)
 *   SHOPIFY_ADMIN_SHOP             optional: xxx.myshopify.com (defaults to PUBLIC_STORE_DOMAIN)
 *
 * Required access scopes: read_metaobjects, write_metaobjects,
 * read_metaobject_definitions, read_files.
 */

export const ADMIN_API_VERSION = '2026-04';

export class AdminConfigError extends Error {}

/** @type {{shop: string; token: string; expiresAt: number} | null} */
let cachedToken = null;

/** The store's *.myshopify.com domain (no protocol). */
export function adminShopDomain(env) {
  const raw = env.SHOPIFY_ADMIN_SHOP || env.PUBLIC_STORE_DOMAIN || '';
  return raw.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
}

export function isAdminConfigured(env) {
  return Boolean(
    adminShopDomain(env) &&
    (env.SHOPIFY_ADMIN_API_TOKEN ||
      (env.SHOPIFY_ADMIN_CLIENT_ID && env.SHOPIFY_ADMIN_CLIENT_SECRET)),
  );
}

async function getAdminToken(env) {
  if (env.SHOPIFY_ADMIN_API_TOKEN) return env.SHOPIFY_ADMIN_API_TOKEN;

  const shop = adminShopDomain(env);
  if (
    !shop ||
    !env.SHOPIFY_ADMIN_CLIENT_ID ||
    !env.SHOPIFY_ADMIN_CLIENT_SECRET
  ) {
    throw new AdminConfigError(
      'Admin API credentials are not set. Add SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET to the Oxygen environment.',
    );
  }
  if (
    cachedToken &&
    cachedToken.shop === shop &&
    cachedToken.expiresAt > Date.now() + 60_000
  ) {
    return cachedToken.token;
  }

  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: env.SHOPIFY_ADMIN_CLIENT_ID,
      client_secret: env.SHOPIFY_ADMIN_CLIENT_SECRET,
    }),
  });
  const text = await response.text();
  if (!response.ok) {
    const hint = text.includes('shop_not_permitted')
      ? ' The app and the store must be in the same Shopify organization (Dev Dashboard → Dev stores).'
      : '';
    throw new AdminConfigError(
      `Could not get an Admin API token (${response.status}).${hint}`,
    );
  }
  const json = JSON.parse(text);
  cachedToken = {
    shop,
    token: json.access_token,
    expiresAt: Date.now() + Number(json.expires_in ?? 3600) * 1000,
  };
  return cachedToken.token;
}

/**
 * Runs an Admin GraphQL operation. Throws on HTTP or top-level GraphQL errors;
 * mutation userErrors are returned in `data` for the caller to handle.
 */
export async function adminGraphql(env, query, variables = {}) {
  const shop = adminShopDomain(env);
  const token = await getAdminToken(env);
  const endpoint =
    env.SHOPIFY_ADMIN_GRAPHQL_URL || // local testing against a mock server only
    `https://${shop}/admin/api/${ADMIN_API_VERSION}/graphql.json`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': token,
    },
    body: JSON.stringify({query, variables}),
  });
  if (response.status === 401 || response.status === 403) {
    cachedToken = null;
    throw new AdminConfigError(
      `The Admin API rejected the credentials (${response.status}). Check the app is installed and has the metaobject and file scopes.`,
    );
  }
  if (!response.ok) {
    throw new Error(`Admin API request failed (${response.status})`);
  }
  const json = await response.json();
  if (json.errors?.length) {
    const message = json.errors.map((e) => e.message).join('; ');
    if (/access denied|scope/i.test(message)) {
      throw new AdminConfigError(`Admin API access denied: ${message}`);
    }
    throw new Error(message);
  }
  return json.data;
}
