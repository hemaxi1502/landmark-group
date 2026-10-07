import {
  Link,
  useLoaderData,
  useNavigation,
  useSearchParams,
} from 'react-router';
import {useRef} from 'react';
import {
  Money,
  getPaginationVariables,
  flattenConnection,
} from '@shopify/hydrogen';
import {
  buildOrderSearchQuery,
  parseOrderFilters,
  ORDER_FILTER_FIELDS,
} from '~/lib/orderFilters';
import {CUSTOMER_ORDERS_QUERY} from '~/graphql/customer-account/CustomerOrdersQuery';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {
  btnLink,
  btnPrimary,
  btnSecondary,
  Card,
  formatDate,
  inputCls,
  PageTitle,
  StatusBadge,
} from '~/components/account/ui';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Orders'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, context}) {
  const {customerAccount} = context;
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 20,
  });

  const url = new URL(request.url);
  const filters = parseOrderFilters(url.searchParams);
  const query = buildOrderSearchQuery(filters);

  const {data, errors} = await customerAccount.query(CUSTOMER_ORDERS_QUERY, {
    variables: {
      ...paginationVariables,
      query,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.customer) {
    throw Error('Customer orders not found');
  }

  return {customer: data.customer, filters};
}

export default function Orders() {
  /** @type {LoaderReturnData} */
  const {customer, filters} = useLoaderData();
  const {orders} = customer;

  return (
    <div>
      <PageTitle sub="Track, return or reorder items from your past orders.">
        Orders
      </PageTitle>
      <OrderSearchForm currentFilters={filters} />
      <OrdersTable orders={orders} filters={filters} />
    </div>
  );
}

function OrdersTable({orders, filters}) {
  const hasFilters = !!(filters.name || filters.confirmationNumber);

  return (
    <div aria-live="polite">
      {orders?.nodes.length ? (
        <PaginatedResourceSection
          connection={orders}
          resourcesClassName="space-y-3"
        >
          {({node: order}) => <OrderItem key={order.id} order={order} />}
        </PaginatedResourceSection>
      ) : (
        <EmptyOrders hasFilters={hasFilters} />
      )}
    </div>
  );
}

function EmptyOrders({hasFilters = false}) {
  return (
    <Card className="py-10 text-center">
      {hasFilters ? (
        <>
          <p className="text-[15px] font-semibold">
            No orders match your search.
          </p>
          <Link to="/account/orders" className={`${btnSecondary} mt-4`}>
            Clear search
          </Link>
        </>
      ) : (
        <>
          <p className="text-[15px] font-semibold">
            You haven&apos;t placed any orders yet.
          </p>
          <p className="mt-1 text-[14px] text-gray-500">
            When you do, they&apos;ll show up here.
          </p>
          <Link to="/collections/all" className={`${btnPrimary} mt-5`}>
            Start shopping
          </Link>
        </>
      )}
    </Card>
  );
}

function OrderSearchForm({currentFilters}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigation = useNavigation();
  const isSearching =
    navigation.state !== 'idle' &&
    navigation.location?.pathname?.includes('orders');
  const formRef = useRef(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const params = new URLSearchParams();

    const name = formData.get(ORDER_FILTER_FIELDS.NAME)?.toString().trim();
    const confirmationNumber = formData
      .get(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER)
      ?.toString()
      .trim();

    if (name) params.set(ORDER_FILTER_FIELDS.NAME, name);
    if (confirmationNumber)
      params.set(ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER, confirmationNumber);

    setSearchParams(params);
  };

  const hasFilters =
    currentFilters.name ||
    currentFilters.confirmationNumber ||
    searchParams.toString();

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      aria-label="Search orders"
      className="mb-4 flex flex-col gap-2 sm:flex-row"
    >
      <input
        type="search"
        name={ORDER_FILTER_FIELDS.NAME}
        placeholder="Order number"
        aria-label="Order number"
        defaultValue={currentFilters.name || ''}
        className={inputCls}
      />
      <input
        type="search"
        name={ORDER_FILTER_FIELDS.CONFIRMATION_NUMBER}
        placeholder="Confirmation number"
        aria-label="Confirmation number"
        defaultValue={currentFilters.confirmationNumber || ''}
        className={inputCls}
      />
      <div className="flex gap-2">
        <button type="submit" disabled={isSearching} className={btnSecondary}>
          {isSearching ? 'Searching…' : 'Search'}
        </button>
        {hasFilters && (
          <button
            type="button"
            disabled={isSearching}
            className={btnLink}
            onClick={() => {
              setSearchParams(new URLSearchParams());
              formRef.current?.reset();
            }}
          >
            Clear
          </button>
        )}
      </div>
    </form>
  );
}

/**
 * @param {{order: OrderItemFragment}}
 */
function OrderItem({order}) {
  const fulfillmentStatus =
    flattenConnection(order.fulfillments)[0]?.status ?? order.fulfillmentStatus;
  const href = `/account/orders/${btoa(order.id)}`;
  return (
    <Link
      to={href}
      prefetch="intent"
      className="block rounded-[2px] border border-gray-200 bg-white p-4 transition-colors hover:border-black md:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[16px] font-bold">Order #{order.number}</p>
          <p className="mt-0.5 text-[13px] text-gray-500">
            Placed on {formatDate(order.processedAt)}
            {order.confirmationNumber && ` · Ref ${order.confirmationNumber}`}
          </p>
        </div>
        <p className="text-[16px] font-bold">
          <Money as="span" data={order.totalPrice} withoutTrailingZeros />
        </p>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={order.financialStatus} />
          <StatusBadge status={fulfillmentStatus} />
        </div>
        <span className="text-[13px] font-semibold text-[#FAA619]">
          View details →
        </span>
      </div>
    </Link>
  );
}

/**
 * @typedef {{
 *   customer: CustomerOrdersFragment;
 *   filters: OrderFilterParams;
 * }} OrdersLoaderData
 */

/** @typedef {import('./+types/account.orders._index').Route} Route */
/** @typedef {import('~/lib/orderFilters').OrderFilterParams} OrderFilterParams */
/** @typedef {import('customer-accountapi.generated').CustomerOrdersFragment} CustomerOrdersFragment */
/** @typedef {import('customer-accountapi.generated').OrderItemFragment} OrderItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
