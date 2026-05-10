import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

export type HomeSummary = {
  totalClothesCount: number;
  closetCount: number;
  storageCount: number;
  weeklyExpenseAmount: number;
  weeklyClosetUsageRate: number;
};

type HomeSummaryResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: HomeSummary | null;
};

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "홈 요약 정보 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function isHomeSummary(value: unknown): value is HomeSummary {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.totalClothesCount === "number" &&
    typeof candidate.closetCount === "number" &&
    typeof candidate.storageCount === "number" &&
    typeof candidate.weeklyExpenseAmount === "number" &&
    typeof candidate.weeklyClosetUsageRate === "number"
  );
}

function isHomeSummaryResponse(value: unknown): value is HomeSummaryResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    (candidate.result === null || isHomeSummary(candidate.result))
  );
}

export async function getHomeSummary(): Promise<HomeSummary> {
  const response = await apiClient.get<HomeSummaryResponse>("/api/home");

  if (!isHomeSummaryResponse(response.data)) {
    throw createInvalidResponseError(response.data);
  }

  if (!response.data.isSuccess) {
    throw new ApiError({
      code: response.data.code,
      message: response.data.message,
      status: 200,
      details: response.data.result,
    });
  }

  if (!response.data.result) {
    throw createInvalidResponseError(response.data);
  }

  return response.data.result;
}
