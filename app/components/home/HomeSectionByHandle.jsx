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
export const EXISTING_SECTIONS = {
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
 * Loads the data every homepage section needs, so any of them can be shown
 * by handle — on the homepage or as a "Homepage section" page-builder block.
 * `includeHidden` lets a page reuse a section that is hidden on the homepage.
 */
export async function loadHomeRenderData(storefront, {includeHidden} = {}) {
  const [homePageData, extra] = await Promise.all([
    storefront
      .query(HOME_PAGE_SECTIONS_QUERY, {cache: storefront.CacheShort()})
      .catch((error) => {
        console.error('Failed to query Home Page metaobjects:', error);
        return null;
      }),
    loadHomeSections(storefront, {
      skipHandles: Object.keys(EXISTING_SECTIONS),
      includeHidden,
    }).catch((error) => {
      console.error('Failed to load additional homepage sections:', error);
      return {order: [], sections: []};
    }),
  ]);
  const existing = {};
  for (const node of homePageData?.homePageSections?.nodes ?? []) {
    if (node?.handle) existing[node.handle] = node;
  }
  const extraByHandle = {};
  for (const section of extra.sections) extraByHandle[section.handle] = section;
  return {existing, extra: extraByHandle, order: extra.order};
}

/** One homepage section, by its home_page handle. */
export function HomeSectionByHandle({handle, data, isFirst = false}) {
  const existing = EXISTING_SECTIONS[handle];
  if (existing?.component === 'hero') {
    return data.existing[handle] ? (
      <HeroSlider data={{heroSliderMetaobject: data.existing[handle]}} />
    ) : null;
  }
  if (existing?.component === 'showcase') {
    return data.existing[handle] ? (
      <ShowcaseSection
        data={data.existing[handle]}
        bannerPosition={existing.bannerPosition}
      />
    ) : null;
  }
  const section = data.extra[handle];
  return section ? (
    <HomeSectionSwitch section={section} isFirst={isFirst} />
  ) : null;
}
