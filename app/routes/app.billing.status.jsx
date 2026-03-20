import { SHOPIFY_BILLING_TEST_MODE } from "../billing-mode.server";
import { SHOPIFY_PAID_PLAN_KEYS } from "../billing.config.server";
import { getStoredCompanyId } from "../company-id.server";
import { getLinkedCompanyIdForShop } from "../shop-link.server";
import {
  fetchShopifySubscriptionStatus,
  syncShopifySubscription,
} from "../shopify-backend.server";
import { authenticate } from "../shopify.server";

function isBackendSubscriptionActive(subscription) {
  const status = String(subscription?.status || "").trim().toLowerCase();
  return ["active", "trialing", "past_due", "suspended"].includes(status);
}

export const loader = async ({ request }) => {
  const { billing, admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const companyId =
    String(url.searchParams.get("companyId") || "").trim() ||
    getStoredCompanyId(request) ||
    (await getLinkedCompanyIdForShop(session.shop));

  const { appSubscriptions } = await billing.check({
    plans: SHOPIFY_PAID_PLAN_KEYS,
    isTest: SHOPIFY_BILLING_TEST_MODE,
  });

  const currentPlan = appSubscriptions[0] || null;

  let backendStatus = null;
  let syncStatus = currentPlan ? "skipped" : "no_active_subscription";
  let syncError = "";

  if (currentPlan) {
    try {
      await syncShopifySubscription({
        admin,
        companyId,
        appSubscription: currentPlan,
        eventType: "subscription_verify_poll",
        eventId: `verify-poll:${currentPlan.id}`,
      });
      syncStatus = "success";
    } catch (error) {
      syncStatus = "failed";
      syncError = error?.message || "Backend sync failed.";
    }
  }

  try {
    backendStatus = await fetchShopifySubscriptionStatus({
      companyId,
      customerId: session.shop,
    });
  } catch (error) {
    backendStatus = null;
    if (!syncError) {
      syncError = error?.message || "Could not fetch backend subscription status.";
    }
  }

  const backendSubscription = backendStatus?.subscription || null;
  const backendActive = isBackendSubscriptionActive(backendSubscription);
  const shopifyActive = Boolean(currentPlan);

  let verificationState = "checking";
  if (shopifyActive && backendActive) {
    verificationState = "success";
  } else if (!shopifyActive) {
    verificationState = "failed";
  } else if (shopifyActive && !backendActive) {
    verificationState = "pending";
  }

  return Response.json({
    verificationState,
    shopifyActive,
    backendActive,
    syncStatus,
    syncError,
    currentPlan: currentPlan
      ? {
          id: currentPlan.id,
          name: currentPlan.name,
          status: currentPlan.status,
        }
      : null,
    backendSubscription,
  });
};
