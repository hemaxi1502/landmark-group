import {Link} from 'react-router';
/** Breadcrumb trail with schema.org BreadcrumbList markup for SEO. */
export function Breadcrumb({items}) {
  const all = [{label: 'Home', to: '/'}, ...items];
  return (
    <nav aria-label="Breadcrumb" className="py-3 text-xs text-muted">
      <ol
        className="flex flex-wrap items-center gap-1"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {all.map((crumb, i) => {
          const last = i === all.length - 1;
          return (
            <li
              key={`${crumb.label}-${i}`}
              className="flex items-center gap-1"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {crumb.to && !last ? (
                <Link to={crumb.to} itemProp="item" className="hover:text-ink">
                  <span itemProp="name">{crumb.label}</span>
                </Link>
              ) : (
                <span itemProp="name" className={last ? 'text-ink' : undefined}>
                  {crumb.label}
                </span>
              )}
              <meta itemProp="position" content={String(i + 1)} />
              {!last && <span aria-hidden="true">›</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
