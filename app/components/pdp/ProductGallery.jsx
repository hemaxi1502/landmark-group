import {useEffect, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {Icon} from '~/components/ui/Icon';
import {Modal} from '~/components/ui/Modal';
/**
 * PDP · Product Image Gallery — thumbnails + main image, click to zoom
 * (full-screen lightbox), swipe strip on mobile. Jumps to the selected
 * variant's image when the shopper changes colour.
 */
export function ProductGallery({images, selectedImageUrl, title}) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  useEffect(() => {
    if (!selectedImageUrl) return;
    const i = images.findIndex((img) => img.url === selectedImageUrl);
    if (i >= 0) setActive(i);
  }, [selectedImageUrl, images]);
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') setActive((a) => (a + 1) % images.length);
      if (e.key === 'ArrowLeft')
        setActive((a) => (a - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom, images.length]);
  if (!images.length) {
    return <div className="aspect-[3/4] rounded bg-surface" />;
  }
  const current = images[active];
  return (
    <div className="lg:sticky lg:top-32">
      {/* Mobile: swipe strip */}
      <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto md:hidden">
        {images.map((img, i) => (
          <div key={img.id ?? img.url} className="w-full shrink-0 snap-center">
            <Image
              data={img}
              alt={img.altText || `${title} image ${i + 1}`}
              aspectRatio="3/4"
              sizes="100vw"
              loading={i === 0 ? 'eager' : 'lazy'}
              className="w-full"
            />
          </div>
        ))}
      </div>

      {/* Desktop: thumbnails + main */}
      <div className="hidden gap-3 md:flex">
        <ul className="no-scrollbar flex max-h-[640px] w-16 shrink-0 flex-col gap-2 overflow-y-auto">
          {images.map((img, i) => (
            <li key={img.id ?? img.url}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === active}
                className={`block w-full overflow-hidden rounded border-2 ${i === active ? 'border-ink' : 'border-transparent'}`}
              >
                <Image
                  data={img}
                  alt=""
                  aspectRatio="3/4"
                  sizes="64px"
                  loading="lazy"
                />
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setZoom(true)}
          className="relative flex-1 cursor-zoom-in overflow-hidden rounded bg-surface"
          aria-label="Zoom image"
        >
          <Image
            data={current}
            alt={current.altText || title}
            aspectRatio="3/4"
            sizes="(min-width: 1024px) 45vw, 60vw"
            loading="eager"
            className="w-full"
          />
        </button>
      </div>

      <Modal
        open={zoom}
        onClose={() => setZoom(false)}
        label="Image zoom"
        backdropClassName="bg-black/90"
        className="relative flex max-h-[95vh] max-w-[95vw] items-center justify-center"
      >
        <img
          src={current.url}
          alt={current.altText || title}
          className="max-h-[95vh] max-w-[95vw] object-contain"
        />
        <button
          type="button"
          onClick={() => setZoom(false)}
          className="absolute top-2 right-2 rounded-full bg-white p-2"
          aria-label="Close zoom"
        >
          <Icon name="close" />
        </button>
      </Modal>
    </div>
  );
}
