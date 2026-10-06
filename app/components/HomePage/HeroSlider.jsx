import {useState, useEffect, useCallback} from 'react';
import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {toRelativeUrl} from '~/lib/home-content';

/**
 * GraphQL fragment for hero slider metaobject
 */
export const HERO_SLIDER_FRAGMENT = `#graphql
  fragment HeroSliderSlideFields on Metaobject {
    id
    handle
    type
    fields {
      key
      value
      reference {
        ... on MediaImage {
          id
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }

  fragment HeroSliderMetaobject on Metaobject {
    id
    handle
    type
    fields {
      key
      value
      reference {
        ... on MediaImage {
          id
          image {
            url
            altText
            width
            height
          }
        }
      }
      references(first: 50) {
        nodes {
          ...HeroSliderSlideFields
          ... on MediaImage {
            id
            image {
              url
              altText
              width
              height
            }
          }
        }
      }
    }
  }
`;

/**
 * Map metaobject fields into key-value object
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
 * Extract slide data from metaobject node
 * @param {any} node
 */
function extractSlideData(node) {
  if (!node) return null;

  // Image node reference
  if (node.image && node.image.url) {
    return {
      id: node.id,
      image: node.image,
      desktopImage: node.image,
      mobileImage: node.image,
      title: node.image.altText || '',
      subtitle: '',
      buttonText: '',
      buttonLink: '',
      sortOrder: 0,
    };
  }

  // Nested metaobject fields
  if (node.fields) {
    const fieldMap = mapMetaobjectFields(node.fields);

    // Field lookup helper
    const getField = (...keys) => {
      for (const k of keys) {
        if (fieldMap[k]) return fieldMap[k];
        const lower = k.toLowerCase().replace(/[-_\s]/g, '');
        const match = Object.keys(fieldMap).find(
          (fk) => fk.toLowerCase().replace(/[-_\s]/g, '') === lower,
        );
        if (match) return fieldMap[match];
      }
      return null;
    };

    // Desktop and mobile image fields
    const desktopImageField =
      getField('desktop_image', 'desktopImage', 'desktop_banner', 'banner', 'image', 'slide_image') ||
      Object.values(fieldMap).find(
        (f) => f.reference && (f.reference.image || f.reference.__typename === 'MediaImage'),
      );

    const mobileImageField =
      getField('mobile_image', 'mobileImage', 'image_mobile', 'mobile_banner', 'mobile');

    const desktopImage = desktopImageField?.reference?.image || null;
    const mobileImage = mobileImageField?.reference?.image || null;
    const image = desktopImage || mobileImage;

    // Alt text, link, and sort order
    const altTextField = getField('alt_text', 'altText');
    const altText =
      altTextField?.value ||
      desktopImage?.altText ||
      mobileImage?.altText ||
      '';

    const buttonLink =
      toRelativeUrl(getField('url', 'link', 'button_link')?.value) || '';

    const sortOrderVal = getField('sort_order', 'sortOrder', 'order')?.value;
    const sortOrder =
      sortOrderVal !== undefined && sortOrderVal !== null
        ? parseInt(sortOrderVal, 10)
        : 0;

    return {
      id: node.id,
      image,
      desktopImage,
      mobileImage,
      altText,
      buttonLink,
      sortOrder: isNaN(sortOrder) ? 0 : sortOrder,
    };
  }

  return null;
}

/**
 * Parse hero slider metaobject data
 * @param {any} metaobjectData
 */
export function parseHeroSliderData(metaobjectData) {
  if (!metaobjectData) return null;

  let heroSliderEntry = null;

  // Direct node pass
  if (metaobjectData.handle === 'hero-slider' || (metaobjectData.fields && !metaobjectData.heroSliderMetaobject && !metaobjectData.homePageMetaobjects && !metaobjectData.homePageSections)) {
    heroSliderEntry = metaobjectData;
  }

  // Lookup by handle
  if (!heroSliderEntry && metaobjectData.heroSliderMetaobject) {
    heroSliderEntry = metaobjectData.heroSliderMetaobject;
  }

  // Lookup by list query (homePageSections or homePageMetaobjects)
  const listNodes = metaobjectData.homePageSections?.nodes || metaobjectData.homePageMetaobjects?.nodes;
  if (!heroSliderEntry && listNodes) {
    heroSliderEntry =
      listNodes.find(
        (node) =>
          node.handle === 'hero-slider' ||
          node.handle === 'hero_slider' ||
          node.fields?.some(
            (f) =>
              (f.key === 'display_name' || f.key === 'name' || f.key === 'title') &&
              f.value?.toLowerCase() === 'hero slider',
          ) ||
          node.fields?.some(
            (f) => f.value && f.value.toLowerCase() === 'hero slider',
          ),
      ) || null;
  }

  if (!heroSliderEntry || !heroSliderEntry.fields) {
    return null;
  }

  const fields = mapMetaobjectFields(heroSliderEntry.fields);
  const sectionHeading = fields.heading?.value || '';

  // Extract slide references
  const sectionDataField =
    fields.section_data ||
    fields.sectionData ||
    Object.values(fields).find((f) => f.references?.nodes?.length > 0);

  const rawSlides = sectionDataField?.references?.nodes || [];
  const slides = rawSlides
    .map(extractSlideData)
    .filter((slide) => slide && (slide.desktopImage || slide.mobileImage || slide.image))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Return null if no dynamic slides exist
  if (slides.length === 0) {
    return null;
  }

  return {
    heading: sectionHeading,
    slides,
  };
}

/**
 * Hero slider section component
 * @param {{data: any}} props
 */
export function HeroSlider({data}) {
  const sliderData = parseHeroSliderData(data);

  // Return null if no dynamic slides
  if (!sliderData || !sliderData.slides || sliderData.slides.length === 0) {
    return null;
  }

  return <HeroSliderView sliderData={sliderData} />;
}

/**
 * Hero slider view component
 * @param {{sliderData: {heading: string, slides: Array<any>}}} props
 */
function HeroSliderView({sliderData}) {
  const {slides} = sliderData;
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  // Next slide
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Previous slide
  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Auto-play with pause on hover
  useEffect(() => {
    if (isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide, slides.length]);

  // Touch swipe handlers
  const handleTouchStart = (e) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return;
    const distance = touchStartX - touchEndX;
    if (distance > 50) {
      nextSlide();
    } else if (distance < -50) {
      prevSlide();
    }
  };

  return (
    <div
      id="hero_banner_wrapper"
      className="w-full bg-white pt-0 sm:pt-4 lg:pt-[20px] pb-0 overflow-hidden 2xl:overflow-visible"
    >
      <section
        className="relative max-w-[1232px] mx-auto px-0"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        aria-label="Hero Slider"
      >
        {/* Responsive slide track */}
        <div className="relative w-full overflow-hidden rounded-none sm:rounded-[2px] aspect-[4/5] sm:aspect-[1232/585] bg-neutral-100">
          <div
            className="flex w-full h-full transition-transform duration-500 ease-in-out"
            style={{transform: `translateX(-${currentSlide * 100}%)`}}
          >
            {slides.map((slide, index) => {
              const slideKey = slide.id || `hero-slide-${index}`;
              const slideContent = (
                <div className="relative w-full h-full">
                  {/* Responsive images */}
                  {slide.mobileImage ? (
                    <>
                      {/* Mobile image */}
                      <Image
                        data={slide.mobileImage}
                        alt={slide.altText}
                        sizes="100vw"
                        className="w-full h-full object-cover object-top block sm:hidden pointer-events-none"
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                      {/* Desktop image */}
                      <Image
                        data={slide.desktopImage || slide.image}
                        alt={slide.altText}
                        sizes="(min-width: 1232px) 1232px, 100vw"
                        className="w-full h-full object-cover object-center hidden sm:block pointer-events-none"
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    </>
                  ) : (
                    slide.image && (
                      <Image
                        data={slide.image}
                        alt={slide.altText}
                        sizes="(min-width: 1232px) 1232px, 100vw"
                        className="w-full h-full object-cover object-center pointer-events-none"
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    )
                  )}
                </div>
              );

              return (
                <div
                  key={slideKey}
                  className="w-full h-full shrink-0 grow-0 basis-full relative"
                  aria-hidden={index !== currentSlide}
                >
                  {slide.buttonLink ? (
                    <Link
                      to={slide.buttonLink}
                      className="block w-full h-full"
                    >
                      {slideContent}
                    </Link>
                  ) : (
                    slideContent
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation arrows */}
        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Previous slide"
              className="hidden sm:flex absolute left-2 sm:left-3 2xl:-left-6 top-[48%] -translate-y-1/2 z-20 items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#212121] shadow-[0px_1px_1px_rgba(0,0,0,0.15),0px_2px_10px_rgba(0,0,0,0.08)] cursor-pointer"
            >
              <svg
                className="w-5 h-5 text-[#212121]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.4}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Next slide"
              className="hidden sm:flex absolute right-2 sm:right-3 2xl:-right-6 top-[48%] -translate-y-1/2 z-20 items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white text-[#212121] shadow-[0px_1px_1px_rgba(0,0,0,0.15),0px_2px_10px_rgba(0,0,0,0.08)] cursor-pointer"
            >
              <svg
                className="w-5 h-5 text-[#212121]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.4}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>

            {/* Pagination dots */}
            <div className="pt-2 sm:pt-3 pb-1 flex justify-center items-center gap-1">
              {slides.map((slide, index) => {
                const dotKey = slide.id ? `dot-${slide.id}` : `dot-slide-${index}`;
                const isActive = index === currentSlide;
                return (
                  <button
                    key={dotKey}
                    type="button"
                    onClick={() => setCurrentSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                    className={`transition-all duration-500 ease-in-out rounded-[30px] ${
                      isActive
                        ? 'w-4 h-1 bg-[#FAA619]'
                        : 'w-1 h-1 bg-[#C8C9C6] hover:bg-neutral-500'
                    }`}
                  />
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
}
