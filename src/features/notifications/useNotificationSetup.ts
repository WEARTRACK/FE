import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { RemoteMessage } from "@react-native-firebase/messaging";
import {
  getToken,
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";

import {
  deleteNotificationFcmToken,
  fetchNotificationSettings,
  registerNotificationFcmToken,
} from "@/features/notifications/api/notification-api";
import type { NotificationTokenSyncState } from "@/features/notifications/api/notification-api-types";
import {
  getNotificationTokenSyncState,
  setNotificationTokenSyncState,
} from "@/features/notifications/data/notification-token-sync-storage";
import {
  clearForcedNotificationTokenSync,
  clearPendingNotificationTokenDeletionIfMatches,
  deleteNotificationTokenSnapshot,
  deleteStoredNotificationTokenForMember,
  getNotificationTokenSyncRevision,
  getNotificationDeviceType,
  isNotificationTokenSyncPaused,
  resolvePendingNotificationTokenDeletion,
  shouldForceNotificationTokenSync,
  subscribeNotificationTokenSyncRevision,
} from "@/features/notifications/utils/notification-token-sync";
import { navigateFromNotificationData } from "@/features/notifications/notification-navigation";
import { hasNotificationPermission } from "@/features/notifications/notification-permission";
import { showAlert } from "@/lib/ui/showAlert";
import { useSessionStore } from "@/stores/useSessionStore";

const messaging = getMessaging();

setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  void remoteMessage;
});

function showForegroundNotification(remoteMessage: RemoteMessage) {
  const title = remoteMessage.notification?.title ?? "WEARTRACK";
  const body = remoteMessage.notification?.body ?? "오늘 입은 옷을\n기록해보세요.";

  showAlert({
    title,
    message: body,
    confirmText: "열기",
    cancelText: "나중에",
    dismissible: false,
    onConfirm: () => {
      navigateFromNotificationData(remoteMessage.data);
    },
  });
}

async function registerNotificationToken({
  accessToken,
  memberId,
  onRegistered,
  shouldContinue = () => true,
  token,
}: {
  accessToken: string;
  memberId: number;
  onRegistered?: (state: NotificationTokenSyncState) => void;
  shouldContinue?: () => boolean;
  token: string;
}) {
  if (isNotificationTokenSyncPaused()) {
    return null;
  }

  const deviceType = getNotificationDeviceType();
  const storedState = await getNotificationTokenSyncState();
  const shouldForceSync = shouldForceNotificationTokenSync();
  const nextState: NotificationTokenSyncState = {
    memberId,
    registeredToken: token,
    deviceType,
    registeredAt: new Date().toISOString(),
  };

  if (
    !shouldForceSync &&
    storedState?.memberId === memberId &&
    storedState.registeredToken === token &&
    storedState.deviceType === deviceType
  ) {
    await clearPendingNotificationTokenDeletionIfMatches(memberId, token);
    return storedState;
  }

  await registerNotificationFcmToken({ token, deviceType }, accessToken);

  if (!shouldContinue() || isNotificationTokenSyncPaused()) {
    try {
      await deleteNotificationFcmToken({ token }, accessToken);
    } catch (error) {
      console.warn("[FCM] Failed to delete inactive notification token", error);
    }

    return null;
  }

  onRegistered?.(nextState);
  await setNotificationTokenSyncState(nextState);
  await clearPendingNotificationTokenDeletionIfMatches(memberId, token);
  clearForcedNotificationTokenSync();

  if (storedState?.memberId === memberId && storedState.registeredToken !== token) {
    try {
      await deleteNotificationFcmToken({ token: storedState.registeredToken }, accessToken);
    } catch (error) {
      console.warn("[FCM] Failed to delete previous notification token", error);
    }
  }

  return nextState;
}

async function getCurrentNotificationToken() {
  const granted = await hasNotificationPermission();

  if (!granted) {
    return null;
  }

  const token = await getToken(messaging);

  if (!token) {
    return null;
  }

  return token;
}

export function useNotificationSetup() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const memberId = useSessionStore((state) => state.memberId);
  const hasAccessToken = Boolean(accessToken);
  const accessTokenRef = useRef(accessToken);
  const memberIdRef = useRef(memberId);
  const pushEnabledRef = useRef(false);
  const lastSyncedTokenStateRef = useRef<NotificationTokenSyncState | null>(null);
  const tokenRefreshUnsubscribeRef = useRef<null | (() => void)>(null);
  const [syncRevision, setSyncRevision] = useState(getNotificationTokenSyncRevision);

  useLayoutEffect(() => {
    accessTokenRef.current = accessToken;
    memberIdRef.current = memberId;
  }, [accessToken, memberId]);

  useEffect(() => {
    return subscribeNotificationTokenSyncRevision(() => {
      setSyncRevision(getNotificationTokenSyncRevision());
    });
  }, []);

  useEffect(() => {
    const unsubscribeForeground = onMessage(messaging, (remoteMessage) => {
      showForegroundNotification(remoteMessage);
    });

    const unsubscribeOpened = onNotificationOpenedApp(messaging, (remoteMessage) => {
      navigateFromNotificationData(remoteMessage.data);
    });

    getInitialNotification(messaging)
      .then((remoteMessage) => {
        navigateFromNotificationData(remoteMessage?.data);
      })
      .catch((error) => {
        console.warn("[FCM] Failed to read initial notification", error);
      });

    return () => {
      unsubscribeForeground();
      unsubscribeOpened();
    };
  }, []);

  useEffect(() => {
    const cleanupAccessToken = accessTokenRef.current;

    if (!cleanupAccessToken || !memberId) {
      tokenRefreshUnsubscribeRef.current?.();
      tokenRefreshUnsubscribeRef.current = null;
      return undefined;
    }

    if (isNotificationTokenSyncPaused()) {
      tokenRefreshUnsubscribeRef.current?.();
      tokenRefreshUnsubscribeRef.current = null;
      return undefined;
    }

    let active = true;
    pushEnabledRef.current = false;
    let registrationQueue = Promise.resolve<NotificationTokenSyncState | null>(null);
    let tokenStateForCleanup: NotificationTokenSyncState | null =
      lastSyncedTokenStateRef.current?.memberId === memberId &&
      lastSyncedTokenStateRef.current.deviceType === getNotificationDeviceType()
        ? lastSyncedTokenStateRef.current
        : null;

    const rememberTokenState = (state: NotificationTokenSyncState) => {
      tokenStateForCleanup = state;
      lastSyncedTokenStateRef.current = state;
    };

    const enqueueTokenRegistration = (token: string) => {
      registrationQueue = registrationQueue
        .catch(() => null)
        .then(() => {
          const latestAccessToken = accessTokenRef.current;

          if (
            !active ||
            memberIdRef.current !== memberId ||
            !latestAccessToken ||
            isNotificationTokenSyncPaused()
          ) {
            return null;
          }

          return registerNotificationToken({
            accessToken: latestAccessToken,
            memberId,
            onRegistered: rememberTokenState,
            shouldContinue: () => active && memberIdRef.current === memberId,
            token,
          });
        });

      return registrationQueue;
    };

    resolvePendingNotificationTokenDeletion(cleanupAccessToken, memberId)
      .catch((error) => {
        console.warn("[FCM] Failed to delete pending notification token", error);
        return false;
      })
      .then(() => getNotificationTokenSyncState())
      .then((storedState) => {
        if (
          active &&
          storedState?.memberId === memberId &&
          storedState.deviceType === getNotificationDeviceType()
        ) {
          rememberTokenState(storedState);
        }

        return fetchNotificationSettings();
      })
      .then((settings) => {
        if (!active || memberIdRef.current !== memberId) {
          return null;
        }

        pushEnabledRef.current = settings.pushEnabled;

        if (!pushEnabledRef.current) {
          if (!tokenStateForCleanup) {
            return null;
          }

          const tokenStateToDelete = tokenStateForCleanup;

          return deleteNotificationTokenSnapshot(cleanupAccessToken, tokenStateToDelete).then(
            () => {
              if (tokenStateForCleanup === tokenStateToDelete) {
                tokenStateForCleanup = null;
                lastSyncedTokenStateRef.current = null;
              }

              return null;
            },
          );
        }

        return getCurrentNotificationToken();
      })
      .then((token) => {
        if (!active || !token || isNotificationTokenSyncPaused()) {
          return null;
        }

        return enqueueTokenRegistration(token);
      })
      .then((registeredState) => {
        if (active && registeredState) {
          rememberTokenState(registeredState);
        }
      })
      .catch((error) => {
        console.warn("[FCM] Failed to sync notification token", error);
      });

    tokenRefreshUnsubscribeRef.current?.();
    tokenRefreshUnsubscribeRef.current = onTokenRefresh(messaging, (token) => {
      if (!active || !pushEnabledRef.current || isNotificationTokenSyncPaused()) {
        return;
      }

      enqueueTokenRegistration(token)
        .then((registeredState) => {
          if (active && registeredState) {
            rememberTokenState(registeredState);
          }
        })
        .catch((error) => {
          console.warn("[FCM] Failed to register refreshed notification token", error);
        });
    });

    return () => {
      active = false;
      pushEnabledRef.current = false;
      tokenRefreshUnsubscribeRef.current?.();
      tokenRefreshUnsubscribeRef.current = null;

      if (isNotificationTokenSyncPaused()) {
        return;
      }

      if (memberIdRef.current === memberId) {
        return;
      }

      const cleanupTask = tokenStateForCleanup
        ? deleteNotificationTokenSnapshot(cleanupAccessToken, tokenStateForCleanup)
        : deleteStoredNotificationTokenForMember(cleanupAccessToken, memberId);

      cleanupTask.catch((error) => {
        console.warn("[FCM] Failed to delete notification token", error);
      });
    };
  }, [hasAccessToken, memberId, syncRevision]);
}
