import {data, redirect} from 'react-router';

/**
 * Footer "Subscribe" form. Creates a Shopify customer with email marketing
 * consent (acceptsMarketing), so sign-ups appear in Admin → Customers with
 * "Subscribed" status and can be targeted by Shopify Email.
 */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function loader() {
  return redirect('/');
}

/** @param {import('react-router').ActionFunctionArgs} */
export async function action({request, context}) {
  const form = await request.formData();
  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase();
  if (!EMAIL.test(email) || email.length > 254) {
    return data(
      {ok: false, message: 'Please enter a valid email address.'},
      {status: 400},
    );
  }

  try {
    const {customerCreate} = await context.storefront.mutate(
      NEWSLETTER_MUTATION,
      {
        variables: {
          input: {
            email,
            acceptsMarketing: true,
            // Required by the API; the subscriber never uses it.
            password: `${crypto.randomUUID()}Aa1!`,
          },
        },
      },
    );
    const err = customerCreate?.customerUserErrors?.[0];
    if (!err) {
      return {ok: true, message: "Thanks! You're subscribed."};
    }
    if (err.code === 'TAKEN') {
      return {ok: true, message: "You're already on our list. Thank you!"};
    }
    return data({ok: false, message: err.message}, {status: 400});
  } catch (error) {
    console.error(error);
    return data(
      {ok: false, message: 'Something went wrong. Please try again.'},
      {status: 500},
    );
  }
}

const NEWSLETTER_MUTATION = `#graphql
  mutation NewsletterSubscribe($input: CustomerCreateInput!) {
    customerCreate(input: $input) {
      customer {
        id
      }
      customerUserErrors {
        code
        message
      }
    }
  }
`;
