/* eslint-disable react/prop-types */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { colors } from "../styles";

function ChevronIcon({ open }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      {open ? <path d="m6 15 6-6 6 6" /> : <path d="m6 9 6 6 6-6" />}
    </svg>
  );
}

export function CreateTypeDropdown({ value, onChange, options = [] }) {
  const [open, setOpen] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const buttonRef = useRef(null);
  const rootRef = useRef(null);
  const menuRef = useRef(null);
  const selected = options.find((type) => type.id === value || type.templateName === value) || options[0];

  useEffect(() => {
    const handler = (event) => {
      const target = event.target;
      const clickedRoot = rootRef.current?.contains(target);
      const clickedMenu = menuRef.current?.contains(target);

      if (!clickedRoot && !clickedMenu) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useLayoutEffect(() => {
    if (!open || !buttonRef.current || typeof window === "undefined") return;

    const updateRect = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const top = rect.bottom + 8;
      const bottomGap = 24;
      const availableHeight = Math.max(220, viewportHeight - top - bottomGap);

      setMenuRect({
        top,
        left: rect.left,
        width: rect.width,
        maxHeight: Math.min(availableHeight, 560),
      });
    };

    updateRect();
    window.addEventListener("resize", updateRect);
    window.addEventListener("scroll", updateRect, true);

    return () => {
      window.removeEventListener("resize", updateRect);
      window.removeEventListener("scroll", updateRect, true);
    };
  }, [open]);

  const renderPreview = (option) => {
    if (option?.thumbnail) {
      return (
        <img
          src={option.thumbnail}
          alt={option.label || option.displayName || "Format"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      );
    }

    return <span style={{ fontSize: "20px" }}>{option?.emoji || "🎬"}</span>;
  };

  const menu = open && menuRect && typeof document !== "undefined"
    ? createPortal(
        <div
          ref={menuRef}
          style={{
            position: "fixed",
            top: `${menuRect.top}px`,
            left: `${menuRect.left}px`,
            width: `${menuRect.width}px`,
            maxHeight: `${menuRect.maxHeight}px`,
            zIndex: 9999,
            background: colors.white,
            border: `1px solid ${colors.border}`,
            borderRadius: "8px",
            boxShadow: "0 16px 36px rgba(15, 23, 42, 0.18)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "14px 16px 6px",
              fontSize: "11px",
              fontWeight: 700,
              color: colors.muted,
              letterSpacing: "0.08em",
            }}
          >
            CREATE TYPE
          </div>
          <div style={{ overflowY: "auto", maxHeight: `${Math.max(160, menuRect.maxHeight - 40)}px` }}>
            {options.map((type) => {
              const isSelected = type.id === value || type.templateName === value;
              return (
                <button
                  key={type.id || type.templateName}
                  type="button"
                  onClick={() => {
                    onChange(type.id || type.templateName);
                    setOpen(false);
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "none",
                    background: isSelected ? "#eef3ff" : colors.white,
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "10px",
                      overflow: "hidden",
                      background: "#fff",
                      border: `1px solid ${colors.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {renderPreview(type)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>
                      {type.label || type.displayName}
                    </div>
                    <div style={{ fontSize: "12px", color: colors.muted }}>
                      {type.description || ""}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((isOpen) => !isOpen)}
        style={{
          width: "100%",
          minHeight: "64px",
          padding: "10px 14px",
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              overflow: "hidden",
              background: "#fff",
              border: `1px solid ${colors.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {renderPreview(selected)}
          </div>
          <div style={{ textAlign: "left", minWidth: 0 }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: colors.text }}>
              {selected?.label || selected?.displayName || "Select format"}
            </div>
            <div style={{ fontSize: "12px", color: colors.muted }}>
              {selected?.description || ""}
            </div>
          </div>
        </div>
        <span style={{ color: colors.muted, display: "inline-flex", flexShrink: 0 }}>
          <ChevronIcon open={open} />
        </span>
      </button>

      {menu}
    </div>
  );
}
