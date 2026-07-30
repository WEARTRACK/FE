import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

export type PurchaseCheckClothesItem = {
  clothesId: number;
  imageUrl: string;
  productName: string | null;
  color: string;
  category: string;
  closetName?: string | null;
  sectionName?: string | null;
};

export type PurchaseCheckLinkResult = {
  message: string;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  clothes: PurchaseCheckClothesItem[];
};

export type PurchaseCheckLinkPayload = {
  url: string;
  page?: number;
  size?: number;
};

type PurchaseCheckLinkResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: PurchaseCheckLinkResult | null;
};

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "구매 전 중복 확인 응답 형식이 올바르지 않아요.",
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

function isPurchaseCheckLinkResult(value: unknown): value is PurchaseCheckLinkResult {
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

function isPurchaseCheckLinkResponse(value: unknown): value is PurchaseCheckLinkResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    (candidate.result === null || isPurchaseCheckLinkResult(candidate.result))
  );
}

export async function purchaseCheckLink({
  page = 0,
  size = 10,
  url,
}: PurchaseCheckLinkPayload): Promise<PurchaseCheckLinkResult> {
  const { data, status } = await apiClient.post<PurchaseCheckLinkResponse>(
    "/api/purchase-check/link",
    { url },
    {
      params: { page, size },
      timeout: 30000,
    },
  );

  if (!isPurchaseCheckLinkResponse(data)) {
    throw createInvalidResponseError(data);
  }

  if (!data.isSuccess) {
    throw new ApiError({
      code: data.code,
      message: data.message,
      status,
      details: data.result,
    });
  }

  if (!data.result) {
    throw createInvalidResponseError(data);
  }

  return data.result;
}
