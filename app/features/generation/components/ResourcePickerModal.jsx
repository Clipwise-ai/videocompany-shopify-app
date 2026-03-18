/* eslint-disable react/prop-types */
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
};

const modalShellStyle = {
  width: "min(1560px, calc(100vw - 8px))",
  height: "min(94vh, 980px)",
  background: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 24px 64px rgba(15, 23, 42, 0.24)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M7 5h4v14H7zM13 5h4v14h-4z" />
    </svg>
  );
}

function BookmarkIcon({ active = false }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

function normalize(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function inferModalKind(title = "", items = []) {
  const token = normalize(title);
  if (token.includes("voice")) return "voice";
  if (token.includes("avatar") || token.includes("actor") || token.includes("model")) return "avatar";
  if (token.includes("background") || token.includes("location")) return "background";

  const first = items[0] || {};
  if (first.sampleVoice) return "voice";
  if (first.gender && (first.thumbnail || first.url)) return "avatar";
  return "generic";
}

function getVoiceEmoji(item) {
  const gender = normalize(item?.gender);
  const ageGroup = normalize(item?.ageGroup || item?.raw?.age_group || item?.raw?.ageGroup);

  if (gender === "female") {
    if (ageGroup === "young") return "👧";
    if (ageGroup === "old") return "👵";
    return "👩";
  }
  if (gender === "male") {
    if (ageGroup === "young") return "👦";
    if (ageGroup === "old") return "👴";
    return "👨";
  }
  return "👤";
}

function getUniqueOptions(items, key, fallback = []) {
  const set = new Set();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const value = normalize(item?.[key] || item?.raw?.[key]);
    if (value) set.add(value);
  });
  return set.size ? Array.from(set) : fallback;
}

function getItemImage(item) {
  return item?.thumbnail || item?.url || item?.raw?.thumbnail || item?.raw?.thumbnail_url || "";
}

function getVoiceTags(item) {
  const tags = Array.isArray(item?.tags) ? item.tags : [];
  return tags.slice(0, 3);
}

function useViewportWidth() {
  const [width, setWidth] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return width;
}

function FilterSection({ title, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>{title}</div>
      {children}
    </div>
  );
}

function FilterRadio({ label, active, onClick }) {
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

function SelectField({ value, options, onChange, placeholder }) {
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

function VoiceCard({ item, selected, playing, onTogglePlay, onSelect, onToggleBookmark }) {
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
            <span
              key={tag.id || tag.name}
              style={{
                padding: "2px 10px",
                background: "#f9fafb",
                border: "1px solid rgba(0, 0, 0, 0.05)",
                borderRadius: "999px",
                fontSize: "12px",
                color: "#111827",
                lineHeight: 1.4,
                whiteSpace: "nowrap",
              }}
            >
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

function MediaTile({ item, selected, onSelect, showBookmark = false, onToggleBookmark }) {
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
        <span
          style={{
            position: "absolute",
            top: "8px",
            left: "8px",
            width: "24px",
            height: "24px",
            borderRadius: "999px",
            background: "#3b82f6",
            color: "#ffffff",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CheckIcon />
        </span>
      ) : null}
    </button>
  );
}

function TabBar({ activeTab, tabs, onChange }) {
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

function ModalFooter({ onClose, onConfirm, confirmLabel, confirmDisabled }) {
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

function ResourcePickerBody({ kind, title, itemsByTab, pendingSelectedId, setPendingSelectedId, activeTab, setActiveTab, onTogglePlay, playingVoiceId, viewportWidth, onToggleBookmark }) {
  const [genderFilter, setGenderFilter] = useState("all");
  const [ageFilter, setAgeFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("");
  const [accentFilter, setAccentFilter] = useState("");

  useEffect(() => {
    setGenderFilter("all");
    setAgeFilter("all");
    setLanguageFilter("");
    setAccentFilter("");
  }, [kind, title]);

  const libraryItems = useMemo(() => {
    const list = itemsByTab?.library;
    return Array.isArray(list) ? list : [];
  }, [itemsByTab]);
  const activeItems = useMemo(() => {
    const list = itemsByTab?.[activeTab];
    return Array.isArray(list) ? list : [];
  }, [activeTab, itemsByTab]);
  const languageOptions = useMemo(() => getUniqueOptions(libraryItems, "language"), [libraryItems]);
  const accentOptions = useMemo(() => getUniqueOptions(libraryItems, "accent"), [libraryItems]);
  const isCompact = viewportWidth < 900;
  const isNarrow = viewportWidth < 640;

  const voiceItems = useMemo(() => {
    let next = activeTab === "my-voices" ? activeItems : libraryItems;
    if (genderFilter !== "all") {
      next = next.filter((item) => normalize(item?.gender) === genderFilter);
    }
    if (ageFilter !== "all") {
      next = next.filter((item) => normalize(item?.ageGroup || item?.raw?.age_group) === ageFilter);
    }
    if (languageFilter) {
      next = next.filter((item) => normalize(item?.language || item?.raw?.language) === languageFilter);
    }
    if (accentFilter) {
      next = next.filter((item) => normalize(item?.accent || item?.raw?.accent) === accentFilter);
    }
    return next;
  }, [accentFilter, activeItems, activeTab, ageFilter, genderFilter, languageFilter, libraryItems]);

  const visualItems = useMemo(() => {
    if (kind === "voice") return voiceItems;
    return activeItems;
  }, [activeItems, kind, voiceItems]);

  if (kind === "voice") {
    return (
      <div style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: isCompact ? "column" : "row" }}>
        <div
          style={{
            width: isCompact ? "100%" : "220px",
            borderRight: isCompact ? "none" : "1px solid #e5e7eb",
            borderBottom: isCompact ? "1px solid #e5e7eb" : "none",
            background: "#f9fafb",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ padding: "20px 16px", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>Filters</div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>{voiceItems.length} voices</div>
          </div>
          <div
            style={{
              padding: "16px",
              overflowY: "auto",
              display: "grid",
              gridTemplateColumns: isCompact ? "repeat(2, minmax(0, 1fr))" : "1fr",
              gap: "18px",
            }}
          >
            <FilterSection title="Gender">
              <FilterRadio label="All genders" active={genderFilter === "all"} onClick={() => setGenderFilter("all")} />
              <FilterRadio label="Female" active={genderFilter === "female"} onClick={() => setGenderFilter("female")} />
              <FilterRadio label="Male" active={genderFilter === "male"} onClick={() => setGenderFilter("male")} />
            </FilterSection>
            <FilterSection title="Age">
              <FilterRadio label="All ages" active={ageFilter === "all"} onClick={() => setAgeFilter("all")} />
              <FilterRadio label="Middle-Aged" active={ageFilter === "middle-aged"} onClick={() => setAgeFilter("middle-aged")} />
              <FilterRadio label="Old" active={ageFilter === "old"} onClick={() => setAgeFilter("old")} />
              <FilterRadio label="Young" active={ageFilter === "young"} onClick={() => setAgeFilter("young")} />
            </FilterSection>
            <FilterSection title="Language">
              <SelectField value={languageFilter} options={languageOptions} onChange={setLanguageFilter} placeholder="All languages" />
            </FilterSection>
            <FilterSection title="Accent">
              <SelectField value={accentFilter} options={accentOptions} onChange={setAccentFilter} placeholder="All accents" />
            </FilterSection>
            <button
              type="button"
              onClick={() => {
                setGenderFilter("all");
                setAgeFilter("all");
                setLanguageFilter("");
                setAccentFilter("");
              }}
              style={{
                height: "40px",
                alignSelf: isCompact ? "end" : "stretch",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                background: "#ffffff",
                color: "#6b7280",
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              Reset All
            </button>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <TabBar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            tabs={[
              { id: "library", label: "Library" },
              { id: "my-voices", label: "My Voices" },
            ]}
            onChange={setActiveTab}
          />
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px 24px", background: "#ffffff" }}>
            {visualItems.length ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isNarrow ? "1fr" : "repeat(auto-fill, minmax(190px, 1fr))",
                  gap: "12px",
                  alignItems: "start",
                }}
              >
                {visualItems.map((item) => (
                  <VoiceCard
                    key={item.id}
                    item={item}
                    selected={String(pendingSelectedId || "") === String(item.id)}
                    playing={String(playingVoiceId || "") === String(item.id)}
                    onTogglePlay={onTogglePlay}
                    onSelect={(next) => setPendingSelectedId(String(next.id))}
                    onToggleBookmark={onToggleBookmark}
                  />
                ))}
              </div>
            ) : (
              <div style={{ padding: "32px 8px", fontSize: "14px", color: "#6b7280" }}>
                No voices available for this tab and filter combination.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const isBackground = kind === "background";
  const tabs = isBackground
    ? [
        { id: "library", label: "Library" },
        { id: normalize(title).includes("location") ? "my-locations" : "my-backgrounds", label: normalize(title).includes("location") ? "My Locations" : "My Backgrounds" },
      ]
    : [
        { id: "library", label: "Library" },
        { id: "my-avatars", label: "My Avatars" },
      ];

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <TabBar activeTab={activeTab} tabs={tabs} onChange={setActiveTab} />
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", background: "#ffffff" }}>
        {visualItems.length ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isNarrow ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fill, minmax(150px, 1fr))",
              gap: "12px",
            }}
          >
            {visualItems.map((item) => (
              <MediaTile
                key={item.id}
                item={item}
                selected={String(pendingSelectedId || "") === String(item.id)}
                onSelect={(next) => setPendingSelectedId(String(next.id))}
                showBookmark={kind !== "generic"}
                onToggleBookmark={onToggleBookmark}
              />
            ))}
          </div>
        ) : (
          <div style={{ padding: "32px 8px", fontSize: "14px", color: "#6b7280" }}>
            No items available for this tab.
          </div>
        )}
      </div>
    </div>
  );
}

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

  const confirmLabel = useMemo(() => {
    if (kind === "voice") return "Select Voice";
    if (kind === "avatar") return normalize(title).includes("actor") ? "Select Actor" : "Select Avatar";
    if (kind === "background") return normalize(title).includes("location") ? "Select Location" : "Select Background";
    return "Select";
  }, [kind, title]);

  const handleConfirm = () => {
    const allItems = Object.values(itemsByTab || {}).flatMap((list) => (Array.isArray(list) ? list : []));
    const selected = allItems.find((item) => String(item?.id || "") === String(pendingSelectedId || ""));
    if (selected) {
      onSelect(selected);
    }
  };

  const handleTogglePlay = (item) => {
    const audioUrl = item?.sampleVoice;
    if (!audioUrl) return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
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
    <div style={overlayStyle} onClick={onClose}>
      <div
        style={{
          ...modalShellStyle,
          width: modalWidth,
          height: viewportWidth < 900 ? "min(96vh, 1040px)" : modalShellStyle.height,
          borderRadius: viewportWidth < 640 ? "18px" : modalShellStyle.borderRadius,
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#111827" }}>{title}</h2>
          <button
            type="button"
            onClick={onClose}
            style={{ border: "none", background: "transparent", color: "#9ca3af", cursor: "pointer", display: "inline-flex", padding: "4px" }}
            aria-label="Close modal"
          >
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
        ) : Object.values(itemsByTab || {}).flatMap((list) => (Array.isArray(list) ? list : [])).length === 0 ? (
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
