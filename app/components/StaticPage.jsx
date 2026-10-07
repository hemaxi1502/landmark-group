import {NavLink} from 'react-router';

/** Help & info pages listed in the side menu of every static page. */
export const INFO_PAGES = [
  {to: '/pages/about-us', label: 'About Us'},
  {to: '/pages/contact', label: 'Contact Us'},
  {to: '/pages/faq', label: 'FAQs'},
  {to: '/pages/shipping', label: 'Shipping & Delivery'},
  {to: '/pages/returns', label: 'Returns & Refunds'},
  {to: '/pages/terms-and-conditions', label: 'Terms & Conditions'},
  {to: '/policies/privacy-policy', label: 'Privacy Policy'},
];

/**
 * Layout for Shopify Pages and policies: breadcrumb, title, side menu of
 * help pages, and the body (HTML from Shopify admin, or children).
 */
export function StaticPage({title, intro, html, children}) {
  return (
    <div className="page-width py-6 md:py-10">
      <nav aria-label="Breadcrumb" className="mb-3 text-[13px] text-gray-500">
        <NavLink to="/" className="hover:text-black">
          Home
        </NavLink>
        <span aria-hidden="true"> / </span>
        <span className="text-black">{title}</span>
      </nav>
      <h1 className="text-[24px] font-bold md:text-[30px]">{title}</h1>
      {intro && (
        <p className="mt-2 max-w-2xl text-[15px] text-gray-600">{intro}</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-12">
        <nav
          aria-label="Help &amp; info"
          className="order-last min-w-0 lg:order-first"
        >
          <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-gray-500">
            Help &amp; info
          </p>
          <ul className="border-t border-gray-200 lg:border-t-0">
            {INFO_PAGES.map((p) => (
              <li key={p.to}>
                <NavLink
                  to={p.to}
                  prefetch="intent"
                  className={({isActive}) =>
                    `block border-b border-gray-200 py-2.5 text-[14px] lg:border-b-0 lg:border-l-[3px] lg:py-2 lg:pl-3 ${
                      isActive
                        ? 'font-bold text-black lg:border-l-[#FAA619]'
                        : 'text-gray-600 hover:text-black lg:border-l-transparent'
                    }`
                  }
                >
                  {p.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0">
          {html && (
            <div
              className="rte max-w-3xl"
              dangerouslySetInnerHTML={{__html: html}}
            />
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
