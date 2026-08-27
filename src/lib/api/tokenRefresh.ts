import { AxiosError, create as createAxiosClient } from "axios";

import { env } from "@/config/env";
import { expireCurrentSession } from "@/features/entry/utils/expireCurrentSession";
import { normalizeAccessToken, normalizeRefreshToken } from "@/lib/api/authToken";
import { ApiError, createApiError } from "@/lib/api/errors";
import { useSessionStore } from "@/stores/useSessionStore";

const tokenRefreshClient = createAxiosClient({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export type TokenRefreshResult = {
  accessToken: string;
  refreshToken: string;
};

type TokenRefreshResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result?: TokenRefreshResult | null;
};

let tokenRefreshPromise: Promise<TokenRefreshResult> | null = null;

function isTokenRefreshResult(value: unknown): value is TokenRefreshResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  const accessToken =
    typeof candidate.accessToken === "string" ? normalizeAccessToken(candidate.accessToken) : "";
  const refreshToken =
    typeof candidate.refreshToken === "string" ? normalizeRefreshToken(candidate.refreshToken) : "";

  return accessToken.length > 0 && refreshToken.length > 0;
}

function parseTokenRefreshResult(value: unknown): TokenRefreshResult | null {
  if (!isTokenRefreshResult(value)) {
    return null;
  }

  return {
    accessToken: normalizeAccessToken(value.accessToken),
    refreshToken: normalizeRefreshToken(value.refreshToken),
  };
}

function isTokenRefreshResponse(value: unknown): value is TokenRefreshResponse {
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

function createInvalidTokenRefreshResponseError(details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message: "토큰 재발급 응답 형식이 올바르지 않아요.",
    status: null,
    details,
  });
}

function shouldClearSessionAfterRefreshError(error: unknown) {
  if (error instanceof ApiError) {
    return error.status === 400 || error.status === 401 || error.code === "INVALID_RESPONSE";
  }

  if (error instanceof AxiosError) {
    return error.response?.status === 400 || error.response?.status === 401;
  }

  return false;
}

async function requestTokenRefresh(): Promise<TokenRefreshResult> {
  if (!useSessionStore.persist.hasHydrated()) {
    await useSessionStore.persist.rehydrate();
  }

  const refreshToken = useSessionStore.getState().refreshToken;

  if (!refreshToken) {
    await expireCurrentSession();
    throw new ApiError({
      code: "AUTH_REFRESH_REQUIRED",
      message: "Refresh Token이 필요합니다.",
      status: 401,
    });
  }

  try {
    const response = await tokenRefreshClient.post<TokenRefreshResponse>(
      "/api/auth/token/refresh",
      {
        refreshToken: normalizeRefreshToken(refreshToken),
      },
    );

    if (!isTokenRefreshResponse(response.data)) {
      throw createInvalidTokenRefreshResponseError(response.data);
    }

    if (!response.data.isSuccess) {
      throw new ApiError({
        code: response.data.code,
        message: response.data.message,
        status: response.status,
        details: response.data.result,
      });
    }

    const tokens = parseTokenRefreshResult(response.data.result);

    if (!tokens) {
      throw createInvalidTokenRefreshResponseError(response.data);
    }

    useSessionStore.getState().updateTokens(tokens);
    return tokens;
  } catch (error) {
    if (shouldClearSessionAfterRefreshError(error)) {
      await expireCurrentSession();
    }

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof AxiosError) {
      throw createApiError(error);
    }

    throw error;
  }
}

export function refreshSessionTokens() {
  if (!tokenRefreshPromise) {
    tokenRefreshPromise = requestTokenRefresh().finally(() => {
      tokenRefreshPromise = null;
    });
  }

  return tokenRefreshPromise;
}
