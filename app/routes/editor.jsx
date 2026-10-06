import {useMemo, useState} from 'react';
import {
  Form,
  Link,
  useFetcher,
  useLoaderData,
  useNavigation,
} from 'react-router';
import {
  AdminConfigError,
  adminShopDomain,
  isAdminConfigured,
} from '~/lib/admin-api.server';
import {
  applyUpdates,
  displayUrl,
  loadEditorTree,
  planUpdates,
} from '~/lib/editor-content.server';
import {Icon} from '~/components/ui/Icon';

/**
 * /editor — a password-protected page for the client to:
 *  - reorder homepage sections
 *  - reorder the cards / slides inside a section
 *  - change the link of every banner, slide and card
 *
 * Saves straight to the homepage metaobjects through the Admin API.
 * Set EDITOR_PASSWORD and the Admin API variables (see lib/admin-api.server.js)
 * in the Oxygen environment.
 */

const SESSION_KEY = 'editorAuthUntil';
const SESSION_HOURS = 8;

export const meta = () => [
  {title: 'Homepage editor | Lifestyle Stores'},
  {name: 'robots', content: 'noindex, nofollow'},
];

export const headers = () => ({'Cache-Control': 'no-store'});

function isAuthed(session) {
  return Number(session.get(SESSION_KEY) ?? 0) > Date.now();
}

/** Constant-time string compare so the password check doesn't leak timing. */
function safeEqual(a, b) {
  const x = String(a ?? '');
  const y = String(b ?? '');
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) {
    diff |= (x.charCodeAt(i) || 0) ^ (y.charCodeAt(i) || 0);
  }
  return diff === 0;
}

/** @param {Route.LoaderArgs} */
export async function loader({context}) {
  const {env, session} = context;
  if (!env.EDITOR_PASSWORD)
    return {state: 'not-configured', missing: ['EDITOR_PASSWORD']};
  if (!isAuthed(session)) return {state: 'login'};
  if (!isAdminConfigured(env)) {
    return {
      state: 'not-configured',
      missing: ['SHOPIFY_ADMIN_CLIENT_ID', 'SHOPIFY_ADMIN_CLIENT_SECRET'],
    };
  }
  const shop = adminShopDomain(env);
  try {
    const tree = await loadEditorTree(env);
    // Show store links as paths ("/collections/women") in the inputs.
    for (const item of Object.values(tree.items)) {
      item.url = displayUrl(item.url, shop);
    }
    return {state: 'ready', tree, shop, loadedAt: Date.now()};
  } catch (error) {
    if (error instanceof AdminConfigError) {
      return {state: 'admin-error', message: error.message};
    }
    throw error;
  }
}

/** @param {Route.ActionArgs} */
export async function action({request, context}) {
  const {env, session} = context;
  const form = await request.formData();
  const intent = form.get('intent');

  if (intent === 'login') {
    // Small fixed delay slows down password guessing.
    await new Promise((r) => setTimeout(r, 600));
    if (
      env.EDITOR_PASSWORD &&
      safeEqual(form.get('password'), env.EDITOR_PASSWORD)
    ) {
      session.set(SESSION_KEY, Date.now() + SESSION_HOURS * 3600_000);
      return {ok: true};
    }
    return {ok: false, error: 'Wrong password.'};
  }

  if (intent === 'logout') {
    session.unset(SESSION_KEY);
    return {ok: true};
  }

  if (!isAuthed(session)) {
    return {
      ok: false,
      errors: ['Your session expired. Reload the page and sign in again.'],
    };
  }

  if (intent === 'save') {
    let changes;
    try {
      changes = JSON.parse(String(form.get('changes') ?? '[]'));
    } catch {
      return {ok: false, errors: ['Could not read the changes.']};
    }
    try {
      const shop = adminShopDomain(env);
      const tree = await loadEditorTree(env);
      const plan = planUpdates(changes, tree, shop);
      if (plan.errors.length) return {ok: false, errors: plan.errors};
      const result = await applyUpdates(env, plan.updates);
      return {
        ok: result.errors.length === 0,
        saved: result.saved,
        errors: result.errors,
      };
    } catch (error) {
      return {ok: false, errors: [error.message || 'Save failed.']};
    }
  }

  return {ok: false, errors: ['Unknown action.']};
}

export default function Editor() {
  const data = useLoaderData();
  // Lives here (not in EditorView) so the save result survives the reload
  // that follows a save.
  const save = useFetcher({key: 'editor-save'});
  const [open, setOpen] = useState(() => new Set());
  return (
    <div className="container-site py-6 md:py-10">
      {data.state === 'login' && <Login />}
      {data.state === 'not-configured' && (
        <NotConfigured missing={data.missing} />
      )}
      {data.state === 'admin-error' && <AdminError message={data.message} />}
      {data.state === 'ready' && (
        <EditorView
          key={data.loadedAt}
          tree={data.tree}
          save={save}
          open={open}
          setOpen={setOpen}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Login / setup screens                                               */
/* ------------------------------------------------------------------ */

function Login() {
  const fetcher = useFetcher();
  const busy = fetcher.state !== 'idle';
  return (
    <div className="mx-auto max-w-sm py-10">
      <h1 className="text-xl font-bold">Homepage editor</h1>
      <p className="mt-1 text-sm text-muted">
        Sign in to change section order and links.
      </p>
      <fetcher.Form method="post" className="mt-6 space-y-3">
        <input type="hidden" name="intent" value="login" />
        <label
          className="block text-sm font-semibold"
          htmlFor="editor-password"
        >
          Password
        </label>
        <input
          id="editor-password"
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="w-full rounded border border-line px-3 py-2.5 text-sm"
        />
        {fetcher.data?.error && (
          <p className="text-sm text-danger" role="alert">
            {fetcher.data.error}
          </p>
        )}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded bg-ink py-3 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60"
        >
          {busy ? 'Signing in…' : 'Sign in'}
        </button>
      </fetcher.Form>
    </div>
  );
}

function NotConfigured({missing}) {
  return (
    <div className="mx-auto max-w-xl py-10">
      <h1 className="text-xl font-bold">Editor isn&apos;t set up yet</h1>
      <p className="mt-2 text-sm text-muted">
        Add these environment variables in Shopify admin → Hydrogen → this
        storefront → Storefront settings → Environments and variables, then
        redeploy:
      </p>
      <ul className="mt-4 space-y-1 text-sm">
        {missing.map((m) => (
          <li key={m}>
            <code className="rounded bg-surface px-2 py-0.5">{m}</code>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AdminError({message}) {
  return (
    <div className="mx-auto max-w-xl py-10">
      <h1 className="text-xl font-bold">Can&apos;t reach the store</h1>
      <p className="mt-2 text-sm text-danger">{message}</p>
      <LogoutButton className="mt-6" />
    </div>
  );
}

function LogoutButton({className = ''}) {
  return (
    <Form method="post" className={className}>
      <input type="hidden" name="intent" value="logout" />
      <button
        type="submit"
        className="text-sm font-semibold text-muted underline hover:text-ink"
      >
        Sign out
      </button>
    </Form>
  );
}

/* ------------------------------------------------------------------ */
/* Editor                                                              */
/* ------------------------------------------------------------------ */

function move(list, index, delta) {
  const next = [...list];
  const target = index + delta;
  if (target < 0 || target >= next.length) return list;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function EditorView({tree, save, open, setOpen}) {
  const navigation = useNavigation();
  const [sectionOrder, setSectionOrder] = useState(() =>
    tree.sections.map((s) => s.id),
  );
  const [groupOrders, setGroupOrders] = useState(() =>
    Object.fromEntries(
      tree.sections.flatMap((s) => s.groups.map((g) => [g.key, g.itemIds])),
    ),
  );
  const [urls, setUrls] = useState({});

  const sectionsById = useMemo(
    () => Object.fromEntries(tree.sections.map((s) => [s.id, s])),
    [tree.sections],
  );

  const changes = useMemo(() => {
    const byId = {};
    const add = (id, patch) => (byId[id] = {...byId[id], id, ...patch});

    sectionOrder.forEach((id, i) => {
      if (String(i + 1) !== String(sectionsById[id].sortOrder)) {
        add(id, {sortOrder: i + 1});
      }
    });
    for (const section of tree.sections) {
      for (const group of section.groups) {
        if (!group.sortable) continue;
        groupOrders[group.key].forEach((id, i) => {
          if (String(i + 1) !== String(tree.items[id].sortOrder)) {
            add(id, {sortOrder: i + 1});
          }
        });
      }
    }
    for (const [id, url] of Object.entries(urls)) {
      if (url.trim() !== tree.items[id].url.trim()) add(id, {url});
    }
    return Object.values(byId);
  }, [sectionOrder, groupOrders, urls, sectionsById, tree]);

  const saving = save.state !== 'idle' || navigation.state === 'loading';
  const result = save.state === 'idle' ? save.data : null;

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const discard = () => {
    setSectionOrder(tree.sections.map((s) => s.id));
    setGroupOrders(
      Object.fromEntries(
        tree.sections.flatMap((s) => s.groups.map((g) => [g.key, g.itemIds])),
      ),
    );
    setUrls({});
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Homepage editor</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Use the arrows to change the order of sections and cards. Type a
            link as a path (<code>/collections/women</code>) or a full web
            address. Images and text are edited in Shopify admin → Content →
            Metaobjects.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-semibold text-brand"
          >
            View homepage ↗
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* Sections */}
      <ol className="mt-5 space-y-3">
        {sectionOrder.map((id, index) => {
          const section = sectionsById[id];
          const isOpen = open.has(id);
          const cardCount = section.groups.reduce(
            (n, g) => n + g.itemIds.length,
            0,
          );
          return (
            <li key={id} className="rounded border border-line">
              <div className="flex items-center gap-3 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface text-sm font-bold">
                  {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => toggle(id)}
                  aria-expanded={isOpen}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {section.title}
                    </span>
                    <span className="block text-xs text-muted">
                      {cardCount} {cardCount === 1 ? 'item' : 'items'} ·{' '}
                      {section.handle}
                    </span>
                  </span>
                  <span className="ml-auto flex shrink-0 items-center gap-1 rounded-full border border-line px-3 py-1 text-xs font-semibold">
                    {isOpen ? 'Close' : 'Edit'}
                    <Icon
                      name="chevronDown"
                      className={`h-3.5 w-3.5 transition ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </span>
                </button>
                <span className="h-6 w-px bg-line" aria-hidden="true" />
                <MoveButtons
                  label={section.title}
                  first={index === 0}
                  last={index === sectionOrder.length - 1}
                  onMove={(d) => setSectionOrder((o) => move(o, index, d))}
                />
              </div>

              {isOpen && (
                <div className="space-y-5 border-t border-line p-3 md:p-4">
                  {section.groups.length === 0 && (
                    <p className="text-sm text-muted">
                      Nothing to edit in this section.
                    </p>
                  )}
                  {section.groups.map((group) => (
                    <Group
                      key={group.key}
                      group={group}
                      order={groupOrders[group.key]}
                      items={tree.items}
                      urls={urls}
                      onUrl={(itemId, value) =>
                        setUrls((u) => ({...u, [itemId]: value}))
                      }
                      onMove={(i, d) =>
                        setGroupOrders((o) => ({
                          ...o,
                          [group.key]: move(o[group.key], i, d),
                        }))
                      }
                    />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Save bar */}
      <div className="sticky bottom-0 z-40 -mx-4 mt-6 border-t border-line bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] backdrop-blur md:mx-0 md:rounded md:border md:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm" aria-live="polite">
            {changes.length === 0
              ? 'No unsaved changes'
              : `${changes.length} unsaved ${changes.length === 1 ? 'change' : 'changes'}`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={discard}
              disabled={!changes.length || saving}
              className="rounded border border-line px-4 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Discard
            </button>
            <save.Form method="post">
              <input type="hidden" name="intent" value="save" />
              <input
                type="hidden"
                name="changes"
                value={JSON.stringify(changes)}
              />
              <button
                type="submit"
                disabled={!changes.length || saving}
                className="rounded bg-ink px-5 py-2 text-sm font-bold text-white disabled:opacity-40"
              >
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </save.Form>
          </div>
        </div>
        {result?.ok && (
          <p className="mt-2 text-sm font-semibold text-success" role="status">
            Saved {result.saved} {result.saved === 1 ? 'entry' : 'entries'}. The
            live homepage updates within a few seconds.
          </p>
        )}
        {result && !result.ok && result.errors?.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-danger" role="alert">
            {result.errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Group({group, order, items, urls, onUrl, onMove}) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
        {group.label}
      </h2>
      <ul className="divide-y divide-line rounded border border-line">
        {order.map((itemId, i) => {
          const item = items[itemId];
          const value = urls[itemId] ?? item.url;
          const changed =
            urls[itemId] !== undefined &&
            urls[itemId].trim() !== item.url.trim();
          return (
            <li
              key={itemId}
              className="flex flex-wrap items-center gap-3 p-2.5 md:flex-nowrap"
            >
              {group.sortable && (
                <span className="w-5 shrink-0 text-center text-xs font-bold text-muted">
                  {i + 1}
                </span>
              )}
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-surface">
                {item.image && (
                  <img
                    src={`${item.image}${item.image.includes('?') ? '&' : '?'}width=120`}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{item.label}</p>
                <p className="truncate text-xs text-muted">{item.handle}</p>
              </div>
              {item.hasUrl ? (
                <label className="order-last w-full md:order-none md:w-96">
                  <span className="sr-only">Link for {item.label}</span>
                  <input
                    type="text"
                    inputMode="url"
                    value={value}
                    placeholder="/collections/…"
                    onChange={(e) => onUrl(itemId, e.target.value)}
                    className={`w-full rounded border px-3 py-2 text-sm ${changed ? 'border-brand bg-brand/5' : 'border-line'}`}
                  />
                </label>
              ) : (
                <span className="hidden text-xs text-muted md:block md:w-96">
                  No link field
                </span>
              )}
              {group.sortable && (
                <MoveButtons
                  label={item.label}
                  first={i === 0}
                  last={i === order.length - 1}
                  onMove={(d) => onMove(i, d)}
                />
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function MoveButtons({label, first, last, onMove}) {
  const cls =
    'flex h-8 w-8 items-center justify-center rounded border border-line hover:bg-surface disabled:opacity-30';
  return (
    <div className="flex shrink-0 gap-1">
      <button
        type="button"
        disabled={first}
        onClick={() => onMove(-1)}
        aria-label={`Move ${label} up`}
        className={cls}
      >
        <Icon name="chevronDown" className="h-4 w-4 rotate-180" />
      </button>
      <button
        type="button"
        disabled={last}
        onClick={() => onMove(1)}
        aria-label={`Move ${label} down`}
        className={cls}
      >
        <Icon name="chevronDown" className="h-4 w-4" />
      </button>
    </div>
  );
}

/** @typedef {import('./+types/editor').Route} Route */
