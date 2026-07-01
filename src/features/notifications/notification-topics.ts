import {
  getMessaging,
  subscribeToTopic,
  unsubscribeFromTopic,
} from "@react-native-firebase/messaging";

import {
  DAILY_REVIEW_REMINDER_TOPIC,
  WEEKLY_FASHION_REPORT_TOPIC,
} from "@/features/notifications/constants";

const APP_NOTIFICATION_TOPICS = [DAILY_REVIEW_REMINDER_TOPIC, WEEKLY_FASHION_REPORT_TOPIC] as const;

export async function subscribeDailyReviewReminderTopic() {
  await subscribeToTopic(getMessaging(), DAILY_REVIEW_REMINDER_TOPIC);
}

export async function unsubscribeDailyReviewReminderTopic() {
  await unsubscribeFromTopic(getMessaging(), DAILY_REVIEW_REMINDER_TOPIC);
}

export async function subscribeAppNotificationTopics() {
  const messaging = getMessaging();

  await Promise.all(APP_NOTIFICATION_TOPICS.map((topic) => subscribeToTopic(messaging, topic)));
}

export async function unsubscribeAppNotificationTopics() {
  const messaging = getMessaging();

  await Promise.all(APP_NOTIFICATION_TOPICS.map((topic) => unsubscribeFromTopic(messaging, topic)));
}
