import { useEffect, useMemo, useState } from "react";
import { redirect, useLoaderData, useNavigate } from "react-router";
import { Page } from "@shopify/polaris";
import { SHOPIFY_BILLING_TEST_MODE } from "../billing-mode.server";
import { BillingHeader } from "../features/billing/components/BillingHeader";
import { BillingHero } from "../features/billing/components/BillingHero";
import { BillingNotice } from "../features/billing/components/BillingNotice";
import { BillingPlanCards } from "../features/billing/components/BillingPlanCards";
import { useBillingVerification } from "../features/billing/hooks/useBillingVerification";
import { useShopifyIframeSession } from "../features/billing/hooks/useShopifyIframeSession";
import { useViewportWidth } from "../features/billing/hooks/useViewportWidth";
import {
  buildPlanCards,
  normalizePlanKey,
} from "../features/billing/utils/pricing";
import { getStoredCompanyId } from "../company-id.server";
import { getLinkedCompanyIdForShop } from "../shop-link.server";
import { authenticate } from "../shopify.server";
import {
  CREATOR_MONTHLY_PLAN,
  CREATOR_YEARLY_PLAN,
  STARTER_MONTHLY_PLAN,
  STARTER_YEARLY_PLAN,
} from "../billing.shared";
import {
  cancelShopifySubscription,
  fetchShopifySubscriptionStatus,
  fetchShopifyPricingCatalog,
  syncShopifySubscription,
} from "../shopify-backend.server";

export const loader = async ({ request }) => {
  const { SHOPIFY_BILLING_PLANS, SHOPIFY_PAID_PLAN_KEYS } = await import("../billing.config.server");
  const { admin, billing, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const host = url.searchParams.get("host") || "";
  const embedded = url.searchParams.get("embedded") === "1";
  const companyId =
    String(url.searchParams.get("companyId") || "").trim() ||
    getStoredCompanyId(request) ||
    (await getLinkedCompanyIdForShop(session.shop));
  const cancelRequested = url.searchParams.get("cancel") === "1";
  const requestQuery = url.searchParams.toString();

  const { appSubscriptions } = await billing.check({
    plans: SHOPIFY_PAID_PLAN_KEYS,
    isTest: SHOPIFY_BILLING_TEST_MODE,
  });

  if (cancelRequested && appSubscriptions[0]) {
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

    const redirectParams = new URLSearchParams(url.searchParams);
    redirectParams.delete("cancel");
    redirectParams.delete("billing");
    redirectParams.set("shop", session.shop);
    throw redirect(`/app/billing?${redirectParams.toString()}`);
  }

  const currentPlan = appSubscriptions[0] || null;
  const currentPlanInterval = currentPlan?.lineItems?.[0]?.plan?.pricingDetails?.interval || "";
  const currentPlanCycle = String(currentPlanInterval).toUpperCase().includes("ANNUAL") ? "yearly" : "monthly";
  const currentPlanKey =
    Object.entries(SHOPIFY_BILLING_PLANS).find(([, plan]) => {
      const planCycle = String(plan.interval).toUpperCase().includes("ANNUAL") ? "yearly" : "monthly";
      return ((planCycle === currentPlanCycle && plan.label === currentPlan?.name) || plan.backendPlanKey === currentPlan?.name);
    })?.[0] || "";
  const billingSuccess = url.searchParams.get("billing") === "success";
  const chargeId = url.searchParams.get("charge_id") || url.searchParams.get("subscription_id") || url.searchParams.get("billing_id") || "";
  const verificationRequested = Boolean(billingSuccess || chargeId);
  let backendSyncStatus = "";
  let pricingCatalog = null;
  let backendStatus = null;

  if (currentPlan) {
    try {
      await syncShopifySubscription({
        admin,
        companyId,
        appSubscription: currentPlan,
        eventType: billingSuccess ? "subscription_approved" : "subscription_checked",
        eventId: chargeId || `subscription-active:${currentPlan.id}`,
      });
      backendSyncStatus = "success";
    } catch {
      backendSyncStatus = "failed";
    }
  }

  try {
    pricingCatalog = await fetchShopifyPricingCatalog();
  } catch {
    pricingCatalog = null;
  }

  try {
    backendStatus = await fetchShopifySubscriptionStatus({ companyId, customerId: session.shop });
  } catch {
    backendStatus = null;
  }

  const backendSubscription = backendStatus?.subscription || null;
  const backendProducts = Object.values(pricingCatalog?.products || {});
  const backendDisplayPlan = backendProducts.find((product) => String(product?.id || "") === String(backendSubscription?.plan_id || "")) || null;
  const backendDisplayCycle = String(backendSubscription?.billing_cycle || "").toLowerCase().includes("year") ? "yearly" : "monthly";
  const backendDisplayPlanKey = backendDisplayPlan ? (backendDisplayCycle === "yearly" ? backendDisplayPlan.shopify_plan_key_yearly : backendDisplayPlan.shopify_plan_key_monthly) || "" : "";
  const displayCurrentPlanKey = backendDisplayPlanKey || currentPlanKey;
  const displayCurrentPlanCycle = backendDisplayPlanKey ? backendDisplayCycle : currentPlanCycle;
  const shouldClearQuery = Boolean(currentPlan && verificationRequested && backendSyncStatus === "success");

  return {
    billingPlans: SHOPIFY_BILLING_PLANS,
    pricingCatalog,
    currentPlan,
    currentPlanKey,
    currentPlanCycle,
    displayCurrentPlanKey,
    displayCurrentPlanCycle,
    backendSubscription,
    sessionShop: session.shop,
    companyId,
    host,
    embedded,
    requestQuery,
    backendSyncStatus,
    verificationRequested,
    shouldClearQuery,
    hasLinkedCompany: Boolean(companyId),
  };
};

export default function BillingPage() {
  const {
    currentPlan,
    currentPlanCycle,
    displayCurrentPlanKey,
    displayCurrentPlanCycle,
    billingPlans,
    pricingCatalog,
    backendSubscription,
    sessionShop,
    companyId,
    host,
    embedded,
    requestQuery,
    backendSyncStatus,
    verificationRequested,
    shouldClearQuery,
    hasLinkedCompany,
  } = useLoaderData();
  const navigate = useNavigate();
  const hasAuthenticatedIframeSession = useShopifyIframeSession();
  const viewportWidth = useViewportWidth();
  const [billingCycle, setBillingCycle] = useState(displayCurrentPlanCycle || currentPlanCycle || "monthly");
  const hasBackendRecognizedPlan = Boolean(backendSubscription && displayCurrentPlanKey);
  const baseQuery = `shop=${encodeURIComponent(sessionShop)}${host ? `&host=${encodeURIComponent(host)}` : ""}${embedded ? "&embedded=1" : ""}${companyId ? `&companyId=${encodeURIComponent(companyId)}` : ""}`;
  const subscribeQuery = useMemo(() => {
    const params = new URLSearchParams(requestQuery);
    params.set("shop", sessionShop);
    if (host) params.set("host", host);
    if (embedded) params.set("embedded", "1");
    params.delete("billing");
    return params.toString();
  }, [embedded, host, requestQuery, sessionShop]);
  const {
    showLinkedAccountGate,
    showSuccessBanner,
    setShowSuccessBanner,
    showWarningBanner,
    setShowWarningBanner,
    verificationState,
    verificationMessage,
  } = useBillingVerification({
    verificationRequested,
    hasLinkedCompany,
    hasAuthenticatedIframeSession,
    backendSyncStatus,
    hasBackendRecognizedPlan,
    shouldClearQuery,
    baseQuery,
    navigate,
  });

  useEffect(() => {
    setBillingCycle(displayCurrentPlanCycle || currentPlanCycle || "monthly");
  }, [currentPlanCycle, displayCurrentPlanCycle]);

  const backendProducts = Object.values(pricingCatalog?.products || {});
  const recommendedPlan = normalizePlanKey(pricingCatalog?.recommended_plan);
  const specialDiscountText = String(pricingCatalog?.special_event_discount_tag?.text || "").trim();
  const planCards = useMemo(
    () => {
      const activePlanKeys =
        billingCycle === "yearly"
          ? [STARTER_YEARLY_PLAN, CREATOR_YEARLY_PLAN]
          : [STARTER_MONTHLY_PLAN, CREATOR_MONTHLY_PLAN];

      return buildPlanCards({
        activePlanKeys,
        billingPlans,
        backendProducts,
        billingCycle,
        displayCurrentPlanKey,
        hasLinkedCompany,
        hasAuthenticatedIframeSession,
        backendSubscription,
        currentPlan,
        recommendedPlan,
        showLinkedAccountGate,
      }).map((plan) => ({
        ...plan,
        subscribeHref: `/app/billing/request?plan=${encodeURIComponent(plan.key)}&${subscribeQuery}`,
      }));
    },
    [
      backendProducts,
      backendSubscription,
      billingCycle,
      billingPlans,
      currentPlan,
      displayCurrentPlanKey,
      hasAuthenticatedIframeSession,
      hasLinkedCompany,
      recommendedPlan,
      showLinkedAccountGate,
      subscribeQuery,
    ],
  );
  const showDesktopThreeColumnLayout = viewportWidth >= 1024;

  return (
    <Page fullWidth backAction={{ content: "Home", onAction: () => navigate(`/app?${baseQuery}`) }}>
      <div style={{ minHeight: "calc(100dvh - 56px)", background: "#F5F5F7", margin: "-16px", padding: "24px 24px 40px" }}>
        <div style={{ width: "100%", maxWidth: 1320, margin: "0 auto" }}>
          <BillingHeader currentPlan={currentPlan} showLinkedAccountGate={showLinkedAccountGate} subscribeQuery={subscribeQuery} />

          {verificationRequested && verificationState === "checking" ? <BillingNotice tone="info" title="Verifying subscription" message={verificationMessage} /> : null}
          {showSuccessBanner ? <BillingNotice tone="success" title="Subscription activated" message="Your subscription is active and synced successfully." action={<button type="button" onClick={() => setShowSuccessBanner(false)} style={{ border: "none", background: "transparent", color: "#166534", fontSize: 20, lineHeight: 1, cursor: "pointer" }} aria-label="Dismiss success notice">×</button>} /> : null}
          {showWarningBanner ? (
            <BillingNotice
              tone="warning"
              title={showLinkedAccountGate ? "Clipwise account not linked" : verificationState === "failed" ? "Subscription verification failed" : "Subscription verification pending"}
              message={verificationMessage || "The Shopify plan became active, but backend sync did not complete cleanly."}
              action={
                <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
                  {showLinkedAccountGate ? <button type="button" onClick={() => navigate(`/app?${baseQuery}`)} style={{ height: 40, borderRadius: 999, border: "1px solid #F59E0B", background: "#ffffff", color: "#92400E", padding: "0 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Go to app home</button> : null}
                  <button type="button" onClick={() => setShowWarningBanner(false)} style={{ border: "none", background: "transparent", color: "#92400E", fontSize: 20, lineHeight: 1, cursor: "pointer" }} aria-label="Dismiss warning notice">×</button>
                </div>
              }
            />
          ) : null}

          <BillingHero billingCycle={billingCycle} onBillingCycleChange={setBillingCycle} specialDiscountText={specialDiscountText} />
          <BillingPlanCards planCards={planCards} showDesktopThreeColumnLayout={showDesktopThreeColumnLayout} baseQuery={baseQuery} />
        </div>
      </div>
    </Page>
  );
}
