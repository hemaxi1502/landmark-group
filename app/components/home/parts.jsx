import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import {IMAGE_SRCSET} from '~/lib/image';
/** Section title used by every homepage block. */
export function SectionHeading({title}) {
  if (!title) return null;
  return (
    <h2 className="mb-4 text-center text-xl font-bold tracking-tight md:mb-6 md:text-2xl">
      {title}
    </h2>
  );
}
/** Wraps children in a Link only when there is somewhere to go. */
export function MaybeLink({to, className, children, label}) {
  if (!to) return <div className={className}>{children}</div>;
  const external = /^https?:\/\//.test(to);
  return external ? (
    <a href={to} className={className} aria-label={label}>
      {children}
    </a>
  ) : (
    <Link to={to} prefetch="intent" className={className} aria-label={label}>
      {children}
    </Link>
  );
}
export function HomeImg({
  image,
  alt,
  sizes = '(min-width: 1024px) 25vw, 50vw',
  className = 'h-full w-full object-cover',
  loading = 'lazy',
}) {
  return (
    <Image
      srcSetOptions={IMAGE_SRCSET}
      data={{...image, altText: alt || image.altText}}
      sizes={sizes}
      className={className}
      loading={loading}
    />
  );
}
/**
 * Desktop banner with an optional separate mobile image.
 * Uses <picture> so the browser downloads only the image it needs.
 */
export function ResponsiveBanner({desktop, mobile, loading = 'lazy'}) {
  const main = desktop ?? mobile;
  if (!main) return null;
  return (
    <MaybeLink
      to={main.href ?? mobile?.href}
      className="block overflow-hidden rounded"
      label={main.alt}
    >
      <picture>
        {mobile && desktop && (
          <source
            media="(max-width: 767px)"
            srcSet={withWidth(mobile.image.url, 800)}
          />
        )}
        <img
          src={withWidth(main.image.url, 1600)}
          alt={main.alt}
          width={main.image.width ?? undefined}
          height={main.image.height ?? undefined}
          loading={loading}
          // Never stretch a banner past its real width (a small upload would blur).
          style={
            main.image.width ? {maxWidth: `${main.image.width}px`} : undefined
          }
          className="mx-auto h-auto w-full"
        />
      </picture>
    </MaybeLink>
  );
}
export function SectionShell({children, className = ''}) {
  return (
    <section className={`container-site py-6 md:py-10 ${className}`}>
      {children}
    </section>
  );
}
/** Ask Shopify's CDN for a resized image. */
export function withWidth(url, width) {
  return `${url}${url.includes('?') ? '&' : '?'}width=${width}`;
}
