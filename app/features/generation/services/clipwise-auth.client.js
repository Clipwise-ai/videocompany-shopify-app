import {
  CLIPWISE_AUTH_STORAGE_KEY,
  CLIPWISE_ENDPOINTS,
  DJANGO_BACKEND_URL,
} from "../constants";

export function getStoredClipwiseAuth() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CLIPWISE_AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeClipwiseAuth(auth) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLIPWISE_AUTH_STORAGE_KEY, JSON.stringify(auth));
}

export function clearStoredClipwiseAuth() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CLIPWISE_AUTH_STORAGE_KEY);
}

function resolveApiErrorMessage(payload, fallbackStatus) {
  if (!payload) return fallbackStatus ? `Request failed (${fallbackStatus})` : "Request failed.";
  if (typeof payload.detail === "string" && payload.detail.trim()) return payload.detail;
  if (typeof payload.error === "string" && payload.error.trim()) return payload.error;
  if (typeof payload.message === "string" && payload.message.trim()) return payload.message;

  if (typeof payload === "object") {
    for (const value of Object.values(payload)) {
      if (Array.isArray(value) && value.length > 0) return String(value[0]);
      if (typeof value === "string" && value.trim()) return value;
    }
  }

  return fallbackStatus ? `Request failed (${fallbackStatus})` : "Request failed.";
}

async function parseJsonResponse(response) {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const error = new Error(resolveApiErrorMessage(payload, response.status));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function clipwiseRequest(path, options = {}) {
  const response = await fetch(`${DJANGO_BACKEND_URL}${path}`, {
    ...options,
    mode: "cors",
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
  });

  return parseJsonResponse(response);
}

export function normalizeAuthPayload(payload) {
  return {
    accessToken: payload?.access || payload?.accessToken || "",
    refreshToken: payload?.refresh || payload?.refreshToken || "",
    user: payload?.user || null,
  };
}

export async function fetchClipwiseUserContext(accessToken) {
  return clipwiseRequest(CLIPWISE_ENDPOINTS.userContext, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function refreshClipwiseAuth(refreshToken) {
  const payload = await clipwiseRequest(CLIPWISE_ENDPOINTS.refresh, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refresh: refreshToken }),
  });

  const normalized = normalizeAuthPayload(payload);
  return {
    accessToken: normalized.accessToken,
    refreshToken: normalized.refreshToken || refreshToken,
  };
}
