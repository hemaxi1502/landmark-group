import {useEffect, useRef} from 'react';
import {createPortal} from 'react-dom';
/**
 * Accessible modal: Escape closes, backdrop is a real button, focus moves
 * into the dialog on open and returns to the trigger on close, page scroll
 * is locked while open. Rendered in a portal on <body>.
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
  if (!open || typeof document === 'undefined') return null;
  // Rendered at <body> so it sits above the sticky header and can be opened
  // from inside inline text (a <p>) without invalid nesting.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
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
    </div>,
    document.body,
  );
}
