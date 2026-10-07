import {Suspense} from 'react';
import {Await, Link, useRouteLoaderData} from 'react-router';

/**
 * Renders `children(isLoggedIn)` once the root loader's login check resolves
 * (signed-out state while it loads or if it fails).
 */
export function AccountState({children}) {
  const root = useRouteLoaderData('root');
  return (
    <Suspense fallback={children(false)}>
      <Await resolve={root?.isLoggedIn} errorElement={children(false)}>
        {(loggedIn) => children(Boolean(loggedIn))}
      </Await>
    </Suspense>
  );
}

/**
 * "Sign up or Sign in" → Shopify's customer account login (new customers are
 * signed up on the same screen with an emailed code), or "My Account" once
 * signed in. Login is a full page load because it redirects to Shopify.
 */
export function AccountLink({
  signInText,
  accountText = 'My Account',
  className,
  onClick,
}) {
  return (
    <AccountState>
      {(loggedIn) =>
        loggedIn ? (
          <Link
            to="/account"
            prefetch="intent"
            className={className}
            onClick={onClick}
          >
            {accountText}
          </Link>
        ) : (
          <Link
            to="/account/login"
            reloadDocument
            className={className}
            onClick={onClick}
          >
            {signInText}
          </Link>
        )
      }
    </AccountState>
  );
}
