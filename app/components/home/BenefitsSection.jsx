import {HomeImg, ResponsiveBanner} from './parts';
import {ImageTilesGrid} from './ImageTilesGrid';
/**
 * Homepage · Benefits Banners ("Our Benefits").
 * our_benefits_data → our_benefits_bar cards (heading/title/image),
 *                     our_benefits_collection_section groups (heading image + tiles),
 *                     our_benefits_banner (wide offer banner).
 */
export function BenefitsSection({section}) {
  const bar = section.lists.our_benefits_bar ?? [];
  return (
    <div className="space-y-6">
      {bar.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {bar.map((card) => (
            <div
              key={card.id}
              className="flex items-center gap-3 overflow-hidden rounded bg-surface"
            >
              {card.image && (
                <div className="w-full">
                  <HomeImg
                    image={card.image}
                    alt={card.alt || card.text.heading || ''}
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="h-auto w-full"
                  />
                </div>
              )}
              {!card.image && (card.text.heading || card.text.title) && (
                <div className="p-4">
                  <p className="font-semibold">{card.text.heading}</p>
                  <p className="text-sm text-muted">{card.text.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <ResponsiveBanner
        desktop={section.banner}
        mobile={section.bannerMobile}
      />

      {section.groups.map((group) => (
        <div key={group.id} className="space-y-3">
          {group.headingImage && (
            <HomeImg
              image={group.headingImage}
              alt=""
              sizes="100vw"
              className="mx-auto h-auto max-h-16 w-auto"
            />
          )}
          <ImageTilesGrid cards={group.cards} perRow={6} />
        </div>
      ))}
    </div>
  );
}
