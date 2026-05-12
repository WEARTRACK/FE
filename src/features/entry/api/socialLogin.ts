import { apiClient } from "@/lib/api/client";
import { isValidClosetId } from "@/features/closet/utils/closet-id";
import { ApiError } from "@/lib/api/errors";

export type SocialAuthProvider = "GOOGLE" | "KAKAO" | "NAVER";

export type SocialLoginPayload = {
  provider: SocialAuthProvider;
  authorizationCode?: string | null;
  state?: string | null;
  handoffToken?: string | null;
};

export type SocialLoginResult = {
  memberId: number;
  nickname: string | null;
  profileCompleted: boolean;
  accessToken: string;
  refreshToken: string;
  closetId?: number | null;
};

type SocialLoginResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: SocialLoginResult | null;
};

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "소셜 로그인 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function isSocialLoginResult(value: unknown): value is SocialLoginResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.memberId === "number" &&
    (typeof candidate.nickname === "string" || candidate.nickname === null) &&
    typeof candidate.profileCompleted === "boolean" &&
    typeof candidate.accessToken === "string" &&
    typeof candidate.refreshToken === "string" &&
    (candidate.closetId === undefined || candidate.closetId === null || isValidClosetId(candidate.closetId))
  );
}

function isSocialLoginResponse(value: unknown): value is SocialLoginResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    (candidate.result === null || isSocialLoginResult(candidate.result))
  );
}

export async function socialLogin({
  provider,
  authorizationCode = null,
  state = null,
  handoffToken = null,
}: SocialLoginPayload): Promise<SocialLoginResult> {
  const response = await apiClient.post<SocialLoginResponse>("/api/auth/social/login", {
    provider,
    authorizationCode,
    state,
    handoffToken,
  });

  if (!isSocialLoginResponse(response.data)) {
    throw createInvalidResponseError(response.data);
  }

  if (!response.data.isSuccess || !response.data.result) {
    throw new ApiError({
      code: response.data.code,
      message: response.data.message,
      status: 200,
      details: response.data.result,
    });
  }

  return response.data.result;
}
