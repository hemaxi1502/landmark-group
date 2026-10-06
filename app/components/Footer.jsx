import {Suspense} from 'react';
import {Await, Link} from 'react-router';
import {menuItemUrl} from '~/lib/menu';
const COLUMN_TITLES = {
  women: 'Women',
  men: 'Men',
  kids: 'Kids',
  beauty: 'Beauty',
  footwear: 'Footwear',
  bags: 'Bags',
  homeLiving: 'Home & Living',
};
/** Section 6 · Footer — category link columns from the store's footer-* menus, policies, copyright. */
export function Footer({footer, publicStoreDomain, primaryDomainUrl}) {
  return (
    <Suspense>
      <Await resolve={footer}>
        {(data) => {
          if (!data) return null;
          const columns = Object.keys(COLUMN_TITLES)
            .map((key) => ({key, menu: data[key]}))
            .filter((c) => c.menu?.items.length);
          const policies = [
            data.shop.privacyPolicy,
            data.shop.refundPolicy,
            data.shop.shippingPolicy,
            data.shop.termsOfService,
          ].filter((p) => !!p);
          return (
            <footer className="mt-16 bg-surface">
              <div className="container-site grid grid-cols-2 gap-8 py-12 md:grid-cols-4 lg:grid-cols-7">
                {columns.map(({key, menu}) => (
                  <div key={key}>
                    <h3 className="mb-3 text-sm font-semibold">
                      {COLUMN_TITLES[key]}
                    </h3>
                    <ul className="space-y-2">
                      {menu.items.map((item) => {
                        const url = menuItemUrl(
                          item.url,
                          publicStoreDomain,
                          primaryDomainUrl,
                        );
                        return url ? (
                          <li key={item.id}>
                            <Link
                              to={url}
                              className="text-xs text-muted hover:text-ink"
                            >
                              {item.title}
                            </Link>
                          </li>
                        ) : null;
                      })}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="border-t border-line">
                <div className="container-site flex flex-col items-center justify-between gap-3 py-5 text-xs text-muted md:flex-row">
                  <p>
                    © {new Date().getFullYear()} {data.shop.name}. All rights
                    reserved.
                  </p>
                  <ul className="flex flex-wrap gap-4">
                    {policies.map((p) => (
                      <li key={p.handle}>
                        <Link
                          to={`/policies/${p.handle}`}
                          className="hover:text-ink"
                        >
                          {p.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </footer>
          );
        }}
      </Await>
    </Suspense>
  );
}
