import {useEffect, useRef, useState} from 'react';
import {NavLink, useLocation} from 'react-router';

/**
 * Nested mega menu built from the Shopify "main-menu" (3 levels):
 *
 *   Women                      ← level 1: category tile in the header
 *     Ethnic & Fusion Wear     ← level 2: column heading
 *       Kurtas & Kurtis        ← level 3: links under the heading
 *
 * Level-1 titles may carry the tile image after the name, e.g.
 * "Women (https://cdn.shopify.com/…/Nav-Women-Tile.webp)". Everything is
 * edited in Shopify admin → Content → Menus → Main menu.
 */

const IMAGE_IN_TITLE = /^(.*?)\s*[[(](https?:\/\/[^\s\])]+)/;

/** "Women (https://…png)" → {title: "Women", image: "https://…png"} */
export function parseMenuTitle(raw = '') {
  const match = raw.match(IMAGE_IN_TITLE);
  return match
    ? {title: match[1].trim(), image: match[2]}
    : {title: raw.trim(), image: null};
}

/** Store URLs → relative paths; "#" and empty → null (not a link). */
export function menuPath(url, {primaryDomainUrl, publicStoreDomain} = {}) {
  // Placeholder items ("#") aren't links; Shopify may return them as "https://shop/#".
  if (!url || url.trim().endsWith('#')) return null;
  if (
    url.includes('myshopify.com') ||
    (publicStoreDomain && url.includes(publicStoreDomain)) ||
    (primaryDomainUrl && url.includes(primaryDomainUrl))
  ) {
    try {
      const {pathname, search} = new URL(url);
      return `${pathname}${search}`;
    } catch {
      return url;
    }
  }
  return url;
}

/**
 * Picture for a category's mega panel: the collection image set in admin
 * (Products → Collections → image), else its best-selling product's photo.
 * The tile image in the menu title is only 64px, too small to show here.
 */
function menuPicture(item) {
  const res = item?.resource;
  return res?.image ?? res?.products?.nodes?.[0]?.featuredImage ?? null;
}

function withWidth(url, width) {
  return `${url}${url.includes('?') ? '&' : '?'}width=${width}`;
}

const OPEN_DELAY = 120;
const CLOSE_DELAY = 180;

/**
 * Desktop: category tiles; hovering (or focusing) one opens a full-width
 * panel with its level-2 items as column headings and level-3 links below.
 */
export function DesktopMegaMenu({
  menu,
  primaryDomainUrl,
  publicStoreDomain,
  isScrolled,
}) {
  const [openId, setOpenId] = useState(null);
  const timer = useRef();
  const location = useLocation();
  const opts = {primaryDomainUrl, publicStoreDomain};

  const schedule = (id, delay) => {
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setOpenId(id), delay);
  };
  const closeNow = () => {
    window.clearTimeout(timer.current);
    setOpenId(null);
  };

  // Close on navigation, Escape, and unmount.
  useEffect(closeNow, [location.pathname, location.search]);
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && closeNow();
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(timer.current);
    };
  }, []);

  const items = menu?.items ?? [];
  const openItem = items.find((i) => i.id === openId);

  return (
    <div onMouseLeave={() => schedule(null, CLOSE_DELAY)}>
      <nav
        className="flex justify-center gap-10 overflow-x-auto overflow-y-hidden pt-2"
        aria-label="Main"
      >
        {items.map((item) => {
          const {title, image} = parseMenuTitle(item.title);
          const to = menuPath(item.url, opts);
          const hasPanel = item.items?.length > 0;
          const isOpen = openId === item.id;
          return (
            <NavLink
              key={item.id}
              to={to ?? '/'}
              end
              prefetch="intent"
              aria-haspopup={hasPanel ? 'true' : undefined}
              aria-expanded={hasPanel ? isOpen : undefined}
              aria-controls={hasPanel ? `mega-${item.id}` : undefined}
              onMouseEnter={() =>
                schedule(hasPanel ? item.id : null, openId ? 0 : OPEN_DELAY)
              }
              onFocus={() => setOpenId(hasPanel ? item.id : null)}
              onClick={closeNow}
              className={`group flex h-auto flex-col items-center justify-start border-b-[3px] pt-[6px] pb-[12px] transition-colors ${isOpen ? 'border-[#FAA619]' : 'border-transparent hover:border-[#FAA619]'}`}
            >
              {({isActive}) => (
                <>
                  {image && (
                    <div
                      className={`flex flex-col items-center justify-end overflow-hidden transition-all duration-300 ease-in-out ${isScrolled ? 'mb-0 h-0 opacity-0' : 'mb-[10px] h-[64px] opacity-100'}`}
                    >
                      <img
                        src={image}
                        alt=""
                        className="mx-[12px] h-[64px] w-[64px] rounded-none"
                      />
                    </div>
                  )}
                  <span
                    className={`px-[7px] text-[14px] font-semibold whitespace-nowrap transition-colors ${isActive || isOpen ? 'text-[#FAA619]' : 'text-[#000000] group-hover:text-[#FAA619]'}`}
                  >
                    {title}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {openItem && (
        <MegaPanel
          item={openItem}
          opts={opts}
          onMouseEnter={() => schedule(openItem.id, 0)}
          onNavigate={closeNow}
        />
      )}
    </div>
  );
}

function MegaPanel({item, opts, onMouseEnter, onNavigate}) {
  const {title} = parseMenuTitle(item.title);
  const picture = menuPicture(item);
  const allPath = menuPath(item.url, opts);
  return (
    <div
      id={`mega-${item.id}`}
      role="region"
      aria-label={`${title} menu`}
      onMouseEnter={onMouseEnter}
      className="absolute inset-x-0 top-full z-40 border-t border-gray-200 bg-white shadow-[0_12px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="page-width flex max-h-[70vh] gap-8 overflow-y-auto py-6">
        <ul className="flex-1 columns-2 gap-8 md:columns-3 xl:columns-4">
          {item.items.map((col) => {
            const colPath = menuPath(col.url, opts);
            const children = col.items ?? [];
            return (
              <li key={col.id} className="mb-5 break-inside-avoid">
                {colPath ? (
                  <NavLink
                    to={colPath}
                    prefetch="intent"
                    onClick={onNavigate}
                    className="text-[14px] font-bold text-[#000000] hover:text-[#FAA619]"
                  >
                    {col.title}
                  </NavLink>
                ) : (
                  <span className="text-[14px] font-bold text-[#000000]">
                    {col.title}
                  </span>
                )}
                {children.length > 0 && (
                  <ul className="mt-2 space-y-1.5">
                    {children.map((link) => {
                      const to = menuPath(link.url, opts);
                      return (
                        <li key={link.id}>
                          {to ? (
                            <NavLink
                              to={to}
                              prefetch="intent"
                              onClick={onNavigate}
                              className="text-[13px] text-[#4A5568] hover:text-[#FAA619]"
                            >
                              {link.title}
                            </NavLink>
                          ) : (
                            <span className="text-[13px] text-[#798086]">
                              {link.title}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>

        {(picture || allPath) && (
          <div className="hidden w-48 shrink-0 lg:block">
            {picture && (
              <NavLink
                to={allPath ?? '#'}
                prefetch="intent"
                onClick={onNavigate}
                className="block overflow-hidden rounded bg-[#ECEDEB]"
              >
                <img
                  src={withWidth(picture.url, 400)}
                  srcSet={`${withWidth(picture.url, 200)} 200w, ${withWidth(picture.url, 400)} 400w`}
                  sizes="192px"
                  alt={picture.altText || title}
                  loading="lazy"
                  className="aspect-[3/4] w-full rounded-none object-cover transition duration-300 hover:scale-105"
                />
              </NavLink>
            )}
            {allPath && (
              <NavLink
                to={allPath}
                prefetch="intent"
                onClick={onNavigate}
                className="mt-3 block rounded-[2px] border border-[#FAA619] py-2 text-center text-[13px] font-semibold text-[#FAA619] hover:bg-[#FAA619] hover:text-white"
              >
                Shop all {title}
              </NavLink>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Mobile: the level-2 list for the selected tab. Items with level-3
 * children expand in place; others link straight through.
 */
export function MobileSubmenuList({items, opts, onNavigate}) {
  const [expanded, setExpanded] = useState(null);
  return (
    <ul className="flex flex-col">
      {items.map((sub) => {
        const to = menuPath(sub.url, opts);
        const children = sub.items ?? [];
        const isOpen = expanded === sub.id;
        const rowClass =
          'flex w-full items-center justify-between border-b border-gray-100 px-4 py-4 text-left text-[14px] text-[#000000] hover:bg-gray-50';

        if (!children.length) {
          return (
            <li key={sub.id}>
              {to ? (
                <NavLink to={to} onClick={onNavigate} className={rowClass}>
                  {sub.title}
                  <Chevron />
                </NavLink>
              ) : (
                <span className={`${rowClass} text-[#798086]`}>
                  {sub.title}
                </span>
              )}
            </li>
          );
        }

        return (
          <li key={sub.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setExpanded(isOpen ? null : sub.id)}
              className={rowClass}
            >
              <span className={isOpen ? 'font-semibold' : ''}>{sub.title}</span>
              <Chevron className={isOpen ? 'rotate-90' : ''} />
            </button>
            {isOpen && (
              <ul className="bg-[#F7F8F7] py-1">
                {to && (
                  <li>
                    <NavLink
                      to={to}
                      onClick={onNavigate}
                      className="block px-8 py-3 text-[13px] font-semibold text-[#FAA619]"
                    >
                      View all {sub.title}
                    </NavLink>
                  </li>
                )}
                {children.map((link) => {
                  const linkTo = menuPath(link.url, opts);
                  return (
                    <li key={link.id}>
                      {linkTo ? (
                        <NavLink
                          to={linkTo}
                          onClick={onNavigate}
                          className="block px-8 py-3 text-[13px] text-[#292D35]"
                        >
                          {link.title}
                        </NavLink>
                      ) : (
                        <span className="block px-8 py-3 text-[13px] text-[#798086]">
                          {link.title}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Chevron({className = ''}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ${className}`}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.25 4.5l7.5 7.5-7.5 7.5"
      />
    </svg>
  );
}
