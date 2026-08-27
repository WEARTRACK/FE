import {
  AxiosError,
  AxiosHeaders,
  create as createAxiosClient,
  type InternalAxiosRequestConfig,
} from "axios";

import { env } from "@/config/env";
import { resolveApiAuthPolicy } from "@/lib/api/authPolicy";
import { createBearerAuthorizationHeader, normalizeAccessToken } from "@/lib/api/authToken";
import { ApiError, createApiError, isApiErrorResponse } from "@/lib/api/errors";
import { refreshSessionTokens } from "@/lib/api/tokenRefresh";
import { useSessionStore } from "@/stores/useSessionStore";

type RefreshRetryConfig = InternalAxiosRequestConfig & {
  _tokenRefreshRetried?: boolean;
};

export const apiClient = createAxiosClient({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

function resolveRequestPathname(url: string | undefined, baseURL: string | undefined) {
  if (!url) {
    return "";
  }

  try {
    const parsedUrl = baseURL ? new URL(url, baseURL) : new URL(url);
    return parsedUrl.pathname;
  } catch {
    return url;
  }
}

apiClient.interceptors.request.use(async (config) => {
  const pathname = resolveRequestPathname(config.url, config.baseURL);
  const authPolicy = resolveApiAuthPolicy({
    pathname,
    method: config.method,
  });
  const requiresAuth = authPolicy.requiresAccessToken;
  const headers = AxiosHeaders.from(config.headers);

  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    headers.delete("Content-Type");
  }

  if (requiresAuth && !useSessionStore.persist.hasHydrated()) {
    await useSessionStore.persist.rehydrate();
  }

  const storedAccessToken = useSessionStore.getState().accessToken;
  let accessToken = storedAccessToken ? normalizeAccessToken(storedAccessToken) : null;
  const existingAuthorization = headers.get("Authorization");

  if (
    requiresAuth &&
    !accessToken &&
    !existingAuthorization &&
    useSessionStore.getState().refreshToken
  ) {
    accessToken = (await refreshSessionTokens()).accessToken;
  }

  if (requiresAuth && !accessToken && !existingAuthorization) {
    throw new ApiError({
      code: "AUTH_REQUIRED",
      message: "인증이 필요합니다.",
      status: 401,
    });
  }

  if (requiresAuth && accessToken) {
    if (!existingAuthorization) {
      headers.set("Authorization", createBearerAuthorizationHeader(accessToken));
    }
  }

  config.headers = headers;

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError | ApiError) => {
    if (error instanceof ApiError) {
      return Promise.reject(error);
    }

    if (!error.response) {
      const requestConfig = error.config;
      const networkDetails = {
        axiosCode: error.code ?? null,
        originalMessage: error.message,
        url: requestConfig?.url ?? null,
        method: requestConfig?.method ?? null,
        timeout: requestConfig?.timeout ?? null,
        hasRequest: Boolean(error.request),
      };

      return Promise.reject(
        new ApiError({
          code: "NETWORK_ERROR",
          message: "Network error. Please check your connection and try again.",
          status: null,
          details: networkDetails,
        }),
      );
    }

    const { data, status } = error.response;
    const originalConfig = error.config as RefreshRetryConfig | undefined;
    const pathname = resolveRequestPathname(originalConfig?.url, originalConfig?.baseURL);
    const authPolicy = resolveApiAuthPolicy({
      pathname,
      method: originalConfig?.method,
    });

    if (
      status === 401 &&
      originalConfig &&
      authPolicy.allowRefresh &&
      !originalConfig._tokenRefreshRetried
    ) {
      try {
        originalConfig._tokenRefreshRetried = true;
        const tokens = await refreshSessionTokens();
        const headers = AxiosHeaders.from(originalConfig.headers);
        headers.set("Authorization", createBearerAuthorizationHeader(tokens.accessToken));
        originalConfig.headers = headers;

        return apiClient.request(originalConfig);
      } catch {
        return Promise.reject(createApiError(error));
      }
    }

    if (isApiErrorResponse(data)) {
      return Promise.reject(
        new ApiError({
          code: data.code,
          message: data.message,
          status,
          details: data.details,
        }),
      );
    }

    return Promise.reject(createApiError(error));
  },
);
