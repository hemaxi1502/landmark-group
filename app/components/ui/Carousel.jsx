import {useRef} from 'react';
import {Icon} from './Icon';
/**
 * Horizontal scroll-snap carousel with prev/next arrows on desktop and
 * native swipe on mobile. No JS slider library needed.
 *
 * `itemClassName` controls how many items show per view, e.g.
 * "basis-[45%] md:basis-1/4 lg:basis-1/6".
 */
export function Carousel({
  children,
  itemClassName = 'basis-[45%] md:basis-1/4',
  gapClassName = 'gap-3 md:gap-4',
  ariaLabel,
}) {
  const track = useRef(null);
  const scroll = (dir) => {
    const el = track.current;
    if (!el) return;
    el.scrollBy({left: dir * el.clientWidth * 0.9, behavior: 'smooth'});
  };
  return (
    <div className="group relative" role="region" aria-label={ariaLabel}>
      <div
        ref={track}
        className={`no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth ${gapClassName}`}
      >
        {children.map((child, i) => (
          <div
            key={i}
            className={`min-w-0 shrink-0 snap-start ${itemClassName}`}
          >
            {child}
          </div>
        ))}
      </div>
      <ArrowButton side="left" onClick={() => scroll(-1)} />
      <ArrowButton side="right" onClick={() => scroll(1)} />
    </div>
  );
}
function ArrowButton({side, onClick}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous' : 'Next'}
      className={`absolute top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-md transition hover:bg-white md:flex ${side === 'left' ? '-left-3' : '-right-3'}`}
    >
      <Icon name={side === 'left' ? 'chevronLeft' : 'chevronRight'} />
    </button>
  );
}
