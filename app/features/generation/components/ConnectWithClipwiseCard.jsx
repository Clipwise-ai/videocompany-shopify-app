/* eslint-disable react/prop-types */
import { Card, Text } from "@shopify/polaris";
import { fieldStyle } from "../styles";

export function ConnectWithClipwiseCard({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authAction,
  onSubmit,
  onGoogleSubmit,
  onLogout,
  authState,
}) {
  const isConnected = authState.status === "connected" && authState.accessToken;

  if (isConnected) {
    const connectedEmail = authState.user?.email || "Connected";

    return (
      <div style={{ width: "100%", maxWidth: "720px", margin: "0 auto" }}>
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
            <div>
              <Text variant="headingMd" as="h2">Video Company Connected</Text>
              <Text as="p" tone="subdued">{connectedEmail}</Text>
            </div>
            <button
              type="button"
              onClick={onLogout}
              style={{
                border: "1px solid #d1d5db",
                borderRadius: "10px",
                background: "#fff",
                padding: "10px 14px",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Disconnect
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: "90%", margin: "0 auto" }}>
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <Text variant="headingMd" as="h2">Connect with Video Company</Text>
            <Text as="p" tone="subdued">
              Log in or sign up with your existing Video Company account to use backend generation APIs.
            </Text>
          </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {["login", "signup"].map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setAuthMode(mode)}
              style={{
                border: authMode === mode ? "1px solid #2563eb" : "1px solid #d1d5db",
                background: authMode === mode ? "#eff6ff" : "#fff",
                color: authMode === mode ? "#2563eb" : "#111827",
                borderRadius: "999px",
                padding: "8px 14px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {mode === "login" ? "Login" : "Sign up"}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          <button
            type="button"
            onClick={onGoogleSubmit}
            disabled={authAction.loading || authAction.googleLoading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "12px",
              border: "1px solid #d1d5db",
              borderRadius: "28px",
              background: "#fff",
              color: "#374151",
              padding: "12px 16px",
              fontSize: "14px",
              fontWeight: 500,
              cursor: authAction.loading || authAction.googleLoading ? "not-allowed" : "pointer",
              opacity: authAction.loading || authAction.googleLoading ? 0.7 : 1,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-label="Google logo">
              <title>Google</title>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>
              {authAction.googleLoading
                ? "Signing in..."
                : authMode === "signup"
                  ? "Sign up with Google"
                  : "Continue with Google"}
            </span>
          </button>

          <div style={{ position: "relative", textAlign: "center" }}>
            <div style={{ position: "absolute", top: "50%", left: 0, right: 0, borderTop: "1px solid #e5e7eb" }} />
            <span style={{ position: "relative", padding: "0 12px", background: "#fff", color: "#9ca3af", fontSize: "12px" }}>
              or
            </span>
          </div>
        </div>

        <div style={{ display: "grid", gap: "10px" }}>
          {authMode === "signup" && (
            <input
              value={authForm.username}
              onChange={(event) => setAuthForm((prev) => ({ ...prev, username: event.target.value }))}
              placeholder="Username"
              style={fieldStyle}
            />
          )}
          <input
            value={authForm.email}
            onChange={(event) => setAuthForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="Email"
            type="email"
            autoComplete="email"
            style={fieldStyle}
          />
          <input
            value={authForm.password}
            onChange={(event) => setAuthForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder="Password"
            type="password"
            autoComplete={authMode === "login" ? "current-password" : "new-password"}
            style={fieldStyle}
          />
          {authMode === "signup" && (
            <input
              value={authForm.password2}
              onChange={(event) => setAuthForm((prev) => ({ ...prev, password2: event.target.value }))}
              placeholder="Confirm password"
              type="password"
              autoComplete="new-password"
              style={fieldStyle}
            />
          )}
        </div>

        <button
          type="button"
          onClick={onSubmit}
          disabled={authAction.loading || authAction.googleLoading}
          style={{
            width: "100%",
            border: "none",
            borderRadius: "12px",
            background: authAction.loading ? "#9ca3af" : "#2563eb",
            color: "#fff",
            padding: "12px 16px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: authAction.loading || authAction.googleLoading ? "not-allowed" : "pointer",
          }}
        >
          {authAction.loading ? "Please wait..." : authMode === "login" ? "Connect Account" : "Create and Connect"}
        </button>

          {authAction.error ? <Text as="p" tone="critical">{authAction.error}</Text> : null}
          {authState.status === "checking" ? (
            <Text as="p" tone="subdued">Checking saved Clipwise session...</Text>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
