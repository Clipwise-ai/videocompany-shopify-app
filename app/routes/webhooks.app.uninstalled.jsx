import { authenticate } from "../shopify.server";
import db from "../db.server";
import { cancelShopifySubscription } from "../shopify-backend.server";

export const action = async ({ request }) => {
  const { shop, session, topic, admin } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  if (admin) {
    try {
      await cancelShopifySubscription({
        admin,
        eventType: "app_uninstalled",
        eventId: `app-uninstalled:${shop}`,
      });
    } catch (error) {
      console.error("Failed to sync Shopify uninstall:", error);
    }
  }

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  return new Response();
};
