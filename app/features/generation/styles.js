export const colors = {
  border: "#e5e7eb",
  borderHover: "#d1d5db",
  text: "#111827",
  muted: "#6b7280",
  bg: "#f9fafb",
  white: "#ffffff",
  primary: "#3b82f6", // Updated to match blue-500 from Tailwind
  primaryHover: "#2563eb", // blue-600
  success: "#22c55e",
  disabled: "#9ca3af",
  error: "#dc2626",
};

export const cardRadius = "8px"; // updated from 12px to match rounded-lg
export const controlHeight = "40px"; // h-10
export const ctaHeight = "48px"; // py-3 text-md is roughly 48px

export const fieldStyle = {
  width: "100%",
  minHeight: controlHeight,
  padding: "10px 12px",
  border: `1px solid ${colors.border}`,
  borderRadius: cardRadius,
  background: colors.bg,
  color: colors.text,
  fontSize: "14px",
  fontWeight: 500,
  fontFamily: "inherit",
  boxSizing: "border-box",
  appearance: "none",
  outline: "none",
};

export const selectStyle = {
  ...fieldStyle,
  paddingLeft: "40px",
  paddingRight: "36px",
  cursor: "pointer",
};

export const rowBtnStyle = {
  ...fieldStyle,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
};

export const textareaStyle = {
  ...fieldStyle,
  minHeight: "88px",
  resize: "none",
  cursor: "text",
  padding: "12px",
  lineHeight: 1.45,
};

export const sectionLabelStyle = {
  display: "block",
  marginBottom: "6px",
  fontSize: "14px",
  fontWeight: 500,
  color: colors.text,
};

export const tileButtonStyle = {
  width: "100%",
  minHeight: controlHeight,
  padding: "0 12px",
  border: `1px solid ${colors.border}`,
  borderRadius: cardRadius,
  background: colors.bg,
  color: colors.text,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  cursor: "pointer",
  transition: "background 120ms ease, border-color 120ms ease",
  boxSizing: "border-box",
};

export const primaryButtonStyle = {
  width: "100%",
  minHeight: ctaHeight,
  borderRadius: "999px",
  border: "none",
  background: colors.primary,
  color: colors.white,
  fontSize: "15px",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  padding: "0 18px",
};
