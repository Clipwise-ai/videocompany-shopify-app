const SHOP_QUERY = `#graphql
  query ShopIdentity {
    shop {
      id
      name
      email
      myshopifyDomain
    }
  }
`;

const ACTIVE_APP_SUBSCRIPTIONS_QUERY = `#graphql
  query ActiveAppSubscriptions {
    currentAppInstallation {
      activeSubscriptions {
        id
        name
        status
        test
        createdAt
        currentPeriodEnd
        lineItems {
          id
          plan {
            pricingDetails {
              __typename
              ... on AppRecurringPricing {
                interval
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchShopIdentity(admin) {
  const response = await admin.graphql(SHOP_QUERY);
  const payload = await response.json();
  return payload?.data?.shop || null;
}

export async function fetchActiveAppSubscriptions(admin) {
  const response = await admin.graphql(ACTIVE_APP_SUBSCRIPTIONS_QUERY);
  const payload = await response.json();
  return payload?.data?.currentAppInstallation?.activeSubscriptions || [];
}
