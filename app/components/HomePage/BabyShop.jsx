import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

/**
 * Lean, high-performance GraphQL fragments for BabyShop metaobjects
 * Minimizes query depth and cost to maximize SSR throughput
 */
export const BABYSHOP_FRAGMENT = `#graphql
  fragment BabyShopMediaImage on MediaImage {
    id
    image {
      url
      altText
      width
      height
    }
  }

  fragment BabyShopCardItem on Metaobject {
    id
    handle
    fields {
      key
      value
      reference {
        ...BabyShopMediaImage
      }
    }
  }

  fragment BabyShopBannerItem on Metaobject {
    id
    handle
    fields {
      key
      value
      reference {
        ...BabyShopMediaImage
      }
    }
  }

  fragment BabyShopDataNode on Metaobject {
    id
    handle
    fields {
      key
      value
      reference {
        ...BabyShopBannerItem
        ...BabyShopMediaImage
      }
      references(first: 20) {
        nodes {
          ... on Metaobject {
            ...BabyShopCardItem
          }
        }
      }
    }
  }

  fragment BabyShopMetaobject on Metaobject {
    id
    handle
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
      references(first: 2) {
        nodes {
          ... on Metaobject {
            ...BabyShopDataNode
          }
        }
      }
    }
  }
`;

/**
 * High-performance query for the BabyShop section
 */
export const BABYSHOP_QUERY = `#graphql
  ${BABYSHOP_FRAGMENT}
  query HomePageBabyShop($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    babyShopMetaobject: metaobject(handle: {handle: "babyshop", type: "home_page"}) {
      ...BabyShopMetaobject
    }
    babyShopDataMetaobjects: metaobjects(type: "babyshop_data", first: 1) {
      nodes {
        ...BabyShopDataNode
      }
    }
  }
`;

/**
 * Map metaobject fields array into a key-value object
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
 * Parse BabyShop section data from metaobject query response
 * @param {any} metaobjectData
 */
export function parseBabyShopData(metaobjectData) {
  if (!metaobjectData) return null;

  let babyShopDataNode = null;
  let sectionHeading = 'Babyshop';

  // 1. Direct babyshop_data list nodes
  if (metaobjectData.babyShopDataMetaobjects?.nodes?.length > 0) {
    babyShopDataNode = metaobjectData.babyShopDataMetaobjects.nodes[0];
  }

  // 2. Nested inside home_page metaobject with handle "babyshop"
  if (metaobjectData.babyShopMetaobject?.fields) {
    const hpFields = mapMetaobjectFields(metaobjectData.babyShopMetaobject.fields);
    if (hpFields.section_data?.references?.nodes?.length > 0) {
      babyShopDataNode = hpFields.section_data.references.nodes[0];
    }
    const headingField = hpFields.heading?.reference?.fields
      ? mapMetaobjectFields(hpFields.heading.reference.fields).heading?.value
      : hpFields.heading?.value;

    if (headingField && headingField.toLowerCase() !== 'lifestyle exclusives') {
      sectionHeading = headingField;
    }
  }

  // 3. Direct pass of metaobject node
  if (!babyShopDataNode && (metaobjectData.type === 'babyshop_data' || metaobjectData.fields)) {
    babyShopDataNode = metaobjectData;
  }

  if (!babyShopDataNode || !babyShopDataNode.fields) {
    return null;
  }

  const fields = mapMetaobjectFields(babyShopDataNode.fields);

  // Extract Desktop Banner
  const desktopBannerRef = fields.babyshop_banner?.reference;
  const desktopImage = extractImageFromReference(desktopBannerRef);
  const desktopAlt = desktopBannerRef?.fields
    ? mapMetaobjectFields(desktopBannerRef.fields).alt?.value || 'Babyshop'
    : 'Babyshop';

  // Extract Mobile Banner
  const mobileBannerRef = fields.babyshop_banner_mobile?.reference;
  const mobileImage = extractImageFromReference(mobileBannerRef) || desktopImage;
  const mobileAlt = mobileBannerRef?.fields
    ? mapMetaobjectFields(mobileBannerRef.fields).alt?.value || desktopAlt
    : desktopAlt;

  // Extract Dynamic Category Cards
  const cardsField = fields.babyshop_collection_card;
  const rawCards = cardsField?.references?.nodes || [];

  const cards = rawCards
    .map((cardNode) => {
      if (!cardNode) return null;
      const cardFields = mapMetaobjectFields(cardNode.fields || []);
      const image =
        extractImageFromReference(cardFields.image?.reference) ||
        cardFields.image?.reference?.image;

      if (!image) return null;

      const sortOrderVal = cardFields.sort_order?.value;
      const sortOrder =
        sortOrderVal !== undefined && sortOrderVal !== null
          ? parseInt(sortOrderVal, 10)
          : 0;

      const title = cardFields.title?.value || cardNode.handle || '';
      const link = cardFields.link?.value || cardFields.url?.value || '';

      return {
        id: cardNode.id,
        handle: cardNode.handle,
        image,
        sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
        title,
        link,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // If no banner and no cards, return null
  if (!desktopImage && !mobileImage && cards.length === 0) {
    return null;
  }

  return {
    heading: sectionHeading,
    banner: {
      desktopImage,
      mobileImage,
      altText: desktopAlt,
      mobileAltText: mobileAlt,
      link: fields.link?.value || fields.banner_link?.value || '',
    },
    cards,
  };
}

/**
 * Reusable BabyShop Section Component
 * Fully server-rendered with responsive layout matching the live Lifestyle Stores theme
 * @param {{data: any}} props
 */
export function BabyShop({data}) {
  const sectionData = parseBabyShopData(data);

  if (!sectionData) {
    return null;
  }

  return <BabyShopView sectionData={sectionData} />;
}

/**
 * Presentation view for the BabyShop section
 * @param {{sectionData: {heading: string, banner: any, cards: Array<any>}}} props
 */
function BabyShopView({sectionData}) {
  const {heading, banner, cards} = sectionData;

  const bannerContent = (
    <div className="relative w-full aspect-[500/320] sm:aspect-[1244/439] overflow-hidden rounded-2xl leading-none">
      {banner.mobileImage && (
        <Image
          data={banner.mobileImage}
          alt={banner.mobileAltText || banner.altText || 'Babyshop'}
          sizes="100vw"
          className="w-full h-full object-cover block sm:hidden rounded-2xl pointer-events-none"
          loading="lazy"
        />
      )}
      {banner.desktopImage && (
        <Image
          data={banner.desktopImage}
          alt={banner.altText || 'Babyshop'}
          sizes="(min-width: 1244px) 1244px, 100vw"
          className={`w-full h-full object-cover ${
            banner.mobileImage ? 'hidden sm:block' : 'block'
          } rounded-2xl pointer-events-none`}
          loading="lazy"
        />
      )}
    </div>
  );

  return (
    <div className="w-full bg-white overflow-hidden">
      <section
        id="babyshop_section_wrapper"
        className="relative max-w-[1244px] mx-auto px-4 sm:px-6 lg:px-0"
        aria-label={heading || 'Babyshop'}
      >
        {/* Section Heading matching live theme .jss80 (18px 700 bold mobile / 24px 600 semibold desktop) and .jss81 (38px mobile / 48px desktop orange underline) */}
        <div className="flex flex-col items-start pt-4 sm:pt-0 mb-3 sm:mb-6">
          <h2 className="text-[18px] sm:text-[24px] font-bold sm:font-semibold leading-[26px] sm:leading-[32px] text-[#000000] tracking-normal">
            {heading || 'Babyshop'}
          </h2>
          <span className="w-[38px] sm:w-[48px] border-b-2 sm:border-b-[3px] border-[#FAA619] mt-1 block" />
        </div>

        {/* Hero Banner */}
        {banner && (banner.desktopImage || banner.mobileImage) && (
          <div className="relative w-full overflow-hidden rounded-2xl leading-none">
            {banner.link ? (
              <Link to={banner.link} className="block w-full h-full">
                {bannerContent}
              </Link>
            ) : (
              bannerContent
            )}
          </div>
        )}
      </section>

      {/* Full-width Divider Strip 1: mobile view only */}
      <div className="w-full h-2 bg-[#ECEDEB] my-4 block sm:hidden" />

      <section className="relative max-w-[1244px] mx-auto px-4 sm:px-6 lg:px-0 sm:mt-6 lg:mt-8">
        {/* Dynamic Category Cards Carousel - 2.3 cols on mobile, 3 on tablet, 4 on desktop */}
        {cards && cards.length > 0 && (
          <div className="relative pb-1">
            <div
              className="flex gap-3 sm:gap-4 lg:gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-0.5 no-scrollbar"
              style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}
            >
              {cards.map((card, index) => {
                const cardKey = card.id || `babyshop-card-${index}`;
                const cardContent = (
                  <div className="relative w-full aspect-[450/635] transition-transform duration-300 group-hover:scale-[1.02]">
                    <Image
                      data={card.image}
                      alt={card.title || card.altText || `Babyshop category ${index + 1}`}
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
        )}
      </section>

      {/* Full-width Divider Strip 2: mobile view only */}
      <div className="w-full h-2 bg-[#ECEDEB] mt-4 block sm:hidden" />
    </div>
  );
}

export default BabyShop;
