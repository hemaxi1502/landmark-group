import {Link} from 'react-router';
import {ProductCard} from '~/components/plp/ProductCard';
import {ResponsiveBanner} from '~/components/home/parts';
import {HomeSectionByHandle} from '~/components/home/HomeSectionByHandle';
import {
  DepartmentView,
  ImageTile,
  ProductRow,
  Section,
} from '~/components/department/DepartmentView';
import {normalizeLink} from '~/lib/page-builder';

/**
 * Renders page-builder blocks (see ~/lib/page-builder BLOCK_TYPES) with the
 * same components the homepage and department pages use.
 */
export function PageBlocks({blocks}) {
  return (
    <>
      {blocks.map((block, i) => (
        <Block key={block.id} block={block} first={i === 0} />
      ))}
    </>
  );
}

function Block({block, first}) {
  switch (block.kind) {
    case 'banner':
      if (block.video) {
        return (
          <div className="container-site mt-6 first:mt-0 md:mt-10">
            <VideoBanner block={block} />
          </div>
        );
      }
      return (
        <div className="container-site mt-6 first:mt-0 md:mt-10">
          <ResponsiveBanner
            desktop={
              block.image && {
                image: block.image,
                alt: block.heading || block.image.altText || '',
                href: normalizeLink(block.link) || undefined,
              }
            }
            mobile={
              block.mobileImage && {
                image: block.mobileImage,
                alt: block.heading || '',
                href: normalizeLink(block.link) || undefined,
              }
            }
            loading={first ? 'eager' : 'lazy'}
          />
        </div>
      );

    case 'product_carousel':
      return (
        <div className="container-site">
          <ProductRow
            title={block.heading || block.collection.title}
            products={block.products}
            viewAll={`/collections/${block.collection.handle}`}
          />
        </div>
      );

    case 'product_grid':
      return (
        <div className="container-site">
          <Section title={block.heading || block.collection.title}>
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
              {block.products.map((p) => (
                <ProductCard key={p.id} product={p} loading="lazy" />
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                to={`/collections/${block.collection.handle}`}
                prefetch="intent"
                className="inline-flex h-11 items-center rounded-[2px] border border-black px-6 text-[14px] font-semibold hover:bg-black hover:text-white"
              >
                View all
              </Link>
            </div>
          </Section>
        </div>
      );

    case 'category_tiles':
      return (
        <div className="container-site">
          <Section title={block.heading || 'Shop by category'}>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 md:gap-4">
              {block.collections.map((c) => (
                <ImageTile
                  key={c.handle}
                  to={`/collections/${c.handle}`}
                  image={c.image}
                  title={c.title}
                />
              ))}
            </div>
          </Section>
        </div>
      );

    case 'brand_tiles':
      return (
        <div className="container-site">
          <Section title={block.heading || 'Shop by brand'}>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 md:gap-4">
              {block.items.map((b) => (
                <ImageTile
                  key={b.id}
                  to={b.to}
                  image={b.image}
                  title={b.title}
                  sub={`${b.count} ${b.count === 1 ? 'style' : 'styles'}`}
                  square
                />
              ))}
            </div>
          </Section>
        </div>
      );

    case 'price_bands':
      return (
        <div className="container-site">
          <Section title={block.heading || 'Shop by price'}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {block.items.map((b) => (
                <Link
                  key={b.max}
                  to={b.to}
                  prefetch="intent"
                  className="group flex flex-col items-center justify-center rounded-[2px] bg-[#FFF4E0] px-3 py-6 text-center transition-colors hover:bg-[#FAA619]"
                >
                  <span className="text-[12px] font-semibold uppercase tracking-wide text-[#8A5A00] group-hover:text-white">
                    Under
                  </span>
                  <span className="text-[24px] font-bold text-black group-hover:text-white">
                    ₹{b.max.toLocaleString('en-IN')}
                  </span>
                </Link>
              ))}
            </div>
          </Section>
        </div>
      );

    case 'text': {
      const link = normalizeLink(block.link);
      return (
        <div className="container-site">
          <section className="mx-auto mt-10 max-w-3xl text-center md:mt-14">
            {block.heading && (
              <h2 className="text-[22px] font-bold md:text-[28px]">
                {block.heading}
              </h2>
            )}
            {block.text && (
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-gray-600">
                {block.text}
              </p>
            )}
            {link && (
              <a
                href={link}
                className="mt-5 inline-flex h-11 items-center rounded-[2px] bg-black px-6 text-[14px] font-semibold uppercase text-white hover:opacity-90"
              >
                Shop now
              </a>
            )}
          </section>
        </div>
      );
    }

    case 'home_section':
      return (
        <div className="mt-6 md:mt-10">
          <HomeSectionByHandle
            handle={block.homeSection}
            data={block.home}
            isFirst={first}
          />
        </div>
      );

    case 'department':
      return (
        <div className="mt-2">
          <DepartmentView d={block.department} breadcrumb={false} />
        </div>
      );

    default:
      return null;
  }
}

/** Autoplaying, muted, looping hero video; the image is its poster. */
function VideoBanner({block}) {
  const link = normalizeLink(block.link);
  const poster = block.image?.url ?? block.video.poster ?? undefined;
  const video = (
    <video
      className="block h-auto w-full rounded"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-label={block.heading || undefined}
    >
      {block.video.sources.map((s) => (
        <source key={s.url} src={s.url} type={s.mimeType} />
      ))}
    </video>
  );
  if (!link) return video;
  return /^https?:\/\//.test(link) ? (
    <a href={link} aria-label={block.heading || 'Open'}>
      {video}
    </a>
  ) : (
    <Link to={link} prefetch="intent" aria-label={block.heading || 'Open'}>
      {video}
    </Link>
  );
}
