import { useEffect, useRef, useState } from "react";

export function useBillingVerification({
  verificationRequested,
  hasLinkedCompany,
  hasAuthenticatedIframeSession,
  backendSyncStatus,
  hasBackendRecognizedPlan,
  shouldClearQuery,
  baseQuery,
  navigate,
}) {
  const linkedAndAuthenticated = hasLinkedCompany && hasAuthenticatedIframeSession;
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [showWarningBanner, setShowWarningBanner] = useState(false);
  const [verificationState, setVerificationState] = useState(() => {
    if (!verificationRequested) return "idle";
    if (!hasLinkedCompany || !hasAuthenticatedIframeSession) return "pending";
    if (backendSyncStatus === "success" || hasBackendRecognizedPlan) return "success";
    return "checking";
  });
  const [verificationMessage, setVerificationMessage] = useState(() => {
    if (!verificationRequested) return "";
    if (!hasLinkedCompany || !hasAuthenticatedIframeSession) {
      return "Your Shopify billing exists, but there is no active Clipwise iframe login for this store.";
    }
    if (backendSyncStatus === "success" || hasBackendRecognizedPlan) {
      return "Your Shopify subscription is active and synced successfully.";
    }
    return "We are verifying your Shopify subscription and syncing access.";
  });
  const timeoutRef = useRef(null);
  const showLinkedAccountGate = !hasLinkedCompany || !hasAuthenticatedIframeSession;

  useEffect(() => {
    setShowSuccessBanner(linkedAndAuthenticated && (backendSyncStatus === "success" || hasBackendRecognizedPlan));
    setShowWarningBanner(
      verificationRequested
        ? verificationState === "failed" || (verificationState === "pending" && showLinkedAccountGate)
        : showLinkedAccountGate,
    );
  }, [
    backendSyncStatus,
    hasBackendRecognizedPlan,
    linkedAndAuthenticated,
    showLinkedAccountGate,
    verificationRequested,
    verificationState,
  ]);

  useEffect(() => {
    if (!verificationRequested) {
      setVerificationState("idle");
      setVerificationMessage("");
      return;
    }
    if (!hasLinkedCompany || !hasAuthenticatedIframeSession) {
      setVerificationState("pending");
      setVerificationMessage("Your Shopify billing exists, but there is no active Clipwise iframe login for this store.");
      return;
    }
    if (backendSyncStatus === "success" || hasBackendRecognizedPlan) {
      setVerificationState("success");
      setVerificationMessage("Your Shopify subscription is active and synced successfully.");
      return;
    }
    setVerificationState("checking");
    setVerificationMessage("We are verifying your Shopify subscription and syncing access.");
  }, [
    backendSyncStatus,
    hasAuthenticatedIframeSession,
    hasBackendRecognizedPlan,
    hasLinkedCompany,
    verificationRequested,
  ]);

  useEffect(() => {
    if (!shouldClearQuery || !hasLinkedCompany || !hasAuthenticatedIframeSession) return;
    navigate(`/app/billing?${baseQuery}`, { replace: true });
  }, [baseQuery, hasAuthenticatedIframeSession, hasLinkedCompany, navigate, shouldClearQuery]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!verificationRequested || !hasLinkedCompany || !hasAuthenticatedIframeSession) return undefined;
    if (verificationState === "success" || verificationState === "failed" || verificationState === "pending") {
      return undefined;
    }

    let cancelled = false;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/app/billing/status?${baseQuery}`, {
          credentials: "same-origin",
          headers: { Accept: "application/json" },
        });
        const payload = await response.json();
        if (cancelled) return;

        if (payload.verificationState === "success") {
          setVerificationState("success");
          setVerificationMessage("Your Shopify subscription is active and synced successfully.");
          setShowSuccessBanner(true);
          setShowWarningBanner(false);
          navigate(`/app/billing?${baseQuery}`, { replace: true });
          return;
        }

        if (payload.verificationState === "failed") {
          setVerificationState("failed");
          setVerificationMessage("We could not confirm an active Shopify subscription. If you were charged, refresh once or contact support.");
          setShowSuccessBanner(false);
          setShowWarningBanner(true);
          return;
        }

        if (payload.verificationState === "pending") {
          setVerificationState("checking");
          setVerificationMessage(payload.syncError || "Shopify approved the plan, but backend verification is still finishing.");
        }
      } catch {
        if (!cancelled) {
          setVerificationMessage("We are still checking the latest Shopify billing status.");
        }
      }
    };

    pollStatus();
    const intervalId = window.setInterval(pollStatus, 3000);
    timeoutRef.current = window.setTimeout(() => {
      if (cancelled) return;
      setVerificationState("pending");
      setVerificationMessage("Your payment may still be processing. Please refresh in a moment. If Shopify charged you, access should sync shortly.");
      setShowSuccessBanner(false);
      setShowWarningBanner(true);
      window.clearInterval(intervalId);
    }, 45000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [
    baseQuery,
    hasAuthenticatedIframeSession,
    hasLinkedCompany,
    navigate,
    verificationRequested,
    verificationState,
  ]);

  return {
    linkedAndAuthenticated,
    showLinkedAccountGate,
    showSuccessBanner,
    setShowSuccessBanner,
    showWarningBanner,
    setShowWarningBanner,
    verificationState,
    verificationMessage,
  };
}
