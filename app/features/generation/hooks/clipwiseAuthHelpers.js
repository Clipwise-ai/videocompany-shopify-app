import {
  clearStoredClipwiseAuth,
  fetchClipwiseUserContext,
  normalizeAuthPayload,
  refreshClipwiseAuth,
  storeClipwiseAuth,
} from "../services/clipwise-auth.client";

export function readStoredClipwiseAuth() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("clipwise-shopify-auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function enrichAuthPayloadWithUserContext(authPayload, logLabel) {
  const token = authPayload?.access || authPayload?.accessToken;
  if (!token) return authPayload;

  try {
    const userContext = await fetchClipwiseUserContext(token);
    if (userContext?.user) {
      authPayload.user = {
        ...userContext.user,
        total_credits_remaining: userContext.total_credits_remaining,
      };
    }
  } catch (error) {
    console.error(`Failed to fetch user context immediately after ${logLabel}:`, error);
  }

  return authPayload;
}

export function buildConnectedAuthState({ accessToken, refreshToken, user }) {
  return {
    status: "connected",
    accessToken,
    refreshToken,
    user,
  };
}

export async function restoreStoredClipwiseAuth(stored) {
  const userContext = await fetchClipwiseUserContext(stored.accessToken);
  const enrichedUser = userContext?.user
    ? {
        ...userContext.user,
        total_credits_remaining: userContext.total_credits_remaining,
      }
    : (stored.user || null);

  const nextAuth = buildConnectedAuthState({
    accessToken: stored.accessToken,
    refreshToken: stored.refreshToken || "",
    user: enrichedUser,
  });
  storeClipwiseAuth({
    accessToken: nextAuth.accessToken,
    refreshToken: nextAuth.refreshToken,
    user: nextAuth.user,
  });
  return nextAuth;
}

export async function refreshStoredClipwiseAuth(stored) {
  const refreshed = await refreshClipwiseAuth(stored.refreshToken);
  const userContext = await fetchClipwiseUserContext(refreshed.accessToken);
  const enrichedUser = userContext?.user
    ? {
        ...userContext.user,
        total_credits_remaining: userContext.total_credits_remaining,
      }
    : (stored.user || null);

  const nextAuth = buildConnectedAuthState({
    accessToken: refreshed.accessToken,
    refreshToken: refreshed.refreshToken,
    user: enrichedUser,
  });
  storeClipwiseAuth({
    accessToken: nextAuth.accessToken,
    refreshToken: nextAuth.refreshToken,
    user: nextAuth.user,
  });
  return nextAuth;
}

export function applyNormalizedClipwiseAuth(payload, setClipwiseAuth, setAuthAction, setAuthForm) {
  const normalized = normalizeAuthPayload(payload);
  const nextAuth = buildConnectedAuthState({
    accessToken: normalized.accessToken,
    refreshToken: normalized.refreshToken,
    user: normalized.user,
  });

  setClipwiseAuth(nextAuth);
  storeClipwiseAuth(nextAuth);
  setAuthAction({ loading: false, googleLoading: false, error: null });
  setAuthForm((prev) => ({ ...prev, password: "", password2: "" }));
}

export function clearDisconnectedClipwiseAuth(setClipwiseAuth) {
  clearStoredClipwiseAuth();
  setClipwiseAuth({
    status: "disconnected",
    accessToken: "",
    refreshToken: "",
    user: null,
  });
}
