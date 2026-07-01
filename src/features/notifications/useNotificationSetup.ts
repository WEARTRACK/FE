import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import type { RemoteMessage } from "@react-native-firebase/messaging";
import {
  getInitialNotification,
  getMessaging,
  onMessage,
  onNotificationOpenedApp,
  setBackgroundMessageHandler,
} from "@react-native-firebase/messaging";

import { navigateFromNotificationData } from "@/features/notifications/notification-navigation";
import { requestNotificationPermission } from "@/features/notifications/notification-permission";
import {
  subscribeDailyReviewReminderTopic,
  unsubscribeDailyReviewReminderTopic,
} from "@/features/notifications/notification-topics";
import { useSessionStore } from "@/stores/useSessionStore";

const messaging = getMessaging();

setBackgroundMessageHandler(messaging, async (remoteMessage) => {
  void remoteMessage;
});

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

export function useNotificationSetup() {
  const accessToken = useSessionStore((state) => state.accessToken);
  const topicSubscribedRef = useRef(false);

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
    let active = true;

    async function syncDailyReviewReminderTopic() {
      try {
        if (accessToken) {
          const granted = await requestNotificationPermission();

          if (!active || !granted || topicSubscribedRef.current) {
            return;
          }

          await subscribeDailyReviewReminderTopic();
          topicSubscribedRef.current = true;
          return;
        }

        if (!topicSubscribedRef.current) {
          return;
        }

        await unsubscribeDailyReviewReminderTopic();
        topicSubscribedRef.current = false;
      } catch (error) {
        console.warn("[FCM] Failed to sync daily review reminder topic", error);
      }
    }

    syncDailyReviewReminderTopic();

    return () => {
      active = false;
    };
  }, [accessToken]);
}
