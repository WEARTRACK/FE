import { apiClient } from "@/lib/api/client";

import {
  assertApiEnvelopeSuccess,
  type ApiEnvelope,
  type ClosetDeleteResultApi,
  createInvalidResponseError,
  isApiEnvelope,
} from "./closet-api-types";

export async function deleteClothes(clothesId: number): Promise<ClosetDeleteResultApi> {
  const response = await apiClient.delete<ApiEnvelope<unknown>>(`/api/clothes/${clothesId}`);

  const responseData = response.data as unknown;

  // Some servers return 204 No Content or empty body on successful DELETE.
  if (response.status === 204 || responseData == null || responseData === "") {
    return null;
  }

  if (!isApiEnvelope(responseData)) {
    if (response.status >= 200 && response.status < 300) {
      return null;
    }
    throw createInvalidResponseError("옷 삭제 응답 형식이 올바르지 않아요.", responseData);
  }

  assertApiEnvelopeSuccess(responseData, response.status);
  return null;
}
