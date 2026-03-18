import { authenticate } from "../shopify.server";
import { syncShopifyStoreConnection } from "../shopify-backend.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const payload = await request.json();
  const companyId = payload?.companyId;
  const userId = payload?.userId;

  if (!companyId && !userId) {
    return Response.json({ error: "companyId or userId is required." }, { status: 400 });
  }

  try {
    const result = await syncShopifyStoreConnection({
      admin,
      companyId,
      userId,
      installStatus: "installed",
      meta: {
        source: "embedded_clipwise_auth",
      },
    });
    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json(
      {
        error: error?.message || "Failed to sync Shopify store connection.",
      },
      { status: error?.status || 500 },
    );
  }
};
