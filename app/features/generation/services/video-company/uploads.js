import { pickFirstString, resolveMediaUrl } from "../../utils/video-company";
import { DJANGO_BACKEND_URL, request } from "./core";

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

export async function updateSubjectProfile(
  accessToken,
  { file, description, subjectProfileId, referenceId, action = "add" },
) {
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

export async function uploadMedia(
  accessToken,
  { file, subType, type, description, backgroundType },
) {
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

export async function uploadBackgroundImage(
  accessToken,
  file,
  backgroundType = "location",
) {
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
