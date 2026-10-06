import {useMemo, useState} from 'react';
import {HomeImg, MaybeLink} from './parts';
/**
 * Homepage · Tabbed Category Grid ("Top Categories").
 * Cards are `top_categories_sub_categories` metaobjects; the `category` text
 * field decides which tab each card sits under (Women / Men / Kids …).
 * Tab order follows the first appearance of each category.
 */
export function TabbedCategoryGrid({cards}) {
  const tabs = useMemo(() => {
    const map = new Map();
    for (const card of cards) {
      const tab = card.text.category ?? 'All';
      map.set(tab, [...(map.get(tab) ?? []), card]);
    }
    return [...map.entries()];
  }, [cards]);
  const [active, setActive] = useState(0);
  if (!tabs.length) return null;
  const [, current] = tabs[Math.min(active, tabs.length - 1)];
  return (
    <div>
      <div
        role="tablist"
        aria-label="Top categories"
        className="no-scrollbar mb-5 flex justify-start gap-2 overflow-x-auto md:justify-center"
      >
        {tabs.map(([name], i) => (
          <button
            key={name}
            type="button"
            role="tab"
            id={`topcat-tab-${i}`}
            aria-selected={i === active}
            aria-controls={`topcat-panel-${i}`}
            onClick={() => setActive(i)}
            className={`shrink-0 rounded-full border px-5 py-1.5 text-sm transition ${
              i === active
                ? 'border-ink bg-ink text-white'
                : 'border-line hover:border-ink'
            }`}
          >
            {name}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`topcat-panel-${active}`}
        aria-labelledby={`topcat-tab-${active}`}
        className="grid grid-cols-4 gap-3 md:grid-cols-8 md:gap-4"
      >
        {current.map((card) => (
          <MaybeLink
            key={card.id}
            to={card.href}
            className="group block text-center"
          >
            <div className="aspect-square overflow-hidden rounded-full bg-surface">
              {card.image && (
                <HomeImg
                  image={card.image}
                  alt={card.alt || card.text.name || ''}
                  sizes="(min-width: 768px) 12vw, 25vw"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              )}
            </div>
            <p className="mt-2 text-xs font-medium md:text-sm">
              {card.text.name}
            </p>
          </MaybeLink>
        ))}
      </div>
    </div>
  );
}
