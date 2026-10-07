import {redirect, useLoaderData} from 'react-router';
import {loadDepartment} from '~/lib/department-data';
import {loadPageLayout} from '~/lib/page-builder.server';
import {DepartmentView} from '~/components/department/DepartmentView';
import {PageBlocks} from '~/components/page-builder/PageBlocks';
import {Breadcrumb} from '~/components/ui/Breadcrumb';

/**
 * Department landing page, e.g. /department/men — the page the main-menu
 * tiles open, like lifestylestores.com/in/en/department/men.
 *
 * By default it's built from store data (see ~/lib/department). If a page
 * named "department-<handle>" exists in /editor → Pages, its blocks are shown
 * instead (add a "Department" block there to keep the automatic layout).
 */

export const meta = ({data}) => {
  const title = data?.layout?.title ?? data?.department?.collection?.title;
  const c = data?.department?.collection;
  return [
    {title: `${title ?? 'Shop'} | Fashion & More Online | Lifestyle Stores`},
    {
      name: 'description',
      content:
        data?.layout?.description ||
        c?.seo?.description ||
        c?.description ||
        `Shop ${title ?? ''} online at Lifestyle: best sellers, new arrivals and top brands.`,
    },
    {rel: 'canonical', href: `/department/${data?.handle}`},
  ];
};

/** @param {import('react-router').LoaderFunctionArgs} */
export async function loader({params, context}) {
  const {handle} = params;
  const {storefront} = context;
  const layout = await loadPageLayout(storefront, `department-${handle}`);
  if (layout?.blocks.length) return {handle, layout};

  const department = await loadDepartment(storefront, handle);
  if (!department) {
    throw new Response(`Department ${handle} not found`, {status: 404});
  }
  // Nothing to show: the collection page has the "coming soon" state.
  if (department.empty) throw redirect(`/collections/${handle}`);
  return {handle, department};
}

export default function Department() {
  const {layout, department} = useLoaderData();
  if (layout) {
    return (
      <div className="pb-12">
        <div className="container-site">
          <Breadcrumb items={[{label: layout.title}]} />
          <h1 className="sr-only">{layout.title}</h1>
        </div>
        <PageBlocks blocks={layout.blocks} />
      </div>
    );
  }
  return <DepartmentView d={department} />;
}
