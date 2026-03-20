import crypto from "node:crypto";
import { SHOPIFY_BILLING_PLANS } from "./billing.config.server";

const DJANGO_BACKEND_URL = process.env.DJANGO_BACKEND_URL || "";
const SHOPIFY_INTERNAL_SYNC_SECRET = process.env.SHOPIFY_INTERNAL_SYNC_SECRET || "";
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

async function parseJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function getSyncHeaders(path, body) {
  if (!SHOPIFY_INTERNAL_SYNC_SECRET) {
    throw new Error("SHOPIFY_INTERNAL_SYNC_SECRET is not configured.");
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = crypto
    .createHmac("sha256", SHOPIFY_INTERNAL_SYNC_SECRET)
    .update(`${timestamp}.${path}.${body}`)
    .digest("hex");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Clipwise-Timestamp": timestamp,
    "X-Clipwise-Signature": `sha256=${signature}`,
  };
}

async function sendSignedRequest(path, payload, { method = "POST" } = {}) {
  if (!DJANGO_BACKEND_URL) {
    throw new Error("DJANGO_BACKEND_URL is not configured.");
  }
  const trimmedBase = DJANGO_BACKEND_URL.replace(/\/$/, "");
  const body = payload ? JSON.stringify(payload) : "";
  const response = await fetch(`${trimmedBase}${path}`, {
    method,
    headers: getSyncHeaders(path, body),
    body: method === "GET" ? undefined : body,
  });
  const responsePayload = await parseJson(response);
  if (!response.ok) {
    const error = new Error(responsePayload?.error || `Backend sync failed (${response.status})`);
    error.status = response.status;
    error.payload = responsePayload;
    throw error;
  }
  return responsePayload;
}

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

function normalizeShopPayload(shop) {
  return {
    domain: shop?.myshopifyDomain || "",
    shop_id: shop?.id || "",
    email: shop?.email || "",
    name: shop?.name || "",
  };
}

function resolveShopifyCustomerId(shop) {
  return String(shop?.myshopifyDomain || shop?.domain || "")
    .trim()
    .toLowerCase() || null;
}

function normalizeBillingStatus(status) {
  return String(status || "").toUpperCase() || "PENDING";
}

function resolvePlanKey(appSubscription) {
  const subscriptionName = String(appSubscription?.name || "").trim().toLowerCase();
  const interval = String(appSubscription?.lineItems?.[0]?.plan?.pricingDetails?.interval || "").toUpperCase();
  const cycle = interval.includes("ANNUAL") ? "yearly" : "monthly";
  const matchingEntry = Object.entries(SHOPIFY_BILLING_PLANS).find(([, plan]) => {
    const planCycle = String(plan.interval || "").toUpperCase().includes("ANNUAL")
      ? "yearly"
      : "monthly";
    return (
      (planCycle === cycle && plan.label.toLowerCase() === subscriptionName) ||
      plan.backendPlanKey.toLowerCase() === subscriptionName
    );
  });
  if (matchingEntry) {
    return matchingEntry[1].backendPlanKey;
  }

  const appSubscriptionId = String(appSubscription?.id || "");
  const matchingById = Object.entries(SHOPIFY_BILLING_PLANS).find(([planKey]) => appSubscriptionId.includes(planKey));
  if (matchingById) {
    return matchingById[1].backendPlanKey;
  }

  throw new Error(`Could not resolve backend Shopify plan key for subscription '${appSubscription?.name || ""}'.`);
}

function resolveAmount(appSubscription) {
  const lineItems = Array.isArray(appSubscription?.lineItems) ? appSubscription.lineItems : [];
  const amount = lineItems[0]?.plan?.pricingDetails?.price?.amount;
  return amount || null;
}

function resolveCurrency(appSubscription) {
  const lineItems = Array.isArray(appSubscription?.lineItems) ? appSubscription.lineItems : [];
  return lineItems[0]?.plan?.pricingDetails?.price?.currencyCode || "USD";
}

function resolveInterval(appSubscription) {
  const lineItems = Array.isArray(appSubscription?.lineItems) ? appSubscription.lineItems : [];
  return lineItems[0]?.plan?.pricingDetails?.interval || "EVERY_30_DAYS";
}

export async function syncShopifySubscription({
  admin,
  companyId = null,
  appSubscription,
  eventType,
  eventId,
  source = "shopify_app",
}) {
  const shop = await fetchShopIdentity(admin);
  if (!shop) {
    throw new Error("Could not load Shopify shop identity.");
  }
  if (!appSubscription?.id) {
    throw new Error("Missing Shopify app subscription ID.");
  }

  const customerId = resolveShopifyCustomerId(shop);

  return sendSignedRequest("/core/api/shopify/internal/subscription-sync/", {
    ...(companyId ? { company_id: companyId } : {}),
    ...(customerId ? { customer_id: customerId } : {}),
    shop: normalizeShopPayload(shop),
    billing: {
      provider: "shopify",
      subscription_id: appSubscription.id,
      status: normalizeBillingStatus(appSubscription.status),
      plan_key: resolvePlanKey(appSubscription),
      interval: resolveInterval(appSubscription),
      currency: resolveCurrency(appSubscription),
      amount: resolveAmount(appSubscription),
      test: Boolean(appSubscription.test),
      current_period_end: appSubscription.currentPeriodEnd || null,
      current_period_start: appSubscription.createdAt || null,
      cancelled_at: appSubscription.status === "CANCELLED" ? new Date().toISOString() : null,
      line_item_id: appSubscription.lineItems?.[0]?.id || null,
    },
    event: {
      type: eventType,
      source,
      occurred_at: new Date().toISOString(),
      event_id: eventId || `${eventType}:${appSubscription.id}`,
    },
  });
}

export async function cancelShopifySubscription({
  admin,
  companyId = null,
  subscriptionId = null,
  eventType,
  eventId,
  source = "shopify_webhook",
}) {
  const shop = await fetchShopIdentity(admin);
  if (!shop) {
    throw new Error("Could not load Shopify shop identity.");
  }

  const customerId = resolveShopifyCustomerId(shop);

  return sendSignedRequest("/core/api/shopify/internal/subscription-cancel/", {
    ...(companyId ? { company_id: companyId } : {}),
    ...(customerId ? { customer_id: customerId } : {}),
    shop: normalizeShopPayload(shop),
    billing: subscriptionId
      ? {
          provider: "shopify",
          subscription_id: subscriptionId,
          status: "CANCELLED",
          plan_key: null,
        }
      : undefined,
    event: {
      type: eventType,
      source,
      occurred_at: new Date().toISOString(),
      event_id: eventId || `${eventType}:${shop.myshopifyDomain}`,
    },
  });
}

export async function fetchShopifyPricingCatalog() {
  return sendSignedRequest("/core/api/shopify/internal/pricing-catalog/", null, {
    method: "GET",
  });
}

export async function fetchShopifySubscriptionStatus({ companyId = null, customerId = "" } = {}) {
  const params = new URLSearchParams();
  if (companyId) {
    params.set("company_id", companyId);
  }
  if (!companyId && customerId) {
    params.set("customer_id", customerId);
  }

  const query = params.toString();
  return sendSignedRequest(
    `/core/api/shopify/internal/subscription-status/${query ? `?${query}` : ""}`,
    null,
    { method: "GET" },
  );
}
