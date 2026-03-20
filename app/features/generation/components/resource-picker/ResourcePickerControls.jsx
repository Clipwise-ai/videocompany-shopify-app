/* eslint-disable react/prop-types */
export function FilterSection({ title, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{title}</div>
      {children}
    </div>
  );
}

export function FilterRadio({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        border: "none",
        background: "transparent",
        padding: 0,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        color: active ? "#2563eb" : "#6b7280",
        fontSize: "14px",
        cursor: "pointer",
      }}
    >
      <span
        style={{
          width: "16px",
          height: "16px",
          borderRadius: "999px",
          border: `1.5px solid ${active ? "#2563eb" : "#9ca3af"}`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {active ? <span style={{ width: "8px", height: "8px", borderRadius: "999px", background: "#2563eb" }} /> : null}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function SelectField({ value, options, onChange, placeholder }) {
  return (
    <div style={{ position: "relative" }}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{
          width: "100%",
          height: "40px",
          borderRadius: "10px",
          border: "1px solid #d1d5db",
          background: "#ffffff",
          padding: "0 34px 0 12px",
          fontSize: "14px",
          color: value ? "#111827" : "#6b7280",
          appearance: "none",
          outline: "none",
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>⌄</span>
    </div>
  );
}

export function TabBar({ activeTab, tabs, onChange }) {
  return (
    <div style={{ padding: "0 24px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "flex-end", minHeight: "48px" }}>
      <div style={{ display: "flex", gap: "24px" }}>
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              style={{
                border: "none",
                background: "transparent",
                padding: "0 4px 12px",
                marginBottom: "-1px",
                borderBottom: active ? "2px solid #2563eb" : "2px solid transparent",
                color: active ? "#2563eb" : "#6b7280",
                fontSize: "14px",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function ModalFooter({ onClose, onConfirm, confirmLabel, confirmDisabled }) {
  return (
    <div style={{ padding: "16px 24px", borderTop: "1px solid #e5e7eb", background: "#f9fafb", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
      <button
        type="button"
        onClick={onClose}
        style={{
          height: "40px",
          padding: "0 16px",
          borderRadius: "10px",
          border: "1px solid #2563eb",
          background: "#ffffff",
          color: "#2563eb",
          fontSize: "14px",
          fontWeight: 500,
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={confirmDisabled}
        style={{
          height: "40px",
          padding: "0 18px",
          borderRadius: "10px",
          border: "none",
          background: confirmDisabled ? "#d1d5db" : "#2563eb",
          color: "#ffffff",
          fontSize: "14px",
          fontWeight: 500,
          cursor: confirmDisabled ? "not-allowed" : "pointer",
        }}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
