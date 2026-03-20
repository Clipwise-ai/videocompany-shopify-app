import { SHOPIFY_BILLING_PLANS } from "../../billing.config.server";

export function normalizeShopPayload(shop) {
  return {
    domain: shop?.myshopifyDomain || "",
    shop_id: shop?.id || "",
    email: shop?.email || "",
    name: shop?.name || "",
  };
}

export function resolveShopifyCustomerId(shop) {
  return String(shop?.myshopifyDomain || shop?.domain || "")
    .trim()
    .toLowerCase() || null;
}

export function normalizeBillingStatus(status) {
  return String(status || "").toUpperCase() || "PENDING";
}

export function resolvePlanKey(appSubscription) {
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
  if (matchingEntry) return matchingEntry[1].backendPlanKey;

  const appSubscriptionId = String(appSubscription?.id || "");
  const matchingById = Object.entries(SHOPIFY_BILLING_PLANS).find(([planKey]) =>
    appSubscriptionId.includes(planKey),
  );
  if (matchingById) return matchingById[1].backendPlanKey;

  throw new Error(`Could not resolve backend Shopify plan key for subscription '${appSubscription?.name || ""}'.`);
}

export function resolveAmount(appSubscription) {
  const lineItems = Array.isArray(appSubscription?.lineItems) ? appSubscription.lineItems : [];
  return lineItems[0]?.plan?.pricingDetails?.price?.amount || null;
}

export function resolveCurrency(appSubscription) {
  const lineItems = Array.isArray(appSubscription?.lineItems) ? appSubscription.lineItems : [];
  return lineItems[0]?.plan?.pricingDetails?.price?.currencyCode || "USD";
}

export function resolveInterval(appSubscription) {
  const lineItems = Array.isArray(appSubscription?.lineItems) ? appSubscription.lineItems : [];
  return lineItems[0]?.plan?.pricingDetails?.interval || "EVERY_30_DAYS";
}
