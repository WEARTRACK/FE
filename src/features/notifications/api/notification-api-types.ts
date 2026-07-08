import { ApiError } from "@/lib/api/errors";

export type ApiEnvelope<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result?: T | null;
};

export type NotificationListQuery = {
  page?: number;
  size?: number;
};

export type NotificationItem = {
  notificationId: number;
  type: string;
  title: string;
  body: string;
  read: boolean;
  readAt: string | null;
  sentAt: string;
};

export type NotificationListResult = {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  notifications: NotificationItem[];
};

export type NotificationSettings = {
  pushEnabled: boolean;
  dailyReviewEnabled: boolean;
  longUnwornClothesEnabled: boolean;
  fashionReportEnabled: boolean;
};

export type UpdateNotificationSettingsRequest = NotificationSettings;

export type NotificationDeviceType = "IOS" | "ANDROID";

export type RegisterNotificationTokenRequest = {
  token: string;
  deviceType: NotificationDeviceType;
};

export type DeleteNotificationTokenRequest = {
  token: string;
};

export type NotificationTokenSyncState = {
  memberId: number;
  registeredToken: string;
  deviceType: NotificationDeviceType;
  registeredAt: string;
};

export function createInvalidResponseError(message: string, details: unknown) {
  return new ApiError({
    code: "INVALID_RESPONSE",
    message,
    status: null,
    details,
  });
}

function toApiEnvelope<T>(value: unknown): ApiEnvelope<T> {
  if (!value || typeof value !== "object") {
    throw createInvalidResponseError("API 응답 형식이 올바르지 않아요.", value);
  }

  const envelope = value as Partial<ApiEnvelope<T>>;

  if (
    typeof envelope.isSuccess !== "boolean" ||
    typeof envelope.code !== "string" ||
    typeof envelope.message !== "string"
  ) {
    throw createInvalidResponseError("API 응답 형식이 올바르지 않아요.", value);
  }

  return envelope as ApiEnvelope<T>;
}

export function unwrapRequiredResult<T>(
  value: unknown,
  responseStatus: number,
  invalidResultMessage: string,
): T {
  const envelope = toApiEnvelope<T>(value);

  if (!envelope.isSuccess) {
    throw new ApiError({
      code: envelope.code,
      message: envelope.message,
      status: responseStatus,
      details: envelope.result,
    });
  }

  if (envelope.result === null || envelope.result === undefined) {
    throw createInvalidResponseError(invalidResultMessage, envelope);
  }

  return envelope.result;
}

export function unwrapEmptyResult<T>(value: unknown, responseStatus: number): void {
  const envelope = toApiEnvelope<T>(value);

  if (!envelope.isSuccess) {
    throw new ApiError({
      code: envelope.code,
      message: envelope.message,
      status: responseStatus,
      details: envelope.result,
    });
  }
}
