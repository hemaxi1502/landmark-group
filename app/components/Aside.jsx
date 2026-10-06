import {createContext, useContext, useEffect, useState} from 'react';
import {useId} from 'react';
import {useLocation} from 'react-router';

/**
 * A side bar component with Overlay
 * @example
 * ```jsx
 * <Aside type="search" heading="SEARCH">
 *  <input type="search" />
 *  ...
 * </Aside>
 * ```
 * @param {{
 *   children?: React.ReactNode;
 *   type: AsideType;
 *   heading: React.ReactNode;
 * }}
 */
export function Aside({children, heading, type}) {
  const {type: activeType, close} = useAside();
  const expanded = type === activeType;
  const id = useId();
  useEffect(() => {
    const abortController = new AbortController();

    if (expanded) {
      document.addEventListener(
        'keydown',
        function handler(event) {
          if (event.key === 'Escape') {
            close();
          }
        },
        {signal: abortController.signal},
      );
    }
    return () => abortController.abort();
  }, [close, expanded]);

  return (
    <div
      aria-modal
      className={`overlay ${expanded ? 'expanded' : ''}`}
      role="dialog"
      aria-labelledby={id}
    >
      <button className="close-outside" onClick={close} />
      <aside className={type === 'mobile' ? 'no-header' : ''}>
        {type !== 'mobile' && (
          <header>
            <h3 id={id}>{heading}</h3>
            <button className="close reset" onClick={close} aria-label="Close">
              &times;
            </button>
          </header>
        )}
        <main>{children}</main>
      </aside>
      {type === 'mobile' && (
        <div 
          className="absolute top-0 right-0 h-[60px] flex items-center justify-center pointer-events-none z-50" 
          style={{ width: 'calc(100% - min(var(--aside-width), 85vw))' }}
        >
          <button 
            onClick={close}
            className="bg-transparent border-none text-white cursor-pointer pointer-events-auto flex items-center justify-center p-2 transition-opacity hover:opacity-80"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

const AsideContext = createContext(null);

Aside.Provider = function AsideProvider({children}) {
  const [type, setType] = useState('closed');
  const {pathname, search} = useLocation();

  // Close any open drawer when the shopper navigates to another page
  // (e.g. "View Basket" in the cart drawer, a link in the mobile menu).
  useEffect(() => {
    setType('closed');
  }, [pathname, search]);

  return (
    <AsideContext.Provider
      value={{
        type,
        open: setType,
        close: () => setType('closed'),
      }}
    >
      {children}
    </AsideContext.Provider>
  );
};

export function useAside() {
  const aside = useContext(AsideContext);
  if (!aside) {
    throw new Error('useAside must be used within an AsideProvider');
  }
  return aside;
}

/** @typedef {'search' | 'cart' | 'mobile' | 'closed'} AsideType */
/**
 * @typedef {{
 *   type: AsideType;
 *   open: (mode: AsideType) => void;
 *   close: () => void;
 * }} AsideContextValue
 */

/** @typedef {import('react').ReactNode} ReactNode */
