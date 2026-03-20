/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ResourcePickerBody } from "./resource-picker/ResourcePickerBody";
import { ModalFooter } from "./resource-picker/ResourcePickerControls";
import { CloseIcon } from "./resource-picker/ResourcePickerIcons";
import { useViewportWidth } from "./resource-picker/ResourcePickerViewport";
import {
  getAllItems,
  getConfirmLabel,
  inferModalKind,
  modalShellStyle,
  overlayStyle,
} from "./resource-picker/resourcePickerUtils";

export function ResourcePickerModal({
  open,
  title,
  itemsByTab,
  loading,
  error,
  selectedId,
  emptyText = "No items available.",
  onClose,
  onSelect,
  onToggleBookmark,
}) {
  const kind = inferModalKind(title, itemsByTab?.library || []);
  const [pendingSelectedId, setPendingSelectedId] = useState("");
  const [activeTab, setActiveTab] = useState("library");
  const [playingVoiceId, setPlayingVoiceId] = useState("");
  const audioRef = useRef(null);
  const viewportWidth = useViewportWidth();
  const allItems = useMemo(() => getAllItems(itemsByTab), [itemsByTab]);

  useEffect(() => {
    if (!open) return;
    setPendingSelectedId(String(selectedId || ""));
    setActiveTab("library");
  }, [open, selectedId, title]);

  useEffect(() => {
    if (!open && audioRef.current) {
      audioRef.current.pause();
      setPlayingVoiceId("");
    }
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return undefined;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  const confirmLabel = useMemo(() => getConfirmLabel(kind, title), [kind, title]);

  const handleConfirm = () => {
    const selected = allItems.find((item) => String(item?.id || "") === String(pendingSelectedId || ""));
    if (selected) onSelect(selected);
  };

  const handleTogglePlay = (item) => {
    const audioUrl = item?.sampleVoice;
    if (!audioUrl) return;
    if (!audioRef.current) audioRef.current = new Audio();

    const audio = audioRef.current;
    if (String(playingVoiceId || "") === String(item.id)) {
      audio.pause();
      setPlayingVoiceId("");
      return;
    }
    audio.src = audioUrl;
    audio.play().catch(() => {});
    setPlayingVoiceId(String(item.id));
    audio.onended = () => setPlayingVoiceId("");
  };

  if (!open || typeof document === "undefined") return null;

  const modalWidth = kind === "voice"
    ? viewportWidth < 900 ? "calc(100vw - 8px)" : "min(1560px, calc(100vw - 8px))"
    : kind === "avatar" || kind === "background"
      ? viewportWidth < 900 ? "calc(100vw - 8px)" : "min(1460px, calc(100vw - 8px))"
      : "min(760px, calc(100vw - 16px))";

  return createPortal(
    <div
      style={overlayStyle}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") onClose();
      }}
    >
      <div
        style={{
          ...modalShellStyle,
          width: modalWidth,
          height: viewportWidth < 900 ? "min(96vh, 1040px)" : modalShellStyle.height,
          borderRadius: viewportWidth < 640 ? "18px" : modalShellStyle.borderRadius,
        }}
        role="dialog"
        aria-modal="true"
      >
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#111827" }}>{title}</h2>
          <button type="button" onClick={onClose} style={{ border: "none", background: "transparent", color: "#9ca3af", cursor: "pointer", display: "inline-flex", padding: "4px" }} aria-label="Close modal">
            <CloseIcon />
          </button>
        </div>

        {loading ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "14px" }}>
            Loading...
          </div>
        ) : error ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#dc2626", fontSize: "14px" }}>
            {error}
          </div>
        ) : allItems.length === 0 ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: "14px" }}>
            {emptyText}
          </div>
        ) : (
          <ResourcePickerBody
            kind={kind}
            title={title}
            itemsByTab={itemsByTab}
            pendingSelectedId={pendingSelectedId}
            setPendingSelectedId={setPendingSelectedId}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onTogglePlay={handleTogglePlay}
            playingVoiceId={playingVoiceId}
            viewportWidth={viewportWidth}
            onToggleBookmark={onToggleBookmark}
          />
        )}

        <ModalFooter
          onClose={onClose}
          onConfirm={handleConfirm}
          confirmLabel={confirmLabel}
          confirmDisabled={!pendingSelectedId}
        />
      </div>
    </div>,
    document.body,
  );
}
