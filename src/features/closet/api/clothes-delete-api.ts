import { apiClient } from "@/lib/api/client";

import {
  assertApiEnvelopeSuccess,
  type ApiEnvelope,
  type ClosetDeleteResultApi,
  createInvalidResponseError,
  isApiEnvelope,
  isClosetDeleteResultApi,
} from "./closet-api-types";

export async function deleteClothes(clothesId: number): Promise<ClosetDeleteResultApi> {
  const response = await apiClient.delete<ApiEnvelope<ClosetDeleteResultApi>>(`/api/clothes/${clothesId}`);

  if (!isApiEnvelope(response.data)) {
    throw createInvalidResponseError("옷 삭제 응답 형식이 올바르지 않아요.", response.data);
  }

  const result = assertApiEnvelopeSuccess(response.data, response.status);

  if (!isClosetDeleteResultApi(result)) {
    throw createInvalidResponseError("옷 삭제 result 형식이 올바르지 않아요.", response.data);
  }

  return result;
}
