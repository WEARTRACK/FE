import type { AxiosResponse } from "axios";

import { apiClient } from "@/lib/api/client";
import { createBearerAuthorizationHeader } from "@/lib/api/authToken";
import { ApiError } from "@/lib/api/errors";

type EmptyResultResponse = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: null;
};

function createAuthorizedRequestConfig(accessToken?: null | string) {
  if (!accessToken) {
    return undefined;
  }

  return {
    headers: {
      Authorization: createBearerAuthorizationHeader(accessToken),
    },
  };
}

function createInvalidResponseError(message: string, details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message,
    status: null,
    details,
  });
}

function isEmptyResultResponse(value: unknown): value is EmptyResultResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.isSuccess === "boolean" &&
    typeof candidate.code === "string" &&
    typeof candidate.message === "string" &&
    candidate.result === null
  );
}

async function requestEmptyResult(
  request: () => Promise<AxiosResponse<EmptyResultResponse>>,
  invalidResponseMessage: string,
) {
  const response = await request();

  if (!isEmptyResultResponse(response.data)) {
    throw createInvalidResponseError(invalidResponseMessage, response.data);
  }

  if (!response.data.isSuccess) {
    throw new ApiError({
      code: response.data.code,
      message: response.data.message,
      status: response.status,
      details: response.data.result,
    });
  }

  return response.data;
}

export async function logoutMemberSession(accessToken?: null | string) {
  return requestEmptyResult(
    () =>
      apiClient.post<EmptyResultResponse>(
        "/api/auth/logout",
        undefined,
        createAuthorizedRequestConfig(accessToken),
      ),
    "로그아웃 응답 형식이 올바르지 않아요.",
  );
}

export async function withdrawMemberSession(accessToken?: null | string) {
  return requestEmptyResult(
    () =>
      apiClient.delete<EmptyResultResponse>(
        "/api/members/me",
        createAuthorizedRequestConfig(accessToken),
      ),
    "회원탈퇴 응답 형식이 올바르지 않아요.",
  );
}
