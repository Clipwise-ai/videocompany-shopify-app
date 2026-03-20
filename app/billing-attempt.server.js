const BILLING_ATTEMPT_COOKIE_NAME = "clipwise_shopify_billing_attempt";
const BILLING_ATTEMPT_MAX_AGE_SECONDS = 15 * 60;

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

export function getPendingBillingAttempt(request) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = parseCookieHeader(cookieHeader);
  const rawValue = cookies[BILLING_ATTEMPT_COOKIE_NAME];
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(rawValue));
    const requestedAt = Number(parsed?.requestedAt || 0);
    const isFresh =
      Number.isFinite(requestedAt) &&
      Date.now() - requestedAt <= BILLING_ATTEMPT_MAX_AGE_SECONDS * 1000;

    if (!isFresh) return null;

    return {
      shop: String(parsed?.shop || "").trim().toLowerCase(),
      companyId: String(parsed?.companyId || "").trim(),
      planKey: String(parsed?.planKey || "").trim(),
      requestedAt,
    };
  } catch {
    return null;
  }
}

export function createPendingBillingAttemptCookie({ shop, companyId, planKey }) {
  const payload = {
    shop: String(shop || "").trim().toLowerCase(),
    companyId: String(companyId || "").trim(),
    planKey: String(planKey || "").trim(),
    requestedAt: Date.now(),
  };
  return `${BILLING_ATTEMPT_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(payload))}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${BILLING_ATTEMPT_MAX_AGE_SECONDS}`;
}

export function clearPendingBillingAttemptCookie() {
  return `${BILLING_ATTEMPT_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
