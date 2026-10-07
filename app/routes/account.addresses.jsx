import {useEffect, useState} from 'react';
import {
  data,
  Form,
  useActionData,
  useNavigation,
  useOutletContext,
} from 'react-router';
import {
  btnLink,
  btnPrimary,
  btnSecondary,
  Card,
  Field,
  FormError,
  inputCls,
  PageTitle,
} from '~/components/account/ui';
import {
  UPDATE_ADDRESS_MUTATION,
  DELETE_ADDRESS_MUTATION,
  CREATE_ADDRESS_MUTATION,
} from '~/graphql/customer-account/CustomerAddressMutations';

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{title: 'Addresses'}];
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

  try {
    const form = await request.formData();

    const addressId = form.has('addressId')
      ? String(form.get('addressId'))
      : null;
    if (!addressId) {
      throw new Error('You must provide an address id.');
    }

    // this will ensure redirecting to login never happen for mutatation
    const isLoggedIn = await customerAccount.isLoggedIn();
    if (!isLoggedIn) {
      return data(
        {error: {[addressId]: 'Unauthorized'}},
        {
          status: 401,
        },
      );
    }

    const defaultAddress = form.has('defaultAddress')
      ? String(form.get('defaultAddress')) === 'on'
      : false;
    const address = {};
    const keys = [
      'address1',
      'address2',
      'city',
      'company',
      'territoryCode',
      'firstName',
      'lastName',
      'phoneNumber',
      'zoneCode',
      'zip',
    ];

    for (const key of keys) {
      const value = form.get(key);
      if (typeof value === 'string') {
        address[key] = value;
      }
    }

    switch (request.method) {
      case 'POST': {
        // handle new address creation
        try {
          const {data, errors} = await customerAccount.mutate(
            CREATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressCreate?.userErrors?.length) {
            throw new Error(data?.customerAddressCreate?.userErrors[0].message);
          }

          if (!data?.customerAddressCreate?.customerAddress) {
            throw new Error('Customer address create failed.');
          }

          return {
            error: null,
            createdAddress: data?.customerAddressCreate?.customerAddress,
            defaultAddress,
          };
        } catch (error) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'PUT': {
        // handle address updates
        try {
          const {data, errors} = await customerAccount.mutate(
            UPDATE_ADDRESS_MUTATION,
            {
              variables: {
                address,
                addressId: decodeURIComponent(addressId),
                defaultAddress,
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressUpdate?.userErrors?.length) {
            throw new Error(data?.customerAddressUpdate?.userErrors[0].message);
          }

          if (!data?.customerAddressUpdate?.customerAddress) {
            throw new Error('Customer address update failed.');
          }

          return {
            error: null,
            updatedAddress: address,
            defaultAddress,
          };
        } catch (error) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      case 'DELETE': {
        // handles address deletion
        try {
          const {data, errors} = await customerAccount.mutate(
            DELETE_ADDRESS_MUTATION,
            {
              variables: {
                addressId: decodeURIComponent(addressId),
                language: customerAccount.i18n.language,
              },
            },
          );

          if (errors?.length) {
            throw new Error(errors[0].message);
          }

          if (data?.customerAddressDelete?.userErrors?.length) {
            throw new Error(data?.customerAddressDelete?.userErrors[0].message);
          }

          if (!data?.customerAddressDelete?.deletedAddressId) {
            throw new Error('Customer address delete failed.');
          }

          return {error: null, deletedAddress: addressId};
        } catch (error) {
          if (error instanceof Error) {
            return data(
              {error: {[addressId]: error.message}},
              {
                status: 400,
              },
            );
          }
          return data(
            {error: {[addressId]: error}},
            {
              status: 400,
            },
          );
        }
      }

      default: {
        return data(
          {error: {[addressId]: 'Method not allowed'}},
          {
            status: 405,
          },
        );
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return data(
        {error: error.message},
        {
          status: 400,
        },
      );
    }
    return data(
      {error},
      {
        status: 400,
      },
    );
  }
}

// Shopify's zone codes for India (state field of the Customer Account API).
const INDIA_STATES = [
  ['AN', 'Andaman and Nicobar Islands'],
  ['AP', 'Andhra Pradesh'],
  ['AR', 'Arunachal Pradesh'],
  ['AS', 'Assam'],
  ['BR', 'Bihar'],
  ['CH', 'Chandigarh'],
  ['CG', 'Chhattisgarh'],
  ['DN', 'Dadra and Nagar Haveli'],
  ['DD', 'Daman and Diu'],
  ['DL', 'Delhi'],
  ['GA', 'Goa'],
  ['GJ', 'Gujarat'],
  ['HR', 'Haryana'],
  ['HP', 'Himachal Pradesh'],
  ['JK', 'Jammu and Kashmir'],
  ['JH', 'Jharkhand'],
  ['KA', 'Karnataka'],
  ['KL', 'Kerala'],
  ['LA', 'Ladakh'],
  ['LD', 'Lakshadweep'],
  ['MP', 'Madhya Pradesh'],
  ['MH', 'Maharashtra'],
  ['MN', 'Manipur'],
  ['ML', 'Meghalaya'],
  ['MZ', 'Mizoram'],
  ['NL', 'Nagaland'],
  ['OR', 'Odisha'],
  ['PY', 'Puducherry'],
  ['PB', 'Punjab'],
  ['RJ', 'Rajasthan'],
  ['SK', 'Sikkim'],
  ['TN', 'Tamil Nadu'],
  ['TS', 'Telangana'],
  ['TR', 'Tripura'],
  ['UP', 'Uttar Pradesh'],
  ['UK', 'Uttarakhand'],
  ['WB', 'West Bengal'],
];

export default function Addresses() {
  const {customer} = useOutletContext();
  const {defaultAddress, addresses} = customer;
  /** @type {ActionReturnData} */
  const action = useActionData();
  const [mode, setMode] = useState(null); // null | 'new' | address id
  const count = addresses.nodes.length;

  // Close the form once a save/create/delete succeeds.
  useEffect(() => {
    if (action && !action.error) setMode(null);
  }, [action]);

  // Default address first.
  const list = [...addresses.nodes].sort(
    (a, b) =>
      Number(b.id === defaultAddress?.id) - Number(a.id === defaultAddress?.id),
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <PageTitle sub="Saved addresses are offered at checkout.">
          Addresses
        </PageTitle>
        {mode !== 'new' && (
          <button
            type="button"
            className={btnSecondary}
            onClick={() => setMode('new')}
          >
            + Add new address
          </button>
        )}
      </div>

      {mode === 'new' && (
        <Card title="New address">
          <NewAddressForm
            key={count}
            isFirst={count === 0}
            onCancel={() => setMode(null)}
          />
        </Card>
      )}

      {count === 0 && mode !== 'new' ? (
        <Card className="py-10 text-center">
          <p className="text-[15px] font-semibold">No saved addresses yet.</p>
          <p className="mt-1 text-[14px] text-gray-500">
            Add one to check out faster.
          </p>
        </Card>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {list.map((address) => {
            const isDefault = address.id === defaultAddress?.id;
            const editing = mode === address.id;
            return (
              <li
                key={address.id}
                className={editing ? 'md:col-span-2' : undefined}
              >
                <Card
                  title={
                    <span className="flex items-center gap-2">
                      {address.firstName} {address.lastName}
                      {isDefault && (
                        <span className="rounded-full bg-[#FAA619]/15 px-2 py-0.5 text-[11px] font-semibold text-[#B86E00]">
                          Default
                        </span>
                      )}
                    </span>
                  }
                  className="h-full"
                >
                  {editing ? (
                    <AddressForm
                      addressId={address.id}
                      address={address}
                      defaultAddress={defaultAddress}
                    >
                      {({stateForMethod}) => (
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            disabled={stateForMethod('PUT') !== 'idle'}
                            formMethod="PUT"
                            type="submit"
                            className={btnPrimary}
                          >
                            {stateForMethod('PUT') !== 'idle'
                              ? 'Saving…'
                              : 'Save address'}
                          </button>
                          <button
                            type="button"
                            className={btnLink}
                            onClick={() => setMode(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </AddressForm>
                  ) : (
                    <>
                      <address className="text-[14px] not-italic leading-relaxed text-gray-700">
                        {(address.formatted ?? []).map((line, i) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <span key={i} className="block">
                            {line}
                          </span>
                        ))}
                        {address.phoneNumber && (
                          <span className="mt-1 block">
                            Mobile: {address.phoneNumber}
                          </span>
                        )}
                      </address>
                      <div className="mt-4 flex items-center gap-4">
                        <button
                          type="button"
                          className={btnLink}
                          onClick={() => setMode(address.id)}
                        >
                          Edit
                        </button>
                        <DeleteAddress addressId={address.id} />
                      </div>
                    </>
                  )}
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function DeleteAddress({addressId}) {
  const {state, formMethod, formData} = useNavigation();
  const busy =
    state !== 'idle' &&
    formMethod === 'DELETE' &&
    formData?.get('addressId') === addressId;
  return (
    <Form
      method="DELETE"
      onSubmit={(e) => {
        if (!window.confirm('Delete this address?')) e.preventDefault();
      }}
    >
      <input type="hidden" name="addressId" value={addressId} />
      <button
        type="submit"
        disabled={busy}
        className={`${btnLink} hover:text-red-600`}
      >
        {busy ? 'Deleting…' : 'Delete'}
      </button>
    </Form>
  );
}

function NewAddressForm({isFirst, onCancel}) {
  const newAddress = {
    address1: '',
    address2: '',
    city: '',
    company: '',
    territoryCode: 'IN',
    firstName: '',
    id: 'new',
    lastName: '',
    phoneNumber: '',
    zoneCode: '',
    zip: '',
  };

  return (
    <AddressForm
      addressId={'NEW_ADDRESS_ID'}
      address={newAddress}
      defaultAddress={null}
      defaultChecked={isFirst}
    >
      {({stateForMethod}) => (
        <div className="flex flex-wrap items-center gap-3">
          <button
            disabled={stateForMethod('POST') !== 'idle'}
            formMethod="POST"
            type="submit"
            className={btnPrimary}
          >
            {stateForMethod('POST') !== 'idle' ? 'Saving…' : 'Save address'}
          </button>
          <button type="button" className={btnLink} onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
    </AddressForm>
  );
}

/**
 * @param {{
 *   addressId: AddressFragment['id'];
 *   address: CustomerAddressInput;
 *   defaultAddress: CustomerFragment['defaultAddress'];
 *   defaultChecked?: boolean;
 *   children: (props: {
 *     stateForMethod: (method: 'PUT' | 'POST' | 'DELETE') => Fetcher['state'];
 *   }) => React.ReactNode;
 * }}
 */
export function AddressForm({
  addressId,
  address,
  defaultAddress,
  defaultChecked,
  children,
}) {
  const {state, formMethod} = useNavigation();
  /** @type {ActionReturnData} */
  const action = useActionData();
  const error = action?.error?.[addressId];
  const isDefaultAddress = defaultAddress?.id === addressId;
  const [country, setCountry] = useState(
    (address?.territoryCode || 'IN').toUpperCase(),
  );
  // Unique ids per form: several forms can be on the page at once.
  const uid = String(addressId).replace(/\W/g, '').slice(-12);
  const id = (name) => `${name}-${uid}`;
  const isIndia = country === 'IN';

  return (
    <Form id={addressId} className="space-y-4">
      <input type="hidden" name="addressId" defaultValue={addressId} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id={id('firstName')} label="First name" required>
          <input
            id={id('firstName')}
            name="firstName"
            autoComplete="given-name"
            defaultValue={address?.firstName ?? ''}
            required
            type="text"
            className={inputCls}
          />
        </Field>
        <Field id={id('lastName')} label="Last name" required>
          <input
            id={id('lastName')}
            name="lastName"
            autoComplete="family-name"
            defaultValue={address?.lastName ?? ''}
            required
            type="text"
            className={inputCls}
          />
        </Field>
        <Field
          id={id('phoneNumber')}
          label="Mobile number"
          hint="With country code, e.g. +919876543210"
        >
          <input
            id={id('phoneNumber')}
            name="phoneNumber"
            autoComplete="tel"
            defaultValue={address?.phoneNumber ?? ''}
            placeholder="+919876543210"
            pattern="^\+?[1-9]\d{3,14}$"
            type="tel"
            className={inputCls}
          />
        </Field>
        <Field
          id={id('zip')}
          label={isIndia ? 'PIN code' : 'Postal code'}
          required
        >
          <input
            id={id('zip')}
            name="zip"
            autoComplete="postal-code"
            defaultValue={address?.zip ?? ''}
            required
            inputMode={isIndia ? 'numeric' : undefined}
            pattern={isIndia ? '[1-9][0-9]{5}' : undefined}
            title={isIndia ? '6-digit PIN code' : undefined}
            type="text"
            className={inputCls}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field
            id={id('address1')}
            label="Flat, house no., building, street"
            required
          >
            <input
              id={id('address1')}
              name="address1"
              autoComplete="address-line1"
              defaultValue={address?.address1 ?? ''}
              required
              type="text"
              className={inputCls}
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field id={id('address2')} label="Area, landmark">
            <input
              id={id('address2')}
              name="address2"
              autoComplete="address-line2"
              defaultValue={address?.address2 ?? ''}
              type="text"
              className={inputCls}
            />
          </Field>
        </div>
        <Field id={id('city')} label="City" required>
          <input
            id={id('city')}
            name="city"
            autoComplete="address-level2"
            defaultValue={address?.city ?? ''}
            required
            type="text"
            className={inputCls}
          />
        </Field>
        <Field id={id('zoneCode')} label="State" required>
          {isIndia ? (
            <select
              id={id('zoneCode')}
              name="zoneCode"
              autoComplete="address-level1"
              defaultValue={address?.zoneCode ?? ''}
              required
              className={inputCls}
            >
              <option value="" disabled>
                Select state
              </option>
              {INDIA_STATES.map(([code, name]) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={id('zoneCode')}
              name="zoneCode"
              autoComplete="address-level1"
              defaultValue={address?.zoneCode ?? ''}
              required
              type="text"
              className={inputCls}
            />
          )}
        </Field>
        <Field id={id('territoryCode')} label="Country" required>
          <select
            id={id('territoryCode')}
            name="territoryCode"
            autoComplete="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={inputCls}
          >
            <option value="IN">India</option>
            {country !== 'IN' && <option value={country}>{country}</option>}
          </select>
        </Field>
        <Field id={id('company')} label="Company">
          <input
            id={id('company')}
            name="company"
            autoComplete="organization"
            defaultValue={address?.company ?? ''}
            type="text"
            className={inputCls}
          />
        </Field>
      </div>
      <label
        htmlFor={id('defaultAddress')}
        className="flex items-center gap-2 text-[14px]"
      >
        <input
          defaultChecked={isDefaultAddress || defaultChecked}
          id={id('defaultAddress')}
          name="defaultAddress"
          type="checkbox"
          className="h-4 w-4 accent-[#FAA619]"
        />
        Set as default address
      </label>
      <FormError>{error}</FormError>
      {children({
        stateForMethod: (method) => (formMethod === method ? state : 'idle'),
      })}
    </Form>
  );
}

/**
 * @typedef {{
 *   addressId?: string | null;
 *   createdAddress?: AddressFragment;
 *   defaultAddress?: string | null;
 *   deletedAddress?: string | null;
 *   error: Record<AddressFragment['id'], string> | null;
 *   updatedAddress?: AddressFragment;
 * }} ActionResponse
 */

/** @typedef {import('@shopify/hydrogen/customer-account-api-types').CustomerAddressInput} CustomerAddressInput */
/** @typedef {import('customer-accountapi.generated').AddressFragment} AddressFragment */
/** @typedef {import('customer-accountapi.generated').CustomerFragment} CustomerFragment */
/** @template T @typedef {import('react-router').Fetcher<T>} Fetcher */
/** @typedef {import('./+types/account.addresses').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
/** @typedef {ReturnType<typeof useActionData<typeof action>>} ActionReturnData */
