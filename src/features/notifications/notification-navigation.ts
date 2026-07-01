import { router } from "expo-router";

import {
  DAILY_REVIEW_REMINDER_TYPE,
  DAILY_REVIEW_ROUTE,
  DAILY_REVIEW_SCREEN,
} from "@/features/notifications/constants";

type NotificationData = {
  screen?: unknown;
  type?: unknown;
};

export function isDailyReviewReminderData(data: NotificationData | undefined) {
  return data?.type === DAILY_REVIEW_REMINDER_TYPE || data?.screen === DAILY_REVIEW_SCREEN;
}

export function navigateFromNotificationData(data: NotificationData | undefined) {
  if (!isDailyReviewReminderData(data)) {
    return false;
  }

  router.push(DAILY_REVIEW_ROUTE);
  return true;
}
