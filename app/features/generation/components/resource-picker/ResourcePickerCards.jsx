/* eslint-disable react/prop-types */
import { useState } from "react";
import { BookmarkIcon, CheckIcon, PauseIcon, PlayIcon } from "./ResourcePickerIcons";
import { getItemImage, getVoiceEmoji, getVoiceTags } from "./resourcePickerUtils";

export function VoiceCard({ item, selected, playing, onTogglePlay, onSelect, onToggleBookmark }) {
  const tags = getVoiceTags(item);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        minHeight: "92px",
        background: "#ffffff",
        borderRadius: "18px",
        border: selected ? "2px solid #3b82f6" : "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: selected ? "0 0 0 2px rgba(59, 130, 246, 0.12)" : "none",
        transition: "border-color 0.15s ease, box-shadow 0.15s ease",
      }}
    >
      <button
        type="button"
        onClick={() => onSelect(item)}
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          background: "transparent",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          textAlign: "left",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0, width: "100%", paddingRight: "34px" }}>
          <div style={{ fontSize: "16px", fontWeight: 500, color: "#111827", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1, minWidth: 0 }}>
            {item.name}
          </div>
          <span style={{ fontSize: "14px", lineHeight: 1, flexShrink: 0 }}>{getVoiceEmoji(item)}</span>
        </div>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", minHeight: "22px", overflow: "hidden" }}>
          {tags.map((tag) => (
            <span key={tag.id || tag.name} style={{ padding: "2px 10px", background: "#f9fafb", border: "1px solid rgba(0, 0, 0, 0.05)", borderRadius: "999px", fontSize: "12px", color: "#111827", lineHeight: 1.4, whiteSpace: "nowrap" }}>
              {tag.name}
            </span>
          ))}
        </div>
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onTogglePlay(item);
        }}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          width: "28px",
          height: "28px",
          borderRadius: "999px",
          border: "none",
          background: playing ? "#dbeafe" : "#eff6ff",
          color: "#3b82f6",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      {typeof onToggleBookmark === "function" && isHovered ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleBookmark(item);
          }}
          aria-label={item?.is_bookmarked ? "Remove bookmark" : "Bookmark voice"}
          style={{
            position: "absolute",
            top: "10px",
            right: "44px",
            width: "28px",
            height: "28px",
            borderRadius: "999px",
            border: "none",
            background: "#ffffff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            color: "#3b82f6",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BookmarkIcon active={Boolean(item?.is_bookmarked || item?.raw?.is_bookmarked)} />
        </button>
      ) : null}
    </div>
  );
}

export function MediaTile({ item, selected, onSelect, showBookmark = false, onToggleBookmark }) {
  const [isHovered, setIsHovered] = useState(false);
  const imageUrl = getItemImage(item);
  const bookmarked = Boolean(item?.raw?.is_bookmarked || item?.is_bookmarked);

  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: "9 / 16",
        borderRadius: "14px",
        overflow: "hidden",
        border: selected ? "2px solid #3b82f6" : "1px solid #e5e7eb",
        boxShadow: selected ? "0 4px 16px rgba(59, 130, 246, 0.15)" : "none",
        background: "#f3f4f6",
        cursor: "pointer",
      }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={item.name || "Asset"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "12px", background: "#f3f4f6" }}>
          No Image
        </div>
      )}
      {showBookmark && isHovered ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleBookmark?.(item);
          }}
          aria-label={bookmarked ? "Remove bookmark" : "Bookmark asset"}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            width: "28px",
            height: "28px",
            borderRadius: "999px",
            background: "#ffffff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#3b82f6",
            border: "none",
            cursor: "pointer",
          }}
        >
          <BookmarkIcon active={bookmarked} />
        </button>
      ) : null}
      {selected ? (
        <span style={{ position: "absolute", top: "8px", left: "8px", width: "24px", height: "24px", borderRadius: "999px", background: "#3b82f6", color: "#ffffff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <CheckIcon />
        </span>
      ) : null}
    </button>
  );
}
