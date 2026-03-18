import { redirect } from "react-router";
import { SHOPIFY_BILLING_TEST_MODE } from "../billing-mode.server";
import { SHOPIFY_BILLING_PLANS } from "../billing.config.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const params = new URLSearchParams(url.searchParams);
  const planKey = String(params.get("plan") || "").trim();
  const host = String(params.get("host") || "").trim();
  const embedded = params.get("embedded") === "1";
  params.delete("plan");

  if (!SHOPIFY_BILLING_PLANS[planKey]) {
    throw new Response("Invalid Shopify plan.", { status: 400 });
  }

  params.set("shop", session.shop);
  params.delete("billing");

  const returnParams = new URLSearchParams();
  returnParams.set("billing", "success");
  returnParams.set("shop", session.shop);
  if (planKey) {
    returnParams.set("plan", planKey);
  }
  if (host) {
    returnParams.set("host", host);
  }
  if (embedded) {
    returnParams.set("embedded", "1");
  }

  const returnUrl = new URL(
    `/app/billing/confirm?${returnParams.toString()}`,
    request.url,
  ).toString();

  await billing.request({
    plan: planKey,
    isTest: SHOPIFY_BILLING_TEST_MODE,
    returnUrl,
  });

  return redirect(
    `/app/billing?${params.toString()}`,
  );
};
