import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router';

/**
 * Announcement bar component
 * Renders dynamic metaobject announcements with auto-rotation
 * @param {{ announcement?: any, announcements?: any }} props
 */
export function AnnouncementBar({ announcement, announcements }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Extract text and link from a metaobject item
  const parseItem = (item, index) => {
    if (!item) return null;
    let text = '';
    let link = '';

    if (item.fields && Array.isArray(item.fields)) {
      // Find title or text field
      const textField = item.fields.find(
        (f) =>
          f.key === 'text' ||
          f.key === 'title' ||
          f.key === 'heading' ||
          f.key === 'announcement_text' ||
          f.key === 'message' ||
          f.key === 'content' ||
          f.key === 'promo_text' ||
          f.key === 'display_name' ||
          f.key === 'name',
      );
      if (textField?.value) {
        text = textField.value;
      }

      // Fallback to first non-empty text field if primary key is missing
      if (!text) {
        const anyField = item.fields.find(
          (f) =>
            f.value &&
            typeof f.value === 'string' &&
            f.value.trim().length > 2 &&
            !f.value.startsWith('http://') &&
            !f.value.startsWith('https://') &&
            !f.value.startsWith('/'),
        );
        if (anyField?.value) text = anyField.value;
      }

      // Check URL field
      const urlField = item.fields.find(
        (f) =>
          (f.key === 'url' ||
            f.key === 'link' ||
            f.key === 'cta_link' ||
            f.key === 'button_link' ||
            f.key === 'target') &&
          f.value &&
          typeof f.value === 'string' &&
          f.value.trim().length > 0,
      );
      if (urlField?.value) {
        link = urlField.value.trim();
      }

      // Check collection reference
      if (!link) {
        const collectionField = item.fields.find(
          (f) =>
            (f.key === 'collection' || f.reference?.__typename === 'Collection') &&
            f.reference?.handle,
        );
        if (collectionField?.reference?.handle) {
          link = `/collections/${collectionField.reference.handle}`;
        }
      }

      // Check product or page reference
      if (!link) {
        const refField = item.fields.find((f) => f.reference?.handle);
        if (refField?.reference?.handle) {
          const type = refField.reference.__typename?.toLowerCase();
          if (type === 'collection' || refField.key === 'collection') {
            link = `/collections/${refField.reference.handle}`;
          } else if (type === 'product' || refField.key === 'product') {
            link = `/products/${refField.reference.handle}`;
          } else if (type === 'page' || refField.key === 'page') {
            link = `/pages/${refField.reference.handle}`;
          }
        }
      }

      // Check raw path or link string
      if (!link) {
        const genericUrl = item.fields.find(
          (f) =>
            f.value &&
            typeof f.value === 'string' &&
            (f.value.startsWith('/') ||
              f.value.startsWith('http://') ||
              f.value.startsWith('https://')),
        );
        if (genericUrl?.value) link = genericUrl.value.trim();
      }
    } else if (typeof item === 'string') {
      text = item;
    }

    if (!text) return null;

    return {
      id: item.id || item.handle || `announcement-${index}-${text}`,
      text: text.trim(),
      link: link.trim(),
    };
  };

  // Parse items from props without static fallback
  const items = useMemo(() => {
    const rawList = [];
    if (Array.isArray(announcements) && announcements.length > 0) {
      rawList.push(...announcements);
    } else if (announcements?.nodes && Array.isArray(announcements.nodes)) {
      rawList.push(...announcements.nodes);
    }

    if (rawList.length === 0 && announcement) {
      if (Array.isArray(announcement)) {
        rawList.push(...announcement);
      } else if (announcement.nodes && Array.isArray(announcement.nodes)) {
        rawList.push(...announcement.nodes);
      } else {
        rawList.push(announcement);
      }
    }

    const parsedItems = [];
    const seenTexts = new Set();

    rawList.forEach((it, idx) => {
      const parsed = parseItem(it, idx);
      if (parsed && !seenTexts.has(parsed.text)) {
        seenTexts.add(parsed.text);
        parsedItems.push(parsed);
      }
    });

    return parsedItems;
  }, [announcements, announcement]);

  // Rotate announcements every 7 seconds
  useEffect(() => {
    if (items.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 7000);

    return () => clearInterval(timer);
  }, [items.length, isPaused]);

  // Keep index within bounds
  const activeIndex = currentIndex >= items.length ? 0 : currentIndex;

  // Advance to next announcement on click
  const handleNext = () => {
    if (items.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }
  };

  // Render nothing if no announcement data exists
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Announcement Banner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="w-full h-[42.88px] mb-[8px] relative z-30 overflow-hidden cursor-pointer select-none bg-[#f89f17] bg-[repeating-linear-gradient(-70deg,#faa619_0px,#faa619_9px,#f89f17_9px,#f89f17_16.9145px)] animate-[stripes_0.75s_linear_infinite] hover:opacity-95 transition-opacity flex items-center justify-center"
    >
      <div className="relative w-full h-full flex items-center justify-center">
        {items.map((item, index) => {
          const isActive = index === activeIndex;

          const content = (
            <div className="w-full h-full px-4 flex items-center justify-between sm:justify-center sm:gap-1.5">
              <div className="flex-1 sm:flex-initial text-left sm:text-center min-w-0 pr-2 sm:pr-0">
                <h2
                  id="promo_strip_heading"
                  className="text-[#FFFFFF] text-[11px] sm:text-[14px] md:text-[16px] font-semibold tracking-normal leading-[15px] sm:leading-[22.88px] font-['Figtree-Semibold','Figtree','Helvetica_Neue',Arial,sans-serif] text-left sm:text-center"
                >
                  {item.text}
                </h2>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFFFFF] shrink-0 ml-auto sm:ml-0"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          );

          return (
            <div
              key={item.id}
              className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
                isActive
                  ? 'opacity-100 translate-y-0 pointer-events-auto'
                  : 'opacity-0 translate-y-2 pointer-events-none'
              }`}
            >
              {item.link ? (
                item.link.startsWith('http://') || item.link.startsWith('https://') ? (
                  <a
                    href={item.link}
                    className="w-full h-full flex items-center justify-center"
                  >
                    {content}
                  </a>
                ) : (
                  <Link to={item.link} className="w-full h-full flex items-center justify-center">
                    {content}
                  </Link>
                )
              ) : (
                <div onClick={handleNext} className="w-full h-full flex items-center justify-center">
                  {content}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
