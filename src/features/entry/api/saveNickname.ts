import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

type SaveNicknamePayload = {
  nickname: string;
};

type SaveNicknameResult = {
  memberId: number | string;
  nickname: string;
  profileCompleted: boolean;
};

type SaveNicknameResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: SaveNicknameResult;
};

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "닉네임 저장 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function isSaveNicknameResponse(value: unknown): value is SaveNicknameResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.isSuccess !== "boolean" ||
    typeof candidate.code !== "string" ||
    typeof candidate.message !== "string" ||
    !candidate.result ||
    typeof candidate.result !== "object"
  ) {
    return false;
  }

  const result = candidate.result as Record<string, unknown>;
  const hasValidMemberId = typeof result.memberId === "number" || typeof result.memberId === "string";

  return (
    hasValidMemberId &&
    typeof result.nickname === "string" &&
    typeof result.profileCompleted === "boolean"
  );
}

export async function saveNickname({
  nickname,
}: SaveNicknamePayload): Promise<SaveNicknameResponse> {
  const response = await apiClient.patch<SaveNicknameResponse>("/api/members/me/nickname", {
    nickname: nickname.trim(),
  });

  if (!isSaveNicknameResponse(response.data)) {
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

  return response.data;
}
