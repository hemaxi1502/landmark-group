import {useEffect} from 'react';
import {Analytics, getShopAnalytics, useNonce} from '@shopify/hydrogen';
import {
  Outlet,
  useRouteError,
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
} from 'react-router';
import favicon from '~/assets/favicon.svg';
import {FOOTER_QUERY, HEADER_QUERY} from '~/lib/fragments';
import resetStyles from '~/styles/reset.css?url';
import appStyles from '~/styles/app.css?url';
import tailwindCss from './styles/tailwind.css?url';
import {PageLayout} from './components/PageLayout';

/**
 * This is important to avoid re-fetching root queries on sub-navigations
 * @type {ShouldRevalidateFunction}
 */
export const shouldRevalidate = ({formMethod, currentUrl, nextUrl}) => {
  // revalidate when a mutation is performed e.g add to cart, login...
  if (formMethod && formMethod !== 'GET') return true;

  // revalidate when manually revalidating via useRevalidator
  if (currentUrl.toString() === nextUrl.toString()) return true;

  // Defaulting to no revalidation for root loader data to improve performance.
  // When using this feature, you risk your UI getting out of sync with your server.
  // Use with caution. If you are uncomfortable with this optimization, update the
  // line below to `return defaultShouldRevalidate` instead.
  // For more details see: https://remix.run/docs/en/main/route/should-revalidate
  return false;
};

/**
 * The main and reset stylesheets are added in the Layout component
 * to prevent a bug in development HMR updates.
 *
 * This avoids the "failed to execute 'insertBefore' on 'Node'" error
 * that occurs after editing and navigating to another page.
 *
 * It's a temporary fix until the issue is resolved.
 * https://github.com/remix-run/remix/issues/9242
 */
export function links() {
  return [
    {
      rel: 'preconnect',
      href: 'https://cdn.shopify.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.googleapis.com',
    },
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous',
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader(args) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  const {storefront, env} = args.context;

  return {
    ...deferredData,
    ...criticalData,
    publicStoreDomain: env.PUBLIC_STORE_DOMAIN,
    shop: getShopAnalytics({
      storefront,
      publicStorefrontId: env.PUBLIC_STOREFRONT_ID,
    }),
    consent: {
      checkoutDomain: env.PUBLIC_CHECKOUT_DOMAIN,
      storefrontAccessToken: env.PUBLIC_STOREFRONT_API_TOKEN,
      withPrivacyBanner: false,
      // localize the privacy banner
      country: args.context.storefront.i18n.country,
      language: args.context.storefront.i18n.language,
    },
  };
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 * @param {Route.LoaderArgs}
 */
async function loadCriticalData({context}) {
  const {storefront} = context;

  const METAOBJECT_QUERY = `#graphql
    query MainHeaderMetaobject {
      metaobject(handle: {type: "main_header", handle: "main-header-azyeqhek"}) {
        fields {
          key
          value
          reference {
            ... on Metaobject {
              fields {
                key
                value
              }
            }
            ... on MediaImage {
              image {
                url
              }
            }
          }
        }
      }
    }
  `;

  const {metaobject} = await storefront.query(METAOBJECT_QUERY, {
    cache: storefront.CacheNone(),
  });

  const menuField =
    metaobject?.fields?.find((f) => f.key === 'menu')?.value || 'Main menu';
  const headerMenuHandle = menuField.toLowerCase().replace(/\s+/g, '-');

  const [header] = await Promise.all([
    storefront.query(HEADER_QUERY, {
      cache: storefront.CacheNone(),
      variables: {
        headerMenuHandle, // Uses dynamic handle from metaobject
      },
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  header.mainHeaderMetaobject = metaobject;

  return {header};
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 * @param {Route.LoaderArgs}
 */
function loadDeferredData({context}) {
  const {storefront, customerAccount, cart} = context;

  // defer the footer query (below the fold)
  const footer = storefront
    .query(FOOTER_QUERY, {
      cache: storefront.CacheLong(),
    })
    .catch((error) => {
      // Log query errors, but don't throw them so the page can still render
      console.error(error);
      return null;
    });
  return {
    cart: cart.get(),
    isLoggedIn: customerAccount.isLoggedIn(),
    footer,
  };
}

/**
 * @param {{children?: React.ReactNode}}
 */
export function Layout({children}) {
  const nonce = useNonce();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="stylesheet" href={tailwindCss}></link>
        <link rel="stylesheet" href={resetStyles}></link>
        <link rel="stylesheet" href={appStyles}></link>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  /** @type {RootLoader} */
  const data = useRouteLoaderData('root');

  if (!data) {
    return <Outlet />;
  }

  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <PageLayout {...data}>
        <Outlet />
      </PageLayout>
    </Analytics.Provider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const data = useRouteLoaderData('root');
  let errorMessage = 'Unknown error';
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }
  const notFound = errorStatus === 404;

  useEffect(() => {
    document.title = notFound
      ? 'Page not found | Lifestyle'
      : 'Something went wrong | Lifestyle';
  }, [notFound]);

  const content = (
    <div className="page-width flex flex-col items-center py-16 text-center md:py-24">
      <p className="text-[56px] font-bold leading-none text-[#FAA619]">
        {errorStatus}
      </p>
      <h1 className="mt-4 text-[22px] font-bold md:text-[26px]">
        {notFound ? "We can't find that page" : 'Something went wrong'}
      </h1>
      <p className="mt-2 max-w-md text-[15px] text-gray-600">
        {notFound
          ? 'The link may be old or the page may have moved. Try searching, or start from one of these.'
          : 'Please try again in a moment. If it keeps happening, contact us.'}
      </p>
      {notFound && (
        <form action="/search" className="mt-6 flex w-full max-w-md gap-2">
          <label htmlFor="notfound-q" className="sr-only">
            Search
          </label>
          <input
            id="notfound-q"
            name="q"
            type="search"
            placeholder="What are you looking for?"
            className="h-11 min-w-0 flex-1 rounded-[2px] border border-gray-300 px-3 text-[14px]"
          />
          <button
            type="submit"
            className="h-11 rounded-[2px] bg-black px-5 text-[14px] font-semibold text-white"
          >
            Search
          </button>
        </form>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {[
          ['/', 'Home'],
          ['/collections/women', 'Women'],
          ['/collections/men', 'Men'],
          ['/collections/kids', 'Kids'],
          ['/pages/contact', 'Contact us'],
        ].map(([to, label]) => (
          <a
            key={to}
            href={to}
            className="rounded-[2px] border border-black px-4 py-2 text-[14px] font-semibold hover:bg-gray-50"
          >
            {label}
          </a>
        ))}
      </div>
      {/* Technical details only in development. */}
      {import.meta.env.DEV && errorMessage && !notFound && (
        <pre className="mt-8 max-w-full overflow-x-auto rounded bg-gray-100 p-3 text-left text-[12px]">
          {String(errorMessage)}
        </pre>
      )}
    </div>
  );

  if (!data) return content;
  return (
    <Analytics.Provider
      cart={data.cart}
      shop={data.shop}
      consent={data.consent}
    >
      <PageLayout {...data}>{content}</PageLayout>
    </Analytics.Provider>
  );
}

/** @typedef {LoaderReturnData} RootLoader */

/** @typedef {import('react-router').ShouldRevalidateFunction} ShouldRevalidateFunction */
/** @typedef {import('./+types/root').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
