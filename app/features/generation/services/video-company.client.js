import { DJANGO_BACKEND_URL } from "../constants";
import {
  normalizeFormatsResponse,
  normalizeResourceItem,
  normalizeVariation,
  pickFirstString,
  resolveMediaUrl,
} from "../utils/video-company";

function buildUrl(path, params = {}) {
  const url = new URL(path, DJANGO_BACKEND_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

async function parseResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    return {
      success: false,
      status: response.status,
      error:
        payload?.detail ||
        payload?.error ||
        payload?.message ||
        `Request failed (${response.status})`,
      data: payload,
    };
  }

  return { success: true, status: response.status, data: payload };
}

async function request(path, { accessToken, method = "GET", body, isFormData = false, params } = {}) {
  const response = await fetch(buildUrl(path, params), {
    method,
    mode: "cors",
    headers: {
      Accept: "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(body && !isFormData ? { "Content-Type": "application/json" } : {}),
      "X-Platform": "video_company",
    },
    body: body
      ? isFormData
        ? body
        : JSON.stringify(body)
      : undefined,
  });

  return parseResponse(response);
}

async function fetchAllPaginated(accessToken, initialPath, initialParams = {}) {
  let nextPath = initialPath;
  let nextParams = initialParams;
  const allResults = [];
  let lastPayload = null;

  while (nextPath) {
    const result = await request(nextPath, {
      accessToken,
      params: nextParams,
    });

    if (!result.success) {
      return result;
    }

    const payload = result.data || {};
    lastPayload = payload;
    const results = Array.isArray(payload?.results)
      ? payload.results
      : Array.isArray(payload)
        ? payload
        : [];
    allResults.push(...results);

    if (!payload?.next) {
      nextPath = "";
      nextParams = {};
      continue;
    }

    nextPath = payload.next;
    nextParams = {};
  }

  return {
    success: true,
    status: 200,
    data: {
      ...(lastPayload && typeof lastPayload === "object" ? lastPayload : {}),
      results: allResults,
      count: allResults.length,
      next: null,
      previous: null,
    },
  };
}

export async function fetchVideoFormats(accessToken) {
  const result = await fetchAllPaginated(
    accessToken,
    "/video-company/api/v1/resources/video-formats/",
    { limit: 50 },
  );

  if (!result.success) return result;
  const normalizedFormats = normalizeFormatsResponse(result.data);
  return {
    ...result,
    data: {
      formats: normalizedFormats,
      raw: result.data,
    },
  };
}

export async function fetchVoices(accessToken, { bookmarked = false } = {}) {
  const result = await request("/api/v1/resources/voices/", {
    accessToken,
    params: { limit: 25, bookmarked: bookmarked ? "true" : undefined },
  });
  if (!result.success) return result;
  const items = Array.isArray(result.data?.results) ? result.data.results : [];
  return {
    ...result,
    data: items.map((item) => normalizeResourceItem(item, DJANGO_BACKEND_URL)).filter((item) => item.id),
  };
}

export async function fetchAvatars(accessToken, { collection = "default", bookmarked = false } = {}) {
  const result = await request("/video-company/api/v1/resources/avatars/", {
    accessToken,
    params: { limit: 25, collection, bookmarked: bookmarked ? "true" : undefined },
  });
  if (!result.success) return result;
  const items = Array.isArray(result.data?.results) ? result.data.results : [];
  return {
    ...result,
    data: items.map((item) => normalizeResourceItem(item, DJANGO_BACKEND_URL)).filter((item) => item.id),
  };
}

export async function fetchBackgrounds(
  accessToken,
  { backgroundType = "location", videoFormat, collection = "default", bookmarked = false } = {},
) {
  const result = await request("/video-company/api/v1/resources/background-images/", {
    accessToken,
    params: {
      limit: 25,
      collection,
      bookmarked: bookmarked ? "true" : undefined,
      type: backgroundType,
      video_format: videoFormat,
    },
  });
  if (!result.success) return result;
  const items = Array.isArray(result.data?.results) ? result.data.results : [];
  return {
    ...result,
    data: items.map((item) => normalizeResourceItem(item, DJANGO_BACKEND_URL)).filter((item) => item.id),
  };
}

export async function fetchPoses(accessToken) {
  const result = await request("/video-company/api/v1/resources/poses/", {
    accessToken,
    params: { limit: 25 },
  });
  if (!result.success) return result;
  const items = Array.isArray(result.data?.results) ? result.data.results : [];
  return {
    ...result,
    data: items.map((item) => normalizeResourceItem(item, DJANGO_BACKEND_URL)).filter((item) => item.id),
  };
}

export async function fetchReferenceAds(accessToken) {
  const result = await request("/video-company/api/v1/resources/reference-ads/", {
    accessToken,
    params: { limit: 25 },
  });
  if (!result.success) return result;
  const items = Array.isArray(result.data?.results) ? result.data.results : [];
  return {
    ...result,
    data: items.map((item) => normalizeResourceItem(item, DJANGO_BACKEND_URL)).filter((item) => item.id),
  };
}

export async function toggleVideoCompanyBookmark(accessToken, { modelLabel, assetId } = {}) {
  return request("/video-company/api/v1/bookmarks/toggle/", {
    accessToken,
    method: "POST",
    body: {
      model_label: modelLabel,
      asset_id: assetId,
    },
  });
}

export async function fetchStaticAdAssets(accessToken) {
  return request("/video-company/api/v1/workflow/static-ad/assets/", {
    accessToken,
    method: "GET",
  });
}

export async function fetchGenerationModels(accessToken, key) {
  return request("/api/v1/media/fetch-models/", {
    accessToken,
    method: "GET",
    params: key ? { key } : {},
  });
}

export async function fetchWorkflowStatus(accessToken, workflowId) {
  return request(`/video-company/api/v1/workflow/${encodeURIComponent(workflowId)}/status/`, {
    accessToken,
    method: "GET",
  });
}

export async function fetchMediaStatus(accessToken, mediaId) {
  return request(`/video-company/api/v1/media/status/${encodeURIComponent(mediaId)}/`, {
    accessToken,
    method: "GET",
  });
}

export async function startWorkflow(accessToken, payload) {
  return request("/video-company/api/v1/workflow/start/", {
    accessToken,
    method: "POST",
    body: payload,
  });
}

export async function generateVideo(accessToken, payload) {
  return request("/video-company/api/v1/video-generate/", {
    accessToken,
    method: "POST",
    body: payload,
  });
}

export async function generateImageToVideo(accessToken, payload) {
  return request("/video-company/api/v1/media/generate/image-to-video/", {
    accessToken,
    method: "POST",
    body: payload,
  });
}

export async function generateTextToImage(accessToken, payload) {
  return request("/video-company/api/v1/media/generate/text-to-image/", {
    accessToken,
    method: "POST",
    body: payload,
  });
}

export async function startVideoToText(accessToken, payload) {
  return request("/video-company/api/v1/media/video-to-text/start/", {
    accessToken,
    method: "POST",
    body: payload,
  });
}

export async function fetchVideoToTextStatus(accessToken, taskId) {
  return request(`/video-company/api/v1/media/video-to-text/status/${encodeURIComponent(taskId)}/`, {
    accessToken,
    method: "GET",
  });
}

export async function fetchSubjectVariations(accessToken, subjectProfileId) {
  const result = await request(`/api/v1/media/subject/${encodeURIComponent(subjectProfileId)}/variations/`, {
    accessToken,
    method: "GET",
  });
  if (!result.success) return result;
  const items = Array.isArray(result.data?.results)
    ? result.data.results
    : Array.isArray(result.data)
      ? result.data
      : [];
  return {
    ...result,
    data: items.map((item, index) => normalizeVariation(item, index, DJANGO_BACKEND_URL)),
  };
}

export async function getVoiceCloningReadingText(accessToken, language) {
  return request("/api/v1/voice-cloning/", {
    accessToken,
    method: "GET",
    params: language ? { language } : {},
  });
}

export async function cloneVoice(accessToken, { file, language, name, description }) {
  const formData = new FormData();
  formData.append("audio", file);
  if (language) formData.append("language", language);
  if (name) formData.append("name", name);
  if (description) formData.append("description", description);
  return request("/video-company/api/v1/media/user-profile/voice-cloning/", {
    accessToken,
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

export async function updateSubjectProfile(accessToken, { file, description, subjectProfileId, referenceId, action = "add" }) {
  const formData = new FormData();
  formData.append("action", action);
  if (file) formData.append("file", file);
  if (description) formData.append("description", description);
  if (subjectProfileId) formData.append("subject_profile_id", subjectProfileId);
  if (referenceId) formData.append("reference_id", referenceId);
  return request("/video-company/api/v1/media/user-profile/subject-profile/", {
    accessToken,
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

export async function uploadMedia(accessToken, { file, subType, type, description, backgroundType }) {
  const formData = new FormData();
  formData.append("file", file);
  if (subType) formData.append("sub_type", subType);
  if (type) formData.append("type", type);
  if (description) formData.append("description", description);
  if (backgroundType) formData.append("background_type", backgroundType);
  return request("/video-company/api/v1/media/upload/", {
    accessToken,
    method: "POST",
    body: formData,
    isFormData: true,
  });
}

export async function uploadProductImage(accessToken, file) {
  return uploadMedia(accessToken, { file, subType: "product" });
}

export async function uploadBackgroundImage(accessToken, file, backgroundType = "location") {
  return uploadMedia(accessToken, {
    file,
    subType: "background-image",
    backgroundType,
  });
}

export async function uploadReferenceAd(accessToken, file, description = "") {
  return uploadMedia(accessToken, {
    file,
    subType: "reference-ad",
    type: "image",
    description,
  });
}

export async function uploadAvatarImage(accessToken, file, description = "") {
  return uploadMedia(accessToken, {
    file,
    subType: "avatar",
    type: "image",
    description,
  });
}

export async function createStaticAdProduct(accessToken, payload) {
  return request("/video-company/api/v1/workflow/static-ad/assets/", {
    accessToken,
    method: "POST",
    body: payload,
  });
}

export async function updateStaticAdPlan(accessToken, videoId, payload) {
  return request(`/video-company/api/v1/workflow/${encodeURIComponent(videoId)}/static-ad/update-plan/`, {
    accessToken,
    method: "POST",
    body: payload,
  });
}

export async function getProductUrlExtractStatus(accessToken, taskId) {
  return request(`/video-company/api/v1/media/products/url-extract/status/${encodeURIComponent(taskId)}/`, {
    accessToken,
    method: "GET",
  });
}

export async function generateMoreBrollSituations(accessToken, videoId, payload) {
  return request(`/video-company/api/v1/broll/workflow/${encodeURIComponent(videoId)}/situations/more/`, {
    accessToken,
    method: "POST",
    body: payload,
  });
}

export async function generateBrollImages(accessToken, videoId, payload) {
  return request(`/video-company/api/v1/broll/workflow/${encodeURIComponent(videoId)}/images/generate/`, {
    accessToken,
    method: "POST",
    body: payload,
  });
}

export async function fetchRemoteFile(url, fallbackName = "product-image") {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not fetch image (${response.status})`);
  }

  const blob = await response.blob();
  const extension = pickFirstString(blob.type?.split("/")?.[1], "jpg").replace("jpeg", "jpg");
  return new File([blob], `${fallbackName}.${extension}`, {
    type: blob.type || "image/jpeg",
  });
}

export function resolveUploadedMediaId(payload = {}) {
  return pickFirstString(payload?.id, payload?.media_id, payload?.upload_id, payload?.uuid);
}

export function resolveUploadedMediaUrl(payload = {}) {
  return resolveMediaUrl(
    pickFirstString(payload?.file_url, payload?.fileUrl, payload?.url, payload?.thumbnail),
    DJANGO_BACKEND_URL,
  );
}
