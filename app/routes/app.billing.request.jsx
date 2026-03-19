import { redirect } from "react-router";
import { buildEmbeddedAdminAppUrl, getPublicAppUrl } from "../app-url.server";
import { SHOPIFY_BILLING_TEST_MODE } from "../billing-mode.server";
import { SHOPIFY_BILLING_PLANS, SHOPIFY_PAID_PLAN_KEYS } from "../billing.config.server";
import { getStoredCompanyId } from "../company-id.server";
import { getLinkedCompanyIdForShop } from "../shop-link.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const params = new URLSearchParams(url.searchParams);
  const planKey = String(params.get("plan") || "").trim();
  const host = String(params.get("host") || "").trim();
  const embedded = params.get("embedded") === "1";
  const companyId =
    String(params.get("companyId") || "").trim() ||
    getStoredCompanyId(request) ||
    (await getLinkedCompanyIdForShop(session.shop));
  params.delete("plan");

  if (!SHOPIFY_BILLING_PLANS[planKey]) {
    throw new Response("Invalid Shopify plan.", { status: 400 });
  }

  params.set("shop", session.shop);
  params.delete("billing");

  const returnParams = new URLSearchParams();
  returnParams.set("billing", "success");
  if (planKey) {
    returnParams.set("plan", planKey);
  }

  const publicAppUrl = getPublicAppUrl(request);
  const embeddedAppBaseUrl = buildEmbeddedAdminAppUrl(host);
  const returnUrlBase = publicAppUrl;
  const returnUrlPath = `/app/billing?${returnParams.toString()}`;
  const returnUrl = new URL(
    returnUrlPath,
    `${returnUrlBase}/`,
  ).toString();

  console.log("[billing.request] starting Shopify billing request", {
    shop: session.shop,
    planKey,
    host,
    embedded,
    requestUrl: request.url,
    publicAppUrl,
    embeddedAppBaseUrl,
    returnUrl,
    returnUrlLength: returnUrl.length,
  });

  const { appSubscriptions } = await billing.check({
    plans: SHOPIFY_PAID_PLAN_KEYS,
    isTest: SHOPIFY_BILLING_TEST_MODE,
  });
  const currentPlan = appSubscriptions[0] || null;
  const currentPlanInterval = currentPlan?.lineItems?.[0]?.plan?.pricingDetails?.interval || "";
  const requestedPlan = SHOPIFY_BILLING_PLANS[planKey];
  const requestedInterval = requestedPlan?.interval || "";
  const isSamePlanActive = Boolean(
    currentPlan &&
      currentPlan.name === requestedPlan?.label &&
      String(currentPlanInterval || "").toUpperCase() === String(requestedInterval || "").toUpperCase(),
  );

  console.log("[billing.request] active subscription snapshot", {
    shop: session.shop,
    requestedPlanKey: planKey,
    requestedPlanLabel: requestedPlan?.label || null,
    requestedInterval,
    currentPlanId: currentPlan?.id || null,
    currentPlanName: currentPlan?.name || null,
    currentPlanStatus: currentPlan?.status || null,
    currentPlanInterval,
    isSamePlanActive,
  });

  if (isSamePlanActive) {
    console.log("[billing.request] requested plan already active, redirecting back to billing", {
      shop: session.shop,
      planKey,
      currentPlanId: currentPlan?.id || null,
    });
    params.set("shop", session.shop);
    if (companyId) {
      params.set("companyId", companyId);
    }
    return redirect(`/app/billing?${params.toString()}`);
  }

  try {
    await billing.request({
      plan: planKey,
      isTest: SHOPIFY_BILLING_TEST_MODE,
      returnUrl,
    });
  } catch (error) {
    console.error("[billing.request] billing.request failed", {
      shop: session.shop,
      planKey,
      companyId,
      returnUrl,
      currentPlanId: currentPlan?.id || null,
      currentPlanName: currentPlan?.name || null,
      currentPlanStatus: currentPlan?.status || null,
      currentPlanInterval,
      message: error?.message || String(error),
      cause: error?.cause || null,
      stack: error?.stack || null,
    });
    throw error;
  }

  console.log("[billing.request] billing.request returned unexpectedly", {
    shop: session.shop,
    planKey,
    fallbackRedirect: `/app/billing?${params.toString()}`,
  });

  return redirect(
    `/app/billing?${params.toString()}`,
  );
};
