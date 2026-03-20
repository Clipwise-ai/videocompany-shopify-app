import {
  normalizeFormatsResponse,
  normalizeResourceItem,
  normalizeVariation,
} from "../../utils/video-company";
import { DJANGO_BACKEND_URL, fetchAllPaginated, request } from "./core";

function normalizeResourceCollection(items) {
  return items
    .map((item) => normalizeResourceItem(item, DJANGO_BACKEND_URL))
    .filter((item) => item.id);
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
  return { ...result, data: normalizeResourceCollection(items) };
}

export async function fetchAvatars(
  accessToken,
  { collection = "default", bookmarked = false } = {},
) {
  const result = await request("/video-company/api/v1/resources/avatars/", {
    accessToken,
    params: { limit: 25, collection, bookmarked: bookmarked ? "true" : undefined },
  });
  if (!result.success) return result;
  const items = Array.isArray(result.data?.results) ? result.data.results : [];
  return { ...result, data: normalizeResourceCollection(items) };
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
  return { ...result, data: normalizeResourceCollection(items) };
}

export async function fetchPoses(accessToken) {
  const result = await request("/video-company/api/v1/resources/poses/", {
    accessToken,
    params: { limit: 25 },
  });
  if (!result.success) return result;
  const items = Array.isArray(result.data?.results) ? result.data.results : [];
  return { ...result, data: normalizeResourceCollection(items) };
}

export async function fetchReferenceAds(accessToken) {
  const result = await request("/video-company/api/v1/resources/reference-ads/", {
    accessToken,
    params: { limit: 25 },
  });
  if (!result.success) return result;
  const items = Array.isArray(result.data?.results) ? result.data.results : [];
  return { ...result, data: normalizeResourceCollection(items) };
}

export async function fetchSubjectVariations(accessToken, subjectProfileId) {
  const result = await request(
    `/api/v1/media/subject/${encodeURIComponent(subjectProfileId)}/variations/`,
    { accessToken, method: "GET" },
  );
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

export async function toggleVideoCompanyBookmark(
  accessToken,
  { modelLabel, assetId } = {},
) {
  return request("/video-company/api/v1/bookmarks/toggle/", {
    accessToken,
    method: "POST",
    body: {
      model_label: modelLabel,
      asset_id: assetId,
    },
  });
}
