import { redirect } from "react-router";
import { createPendingBillingAttemptCookie } from "../billing-attempt.server";
import { getPublicAppUrl } from "../app-url.server";
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
  const companyId =
    String(params.get("companyId") || "").trim() ||
    getStoredCompanyId(request) ||
    (await getLinkedCompanyIdForShop(session.shop));
  params.delete("plan");

  if (!SHOPIFY_BILLING_PLANS[planKey]) {
    throw new Response("Invalid Shopify plan.", { status: 400 });
  }

  if (!companyId) {
    params.set("shop", session.shop);
    return redirect(`/app/billing?${params.toString()}`);
  }

  params.set("shop", session.shop);
  params.delete("billing");

  const returnParams = new URLSearchParams();
  returnParams.set("billing", "success");
  if (planKey) {
    returnParams.set("plan", planKey);
  }
  const publicAppUrl = getPublicAppUrl(request);
  const returnUrlBase = publicAppUrl;
  const returnUrlPath = `/app/billing?${returnParams.toString()}`;
  const returnUrl = new URL(
    returnUrlPath,
    `${returnUrlBase}/`,
  ).toString();

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

  if (isSamePlanActive) {
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
    if (error instanceof Response) {
      const headers = new Headers(error.headers);
      headers.append(
        "Set-Cookie",
        createPendingBillingAttemptCookie({
          shop: session.shop,
          companyId,
          planKey,
        }),
      );
      return new Response(error.body, {
        status: error.status,
        statusText: error.statusText,
        headers,
      });
    }
    throw error;
  }

  return redirect(
    `/app/billing?${params.toString()}`,
  );
};
