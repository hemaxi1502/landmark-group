// NOTE: https://shopify.dev/docs/api/storefront/latest/queries/cart
export const CART_QUERY_FRAGMENT = `#graphql
  fragment Money on MoneyV2 {
    currencyCode
    amount
  }
  fragment CartLine on CartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height

        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
    parentRelationship {
      parent {
        id
      }
    }
  }
  fragment CartLineComponent on ComponentizableCartLine {
    id
    quantity
    attributes {
      key
      value
    }
    cost {
      totalAmount {
        ...Money
      }
      amountPerQuantity {
        ...Money
      }
      compareAtAmountPerQuantity {
        ...Money
      }
    }
    merchandise {
      ... on ProductVariant {
        id
        availableForSale
        compareAtPrice {
          ...Money
        }
        price {
          ...Money
        }
        requiresShipping
        title
        image {
          id
          url
          altText
          width
          height
        }
        product {
          handle
          title
          id
          vendor
        }
        selectedOptions {
          name
          value
        }
      }
    }
    lineComponents {
      ...CartLine
    }
  }
  fragment CartApiQuery on Cart {
    updatedAt
    id
    appliedGiftCards {
      id
      lastCharacters
      amountUsed {
        ...Money
      }
    }
    checkoutUrl
    totalQuantity
    buyerIdentity {
      countryCode
      customer {
        id
        email
        firstName
        lastName
        displayName
      }
      email
      phone
    }
    lines(first: $numCartLines) {
      nodes {
        ...CartLine
      }
      nodes {
        ...CartLineComponent
      }
    }
    cost {
      subtotalAmount {
        ...Money
      }
      totalAmount {
        ...Money
      }
      totalDutyAmount {
        ...Money
      }
      totalTaxAmount {
        ...Money
      }
    }
    note
    attributes {
      key
      value
    }
    discountCodes {
      code
      applicable
    }
  }
`;

const MENU_FRAGMENT = `#graphql
  fragment MenuItem on MenuItem {
    id
    resourceId
    tags
    title
    type
    url
  }
  fragment GrandchildMenuItem on MenuItem {
    ...MenuItem
  }
  fragment ChildMenuItem on MenuItem {
    ...MenuItem
    items {
      ...GrandchildMenuItem
    }
  }
  fragment ParentMenuItem on MenuItem {
    ...MenuItem
    items {
      ...ChildMenuItem
    }
  }
  fragment Menu on Menu {
    id
    items {
      ...ParentMenuItem
    }
  }
`;

export const HEADER_QUERY = `#graphql
  fragment Shop on Shop {
    id
    name
    description
    primaryDomain {
      url
    }
    brand {
      logo {
        image {
          url
        }
      }
    }
  }
  fragment AnnouncementBarMetaobject on Metaobject {
    id
    handle
    type
    fields {
      key
      value
      reference {
        ... on MediaImage {
          id
          image {
            url
            altText
          }
        }
        ... on Collection {
          id
          handle
          title
        }
        ... on Product {
          id
          handle
          title
        }
        ... on Page {
          id
          handle
          title
        }
      }
    }
  }
  query Header(
    $country: CountryCode
    $headerMenuHandle: String!
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    shop {
      ...Shop
    }
    menu(handle: $headerMenuHandle) {
      ...Menu
    }
    topBar: metaobject(handle: {type: "top_bar_link_main", handle: "top-bar-link-main"}) {
      fields {
        key
        value
        references(first: 10) {
          nodes {
            ... on Metaobject {
              fields {
                key
                value
                reference {
                  ... on MediaImage {
                    image {
                      url
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    announcementBarMetaobject: metaobject(handle: {handle: "announcement-bar-1", type: "announcement_bar"}) {
      ...AnnouncementBarMetaobject
    }
    announcementBarMetaobjects: metaobjects(type: "announcement_bar", first: 10) {
      nodes {
        ...AnnouncementBarMetaobject
      }
    }
  }
  ${MENU_FRAGMENT}
`;

export const FOOTER_QUERY = `#graphql
  fragment FooterMenu on Menu {
    id
    title
    items {
      id
      title
      url
    }
  }
  query Footer($country: CountryCode, $language: LanguageCode)
  @inContext(language: $language, country: $country) {
    women: menu(handle: "footer-women") {
      ...FooterMenu
    }
    men: menu(handle: "footer-men") {
      ...FooterMenu
    }
    kids: menu(handle: "footer-kids") {
      ...FooterMenu
    }
    beauty: menu(handle: "footer-beauty") {
      ...FooterMenu
    }
    footwear: menu(handle: "footer-footwear") {
      ...FooterMenu
    }
    bags: menu(handle: "footer-bags") {
      ...FooterMenu
    }
    homeLiving: menu(handle: "footer-home-living") {
      ...FooterMenu
    }
    shop {
      name
      privacyPolicy {
        handle
        title
      }
      refundPolicy {
        handle
        title
      }
      shippingPolicy {
        handle
        title
      }
      termsOfService {
        handle
        title
      }
    }
  }
`;
