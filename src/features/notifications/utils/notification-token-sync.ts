import { Platform } from "react-native";

import {
  deleteNotificationFcmToken,
  registerNotificationFcmToken,
} from "@/features/notifications/api/notification-api";
import type {
  NotificationDeviceType,
  NotificationTokenSyncState,
} from "@/features/notifications/api/notification-api-types";
import {
  clearPendingNotificationTokenDeletionState,
  clearNotificationTokenSyncState,
  getPendingNotificationTokenDeletionState,
  getNotificationTokenSyncState,
  setPendingNotificationTokenDeletionState,
  setNotificationTokenSyncState,
} from "@/features/notifications/data/notification-token-sync-storage";

let notificationTokenSyncPaused = false;
let notificationTokenSyncRevision = 0;
let shouldForceNotificationTokenRegistration = false;
const notificationTokenSyncRevisionListeners = new Set<() => void>();

type DeleteNotificationTokenSnapshotOptions = {
  clearStoredState?: boolean;
};

type ResumeNotificationTokenSyncOptions = {
  forceResync?: boolean;
};

function notifyNotificationTokenSyncRevisionListeners() {
  notificationTokenSyncRevision += 1;

  notificationTokenSyncRevisionListeners.forEach((listener) => {
    listener();
  });
}

export function getNotificationDeviceType(): NotificationDeviceType {
  return Platform.OS === "ios" ? "IOS" : "ANDROID";
}

export function pauseNotificationTokenSync() {
  if (notificationTokenSyncPaused) {
    return;
  }

  notificationTokenSyncPaused = true;
  notifyNotificationTokenSyncRevisionListeners();
}

export function resumeNotificationTokenSync(options: ResumeNotificationTokenSyncOptions = {}) {
  const { forceResync = false } = options;
  const shouldNotify = notificationTokenSyncPaused || forceResync;

  notificationTokenSyncPaused = false;

  if (forceResync) {
    shouldForceNotificationTokenRegistration = true;
  }

  if (shouldNotify) {
    notifyNotificationTokenSyncRevisionListeners();
  }
}

export function isNotificationTokenSyncPaused() {
  return notificationTokenSyncPaused;
}

export function getNotificationTokenSyncRevision() {
  return notificationTokenSyncRevision;
}

export function subscribeNotificationTokenSyncRevision(listener: () => void) {
  notificationTokenSyncRevisionListeners.add(listener);

  return () => {
    notificationTokenSyncRevisionListeners.delete(listener);
  };
}

export function shouldForceNotificationTokenSync() {
  return shouldForceNotificationTokenRegistration;
}

export function clearForcedNotificationTokenSync() {
  shouldForceNotificationTokenRegistration = false;
}

async function getPendingNotificationTokenDeletionSnapshotForMember(memberId: number | null) {
  if (memberId === null) {
    return null;
  }

  const pendingState = await getPendingNotificationTokenDeletionState(memberId);

  if (!pendingState || pendingState.deviceType !== getNotificationDeviceType()) {
    return null;
  }

  return pendingState;
}

export async function savePendingNotificationTokenDeletion(
  snapshot: NotificationTokenSyncState | null,
) {
  if (!snapshot) {
    return false;
  }

  await setPendingNotificationTokenDeletionState(snapshot.memberId, snapshot);
  return true;
}

export async function preservePendingNotificationTokenDeletionForMember(memberId: number | null) {
  const snapshot = await getNotificationTokenSnapshot(memberId);
  return savePendingNotificationTokenDeletion(snapshot);
}

export async function clearPendingNotificationTokenDeletionIfMatches(
  memberId: number,
  token: string,
) {
  const pendingState = await getPendingNotificationTokenDeletionSnapshotForMember(memberId);

  if (!pendingState || pendingState.registeredToken !== token) {
    return false;
  }

  await clearPendingNotificationTokenDeletionState(memberId);
  return true;
}

export async function resolvePendingNotificationTokenDeletion(
  accessToken: string,
  memberId: number | null,
) {
  const pendingState = await getPendingNotificationTokenDeletionSnapshotForMember(memberId);

  if (!pendingState) {
    return false;
  }

  await deleteNotificationFcmToken({ token: pendingState.registeredToken }, accessToken);
  await clearPendingNotificationTokenDeletionState(pendingState.memberId);
  return true;
}

function isSameNotificationTokenSyncState(
  a: NotificationTokenSyncState | null,
  b: NotificationTokenSyncState | null,
) {
  if (!a || !b) {
    return false;
  }

  return (
    a.memberId === b.memberId &&
    a.registeredToken === b.registeredToken &&
    a.deviceType === b.deviceType
  );
}

export async function getNotificationTokenSnapshot(memberId: number | null) {
  if (memberId === null) {
    return null;
  }

  const storedState = await getNotificationTokenSyncState();

  if (!storedState) {
    return null;
  }

  if (storedState.memberId !== memberId || storedState.deviceType !== getNotificationDeviceType()) {
    return null;
  }

  return storedState;
}

export async function deleteNotificationTokenSnapshot(
  accessToken: string,
  snapshot: NotificationTokenSyncState | null,
  options: DeleteNotificationTokenSnapshotOptions = {},
) {
  if (!snapshot) {
    return false;
  }

  await deleteNotificationFcmToken({ token: snapshot.registeredToken }, accessToken);
  await clearPendingNotificationTokenDeletionIfMatches(snapshot.memberId, snapshot.registeredToken);

  if (options.clearStoredState === false) {
    return true;
  }

  try {
    const latestState = await getNotificationTokenSyncState();

    if (isSameNotificationTokenSyncState(latestState, snapshot)) {
      await clearNotificationTokenSyncState();
    }
  } catch (error) {
    shouldForceNotificationTokenRegistration = true;
    throw error;
  }

  return true;
}

export async function deleteStoredNotificationTokenForMember(
  accessToken: string,
  memberId: number,
) {
  const snapshot = await getNotificationTokenSnapshot(memberId);
  return deleteNotificationTokenSnapshot(accessToken, snapshot);
}

export async function restoreNotificationTokenSnapshot(
  accessToken: string,
  snapshot: NotificationTokenSyncState | null,
) {
  if (!snapshot) {
    return false;
  }

  await registerNotificationFcmToken(
    {
      token: snapshot.registeredToken,
      deviceType: snapshot.deviceType,
    },
    accessToken,
  );
  await setNotificationTokenSyncState(snapshot);
  await clearPendingNotificationTokenDeletionIfMatches(snapshot.memberId, snapshot.registeredToken);
  clearForcedNotificationTokenSync();

  return true;
}

export async function clearNotificationTokenSyncStateForMember(memberId: number | null) {
  const snapshot = await getNotificationTokenSnapshot(memberId);

  if (!snapshot) {
    return false;
  }

  await clearNotificationTokenSyncState();
  return true;
}
