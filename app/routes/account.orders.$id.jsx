import {Link, redirect, useLoaderData} from 'react-router';
import {
  btnPrimary,
  Card,
  formatDate,
  StatusBadge,
} from '~/components/account/ui';
import {STORE_LINKS} from '~/lib/site-config';
import {Money, Image} from '@shopify/hydrogen';
import {CUSTOMER_ORDER_QUERY} from '~/graphql/customer-account/CustomerOrderQuery';

/**
 * @type {Route.MetaFunction}
 */
export const meta = ({data}) => {
  return [{title: `Order ${data?.order?.name}`}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({params, context}) {
  const {customerAccount} = context;
  if (!params.id) {
    return redirect('/account/orders');
  }

  const orderId = atob(params.id);
  const {data, errors} = await customerAccount.query(CUSTOMER_ORDER_QUERY, {
    variables: {
      orderId,
      language: customerAccount.i18n.language,
    },
  });

  if (errors?.length || !data?.order) {
    throw new Error('Order not found');
  }

  const {order} = data;

  // Extract line items directly from nodes array
  const lineItems = order.lineItems.nodes;

  // Extract discount applications directly from nodes array
  const discountApplications = order.discountApplications.nodes;

  // Get fulfillment status from first fulfillment node
  const fulfillmentStatus = order.fulfillments.nodes[0]?.status ?? 'N/A';

  // Get first discount value with proper type checking
  const firstDiscount = discountApplications[0]?.value;

  // Type guard for MoneyV2 discount
  const discountValue =
    firstDiscount?.__typename === 'MoneyV2' ? firstDiscount : null;

  // Type guard for percentage discount
  const discountPercentage =
    firstDiscount?.__typename === 'PricingPercentageValue'
      ? firstDiscount.percentage
      : null;

  return {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  };
}

export default function OrderRoute() {
  /** @type {LoaderReturnData} */
  const {
    order,
    lineItems,
    discountValue,
    discountPercentage,
    fulfillmentStatus,
  } = useLoaderData();
  const hasDiscount =
    (discountValue && Number(discountValue.amount) > 0) || discountPercentage;
  const shipping = order.shippingAddress;
  const itemCount = lineItems.reduce((n, l) => n + l.quantity, 0);

  return (
    <div className="space-y-5">
      <Link
        to="/account/orders"
        className="inline-flex items-center gap-1 text-[13px] font-semibold text-gray-600 hover:text-black"
      >
        ← All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold md:text-[22px]">
            Order {order.name}
          </h1>
          <p className="mt-1 text-[14px] text-gray-500">
            Placed on {formatDate(order.processedAt)}
            {order.confirmationNumber && ` · Ref ${order.confirmationNumber}`}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={order.financialStatus} />
            <StatusBadge
              status={
                fulfillmentStatus !== 'N/A'
                  ? fulfillmentStatus
                  : order.fulfillmentStatus
              }
            />
          </div>
        </div>
        {order.statusPageUrl && (
          <a
            href={order.statusPageUrl}
            target="_blank"
            rel="noreferrer"
            className={btnPrimary}
          >
            Track order
          </a>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card title={`Items (${itemCount})`}>
          <ul className="divide-y divide-gray-200">
            {lineItems.map((lineItem) => (
              <OrderLineRow key={lineItem.id} lineItem={lineItem} />
            ))}
          </ul>
        </Card>

        <div className="space-y-5 lg:self-start">
          <Card title="Payment summary">
            <dl className="space-y-2 text-[14px]">
              <SummaryRow
                label="Subtotal"
                value={
                  <Money as="span" data={order.subtotal} withoutTrailingZeros />
                }
              />
              {hasDiscount && (
                <SummaryRow
                  label="Discount"
                  value={
                    <span className="text-green-700">
                      {discountPercentage ? (
                        `−${discountPercentage}%`
                      ) : (
                        <>
                          −{' '}
                          <Money
                            as="span"
                            data={discountValue}
                            withoutTrailingZeros
                          />
                        </>
                      )}
                    </span>
                  }
                />
              )}
              {order.totalShipping && (
                <SummaryRow
                  label="Delivery"
                  value={
                    Number(order.totalShipping.amount) > 0 ? (
                      <Money
                        as="span"
                        data={order.totalShipping}
                        withoutTrailingZeros
                      />
                    ) : (
                      <span className="text-green-700">FREE</span>
                    )
                  }
                />
              )}
              {order.totalTax && Number(order.totalTax.amount) > 0 && (
                <SummaryRow
                  label="Tax (included)"
                  value={
                    <Money
                      as="span"
                      data={order.totalTax}
                      withoutTrailingZeros
                    />
                  }
                />
              )}
              <div className="flex justify-between border-t border-gray-200 pt-3 text-[16px] font-bold">
                <dt>Total</dt>
                <dd>
                  <Money
                    as="span"
                    data={order.totalPrice}
                    withoutTrailingZeros
                  />
                </dd>
              </div>
            </dl>
          </Card>

          <Card title="Delivery address">
            {shipping ? (
              <address className="text-[14px] not-italic leading-relaxed">
                {(shipping.formatted ?? [shipping.name]).map((line, i) => (
                  <span
                    key={`${i}-${line}`}
                    className={`block ${i === 0 ? 'font-semibold' : ''}`}
                  >
                    {line}
                  </span>
                ))}
              </address>
            ) : (
              <p className="text-[14px] text-gray-500">No delivery address.</p>
            )}
          </Card>

          <p className="text-[13px] text-gray-500">
            Need help with this order?{' '}
            <a
              href={STORE_LINKS.help}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-black underline"
            >
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({label, value}) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-gray-600">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

/**
 * @param {{lineItem: OrderLineItemFullFragment}}
 */
function OrderLineRow({lineItem}) {
  const unit = Number(lineItem.price?.amount ?? 0);
  const discount = Number(lineItem.totalDiscount?.amount ?? 0);
  const lineTotal = lineItem.price && {
    amount: String(Math.max(0, unit * lineItem.quantity - discount)),
    currencyCode: lineItem.price.currencyCode,
  };
  return (
    <li className="flex gap-3 py-3 first:pt-0 last:pb-0 md:gap-4">
      <div className="h-24 w-18 shrink-0 overflow-hidden rounded-[2px] bg-gray-100">
        {lineItem.image && (
          <Image
            data={lineItem.image}
            width={144}
            aspectRatio="3/4"
            sizes="72px"
            className="h-full w-full object-cover"
          />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="line-clamp-2 text-[14px] font-semibold">
          {lineItem.title}
        </p>
        {lineItem.variantTitle && (
          <p className="mt-0.5 text-[13px] text-gray-500">
            {lineItem.variantTitle}
          </p>
        )}
        <p className="mt-1 text-[13px] text-gray-500">
          Qty {lineItem.quantity} ×{' '}
          {lineItem.price && (
            <Money as="span" data={lineItem.price} withoutTrailingZeros />
          )}
        </p>
        {discount > 0 && (
          <p className="text-[12px] font-semibold text-green-700">
            You saved{' '}
            <Money
              as="span"
              data={lineItem.totalDiscount}
              withoutTrailingZeros
            />
          </p>
        )}
      </div>
      {lineTotal && (
        <p className="shrink-0 text-[14px] font-bold">
          <Money as="span" data={lineTotal} withoutTrailingZeros />
        </p>
      )}
    </li>
  );
}

/** @typedef {import('./+types/account.orders.$id').Route} Route */
/** @typedef {import('customer-accountapi.generated').OrderLineItemFullFragment} OrderLineItemFullFragment */
/** @typedef {import('customer-accountapi.generated').OrderQuery} OrderQuery */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
