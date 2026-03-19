import prisma from "./db.server";

function normalizeShop(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeOptional(value) {
  const normalized = String(value || "").trim();
  return normalized || null;
}

function getShopLinkDelegate() {
  const delegate = prisma?.shopLink;
  if (!delegate) {
    console.warn("[shop-link] prisma.shopLink is unavailable. Restart the dev server after Prisma schema changes.");
    return null;
  }
  return delegate;
}

export async function persistShopLink({ shop, companyId, userId = null }) {
  const normalizedShop = normalizeShop(shop);
  const normalizedCompanyId = normalizeOptional(companyId);
  const shopLink = getShopLinkDelegate();

  if (!shopLink || !normalizedShop || !normalizedCompanyId) {
    return null;
  }

  return shopLink.upsert({
    where: { shop: normalizedShop },
    update: {
      companyId: normalizedCompanyId,
      userId: normalizeOptional(userId),
    },
    create: {
      shop: normalizedShop,
      companyId: normalizedCompanyId,
      userId: normalizeOptional(userId),
    },
  });
}

export async function getLinkedCompanyIdForShop(shop) {
  const normalizedShop = normalizeShop(shop);
  const shopLink = getShopLinkDelegate();
  if (!normalizedShop) {
    return "";
  }
  if (!shopLink) {
    return "";
  }

  const link = await shopLink.findUnique({
    where: { shop: normalizedShop },
    select: { companyId: true },
  });

  return String(link?.companyId || "").trim();
}
