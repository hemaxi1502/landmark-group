import {useEffect, useRef} from 'react';
import {data, useFetcher, useLoaderData} from 'react-router';
import {StaticPage} from '~/components/StaticPage';
import {btnPrimary, Field, FormError, inputCls} from '~/components/account/ui';
import {adminGraphql, isAdminConfigured} from '~/lib/admin-api.server';
import {STORE_LINKS} from '~/lib/site-config';

/**
 * Contact Us. Intro text comes from the "Contact" page in Shopify admin
 * (Online Store → Pages); phone/email from the footer contacts metaobjects.
 * Messages are saved as "Contact submissions" metaobject entries
 * (Content → Metaobjects) through the editor app's Admin API access.
 */

export const meta = () => [
  {title: 'Contact Us | Lifestyle'},
  {
    name: 'description',
    content:
      'Contact Lifestyle customer care about orders, delivery, returns and more.',
  },
];

const TOPICS = [
  'Order status',
  'Returns & refunds',
  'Delivery',
  'Payment',
  'Product query',
  'Feedback',
  'Other',
];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LIMITS = {name: 80, email: 254, phone: 20, order: 30, message: 2000};

/** @param {import('react-router').LoaderFunctionArgs} */
export async function loader({context}) {
  const {page, footer} = await context.storefront.query(CONTACT_PAGE_QUERY, {
    cache: context.storefront.CacheShort(),
  });
  const contacts = (footer?.contacts?.references?.nodes ?? [])
    .map((n) => ({
      id: n.id,
      name: n.name?.value,
      value: n.contact?.value,
      order: Number(n.sortOrder?.value ?? 99),
    }))
    .filter((c) => c.value)
    .sort((a, b) => a.order - b.order);
  return {intro: page?.body ?? '', contacts};
}

/** @param {import('react-router').ActionFunctionArgs} */
export async function action({request, context}) {
  const form = await request.formData();
  const get = (k) => String(form.get(k) ?? '').trim();

  // Spam trap: real visitors never fill this hidden field.
  if (get('website')) return {ok: true};

  const values = {
    name: get('name').slice(0, LIMITS.name),
    email: get('email').toLowerCase().slice(0, LIMITS.email),
    phone: get('phone').slice(0, LIMITS.phone),
    topic: TOPICS.includes(get('topic')) ? get('topic') : 'Other',
    order_number: get('order_number').slice(0, LIMITS.order),
    message: get('message').slice(0, LIMITS.message),
  };

  const errors = {};
  if (values.name.length < 2) errors.name = 'Please enter your name.';
  if (!EMAIL.test(values.email)) errors.email = 'Please enter a valid email.';
  if (values.phone && !/^\+?[\d\s-]{7,20}$/.test(values.phone))
    errors.phone = 'Please enter a valid phone number.';
  if (values.message.length < 10)
    errors.message = 'Please tell us a little more (at least 10 characters).';
  if (Object.keys(errors).length) return data({errors}, {status: 400});

  if (!isAdminConfigured(context.env)) {
    return data(
      {
        formError:
          'Our contact form is unavailable right now. Please call or email us instead.',
      },
      {status: 503},
    );
  }

  try {
    const result = await adminGraphql(context.env, CREATE_SUBMISSION, {
      metaobject: {
        type: 'contact_submission',
        fields: [
          ...Object.entries(values)
            .filter(([, v]) => v)
            .map(([key, value]) => ({key, value})),
          {key: 'submitted_at', value: new Date().toISOString()},
          {key: 'status', value: 'New'},
        ],
      },
    });
    const userError = result?.metaobjectCreate?.userErrors?.[0];
    if (userError) throw new Error(userError.message);
    return {ok: true, name: values.name.split(' ')[0]};
  } catch (error) {
    console.error('Contact form', error);
    return data(
      {
        formError:
          'Sorry, we could not send your message. Please try again or call us.',
      },
      {status: 500},
    );
  }
}

export default function ContactPage() {
  const {intro, contacts} = useLoaderData();
  return (
    <StaticPage title="Contact Us">
      {intro && (
        <div
          className="rte max-w-3xl"
          dangerouslySetInnerHTML={{__html: intro}}
        />
      )}
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <ContactForm />
        <ContactDetails contacts={contacts} />
      </div>
    </StaticPage>
  );
}

function ContactForm() {
  const fetcher = useFetcher();
  const formRef = useRef(null);
  const busy = fetcher.state !== 'idle';
  const res = fetcher.data;
  const err = res?.errors ?? {};

  useEffect(() => {
    if (fetcher.state === 'idle' && res?.ok) formRef.current?.reset();
  }, [fetcher.state, res]);

  if (res?.ok && fetcher.state === 'idle') {
    return (
      <div
        role="status"
        className="rounded-[2px] border border-green-200 bg-green-50 p-6"
      >
        <p className="text-[16px] font-bold text-green-800">
          Thanks{res.name ? `, ${res.name}` : ''}! Your message has been sent.
        </p>
        <p className="mt-1 text-[14px] text-green-800">
          Our customer care team will get back to you by email.
        </p>
        <button
          type="button"
          className="mt-4 text-[14px] font-semibold underline"
          onClick={() => fetcher.load('/pages/contact')}
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <fetcher.Form
      ref={formRef}
      method="post"
      noValidate
      className="space-y-4 rounded-[2px] border border-gray-200 p-4 md:p-6"
    >
      <h2 className="text-[16px] font-bold">Send us a message</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="c-name" label="Name" required>
          <input
            id="c-name"
            name="name"
            autoComplete="name"
            maxLength={LIMITS.name}
            aria-invalid={!!err.name}
            className={inputCls}
          />
          <FieldError>{err.name}</FieldError>
        </Field>
        <Field id="c-email" label="Email" required>
          <input
            id="c-email"
            name="email"
            type="email"
            autoComplete="email"
            maxLength={LIMITS.email}
            aria-invalid={!!err.email}
            className={inputCls}
          />
          <FieldError>{err.email}</FieldError>
        </Field>
        <Field id="c-phone" label="Mobile number">
          <input
            id="c-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={LIMITS.phone}
            placeholder="+91"
            aria-invalid={!!err.phone}
            className={inputCls}
          />
          <FieldError>{err.phone}</FieldError>
        </Field>
        <Field id="c-order" label="Order number (if any)">
          <input
            id="c-order"
            name="order_number"
            maxLength={LIMITS.order}
            placeholder="#1001"
            className={inputCls}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field id="c-topic" label="Topic">
            <select
              id="c-topic"
              name="topic"
              defaultValue={TOPICS[0]}
              className={inputCls}
            >
              {TOPICS.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field id="c-message" label="Message" required>
            <textarea
              id="c-message"
              name="message"
              rows={5}
              maxLength={LIMITS.message}
              aria-invalid={!!err.message}
              className={`${inputCls} h-auto py-2`}
            />
            <FieldError>{err.message}</FieldError>
          </Field>
        </div>
      </div>
      {/* Spam trap, hidden from people and screen readers. */}
      <div aria-hidden="true" className="absolute -left-[9999px]">
        <label htmlFor="c-website">Website</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <FormError>{res?.formError}</FormError>
      <button type="submit" disabled={busy} className={btnPrimary}>
        {busy ? 'Sending…' : 'Send message'}
      </button>
    </fetcher.Form>
  );
}

function FieldError({children}) {
  if (!children) return null;
  return <p className="mt-1 text-[12px] text-red-600">{children}</p>;
}

function ContactDetails({contacts}) {
  const href = (v) =>
    /@/.test(v)
      ? `mailto:${v}`
      : /^[\d\s+()-]+$/.test(v)
        ? `tel:${v.replace(/[^\d+]/g, '')}`
        : STORE_LINKS.help;
  return (
    <div className="space-y-4 rounded-[2px] bg-[#F7F8F7] p-4 md:p-6">
      <h2 className="text-[16px] font-bold">Other ways to reach us</h2>
      <ul className="space-y-4">
        {contacts.map((c) => (
          <li key={c.id}>
            <p className="text-[13px] text-gray-500">{c.name}</p>
            <a
              href={href(c.value)}
              {...(!/@|^[\d\s+()-]+$/.test(c.value) && {
                target: '_blank',
                rel: 'noopener noreferrer',
              })}
              className="text-[15px] font-semibold hover:text-[#FAA619]"
            >
              {c.value}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const CREATE_SUBMISSION = `
  mutation CreateContactSubmission($metaobject: MetaobjectCreateInput!) {
    metaobjectCreate(metaobject: $metaobject) {
      metaobject { id }
      userErrors { field message }
    }
  }
`;

const CONTACT_PAGE_QUERY = `#graphql
  query ContactPage($country: CountryCode, $language: LanguageCode)
  @inContext(country: $country, language: $language) {
    page(handle: "contact") {
      body
    }
    footer: metaobject(handle: {type: "footer_main", handle: "footer-menu"}) {
      contacts: field(key: "footer_contacts") {
        references(first: 10) {
          nodes {
            ... on Metaobject {
              id
              name: field(key: "name") {
                value
              }
              contact: field(key: "contact") {
                value
              }
              sortOrder: field(key: "sort_order") {
                value
              }
            }
          }
        }
      }
    }
  }
`;
