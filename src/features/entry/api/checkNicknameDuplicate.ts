import { AxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

export type CheckNicknameDuplicateResponse = {
  nickname: string;
  isDuplicate: boolean;
};

type CheckNicknameDuplicateApiResult = {
  nickname: string;
  available: boolean;
};

type CheckNicknameDuplicateApiResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: CheckNicknameDuplicateApiResult | null;
};

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "닉네임 중복 확인 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function createStaleResponseError(requestedNickname: string, responseNickname: string) {
  return new ApiError({
    code: "STALE_RESPONSE",
    message: "닉네임 중복 확인 결과가 현재 요청과 일치하지 않아요.",
    status: 200,
    details: {
      requestedNickname,
      responseNickname,
    },
  });
}

function isCheckNicknameDuplicateApiResponse(
  value: unknown,
): value is CheckNicknameDuplicateApiResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    (!candidate.isSuccess || candidate.result === null || typeof candidate.result === "object")
  );
}

function isCheckNicknameDuplicateResult(value: unknown): value is CheckNicknameDuplicateApiResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.nickname === "string" && typeof candidate.available === "boolean";
}

export async function checkNicknameDuplicate(
  nickname: string,
): Promise<CheckNicknameDuplicateResponse> {
  const normalizedNickname = nickname.trim();

  try {
    const response = await apiClient.get<CheckNicknameDuplicateApiResponse>(
      "/api/members/nickname/check",
      {
        params: { nickname: normalizedNickname },
      },
    );

    if (!isCheckNicknameDuplicateApiResponse(response.data)) {
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

    if (!isCheckNicknameDuplicateResult(response.data.result)) {
      throw createInvalidResponseError(response.data);
    }

    if (response.data.result.nickname !== normalizedNickname) {
      throw createStaleResponseError(normalizedNickname, response.data.result.nickname);
    }

    return {
      nickname: response.data.result.nickname,
      isDuplicate: !response.data.result.available,
    };
  } catch (error) {
    if (error instanceof ApiError && error.code === "MEMBER_409_1") {
      return {
        nickname: normalizedNickname,
        isDuplicate: true,
      };
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
