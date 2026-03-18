function normalizeBaseUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return "";

  try {
    const url = new URL(value);
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

export function buildEmbeddedAdminAppUrl(host) {
  const encodedHost = String(host || "").trim();
  const apiKey = String(process.env.SHOPIFY_API_KEY || "").trim();
  if (!encodedHost || !apiKey) {
    return "";
  }

  try {
    const decodedHost = Buffer.from(encodedHost, "base64").toString("utf8").trim();
    if (!decodedHost) {
      return "";
    }

    return `https://${decodedHost}/apps/${apiKey}`;
  } catch {
    return "";
  }
}

export function getPublicAppUrl(request) {
  const envUrl = normalizeBaseUrl(process.env.SHOPIFY_APP_URL);
  if (envUrl) {
    return envUrl;
  }

  const forwardedProto = String(request.headers.get("x-forwarded-proto") || "").trim();
  const forwardedHost = String(request.headers.get("x-forwarded-host") || "").trim();
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const requestUrl = new URL(request.url);
  if (requestUrl.hostname.includes("trycloudflare.com")) {
    requestUrl.protocol = "https:";
  }
  requestUrl.pathname = "";
  requestUrl.search = "";
  requestUrl.hash = "";
  return requestUrl.toString().replace(/\/$/, "");
}
