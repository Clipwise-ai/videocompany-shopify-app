import { useMemo } from "react";
import { useLoaderData, useNavigate } from "react-router";
import { Banner, BlockStack, Box, Button, Card, InlineStack, Page, Text } from "@shopify/polaris";
import { SHOPIFY_BILLING_TEST_MODE } from "../billing-mode.server";
import { authenticate } from "../shopify.server";
import { SHOPIFY_BILLING_PLANS, SHOPIFY_PAID_PLAN_KEYS } from "../billing.config.server";
import { syncShopifySubscription } from "../shopify-backend.server";

export const loader = async ({ request }) => {
  const { admin, billing, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const host = url.searchParams.get("host") || "";
  const embedded = url.searchParams.get("embedded") === "1";
  const planKey = url.searchParams.get("plan") || "";
  const chargeId =
    url.searchParams.get("charge_id") ||
    url.searchParams.get("subscription_id") ||
    url.searchParams.get("billing_id") ||
    "";

  console.log("[billing.confirm] confirm route hit", {
    shop: session.shop,
    requestUrl: request.url,
    host,
    embedded,
    planKey,
    chargeId,
    search: url.search,
  });

  const { appSubscriptions } = await billing.check({
    plans: SHOPIFY_PAID_PLAN_KEYS,
    isTest: SHOPIFY_BILLING_TEST_MODE,
  });

  const currentPlan = appSubscriptions[0] || null;
  console.log("[billing.confirm] billing.check result", {
    shop: session.shop,
    appSubscriptionsCount: appSubscriptions.length,
    currentPlanId: currentPlan?.id || null,
    currentPlanName: currentPlan?.name || null,
    currentPlanStatus: currentPlan?.status || null,
  });
  let backendSyncStatus = "pending";
  let backendSyncError = "";

  if (currentPlan) {
    try {
      await syncShopifySubscription({
        admin,
        appSubscription: currentPlan,
        eventType: "subscription_approved",
        eventId: chargeId || `subscription-approved:${currentPlan.id}`,
      });
      backendSyncStatus = "success";
      console.log("[billing.confirm] backend sync success", {
        shop: session.shop,
        subscriptionId: currentPlan.id,
        subscriptionName: currentPlan.name,
      });
    } catch (error) {
      backendSyncStatus = "failed";
      backendSyncError = error?.message || "Backend sync did not complete cleanly.";
      console.error("[billing.confirm] backend sync failed", {
        shop: session.shop,
        subscriptionId: currentPlan?.id || null,
        error: error?.message || String(error),
      });
    }
  } else {
    backendSyncStatus = "missing_subscription";
    backendSyncError = "Shopify did not report an active subscription after approval.";
    console.warn("[billing.confirm] no active subscription after approval", {
      shop: session.shop,
      planKey,
      chargeId,
    });
  }

  return {
    sessionShop: session.shop,
    host,
    embedded,
    currentPlan,
    requestedPlan: SHOPIFY_BILLING_PLANS[planKey] || null,
    backendSyncStatus,
    backendSyncError,
  };
};

export default function BillingConfirmPage() {
  const {
    sessionShop,
    host,
    embedded,
    currentPlan,
    requestedPlan,
    backendSyncStatus,
    backendSyncError,
  } = useLoaderData();
  const navigate = useNavigate();

  const baseQuery = useMemo(
    () =>
      `shop=${encodeURIComponent(sessionShop)}${host ? `&host=${encodeURIComponent(host)}` : ""}${
        embedded ? "&embedded=1" : ""
      }`,
    [embedded, host, sessionShop],
  );

  const title =
    backendSyncStatus === "success"
      ? "Payment verified"
      : backendSyncStatus === "failed"
        ? "Payment approved with sync issue"
        : "Payment status unclear";

  return (
    <Page title="Billing confirmation">
      <BlockStack gap="500">
        <Card>
          <BlockStack gap="400">
            <Text as="h1" variant="headingLg">
              {title}
            </Text>
            <Text as="p" tone="subdued">
              {backendSyncStatus === "success"
                ? "Your Shopify subscription is active and backend verification completed."
                : backendSyncStatus === "failed"
                  ? "Shopify approved the subscription, but backend verification did not complete cleanly."
                  : "We could not confirm an active Shopify subscription after approval."}
            </Text>

            {backendSyncStatus === "success" ? (
              <Banner title="Subscription verified" tone="success">
                <p>
                  {currentPlan?.name || requestedPlan?.label || "Your plan"} is active. You can now go back to the app or review billing.
                </p>
              </Banner>
            ) : (
              <Banner title="Verification needed" tone="warning">
                <p>{backendSyncError}</p>
              </Banner>
            )}

            <Box paddingBlockStart="200">
              <InlineStack gap="300">
                <Button variant="primary" onClick={() => navigate(`/app?${baseQuery}`)}>
                  Go to home
                </Button>
                <Button onClick={() => navigate(`/app/billing?${baseQuery}`)}>
                  Back to billing
                </Button>
              </InlineStack>
            </Box>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
