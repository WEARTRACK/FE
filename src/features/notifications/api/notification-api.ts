import { apiClient } from "@/lib/api/client";

import {
  type ApiEnvelope,
  type DeleteNotificationTokenRequest,
  type NotificationListQuery,
  type NotificationListResult,
  type NotificationSettings,
  type RegisterNotificationTokenRequest,
  type UpdateNotificationSettingsRequest,
  unwrapEmptyResult,
  unwrapRequiredResult,
} from "./notification-api-types";

const NOTIFICATIONS_ENDPOINT = "/api/notifications";
const NOTIFICATION_SETTINGS_ENDPOINT = "/api/notifications/settings";
const NOTIFICATION_FCM_TOKEN_ENDPOINT = "/api/notifications/fcm-token";

export async function fetchNotifications(
  query: NotificationListQuery = {},
): Promise<NotificationListResult> {
  const response = await apiClient.get<ApiEnvelope<NotificationListResult>>(
    NOTIFICATIONS_ENDPOINT,
    {
      params: {
        page: query.page ?? 0,
        size: query.size ?? 10,
      },
    },
  );

  return unwrapRequiredResult(response.data, response.status, "알림 목록 result가 비어 있어요.");
}

export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  const response = await apiClient.get<ApiEnvelope<NotificationSettings>>(
    NOTIFICATION_SETTINGS_ENDPOINT,
  );

  return unwrapRequiredResult(response.data, response.status, "알림 설정 result가 비어 있어요.");
}

export async function updateNotificationSettings(
  requestBody: UpdateNotificationSettingsRequest,
): Promise<NotificationSettings> {
  const response = await apiClient.patch<ApiEnvelope<NotificationSettings>>(
    NOTIFICATION_SETTINGS_ENDPOINT,
    requestBody,
  );

  return unwrapRequiredResult(
    response.data,
    response.status,
    "알림 설정 저장 result가 비어 있어요.",
  );
}

export async function registerNotificationFcmToken(
  requestBody: RegisterNotificationTokenRequest,
  accessToken?: string,
): Promise<void> {
  const response = await apiClient.post<ApiEnvelope<Record<string, never>>>(
    NOTIFICATION_FCM_TOKEN_ENDPOINT,
    requestBody,
    accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : undefined,
  );

  unwrapEmptyResult(response.data, response.status);
}

export async function deleteNotificationFcmToken(
  requestBody: DeleteNotificationTokenRequest,
  accessToken?: string,
): Promise<void> {
  const response = await apiClient.delete<ApiEnvelope<Record<string, never>>>(
    NOTIFICATION_FCM_TOKEN_ENDPOINT,
    {
      data: requestBody,
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : undefined,
    },
  );

  unwrapEmptyResult(response.data, response.status);
}
