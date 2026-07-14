import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

export type MemberProfile = {
  memberId: number;
  nickname: string;
  email: string;
};

type MemberProfileSuccessResponse = {
  isSuccess: true;
  code: string;
  message: string;
  result: MemberProfile;
};

type MemberProfileErrorResponse = {
  isSuccess: false;
  code: string;
  message: string;
  result: null;
};

export type MemberProfileResponse = MemberProfileSuccessResponse | MemberProfileErrorResponse;

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "회원 정보 조회 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function isMemberProfileResponseEnvelope(value: unknown): value is MemberProfileResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  if (
    typeof candidate.isSuccess !== "boolean" ||
    typeof candidate.code !== "string" ||
    typeof candidate.message !== "string"
  ) {
    return false;
  }

  if (candidate.isSuccess) {
    if (!candidate.result || typeof candidate.result !== "object") {
      return false;
    }

    const result = candidate.result as Record<string, unknown>;

    return (
      typeof result.memberId === "number" &&
      Number.isInteger(result.memberId) &&
      typeof result.nickname === "string" &&
      typeof result.email === "string"
    );
  }

  return candidate.result === null;
}

export async function getMemberProfile(): Promise<MemberProfile> {
  const response = await apiClient.get<MemberProfileResponse>("/api/members/me");

  if (!isMemberProfileResponseEnvelope(response.data)) {
    throw createInvalidResponseError(response.data);
  }

  if (!response.data.isSuccess) {
    throw new ApiError({
      code: response.data.code,
      message: response.data.message,
      status: response.status,
      details: response.data.result,
    });
  }

  return response.data.result;
}
