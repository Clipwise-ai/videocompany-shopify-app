import { redirect } from "react-router";
import { SHOPIFY_BILLING_TEST_MODE } from "../billing-mode.server";
import { SHOPIFY_PAID_PLAN_KEYS } from "../billing.config.server";
import { getStoredCompanyId } from "../company-id.server";
import { getLinkedCompanyIdForShop } from "../shop-link.server";
import { cancelShopifySubscription } from "../shopify-backend.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin, billing, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const params = new URLSearchParams(url.searchParams);
  const companyId =
    String(url.searchParams.get("companyId") || "").trim() ||
    getStoredCompanyId(request) ||
    (await getLinkedCompanyIdForShop(session.shop));

  const { appSubscriptions } = await billing.check({
    plans: SHOPIFY_PAID_PLAN_KEYS,
    isTest: SHOPIFY_BILLING_TEST_MODE,
  });

  if (appSubscriptions[0]) {
    const cancelledSubscription = await billing.cancel({
      subscriptionId: appSubscriptions[0].id,
      isTest: SHOPIFY_BILLING_TEST_MODE,
      prorate: true,
    });

    try {
      await cancelShopifySubscription({
        admin,
        companyId,
        subscriptionId: cancelledSubscription?.id || appSubscriptions[0].id,
        eventType: "subscription_cancelled",
        eventId: `cancel:${appSubscriptions[0].id}`,
      });
    } catch {
      // Keep cancellation UX simple even if backend sync fails.
    }
  }

  params.set("shop", session.shop);
  params.delete("billing");

  return redirect(`/app/billing?${params.toString()}`);
};
