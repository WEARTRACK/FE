import { Platform } from "react-native";

import { env } from "@/config/env";
import type {
  PurchaseCheckClothesItem,
  PurchaseCheckLinkResult,
} from "@/features/home/api/purchase-check-link-api";
import { ApiError } from "@/lib/api/errors";
import { useSessionStore } from "@/stores/useSessionStore";

export type PurchaseCheckPhotoResult = PurchaseCheckLinkResult;

export type PurchaseCheckPhotoPayload = {
  imageUri: string;
  page?: number;
  size?: number;
};

type PurchaseCheckPhotoResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: PurchaseCheckPhotoResult | null;
};

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "사진 구매 전 중복 확인 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function isNullableString(value: unknown) {
  return typeof value === "string" || value === null;
}

function isPurchaseCheckClothesItem(value: unknown): value is PurchaseCheckClothesItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.clothesId === "number" &&
    typeof candidate.imageUrl === "string" &&
    isNullableString(candidate.productName) &&
    typeof candidate.color === "string" &&
    typeof candidate.category === "string" &&
    (candidate.closetName === undefined || isNullableString(candidate.closetName)) &&
    (candidate.sectionName === undefined || isNullableString(candidate.sectionName))
  );
}

function isPurchaseCheckPhotoResult(value: unknown): value is PurchaseCheckPhotoResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.message === "string" &&
    typeof candidate.totalCount === "number" &&
    typeof candidate.currentPage === "number" &&
    typeof candidate.totalPages === "number" &&
    typeof candidate.hasNext === "boolean" &&
    Array.isArray(candidate.clothes) &&
    candidate.clothes.every(isPurchaseCheckClothesItem)
  );
}

function isPurchaseCheckPhotoResponse(value: unknown): value is PurchaseCheckPhotoResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    (candidate.result === null || isPurchaseCheckPhotoResult(candidate.result))
  );
}

function getImageFile(uri: string) {
  const extension = uri.split(".").pop()?.toLowerCase();
  const normalizedExtension = extension === "png" ? "png" : "jpg";

  return {
    uri,
    name: `purchase-check-photo.${normalizedExtension}`,
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
        message: "사진을 불러오지 못했어요. 다시 시도해주세요.",
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

export async function purchaseCheckPhoto({
  imageUri,
  page = 0,
  size = 10,
}: PurchaseCheckPhotoPayload): Promise<PurchaseCheckPhotoResult> {
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

  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });
  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 60000);

  let response: Response;

  try {
    response = await fetch(`${env.apiBaseUrl}/api/purchase-check/photo?${params.toString()}`, {
      body: formData,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      method: "POST",
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

  if (!response.ok) {
    const errorResponse = isPurchaseCheckPhotoResponse(data) ? data : null;

    throw new ApiError({
      code: errorResponse?.code ?? "UNKNOWN_API_ERROR",
      message: errorResponse?.message ?? "사진 구매 전 중복 확인에 실패했어요.",
      status: response.status,
      details: errorResponse?.result ?? data,
    });
  }

  if (!isPurchaseCheckPhotoResponse(data)) {
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
