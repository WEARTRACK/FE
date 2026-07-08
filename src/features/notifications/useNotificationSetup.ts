import { useEffect, useRef } from "react";
import { Alert, Platform } from "react-native";
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
  registerNotificationFcmToken,
} from "@/features/notifications/api/notification-api";
import type {
  NotificationDeviceType,
  NotificationTokenSyncState,
} from "@/features/notifications/api/notification-api-types";
import {
  clearNotificationTokenSyncState,
  getNotificationTokenSyncState,
  setNotificationTokenSyncState,
} from "@/features/notifications/data/notification-token-sync-storage";
import { navigateFromNotificationData } from "@/features/notifications/notification-navigation";
import { requestNotificationPermission } from "@/features/notifications/notification-permission";
import { useSessionStore } from "@/stores/useSessionStore";

const messaging = getMessaging();

setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  void remoteMessage;
});

function getNotificationDeviceType(): NotificationDeviceType {
  return Platform.OS === "ios" ? "IOS" : "ANDROID";
}

function showForegroundNotification(remoteMessage: RemoteMessage) {
  const title = remoteMessage.notification?.title ?? "WEARTRACK";
  const body = remoteMessage.notification?.body ?? "오늘 입은 옷을 기록해보세요.";

  Alert.alert(title, body, [
    { text: "나중에", style: "cancel" },
    {
      text: "열기",
      onPress: () => {
        navigateFromNotificationData(remoteMessage.data);
      },
    },
  ]);
}

function isSameTokenSyncState(
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

async function deleteNotificationTokenSnapshot(
  accessToken: string,
  targetState: NotificationTokenSyncState | null,
) {
  if (!targetState) {
    return;
  }

  await deleteNotificationFcmToken({ token: targetState.registeredToken }, accessToken);

  const latestState = await getNotificationTokenSyncState();

  if (isSameTokenSyncState(latestState, targetState)) {
    await clearNotificationTokenSyncState();
  }
}

async function deleteStoredNotificationTokenForMember(accessToken: string, memberId: number) {
  const storedState = await getNotificationTokenSyncState();

  if (
    storedState?.memberId !== memberId ||
    storedState.deviceType !== getNotificationDeviceType()
  ) {
    return;
  }

  await deleteNotificationTokenSnapshot(accessToken, storedState);
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
  const deviceType = getNotificationDeviceType();
  const storedState = await getNotificationTokenSyncState();
  const nextState: NotificationTokenSyncState = {
    memberId,
    registeredToken: token,
    deviceType,
    registeredAt: new Date().toISOString(),
  };

  if (
    storedState?.memberId === memberId &&
    storedState.registeredToken === token &&
    storedState.deviceType === deviceType
  ) {
    return storedState;
  }

  await registerNotificationFcmToken({ token, deviceType }, accessToken);

  if (!shouldContinue()) {
    try {
      await deleteNotificationFcmToken({ token }, accessToken);
    } catch (error) {
      console.warn("[FCM] Failed to delete inactive notification token", error);
    }

    return null;
  }

  onRegistered?.(nextState);
  await setNotificationTokenSyncState(nextState);

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
  const granted = await requestNotificationPermission();

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
  const lastSyncedTokenStateRef = useRef<NotificationTokenSyncState | null>(null);
  const tokenRefreshUnsubscribeRef = useRef<null | (() => void)>(null);

  useEffect(() => {
    accessTokenRef.current = accessToken;
    memberIdRef.current = memberId;
  }, [accessToken, memberId]);

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
      return undefined;
    }

    let active = true;
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

          if (!active || memberIdRef.current !== memberId || !latestAccessToken) {
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

    getNotificationTokenSyncState()
      .then((storedState) => {
        if (
          active &&
          storedState?.memberId === memberId &&
          storedState.deviceType === getNotificationDeviceType()
        ) {
          rememberTokenState(storedState);
        }

        return getCurrentNotificationToken();
      })
      .then((token) => {
        if (!active || !token) {
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
      if (!active) {
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
      tokenRefreshUnsubscribeRef.current?.();
      tokenRefreshUnsubscribeRef.current = null;

      const cleanupTask = tokenStateForCleanup
        ? deleteNotificationTokenSnapshot(cleanupAccessToken, tokenStateForCleanup)
        : deleteStoredNotificationTokenForMember(cleanupAccessToken, memberId);

      cleanupTask.catch((error) => {
        console.warn("[FCM] Failed to delete notification token", error);
      });
    };
  }, [hasAccessToken, memberId]);
}
