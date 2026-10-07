import {useLoaderData} from 'react-router';
import {MockShopNotice} from '~/components/MockShopNotice';
import {
  EXISTING_SECTIONS,
  HomeSectionByHandle,
  loadHomeRenderData,
} from '~/components/home/HomeSectionByHandle';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [
    {
      title:
        'Online Shopping for Men, Women & Kids in India | Lifestyle Stores',
    },
    {
      name: 'description',
      content:
        'Shop apparel, footwear, bags, beauty and home online at Lifestyle Stores. Free shipping, Click & Collect and easy returns.',
    },
  ];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context}) {
  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    home: await loadHomeRenderData(context.storefront),
  };
}

/**
 * Renders every home_page section in its admin `sort_order`.
 */
export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  // Section order comes from sort_order; fall back to the fixed list if it failed.
  const order = data.home.order.length
    ? data.home.order.map((o) => o.handle)
    : Object.keys(EXISTING_SECTIONS);

  return (
    <div className="flex w-full flex-col gap-8 pb-12">
      <h1 className="sr-only">
        Lifestyle: online shopping for women, men, kids, beauty and home
      </h1>
      {data.isShopLinked ? null : <MockShopNotice />}
      {order.map((handle, i) => (
        <HomeSectionByHandle
          key={handle}
          handle={handle}
          data={data.home}
          isFirst={i === 0}
        />
      ))}
    </div>
  );
}

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
