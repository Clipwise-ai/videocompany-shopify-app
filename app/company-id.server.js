const COMPANY_ID_COOKIE_NAME = "clipwise_company_id";

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

export function getStoredCompanyId(request) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const cookies = parseCookieHeader(cookieHeader);
  return decodeURIComponent(cookies[COMPANY_ID_COOKIE_NAME] || "").trim();
}

export function createCompanyIdCookie(companyId) {
  const normalizedCompanyId = String(companyId || "").trim();
  const encodedValue = encodeURIComponent(normalizedCompanyId);
  return `${COMPANY_ID_COOKIE_NAME}=${encodedValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;
}
