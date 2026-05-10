import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

import {
  type ApiEnvelope,
  type ClosetDetailResult,
  type ClosetDetailResultApi,
  type ClosetUpdateRequestBody,
  createInvalidResponseError,
  isApiEnvelope,
} from "./closet-api-types";
import { mapServerCategoryToClosetCategory, mapServerColorToClosetColor } from "./closet-api-mappers";

function isClosetDetailResultApi(value: unknown): value is ClosetDetailResultApi {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.clothesId === "number" &&
    typeof candidate.imageUrl === "string" &&
    typeof candidate.color === "string" &&
    typeof candidate.category === "string" &&
    typeof candidate.price === "number" &&
    typeof candidate.sectionId === "number" &&
    typeof candidate.sectionName === "string"
  );
}

export async function updateClothes(
  clothesId: number,
  payload: ClosetUpdateRequestBody,
): Promise<ClosetDetailResult> {
  const response = await apiClient.patch<ApiEnvelope<ClosetDetailResultApi>>(
    `/api/clothes/${clothesId}`,
    payload,
  );

  if (!isApiEnvelope(response.data)) {
    throw createInvalidResponseError("옷 수정 응답 형식이 올바르지 않아요.", response.data);
  }

  if (!response.data.isSuccess) {
    throw new ApiError({
      code: response.data.code,
      message: response.data.message,
      status: response.status,
      details: response.data.result,
    });
  }

  if (!isClosetDetailResultApi(response.data.result)) {
    throw createInvalidResponseError("옷 수정 result 형식이 올바르지 않아요.", response.data);
  }

  return {
    clothesId: response.data.result.clothesId,
    imageUrl: response.data.result.imageUrl,
    color: mapServerColorToClosetColor(response.data.result.color),
    category: mapServerCategoryToClosetCategory(response.data.result.category),
    price: response.data.result.price,
    sectionId: response.data.result.sectionId,
    sectionName: response.data.result.sectionName,
  };
}
