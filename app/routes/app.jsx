import { Outlet, useLoaderData, useLocation, useRouteError } from "react-router";
import { useEffect } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import { getStoredCompanyId } from "../company-id.server";
import { createStoredShopCookie } from "../shop-cookie.server";
import { getLinkedCompanyIdForShop } from "../shop-link.server";
import { authenticate } from "../shopify.server";

const SHOPIFY_IFRAME_AUTH_STATE_EVENT = "clipwise:auth-state";
const SHOPIFY_IFRAME_AUTH_STATE_STORAGE_KEY = "clipwise_shopify_iframe_auth_state";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const companyId =
    String(url.searchParams.get("companyId") || "").trim() ||
    getStoredCompanyId(request) ||
    (await getLinkedCompanyIdForShop(session.shop));

  // eslint-disable-next-line no-undef
  return Response.json(
    { apiKey: process.env.SHOPIFY_API_KEY || "", companyId },
    {
      headers: {
        "Set-Cookie": createStoredShopCookie(session.shop),
      },
    },
  );
};

export default function App() {
  const { apiKey, companyId: loaderCompanyId } = useLoaderData();
  const location = useLocation();
  const currentParams = new URLSearchParams(location.search);
  const embeddedParams = new URLSearchParams();

  if (currentParams.get("shop")) {
    embeddedParams.set("shop", currentParams.get("shop"));
  }
  if (currentParams.get("host")) {
    embeddedParams.set("host", currentParams.get("host"));
  }
  if (currentParams.get("embedded") === "1") {
    embeddedParams.set("embedded", "1");
  }
  const effectiveCompanyId = currentParams.get("companyId") || loaderCompanyId || "";
  if (effectiveCompanyId) {
    embeddedParams.set("companyId", effectiveCompanyId);
  }

  const embeddedQuery = embeddedParams.toString();
  const homeHref = embeddedQuery ? `/app?${embeddedQuery}` : "/app";
  const billingHref = embeddedQuery ? `/app/billing?${embeddedQuery}` : "/app/billing";

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleMessage = (event) => {
      if (event?.data?.type !== SHOPIFY_IFRAME_AUTH_STATE_EVENT) return;

      try {
        window.sessionStorage.setItem(
          SHOPIFY_IFRAME_AUTH_STATE_STORAGE_KEY,
          JSON.stringify({
            isAuthenticated: Boolean(event.data?.payload?.isAuthenticated),
            updatedAt: Date.now(),
          }),
        );
        window.dispatchEvent(new CustomEvent("clipwise:shopify-auth-state-updated"));
      } catch {
        // Ignore storage issues and keep shell navigation working.
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <AppProvider embedded apiKey={apiKey}>
      <PolarisAppProvider i18n={{}}>
        <s-app-nav>
          <s-link href={homeHref}>Home</s-link>
          <s-link href={billingHref}>Billing</s-link>
        </s-app-nav>
        <Outlet />
      </PolarisAppProvider>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
