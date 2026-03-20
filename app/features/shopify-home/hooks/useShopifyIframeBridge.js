import { useEffect, useMemo, useRef, useState } from "react";

const SHOPIFY_IFRAME_BOOTSTRAP_EVENT = "clipwise:shopify-bootstrap";
const SHOPIFY_IFRAME_READY_EVENT = "clipwise:shopify-ready";

export function useShopifyIframeBridge({
  appOrigin,
  frontendUrl,
  iframeBootstrapPayload,
}) {
  const iframeRef = useRef(null);
  const [isIframeReady, setIsIframeReady] = useState(false);

  useEffect(() => {
    const expectedOrigin = new URL(frontendUrl).origin;

    const handleMessage = (event) => {
      if (event.origin !== expectedOrigin) return;

      if (event.data?.type === SHOPIFY_IFRAME_READY_EVENT) {
        setIsIframeReady(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [frontendUrl]);

  useEffect(() => {
    if (!isIframeReady || !iframeRef.current?.contentWindow || !iframeBootstrapPayload) return;

    iframeRef.current.contentWindow.postMessage(
      {
        type: SHOPIFY_IFRAME_BOOTSTRAP_EVENT,
        payload: iframeBootstrapPayload,
      },
      new URL(frontendUrl).origin,
    );
  }, [frontendUrl, iframeBootstrapPayload, isIframeReady]);

  const iframeSrc = useMemo(
    () =>
      `${frontendUrl.replace(/\/$/, "")}/shopify?parentOrigin=${encodeURIComponent(appOrigin)}`,
    [appOrigin, frontendUrl],
  );

  return {
    iframeRef,
    iframeSrc,
  };
}
