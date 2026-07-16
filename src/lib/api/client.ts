import axios, { AxiosError, AxiosHeaders } from "axios";

import { env } from "@/config/env";
import { resolveApiAuthPolicy } from "@/lib/api/authPolicy";
import { createBearerAuthorizationHeader, normalizeAccessToken } from "@/lib/api/authToken";
import { ApiError, createApiError, isApiErrorResponse } from "@/lib/api/errors";
import { useSessionStore } from "@/stores/useSessionStore";

export const apiClient = axios.create({
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
  const accessToken = storedAccessToken ? normalizeAccessToken(storedAccessToken) : null;
  const existingAuthorization = headers.get("Authorization");

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
  (error: AxiosError | ApiError) => {
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
