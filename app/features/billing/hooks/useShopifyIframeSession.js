import { useEffect, useState } from "react";

const SHOPIFY_IFRAME_AUTH_STATE_STORAGE_KEY = "clipwise_shopify_iframe_auth_state";
const SHOPIFY_IFRAME_AUTH_STATE_UPDATED_EVENT = "clipwise:shopify-auth-state-updated";

function readIframeAuthState() {
  if (typeof window === "undefined") return false;
  try {
    const raw = window.sessionStorage.getItem(SHOPIFY_IFRAME_AUTH_STATE_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return Boolean(parsed?.isAuthenticated);
  } catch {
    return false;
  }
}

export function useShopifyIframeSession() {
  const [hasAuthenticatedIframeSession, setHasAuthenticatedIframeSession] = useState(() =>
    readIframeAuthState(),
  );

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const syncAuthState = () => setHasAuthenticatedIframeSession(readIframeAuthState());

    syncAuthState();
    window.addEventListener("focus", syncAuthState);
    window.addEventListener(SHOPIFY_IFRAME_AUTH_STATE_UPDATED_EVENT, syncAuthState);

    return () => {
      window.removeEventListener("focus", syncAuthState);
      window.removeEventListener(SHOPIFY_IFRAME_AUTH_STATE_UPDATED_EVENT, syncAuthState);
    };
  }, []);

  return hasAuthenticatedIframeSession;
}
