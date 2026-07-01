import { router } from "expo-router";

import {
  DAILY_REVIEW_REMINDER_TYPE,
  DAILY_REVIEW_ROUTE,
  DAILY_REVIEW_SCREEN,
  WEEKLY_FASHION_REPORT_ROUTE,
  WEEKLY_FASHION_REPORT_SCREEN,
  WEEKLY_FASHION_REPORT_TYPE,
} from "@/features/notifications/constants";

type NotificationData = {
  screen?: unknown;
  type?: unknown;
  weekStartDate?: unknown;
};

export function isDailyReviewReminderData(data: NotificationData | undefined) {
  return data?.type === DAILY_REVIEW_REMINDER_TYPE || data?.screen === DAILY_REVIEW_SCREEN;
}

export function isWeeklyFashionReportData(data: NotificationData | undefined) {
  return data?.type === WEEKLY_FASHION_REPORT_TYPE || data?.screen === WEEKLY_FASHION_REPORT_SCREEN;
}

function getWeekStartDate(data: NotificationData | undefined) {
  if (typeof data?.weekStartDate !== "string") {
    return null;
  }

  const weekStartDate = data.weekStartDate.trim();

  return /^\d{4}-\d{2}-\d{2}$/.test(weekStartDate) ? weekStartDate : null;
}

export function navigateFromNotificationData(data: NotificationData | undefined) {
  if (isDailyReviewReminderData(data)) {
    router.push(DAILY_REVIEW_ROUTE);
    return true;
  }

  if (isWeeklyFashionReportData(data)) {
    const weekStartDate = getWeekStartDate(data);

    if (!weekStartDate) {
      return false;
    }

    router.push({
      pathname: WEEKLY_FASHION_REPORT_ROUTE,
      params: { weekStartDate },
    });
    return true;
  }

  return false;
}
