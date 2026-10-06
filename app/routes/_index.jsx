import {useLoaderData} from 'react-router';
import {MockShopNotice} from '~/components/MockShopNotice';
import {HeroSlider} from '~/components/HomePage/HeroSlider';
import {
  ShowcaseSection,
  HOME_PAGE_SECTIONS_QUERY,
} from '~/components/HomePage/ShowcaseSection';
import {loadHomeSections} from '~/lib/home-content';
import {HomeSectionSwitch} from '~/components/home/HomeSections';

/**
 * Sections rendered by the existing HeroSlider / ShowcaseSection components.
 * Everything else (home-page-banner, lifestyle-exclusives, our-benefits,
 * in-trend, top-categories, chartbusters and any new home_page entry) is
 * rendered by HomeSectionSwitch.
 */
const EXISTING_SECTIONS = {
  'hero-slider': {component: 'hero'},
  bestseller: {component: 'showcase', bannerPosition: 'bottom'},
  'top-brands-on-lifestyle-collections': {
    component: 'showcase',
    bannerPosition: 'bottom',
  },
  'festive-edit': {component: 'showcase', bannerPosition: 'bottom'},
  'all-new-home-living-store': {component: 'showcase', bannerPosition: 'top'},
  babyshop: {component: 'showcase', bannerPosition: 'top'},
};

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
  const {storefront} = context;

  const [homePageData, extra] = await Promise.all([
    // Existing unified query for HeroSlider + ShowcaseSection
    storefront
      .query(HOME_PAGE_SECTIONS_QUERY, {cache: storefront.CacheShort()})
      .catch((error) => {
        console.error('Failed to query Home Page metaobjects:', error);
        return null;
      }),
    // Remaining sections, fetched per section to stay under Shopify's query-complexity limit
    loadHomeSections(storefront, {
      skipHandles: Object.keys(EXISTING_SECTIONS),
    }).catch((error) => {
      console.error('Failed to load additional homepage sections:', error);
      return {order: [], sections: []};
    }),
  ]);

  return {
    isShopLinked: Boolean(context.env.PUBLIC_STORE_DOMAIN),
    homePageData,
    extra,
  };
}

/**
 * Renders every home_page section in its admin `sort_order`.
 */
export default function Homepage() {
  /** @type {LoaderReturnData} */
  const data = useLoaderData();
  const nodes = data.homePageData?.homePageSections?.nodes || [];

  const existingByHandle = {};
  for (const node of nodes) {
    if (node?.handle) existingByHandle[node.handle] = node;
  }
  const extraByHandle = {};
  for (const section of data.extra.sections)
    extraByHandle[section.handle] = section;

  // Order from the light section list; fall back to the existing order if it failed.
  const order = data.extra.order.length
    ? data.extra.order.map((o) => o.handle)
    : Object.keys(EXISTING_SECTIONS);

  return (
    <div className="flex w-full flex-col gap-8 pb-12">
      {data.isShopLinked ? null : <MockShopNotice />}
      {order.map((handle, i) => {
        const existing = EXISTING_SECTIONS[handle];
        if (existing?.component === 'hero') {
          return (
            <HeroSlider
              key={handle}
              data={{heroSliderMetaobject: existingByHandle[handle]}}
            />
          );
        }
        if (existing?.component === 'showcase') {
          return (
            <ShowcaseSection
              key={handle}
              data={existingByHandle[handle]}
              bannerPosition={existing.bannerPosition}
            />
          );
        }
        const section = extraByHandle[handle];
        return section ? (
          <HomeSectionSwitch key={handle} section={section} isFirst={i === 0} />
        ) : null;
      })}
    </div>
  );
}

/** @typedef {import('./+types/_index').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
