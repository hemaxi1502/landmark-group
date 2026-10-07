import {useEffect, useMemo, useRef, useState} from 'react';
import {
  data,
  Form,
  Link,
  redirect,
  useActionData,
  useFetcher,
  useLoaderData,
  useNavigation,
} from 'react-router';
import {isAdminConfigured, AdminConfigError} from '~/lib/admin-api.server';
import {isAuthed} from '~/lib/editor-auth.server';
import {uploadImage, uploadVideo} from '~/lib/editor-content.server';
import {
  createLayout,
  deleteLayout,
  getLayout,
  listLayouts,
  newLayoutHandle,
  saveLayout,
  validateLayout,
} from '~/lib/page-builder-admin.server';
import {
  BLOCK_TYPES,
  FIELD_INFO,
  PAGE_KINDS,
  blockLabel,
  layoutPath,
  missingFor,
  pageKindOf,
} from '~/lib/page-builder';
import {
  EditorTabs,
  ImageSlot,
  MoveButtons,
} from '~/components/editor/EditorParts';

/**
 * /editor/pages — the page builder. Create landing pages (/pages/<name>),
 * top menu category pages (/department/<collection>) or sub category pages
 * (blocks above /collections/<collection>) from blocks picked
 * from the block library (~/lib/page-builder BLOCK_TYPES), then set each
 * block's options, reorder, hide and save. Same password as /editor.
 */

export const meta = () => [
  {title: 'Page builder | Lifestyle Stores'},
  {name: 'robots', content: 'noindex, nofollow'},
];

export const headers = () => ({'Cache-Control': 'no-store'});

export function shouldRevalidate({formData, defaultShouldRevalidate}) {
  if (formData?.get('intent') === 'upload') return false;
  return defaultShouldRevalidate;
}

/** @param {import('react-router').LoaderFunctionArgs} */
export async function loader({request, context}) {
  const {env, session, storefront} = context;
  if (!env.EDITOR_PASSWORD || !isAuthed(session) || !isAdminConfigured(env)) {
    throw redirect('/editor');
  }
  const id = new URL(request.url).searchParams.get('id');
  const options = storefront
    .query(EDITOR_OPTIONS_QUERY, {cache: storefront.CacheShort()})
    .then(toOptions);

  try {
    if (id) {
      const [layout, opts] = await Promise.all([getLayout(env, id), options]);
      if (!layout) throw redirect('/editor/pages');
      return {mode: 'edit', layout, ...opts, loadedAt: Date.now()};
    }
    const [pages, opts] = await Promise.all([listLayouts(env), options]);
    return {mode: 'list', pages, ...opts};
  } catch (error) {
    if (error instanceof Response) throw error;
    if (error instanceof AdminConfigError) {
      return {mode: 'error', message: error.message};
    }
    throw error;
  }
}

function toOptions(d) {
  const collections = (d?.collections?.nodes ?? [])
    .map((c) => ({id: c.id, handle: c.handle, title: c.title}))
    .sort((a, b) => a.title.localeCompare(b.title));
  const homeSections = (d?.homeSections?.nodes ?? []).map((n) => ({
    id: n.id,
    handle: n.handle,
    title:
      n.heading?.reference?.title?.value ||
      n.handle.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase()),
  }));
  const handleOf = (url) => /\/collections\/([^/?#]+)/.exec(url ?? '')?.[1];
  const clean = (t = '') => t.replace(/\s*[[(]https?:.*$/, '').trim();
  // Top menu categories, each with its sub categories (menu levels 2 and 3).
  const topCategories = (d?.menu?.items ?? [])
    .map((top) => {
      const handle = handleOf(top.url);
      if (!handle) return null;
      const seen = new Set([handle]);
      const subs = [];
      for (const child of top.items ?? []) {
        for (const item of [child, ...(child.items ?? [])]) {
          const h = handleOf(item.url);
          if (h && !seen.has(h)) {
            seen.add(h);
            subs.push({handle: h, title: clean(item.title)});
          }
        }
      }
      return {handle, title: clean(top.title), subs};
    })
    .filter(Boolean);
  return {collections, homeSections, topCategories};
}

/** @param {import('react-router').ActionFunctionArgs} */
export async function action({request, context}) {
  const {env, session} = context;
  if (!isAuthed(session)) {
    return data(
      {errors: ['Your session expired. Sign in again at /editor.']},
      {status: 401},
    );
  }
  const form = await request.formData();
  const intent = form.get('intent');

  try {
    if (intent === 'upload') {
      const upload = form.get('media') === 'video' ? uploadVideo : uploadImage;
      const result = await upload(
        env,
        form.get('file'),
        String(form.get('alt') ?? ''),
      );
      return {upload: result};
    }

    if (intent === 'create') {
      const kind = ['top', 'sub'].includes(form.get('kind'))
        ? form.get('kind')
        : 'landing';
      const collectionHandle = String(form.get('collection') ?? '');
      const title =
        String(form.get('title') ?? '').trim() ||
        (kind === 'landing' ? '' : String(form.get('collectionTitle') ?? ''));
      const handle = newLayoutHandle({kind, title, collectionHandle});
      if (!title || !handle) {
        return {
          errors: [
            kind === 'landing'
              ? 'Give the page a title (letters or numbers).'
              : 'Pick a category.',
          ],
        };
      }
      const page = await createLayout(env, {handle, title});
      return redirect(`/editor/pages?id=${encodeURIComponent(page.id)}`);
    }

    if (intent === 'save') {
      const id = String(form.get('id') ?? '');
      let payload;
      try {
        payload = JSON.parse(String(form.get('payload') ?? '{}'));
      } catch {
        return {errors: ['Could not read the changes.']};
      }
      const validated = validateLayout(payload);
      if (validated.errors.length) return {errors: validated.errors};
      const result = await saveLayout(env, id, validated);
      return {ok: true, ...result};
    }

    if (intent === 'delete') {
      await deleteLayout(env, String(form.get('id') ?? ''));
      return redirect('/editor/pages');
    }
  } catch (error) {
    if (intent === 'upload') {
      return {upload: {error: error.message || 'Upload failed.'}};
    }
    return {errors: [error.message || 'Something went wrong.']};
  }
  return {errors: ['Unknown action.']};
}

export default function PageBuilder() {
  const d = useLoaderData();
  // Lives here so the save result survives the reload that follows a save.
  const save = useFetcher({key: 'page-builder-save'});
  return (
    <div className="container-site py-6 md:py-10">
      <EditorTabs />
      {d.mode === 'error' && (
        <p className="text-sm text-danger" role="alert">
          {d.message}
        </p>
      )}
      {d.mode === 'list' && <PagesList d={d} />}
      {d.mode === 'edit' && <PageEditor key={d.loadedAt} d={d} save={save} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* List + create                                                       */
/* ------------------------------------------------------------------ */

function PagesList({d}) {
  const actionData = useActionData();
  const nav = useNavigation();
  const [kind, setKind] = useState('landing');
  const [top, setTop] = useState(d.topCategories[0]?.handle ?? '');
  const [sub, setSub] = useState(d.topCategories[0]?.subs[0]?.handle ?? '');
  const busy = nav.state !== 'idle' && nav.formData?.get('intent') === 'create';
  const allSubs = d.topCategories.flatMap((t) => t.subs);
  const picked = kind === 'top' ? top : kind === 'sub' ? sub : '';
  const pickedTitle =
    kind === 'top'
      ? d.topCategories.find((t) => t.handle === top)?.title
      : allSubs.find((x) => x.handle === sub)?.title;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold md:text-2xl">Page builder</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Build pages from ready-made blocks: banners and videos, product
          carousels, category and brand tiles, homepage sections and more.
        </p>
      </div>

      <section className="rounded border border-line p-4 md:p-5">
        <h2 className="text-base font-bold">Create a page</h2>
        <Form method="post" className="mt-3 space-y-4">
          <input type="hidden" name="intent" value="create" />
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">
              What kind of page?
            </legend>
            <div className="grid gap-2 md:grid-cols-3">
              {Object.entries(PAGE_KIND_HELP).map(([value, help]) => (
                <label
                  key={value}
                  htmlFor={`kind-${value}`}
                  aria-label={PAGE_KINDS[value].label}
                  className={`flex cursor-pointer gap-2 rounded border p-3 text-sm ${kind === value ? 'border-[#FAA619] bg-[#FFF4E0]' : 'border-line'}`}
                >
                  <input
                    id={`kind-${value}`}
                    type="radio"
                    name="kind"
                    value={value}
                    checked={kind === value}
                    onChange={() => setKind(value)}
                    className="mt-0.5 accent-[#FAA619]"
                  />
                  <span>
                    <span className="block font-semibold">
                      {PAGE_KINDS[value].label}
                    </span>
                    <span className="block text-xs text-muted">{help}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            {kind === 'top' && (
              <label className="block text-sm sm:w-72">
                <span className="mb-1 block font-semibold">
                  Top menu category
                </span>
                <select
                  name="collection"
                  value={top}
                  onChange={(e) => setTop(e.target.value)}
                  className={inputCls}
                >
                  {d.topCategories.map((t) => (
                    <option key={t.handle} value={t.handle}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </label>
            )}
            {kind === 'sub' && (
              <label className="block text-sm sm:w-72">
                <span className="mb-1 block font-semibold">Sub category</span>
                <select
                  name="collection"
                  value={sub}
                  onChange={(e) => setSub(e.target.value)}
                  className={inputCls}
                >
                  {d.topCategories
                    .filter((t) => t.subs.length)
                    .map((t) => (
                      <optgroup key={t.handle} label={t.title}>
                        {t.subs.map((x) => (
                          <option key={x.handle} value={x.handle}>
                            {x.title}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                </select>
              </label>
            )}
            <input
              type="hidden"
              name="collectionTitle"
              value={pickedTitle ?? ''}
            />
            <label className="block flex-1 text-sm">
              <span className="mb-1 block font-semibold">
                Title{kind === 'landing' ? '' : ' (optional)'}
              </span>
              <input
                name="title"
                required={kind === 'landing'}
                maxLength={120}
                placeholder={
                  kind === 'landing' ? 'e.g. Diwali Sale' : pickedTitle
                }
                className={inputCls}
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="h-10 rounded bg-ink px-5 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-60"
            >
              {busy ? 'Creating…' : 'Create page'}
            </button>
          </div>
          {kind !== 'landing' && picked && (
            <p className="text-xs text-muted">
              {kind === 'top' ? (
                <>
                  Replaces <code>/department/{picked}</code> (opened from the
                  top menu). Add the &ldquo;Category page (automatic)&rdquo;
                  block to keep the automatic layout and add your own blocks
                  around it.
                </>
              ) : (
                <>
                  Your blocks show above the product list on{' '}
                  <code>/collections/{picked}</code>.
                </>
              )}
            </p>
          )}
          <Errors list={actionData?.errors} />
        </Form>
      </section>

      <section>
        <h2 className="mb-3 text-base font-bold">Your pages</h2>
        {d.pages.length === 0 ? (
          <p className="rounded border border-dashed border-line p-6 text-center text-sm text-muted">
            No pages yet. Create one above.
          </p>
        ) : (
          <ul className="divide-y divide-line rounded border border-line">
            {d.pages.map((p) => (
              <li
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 p-3 md:p-4"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {p.title}
                    <span className="ml-2 rounded bg-surface px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted">
                      {PAGE_KINDS[pageKindOf(p.handle)].label}
                    </span>
                  </p>
                  <p className="text-xs text-muted">
                    {layoutPath(p.handle)} · {p.blockCount}{' '}
                    {p.blockCount === 1 ? 'block' : 'blocks'}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm font-semibold">
                  <a
                    href={layoutPath(p.handle)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand"
                  >
                    View ↗
                  </a>
                  <Link
                    to={`/editor/pages?id=${encodeURIComponent(p.id)}`}
                    className="rounded border border-ink px-3 py-1.5"
                  >
                    Edit
                  </Link>
                  <DeleteButton id={p.id} title={p.title} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const PAGE_KIND_HELP = {
  landing: 'A new page, e.g. a sale or campaign. Lives at /pages/<name>.',
  top: 'Replaces the page a top menu tile opens (Women, Men, Kids…).',
  sub: 'Adds blocks above the products of a sub category (Topwear, Jeans…).',
};

function DeleteButton({id, title}) {
  return (
    <Form
      method="post"
      onSubmit={(e) => {
        if (!window.confirm(`Delete "${title}"? This can't be undone.`))
          e.preventDefault();
      }}
    >
      <input type="hidden" name="intent" value="delete" />
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-muted underline hover:text-danger">
        Delete
      </button>
    </Form>
  );
}

/* ------------------------------------------------------------------ */
/* Page editor                                                         */
/* ------------------------------------------------------------------ */

const inputCls =
  'h-10 w-full rounded border border-line bg-white px-3 text-sm focus:border-ink focus:outline-none';

let keySeq = 0;
const newKey = () => `k${++keySeq}`;

function emptyValues(kind) {
  return {
    heading: '',
    text: '',
    link: '',
    collection: '',
    collections: [],
    count: String(BLOCK_TYPES[kind]?.defaults?.count ?? ''),
    image: '',
    mobile_image: '',
    video: '',
    home_section: '',
  };
}

function PageEditor({d, save}) {
  const {layout} = d;
  const [title, setTitle] = useState(layout.title);
  const [description, setDescription] = useState(layout.description);
  const [blocks, setBlocks] = useState(() =>
    layout.blocks.map((b) => ({...b, key: b.id})),
  );
  const [initial] = useState(() =>
    JSON.stringify(payloadOf(layout.title, layout.description, layout.blocks)),
  );

  const payload = useMemo(
    () => payloadOf(title, description, blocks),
    [title, description, blocks],
  );
  const dirty = JSON.stringify(payload) !== initial;
  const saving = save.state !== 'idle';
  const result = save.state === 'idle' ? save.data : null;
  const [attempted, setAttempted] = useState(false);
  // Blocks set to Show that are missing what they need block saving.
  const problems = blocks
    .map((b, i) => ({
      key: b.key,
      n: i + 1,
      label: blockLabel(b.kind),
      msg: b.hidden ? '' : missingFor(b.kind, b.values),
    }))
    .filter((x) => x.msg);
  if (!title.trim())
    problems.unshift({
      key: 'title',
      n: 0,
      label: 'Page',
      msg: 'Add a page title.',
    });

  const update = (key, patch) =>
    setBlocks((list) =>
      list.map((b) => (b.key === key ? {...b, ...patch} : b)),
    );
  const setValue = (key, field, value) =>
    setBlocks((list) =>
      list.map((b) =>
        b.key === key ? {...b, values: {...b.values, [field]: value}} : b,
      ),
    );
  const move = (index, delta) =>
    setBlocks((list) => {
      const next = [...list];
      const t = index + delta;
      if (t < 0 || t >= next.length) return list;
      [next[index], next[t]] = [next[t], next[index]];
      return next;
    });
  const remove = (key) =>
    setBlocks((list) => list.filter((b) => b.key !== key));
  const add = (kind) =>
    setBlocks((list) => [
      ...list,
      {
        key: newKey(),
        id: null,
        kind,
        hidden: false,
        values: emptyValues(kind),
        imageUrls: {},
        uploads: {},
      },
    ]);

  const onSave = () => {
    if (problems.length) {
      setAttempted(true);
      window.alert(
        `Please fill in these blocks before saving (or untick "Show"):\n\n${problems
          .map((p) => (p.n ? `Block ${p.n} (${p.label}): ${p.msg}` : p.msg))
          .join('\n')}`,
      );
      const first = problems.find((p) => p.n);
      if (first)
        document
          .getElementById(`block-${first.key}`)
          ?.scrollIntoView({behavior: 'smooth', block: 'center'});
      return;
    }
    const fd = new FormData();
    fd.set('intent', 'save');
    fd.set('id', layout.id);
    fd.set('payload', JSON.stringify(payload));
    save.submit(fd, {method: 'post'});
  };

  return (
    <div className="pb-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Link
            to="/editor/pages"
            className="text-sm text-muted hover:text-ink"
          >
            ← All pages
          </Link>
          <h1 className="mt-1 text-xl font-bold md:text-2xl">
            {title || 'Untitled page'}
          </h1>
          <p className="text-xs text-muted">{layoutPath(layout.handle)}</p>
        </div>
        <a
          href={layoutPath(layout.handle)}
          target="_blank"
          rel="noreferrer"
          className="text-sm font-semibold text-brand"
        >
          View page ↗
        </a>
      </div>

      <div className="mt-5 grid gap-3 rounded border border-line p-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">Page title</span>
          <input
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block font-semibold">
            SEO description (optional)
          </span>
          <input
            value={description}
            maxLength={320}
            onChange={(e) => setDescription(e.target.value)}
            className={inputCls}
          />
        </label>
      </div>

      <h2 className="mt-8 text-base font-bold">Blocks</h2>
      {blocks.length === 0 && (
        <p className="mt-2 rounded border border-dashed border-line p-6 text-center text-sm text-muted">
          This page is empty. Add a block below.
        </p>
      )}
      <ol className="mt-3 space-y-3">
        {blocks.map((b, i) => (
          <BlockCard
            key={b.key}
            block={b}
            index={i}
            total={blocks.length}
            d={d}
            forceOpen={attempted}
            onMove={(delta) => move(i, delta)}
            onRemove={() => remove(b.key)}
            onHidden={(hidden) => update(b.key, {hidden})}
            onValue={(field, value) => setValue(b.key, field, value)}
            onUpload={(field, upload) =>
              update(b.key, {
                values: {...b.values, [field]: upload.id},
                uploads: {...b.uploads, [field]: upload},
              })
            }
          />
        ))}
      </ol>

      <AddBlock onAdd={add} />

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur">
        <div className="container-site flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="min-w-0 text-sm">
            {saving ? (
              <span>Saving…</span>
            ) : result?.ok && !dirty ? (
              <span className="font-semibold text-success">
                Saved. The page is live.
              </span>
            ) : result?.errors ? (
              <Errors list={result.errors} />
            ) : problems.length ? (
              <span className="font-semibold text-danger">
                {problems.length === 1
                  ? '1 block needs details before you can save.'
                  : `${problems.length} blocks need details before you can save.`}
              </span>
            ) : dirty ? (
              <span className="font-semibold">You have unsaved changes.</span>
            ) : (
              <span className="text-muted">No changes.</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              to={`/editor/pages?id=${encodeURIComponent(layout.id)}`}
              reloadDocument
              className={`text-sm font-semibold text-muted underline ${dirty ? '' : 'pointer-events-none opacity-40'}`}
            >
              Discard
            </Link>
            <button
              type="button"
              disabled={!dirty || saving}
              onClick={onSave}
              className="h-10 rounded bg-[#FAA619] px-6 text-sm font-bold uppercase tracking-wide text-white disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function payloadOf(title, description, blocks) {
  return {
    title,
    description,
    blocks: blocks.map((b) => ({
      id: b.id || null,
      kind: b.kind,
      hidden: Boolean(b.hidden),
      values: b.values,
    })),
  };
}

function summary(block, d) {
  const v = block.values;
  const coll = d.collections.find((c) => c.id === v.collection)?.title;
  switch (block.kind) {
    case 'banner':
      return [v.video && 'Video', (v.image || v.mobile_image) && 'Image']
        .filter(Boolean)
        .join(' + ')
        .concat(' set');
    case 'category_tiles':
      return `${v.collections.length} collection${v.collections.length === 1 ? '' : 's'}`;
    case 'home_section':
      return (
        d.homeSections.find((h) => h.id === v.home_section)?.title ??
        'Pick a section'
      );
    case 'text':
      return v.heading || 'No heading yet';
    default:
      return coll
        ? `${v.heading ? `${v.heading} · ` : ''}${coll}`
        : 'Pick a collection';
  }
}

function BlockCard({
  block,
  index,
  total,
  d,
  forceOpen,
  onMove,
  onRemove,
  onHidden,
  onValue,
  onUpload,
}) {
  const [open, setOpen] = useState(!block.id);
  const type = BLOCK_TYPES[block.kind];
  const label = (field) => type?.labels?.[field] ?? FIELD_INFO[field].label;
  const missing = missingFor(block.kind, block.values);
  const blocking = missing && !block.hidden;
  const isOpen = open || (forceOpen && blocking);

  return (
    <li
      id={`block-${block.key}`}
      className={`scroll-mt-24 rounded border ${
        blocking
          ? 'border-red-400 bg-white'
          : block.hidden
            ? 'border-dashed border-line bg-surface/60'
            : 'border-line bg-white'
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 p-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface text-xs font-bold">
          {index + 1}
        </span>
        <BlockPreview kind={block.kind} className="hidden h-14 w-24 sm:flex" />
        <button
          type="button"
          onClick={() => setOpen(!isOpen)}
          aria-expanded={isOpen}
          className="min-w-0 flex-1 text-left"
        >
          <span className="block text-sm font-bold">
            {blockLabel(block.kind)}
            {block.hidden && (
              <span className="ml-2 rounded bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase">
                Hidden
              </span>
            )}
            {missing && (
              <span
                className={`ml-2 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${blocking ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}
              >
                Needs details
              </span>
            )}
          </span>
          <span
            className={`block truncate text-xs ${blocking ? 'text-red-700' : 'text-muted'}`}
          >
            {missing || summary(block, d)}
          </span>
        </button>
        <label className="flex items-center gap-1.5 text-xs">
          <input
            type="checkbox"
            checked={!block.hidden}
            onChange={(e) => onHidden(!e.target.checked)}
            className="accent-[#FAA619]"
          />
          Show
        </label>
        <MoveButtons
          label={blockLabel(block.kind)}
          first={index === 0}
          last={index === total - 1}
          onMove={onMove}
        />
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Remove this block?')) onRemove();
          }}
          className="text-xs font-semibold text-muted underline hover:text-danger"
        >
          Remove
        </button>
      </div>

      {isOpen && type && (
        <div className="grid gap-4 border-t border-line p-4 md:grid-cols-2">
          <div className="flex gap-3 md:col-span-2">
            <BlockPreview kind={block.kind} className="h-16 w-28 shrink-0" />
            <p className="text-xs text-muted">
              {type.description}
              {block.hidden && missing && (
                <span className="mt-1 block text-amber-800">
                  Hidden blocks can be saved unfinished; fill them in before
                  ticking Show.
                </span>
              )}
            </p>
          </div>
          {type.fields.map((field) => (
            <FieldInput
              key={field}
              field={field}
              label={label(field)}
              block={block}
              d={d}
              onValue={onValue}
              onUpload={onUpload}
            />
          ))}
        </div>
      )}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Layout previews: a small wireframe of what each block looks like     */
/* ------------------------------------------------------------------ */

const box = 'rounded-[2px] bg-gray-300';

function BlockPreview({kind, className = ''}) {
  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 flex-col justify-center gap-1 overflow-hidden rounded border border-line bg-white p-1.5 ${className}`}
    >
      {PREVIEWS[kind] ?? null}
    </span>
  );
}

const Row = ({n, h = 'h-6', cls = ''}) => (
  <span className="flex flex-1 gap-0.5">
    {Array.from({length: n}, (_, i) => (
      <span key={i} className={`${box} ${h} flex-1 ${cls}`} />
    ))}
  </span>
);
const Line = ({w = 'w-1/2', cls = ''}) => (
  <span className={`block h-1 rounded bg-gray-400 ${w} ${cls}`} />
);

const PREVIEWS = {
  banner: (
    <span
      className={`${box} relative flex flex-1 items-center justify-center bg-gradient-to-br from-amber-200 to-orange-300`}
    >
      <span className="h-0 w-0 border-y-[5px] border-l-[8px] border-y-transparent border-l-white/90" />
    </span>
  ),
  product_carousel: (
    <>
      <Line w="w-1/3" />
      <span className="flex flex-1 items-stretch gap-0.5">
        <span className="self-center text-[8px] leading-none text-gray-500">
          ‹
        </span>
        <Row n={4} h="h-full" />
        <span className="self-center text-[8px] leading-none text-gray-500">
          ›
        </span>
      </span>
    </>
  ),
  product_grid: (
    <>
      <Line w="w-1/3" />
      <Row n={4} h="h-full" />
      <Row n={4} h="h-full" />
    </>
  ),
  category_tiles: (
    <>
      <Line w="w-1/3" />
      <Row n={6} h="h-full" />
      <span className="flex gap-0.5">
        {Array.from({length: 6}, (_, i) => (
          <span key={i} className="h-0.5 flex-1 rounded bg-gray-400" />
        ))}
      </span>
    </>
  ),
  brand_tiles: (
    <>
      <Line w="w-1/3" />
      <Row n={3} h="h-full" cls="rounded-full" />
      <Row n={3} h="h-full" cls="rounded-full" />
    </>
  ),
  price_bands: (
    <>
      <Line w="w-1/3" />
      <span className="flex flex-1 gap-0.5">
        {['499', '999', '1999', '2999'].map((p) => (
          <span
            key={p}
            className="flex flex-1 items-center justify-center rounded-[2px] bg-amber-100 text-[7px] font-bold text-amber-800"
          >
            ₹
          </span>
        ))}
      </span>
    </>
  ),
  text: (
    <span className="flex flex-1 flex-col items-center justify-center gap-1">
      <Line w="w-1/2" cls="h-1.5 bg-gray-500" />
      <Line w="w-3/4" />
      <Line w="w-2/3" />
      <span className="mt-0.5 h-2 w-1/4 rounded-[2px] bg-gray-700" />
    </span>
  ),
  home_section: (
    <span className="flex flex-1 flex-col gap-0.5">
      <span className="flex items-center gap-1 text-[7px] font-bold uppercase text-gray-500">
        ⌂ Home
      </span>
      <span
        className={`${box} flex-1 bg-gradient-to-r from-gray-300 to-gray-200`}
      />
      <Row n={5} h="h-3" />
    </span>
  ),
  department: (
    <span className="flex flex-1 flex-col gap-0.5">
      <span className="flex flex-1 gap-0.5">
        <span className="flex flex-1 flex-col justify-center gap-0.5 rounded-[2px] bg-gray-100 px-1">
          <Line w="w-3/4" cls="h-1.5 bg-gray-500" />
          <Line w="w-1/2" />
        </span>
        <Row n={3} h="h-full" />
      </span>
      <Row n={6} h="h-2.5" />
      <Row n={5} h="h-3" />
    </span>
  ),
};

function FieldInput({field, label, block, d, onValue, onUpload}) {
  const info = FIELD_INFO[field];
  const v = block.values[field];
  const id = `${block.key}-${field}`;
  const wrap = (input, wide) => (
    <div className={wide ? 'md:col-span-2' : undefined}>
      <label htmlFor={id} className="mb-1 block text-sm font-semibold">
        {label}
      </label>
      {input}
      {info.hint && <p className="mt-1 text-xs text-muted">{info.hint}</p>}
    </div>
  );

  switch (info.kind) {
    case 'text':
      return wrap(
        <input
          id={id}
          value={v}
          maxLength={field === 'link' ? 500 : 255}
          onChange={(e) => onValue(field, e.target.value)}
          className={inputCls}
        />,
      );
    case 'multiline':
      return wrap(
        <textarea
          id={id}
          value={v}
          rows={3}
          maxLength={2000}
          onChange={(e) => onValue(field, e.target.value)}
          className={`${inputCls} h-auto py-2`}
        />,
        true,
      );
    case 'number':
      return wrap(
        <input
          id={id}
          type="number"
          min={info.min}
          max={info.max}
          value={v}
          onChange={(e) => onValue(field, e.target.value)}
          className={`${inputCls} max-w-[8rem]`}
        />,
      );
    case 'collection':
      return wrap(
        <select
          id={id}
          value={v}
          onChange={(e) => onValue(field, e.target.value)}
          className={inputCls}
        >
          <option value="">Choose a collection…</option>
          {d.collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>,
      );
    case 'collections':
      return wrap(
        <CollectionsPicker
          id={id}
          value={v}
          options={d.collections}
          onChange={(next) => onValue(field, next)}
        />,
        true,
      );
    case 'home_section':
      return wrap(
        <select
          id={id}
          value={v}
          onChange={(e) => onValue(field, e.target.value)}
          className={inputCls}
        >
          <option value="">Choose a homepage section…</option>
          {d.homeSections.map((h) => (
            <option key={h.id} value={h.id}>
              {h.title}
            </option>
          ))}
        </select>,
        true,
      );
    case 'image':
      return (
        <div>
          <ImageSlot
            itemId={block.key}
            field={{key: field, label, url: block.imageUrls?.[field]}}
            alt={block.values.heading}
            edit={block.uploads?.[field]}
            onUploaded={(upload) => onUpload(field, upload)}
          />
          {v && (
            <button
              type="button"
              onClick={() => onValue(field, '')}
              className="mt-1 text-[11px] text-muted underline"
            >
              Remove image
            </button>
          )}
        </div>
      );
    case 'video':
      return (
        <div className="md:col-span-2">
          <p className="mb-1 text-sm font-semibold">{label}</p>
          <VideoSlot
            block={block}
            field={field}
            onUploaded={(upload) => onUpload(field, upload)}
            onRemove={() => onValue(field, '')}
          />
          <p className="mt-1 text-xs text-muted">
            MP4, WebM or MOV up to 30 MB. Plays muted on a loop; the desktop
            image is shown while it loads.
          </p>
        </div>
      );
    default:
      return null;
  }
}

function VideoSlot({block, field, onUploaded, onRemove}) {
  const fetcher = useFetcher({key: `upload-${block.key}-${field}`});
  const input = useRef(null);
  const [picked, setPicked] = useState(null);
  const busy = fetcher.state !== 'idle';
  const result = fetcher.data?.upload;
  const lastState = useRef(fetcher.state);

  useEffect(() => {
    const finished = lastState.current !== 'idle' && fetcher.state === 'idle';
    lastState.current = fetcher.state;
    if (!finished) return;
    if (result?.id) onUploaded({...result, name: picked?.name});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state]);
  useEffect(() => () => picked && URL.revokeObjectURL(picked.url), [picked]);

  const current = block.values[field];
  const upload = block.uploads?.[field];
  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPicked({url: URL.createObjectURL(file), name: file.name});
    const data = new FormData();
    data.set('intent', 'upload');
    data.set('media', 'video');
    data.set('alt', block.values.heading ?? '');
    data.set('file', file);
    fetcher.submit(data, {method: 'post', encType: 'multipart/form-data'});
    e.target.value = '';
  };

  return (
    <div className="flex flex-wrap items-start gap-3">
      <div className="relative flex aspect-video w-48 items-center justify-center overflow-hidden rounded border border-line bg-surface">
        {picked?.url ? (
          <video
            src={picked.url}
            muted
            loop
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        ) : current && block.imageUrls?.[field]?.startsWith('http') ? (
          <img
            src={block.imageUrls[field]}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[11px] text-muted">
            {current ? 'Video set' : 'No video'}
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-white/80 text-[11px] font-semibold">
            Uploading…
          </span>
        )}
      </div>
      <div className="space-y-1 text-xs">
        <button
          type="button"
          disabled={busy}
          onClick={() => input.current?.click()}
          className="rounded border border-line px-3 py-1.5 font-semibold hover:bg-surface disabled:opacity-40"
        >
          {current ? 'Replace video' : 'Upload video'}
        </button>
        {current && !busy && (
          <button
            type="button"
            onClick={onRemove}
            className="block text-muted underline"
          >
            Remove video
          </button>
        )}
        {upload?.processing && !busy && (
          <p className="max-w-xs text-amber-800">
            Uploaded. Shopify is still converting it; it starts playing on the
            site a minute or two after you save.
          </p>
        )}
        {result?.error && !busy && (
          <p className="max-w-xs text-danger" role="alert">
            {result.error}
          </p>
        )}
        <input
          ref={input}
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="hidden"
          onChange={onPick}
        />
      </div>
    </div>
  );
}

function CollectionsPicker({id, value, options, onChange}) {
  const [pick, setPick] = useState('');
  const byId = Object.fromEntries(options.map((o) => [o.id, o]));
  return (
    <div>
      <div className="flex gap-2">
        <select
          id={id}
          value={pick}
          onChange={(e) => setPick(e.target.value)}
          className={inputCls}
        >
          <option value="">Add a collection…</option>
          {options
            .filter((o) => !value.includes(o.id))
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
              </option>
            ))}
        </select>
        <button
          type="button"
          disabled={!pick || value.length >= 12}
          onClick={() => {
            onChange([...value, pick]);
            setPick('');
          }}
          className="h-10 shrink-0 rounded border border-ink px-4 text-sm font-semibold disabled:opacity-40"
        >
          Add
        </button>
      </div>
      {value.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {value.map((cid, i) => (
            <li
              key={cid}
              className="flex items-center gap-1 rounded-full bg-surface py-1 pr-1 pl-3 text-xs"
            >
              {byId[cid]?.title ?? 'Unknown collection'}
              <button
                type="button"
                aria-label="Move left"
                disabled={i === 0}
                onClick={() => {
                  const next = [...value];
                  [next[i - 1], next[i]] = [next[i], next[i - 1]];
                  onChange(next);
                }}
                className="px-1 disabled:opacity-30"
              >
                ‹
              </button>
              <button
                type="button"
                aria-label={`Remove ${byId[cid]?.title ?? 'collection'}`}
                onClick={() => onChange(value.filter((x) => x !== cid))}
                className="px-1 font-bold"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddBlock({onAdd}) {
  return (
    <section className="mt-6 rounded border border-line p-4">
      <h2 className="text-base font-bold">Add a block</h2>
      <p className="mt-0.5 text-xs text-muted">
        The picture next to each block shows its layout on the page.
      </p>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {Object.entries(BLOCK_TYPES).map(([kind, t]) => (
          <li key={kind}>
            <button
              type="button"
              onClick={() => onAdd(kind)}
              className="flex h-full w-full gap-3 rounded border border-line p-3 text-left hover:border-ink hover:bg-surface"
            >
              <BlockPreview kind={kind} className="h-16 w-28" />
              <span>
                <span className="block text-sm font-bold">+ {t.label}</span>
                <span className="mt-0.5 block text-xs text-muted">
                  {t.description}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Errors({list}) {
  if (!list?.length) return null;
  return (
    <ul className="space-y-0.5 text-sm text-danger" role="alert">
      {list.map((e) => (
        <li key={e}>{e}</li>
      ))}
    </ul>
  );
}

const EDITOR_OPTIONS_QUERY = `#graphql
  query PageBuilderOptions($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    collections(first: 250, sortKey: TITLE) {
      nodes {
        id
        handle
        title
      }
    }
    homeSections: metaobjects(type: "home_page", first: 50) {
      nodes {
        id
        handle
        heading: field(key: "heading") {
          reference {
            ... on Metaobject {
              title: field(key: "heading") {
                value
              }
            }
          }
        }
      }
    }
    menu(handle: "main-menu") {
      items {
        title
        url
        items {
          title
          url
          items {
            title
            url
          }
        }
      }
    }
  }
`;
