import { redirect, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  const url = new URL(request.url);
  const reloadTarget = String(url.searchParams.get("shopify-reload") || "").trim();

  if (reloadTarget) {
    try {
      const resolvedTarget = new URL(reloadTarget, url.origin);
      if (resolvedTarget.origin === url.origin) {
        throw redirect(`${resolvedTarget.pathname}${resolvedTarget.search}${resolvedTarget.hash}`);
      }
    } catch {
      // Fall through to a no-op page if the reload target is malformed.
    }
  }

  return { reloadTarget: reloadTarget || null };
};

export default function AuthBouncePage() {
  const data = useLoaderData();
  const reloadTarget = typeof data?.reloadTarget === "string" ? data.reloadTarget : "";

  if (reloadTarget && typeof window !== "undefined") {
    try {
      const resolvedTarget = new URL(reloadTarget, window.location.origin);
      if (resolvedTarget.origin === window.location.origin) {
        window.location.replace(`${resolvedTarget.pathname}${resolvedTarget.search}${resolvedTarget.hash}`);
      }
    } catch {
      // Ignore malformed client-side reload targets.
    }
  }

  return null;
}

export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
