/**
 * Static storefront copy that has no home in Shopify data yet.
 *
 * Everything here is a placeholder the client should confirm. If the
 * client wants to edit any of it from Shopify admin, move it into a
 * metaobject (see README → "Moving config into Shopify").
 */
export const USP_ITEMS = [
  {title: 'Free Shipping', text: 'On all orders', icon: 'truck'},
  {
    title: 'Click & Collect',
    text: 'Order online and collect at a store of your choice for free.',
    icon: 'store',
  },
  {
    title: 'Return To Store',
    text: 'Return to your nearest store.',
    icon: 'return',
  },
];
export const UTILITY_LINKS = [
  {label: 'Download our Apps', to: '/pages/apps'},
  {label: 'Store Locator', to: '/pages/store-locator'},
  {label: 'Help', to: '/pages/help'},
];
/** Shown in the PDP "Offers & Discounts" carousel. Must match real discount codes. */
export const PDP_COUPONS = [
  {title: 'Coupon Discount', text: 'Flat ₹200 off above ₹999', code: 'SAVE200'},
  {
    title: 'Coupon Discount',
    text: 'Flat ₹501 off above ₹2,499',
    code: 'SAVE501',
  },
  {
    title: 'Coupon Discount',
    text: 'Flat ₹1,001 off above ₹3,999',
    code: 'SAVE1001',
  },
];
export const PDP_SERVICE_INFO = {
  clickAndCollect:
    'Order this product now and collect it from a store of your choice.',
  emi: 'Pay in easy instalments on orders of ₹3,000 or more. Available for select banks.',
  emiThreshold: 3000,
  returns: '7 days easy returns (conditions apply)',
  returnsUrl: '/policies/refund-policy',
  soldBy: 'Landmark Online India Pvt Ltd',
};
/**
 * Pop-up text behind the PDP service links (Click & Collect, returns,
 * seller, shipping, rewards). The store has no Refund or Shipping policy
 * yet, so these open in a pop-up instead of linking to a missing page.
 * When those policies exist (Settings → Policies), set `policy` to show a
 * "Read full policy" link.
 */
export const PDP_INFO_PANELS = {
  clickAndCollect: {
    title: 'Click & Collect',
    steps: [
      'Add this product to your basket and go to checkout.',
      'Choose “Pick up” as the delivery method and select your nearest store.',
      'We will message you when your order is ready. Collect it within 7 days with your order ID.',
    ],
    note: 'Pickup is free. Stores offering pickup appear at checkout.',
  },
  returns: {
    title: '7 days easy returns',
    steps: [
      'Return within 7 days of delivery from My Orders, or at any Lifestyle store.',
      'Items must be unused, unwashed and with original tags and packaging.',
      'Refunds go to your original payment method within 5–7 working days after pickup.',
    ],
    note: 'Not returnable: innerwear, swimwear, beauty and personal care, and items marked non-returnable.',
    policy: '',
  },
  soldBy: {
    title: 'Sold by Landmark Online India Pvt Ltd',
    steps: [
      'All products are sold and shipped by Landmark Online India Pvt Ltd, part of the Landmark Group.',
      'Every product is 100% original and covered by the Lifestyle returns policy.',
      'A GST invoice is included with every order.',
    ],
    note: '',
  },
  shipping: {
    title: 'Free shipping',
    steps: [
      'Free delivery on all orders. No cash-on-delivery charges.',
      'Most orders arrive in 3–7 working days. Check your pincode on this page for an estimate.',
      'You will get tracking details by SMS and email once the order ships.',
    ],
    note: '',
    policy: '',
  },
  rewards: {
    title: 'Landmark Rewards',
    steps: [
      'Earn points on every purchase.',
      'Redeem points on your next purchase online or in store.',
      'Get members-only offers and early access to sales.',
    ],
    note: 'Sign up or sign in to start earning.',
  },
};
export const MEMBERSHIP_BANNER = {
  title: 'Join Landmark Rewards',
  text: 'Earn points on every purchase and get members-only offers.',
  cta: 'Know more',
  to: '/pages/rewards',
};
/** Show "Only N left!" when quantityAvailable is at or below this. */
export const LOW_STOCK_THRESHOLD = 10;
/** Badge a product as "New" when published within this many days. */
export const NEW_BADGE_DAYS = 30;
/** Product metafields shown in the PDP "Details" table, in this order. */
export const SPEC_METAFIELDS = [
  {key: 'country_of_origin', label: 'Country of Origin'},
  {key: 'manufactured_imported_by', label: 'Manufactured/Imported By'},
  {key: 'customer_care', label: 'Customer Care'},
  {key: 'net_quantity', label: 'Net Quantity'},
  {key: 'product', label: 'Product'},
  {key: 'type', label: 'Type'},
  {key: 'design', label: 'Design'},
  {key: 'fabric', label: 'Fabric'},
  {key: 'fit', label: 'Fit'},
  {key: 'neckline', label: 'Neckline'},
  {key: 'sleeve_length', label: 'Sleeve Length'},
  {key: 'sleeve_type', label: 'Sleeve Type'},
  {key: 'length', label: 'Length'},
  {key: 'top_length', label: 'Top Length'},
  {key: 'top_hemline', label: 'Top Hemline'},
  {key: 'closure', label: 'Closure'},
  {key: 'rise', label: 'Rise'},
  {key: 'occasion', label: 'Occasion'},
  {key: 'gender', label: 'Gender'},
  {key: 'care_instructions', label: 'Care Instructions'},
  {key: 'model_wears', label: 'Model Wears'},
];

/**
 * Footer pieces that have no Shopify source. Column links, contacts,
 * copyright and the Terms/Privacy labels come from Shopify (footer-* menus
 * and the footer_main metaobject).
 * TODO(client): confirm the social profile URLs.
 */
export const FOOTER_CONFIG = {
  subscribe: {
    heading: 'Subscribe to our awesome emails.',
    text: 'Get our latest offers and news straight in your inbox.',
    placeholder: 'Please enter an email address',
    button: 'Subscribe',
  },
  apps: {
    heading: 'Download our apps',
    text: 'Shop our products and offers on-the-go.',
    appStore: 'https://apps.apple.com/in/app/id1180884618',
    googlePlay: 'https://www.lifestylestores.com/in/en/apps',
  },
  helpCentreUrl: 'https://helpin.lifestylestores.com/support/home',
  socials: [
    {
      name: 'Facebook',
      icon: 'facebook',
      url: 'https://www.facebook.com/LifestyleStores',
    },
    {name: 'X', icon: 'x', url: 'https://x.com/LifestyleStores'},
    {
      name: 'Instagram',
      icon: 'instagram',
      url: 'https://www.instagram.com/lifestylestores/',
    },
  ],
};
