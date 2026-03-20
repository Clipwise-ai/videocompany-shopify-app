const LAST_SHOP_COOKIE_NAME = "clipwise_shopify_last_shop";
const LAST_SHOP_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function parseCookieHeader(cookieHeader) {
  return String(cookieHeader || "")
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((acc, part) => {
      const separatorIndex = part.indexOf("=");
      if (separatorIndex === -1) return acc;
      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      if (key) {
        acc[key] = value;
      }
      return acc;
    }, {});
}

export function getStoredShop(request) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = parseCookieHeader(cookieHeader);
  return String(cookies[LAST_SHOP_COOKIE_NAME] || "").trim().toLowerCase();
}

export function createStoredShopCookie(shop) {
  return `${LAST_SHOP_COOKIE_NAME}=${encodeURIComponent(String(shop || "").trim().toLowerCase())}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${LAST_SHOP_COOKIE_MAX_AGE_SECONDS}`;
}
