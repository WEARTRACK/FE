import { apiClient } from "@/lib/api/client";

import {
  assertApiEnvelopeSuccess,
  type ApiEnvelope,
  type ClosetDetailResult,
  type ClosetDetailResultApi,
  createInvalidResponseError,
  isApiEnvelope,
  isClosetDetailResultApi,
} from "./closet-api-types";
import {
  mapApiSectionIdToClosetSectionId,
  mapServerCategoryToClosetCategory,
  mapServerColorToClosetColor,
  resolveClosetImageUrl,
} from "./closet-api-mappers";

export async function fetchClothesDetail(clothesId: number): Promise<ClosetDetailResult> {
  const response = await apiClient.get<ApiEnvelope<ClosetDetailResultApi>>(`/api/clothes/${clothesId}`);

  if (!isApiEnvelope(response.data)) {
    throw createInvalidResponseError("옷 상세 조회 응답 형식이 올바르지 않아요.", response.data);
  }

  const result = assertApiEnvelopeSuccess(response.data, response.status);

  if (!isClosetDetailResultApi(result)) {
    throw createInvalidResponseError("옷 상세 조회 result 형식이 올바르지 않아요.", response.data);
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
