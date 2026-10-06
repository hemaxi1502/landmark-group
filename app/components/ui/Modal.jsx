import {useEffect, useRef} from 'react';
/**
 * Accessible modal: Escape closes, backdrop is a real button, focus moves
 * into the dialog on open and returns to the trigger on close, page scroll
 * is locked while open.
 */
export function Modal({
  open,
  onClose,
  label,
  children,
  backdropClassName = 'bg-black/50',
  className = 'relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded bg-white p-5',
}) {
  const panel = useRef(null);
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.focus();
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close"
        onClick={onClose}
        className={`absolute inset-0 cursor-default ${backdropClassName}`}
      />
      <div ref={panel} tabIndex={-1} className={`${className} outline-none`}>
        {children}
      </div>
    </div>
  );
}
