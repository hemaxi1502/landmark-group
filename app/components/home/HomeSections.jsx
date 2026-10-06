import {Carousel} from '~/components/ui/Carousel';
import {ImageTilesGrid} from './ImageTilesGrid';
import {TabbedCategoryGrid} from './TabbedCategoryGrid';
import {BenefitsSection} from './BenefitsSection';
import {
  HomeImg,
  MaybeLink,
  ResponsiveBanner,
  SectionHeading,
  SectionShell,
} from './parts';
/**
 * Renders the homepage in the order set by `sort_order` on the `home_page`
 * metaobjects. Each section's `dataType` picks a component; anything unknown
 * falls back to "banner + tiles", so new sections added in admin still show.
 *
 *   Spec section                 → dataType                         → component
 *   (Hero Slideshow and the Showcase sections are rendered by your existing
 *    HeroSlider / ShowcaseSection components — see app/routes/_index.jsx.)
 *      Offer banner              → banners                          → ResponsiveBanner
 *   2  Brand Tiles Grid          → lifestyle_exclusives_data        → ImageTilesGrid
 *   3  Benefits Banners          → our_benefits_data                → BenefitsSection
 *   5  Collection Tiles Grid     → bestsellers_data                 → banner + ImageTilesGrid
 *   6  Brand Logo Carousel       → top_brands_on_lifestyle_data     → banner + ImageTilesGrid
 *   7/8 Collection Tiles Grid    → in_trend_data / festive_edit_data→ ImageTilesGrid
 *   9  Tabbed Category Grid      → top_categories_data              → TabbedCategoryGrid
 *   10 Large Brand Carousel      → chartbusters_data                → BrandBannerCarousel
 *   11/12 Banner + Tiles         → all_new_home_living_store_data / babyshop_data
 */
export function HomeSections({sections}) {
  return (
    <>
      {sections.map((section, i) => (
        <HomeSectionSwitch
          key={section.id}
          section={section}
          isFirst={i === 0}
        />
      ))}
    </>
  );
}
export function HomeSectionSwitch({section, isFirst}) {
  switch (section.dataType) {
    case 'banners':
      return (
        <SectionShell className="!py-4">
          <ResponsiveBanner
            desktop={section.banner}
            mobile={section.bannerMobile}
            loading={isFirst ? 'eager' : 'lazy'}
          />
        </SectionShell>
      );
    case 'lifestyle_exclusives_data':
      return (
        <SectionShell>
          <SectionHeading title={section.heading} />
          <ImageTilesGrid cards={section.cards} perRow={6} />
        </SectionShell>
      );
    case 'our_benefits_data':
      return (
        <SectionShell>
          <SectionHeading title={section.heading} />
          <BenefitsSection section={section} />
        </SectionShell>
      );
    case 'top_categories_data':
      return (
        <SectionShell>
          <SectionHeading title={section.heading} />
          <TabbedCategoryGrid cards={section.cards} />
        </SectionShell>
      );
    case 'chartbusters_data':
      return (
        <SectionShell>
          <SectionHeading title={section.heading} />
          <BrandBannerCarousel section={section} />
        </SectionShell>
      );
    case 'in_trend_data':
      return (
        <SectionShell>
          <SectionHeading title={section.heading} />
          <ImageTilesGrid cards={section.cards} perRow={4} />
        </SectionShell>
      );
    case 'top_brands_on_lifestyle_data':
      return (
        <SectionShell>
          <SectionHeading title={section.heading} />
          <div className="space-y-4">
            <ResponsiveBanner
              desktop={section.banner}
              mobile={section.bannerMobile}
            />
            <ImageTilesGrid
              cards={section.cards}
              perRow={6}
              aspect="aspect-[4/5]"
            />
          </div>
        </SectionShell>
      );
    // bestsellers, festive edit, home & living, babyshop and any future *_data type
    default:
      return (
        <SectionShell>
          <SectionHeading title={section.heading} />
          <div className="space-y-4">
            <ResponsiveBanner
              desktop={section.banner}
              mobile={section.bannerMobile}
            />
            <ImageTilesGrid
              cards={section.cards}
              perRow={section.cards.length >= 7 ? 7 : 6}
            />
          </div>
        </SectionShell>
      );
  }
}
/** Homepage · Large Brand Banner Carousel ("Chartbusters") — 2 large banners per view on desktop. */
function BrandBannerCarousel({section}) {
  const cards = section.cards.filter((c) => c.image);
  return (
    <div className="space-y-4">
      {cards.length > 0 && (
        <Carousel
          itemClassName="basis-[85%] md:basis-1/2"
          ariaLabel={section.heading}
        >
          {cards.map((card) => (
            <MaybeLink
              key={card.id}
              to={card.href}
              className="group block overflow-hidden rounded"
            >
              <HomeImg
                image={card.image}
                alt={card.alt}
                sizes="(min-width: 768px) 50vw, 85vw"
                className="h-auto w-full transition duration-300 group-hover:scale-[1.02]"
              />
            </MaybeLink>
          ))}
        </Carousel>
      )}
      <div className="md:hidden">
        <ResponsiveBanner mobile={section.bannerMobile} />
      </div>
    </div>
  );
}
