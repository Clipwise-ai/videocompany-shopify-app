import { createCompanyIdCookie } from "../company-id.server";
import { persistShopLink } from "../shop-link.server";
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const payload = await request.json();
  const companyId = String(payload?.companyId || "").trim();
  const userId = String(payload?.userId || "").trim();

  console.log("[store-link] action hit", {
    shop: session.shop,
    companyId,
    userId,
  });

  if (!companyId && !userId) {
    return Response.json({ error: "companyId or userId is required." }, { status: 400 });
  }

  await persistShopLink({
    shop: session.shop,
    companyId,
    userId,
  });

  console.log("[store-link] persisted", {
    shop: session.shop,
    companyId,
    userId,
  });

  return Response.json(
    { success: true, companyId, userId },
    {
      headers: companyId
        ? {
            "Set-Cookie": createCompanyIdCookie(companyId),
          }
        : undefined,
    },
  );
};
