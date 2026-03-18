import { useEffect, useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { assertFirebaseConfigured, auth, googleProvider } from "../../../config/firebase.client";
import { CLIPWISE_ENDPOINTS } from "../constants";
import {
  clearStoredClipwiseAuth,
  clipwiseRequest,
  fetchClipwiseUserContext,
  normalizeAuthPayload,
  refreshClipwiseAuth,
  storeClipwiseAuth,
} from "../services/clipwise-auth.client";

function readStoredClipwiseAuth() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem("clipwise-shopify-auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function useClipwiseAuth() {
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [authAction, setAuthAction] = useState({
    loading: false,
    googleLoading: false,
    error: null,
  });
  const [clipwiseAuth, setClipwiseAuth] = useState({
    status: "checking",
    accessToken: "",
    refreshToken: "",
    user: null,
  });

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      const stored = readStoredClipwiseAuth();
      if (!stored?.accessToken) {
        if (active) {
          setClipwiseAuth({
            status: "disconnected",
            accessToken: "",
            refreshToken: "",
            user: null,
          });
        }
        return;
      }

      if (active) {
        setClipwiseAuth((prev) => ({
          ...prev,
          status: "checking",
        }));
      }

      try {
        const userContext = await fetchClipwiseUserContext(stored.accessToken);
        if (!active) return;

        const enrichedUser = userContext?.user ? {
          ...userContext.user,
          total_credits_remaining: userContext.total_credits_remaining,
        } : (stored.user || null);

        setClipwiseAuth({
          status: "connected",
          accessToken: stored.accessToken,
          refreshToken: stored.refreshToken || "",
          user: enrichedUser,
        });
        storeClipwiseAuth({
          accessToken: stored.accessToken,
          refreshToken: stored.refreshToken || "",
          user: enrichedUser,
        });
      } catch {
        if (!stored.refreshToken) {
          clearStoredClipwiseAuth();
          if (active) {
            setClipwiseAuth({
              status: "disconnected",
              accessToken: "",
              refreshToken: "",
              user: null,
            });
          }
          return;
        }

        try {
          const refreshed = await refreshClipwiseAuth(stored.refreshToken);
          const userContext = await fetchClipwiseUserContext(refreshed.accessToken);
          if (!active) return;

          const enrichedUser = userContext?.user ? {
            ...userContext.user,
            total_credits_remaining: userContext.total_credits_remaining,
          } : (stored.user || null);

          const nextAuth = {
            status: "connected",
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
            user: enrichedUser,
          };
          setClipwiseAuth(nextAuth);
          storeClipwiseAuth({
            accessToken: nextAuth.accessToken,
            refreshToken: nextAuth.refreshToken,
            user: nextAuth.user,
          });
        } catch {
          clearStoredClipwiseAuth();
          if (active) {
            setClipwiseAuth({
              status: "disconnected",
              accessToken: "",
              refreshToken: "",
              user: null,
            });
          }
        }
      }
    };

    initializeAuth();
    return () => {
      active = false;
    };
  }, []);

  const applyClipwiseAuth = (payload) => {
    const normalized = normalizeAuthPayload(payload);
    const nextAuth = {
      status: "connected",
      accessToken: normalized.accessToken,
      refreshToken: normalized.refreshToken,
      user: normalized.user,
    };

    setClipwiseAuth(nextAuth);
    storeClipwiseAuth(nextAuth);
    setAuthAction({ loading: false, googleLoading: false, error: null });
    setAuthForm((prev) => ({ ...prev, password: "", password2: "" }));
  };

  const connectClipwise = async () => {
    setAuthAction((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const endpoint = authMode === "login" ? CLIPWISE_ENDPOINTS.login : CLIPWISE_ENDPOINTS.register;
      const payload = authMode === "login"
        ? { email: authForm.email.trim(), password: authForm.password }
        : {
            username: authForm.username.trim(),
            email: authForm.email.trim(),
            password: authForm.password,
            password2: authForm.password2,
          };

      const authPayload = await clipwiseRequest(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Platform": "video_company",
        },
        body: JSON.stringify(payload),
      });

      // Fetch user context to get credits and remaining data immediately
      const token = authPayload?.access || authPayload?.accessToken;
      if (token) {
        try {
          const userContext = await fetchClipwiseUserContext(token);
          if (userContext?.user) {
            authPayload.user = {
              ...userContext.user,
              total_credits_remaining: userContext.total_credits_remaining,
            };
          }
        } catch (e) {
          console.error("Failed to fetch user context immediately after login:", e);
        }
      }

      applyClipwiseAuth(authPayload);
    } catch (error) {
      setAuthAction({
        loading: false,
        googleLoading: false,
        error: error.message || "Could not connect Clipwise account.",
      });
    }
  };

  const connectClipwiseWithGoogle = async () => {
    setAuthAction((prev) => ({ ...prev, googleLoading: true, error: null }));

    try {
      assertFirebaseConfigured();

      if (!auth || !googleProvider) {
        throw new Error("Firebase Google auth is not available.");
      }

      const firebaseResult = await signInWithPopup(auth, googleProvider);
      const firebaseUser = firebaseResult.user;
      const idToken = await firebaseUser.getIdToken();

      const authPayload = await clipwiseRequest(CLIPWISE_ENDPOINTS.firebaseAuth, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Platform": "video_company",
        },
        body: JSON.stringify({ id_token: idToken }),
      });

      // Fetch user context to get credits and remaining data immediately
      const token = authPayload?.access || authPayload?.accessToken;
      if (token) {
        try {
          const userContext = await fetchClipwiseUserContext(token);
          if (userContext?.user) {
            authPayload.user = {
              ...userContext.user,
              total_credits_remaining: userContext.total_credits_remaining,
            };
          }
        } catch (e) {
          console.error("Failed to fetch user context immediately after google auth:", e);
        }
      }

      applyClipwiseAuth(authPayload);
    } catch (error) {
      let errorMessage = "Google sign-in failed";

      if (error.code === "auth/popup-closed-by-user") {
        errorMessage = "Sign-in was cancelled";
      } else if (error.code === "auth/popup-blocked") {
        errorMessage = "Pop-up was blocked by browser. Please allow pop-ups and try again.";
      } else if (error.code === "auth/cancelled-popup-request") {
        errorMessage = "Only one sign-in popup allowed at a time";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your connection.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      setAuthAction((prev) => ({
        ...prev,
        loading: false,
        googleLoading: false,
        error: errorMessage,
      }));
    }
  };

  const disconnectClipwise = async () => {
    const refreshToken = clipwiseAuth.refreshToken;

    if (refreshToken) {
      try {
        await clipwiseRequest(CLIPWISE_ENDPOINTS.logout, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      } catch {
        // Ignore logout failures and still clear local session.
      }
    }

    clearStoredClipwiseAuth();
    setClipwiseAuth({
      status: "disconnected",
      accessToken: "",
      refreshToken: "",
      user: null,
    });
  };

  const getFreshAccessToken = async () => {
    if (clipwiseAuth.accessToken) return clipwiseAuth.accessToken;

    const stored = readStoredClipwiseAuth();
    if (!stored?.refreshToken) {
      throw new Error("Connect with Clipwise first.");
    }

    const refreshed = await refreshClipwiseAuth(stored.refreshToken);
    const userContext = await fetchClipwiseUserContext(refreshed.accessToken);
    const nextAuth = {
      status: "connected",
      accessToken: refreshed.accessToken,
      refreshToken: refreshed.refreshToken,
      user: userContext?.user || stored.user || null,
    };

    setClipwiseAuth(nextAuth);
    storeClipwiseAuth(nextAuth);
    return refreshed.accessToken;
  };

  const updateAuthAfterRefresh = (nextAuth) => {
    setClipwiseAuth(nextAuth);
    storeClipwiseAuth(nextAuth);
  };

  return {
    authMode,
    setAuthMode,
    authForm,
    setAuthForm,
    authAction,
    clipwiseAuth,
    connectClipwise,
    connectClipwiseWithGoogle,
    disconnectClipwise,
    getFreshAccessToken,
    updateAuthAfterRefresh,
  };
}
