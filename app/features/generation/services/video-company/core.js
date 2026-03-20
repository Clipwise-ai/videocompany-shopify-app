import { DJANGO_BACKEND_URL } from "../../constants";

export { DJANGO_BACKEND_URL };

function buildUrl(path, params = {}) {
  const url = new URL(path, DJANGO_BACKEND_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function parseResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      error:
        payload?.detail ||
        payload?.error ||
        payload?.message ||
        `Request failed (${response.status})`,
      data: payload,
    };
  }

  return { success: true, status: response.status, data: payload };
}

export async function request(
  path,
  { accessToken, method = "GET", body, isFormData = false, params } = {},
) {
  const response = await fetch(buildUrl(path, params), {
    method,
    mode: "cors",
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      "X-Platform": "video_company",
    },
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });

  return parseResponse(response);
}

export async function fetchAllPaginated(accessToken, initialPath, initialParams = {}) {
  let nextPath = initialPath;
  let nextParams = initialParams;
  const allResults = [];
  let lastPayload = null;

  while (nextPath) {
    const result = await request(nextPath, { accessToken, params: nextParams });
    if (!result.success) return result;

    const payload = result.data || {};
    lastPayload = payload;
    const results = Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload)
        ? payload
        : [];
    allResults.push(...results);

    if (!payload?.next) {
      nextPath = "";
      nextParams = {};
      continue;
    }

    nextPath = payload.next;
    nextParams = {};
  }

  return {
    success: true,
    status: 200,
    data: {
      ...(lastPayload && typeof lastPayload === "object" ? lastPayload : {}),
      results: allResults,
      count: allResults.length,
      next: null,
      previous: null,
    },
  };
}
