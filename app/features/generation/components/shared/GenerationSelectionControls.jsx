/* eslint-disable react/prop-types */
import { colors, tileButtonStyle } from "../../styles";
import { CheckBadge } from "./GenerationPrimitives";

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function IconSlot({ imageUrl, fallback }) {
  return (
    <span
      style={{
        width: "24px",
        height: "24px",
        borderRadius: "8px",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: imageUrl ? "#fff" : "transparent",
        border: imageUrl ? `1px solid ${colors.border}` : "none",
        flexShrink: 0,
      }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <span
          style={{
            color: colors.text,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {fallback}
        </span>
      )}
    </span>
  );
}

export function SelectorButton({
  label,
  value,
  onClick,
  selected = false,
  imageUrl = "",
  icon = "+",
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...tileButtonStyle,
        opacity: disabled ? 0.65 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
        <IconSlot imageUrl={imageUrl} fallback={icon} />
        <div style={{ fontSize: "14px", fontWeight: 500, color: colors.text, minWidth: 0 }}>
          <span
            style={{
              display: "block",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {value || label}
          </span>
        </div>
      </div>
      {selected ? (
        <CheckBadge />
      ) : (
        <span style={{ color: colors.muted, display: "inline-flex" }}>
          <PlusIcon />
        </span>
      )}
    </button>
  );
}
