/* eslint-disable react/prop-types */
import { useId } from "react";
import { LANGUAGES } from "../../constants";
import {
  colors,
  controlHeight,
  sectionLabelStyle,
  selectStyle,
} from "../../styles";

function BaseIcon({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function LanguageIcon() {
  return (
    <BaseIcon>
      <path d="M5 8h10" />
      <path d="M4 4h12" />
      <path d="M9 4c0 6-2 10-5 12" />
      <path d="M9 4c0 4 2 8 5 10" />
      <path d="M13 15h6" />
      <path d="M16 12l-3 8" />
      <path d="M19 12l3 8" />
    </BaseIcon>
  );
}

export function MicIcon() {
  return (
    <BaseIcon>
      <path d="M12 3a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
      <path d="M19 10a7 7 0 0 1-14 0" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </BaseIcon>
  );
}

export function UserIcon() {
  return (
    <BaseIcon>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </BaseIcon>
  );
}

export function ImageIcon() {
  return (
    <BaseIcon>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </BaseIcon>
  );
}

export function FieldBlock({ label, children, optional = false, rightContent = null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <label style={sectionLabelStyle}>
          {label}
          {optional ? " (Optional)" : ""}
        </label>
        {rightContent}
      </div>
      {children}
    </div>
  );
}

export function CheckBadge() {
  return (
    <span
      style={{
        width: "16px",
        height: "16px",
        borderRadius: "999px",
        background: colors.success,
        color: "#fff",
        fontSize: "11px",
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      ✓
    </span>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function LanguageSelect({ value, onChange }) {
  const hasValue = Boolean(value);

  return (
    <div style={{ position: "relative", height: controlHeight }}>
      <span
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: colors.text,
          fontSize: "14px",
          pointerEvents: "none",
        }}
      >
        <LanguageIcon />
      </span>
      <select value={value} onChange={onChange} style={selectStyle}>
        {LANGUAGES.map((language) => (
          <option key={language} value={language}>
            {language}
          </option>
        ))}
      </select>
      <span
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        {hasValue ? (
          <CheckBadge />
        ) : (
          <span style={{ color: colors.muted, display: "inline-flex" }}>
            <ChevronDownIcon />
          </span>
        )}
      </span>
    </div>
  );
}

export function FileUploadButton({
  label,
  value,
  accept,
  onChange,
  selected = false,
  icon,
  SelectorButton,
}) {
  const inputId = useId();

  return (
    <>
      <label htmlFor={inputId} style={{ display: "block", cursor: "pointer" }}>
        <div style={{ pointerEvents: "none" }}>
          <SelectorButton
            label={label}
            value={value}
            onClick={() => {}}
            selected={selected}
            icon={icon}
          />
        </div>
      </label>
      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files)}
        style={{ display: "none" }}
      />
    </>
  );
}

export function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: "36px",
        height: "20px",
        borderRadius: "999px",
        border: "none",
        background: checked ? colors.primary : "#d1d5db",
        position: "relative",
        cursor: "pointer",
        padding: 0,
        transition: "background-color 150ms ease",
      }}
      aria-pressed={checked}
    >
      <span
        style={{
          position: "absolute",
          top: "2px",
          left: checked ? "18px" : "2px",
          width: "16px",
          height: "16px",
          borderRadius: "999px",
          background: "#fff",
          transition: "left 150ms ease",
        }}
      />
    </button>
  );
}
