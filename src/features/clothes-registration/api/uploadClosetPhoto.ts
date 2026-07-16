import { Platform } from "react-native";

import { env } from "@/config/env";
import { createBearerAuthorizationHeader } from "@/lib/api/authToken";
import { ApiError } from "@/lib/api/errors";
import { useSessionStore } from "@/stores/useSessionStore";

export type ClosetPhotoAnalysisStatus = string;

export type RecommendedClosetTemplate = {
  templateId: number;
  sectionCount: number;
};

export type UploadClosetPhotoResult = {
  analysisStatus: ClosetPhotoAnalysisStatus;
  message: string;
  imageUrl: string;
  detectedSectionCount: number;
  recommendedTemplates: RecommendedClosetTemplate[];
};

type UploadClosetPhotoResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: UploadClosetPhotoResult | null;
};

type ApiErrorResponse = {
  code: string;
  message: string;
  result?: unknown;
};

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "옷장 사진 등록 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function isRecommendedClosetTemplate(value: unknown): value is RecommendedClosetTemplate {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return typeof candidate.templateId === "number" && typeof candidate.sectionCount === "number";
}

function isUploadClosetPhotoResult(value: unknown): value is UploadClosetPhotoResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.analysisStatus === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.imageUrl === "string" &&
    typeof candidate.detectedSectionCount === "number" &&
    Array.isArray(candidate.recommendedTemplates) &&
    candidate.recommendedTemplates.every((template) => isRecommendedClosetTemplate(template))
  );
}

function isUploadClosetPhotoResponse(value: unknown): value is UploadClosetPhotoResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    (candidate.result === null || isUploadClosetPhotoResult(candidate.result))
  );
}

function getApiErrorResponse(value: unknown): ApiErrorResponse | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.code !== "string" || typeof candidate.message !== "string") {
    return null;
  }

  return {
    code: candidate.code,
    message: candidate.message,
    result: candidate.result,
  };
}

function getImageFile(uri: string) {
  const extension = uri.split(".").pop()?.toLowerCase();
  const normalizedExtension = extension === "png" ? "png" : "jpg";

  return {
    uri,
    name: `closet-photo.${normalizedExtension}`,
    type: normalizedExtension === "png" ? "image/png" : "image/jpeg",
  };
}

async function appendImageToFormData(formData: FormData, imageUri: string) {
  const imageFile = getImageFile(imageUri);

  if (Platform.OS === "web") {
    const response = await fetch(imageUri);

    if (!response.ok) {
      throw new ApiError({
        code: "IMAGE_READ_ERROR",
        message: "옷장 사진을 불러오지 못했어요. 다시 시도해주세요.",
        status: null,
        details: { imageUri, status: response.status },
      });
    }

    const blob = await response.blob();
    const imageBlob = blob.type ? blob : blob.slice(0, blob.size, imageFile.type);
    formData.append("image", imageBlob, imageFile.name);
    return;
  }

  formData.append("image", imageFile as unknown as Blob);
}

export async function uploadClosetPhoto(imageUri: string): Promise<UploadClosetPhotoResult> {
  if (!useSessionStore.persist.hasHydrated()) {
    await useSessionStore.persist.rehydrate();
  }

  const accessToken = useSessionStore.getState().accessToken;
  if (!accessToken) {
    throw new ApiError({
      code: "AUTH_REQUIRED",
      message: "인증이 필요합니다.",
      status: 401,
    });
  }

  const formData = new FormData();
  await appendImageToFormData(formData, imageUri);

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 60000);
  const requestUrl = `${env.apiBaseUrl}/api/closets/photo`;

  if (__DEV__) {
    console.warn("[Closet photo analysis] request started", {
      url: requestUrl,
      imageType: getImageFile(imageUri).type,
    });
  }

  let response: Response;
  try {
    response = await fetch(requestUrl, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: createBearerAuthorizationHeader(accessToken),
      },
      signal: abortController.signal,
    });
  } catch (error) {
    throw new ApiError({
      code: "NETWORK_ERROR",
      message: "Network error. Please check your connection and try again.",
      status: null,
      details: error,
    });
  } finally {
    clearTimeout(timeoutId);
  }

  const data = (await response.json().catch(() => null)) as unknown;

  if (__DEV__) {
    console.warn("[Closet photo analysis] response received", {
      status: response.status,
      ok: response.ok,
      body: data,
    });
  }

  if (!response.ok) {
    const errorResponse = getApiErrorResponse(data);
    throw new ApiError({
      code: errorResponse?.code ?? "UNKNOWN_API_ERROR",
      message: errorResponse?.message ?? "옷장 사진 등록에 실패했어요.",
      status: response.status,
      details: errorResponse?.result ?? data,
    });
  }

  if (!isUploadClosetPhotoResponse(data)) {
    throw createInvalidResponseError(data);
  }

  if (!data.isSuccess || !data.result) {
    throw new ApiError({
      code: data.code,
      message: data.message,
      status: response.status,
      details: data.result,
    });
  }

  return data.result;
}
