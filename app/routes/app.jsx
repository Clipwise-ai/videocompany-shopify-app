import { Outlet, useLoaderData, useLocation, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import { getStoredCompanyId } from "../company-id.server";
import { getLinkedCompanyIdForShop } from "../shop-link.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const companyId =
    String(url.searchParams.get("companyId") || "").trim() ||
    getStoredCompanyId(request) ||
    (await getLinkedCompanyIdForShop(session.shop));

  // eslint-disable-next-line no-undef
  return { apiKey: process.env.SHOPIFY_API_KEY || "", companyId };
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
