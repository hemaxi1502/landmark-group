import {CUSTOMER_UPDATE_MUTATION} from '~/graphql/customer-account/CustomerUpdateMutation';
import {
  btnPrimary,
  Card,
  Field,
  FormError,
  inputCls,
  PageTitle,
} from '~/components/account/ui';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Profile'}];
};

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({context}) {
  await context.customerAccount.handleAuthStatus();

  return {};
}

/**
 * @param {Route.ActionArgs}
 */
export async function action({request, context}) {
  const {customerAccount} = context;

  if (request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405});
  }

  const form = await request.formData();

  try {
    const customer = {};
    const validInputKeys = ['firstName', 'lastName'];
    for (const [key, value] of form.entries()) {
      if (!validInputKeys.includes(key)) {
        continue;
      }
      if (typeof value === 'string' && value.length) {
        customer[key] = value;
      }
    }

    // update customer and possibly password
    const {data, errors} = await customerAccount.mutate(
      CUSTOMER_UPDATE_MUTATION,
      {
        variables: {
          customer,
          language: customerAccount.i18n.language,
        },
      },
    );

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.customerUpdate?.customer) {
      throw new Error('Customer profile update failed.');
    }

    return {
      error: null,
      customer: data?.customerUpdate?.customer,
    };
  } catch (error) {
    return data(
      {error: error.message, customer: null},
      {
        status: 400,
      },
    );
  }
}

export default function AccountProfile() {
  const account = useOutletContext();
  const {state} = useNavigation();
  /** @type {ActionReturnData} */
  const action = useActionData();
  const customer = action?.customer ?? account?.customer;
  const saving = state !== 'idle';
  const email = account?.customer?.emailAddress?.emailAddress;
  const phone = account?.customer?.phoneNumber?.phoneNumber;

  return (
    <div className="space-y-5">
      <PageTitle sub="Your name as it appears on orders and invoices.">
        Profile
      </PageTitle>

      <Card title="Personal information">
        <Form method="PUT" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="firstName" label="First name">
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="First name"
                defaultValue={customer?.firstName ?? ''}
                minLength={2}
                className={inputCls}
              />
            </Field>
            <Field id="lastName" label="Last name">
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Last name"
                defaultValue={customer?.lastName ?? ''}
                minLength={2}
                className={inputCls}
              />
            </Field>
          </div>
          <FormError>{action?.error}</FormError>
          {action?.customer && !saving && (
            <p
              role="status"
              className="text-[13px] font-semibold text-green-700"
            >
              Profile updated.
            </p>
          )}
          <button type="submit" disabled={saving} className={btnPrimary}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </Form>
      </Card>

      <Card title="Sign-in details">
        <dl className="grid gap-4 text-[14px] sm:grid-cols-2">
          <div>
            <dt className="text-[13px] text-gray-500">Email</dt>
            <dd className="font-semibold">{email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-gray-500">Mobile</dt>
            <dd className="font-semibold">{phone ?? 'Not added'}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[12px] text-gray-500">
          You sign in with a one-time code sent to this email, so there is no
          password to manage.
        </p>
      </Card>
    </div>
  );
}

/**
 * @typedef {{
 *   error: string | null;
 *   customer: CustomerFragment | null;
 * }} ActionResponse
 */

/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerUpdateInput} CustomerUpdateInput */
/** @typedef {import('./+types/account.profile').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
/** @typedef {ReturnType<typeof useActionData<typeof action>>} ActionReturnData */
