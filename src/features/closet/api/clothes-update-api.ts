import { apiClient } from "@/lib/api/client";

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

export async function updateClothes(
  clothesId: number,
  payload: ClosetUpdateRequestBody,
): Promise<ClosetDetailResult> {
  const requestPayload = {
    ...payload,
    sectionId: payload.sectionId ? mapClosetSectionIdToApiSectionId(payload.sectionId) : null,
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

  return {
    clothesId: result.clothesId,
    imageUrl: resolveClosetImageUrl(result.imageUrl),
    color: mapServerColorToClosetColor(result.color),
    category: mapServerCategoryToClosetCategory(result.category),
    price: result.price,
    sectionId: mapApiSectionIdToClosetSectionId(result.sectionId),
    sectionName: result.sectionName,
  };
}
