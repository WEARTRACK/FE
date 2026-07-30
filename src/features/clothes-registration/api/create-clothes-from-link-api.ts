import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

export type CreateClothesFromLinkPayload = {
  sourceUrl: string;
  productName: string;
  imageUrl: string;
  imageType: "EXTERNAL_URL";
  price: number | null;
  color: string;
  category: string;
  purchaseDate: string | null;
  storageLocation: string | null;
  sectionId: number;
};

export type CreateClothesFromLinkResult = {
  clothesId: number;
  closetId: number;
  photoId: number;
  imageUrl: string;
  productName: string;
  color: string;
  category: string;
  price: number | null;
  purchaseDate: string | null;
  storageLocation: string | null;
  sectionId: number;
  createdAt: string;
};

type CreateClothesFromLinkResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: CreateClothesFromLinkResult | null;
};

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "링크 등록 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function isCreateClothesFromLinkResult(value: unknown): value is CreateClothesFromLinkResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.clothesId === "number" &&
    typeof candidate.closetId === "number" &&
    typeof candidate.photoId === "number" &&
    typeof candidate.imageUrl === "string" &&
    typeof candidate.productName === "string" &&
    typeof candidate.color === "string" &&
    typeof candidate.category === "string" &&
    (typeof candidate.price === "number" || candidate.price === null) &&
    (typeof candidate.purchaseDate === "string" || candidate.purchaseDate === null) &&
    (typeof candidate.storageLocation === "string" || candidate.storageLocation === null) &&
    typeof candidate.sectionId === "number" &&
    typeof candidate.createdAt === "string"
  );
}

function isCreateClothesFromLinkResponse(value: unknown): value is CreateClothesFromLinkResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    (candidate.result === null || isCreateClothesFromLinkResult(candidate.result))
  );
}

export async function createClothesFromLink(
  payload: CreateClothesFromLinkPayload,
): Promise<CreateClothesFromLinkResult> {
  const { data, status } = await apiClient.post<CreateClothesFromLinkResponse>(
    "/api/clothes/from-link",
    payload,
  );

  if (!isCreateClothesFromLinkResponse(data)) {
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
