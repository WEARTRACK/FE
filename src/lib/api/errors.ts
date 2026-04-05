import { AxiosError } from "axios";

export type ApiErrorResponse = {
  code: string;
  message: string;
  details?: unknown;
};

type ApiErrorParams = {
  code: string;
  message: string;
  status: number | null;
  details?: unknown;
};

export class ApiError extends Error {
  code: string;
  status: number | null;
  details?: unknown;

  constructor({ code, message, status, details }: ApiErrorParams) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.code === "string" && typeof candidate.message === "string";
}

export function createApiError(error: AxiosError): ApiError {
  return new ApiError({
    code: "UNKNOWN_API_ERROR",
    message: error.message || "An unexpected API error occurred.",
    status: error.response?.status ?? null,
    details: error.response?.data,
  });
}
