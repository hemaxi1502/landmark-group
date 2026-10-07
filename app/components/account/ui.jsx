/**
 * Shared building blocks for the /account pages, so Orders, Profile and
 * Addresses look like the rest of the store (orange brand, 2px radius).
 */

export const inputCls =
  'h-11 w-full rounded-[2px] border border-gray-300 bg-white px-3 text-[14px] text-black placeholder:text-gray-400 focus:border-black focus:outline-none';

export const btnPrimary =
  'inline-flex h-11 items-center justify-center rounded-[2px] bg-[#FAA619] px-6 text-[14px] font-semibold uppercase text-white transition-opacity hover:opacity-90 disabled:opacity-60';

export const btnSecondary =
  'inline-flex h-11 items-center justify-center rounded-[2px] border border-black px-6 text-[14px] font-semibold text-black transition-colors hover:bg-gray-50 disabled:opacity-60';

export const btnLink =
  'text-[13px] font-semibold text-gray-600 underline underline-offset-2 hover:text-black disabled:opacity-60';

export function Card({title, action, children, className = ''}) {
  return (
    <section
      className={`rounded-[2px] border border-gray-200 bg-white p-4 md:p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-[16px] font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Field({id, label, required, hint, children}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-[13px] font-semibold">
        {label}
        {required && <span className="text-red-600"> *</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-gray-500">{hint}</p>}
    </div>
  );
}

export function FormError({children}) {
  if (!children) return null;
  return (
    <p
      role="alert"
      className="rounded-[2px] bg-red-50 px-3 py-2 text-[13px] text-red-700"
    >
      {children}
    </p>
  );
}

export function PageTitle({children, sub}) {
  return (
    <div className="mb-5">
      <h1 className="text-[20px] font-bold md:text-[22px]">{children}</h1>
      {sub && <p className="mt-1 text-[14px] text-gray-500">{sub}</p>}
    </div>
  );
}

const STATUS_STYLES = {
  green: 'bg-green-50 text-green-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  gray: 'bg-gray-100 text-gray-700',
};

/** "PARTIALLY_REFUNDED" → "Partially refunded", coloured by meaning. */
export function StatusBadge({status}) {
  if (!status) return null;
  const s = String(status).toUpperCase();
  // Check "bad" and "in progress" first: UNFULFILLED contains FULFILLED.
  const tone = /REFUND|VOID|CANCEL|FAIL|EXPIRED/.test(s)
    ? 'red'
    : /PENDING|AUTHORIZED|OPEN|IN_PROGRESS|UNFULFILLED|ON_HOLD|PARTIAL/.test(s)
      ? 'amber'
      : /PAID|SUCCESS|DELIVERED|FULFILLED/.test(s)
        ? 'green'
        : 'gray';
  const text = s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, ' ');
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${STATUS_STYLES[tone]}`}
    >
      {text}
    </span>
  );
}

export function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}
