/* eslint-disable react/prop-types */
export function BillingNotice({ tone, title, message, action }) {
  const palette =
    tone === "success"
      ? { border: "#86EFAC", background: "#ECFDF3", title: "#166534", text: "#166534" }
      : tone === "info"
        ? { border: "#93C5FD", background: "#EFF6FF", title: "#1D4ED8", text: "#1E3A8A" }
        : { border: "#FCD34D", background: "#FFFBEB", title: "#92400E", text: "#78350F" };

  return (
    <div style={{ margin: "0 0 16px", border: `1px solid ${palette.border}`, background: palette.background, borderRadius: 16, padding: "16px 18px" }}>
      <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: palette.title, marginBottom: 6 }}>{title}</div>
          <div style={{ fontSize: 14, lineHeight: 1.5, color: palette.text }}>{message}</div>
        </div>
        {action || null}
      </div>
    </div>
  );
}
