import { apiClient } from "@/lib/api/client";

import {
  assertDailyReviewTodayResultApi,
  assertApiEnvelope,
  assertWeeklyReviewResultApi,
  type ApiEnvelope,
  type DailyReviewTodayResultApi,
  type SaveDailyReviewTodayRequestBody,
  type WeeklyReviewResultApi,
  unwrapApiEnvelope,
} from "./weekly-review-api-types";

const DAILY_REVIEWS_TODAY_ENDPOINT = "/api/daily-reviews/today";
const WEEKLY_REVIEWS_CURRENT_ENDPOINT = "/api/weekly-reviews/current";

export async function fetchDailyReviewToday(): Promise<DailyReviewTodayResultApi> {
  const response = await apiClient.get<ApiEnvelope<DailyReviewTodayResultApi>>(
    DAILY_REVIEWS_TODAY_ENDPOINT,
  );
  const envelope = assertApiEnvelope<DailyReviewTodayResultApi>(
    response.data,
    "오늘 입은 옷 조회 응답 형식이 올바르지 않아요.",
  );

  return assertDailyReviewTodayResultApi(
    unwrapApiEnvelope(envelope, response.status, "오늘 입은 옷 조회 result가 비어 있어요."),
    "오늘 입은 옷 조회 result 형식이 올바르지 않아요.",
  );
}

export async function saveDailyReviewToday(clothesIds: number[]): Promise<WeeklyReviewResultApi> {
  const requestBody: SaveDailyReviewTodayRequestBody = {
    clothesIds,
  };

  const response = await apiClient.post<ApiEnvelope<WeeklyReviewResultApi>>(
    DAILY_REVIEWS_TODAY_ENDPOINT,
    requestBody,
  );
  const envelope = assertApiEnvelope<WeeklyReviewResultApi>(
    response.data,
    "오늘 입은 옷 저장 응답 형식이 올바르지 않아요.",
  );

  return assertWeeklyReviewResultApi(
    unwrapApiEnvelope(envelope, response.status, "오늘 입은 옷 저장 result가 비어 있어요."),
    "오늘 입은 옷 저장 result 형식이 올바르지 않아요.",
  );
}

export async function fetchCurrentWeeklyReview(): Promise<WeeklyReviewResultApi> {
  const response = await apiClient.get<ApiEnvelope<WeeklyReviewResultApi>>(
    WEEKLY_REVIEWS_CURRENT_ENDPOINT,
  );
  const envelope = assertApiEnvelope<WeeklyReviewResultApi>(
    response.data,
    "이번 주 회고 조회 응답 형식이 올바르지 않아요.",
  );

  return assertWeeklyReviewResultApi(
    unwrapApiEnvelope(envelope, response.status, "이번 주 회고 조회 result가 비어 있어요."),
    "이번 주 회고 조회 result 형식이 올바르지 않아요.",
  );
}
