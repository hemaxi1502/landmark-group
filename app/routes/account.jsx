import {
  data as remixData,
  Form,
  NavLink,
  Outlet,
  useLoaderData,
} from 'react-router';
import {CUSTOMER_DETAILS_QUERY} from '~/graphql/customer-account/CustomerDetailsQuery';

export function shouldRevalidate() {
  return true;
}

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const {customerAccount} = context;
  const {data, errors} = await customerAccount.query(CUSTOMER_DETAILS_QUERY, {
    variables: {
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw new Error('Customer not found');
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  );
}

export default function AccountLayout() {
  /** @type {LoaderReturnData} */
  const {customer} = useLoaderData();
  const name = [customer?.firstName, customer?.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="page-width py-6 md:py-10">
      <div className="mb-6 flex items-center gap-3 border-b border-gray-200 pb-5">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#FAA619] text-[18px] font-bold uppercase text-white"
        >
          {customer?.firstName?.[0] ??
            customer?.emailAddress?.emailAddress?.[0] ??
            '?'}
        </span>
        <div className="min-w-0">
          <p className="text-[13px] text-gray-500">My Account</p>
          <p className="truncate text-[18px] font-bold">
            {name ? `Hi, ${name}` : 'Welcome to Lifestyle'}
          </p>
          {customer?.emailAddress?.emailAddress && (
            <p className="truncate text-[13px] text-gray-500">
              {customer.emailAddress.emailAddress}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
        <AccountMenu />
        <div className="min-w-0">
          <Outlet context={{customer}} />
        </div>
      </div>
    </div>
  );
}

const MENU = [
  {to: '/account/orders', label: 'Orders'},
  {to: '/account/profile', label: 'Profile'},
  {to: '/account/addresses', label: 'Addresses'},
  {to: '/wishlist', label: 'Favourites'},
];

function AccountMenu() {
  const item = ({isActive, isPending}) =>
    `block whitespace-nowrap border-b-2 px-3 py-2.5 text-[14px] lg:border-b-0 lg:border-l-[3px] lg:px-4 ${
      isActive
        ? 'border-[#FAA619] font-bold text-black'
        : 'border-transparent text-gray-600 hover:text-black'
    } ${isPending ? 'opacity-60' : ''}`;

  return (
    <nav aria-label="Account" className="min-w-0 lg:self-start">
      <ul className="-mx-4 flex overflow-x-auto border-b border-gray-200 px-4 lg:mx-0 lg:flex-col lg:border-b-0 lg:px-0">
        {MENU.map((m) => (
          <li key={m.to}>
            <NavLink to={m.to} prefetch="intent" className={item}>
              {m.label}
            </NavLink>
          </li>
        ))}
        <li>
          <Logout />
        </li>
      </ul>
    </nav>
  );
}

function Logout() {
  return (
    <Form method="POST" action="/account/logout">
      <button
        type="submit"
        className="block whitespace-nowrap px-3 py-2.5 text-left text-[14px] text-gray-600 hover:text-red-600 lg:px-4"
      >
        Sign out
      </button>
    </Form>
  );
}

/** @typedef {import('./+types/account').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
