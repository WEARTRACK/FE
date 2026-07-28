import { env } from "@/config/env";
import { apiClient } from "@/lib/api/client";
import { authorizedFetch } from "@/lib/api/authorizedFetch";
import { ApiError } from "@/lib/api/errors";

export type ClothesPhotoAnalysisStatus = "PENDING" | "SUCCESS" | "FAIL" | "FAILED";

export type ClothesPhotoUploadResult = {
  photoId: number;
  imageUrl: string;
  analysisStatus: ClothesPhotoAnalysisStatus;
  predictedCategory: string | null;
  predictedColor: string | null;
};

export type ClothesPhotoAnalysisResult = {
  photoId?: number;
  imageUrl?: string;
  analysisStatus: ClothesPhotoAnalysisStatus;
  predictedCategory?: string | null;
  predictedColor?: string | null;
};

type ClothesPhotoUploadResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: ClothesPhotoUploadResult | null;
};

type ClothesPhotoAnalysisResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: ClothesPhotoAnalysisResult | null;
};

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "옷 사진 등록 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function isClothesPhotoUploadResult(value: unknown): value is ClothesPhotoUploadResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.photoId === "number" &&
    typeof candidate.imageUrl === "string" &&
    typeof candidate.analysisStatus === "string" &&
    (typeof candidate.predictedCategory === "string" || candidate.predictedCategory === null) &&
    (typeof candidate.predictedColor === "string" || candidate.predictedColor === null)
  );
}

function isClothesPhotoUploadResponse(value: unknown): value is ClothesPhotoUploadResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    (candidate.result === null || isClothesPhotoUploadResult(candidate.result))
  );
}

function isClothesPhotoAnalysisResult(value: unknown): value is ClothesPhotoAnalysisResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    (candidate.photoId === undefined || typeof candidate.photoId === "number") &&
    (candidate.imageUrl === undefined || typeof candidate.imageUrl === "string") &&
    typeof candidate.analysisStatus === "string" &&
    (candidate.predictedCategory === undefined ||
      typeof candidate.predictedCategory === "string" ||
      candidate.predictedCategory === null) &&
    (candidate.predictedColor === undefined ||
      typeof candidate.predictedColor === "string" ||
      candidate.predictedColor === null)
  );
}

function isClothesPhotoAnalysisResponse(value: unknown): value is ClothesPhotoAnalysisResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    (candidate.result === null || isClothesPhotoAnalysisResult(candidate.result))
  );
}

function getImageFile(uri: string) {
  const extension = uri.split(".").pop()?.toLowerCase();
  const normalizedExtension = extension === "png" ? "png" : "jpg";

  return {
    uri,
    name: `clothes-photo.${normalizedExtension}`,
    type: normalizedExtension === "png" ? "image/png" : "image/jpeg",
  };
}

export async function uploadClothesPhoto(imageUri: string): Promise<ClothesPhotoUploadResult> {
  const formData = new FormData();
  formData.append("image", getImageFile(imageUri) as unknown as Blob);

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 60000);

  let response: Response;

  try {
    response = await authorizedFetch(`${env.apiBaseUrl}/api/clothes/photo`, {
      body: formData,
      method: "POST",
      signal: abortController.signal,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

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

  if (!response.ok) {
    const errorResponse = isClothesPhotoUploadResponse(data) ? data : null;

    throw new ApiError({
      code: errorResponse?.code ?? "UNKNOWN_API_ERROR",
      message: errorResponse?.message ?? "옷 사진 등록에 실패했어요.",
      status: response.status,
      details: errorResponse?.result ?? data,
    });
  }

  if (!isClothesPhotoUploadResponse(data)) {
    throw createInvalidResponseError(data);
  }

  if (!data.isSuccess) {
    throw new ApiError({
      code: data.code,
      message: data.message,
      status: response.status,
      details: data.result,
    });
  }

  if (!data.result) {
    throw createInvalidResponseError(data);
  }

  return data.result;
}

export async function fetchClothesPhotoAnalysis(
  photoId: number,
): Promise<ClothesPhotoAnalysisResult> {
  const { data } = await apiClient.get<ClothesPhotoAnalysisResponse>(
    `/api/clothes/photo/${photoId}/analysis`,
  );

  if (!isClothesPhotoAnalysisResponse(data)) {
    throw createInvalidResponseError(data);
  }

  if (!data.isSuccess || !data.result) {
    throw new ApiError({
      code: data.code,
      message: data.message,
      status: null,
      details: data.result,
    });
  }

  return data.result;
}
