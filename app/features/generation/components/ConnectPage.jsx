/* eslint-disable react/prop-types */
import { useState } from "react";

/* ─── tiny SVG icons ─────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" aria-label="Google logo" style={{ width: "20px", height: "20px", marginRight: "12px" }}>
    <title>Google</title>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );

/* ─── styles object ────────────────────────────────────────────────── */
const s = {
  root: {
    position: "fixed",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#F5F5F7",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    zIndex: 9999,
    overflow: "auto",
    padding: "32px 16px",
    minHeight: "100vh",
  },
  card: {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    width: "100%",
    maxWidth: "1100px",
    minHeight: "72vh",
    background: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 4px 32px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)",
    overflow: "hidden",
    border: "1px solid #e5e7eb",
  },
  formSide: {
    display: "flex",
    flexDirection: "column",
    padding: "48px",
    paddingTop: "56px",
    position: "relative",
    zIndex: 10,
    boxSizing: "border-box",
    background: "#ffffff",
  },
  formBlob1: {
    position: "absolute",
    top: "-60px",
    left: "10%",
    width: "280px",
    height: "280px",
    borderRadius: "50%",
    background: "linear-gradient(to bottom, #3b82f6, #a5f3fc)",
    opacity: 0.08,
    pointerEvents: "none",
    filter: "blur(80px)",
  },
  formBlob2: {
    position: "absolute",
    top: "20px",
    right: "-30px",
    width: "240px",
    height: "240px",
    borderRadius: "50%",
    background: "linear-gradient(to bottom, #8b5cf6, #c4b5fd)",
    opacity: 0.07,
    pointerEvents: "none",
    filter: "blur(80px)",
  },
  headerWrapper: {
    marginBottom: "32px",
  },
  logo: {
    width: "160px",
    height: "auto",
    maxHeight: "40px",
    marginBottom: "20px",
    cursor: "pointer",
    objectFit: "contain",
  },
  heading: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 4px",
    letterSpacing: "-0.4px",
    lineHeight: 1.25,
  },
  subheading: {
    fontSize: "15px",
    fontWeight: 400,
    color: "#6b7280",
    margin: "0",
    lineHeight: 1.5,
  },
  formContainer: {
    display: "flex",
    flexDirection: "column",
    maxWidth: "420px",
    width: "100%",
  },
  googleBtn: (disabled) => ({
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    background: "#ffffff",
    color: "#374151",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.65 : 1,
    transition: "background 0.2s, box-shadow 0.2s",
    marginBottom: "16px",
    boxSizing: "border-box",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  }),
  dividerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginBottom: "16px",
  },
  dividerLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: "1px",
    background: "#e5e7eb",
  },
  dividerText: {
    position: "relative",
    background: "#ffffff",
    padding: "0 12px",
    fontSize: "12px",
    color: "#9ca3af",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "20px",
  },
  fieldWrap: {
    display: "flex",
    flexDirection: "column",
  },
  label: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#374151",
    marginBottom: "6px",
    display: "block",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "14px",
    color: "#111827",
    background: "#f9fafb",
    outline: "none",
    transition: "border-color 0.2s, background 0.2s",
    fontFamily: "inherit",
  },
  passwordWrap: {
    position: "relative",
  },
  passwordInput: {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    padding: "11px 44px 11px 14px",
    fontSize: "14px",
    color: "#111827",
    background: "#f9fafb",
    outline: "none",
    transition: "border-color 0.2s",
    fontFamily: "inherit",
  },
  eyeBtn: {
    position: "absolute",
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    padding: "4px",
  },
  submitBtn: (loading) => ({
    width: "100%",
    border: "none",
    borderRadius: "10px",
    background: loading ? "#93c5fd" : "#2563eb",
    color: "#ffffff",
    padding: "12px 16px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: loading ? "not-allowed" : "pointer",
    opacity: 1,
    transition: "background 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
    boxShadow: loading ? "none" : "0 4px 12px rgba(37,99,235,0.25)",
  }),
  errorBox: {
    fontSize: "12px",
    color: "#ef4444",
    marginTop: "6px",
  },
  footerSection: {
    marginTop: "auto",
    paddingTop: "28px",
    width: "100%",
  },
  footerText: {
    textAlign: "center",
    fontSize: "13px",
    color: "#9ca3af",
    lineHeight: 1.5,
  },
  footerLink: {
    color: "#6b7280",
    fontWeight: 500,
    textDecoration: "none",
    cursor: "pointer",
  },
  switchTextWrap: {
    textAlign: "center",
    marginTop: "14px",
    fontSize: "14px",
    color: "#6b7280",
  },
  switchBtn: {
    color: "#2563eb",
    border: "none",
    background: "none",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    padding: 0,
    marginLeft: "4px",
  },

  // Right / image gallery side
  gallerySide: {
    position: "relative",
    width: "100%",
    background: "#F0F4FF",
    display: "flex",
    justifyContent: "center",
    overflow: "hidden",
  },
  galleryGlow: {
    position: "absolute",
    bottom: "0",
    left: "50%",
    transform: "translateX(-50%)",
    width: "384px",
    height: "384px",
    opacity: 0.25,
    background: "linear-gradient(to bottom, #3b82f6, #a5f3fc)",
    borderRadius: "50%",
    filter: "blur(100px)",
    pointerEvents: "none",
    zIndex: 0,
  },
  galleryContainer: {
    display: "flex",
    gap: "8px",
    zIndex: 10,
    padding: "16px 16px 0 16px",
  },
  galleryColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  galleryImage: {
    width: "100%",
    borderRadius: "12px",
    objectFit: "cover",
  },
  galleryFadeTop: {
    position: "absolute",
    inset: "auto 0 0 0",
    height: "60px",
    background: "linear-gradient(to top, #F0F4FF, rgba(240,244,255,0.8), transparent)",
    pointerEvents: "none",
    zIndex: 20,
  },
  pageFadeBottom: {
    pointerEvents: "none",
    position: "absolute",
    inset: "auto 0 0 0",
    height: "64px",
    background: "linear-gradient(to top, #F5F5F7, rgba(245,245,247,0.85), transparent)",
  }
};

/* ─── main component ────────────────────────────────────────────────── */
export function ConnectPage({
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authAction,
  onSubmit,
  onGoogleSubmit,
  authState,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const isLogin = authMode === "login";
  const isLoading = authAction.loading || authAction.googleLoading;

  const setField = (key) => (e) => setAuthForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isLoading) onSubmit();
  };

  const hasFormError = authAction.error && typeof authAction.error === "string";

  return (
    <div style={s.root}>
      <div style={s.card}>
        {/* ─── Left: Form ─── */}
        <div className="card-content-wrap">
          <div style={s.formSide}>
            <div style={s.formBlob1} />
            <div style={s.formBlob2} />

            {/* Header Section */}
            <div style={s.headerWrapper}>
              <div>
                <h1 style={s.heading}>Welcome back</h1>
                <p style={s.subheading}>Sign in to your Video Company account</p>
              </div>
            </div>

            {/* Form Section */}
            <div style={s.formContainer}>
              {/* Google button */}
              <button
                type="button"
                id="connect-google-btn"
                disabled={isLoading}
                onClick={onGoogleSubmit}
                style={s.googleBtn(isLoading)}
                onMouseEnter={(e) => { if (!isLoading) { e.currentTarget.style.background = "#f3f4f6"; e.currentTarget.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)"; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#ffffff"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)"; }}
              >
                <GoogleIcon />
                <span style={{ color: "#374151", fontWeight: 500 }}>
                  {authAction.googleLoading ? "Signing in..." : "Sign in with Google"}
                </span>
              </button>

              {/* Divider */}
              <div style={s.dividerRow}>
                <div style={s.dividerLine} />
                <span style={s.dividerText}>or</span>
              </div>

              {/* Fields */}
              <div style={s.fieldGroup}>
                {!isLogin && (
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
                      onFocus={(e) => { e.currentTarget.style.borderColor = "#9ca3af"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "#3f3f46"; }}
                    />
                  </div>
                )}
                
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
                    onFocus={(e) => { e.currentTarget.style.borderColor = hasFormError ? "#ef4444" : "#9ca3af"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = hasFormError ? "#ef4444" : "#3f3f46"; }}
                  />
                  {hasFormError && !isLogin && (
                    <div style={s.errorBox}>{authAction.error}</div>
                  )}
                </div>

                <div style={s.fieldWrap}>
                  <label htmlFor="connect-password" style={s.label}>Password</label>
                  <div style={s.passwordWrap}>
                    <input
                      id="connect-password"
                      type={showPassword ? "text" : "password"}
                      value={authForm.password}
                      onChange={setField("password")}
                      placeholder="Enter password"
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      disabled={isLoading}
                      onKeyDown={handleKeyDown}
                      style={{ ...s.passwordInput, borderColor: hasFormError ? "#ef4444" : "#3f3f46" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = hasFormError ? "#ef4444" : "#9ca3af"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = hasFormError ? "#ef4444" : "#3f3f46"; }}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      style={s.eyeBtn}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                  {hasFormError && isLogin && (
                    <div style={s.errorBox}>{authAction.error}</div>
                  )}
                </div>

                {!isLogin && (
                  <div style={s.fieldWrap}>
                    <label htmlFor="connect-password2" style={s.label}>Confirm Password</label>
                    <div style={s.passwordWrap}>
                      <input
                        id="connect-password2"
                        type={showPassword2 ? "text" : "password"}
                        value={authForm.password2}
                        onChange={setField("password2")}
                        placeholder="Enter password again"
                        autoComplete="new-password"
                        disabled={isLoading}
                        onKeyDown={handleKeyDown}
                        style={s.passwordInput}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "#9ca3af"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "#3f3f46"; }}
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowPassword2((v) => !v)}
                        style={s.eyeBtn}
                        aria-label={showPassword2 ? "Hide password" : "Show password"}
                      >
                        <EyeIcon open={showPassword2} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit */}
              <button
                type="button"
                id="connect-submit-btn"
                disabled={isLoading || !authForm.email || !authForm.password}
                onClick={onSubmit}
                style={s.submitBtn(isLoading || !authForm.email || !authForm.password)}
                onMouseEnter={(e) => {
                  if (!isLoading && authForm.email && authForm.password) e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {isLoading
                  ? isLogin ? "Signing in..." : "Signing up..."
                  : isLogin ? "Login" : "Sign up"}
              </button>

              <div style={s.switchTextWrap}>
                <span>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(isLogin ? "signup" : "login");
                  }}
                  style={s.switchBtn}
                >
                  {isLogin ? "Sign up" : "Login"}
                </button>
              </div>
            </div>

            {/* Footer Section */}
            <div style={s.footerSection}>
              <div style={s.footerText}>
                <span>By proceeding, you agree to the </span>
                <a
                  href="https://www.videocompany.com/tnc"
                  target="_blank"
                  rel="noreferrer"
                  style={s.footerLink}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                >
                  Terms of service
                </a>
                <span> and </span>
                <a
                  href="https://www.videocompany.com/privacy-policy"
                  target="_blank"
                  rel="noreferrer"
                  style={s.footerLink}
                  onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                >
                  Privacy policy
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right: Image Gallery ─── */}
        <div style={{...s.gallerySide, display: "none"}} className="md-visible-gallery">
          <div style={s.galleryGlow} />
          
          <div style={s.galleryContainer}>
            {/* Column 1 */}
            <div style={s.galleryColumn}>
              <img src="/assetsIcon/Dashboard/image_1.png" alt="Video Company demo" style={{ ...s.galleryImage, height: "281px" }} onError={(e) => { e.target.style.display = 'none'; }} />
              <img src="/assetsIcon/Dashboard/image_4.png" alt="Video Company demo" style={{ ...s.galleryImage, height: "312px" }} onError={(e) => { e.target.style.display = 'none'; }} />
              <img src="/assetsIcon/Dashboard/image_7.png" alt="Video Company demo" style={{ ...s.galleryImage, height: "80px" }} onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            {/* Column 2 */}
            <div style={s.galleryColumn}>
              <img src="/assetsIcon/Dashboard/image_2.png" alt="Video Company demo" style={{ ...s.galleryImage, height: "334px" }} onError={(e) => { e.target.style.display = 'none'; }} />
              <img src="/assetsIcon/Dashboard/image_5.png" alt="Video Company demo" style={{ ...s.galleryImage, height: "334px" }} onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
            {/* Column 3 */}
            <div style={{ ...s.galleryColumn, overflow: "hidden" }}>
              <img src="/assetsIcon/Dashboard/image_3.png" alt="Video Company demo" style={{ ...s.galleryImage, height: "260px" }} onError={(e) => { e.target.style.display = 'none'; }} />
              <img src="/assetsIcon/Dashboard/image_6.png" alt="Video Company demo" style={{ ...s.galleryImage, height: "334px" }} onError={(e) => { e.target.style.display = 'none'; }} />
              <img src="/assetsIcon/Dashboard/image_8.png" alt="Video Company demo" style={{ ...s.galleryImage, height: "80px" }} onError={(e) => { e.target.style.display = 'none'; }} />
            </div>
          </div>
          <div style={s.galleryFadeTop} />
        </div>
      </div>
      <div style={s.pageFadeBottom} />
      
      <style>{`
        .card-content-wrap {
          display: flex;
          flex-direction: column;
          width: 100%;
          height: 100%;
          grid-column: 1 / -1;
        }
        @media (min-width: 768px) {
          .md-visible-gallery {
            display: flex !important;
          }
          .card-content-wrap {
             grid-column: auto;
          }
        }
      `}</style>
    </div>
  );
}
