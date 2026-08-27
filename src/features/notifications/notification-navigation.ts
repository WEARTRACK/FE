import { router, type Href } from "expo-router";

import {
  DAILY_REVIEW_REMINDER_TYPE,
  DAILY_REVIEW_ROUTE,
  DAILY_REVIEW_SCREEN,
  WEEKLY_FASHION_REPORT_ROUTE,
  WEEKLY_FASHION_REPORT_SCREEN,
  WEEKLY_FASHION_REPORT_TYPE,
} from "@/features/notifications/constants";

type NotificationData = {
  body?: unknown;
  screen?: unknown;
  title?: unknown;
  type?: unknown;
};

const DAILY_REVIEW_TEXT_PATTERNS = ["오늘은 어떤 옷을 입었나요", "오늘 입은 옷을"];
const WEEKLY_FASHION_REPORT_TEXT_PATTERNS = [
  "이번 주 패션 지출",
  "이번주 패션 지출",
  "이번 주 패션소비",
  "이번주 패션소비",
];

function hasNotificationText(data: NotificationData | undefined, patterns: string[]) {
  const title = typeof data?.title === "string" ? data.title : "";
  const body = typeof data?.body === "string" ? data.body : "";
  const text = `${title} ${body}`;

  return patterns.some((pattern) => text.includes(pattern));
}

export function isDailyReviewReminderData(data: NotificationData | undefined) {
  return (
    data?.type === DAILY_REVIEW_REMINDER_TYPE ||
    data?.screen === DAILY_REVIEW_SCREEN ||
    hasNotificationText(data, DAILY_REVIEW_TEXT_PATTERNS)
  );
}

export function isWeeklyFashionReportData(data: NotificationData | undefined) {
  return (
    data?.type === WEEKLY_FASHION_REPORT_TYPE ||
    data?.screen === WEEKLY_FASHION_REPORT_SCREEN ||
    hasNotificationText(data, WEEKLY_FASHION_REPORT_TEXT_PATTERNS)
  );
}

function getNotificationRoute(data: NotificationData | undefined): Href | null {
  if (isDailyReviewReminderData(data)) {
    return DAILY_REVIEW_ROUTE;
  }

  if (isWeeklyFashionReportData(data)) {
    return WEEKLY_FASHION_REPORT_ROUTE;
  }

  return null;
}

export function canNavigateFromNotificationData(data: NotificationData | undefined) {
  return getNotificationRoute(data) !== null;
}

export function navigateFromNotificationData(data: NotificationData | undefined) {
  const route = getNotificationRoute(data);

  if (!route) {
    return false;
  }

  router.push(route);
  return true;
}
