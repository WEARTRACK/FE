import { AxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

type CheckNicknameDuplicateResponse = {
  isDuplicate: boolean;
};

type CheckNicknameDuplicateApiResult = {
  isDuplicate?: boolean;
  duplicate?: boolean;
  available?: boolean;
};

type CheckNicknameDuplicateApiResponse = {
  isSuccess?: boolean;
  code?: string;
  message?: string;
  result?: CheckNicknameDuplicateApiResult | boolean;
};

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "닉네임 중복 확인 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function isCheckNicknameDuplicateApiResponse(
  value: unknown,
): value is CheckNicknameDuplicateApiResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const hasStandardEnvelope =
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string";

  const hasDirectDuplicateField =
    typeof candidate.isDuplicate === "boolean" ||
    typeof candidate.duplicate === "boolean" ||
    typeof candidate.available === "boolean";

  const hasBooleanResult = typeof candidate.result === "boolean";

  return hasStandardEnvelope || hasDirectDuplicateField || hasBooleanResult;
}

function resolveDuplicateFlag(result: CheckNicknameDuplicateApiResult): boolean {
  if (typeof result.isDuplicate === "boolean") {
    return result.isDuplicate;
  }

  if (typeof result.duplicate === "boolean") {
    return result.duplicate;
  }

  if (typeof result.available === "boolean") {
    return !result.available;
  }

  throw createInvalidResponseError(result);
}

export async function checkNicknameDuplicate(
  nickname: string,
): Promise<CheckNicknameDuplicateResponse> {
  try {
    const response = await apiClient.get<CheckNicknameDuplicateApiResponse>(
      "/api/members/nickname/check",
      {
        params: { nickname: nickname.trim() },
      },
    );

    if (!isCheckNicknameDuplicateApiResponse(response.data)) {
      throw createInvalidResponseError(response.data);
    }

    if (response.data.isSuccess === false) {
      throw new ApiError({
        code: response.data.code ?? "UNKNOWN_API_ERROR",
        message: response.data.message ?? "닉네임 중복 확인에 실패했어요.",
        status: 200,
        details: response.data.result,
      });
    }

    const directResult = response.data as CheckNicknameDuplicateApiResult;
    if (
      typeof directResult.isDuplicate === "boolean" ||
      typeof directResult.duplicate === "boolean" ||
      typeof directResult.available === "boolean"
    ) {
      return { isDuplicate: resolveDuplicateFlag(directResult) };
    }

    if (typeof response.data.result === "boolean") {
      return { isDuplicate: response.data.result };
    }

    if (!response.data.result || typeof response.data.result !== "object") {
      throw createInvalidResponseError(response.data);
    }

    return {
      isDuplicate: resolveDuplicateFlag(response.data.result as CheckNicknameDuplicateApiResult),
    };
  } catch (error) {
    if (error instanceof ApiError && error.code === "MEMBER_409_1") {
      return { isDuplicate: true };
    }

    if (error instanceof AxiosError || error instanceof ApiError) {
      throw error;
    }

    throw new ApiError({
      code: "UNKNOWN_API_ERROR",
      message: "닉네임 중복 확인에 실패했어요.",
      status: null,
      details: error,
    });
  }
}
