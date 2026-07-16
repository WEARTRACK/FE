import type { NotificationTokenSyncState } from "@/features/notifications/api/notification-api-types";
import { getStorageItem, removeStorageItem, setStorageItem } from "@/lib/storage/asyncStorage";
import { storageKeys } from "@/lib/storage/keys";

function getPendingNotificationTokenDeletionStorageKey(memberId: number) {
  return `${storageKeys.notificationTokenPendingDelete}-${memberId}`;
}

export async function getNotificationTokenSyncState() {
  return getStorageItem<NotificationTokenSyncState>(storageKeys.notificationTokenSync);
}

export async function setNotificationTokenSyncState(state: NotificationTokenSyncState) {
  await setStorageItem(storageKeys.notificationTokenSync, state);
}

export async function clearNotificationTokenSyncState() {
  await removeStorageItem(storageKeys.notificationTokenSync);
}

export async function getPendingNotificationTokenDeletionState(memberId: number) {
  return getStorageItem<NotificationTokenSyncState>(
    getPendingNotificationTokenDeletionStorageKey(memberId),
  );
}

export async function setPendingNotificationTokenDeletionState(
  memberId: number,
  state: NotificationTokenSyncState,
) {
  await setStorageItem(getPendingNotificationTokenDeletionStorageKey(memberId), state);
}

export async function clearPendingNotificationTokenDeletionState(memberId: number) {
  await removeStorageItem(getPendingNotificationTokenDeletionStorageKey(memberId));
}
