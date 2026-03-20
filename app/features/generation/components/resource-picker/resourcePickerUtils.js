export const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 10000,
  background: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "16px",
};

export const modalShellStyle = {
  width: "min(1560px, calc(100vw - 8px))",
  height: "min(94vh, 980px)",
  background: "#ffffff",
  borderRadius: "24px",
  boxShadow: "0 24px 64px rgba(15, 23, 42, 0.24)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

export function normalize(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function inferModalKind(title = "", items = []) {
  const token = normalize(title);
  if (token.includes("voice")) return "voice";
  if (token.includes("avatar") || token.includes("actor") || token.includes("model")) return "avatar";
  if (token.includes("background") || token.includes("location")) return "background";

  const first = items[0] || {};
  if (first.sampleVoice) return "voice";
  if (first.gender && (first.thumbnail || first.url)) return "avatar";
  return "generic";
}

export function getVoiceEmoji(item) {
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

export function getUniqueOptions(items, key, fallback = []) {
  const set = new Set();
  (Array.isArray(items) ? items : []).forEach((item) => {
    const value = normalize(item?.[key] || item?.raw?.[key]);
    if (value) set.add(value);
  });
  return set.size ? Array.from(set) : fallback;
}

export function getItemImage(item) {
  return item?.thumbnail || item?.url || item?.raw?.thumbnail || item?.raw?.thumbnail_url || "";
}

export function getVoiceTags(item) {
  const tags = Array.isArray(item?.tags) ? item.tags : [];
  return tags.slice(0, 3);
}

export function getAllItems(itemsByTab) {
  return Object.values(itemsByTab || {}).flatMap((list) => (Array.isArray(list) ? list : []));
}

export function getConfirmLabel(kind, title) {
  if (kind === "voice") return "Select Voice";
  if (kind === "avatar") return normalize(title).includes("actor") ? "Select Actor" : "Select Avatar";
  if (kind === "background") return normalize(title).includes("location") ? "Select Location" : "Select Background";
  return "Select";
}
