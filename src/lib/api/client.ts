import axios, { AxiosError } from "axios";

import { env } from "@/config/env";
import { ApiError, createApiError, isApiErrorResponse } from "@/lib/api/errors";

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (!error.response) {
      return Promise.reject(
        new ApiError({
          code: "NETWORK_ERROR",
          message: "Network error. Please check your connection and try again.",
          status: null,
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
