import type { NotificationTokenSyncState } from "@/features/notifications/api/notification-api-types";
import { getStorageItem, removeStorageItem, setStorageItem } from "@/lib/storage/asyncStorage";
import { storageKeys } from "@/lib/storage/keys";

export async function getNotificationTokenSyncState() {
  return getStorageItem<NotificationTokenSyncState>(storageKeys.notificationTokenSync);
}

export async function setNotificationTokenSyncState(state: NotificationTokenSyncState) {
  await setStorageItem(storageKeys.notificationTokenSync, state);
}

export async function clearNotificationTokenSyncState() {
  await removeStorageItem(storageKeys.notificationTokenSync);
}
