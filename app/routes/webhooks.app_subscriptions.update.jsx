import { authenticate } from "../shopify.server";
import {
  cancelShopifySubscription,
  fetchActiveAppSubscriptions,
  syncShopifySubscription,
} from "../shopify-backend.server";

function getWebhookSubscriptionId(payload) {
  return (
    payload?.admin_graphql_api_id ||
    payload?.id ||
    payload?.app_subscription?.admin_graphql_api_id ||
    payload?.app_subscription?.id ||
    null
  );
}

function getWebhookStatus(payload) {
  return String(
    payload?.status ||
      payload?.app_subscription?.status ||
      "",
  ).toUpperCase();
}

function buildWebhookEventId({ shop, subscription, webhookSubscriptionId, webhookStatus }) {
  const subscriptionId = webhookSubscriptionId || subscription?.id || "unknown";
  const periodEnd = subscription?.currentPeriodEnd || "none";
  const status = webhookStatus || subscription?.status || "UNKNOWN";
  return `app-subscriptions-update:${shop}:${subscriptionId}:${status}:${periodEnd}`;
}

function getSyncEventType(webhookStatus) {
  const normalized = String(webhookStatus || "").toUpperCase();
  if (normalized === "ACTIVE" || normalized === "ACCEPTED") {
    return "subscription_approved";
  }
  return "subscription_updated";
}

export const action = async ({ request }) => {
  const { shop, topic, admin, payload } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (!admin) {
    return new Response();
  }

  const webhookSubscriptionId = getWebhookSubscriptionId(payload);
  const webhookStatus = getWebhookStatus(payload);

  try {
    const activeSubscriptions = await fetchActiveAppSubscriptions(admin);
    const matchingActiveSubscription =
      activeSubscriptions.find((subscription) => {
        return subscription.id === webhookSubscriptionId;
      }) || activeSubscriptions[0];

    if (matchingActiveSubscription && webhookStatus !== "CANCELLED") {
      await syncShopifySubscription({
        admin,
        appSubscription: matchingActiveSubscription,
        eventType: getSyncEventType(webhookStatus || matchingActiveSubscription?.status),
        eventId: buildWebhookEventId({
          shop,
          subscription: matchingActiveSubscription,
          webhookSubscriptionId,
          webhookStatus,
        }),
        source: "shopify_webhook",
      });
    } else {
      await cancelShopifySubscription({
        admin,
        subscriptionId: webhookSubscriptionId,
        eventType: "subscription_updated",
        eventId:
          webhookSubscriptionId || `app-subscriptions-update:${shop}:cancelled`,
        source: "shopify_webhook",
      });
    }
  } catch (error) {
    console.error("Failed to sync Shopify app subscription update:", error);
    return new Response("Webhook sync failed", { status: 500 });
  }

  return new Response();
};
