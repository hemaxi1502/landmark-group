import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {toRelativeUrl} from '~/lib/home-content';

/**
 * Lean, high-performance GraphQL fragments for showcase section metaobjects
 */
export const SHOWCASE_FRAGMENT = `#graphql
  fragment ShowcaseMediaImage on MediaImage {
    id
    image {
      url
      altText
      width
      height
    }
  }

  fragment ShowcaseBannerItem on Metaobject {
    id
    handle
    fields {
      key
      value
      reference {
        ...ShowcaseMediaImage
      }
    }
  }

  fragment ShowcaseCardItem on Metaobject {
    id
    handle
    fields {
      key
      value
      reference {
        ...ShowcaseMediaImage
      }
    }
  }

  fragment ShowcaseDataNode on Metaobject {
    id
    handle
    type
    fields {
      key
      value
      reference {
        ...ShowcaseBannerItem
        ...ShowcaseMediaImage
      }
      references(first: 12) {
        nodes {
          ... on Metaobject {
            ...ShowcaseCardItem
          }
        }
      }
    }
  }

  fragment ShowcaseSectionMetaobject on Metaobject {
    id
    handle
    type
    fields {
      key
      value
      reference {
        ... on Metaobject {
          id
          fields {
            key
            value
          }
        }
      }
      references(first: 10) {
        nodes {
          ... on Metaobject {
            ...ShowcaseDataNode
          }
        }
      }
    }
  }
`;

/**
 * Single unified query calling home_page metaobject once for all sections
 */
export const HOME_PAGE_SECTIONS_QUERY = `#graphql
  ${SHOWCASE_FRAGMENT}
  query HomePageSections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    homePageSections: metaobjects(type: "home_page", first: 20) {
      nodes {
        ...ShowcaseSectionMetaobject
      }
    }
  }
`;

/**
 * Multi-section query for all homepage showcase sections
 */
export const SHOWCASE_SECTIONS_QUERY = `#graphql
  ${SHOWCASE_FRAGMENT}
  query HomePageShowcaseSections($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    bestsellers: metaobject(handle: {handle: "bestseller", type: "home_page"}) {
      ...ShowcaseSectionMetaobject
    }
    topBrands: metaobject(handle: {handle: "top-brands-on-lifestyle-collections", type: "home_page"}) {
      ...ShowcaseSectionMetaobject
    }
    festiveEdit: metaobject(handle: {handle: "festive-edit", type: "home_page"}) {
      ...ShowcaseSectionMetaobject
    }
    homeLiving: metaobject(handle: {handle: "all-new-home-living-store", type: "home_page"}) {
      ...ShowcaseSectionMetaobject
    }
    babyShop: metaobject(handle: {handle: "babyshop", type: "home_page"}) {
      ...ShowcaseSectionMetaobject
    }
  }
`;

/**
 * Helper to map metaobject fields array into a key-value object
 * @param {Array<{key: string, value: string, reference?: any, references?: any}>} fields
 */
function mapMetaobjectFields(fields = []) {
  const mapped = {};
  for (const field of fields) {
    mapped[field.key] = field;
  }
  return mapped;
}

/**
 * Helper to safely extract image object from various reference structures
 * @param {any} ref
 */
function extractImageFromReference(ref) {
  if (!ref) return null;
  if (ref.image && ref.image.url) return ref.image;
  if (ref.fields) {
    const fields = mapMetaobjectFields(ref.fields);
    const fileField =
      fields.file ||
      fields.image ||
      Object.values(fields).find((f) => f?.reference?.image?.url);
    if (fileField?.reference?.image?.url) {
      return fileField.reference.image;
    }
  }
  return null;
}

/**
 * Parse showcase section data from metaobject query response
 * @param {any} sectionNode
 * @param {string} [defaultHeading]
 */
export function parseShowcaseData(sectionNode, defaultHeading = '') {
  if (!sectionNode) return null;

  let heading = defaultHeading;
  let sectionDataNode = null;

  // 1. Direct pass of data node (e.g. bestsellers_data, babyshop_data)
  if (sectionNode.type && sectionNode.type.endsWith('_data')) {
    sectionDataNode = sectionNode;
  }

  // 2. Nested inside home_page metaobject
  if (sectionNode.fields) {
    const hpFields = mapMetaobjectFields(sectionNode.fields);

    // Extract Heading
    const headingField = hpFields.heading?.reference?.fields
      ? mapMetaobjectFields(hpFields.heading.reference.fields).heading?.value
      : hpFields.heading?.value;

    if (headingField && headingField.toLowerCase() !== 'lifestyle exclusives') {
      heading = headingField;
    }

    // Extract Section Data node
    if (hpFields.section_data?.references?.nodes?.length > 0) {
      sectionDataNode = hpFields.section_data.references.nodes[0];
    }
  }

  if (!sectionDataNode || !sectionDataNode.fields) {
    return null;
  }

  const dFields = mapMetaobjectFields(sectionDataNode.fields);

  let desktopImage = null;
  let desktopAlt = heading;
  let mobileImage = null;
  let mobileAlt = heading;
  let bannerLink = dFields.link?.value || dFields.banner_link?.value || '';
  let cards = [];

  for (const [key, field] of Object.entries(dFields)) {
    // Banner detection
    if (key.includes('banner')) {
      if (key.includes('mobile')) {
        mobileImage = extractImageFromReference(field.reference) || mobileImage;
        if (field.reference?.fields) {
          const rf = mapMetaobjectFields(field.reference.fields);
          if (rf.alt?.value) mobileAlt = rf.alt.value;
        }
      } else {
        desktopImage = extractImageFromReference(field.reference) || desktopImage;
        if (field.reference?.fields) {
          const rf = mapMetaobjectFields(field.reference.fields);
          if (rf.alt?.value) desktopAlt = rf.alt.value;
          if (!bannerLink && rf.url?.value) bannerLink = rf.url.value;
        }
      }
    }

    // Cards collection detection
    if (
      (key.includes('collection') || key.includes('card') || key.includes('section')) &&
      field.references?.nodes?.length > 0
    ) {
      cards = field.references.nodes
        .map((cardNode) => {
          if (!cardNode?.fields) return null;
          const cFields = mapMetaobjectFields(cardNode.fields);
          const image =
            extractImageFromReference(cFields.image?.reference) ||
            cFields.image?.reference?.image;

          if (!image) return null;

          const sortOrderVal = cFields.sort_order?.value;
          const sortOrder =
            sortOrderVal !== undefined && sortOrderVal !== null
              ? parseInt(sortOrderVal, 10)
              : 0;

          return {
            id: cardNode.id,
            handle: cardNode.handle,
            image,
            title: cFields.title?.value || cardNode.handle || '',
            link: toRelativeUrl(cFields.link?.value || cFields.url?.value) || '',
            sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
          };
        })
        .filter(Boolean)
        .sort((a, b) => a.sortOrder - b.sortOrder);
    }
  }

  if (!desktopImage && !mobileImage && cards.length === 0) {
    return null;
  }

  return {
    handle: sectionNode.handle || sectionDataNode.handle || '',
    heading,
    banner:
      desktopImage || mobileImage
        ? {
            desktopImage,
            mobileImage: mobileImage || desktopImage,
            desktopAlt,
            mobileAlt: mobileAlt || desktopAlt,
            link: toRelativeUrl(bannerLink) || '',
          }
        : null,
    cards,
  };
}

/**
 * Reusable Showcase Section Component
 * Powers Babyshop, Bestsellers, Top Brands on LIFESTYLE, Festive Edit, and Home & Living Store
 * Supports both 'top' and 'bottom' banner placements with identical live theme styling
 * @param {{
 *   data: any,
 *   bannerPosition?: 'top' | 'bottom',
 *   defaultHeading?: string,
 *   className?: string
 * }} props
 */
export function ShowcaseSection({
  data,
  bannerPosition,
  defaultHeading = '',
  className = '',
}) {
  const sectionData = parseShowcaseData(data, defaultHeading);

  if (!sectionData) {
    return null;
  }

  // Auto-detect banner position if not explicitly supplied
  let effectivePosition = bannerPosition;
  if (!effectivePosition) {
    const handle = sectionData.handle.toLowerCase();
    const bannerUrl = sectionData.banner?.desktopImage?.url?.toLowerCase() || '';
    if (
      handle.includes('bestseller') ||
      handle.includes('top-brand') ||
      handle.includes('festive') ||
      bannerUrl.includes('promostrip')
    ) {
      effectivePosition = 'bottom';
    } else {
      effectivePosition = 'top';
    }
  }

  return (
    <ShowcaseSectionView
      sectionData={sectionData}
      bannerPosition={effectivePosition}
      className={className}
    />
  );
}

/**
 * View presentation for ShowcaseSection
 */
function ShowcaseSectionView({sectionData, bannerPosition, className}) {
  const {heading, banner, cards} = sectionData;

  // Banner component
  const bannerElement = banner && (banner.desktopImage || banner.mobileImage) && (
    <div className="relative w-full overflow-hidden rounded-2xl leading-none">
      {banner.link ? (
        <Link to={banner.link} className="block w-full h-full">
          <BannerImages banner={banner} />
        </Link>
      ) : (
        <BannerImages banner={banner} />
      )}
    </div>
  );

  // Cards carousel component
  const cardsElement = cards && cards.length > 0 && (
    <div className="relative pb-1">
      <div
        className="flex gap-3 sm:gap-4 lg:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-0.5 no-scrollbar"
        style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
      >
        {cards.map((card, index) => {
          const cardKey = card.id || `showcase-card-${index}`;
          const cardAspectRatio =
            card.image.width && card.image.height
              ? `${card.image.width} / ${card.image.height}`
              : '450 / 600';

          const cardContent = (
            <div
              className="relative w-full transition-transform duration-300 group-hover:scale-[1.02]"
              style={{aspectRatio: cardAspectRatio}}
            >
              <Image
                data={card.image}
                alt={card.title || `${heading} card ${index + 1}`}
                sizes="(min-width: 1024px) 293px, (min-width: 640px) 31vw, 42vw"
                className="w-full h-full object-contain pointer-events-none"
                loading="lazy"
              />
            </div>
          );

          return (
            <div
              key={cardKey}
              className="shrink-0 w-[calc((100%-12px)/2.3)] sm:w-[calc((100%-32px)/3)] lg:w-[calc((100%-48px)/4)] snap-start group"
            >
              {card.link ? (
                <Link to={card.link} className="block w-full h-full">
                  {cardContent}
                </Link>
              ) : (
                cardContent
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`w-full bg-white overflow-hidden ${className}`}>
      {/* 1. Universal Heading with amber accent line (.jss80 / .jss81) */}
      <section className="relative max-w-[1244px] mx-auto px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col items-start pt-4 sm:pt-0 mb-3 sm:mb-6">
          <h2 className="text-[18px] sm:text-[24px] font-bold sm:font-semibold leading-[26px] sm:leading-[32px] text-[#000000] tracking-normal">
            {heading}
          </h2>
          <span className="w-[38px] sm:w-[48px] border-b-2 sm:border-b-[3px] border-[#FAA619] mt-1 block" />
        </div>

        {/* Top Banner (when bannerPosition is 'top') */}
        {bannerPosition === 'top' && bannerElement}
      </section>

      {/* Divider 1: mobile only, shown between top banner and cards */}
      {bannerPosition === 'top' && bannerElement && (
        <div className="w-full h-2 bg-[#ECEDEB] my-4 block sm:hidden" />
      )}

      {/* 2. Category / Brand Cards Carousel */}
      <section
        className={`relative max-w-[1244px] mx-auto px-4 sm:px-6 lg:px-0 ${
          bannerPosition === 'top' && bannerElement ? 'sm:mt-6 lg:mt-8' : ''
        }`}
      >
        {cardsElement}
      </section>

      {/* Divider 2: mobile only, shown between cards and bottom banner */}
      {bannerPosition === 'bottom' && bannerElement && (
        <div className="w-full h-2 bg-[#ECEDEB] my-4 block sm:hidden" />
      )}

      {/* Bottom Banner (when bannerPosition is 'bottom') */}
      {bannerPosition === 'bottom' && bannerElement && (
        <section className="relative max-w-[1244px] mx-auto px-4 sm:px-6 lg:px-0 sm:mt-6 lg:mt-8">
          {bannerElement}
        </section>
      )}

      {/* Section Bottom Divider: mobile view only */}
      <div className="w-full h-2 bg-[#ECEDEB] mt-4 block sm:hidden" />
    </div>
  );
}

/**
 * Responsive banner image rendering for desktop and mobile
 */
function BannerImages({banner}) {
  const deskRatio =
    banner.desktopImage?.width && banner.desktopImage?.height
      ? `${banner.desktopImage.width} / ${banner.desktopImage.height}`
      : '1244 / 439';

  const mobRatio =
    banner.mobileImage?.width && banner.mobileImage?.height
      ? `${banner.mobileImage.width} / ${banner.mobileImage.height}`
      : '500 / 320';

  return (
    <div className="relative w-full overflow-hidden rounded-2xl leading-none">
      {banner.mobileImage && (
        <div
          className="w-full block sm:hidden overflow-hidden rounded-2xl"
          style={{aspectRatio: mobRatio}}
        >
          <Image
            data={banner.mobileImage}
            alt={banner.mobileAlt || banner.desktopAlt || 'Banner'}
            sizes="100vw"
            className="w-full h-full object-cover rounded-2xl pointer-events-none"
            loading="lazy"
          />
        </div>
      )}
      {banner.desktopImage && (
        <div
          className={`w-full ${
            banner.mobileImage ? 'hidden sm:block' : 'block'
          } overflow-hidden rounded-2xl`}
          style={{aspectRatio: deskRatio}}
        >
          <Image
            data={banner.desktopImage}
            alt={banner.desktopAlt || 'Banner'}
            sizes="(min-width: 1244px) 1244px, 100vw"
            className="w-full h-full object-cover rounded-2xl pointer-events-none"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
}

export default ShowcaseSection;
