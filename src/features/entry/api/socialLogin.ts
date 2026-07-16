import { apiClient } from "@/lib/api/client";
import { isValidClosetId } from "@/features/closet/utils/closet-id";
import { normalizeAccessToken, normalizeRefreshToken } from "@/lib/api/authToken";
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
  requiredTermsAgreed: boolean;
  profileCompleted: boolean;
  accessToken: string;
  refreshToken: string;
  closetId?: number | null;
};

type SocialLoginResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result?: SocialLoginResult | null;
};

function redactSocialLoginTokens(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactSocialLoginTokens);
  }

  if (!value || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => key !== "accessToken" && key !== "refreshToken")
      .map(([key, nestedValue]) => [key, redactSocialLoginTokens(nestedValue)]),
  );
}

function createInvalidResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "소셜 로그인 응답 형식이 올바르지 않아요.",
    status: null,
    details: redactSocialLoginTokens(details),
  });
}

function resolveRequiredTermsAgreed(candidate: Record<string, unknown>) {
  if (typeof candidate.requiredTermsAgreed === "boolean") {
    return candidate.requiredTermsAgreed;
  }

  // Older login responses did not include terms state. Preserve the previous
  // completed-profile path until the backend sends an explicit value.
  return candidate.profileCompleted === true;
}

function parseSocialLoginResult(value: unknown): SocialLoginResult | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const closetId = candidate.closetId;
  const accessToken =
    typeof candidate.accessToken === "string" ? normalizeAccessToken(candidate.accessToken) : "";
  const refreshToken =
    typeof candidate.refreshToken === "string" ? normalizeRefreshToken(candidate.refreshToken) : "";

  if (
    typeof candidate.memberId === "number" &&
    (typeof candidate.nickname === "string" || candidate.nickname === null) &&
    typeof candidate.profileCompleted === "boolean" &&
    accessToken.length > 0 &&
    refreshToken.length > 0 &&
    (closetId === undefined || closetId === null || isValidClosetId(closetId))
  ) {
    return {
      memberId: candidate.memberId,
      nickname: candidate.nickname,
      requiredTermsAgreed: resolveRequiredTermsAgreed(candidate),
      profileCompleted: candidate.profileCompleted,
      accessToken,
      refreshToken,
      closetId,
    };
  }

  return null;
}

function isSocialLoginResponse(value: unknown): value is SocialLoginResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string"
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

  if (!response.data.isSuccess) {
    throw new ApiError({
      code: response.data.code,
      message: response.data.message,
      status: response.status,
      details: redactSocialLoginTokens(response.data.result),
    });
  }

  const result = parseSocialLoginResult(response.data.result);

  if (!result) {
    throw createInvalidResponseError(response.data);
  }

  return result;
}
