import axios, { AxiosError, AxiosHeaders } from "axios";

import { env } from "@/config/env";
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

function isAuthRequiredPath(pathname: string) {
  return (
    pathname === "/api/home" ||
    pathname === "/api/members/nickname/check" ||
    pathname === "/api/members/me/nickname" ||
    pathname.startsWith("/api/members/me/") ||
    pathname.startsWith("/api/closets/") ||
    pathname.startsWith("/api/clothes/")
  );
}

apiClient.interceptors.request.use(async (config) => {
  const pathname = resolveRequestPathname(config.url, config.baseURL);
  const requiresAuth = isAuthRequiredPath(pathname);

  if (requiresAuth && !useSessionStore.persist.hasHydrated()) {
    await useSessionStore.persist.rehydrate();
  }

  const accessToken = useSessionStore.getState().accessToken;

  if (requiresAuth && !accessToken) {
    throw new ApiError({
      code: "AUTH_REQUIRED",
      message: "인증이 필요합니다.",
      status: 401,
    });
  }

  if (requiresAuth && accessToken) {
    const headers = AxiosHeaders.from(config.headers);
    const existingAuthorization = headers.get("Authorization");

    if (!existingAuthorization) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    config.headers = headers;
  }

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
