import {useEffect, useRef, useState} from 'react';
import {NavLink, useFetcher} from 'react-router';
import {Icon} from '~/components/ui/Icon';

/** Shared pieces of /editor (homepage) and /editor/pages (page builder). */

export function EditorTabs() {
  const cls = ({isActive}) =>
    `border-b-[3px] px-1 pb-2 text-[14px] font-semibold ${isActive ? 'border-[#FAA619] text-black' : 'border-transparent text-gray-500 hover:text-black'}`;
  return (
    <nav aria-label="Editor" className="mb-5 flex gap-6 border-b border-line">
      <NavLink to="/editor" end className={cls}>
        Homepage
      </NavLink>
      <NavLink to="/editor/pages" className={cls}>
        Pages
      </NavLink>
    </nav>
  );
}

/**
 * One image field: shows the current (or newly uploaded) picture and a
 * Replace button. The file goes to Shopify Files straight away; the field
 * only changes on the live site after Save.
 */
export function ImageSlot({itemId, field, alt, edit, onUploaded}) {
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

export function MoveButtons({label, first, last, onMove}) {
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
