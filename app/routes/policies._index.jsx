import {useLoaderData, Link} from 'react-router';
import {StaticPage} from '~/components/StaticPage';

export const meta = () => [{title: 'Policies | Lifestyle'}];

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  const data = await context.storefront.query(POLICIES_QUERY);

  const shopPolicies = data.shop;
  const policies = [
    shopPolicies?.privacyPolicy,
    shopPolicies?.shippingPolicy,
    shopPolicies?.termsOfService,
    shopPolicies?.refundPolicy,
    shopPolicies?.subscriptionPolicy,
  ].filter((policy) => policy != null);

  if (!policies.length) {
    throw new Response('No policies found', {status: 404});
  }

  return {policies};
}

export default function Policies() {
  /** @type {LoaderReturnData} */
  const {policies} = useLoaderData();

  return (
    <StaticPage title="Policies">
      <ul className="max-w-xl divide-y divide-gray-200 border-y border-gray-200">
        {[
          ...policies.map((p) => ({
            to: `/policies/${p.handle}`,
            title: p.title,
          })),
          {to: '/pages/terms-and-conditions', title: 'Terms & Conditions'},
          {to: '/pages/returns', title: 'Returns & Refunds'},
          {to: '/pages/shipping', title: 'Shipping & Delivery'},
        ]
          .filter(
            (x, i, all) => all.findIndex((y) => y.title === x.title) === i,
          )
          .map((x) => (
            <li key={x.to}>
              <Link
                to={x.to}
                className="flex items-center justify-between py-3 text-[15px] hover:text-[#FAA619]"
              >
                {x.title} <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
      </ul>
    </StaticPage>
  );
}

const POLICIES_QUERY = `#graphql
  fragment PolicyItem on ShopPolicy {
    id
    title
    handle
  }
  query Policies ($country: CountryCode, $language: LanguageCode)
    @inContext(country: $country, language: $language) {
    shop {
      privacyPolicy {
        ...PolicyItem
      }
      shippingPolicy {
        ...PolicyItem
      }
      termsOfService {
        ...PolicyItem
      }
      refundPolicy {
        ...PolicyItem
      }
      subscriptionPolicy {
        id
        title
        handle
      }
    }
  }
`;

/** @typedef {import('./+types/policies._index').Route} Route */
/** @typedef {import('storefrontapi.generated').PoliciesQuery} PoliciesQuery */
/** @typedef {import('storefrontapi.generated').PolicyItemFragment} PolicyItemFragment */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
