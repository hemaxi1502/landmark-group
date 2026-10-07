import {useEffect, useMemo, useRef, useState} from 'react';
import {Form, Link, useFetcher, useLoaderData} from 'react-router';
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
  uploadImage,
} from '~/lib/editor-content.server';
import {Icon} from '~/components/ui/Icon';

/**
 * /editor — a password-protected page for the client to:
 *  - reorder, rename and hide/show homepage sections
 *  - reorder the cards / slides inside a section
 *  - replace images (desktop + mobile) and edit texts
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

/** An image upload must not reload the tree (it would drop unsaved edits). */
export function shouldRevalidate({formData, defaultShouldRevalidate}) {
  if (formData?.get('intent') === 'upload') return false;
  return defaultShouldRevalidate;
}

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

  if (intent === 'upload') {
    try {
      const result = await uploadImage(
        env,
        form.get('file'),
        String(form.get('alt') ?? ''),
      );
      return {upload: result};
    } catch (error) {
      return {upload: {error: error.message || 'Upload failed.'}};
    }
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

const initialGroupOrders = (tree) =>
  Object.fromEntries(
    tree.sections.flatMap((s) => s.groups.map((g) => [g.key, g.itemIds])),
  );

/**
 * Edits are kept per entry id → field key → value. Image edits hold the
 * uploaded file ({id, url, width}); everything else is a string.
 */
function EditorView({tree, save, open, setOpen}) {
  const [sectionOrder, setSectionOrder] = useState(() =>
    tree.sections.map((s) => s.id),
  );
  const [groupOrders, setGroupOrders] = useState(() =>
    initialGroupOrders(tree),
  );
  const [edits, setEdits] = useState({});

  const sectionsById = useMemo(
    () => Object.fromEntries(tree.sections.map((s) => [s.id, s])),
    [tree.sections],
  );

  const setEdit = (id, key, value) =>
    setEdits((prev) => ({...prev, [id]: {...prev[id], [key]: value}}));
  const editOf = (id, key) => edits[id]?.[key];

  /** Original value of a field, to tell real changes from no-op edits. */
  const originalOf = (id, key) => {
    const section = sectionsById[id];
    if (section) {
      if (key === 'hidden') return section.hidden ? 'true' : 'false';
      return undefined;
    }
    const headingSection = tree.sections.find((s) => s.headingId === id);
    if (headingSection) return headingSection.heading;
    const item = tree.items[id];
    if (!item) return undefined;
    if (key === 'url') return item.url;
    return item.texts.find((t) => t.key === key)?.value;
  };

  const changes = useMemo(() => {
    const byId = {};
    const add = (id, key, value) => {
      byId[id] ??= {id, fields: {}};
      byId[id].fields[key] = value;
    };

    sectionOrder.forEach((id, i) => {
      if (String(i + 1) !== String(sectionsById[id].sortOrder)) {
        add(id, 'sort_order', String(i + 1));
      }
    });
    for (const section of tree.sections) {
      for (const group of section.groups) {
        if (!group.sortable) continue;
        groupOrders[group.key].forEach((id, i) => {
          if (String(i + 1) !== String(tree.items[id].sortOrder)) {
            add(id, 'sort_order', String(i + 1));
          }
        });
      }
    }
    for (const [id, fields] of Object.entries(edits)) {
      for (const [key, value] of Object.entries(fields)) {
        if (value && typeof value === 'object') {
          if (value.id) add(id, key, value.id); // uploaded image
        } else if (
          String(value).trim() !== String(originalOf(id, key) ?? '').trim()
        ) {
          add(id, key, value);
        }
      }
    }
    return Object.values(byId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionOrder, groupOrders, edits, sectionsById, tree]);

  const changeCount = changes.reduce(
    (n, c) => n + Object.keys(c.fields).length,
    0,
  );
  const saving = save.state !== 'idle';
  const result = save.state === 'idle' ? save.data : null;

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const discard = () => {
    setSectionOrder(tree.sections.map((s) => s.id));
    setGroupOrders(initialGroupOrders(tree));
    setEdits({});
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Homepage editor</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">
            Open a section to change its heading, hide it, replace images, edit
            texts and links, or reorder cards. Arrows move sections and cards.
            Nothing goes live until you press Save.
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

      <ol className="mt-5 space-y-3">
        {sectionOrder.map((id, index) => {
          const section = sectionsById[id];
          const isOpen = open.has(id);
          const hidden =
            (editOf(id, 'hidden') ?? (section.hidden ? 'true' : 'false')) ===
            'true';
          const heading =
            (section.headingId && editOf(section.headingId, 'heading')) ??
            section.heading;
          const cardCount = section.groups.reduce(
            (n, g) => n + g.itemIds.length,
            0,
          );
          return (
            <li
              key={id}
              className={`rounded border ${hidden ? 'border-dashed border-line bg-surface/60' : 'border-line'}`}
            >
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
                    <span className="flex items-center gap-2">
                      <span className="truncate font-semibold">
                        {heading || section.title}
                      </span>
                      {hidden && (
                        <span className="shrink-0 rounded bg-ink px-1.5 py-0.5 text-[10px] font-bold text-white uppercase">
                          Hidden
                        </span>
                      )}
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
                  {(section.headingId || section.canHide) && (
                    <div className="flex flex-wrap items-end gap-4 rounded bg-surface p-3">
                      {section.headingId && (
                        <label className="min-w-0 flex-1 basis-64 text-xs font-semibold text-muted">
                          Section heading
                          <input
                            type="text"
                            value={heading}
                            maxLength={255}
                            onChange={(e) =>
                              setEdit(
                                section.headingId,
                                'heading',
                                e.target.value,
                              )
                            }
                            className="mt-1 block w-full rounded border border-line bg-white px-3 py-2 text-sm font-normal text-ink"
                          />
                        </label>
                      )}
                      {section.canHide && (
                        <label className="flex cursor-pointer items-center gap-2 py-2 text-sm font-semibold">
                          <input
                            type="checkbox"
                            checked={!hidden}
                            onChange={(e) =>
                              setEdit(
                                id,
                                'hidden',
                                e.target.checked ? 'false' : 'true',
                              )
                            }
                            className="h-4 w-4 accent-[#FAA619]"
                          />
                          Show on homepage
                        </label>
                      )}
                    </div>
                  )}
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
                      editOf={editOf}
                      setEdit={setEdit}
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
            {changeCount === 0
              ? 'No unsaved changes'
              : `${changeCount} unsaved ${changeCount === 1 ? 'change' : 'changes'}`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={discard}
              disabled={!changeCount || saving}
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
                disabled={!changeCount || saving}
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

function Group({group, order, items, editOf, setEdit, onMove}) {
  return (
    <section>
      <h2 className="mb-2 text-xs font-bold tracking-wide text-muted uppercase">
        {group.label}
      </h2>
      <ul className="divide-y divide-line rounded border border-line">
        {order.map((itemId, i) => (
          <ItemRow
            key={itemId}
            item={items[itemId]}
            position={group.sortable ? i + 1 : null}
            editOf={editOf}
            setEdit={setEdit}
            moveButtons={
              group.sortable && (
                <MoveButtons
                  label={items[itemId].label}
                  first={i === 0}
                  last={i === order.length - 1}
                  onMove={(d) => onMove(i, d)}
                />
              )
            }
          />
        ))}
      </ul>
    </section>
  );
}

function ItemRow({item, position, editOf, setEdit, moveButtons}) {
  const urlValue = editOf(item.id, 'url') ?? item.url;
  const urlChanged =
    editOf(item.id, 'url') !== undefined &&
    String(editOf(item.id, 'url')).trim() !== item.url.trim();
  const inputClass = (changed) =>
    `mt-1 block w-full rounded border px-3 py-2 text-sm font-normal text-ink ${changed ? 'border-brand bg-brand/5' : 'border-line'}`;

  return (
    <li className="flex flex-wrap gap-3 p-3 md:flex-nowrap">
      {position != null && (
        <span className="w-5 shrink-0 pt-1 text-center text-xs font-bold text-muted">
          {position}
        </span>
      )}

      {item.images.length > 0 && (
        <div className="flex shrink-0 gap-2">
          {item.images.map((img) => (
            <ImageSlot
              key={img.key}
              itemId={item.id}
              field={img}
              alt={item.label}
              edit={editOf(item.id, img.key)}
              onUploaded={(file) => setEdit(item.id, img.key, file)}
            />
          ))}
        </div>
      )}

      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <p className="truncate text-sm font-semibold">{item.label}</p>
          <p className="truncate text-xs text-muted">
            {item.typeName} · {item.handle}
          </p>
        </div>
        {item.texts.map((t) => {
          const value = editOf(item.id, t.key) ?? t.value;
          const changed =
            editOf(item.id, t.key) !== undefined &&
            String(editOf(item.id, t.key)).trim() !== t.value.trim();
          return (
            <label
              key={t.key}
              className="block text-xs font-semibold text-muted"
            >
              {t.label}
              {t.multiline ? (
                <textarea
                  rows={2}
                  value={value}
                  onChange={(e) => setEdit(item.id, t.key, e.target.value)}
                  className={inputClass(changed)}
                />
              ) : (
                <input
                  type="text"
                  value={value}
                  onChange={(e) => setEdit(item.id, t.key, e.target.value)}
                  className={inputClass(changed)}
                />
              )}
            </label>
          );
        })}
        {item.hasUrl && (
          <label className="block text-xs font-semibold text-muted">
            Link
            <input
              type="text"
              inputMode="url"
              value={urlValue}
              placeholder="/collections/…"
              onChange={(e) => setEdit(item.id, 'url', e.target.value)}
              className={inputClass(urlChanged)}
            />
          </label>
        )}
      </div>

      {moveButtons && <div className="shrink-0 pt-1">{moveButtons}</div>}
    </li>
  );
}

/**
 * One image field: shows the current (or newly uploaded) picture and a
 * Replace button. The file goes to Shopify Files straight away; the field
 * only changes on the live site after Save.
 */
function ImageSlot({itemId, field, alt, edit, onUploaded}) {
  const fetcher = useFetcher({key: `upload-${itemId}-${field.key}`});
  const input = useRef(null);
  const [preview, setPreview] = useState(null);
  const busy = fetcher.state !== 'idle';
  const result = fetcher.data?.upload;

  // Act only when an upload finishes (not when the editor re-mounts after a
  // save and the finished fetcher still holds its old result).
  const lastState = useRef(fetcher.state);
  useEffect(() => {
    const finished = lastState.current !== 'idle' && fetcher.state === 'idle';
    lastState.current = fetcher.state;
    if (!finished) return;
    if (result?.id) onUploaded(result);
    else if (result?.error) setPreview(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const src = edit?.url || preview || field.url;
  const thumb =
    src && !src.startsWith('blob:')
      ? `${src}${src.includes('?') ? '&' : '?'}width=240`
      : src;

  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    const data = new FormData();
    data.set('intent', 'upload');
    data.set('alt', alt ?? '');
    data.set('file', file);
    fetcher.submit(data, {method: 'post', encType: 'multipart/form-data'});
    e.target.value = '';
  };

  return (
    <div className="w-24">
      <div className="relative aspect-square overflow-hidden rounded border border-line bg-surface">
        {thumb ? (
          <img src={thumb} alt="" className="h-full w-full object-contain" />
        ) : (
          <span className="flex h-full items-center justify-center text-[10px] text-muted">
            No image
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/80 text-[11px] font-semibold">
            Uploading…
          </span>
        )}
        {edit?.id && !busy && (
          <span className="absolute top-1 left-1 rounded bg-brand px-1 text-[9px] font-bold text-white">
            NEW
          </span>
        )}
      </div>
      <p className="mt-1 truncate text-[10px] text-muted" title={field.label}>
        {field.label}
        {edit?.width ? ` · ${edit.width}px` : ''}
      </p>
      <button
        type="button"
        disabled={busy}
        onClick={() => input.current?.click()}
        className="mt-0.5 w-full rounded border border-line py-1 text-[11px] font-semibold hover:bg-surface disabled:opacity-40"
      >
        Replace
      </button>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={onPick}
      />
      {result?.error && (
        <p className="mt-1 text-[10px] text-danger" role="alert">
          {result.error}
        </p>
      )}
    </div>
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
