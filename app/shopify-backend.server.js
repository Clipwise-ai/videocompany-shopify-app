import { sendSignedRequest } from "./lib/shopify-backend/core.server";
import {
  fetchActiveAppSubscriptions,
  fetchShopIdentity,
} from "./lib/shopify-backend/shopify-admin.server";
import {
  normalizeBillingStatus,
  normalizeShopPayload,
  resolveAmount,
  resolveCurrency,
  resolveInterval,
  resolvePlanKey,
  resolveShopifyCustomerId,
} from "./lib/shopify-backend/subscription-payload.server";

export { fetchActiveAppSubscriptions, fetchShopIdentity };

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

export async function fetchShopifySubscriptionStatus({
  companyId = null,
  customerId = "",
} = {}) {
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
