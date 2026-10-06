import {useLoaderData} from 'react-router';
import {getPaginationVariables} from '@shopify/hydrogen';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {ProductCard} from '~/components/plp/ProductCard';
import {Breadcrumb} from '~/components/ui/Breadcrumb';
import {PRODUCT_CARD_FRAGMENT} from '~/lib/product-card';
export const meta = () => {
  return [{title: 'All Products | Lifestyle Stores'}];
};
export async function loader({context, request}) {
  const paginationVariables = getPaginationVariables(request, {pageBy: 24});
  const {products} = await context.storefront.query(CATALOG_QUERY, {
    variables: paginationVariables,
  });
  return {products};
}
export default function AllProducts() {
  const {products} = useLoaderData();
  return (
    <div className="container-site">
      <Breadcrumb items={[{label: 'All Products'}]} />
      <h1 className="mb-6 text-xl font-bold md:text-2xl">All Products</h1>
      <PaginatedResourceSection
        connection={products}
        resourcesClassName="grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4"
      >
        {({node: product, index}) => (
          <ProductCard
            key={product.id}
            product={product}
            loading={index < 8 ? 'eager' : 'lazy'}
          />
        )}
      </PaginatedResourceSection>
    </div>
  );
}
const CATALOG_QUERY = `#graphql
  ${PRODUCT_CARD_FRAGMENT}
  query Catalog(
    $country: CountryCode
    $language: LanguageCode
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $first, last: $last, before: $startCursor, after: $endCursor) {
      nodes {
        ...ProductCard
      }
      pageInfo {
        hasPreviousPage
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;
