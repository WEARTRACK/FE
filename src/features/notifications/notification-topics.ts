import {
  getMessaging,
  subscribeToTopic,
  unsubscribeFromTopic,
} from "@react-native-firebase/messaging";

import { DAILY_REVIEW_REMINDER_TOPIC } from "@/features/notifications/constants";

export async function subscribeDailyReviewReminderTopic() {
  await subscribeToTopic(getMessaging(), DAILY_REVIEW_REMINDER_TOPIC);
}

export async function unsubscribeDailyReviewReminderTopic() {
  await unsubscribeFromTopic(getMessaging(), DAILY_REVIEW_REMINDER_TOPIC);
}
