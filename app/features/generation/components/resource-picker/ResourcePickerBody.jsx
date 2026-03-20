/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { FilterRadio, FilterSection, SelectField, TabBar } from "./ResourcePickerControls";
import { MediaTile, VoiceCard } from "./ResourcePickerCards";
import { getUniqueOptions, normalize } from "./resourcePickerUtils";

function VoicePickerLayout({
  activeTab,
  setActiveTab,
  voiceItems,
  visualItems,
  genderFilter,
  setGenderFilter,
  ageFilter,
  setAgeFilter,
  languageFilter,
  setLanguageFilter,
  accentFilter,
  setAccentFilter,
  languageOptions,
  accentOptions,
  isCompact,
  isNarrow,
  pendingSelectedId,
  setPendingSelectedId,
  playingVoiceId,
  onTogglePlay,
  onToggleBookmark,
}) {
  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, flexDirection: isCompact ? "column" : "row" }}>
      <div style={{ width: isCompact ? "100%" : "220px", borderRight: isCompact ? "none" : "1px solid #e5e7eb", borderBottom: isCompact ? "1px solid #e5e7eb" : "none", background: "#f9fafb", flexShrink: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "4px" }}>Filters</div>
          <div style={{ fontSize: "12px", color: "#6b7280" }}>{voiceItems.length} voices</div>
        </div>
        <div style={{ padding: "16px", overflowY: "auto", display: "grid", gridTemplateColumns: isCompact ? "repeat(2, minmax(0, 1fr))" : "1fr", gap: "18px" }}>
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
          <button type="button" onClick={() => { setGenderFilter("all"); setAgeFilter("all"); setLanguageFilter(""); setAccentFilter(""); }} style={{ height: "40px", alignSelf: isCompact ? "end" : "stretch", borderRadius: "10px", border: "1px solid #e5e7eb", background: "#ffffff", color: "#6b7280", fontSize: "14px", cursor: "pointer" }}>
            Reset All
          </button>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TabBar activeTab={activeTab} tabs={[{ id: "library", label: "Library" }, { id: "my-voices", label: "My Voices" }]} onChange={setActiveTab} />
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 18px 24px", background: "#ffffff" }}>
          {visualItems.length ? (
            <div style={{ display: "grid", gridTemplateColumns: isNarrow ? "1fr" : "repeat(auto-fill, minmax(190px, 1fr))", gap: "12px", alignItems: "start" }}>
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

export function ResourcePickerBody({
  kind,
  title,
  itemsByTab,
  pendingSelectedId,
  setPendingSelectedId,
  activeTab,
  setActiveTab,
  onTogglePlay,
  playingVoiceId,
  viewportWidth,
  onToggleBookmark,
}) {
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
    if (genderFilter !== "all") next = next.filter((item) => normalize(item?.gender) === genderFilter);
    if (ageFilter !== "all") next = next.filter((item) => normalize(item?.ageGroup || item?.raw?.age_group) === ageFilter);
    if (languageFilter) next = next.filter((item) => normalize(item?.language || item?.raw?.language) === languageFilter);
    if (accentFilter) next = next.filter((item) => normalize(item?.accent || item?.raw?.accent) === accentFilter);
    return next;
  }, [accentFilter, activeItems, activeTab, ageFilter, genderFilter, languageFilter, libraryItems]);

  const visualItems = useMemo(() => (kind === "voice" ? voiceItems : activeItems), [activeItems, kind, voiceItems]);

  if (kind === "voice") {
    return (
      <VoicePickerLayout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        voiceItems={voiceItems}
        visualItems={visualItems}
        genderFilter={genderFilter}
        setGenderFilter={setGenderFilter}
        ageFilter={ageFilter}
        setAgeFilter={setAgeFilter}
        languageFilter={languageFilter}
        setLanguageFilter={setLanguageFilter}
        accentFilter={accentFilter}
        setAccentFilter={setAccentFilter}
        languageOptions={languageOptions}
        accentOptions={accentOptions}
        isCompact={isCompact}
        isNarrow={isNarrow}
        pendingSelectedId={pendingSelectedId}
        setPendingSelectedId={setPendingSelectedId}
        playingVoiceId={playingVoiceId}
        onTogglePlay={onTogglePlay}
        onToggleBookmark={onToggleBookmark}
      />
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
          <div style={{ display: "grid", gridTemplateColumns: isNarrow ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fill, minmax(150px, 1fr))", gap: "12px" }}>
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
