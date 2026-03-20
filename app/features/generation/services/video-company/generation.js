import { request } from "./core";

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

export async function getVoiceCloningReadingText(accessToken, language) {
  return request("/api/v1/voice-cloning/", {
    accessToken,
    method: "GET",
    params: language ? { language } : {},
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
