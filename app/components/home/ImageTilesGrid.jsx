import {Carousel} from '~/components/ui/Carousel';
import {HomeImg, MaybeLink} from './parts';
/**
 * Reusable Image Tiles section — powers Lifestyle Exclusives, Bestsellers,
 * In Trend, Festive Edit, Top Brands, Home & Living and Babyshop tiles.
 *
 * layout="carousel" → swipeable row (mobile-first, used when tiles > columns)
 * layout="grid"     → fixed grid
 */
export function ImageTilesGrid({
  cards,
  layout = 'carousel',
  perRow = 6,
  aspect = 'aspect-[3/4]',
}) {
  const withImage = cards.filter((c) => c.image);
  if (!withImage.length) return null;
  const tiles = withImage.map((card) => (
    <Tile key={card.id} card={card} aspect={aspect} />
  ));
  if (layout === 'grid') {
    const cols = {
      3: 'grid-cols-2 md:grid-cols-3',
      4: 'grid-cols-2 md:grid-cols-4',
      6: 'grid-cols-3 md:grid-cols-6',
      7: 'grid-cols-3 md:grid-cols-4 lg:grid-cols-7',
      8: 'grid-cols-4 md:grid-cols-8',
    }[perRow];
    return <div className={`grid gap-3 md:gap-4 ${cols}`}>{tiles}</div>;
  }
  const basis = {
    3: 'basis-[70%] md:basis-1/3',
    4: 'basis-[45%] md:basis-1/4',
    6: 'basis-[40%] md:basis-1/4 lg:basis-1/6',
    7: 'basis-[40%] md:basis-1/5 lg:basis-1/7',
    8: 'basis-[30%] md:basis-1/6 lg:basis-1/8',
  }[perRow];
  return <Carousel itemClassName={basis}>{tiles}</Carousel>;
}
function Tile({card, aspect}) {
  const caption = card.text.name ?? card.text.title;
  const fromPrice = card.text.from_price;
  return (
    <MaybeLink
      to={card.href}
      className="group block"
      label={card.alt || caption}
    >
      <div className={`overflow-hidden rounded bg-surface ${aspect}`}>
        <HomeImg
          image={card.image}
          alt={card.alt || caption || ''}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      {(caption || fromPrice) && (
        <div className="mt-2 text-center text-sm">
          {caption && <p className="font-medium">{caption}</p>}
          {fromPrice && <p className="text-muted">From ₹{fromPrice}</p>}
        </div>
      )}
    </MaybeLink>
  );
}
