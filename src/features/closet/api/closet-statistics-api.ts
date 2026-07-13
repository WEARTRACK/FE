import { apiClient } from "@/lib/api/client";

import {
  assertApiEnvelopeSuccess,
  type ApiEnvelope,
  type ClosetStatisticsResultApi,
  createInvalidResponseError,
  isApiEnvelope,
  isClosetStatisticsResultApi,
} from "./closet-api-types";

export async function fetchClosetStatistics(closetId: number): Promise<ClosetStatisticsResultApi> {
  const response = await apiClient.get<ApiEnvelope<ClosetStatisticsResultApi>>(
    `/api/closets/${closetId}/statistics`,
  );

  if (!isApiEnvelope(response.data)) {
    throw createInvalidResponseError("옷장 통계 조회 응답 형식이 올바르지 않아요.", response.data);
  }

  const result = assertApiEnvelopeSuccess(response.data, response.status);

  if (!isClosetStatisticsResultApi(result)) {
    throw createInvalidResponseError(
      "옷장 통계 조회 result 형식이 올바르지 않아요.",
      response.data,
    );
  }

  return result;
}
