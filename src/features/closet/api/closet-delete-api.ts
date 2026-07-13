import { apiClient } from "@/lib/api/client";

import {
  assertApiEnvelopeSuccess,
  type ApiEnvelope,
  createInvalidResponseError,
  isApiEnvelope,
} from "./closet-api-types";

export async function deleteCloset(closetId: number): Promise<void> {
  const response = await apiClient.delete<ApiEnvelope<unknown>>(`/api/closets/${closetId}`);
  const responseData = response.data as unknown;

  if (!isApiEnvelope(responseData)) {
    throw createInvalidResponseError("옷장 삭제 응답 형식이 올바르지 않아요.", responseData);
  }

  assertApiEnvelopeSuccess(responseData, response.status);
}
