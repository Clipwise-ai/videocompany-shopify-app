/* eslint-disable react/prop-types */
import { useState } from "react";
import { EyeIcon, GoogleIcon } from "./ConnectPageIcons";
import { connectPageStyles as s } from "./connectPageStyles";

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  autoComplete,
  disabled,
  onKeyDown,
  hasError,
  errorMessage,
}) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div style={s.fieldWrap}>
      <label htmlFor={id} style={s.label}>{label}</label>
      <div style={s.passwordWrap}>
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          onKeyDown={onKeyDown}
          style={{ ...s.passwordInput, borderColor: hasError ? "#ef4444" : "#3f3f46" }}
          onFocus={(event) => {
            event.currentTarget.style.borderColor = hasError ? "#ef4444" : "#9ca3af";
          }}
          onBlur={(event) => {
            event.currentTarget.style.borderColor = hasError ? "#ef4444" : "#3f3f46";
          }}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setIsVisible((value) => !value)}
          style={s.eyeBtn}
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          <EyeIcon open={isVisible} />
        </button>
      </div>
      {errorMessage ? <div style={s.errorBox}>{errorMessage}</div> : null}
    </div>
  );
}

export function ConnectPageFormPanel({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authAction,
  onSubmit,
  onGoogleSubmit,
}) {
  const isLogin = authMode === "login";
  const isLoading = authAction.loading || authAction.googleLoading;
  const hasFormError = authAction.error && typeof authAction.error === "string";
  const canSubmit = !isLoading && authForm.email && authForm.password;
  const setField = (key) => (event) => setAuthForm((prev) => ({ ...prev, [key]: event.target.value }));

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !isLoading) onSubmit();
  };

  return (
    <div className="card-content-wrap">
      <div style={s.formSide}>
        <div style={s.formBlob1} />
        <div style={s.formBlob2} />

        <div style={s.headerWrapper}>
          <div>
            <h1 style={s.heading}>Welcome back</h1>
            <p style={s.subheading}>Sign in to your Video Company account</p>
          </div>
        </div>

        <div style={s.formContainer}>
          <button
            type="button"
            id="connect-google-btn"
            disabled={isLoading}
            onClick={onGoogleSubmit}
            style={s.googleBtn(isLoading)}
            onMouseEnter={(event) => {
              if (!isLoading) {
                event.currentTarget.style.background = "#f3f4f6";
                event.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
              }
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = "#ffffff";
              event.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
            }}
          >
            <GoogleIcon />
            <span style={{ color: "#374151", fontWeight: 500 }}>
              {authAction.googleLoading ? "Signing in..." : "Sign in with Google"}
            </span>
          </button>

          <div style={s.dividerRow}>
            <div style={s.dividerLine} />
            <span style={s.dividerText}>or</span>
          </div>

          <div style={s.fieldGroup}>
            {!isLogin ? (
              <div style={s.fieldWrap}>
                <label htmlFor="connect-username" style={s.label}>Username</label>
                <input
                  id="connect-username"
                  value={authForm.username}
                  onChange={setField("username")}
                  placeholder="Enter username"
                  autoComplete="username"
                  disabled={isLoading}
                  onKeyDown={handleKeyDown}
                  style={s.input}
                  onFocus={(event) => {
                    event.currentTarget.style.borderColor = "#9ca3af";
                  }}
                  onBlur={(event) => {
                    event.currentTarget.style.borderColor = "#3f3f46";
                  }}
                />
              </div>
            ) : null}

            <div style={s.fieldWrap}>
              <label htmlFor="connect-email" style={s.label}>Email</label>
              <input
                id="connect-email"
                type="email"
                value={authForm.email}
                onChange={setField("email")}
                placeholder="Enter email"
                autoComplete="email"
                disabled={isLoading}
                onKeyDown={handleKeyDown}
                style={{ ...s.input, borderColor: hasFormError ? "#ef4444" : "#3f3f46" }}
                onFocus={(event) => {
                  event.currentTarget.style.borderColor = hasFormError ? "#ef4444" : "#9ca3af";
                }}
                onBlur={(event) => {
                  event.currentTarget.style.borderColor = hasFormError ? "#ef4444" : "#3f3f46";
                }}
              />
              {hasFormError && !isLogin ? <div style={s.errorBox}>{authAction.error}</div> : null}
            </div>

            <PasswordField
              id="connect-password"
              label="Password"
              value={authForm.password}
              onChange={setField("password")}
              placeholder="Enter password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              disabled={isLoading}
              onKeyDown={handleKeyDown}
              hasError={hasFormError}
              errorMessage={hasFormError && isLogin ? authAction.error : ""}
            />

            {!isLogin ? (
              <PasswordField
                id="connect-password2"
                label="Confirm Password"
                value={authForm.password2}
                onChange={setField("password2")}
                placeholder="Enter password again"
                autoComplete="new-password"
                disabled={isLoading}
                onKeyDown={handleKeyDown}
                hasError={false}
              />
            ) : null}
          </div>

          <button
            type="button"
            id="connect-submit-btn"
            disabled={!canSubmit}
            onClick={onSubmit}
            style={s.submitBtn(!canSubmit)}
            onMouseEnter={(event) => {
              if (canSubmit) event.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.opacity = "1";
            }}
          >
            {isLoading ? (isLogin ? "Signing in..." : "Signing up...") : isLogin ? "Login" : "Sign up"}
          </button>

          <div style={s.switchTextWrap}>
            <span>{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
            <button
              type="button"
              onClick={() => setAuthMode(isLogin ? "signup" : "login")}
              style={s.switchBtn}
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </div>
        </div>

        <div style={s.footerSection}>
          <div style={s.footerText}>
            <span>By proceeding, you agree to the </span>
            <a
              href="https://www.videocompany.com/tnc"
              target="_blank"
              rel="noreferrer"
              style={s.footerLink}
              onMouseEnter={(event) => {
                event.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.textDecoration = "none";
              }}
            >
              Terms of service
            </a>
            <span> and </span>
            <a
              href="https://www.videocompany.com/privacy-policy"
              target="_blank"
              rel="noreferrer"
              style={s.footerLink}
              onMouseEnter={(event) => {
                event.currentTarget.style.textDecoration = "underline";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.textDecoration = "none";
              }}
            >
              Privacy policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
