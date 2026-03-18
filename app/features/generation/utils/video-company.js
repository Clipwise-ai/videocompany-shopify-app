import { FLOW_META, PLAN_FLOW, TEMPLATE_NAME_TO_FLOW } from "../constants";

export function pickFirstString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }
  return "";
}

export function resolveMediaUrl(url, baseUrl = "") {
  const value = pickFirstString(url);
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/")) return `${baseUrl}${value}`;
  return value;
}

function normalize(value) {
  return typeof value === "string" ? value.toLowerCase().trim() : "";
}

function normalizeToken(value) {
  return normalize(value).replace(/[\s_-]+/g, "");
}

export function resolvePlanFlowFromTemplateName(templateName) {
  return TEMPLATE_NAME_TO_FLOW[normalize(templateName)] || PLAN_FLOW.UGC;
}

export function resolvePlanFlowFromFormat(format) {
  if (!format) return PLAN_FLOW.UGC;
  const templateName = normalize(format.templateName);
  if (templateName && TEMPLATE_NAME_TO_FLOW[templateName]) {
    return TEMPLATE_NAME_TO_FLOW[templateName];
  }

  const display = normalize(format.displayName);
  const displayToken = normalizeToken(format.displayName);

  if (display.includes("roll")) return PLAN_FLOW.BROLL;
  if (display.includes("clone")) return PLAN_FLOW.UGC_CLONE;
  if (display.includes("actor") || display.includes("avatar")) return PLAN_FLOW.ACTOR;
  if (display.includes("model")) return PLAN_FLOW.MODEL;
  if (display.includes("background")) return PLAN_FLOW.PRODUCT_BACKGROUND;
  if (displayToken.includes("imagetovideo")) return PLAN_FLOW.IMAGE_TO_VIDEO;
  if (displayToken.includes("texttoimage")) return PLAN_FLOW.TEXT_TO_IMAGE;
  if (displayToken.includes("videototext")) return PLAN_FLOW.VIDEO_TO_TEXT;
  if (displayToken.includes("staticad")) return PLAN_FLOW.STATIC_AD;
  return PLAN_FLOW.UGC;
}

export function findFormatBySelection(formats = [], selectedValue = "") {
  if (!Array.isArray(formats) || formats.length === 0) return null;

  return formats.find((item) => (
    item?.id === selectedValue || item?.templateName === selectedValue
  )) || formats[0] || null;
}

export function getVideoFormatPayloadValue(format) {
  return pickFirstString(format?.id, format?.templateName);
}

export function normalizeVideoFormat(rawFormat = {}) {
  const id = pickFirstString(rawFormat.id, rawFormat.value, rawFormat.template_name);
  const templateName = pickFirstString(rawFormat.template_name, rawFormat.templateName, id);
  const displayName = pickFirstString(
    rawFormat.display_name,
    rawFormat.displayName,
    rawFormat.name,
    rawFormat.title,
    templateName || id || "Format",
  );
  const flow = resolvePlanFlowFromFormat({ templateName, displayName });
  const meta = FLOW_META[flow] || FLOW_META[PLAN_FLOW.UGC];

  return {
    id: id || templateName || displayName,
    value: id || templateName || displayName,
    templateName,
    displayName,
    label: displayName || meta.label,
    description: pickFirstString(
      rawFormat.description,
      rawFormat.subtitle,
      rawFormat.meta?.description,
      meta.description,
    ),
    emoji: meta.emoji,
    generates: meta.generates,
    flow,
    thumbnail: pickFirstString(
      rawFormat.thumbnail,
      rawFormat.thumbnail_url,
      rawFormat.image,
      rawFormat.sample_video_thumbnail,
    ),
    raw: rawFormat,
  };
}

export function normalizeFormatsResponse(payload) {
  const results = Array.isArray(payload?.results)
    ? payload.results
    : Array.isArray(payload)
      ? payload
      : [];

  return results.map(normalizeVideoFormat).filter((item) => item.id);
}

export function inferMediaType(url = "", explicit = "") {
  const type = normalize(explicit);
  if (type.includes("video")) return "video";
  if (type.includes("image")) return "image";
  const lower = String(url || "").toLowerCase();
  if (
    lower.includes(".mp4") ||
    lower.includes(".webm") ||
    lower.includes(".mov") ||
    lower.includes(".m4v")
  ) {
    return "video";
  }
  return "image";
}

export function extractFinalVideoUrl(data = {}, baseUrl = "") {
  const outputs = data?.outputs && typeof data.outputs === "object" ? data.outputs : {};
  return resolveMediaUrl(
    pickFirstString(
      outputs.final_video_url,
      outputs.finalVideoUrl,
      data.final_video_url,
      data.finalVideoUrl,
      data.video_url,
      data.videoUrl,
    ),
    baseUrl,
  );
}

export function extractGeneratedImages(data = {}, baseUrl = "") {
  const outputs = data?.outputs && typeof data.outputs === "object" ? data.outputs : {};
  const images = Array.isArray(outputs.generated_images) ? outputs.generated_images : [];

  return images
    .map((item, index) => {
      const url = resolveMediaUrl(
        pickFirstString(item.url, item.file_url, item.fileUrl, item.image_url),
        baseUrl,
      );
      if (!url) return null;
      return {
        id: pickFirstString(item.generated_media_id, item.media_id, item.id, `${index}`),
        url,
        mediaType: "image",
        title: pickFirstString(item.title, item.name, `Image ${index + 1}`),
        raw: item,
      };
    })
    .filter(Boolean);
}

export function extractSubjectProfileIds(data = {}) {
  if (Array.isArray(data.subject_profile_ids)) {
    return data.subject_profile_ids.map((value) => String(value));
  }
  const single = pickFirstString(data.subject_profile_id, data.outputs?.subject_profile_id);
  return single ? [single] : [];
}

export function normalizeVariation(item = {}, index = 0, baseUrl = "") {
  const url = resolveMediaUrl(
    pickFirstString(item.file_url, item.fileUrl, item.url, item.thumbnail),
    baseUrl,
  );
  return {
    id: pickFirstString(item.id, item.media_id, item.uuid, `${index}`),
    url,
    mediaType: inferMediaType(url, pickFirstString(item.asset_type, item.assetType)),
    title: pickFirstString(item.title, item.name, `Variation ${index + 1}`),
    status: normalize(item.status),
    raw: item,
  };
}

export function extractBrollSituations(data = {}) {
  const outputs = data?.outputs && typeof data.outputs === "object" ? data.outputs : {};
  const structures = Array.isArray(outputs?.situation_plan?.structures)
    ? outputs.situation_plan.structures
    : [];
  const direct = Array.isArray(outputs.situations) ? outputs.situations : [];
  const labels = new Set();

  structures.forEach((entry) => {
    const title = pickFirstString(entry?.situation);
    if (title) labels.add(title);
  });

  direct.forEach((entry) => {
    const title = pickFirstString(entry?.title, entry?.situation, entry);
    if (title) labels.add(title);
  });

  return Array.from(labels).map((title) => ({ id: title, title }));
}

export function extractGeneratedMediaIds(data = {}) {
  const outputs = data?.outputs && typeof data.outputs === "object" ? data.outputs : {};
  const ids = Array.isArray(outputs.generated_media_ids) ? outputs.generated_media_ids : [];
  return ids.map((value) => String(value)).filter(Boolean);
}

export function normalizeResourceItem(item = {}, baseUrl = "") {
  const id = pickFirstString(item.id, item.media_id, item.upload_id, item.uuid);
  const url = resolveMediaUrl(
    pickFirstString(
      item.thumbnail,
      item.thumbnail_url,
      item.file_url,
      item.file,
      item.url,
      item.image,
    ),
    baseUrl,
  );
  const rawTags = Array.isArray(item.tags)
    ? item.tags
    : Array.isArray(item.raw?.tags)
      ? item.raw.tags
      : [];

  return {
    id,
    name: pickFirstString(
      item.display_name,
      item.displayName,
      item.name,
      item.title,
      item.file_name,
      item.filename,
      "Untitled",
    ),
    url,
    mediaType: inferMediaType(url, pickFirstString(item.asset_type, item.media_type, item.type)),
    sampleVoice: resolveMediaUrl(
      pickFirstString(item.sample_voice, item.sampleVoice),
      baseUrl,
    ),
    gender: pickFirstString(item.gender, item.meta?.gender, item.raw?.gender),
    ageGroup: pickFirstString(item.age_group, item.ageGroup, item.meta?.age_group, item.raw?.age_group),
    language: pickFirstString(item.language, item.meta?.language, item.raw?.language),
    accent: pickFirstString(item.accent, item.meta?.accent, item.raw?.accent),
    tags: rawTags
      .map((tag, index) => {
        if (typeof tag === "string") {
          return { id: `${id}-tag-${index}`, name: tag };
        }
        const name = pickFirstString(tag?.name, tag?.label, tag?.value);
        return name ? { id: pickFirstString(tag?.id, `${id}-tag-${index}`), name } : null;
      })
      .filter(Boolean),
    raw: item,
  };
}

export function groupOutputForProduct({
  productId,
  format,
  mediaItems,
  title = "",
  workflowId = "",
}) {
  return (Array.isArray(mediaItems) ? mediaItems : []).map((item, index) => ({
    id: item.id || `${workflowId || productId}-${index}`,
    productId,
    workflowId,
    title: item.title || title || format?.displayName || "Generated output",
    formatId: format?.id || "",
    formatName: format?.displayName || "",
    mediaType: item.mediaType || inferMediaType(item.url),
    url: item.url || "",
    status: item.status || "completed",
    raw: item.raw || null,
  }));
}
