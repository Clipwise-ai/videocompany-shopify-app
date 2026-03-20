import crypto from "node:crypto";

const DJANGO_BACKEND_URL = process.env.DJANGO_BACKEND_URL || "";
const SHOPIFY_INTERNAL_SYNC_SECRET = process.env.SHOPIFY_INTERNAL_SYNC_SECRET || "";

async function parseJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function getSyncHeaders(path, body) {
  if (!SHOPIFY_INTERNAL_SYNC_SECRET) {
    throw new Error("SHOPIFY_INTERNAL_SYNC_SECRET is not configured.");
  }

  const timestamp = String(Math.floor(Date.now() / 1000));
  const signature = crypto
    .createHmac("sha256", SHOPIFY_INTERNAL_SYNC_SECRET)
    .update(`${timestamp}.${path}.${body}`)
    .digest("hex");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Clipwise-Timestamp": timestamp,
    "X-Clipwise-Signature": `sha256=${signature}`,
  };
}

export async function sendSignedRequest(path, payload, { method = "POST" } = {}) {
  if (!DJANGO_BACKEND_URL) {
    throw new Error("DJANGO_BACKEND_URL is not configured.");
  }

  const trimmedBase = DJANGO_BACKEND_URL.replace(/\/$/, "");
  const body = payload ? JSON.stringify(payload) : "";
  const response = await fetch(`${trimmedBase}${path}`, {
    method,
    headers: getSyncHeaders(path, body),
    body: method === "GET" ? undefined : body,
  });
  const responsePayload = await parseJson(response);

  if (!response.ok) {
    const error = new Error(responsePayload?.error || `Backend sync failed (${response.status})`);
    error.status = response.status;
    error.payload = responsePayload;
    throw error;
  }

  return responsePayload;
}
