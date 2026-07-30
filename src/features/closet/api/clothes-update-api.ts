import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

import {
  assertApiEnvelopeSuccess,
  type ApiEnvelope,
  type ClosetDetailResult,
  type ClosetDetailResultApi,
  type ClosetUpdateRequestBody,
  createInvalidResponseError,
  isApiEnvelope,
  isClosetDetailResultApi,
} from "./closet-api-types";
import {
  mapApiSectionIdToClosetSectionId,
  mapClosetSectionIdToApiSectionId,
  mapServerCategoryToClosetCategory,
  mapServerColorToClosetColor,
  resolveClosetImageUrl,
} from "./closet-api-mappers";

function toServerColorValue(color: string | null) {
  return color ? color.trim().toUpperCase() : null;
}

function toServerCategoryValue(category: string | null) {
  if (!category) {
    return null;
  }

  const normalized = category
    .trim()
    .toLowerCase()
    .replace(/[\s_-]/g, "");

  if (normalized === "tshirt") {
    return "T_SHIRT";
  }

  return category.trim().toUpperCase().replace(/[\s-]/g, "_");
}

function toServerSectionId(sectionId: ClosetUpdateRequestBody["sectionId"]) {
  if (sectionId === null) {
    return null;
  }

  if (typeof sectionId === "number") {
    return sectionId;
  }

  return mapClosetSectionIdToApiSectionId(sectionId);
}

export async function updateClothes(
  clothesId: number,
  payload: ClosetUpdateRequestBody,
): Promise<ClosetDetailResult> {
  const requestPayload = {
    ...payload,
    color: toServerColorValue(payload.color),
    category: toServerCategoryValue(payload.category),
    sectionId: toServerSectionId(payload.sectionId),
  };

  const response = await apiClient.patch<ApiEnvelope<ClosetDetailResultApi>>(
    `/api/clothes/${clothesId}`,
    requestPayload,
  );

  if (!isApiEnvelope(response.data)) {
    throw createInvalidResponseError("옷 수정 응답 형식이 올바르지 않아요.", response.data);
  }

  const result = assertApiEnvelopeSuccess(response.data, response.status);

  if (!isClosetDetailResultApi(result)) {
    throw createInvalidResponseError("옷 수정 result 형식이 올바르지 않아요.", response.data);
  }

  const safeImageUrl = (() => {
    try {
      return resolveClosetImageUrl(result.imageUrl);
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.code === "INVALID_IMAGE_URL_DOMAIN" || error.code === "INVALID_IMAGE_URL")
      ) {
        return result.imageUrl;
      }
      throw error;
    }
  })();

  const safeSectionId = (() => {
    try {
      return mapApiSectionIdToClosetSectionId(result.sectionId);
    } catch (error) {
      if (error instanceof ApiError && error.code === "INVALID_SECTION_ID") {
        return "section-1";
      }
      throw error;
    }
  })();

  return {
    clothesId: result.clothesId,
    imageUrl: safeImageUrl,
    color: mapServerColorToClosetColor(result.color),
    category: mapServerCategoryToClosetCategory(result.category),
    price: result.price,
    sectionId: safeSectionId,
    sectionName: result.sectionName,
  };
}
