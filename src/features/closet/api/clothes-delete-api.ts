import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

import {
  type ApiEnvelope,
  type ClosetDeleteResultApi,
  createInvalidResponseError,
  isApiEnvelope,
} from "./closet-api-types";

function isClosetDeleteResultApi(value: unknown): value is ClosetDeleteResultApi {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    (candidate.id === undefined || typeof candidate.id === "number") &&
    (candidate.createdAt === undefined || typeof candidate.createdAt === "string")
  );
}

export async function deleteClothes(clothesId: number): Promise<ClosetDeleteResultApi> {
  const response = await apiClient.delete<ApiEnvelope<ClosetDeleteResultApi>>(`/api/clothes/${clothesId}`);

  if (!isApiEnvelope(response.data)) {
    throw createInvalidResponseError("옷 삭제 응답 형식이 올바르지 않아요.", response.data);
  }

  if (!response.data.isSuccess) {
    throw new ApiError({
      code: response.data.code,
      message: response.data.message,
      status: response.status,
      details: response.data.result,
    });
  }

  if (!isClosetDeleteResultApi(response.data.result)) {
    throw createInvalidResponseError("옷 삭제 result 형식이 올바르지 않아요.", response.data);
  }

  return response.data.result ?? null;
}
