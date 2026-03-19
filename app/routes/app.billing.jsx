import { useEffect, useRef, useState } from "react";
import { redirect, useLoaderData, useNavigate } from "react-router";
import { Banner, Button, Page } from "@shopify/polaris";
import { SHOPIFY_BILLING_TEST_MODE } from "../billing-mode.server";
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
  fetchShopifyPricingCatalog,
  syncShopifySubscription,
} from "../shopify-backend.server";

const PLAN_LABELS = {
  lite_v2: "Starter",
  starter: "Starter",
  pro_v2: "Creator",
  creator: "Creator",
  studio_v2: "Business",
};

function normalizePlanKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_v\d+$/, "")
    .replace(/\s+/g, "_");
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatPriceValue(value) {
  const numericValue = toNumber(value);
  if (numericValue == null) return "0";
  return Number.isInteger(numericValue)
    ? numericValue.toString()
    : numericValue.toFixed(2).replace(/\.?0+$/, "");
}

function buildFeaturesForPlan(plan) {
  const normalizedKey = normalizePlanKey(plan?.name || plan?.id);

  if (normalizedKey === "lite" || normalizedKey === "starter") {
    return [
      `${plan.credit_units} credits / month`,
      "Video length: Upto 2 min",
      "UGC videos (product + AI actor)",
      "Talking avatar videos (1000+ actors)",
      "Product shoot images & videos",
      "Model + product shoots (200+ poses)",
      "No watermark",
    ];
  }

  if (normalizedKey === "pro" || normalizedKey === "creator") {
    return [
      `${plan.credit_units} credits / month`,
      "Everything in Starter",
      "Video length: Upto 5 min",
      "Custom actor creation",
      "Brand-specific actor & asset curation",
      "Advanced Ad Agent (high-converting formats)",
      "On-demand actor additions",
      "Priority on-call support",
      "Faster rendering",
    ];
  }

  return [
    `${plan.credit_units} credits / month`,
    `~${plan.approx_videos} videos/month`,
    "Priority generation",
    "Priority support within one hour",
    "General commercial terms",
  ];
}

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
  const currentPlanCycle =
    String(currentPlanInterval).toUpperCase().includes("ANNUAL") ? "yearly" : "monthly";
  const currentPlanKey =
    Object.entries(SHOPIFY_BILLING_PLANS).find(([, plan]) => {
      const planCycle = String(plan.interval).toUpperCase().includes("ANNUAL")
        ? "yearly"
        : "monthly";
      return (
        (planCycle === currentPlanCycle && plan.label === currentPlan?.name) ||
        plan.backendPlanKey === currentPlan?.name
      );
    })?.[0] || "";
  const billingSuccess = url.searchParams.get("billing") === "success";
  const chargeId =
    url.searchParams.get("charge_id") ||
    url.searchParams.get("subscription_id") ||
    url.searchParams.get("billing_id") ||
    "";
  console.log("[billing.page] billing page loader hit", {
    shop: session.shop,
    requestUrl: request.url,
    billingSuccess,
    chargeId,
    planParam: url.searchParams.get("plan") || "",
    search: url.search,
  });
  const verificationRequested = Boolean(billingSuccess || chargeId);
  let backendSyncStatus = "";
  let pricingCatalog = null;

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
      console.log("[billing.page] backend sync success from billing page", {
        shop: session.shop,
        subscriptionId: currentPlan.id,
        subscriptionName: currentPlan.name,
      });
    } catch (error) {
      backendSyncStatus = "failed";
      console.error("[billing.page] backend sync failed from billing page", {
        shop: session.shop,
        subscriptionId: currentPlan?.id || null,
        companyId,
        error: error?.message || null,
        status: error?.status || null,
        payload: error?.payload || null,
      });
    }
  }

  try {
    pricingCatalog = await fetchShopifyPricingCatalog();
  } catch {
    pricingCatalog = null;
  }

  const shouldClearQuery = Boolean(
    currentPlan &&
    verificationRequested &&
    backendSyncStatus === "success",
  );

  return {
    billingPlans: SHOPIFY_BILLING_PLANS,
    pricingCatalog,
    currentPlan,
    currentPlanKey,
    currentPlanCycle,
    sessionShop: session.shop,
    companyId,
    host,
    embedded,
    requestQuery,
    backendSyncStatus,
    verificationRequested,
    shouldClearQuery,
  };
};

export default function BillingPage() {
  const {
    currentPlan,
    currentPlanKey,
    currentPlanCycle,
    billingPlans,
    pricingCatalog,
    sessionShop,
    companyId,
    host,
    embedded,
    requestQuery,
    backendSyncStatus,
    verificationRequested,
    shouldClearQuery,
  } =
    useLoaderData();
  const navigate = useNavigate();
  const [showSuccessBanner, setShowSuccessBanner] = useState(
    verificationRequested ? false : backendSyncStatus === "success",
  );
  const [showWarningBanner, setShowWarningBanner] = useState(
    verificationRequested ? false : backendSyncStatus === "failed",
  );
  const [billingCycle, setBillingCycle] = useState(currentPlanCycle || "monthly");
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth,
  );
  const [verificationState, setVerificationState] = useState(() => {
    if (!verificationRequested) {
      return "idle";
    }
    if (backendSyncStatus === "success") {
      return "success";
    }
    return "checking";
  });
  const [verificationMessage, setVerificationMessage] = useState(() => {
    if (!verificationRequested) return "";
    if (backendSyncStatus === "success") {
      return "Your Shopify subscription is active and synced successfully.";
    }
    return "We are verifying your Shopify subscription and syncing access.";
  });
  const pollingAttemptsRef = useRef(0);
  const timeoutRef = useRef(null);

  const handleBillingCycleChange = (nextCycle) => setBillingCycle(nextCycle);

  const baseQuery = `shop=${encodeURIComponent(sessionShop)}${host ? `&host=${encodeURIComponent(host)}` : ""}${
    embedded ? "&embedded=1" : ""
  }${companyId ? `&companyId=${encodeURIComponent(companyId)}` : ""}`;
  const subscribeQuery = (() => {
    const params = new URLSearchParams(requestQuery);
    params.set("shop", sessionShop);
    if (host) {
      params.set("host", host);
    }
    if (embedded) {
      params.set("embedded", "1");
    }
    params.delete("billing");
    return params.toString();
  })();

  useEffect(() => {
    setShowSuccessBanner(backendSyncStatus === "success");
    setShowWarningBanner(backendSyncStatus === "failed");
  }, [backendSyncStatus]);

  useEffect(() => {
    if (!verificationRequested) {
      setVerificationState("idle");
      setVerificationMessage("");
      return;
    }

    if (backendSyncStatus === "success") {
      setVerificationState("success");
      setVerificationMessage("Your Shopify subscription is active and synced successfully.");
    } else {
      setVerificationState("checking");
      setVerificationMessage("We are verifying your Shopify subscription and syncing access.");
    }
  }, [backendSyncStatus, verificationRequested]);

  useEffect(() => {
    if (!shouldClearQuery) return;
    navigate(`/app/billing?${baseQuery}`, { replace: true });
  }, [baseQuery, navigate, shouldClearQuery]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!verificationRequested) return undefined;
    if (verificationState === "success" || verificationState === "failed" || verificationState === "pending") {
      return undefined;
    }

    let cancelled = false;
    pollingAttemptsRef.current = 0;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/app/billing/status?${baseQuery}`, {
          credentials: "same-origin",
          headers: {
            Accept: "application/json",
          },
        });
        const payload = await response.json();
        if (cancelled) return;

        if (payload.verificationState === "success") {
          setVerificationState("success");
          setVerificationMessage("Your Shopify subscription is active and synced successfully.");
          setShowSuccessBanner(true);
          setShowWarningBanner(false);
          navigate(`/app/billing?${baseQuery}`, { replace: true });
          return;
        }

        if (payload.verificationState === "failed") {
          setVerificationState("failed");
          setVerificationMessage(
            "We could not confirm an active Shopify subscription. If you were charged, refresh once or contact support.",
          );
          setShowSuccessBanner(false);
          setShowWarningBanner(true);
          return;
        }

        if (payload.verificationState === "pending") {
          setVerificationState("checking");
          setVerificationMessage(
            payload.syncError ||
              "Shopify approved the plan, but backend verification is still finishing.",
          );
        }
      } catch {
        if (cancelled) return;
        setVerificationMessage("We are still checking the latest Shopify billing status.");
      }
    };

    pollStatus();
    const intervalId = window.setInterval(() => {
      pollingAttemptsRef.current += 1;
      pollStatus();
    }, 3000);

    timeoutRef.current = window.setTimeout(() => {
      if (cancelled) return;
      setVerificationState("pending");
      setVerificationMessage(
        "Your payment may still be processing. Please refresh in a moment. If Shopify charged you, access should sync shortly.",
      );
      setShowSuccessBanner(false);
      setShowWarningBanner(true);
      window.clearInterval(intervalId);
    }, 45000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [baseQuery, navigate, verificationRequested, verificationState]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setBillingCycle(currentPlanCycle || "monthly");
  }, [currentPlanCycle]);

  const activePlanKeys =
    billingCycle === "yearly"
      ? [STARTER_YEARLY_PLAN, CREATOR_YEARLY_PLAN]
      : [STARTER_MONTHLY_PLAN, CREATOR_MONTHLY_PLAN];

  const backendProducts = Object.values(pricingCatalog?.products || {});
  const recommendedPlan = normalizePlanKey(pricingCatalog?.recommended_plan);
  const specialDiscountText = String(pricingCatalog?.special_event_discount_tag?.text || "").trim();

  const findBackendPlanForKey = (planKey, planConfig) => {
    const normalizedLabel = normalizePlanKey(planConfig?.label);
    return (
      backendProducts.find((product) => {
        const cycleKey =
          billingCycle === "yearly"
            ? product?.shopify_plan_key_yearly
            : product?.shopify_plan_key_monthly;
        return cycleKey === planKey;
      }) ||
      backendProducts.find((product) => normalizePlanKey(product?.name) === normalizedLabel) ||
      null
    );
  };

  const planCards = activePlanKeys.map((planKey, index) => {
    const plan = billingPlans[planKey];
    const backendPlan = findBackendPlanForKey(planKey, plan);
    const isCurrent = currentPlanKey === planKey;
    const isPopular = backendPlan
      ? normalizePlanKey(backendPlan.name) === recommendedPlan
      : index === 1;
    const displayAmount = backendPlan
      ? billingCycle === "yearly"
        ? toNumber(backendPlan.yearly_per_month_price) ?? toNumber(plan.yearlyAmount) ?? toNumber(plan.amount) / 12
        : toNumber(backendPlan.monthly_discounted_price) ?? toNumber(backendPlan.monthly_price) ?? toNumber(plan.amount)
      : billingCycle === "yearly"
        ? toNumber(plan.yearlyAmount) ?? toNumber(plan.amount) / 12
        : toNumber(plan.amount);
    const yearlyTotal = backendPlan
      ? billingCycle === "yearly"
        ? toNumber(backendPlan.yearly_discounted_price) ?? toNumber(backendPlan.yearly_price)
        : null
      : billingCycle === "yearly"
        ? toNumber(plan.amount)
        : null;

    return {
      key: planKey,
      label:
        backendPlan?.shopify_display_plan_name ||
        backendPlan?.display_name ||
        PLAN_LABELS[normalizePlanKey(backendPlan?.name)] ||
        plan.label,
      priceDisplay: formatPriceValue(displayAmount),
      yearlyTotalDisplay: yearlyTotal == null ? null : formatPriceValue(yearlyTotal),
      description: `*Up to ${backendPlan?.approx_videos || (plan.label === "Starter" ? 15 : 65)} Videos per month`,
      features: backendPlan ? buildFeaturesForPlan(backendPlan) : plan.features,
      isCurrent,
      isPopular,
      subscribeHref: `/app/billing/request?plan=${encodeURIComponent(planKey)}&${subscribeQuery}`,
    };
  });

  const showDesktopThreeColumnLayout = viewportWidth >= 1024;
  const pricingLayoutStyle = showDesktopThreeColumnLayout
    ? {
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        justifyItems: "center",
        alignItems: "stretch",
        gap: 0,
        marginTop: 56,
      }
    : {
        display: "flex",
        justifyContent: "center",
        flexWrap: "wrap",
        alignItems: "stretch",
        gap: 0,
        marginTop: 56,
      };

  return (
    <Page
      fullWidth
      title="Billing"
      backAction={{ content: "Home", onAction: () => navigate(`/app?${baseQuery}`) }}
    >
      <div
        style={{
          minHeight: "calc(100dvh - 56px)",
          background: "#F5F5F7",
          margin: "-16px",
          padding: "24px 0 0",
        }}
      >
        <div style={{ width: "100%", margin: 0 }}>
        {verificationRequested && verificationState === "checking" ? (
          <Banner title="Verifying subscription" tone="info">
            <p>{verificationMessage}</p>
          </Banner>
        ) : null}
        {showSuccessBanner ? (
          <Banner
            title="Subscription activated"
            tone="success"
            onDismiss={() => setShowSuccessBanner(false)}
          >
            <p>Your subscription is active and synced successfully.</p>
          </Banner>
        ) : null}
        {showWarningBanner ? (
          <Banner
            title={
              verificationState === "failed"
                ? "Subscription verification failed"
                : "Subscription verification pending"
            }
            tone="warning"
            onDismiss={() => setShowWarningBanner(false)}
          >
            <p>{verificationMessage || "The Shopify plan became active, but backend sync did not complete cleanly."}</p>
          </Banner>
        ) : null}
        <section style={{ textAlign: "center", padding: "28px 0 20px" }}>
          <h1
            style={{
              margin: "0 0 12px",
              fontSize: "clamp(34px, 5vw, 56px)",
              lineHeight: 1.02,
              fontWeight: 600,
              color: "#111827",
              letterSpacing: "-0.04em",
            }}
          >
            Our Pricing Plan
          </h1>
          <p
            style={{
              maxWidth: 700,
              margin: "0 auto",
              fontSize: "clamp(16px, 2vw, 18px)",
              lineHeight: 1.4,
              color: "#6B7280",
              fontWeight: 500,
            }}
          >
            Choose the plan that fits your needs. You can always update it later.
          </p>

          <div
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              marginTop: 32,
              justifyContent: "center",
              width: 400,
              maxWidth: "100%",
              isolation: "isolate",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0,
                padding: 4,
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                background: "#ffffff",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
                height: 56,
                position: "relative",
                zIndex: 5,
              }}
            >
              <button
                type="button"
                aria-pressed={billingCycle === "monthly"}
                onClick={() => handleBillingCycleChange("monthly")}
                style={{
                  appearance: "none",
                  WebkitAppearance: "none",
                  minWidth: 92,
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 18px",
                  background: billingCycle === "monthly" ? "#EEF2FF" : "transparent",
                  color: billingCycle === "monthly" ? "#4338CA" : "#6B7280",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  position: "relative",
                  zIndex: 3,
                }}
              >
                Monthly
              </button>
              <button
                type="button"
                aria-pressed={billingCycle === "yearly"}
                onClick={() => handleBillingCycleChange("yearly")}
                style={{
                  appearance: "none",
                  WebkitAppearance: "none",
                  minWidth: 92,
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 18px",
                  background: billingCycle === "yearly" ? "#EEF2FF" : "transparent",
                  color: billingCycle === "yearly" ? "#4338CA" : "#6B7280",
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: "pointer",
                  position: "relative",
                  zIndex: 3,
                }}
              >
                Yearly <span style={{ color: "#D1D5DB" }}>●</span>
              </button>
            </div>
            <div
              style={{
                position: "absolute",
                right: -38,
                top: 26,
                transform: "rotate(8deg)",
                background: "#4F46E5",
                color: "#fff",
                borderRadius: 12,
                padding: 4,
                fontSize: 12,
                fontWeight: 800,
                lineHeight: 1.15,
                boxShadow: "0 12px 24px rgba(79, 70, 229, 0.22)",
                pointerEvents: "none",
                zIndex: 1,
              }}
            >
              <div
                style={{
                  border: "1px solid rgba(255,255,255,0.9)",
                  borderRadius: 10,
                  padding: "10px 12px",
                  textAlign: "center",
                }}
              >
                {specialDiscountText ? specialDiscountText.toUpperCase() : "LIMITED TIME OFFER"}
                <br />
                60% OFF
              </div>
            </div>
          </div>
        </section>

        <section
          style={pricingLayoutStyle}
        >
          {planCards.map((plan) => (
            <div
              key={plan.key}
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                maxWidth: showDesktopThreeColumnLayout ? "100%" : 408,
              }}
            >
              <div style={{ position: "relative", width: "100%", maxWidth: 384, padding: "12px 12px", height: "100%" }}>
                {plan.isPopular ? (
                  <div style={{ position: "absolute", top: -4, right: 40, zIndex: 2 }}>
                    <div
                      style={{
                        background: "#ffffff",
                        border: "1px solid #C7D2FE",
                        borderRadius: 10,
                        padding: 3,
                        boxShadow: "0 8px 20px rgba(17, 24, 39, 0.06)",
                      }}
                    >
                      <div
                        style={{
                          background: "#4F46E5",
                          color: "#ffffff",
                          borderRadius: 8,
                          padding: "8px 16px",
                          fontSize: 13,
                          fontWeight: 600,
                        }}
                      >
                        Cheapest price
                      </div>
                    </div>
                  </div>
                ) : null}

                <div
                  style={{
                    height: "100%",
                    background: "#ffffff",
                    color: "#111827",
                    border: "2px solid #E5E7EB",
                    borderRadius: 40,
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
                    padding: "34px 28px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                  }}
                >
                  <div
                    style={{
                      marginLeft: "auto",
                      background: "#F5F7FF",
                      color: "#5B6BCF",
                      fontSize: 14,
                      fontWeight: 500,
                      borderRadius: 18,
                      padding: "8px 16px",
                      border: "1px solid #C7D2FE",
                    }}
                  >
                    {plan.label}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "flex", alignItems: "end", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 56, lineHeight: 0.95, fontWeight: 600, letterSpacing: "-0.05em" }}>
                        ${plan.priceDisplay}
                      </span>
                      <span style={{ fontSize: 28, lineHeight: 1, fontWeight: 500, color: "#6B7280" }}>
                        /mo
                      </span>
                    </div>
                    <div style={{ color: "#374151", fontSize: 16, fontWeight: 600, marginTop: -4 }}>
                      {plan.description}
                    </div>
                    {billingCycle === "yearly" ? (
                      <div style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.4 }}>
                        (Billed <span style={{ fontWeight: 700 }}>${plan.yearlyTotalDisplay}</span> yearly)
                      </div>
                    ) : null}
                  </div>

                  <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 2 }}>
                    {plan.isCurrent ? (
                      <button
                        type="button"
                        disabled
                        style={{
                          width: "100%",
                          height: 48,
                          borderRadius: 999,
                          border: "2px solid #E5E7EB",
                          background: "#F3F4F6",
                          color: "#9CA3AF",
                          fontSize: 16,
                          fontWeight: 500,
                          cursor: "not-allowed",
                        }}
                      >
                        Current Plan
                      </button>
                    ) : (
                      <a href={plan.subscribeHref} style={{ display: "block", width: "100%", textDecoration: "none" }}>
                        <button
                          type="button"
                          style={{
                            width: "100%",
                            height: 48,
                            borderRadius: 999,
                            border: plan.isPopular ? "2px solid #4F46E5" : "2px solid #C7D2FE",
                            background: plan.isPopular ? "#4F46E5" : "#ffffff",
                            color: plan.isPopular ? "#ffffff" : "#4F46E5",
                            fontSize: 16,
                            fontWeight: plan.isPopular ? 700 : 500,
                            cursor: "pointer",
                          }}
                        >
                          {plan.isPopular ? "Subscribe" : `Upgrade to ${plan.label}`}
                        </button>
                      </a>
                    )}
                  </div>

                  <ul style={{ display: "flex", flexDirection: "column", gap: 14, margin: 0, padding: 0, listStyle: "none", flexGrow: 1 }}>
                    {plan.features.map((feature) => (
                      <li key={feature} style={{ display: "flex", alignItems: "start", gap: 12, color: "#4B5563", fontSize: 16, lineHeight: 1.6 }}>
                        <span
                          aria-hidden="true"
                          style={{
                            marginTop: 4,
                            width: 20,
                            height: 20,
                            minWidth: 20,
                            borderRadius: 999,
                            background: "#EEF2FF",
                            color: "#4338CA",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 800,
                          }}
                        >
                          ✓
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              maxWidth: showDesktopThreeColumnLayout ? "100%" : 408,
            }}
          >
            <div style={{ position: "relative", width: "100%", maxWidth: 384, padding: "12px 12px", height: "100%" }}>
              <div
                style={{
                  height: "100%",
                  background: "#ffffff",
                  color: "#111827",
                  border: "2px solid #E5E7EB",
                  borderRadius: 40,
                  boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)",
                  padding: "34px 28px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                }}
              >
                <div
                  style={{
                    marginLeft: "auto",
                    background: "#F3F4F6",
                    color: "#6B7280",
                    fontSize: 14,
                    fontWeight: 500,
                    borderRadius: 18,
                    padding: "8px 16px",
                    border: "1px solid #E5E7EB",
                  }}
                >
                  Enterprise
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "end", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ visibility: "hidden", fontSize: 20, fontWeight: 500 }}>$0/mo</span>
                    <span style={{ fontSize: 56, lineHeight: 0.95, fontWeight: 600, letterSpacing: "-0.05em" }}>
                      Custom
                    </span>
                  </div>
                  <div style={{ color: "#374151", fontSize: 16, fontWeight: 600, marginTop: -4 }}>
                    *Tailored for your organization
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", fontSize: 16 }}>
                    <span style={{ marginRight: 8 }}>✉</span>
                    <span>sales@videocompany.ai</span>
                  </div>
                  <a
                    href="https://calendly.com/centraclienta/new-meeting"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", width: "100%", textDecoration: "none" }}
                  >
                    <button
                      type="button"
                      style={{
                        width: "100%",
                        height: 48,
                        borderRadius: 999,
                        border: "2px solid #C7D2FE",
                        background: "#ffffff",
                        color: "#4F46E5",
                        fontSize: 16,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Contact us
                    </button>
                  </a>
                </div>

                <ul style={{ display: "flex", flexDirection: "column", gap: 14, margin: 0, padding: 0, listStyle: "none", flexGrow: 1 }}>
                  {[
                    "Dedicated creative manager",
                    "Dedicated video editor",
                    "Fully managed creative execution",
                    "Custom actors & voices",
                    "Custom ad formats & templates",
                    "High-volume campaign support",
                    "API & workflow integrations",
                    "Done-for-you delivery",
                  ].map((feature) => (
                    <li key={feature} style={{ display: "flex", alignItems: "start", gap: 12, color: "#4B5563", fontSize: 16, lineHeight: 1.6 }}>
                      <span
                        aria-hidden="true"
                        style={{
                          marginTop: 4,
                          width: 20,
                          height: 20,
                          minWidth: 20,
                          borderRadius: 999,
                          background: "#EFF6FF",
                          color: "#60A5FA",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        ✓
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {currentPlan ? (
          <section
            style={{
              marginTop: 12,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <a
              href={`/app/billing?cancel=1&${subscribeQuery}`}
              style={{ display: "inline-block", textDecoration: "none" }}
            >
              <Button destructive>
                Cancel current plan
              </Button>
            </a>
          </section>
        ) : null}
        </div>
      </div>
    </Page>
  );
}
