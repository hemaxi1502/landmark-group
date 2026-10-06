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
