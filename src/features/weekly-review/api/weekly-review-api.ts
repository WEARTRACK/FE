import { apiClient } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

import {
  assertDailyReviewTodayResultApi,
  assertApiEnvelope,
  assertWeeklyLongUnwornClothesResultApi,
  assertWeeklyClosetUsageAnalysisResultApi,
  assertWeeklyReviewResultApi,
  assertWeeklyWornClothesResultApi,
  type ApiEnvelope,
  type DailyReviewTodayResultApi,
  type SaveDailyReviewTodayRequestBody,
  type SaveDailyReviewTodayParams,
  type WeeklyLongUnwornClothesResultApi,
  type WeeklyClosetUsageAnalysisResultApi,
  type WeeklyReviewResultApi,
  type WeeklyWornClothesResultApi,
  unwrapApiEnvelope,
} from "./weekly-review-api-types";
import type {
  WeeklyLongUnwornClothesCategory,
  WeeklyLongUnwornClothesItem,
  WeeklyLongUnwornClothesResult,
} from "../types/weekly-review";

const DAILY_REVIEWS_TODAY_ENDPOINT = "/api/daily-reviews/today";
const WEEKLY_REVIEWS_CURRENT_ENDPOINT = "/api/weekly-reviews/current";
const WEEKLY_CLOSET_USAGE_ANALYSIS_ENDPOINT = "/api/home/weekly-closet-usage/analysis";
const WEEKLY_CLOSET_USAGE_WORN_CLOTHES_ENDPOINT = "/api/home/weekly-closet-usage/worn-clothes";
const WEEKLY_LONG_UNWORN_CLOTHES_ENDPOINT = "/api/weekly-reviews/current/long-unworn-clothes";

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

export async function saveDailyReview({
  reviewDate,
  clothesIds,
}: SaveDailyReviewTodayParams): Promise<WeeklyReviewResultApi> {
  const requestBody: SaveDailyReviewTodayRequestBody = {
    clothesIds,
  };

  const response = await apiClient.post<ApiEnvelope<WeeklyReviewResultApi>>(
    `/api/daily-reviews/${encodeURIComponent(reviewDate)}`,
    requestBody,
  );
  const envelope = assertApiEnvelope<WeeklyReviewResultApi>(
    response.data,
    "오늘 입은 옷 저장 응답 형식이 올바르지 않아요.",
  );

  try {
    return assertWeeklyReviewResultApi(
      unwrapApiEnvelope(envelope, response.status, "오늘 입은 옷 저장 result가 비어 있어요."),
      "오늘 입은 옷 저장 result 형식이 올바르지 않아요.",
    );
  } catch (error) {
    if (error instanceof ApiError && error.code === "INVALID_RESPONSE") {
      return fetchCurrentWeeklyReview();
    }

    throw error;
  }
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

export async function fetchWeeklyClosetUsageAnalysis(): Promise<WeeklyClosetUsageAnalysisResultApi> {
  const response = await apiClient.get<ApiEnvelope<WeeklyClosetUsageAnalysisResultApi>>(
    WEEKLY_CLOSET_USAGE_ANALYSIS_ENDPOINT,
  );
  const envelope = assertApiEnvelope<WeeklyClosetUsageAnalysisResultApi>(
    response.data,
    "옷장 분석 조회 응답 형식이 올바르지 않아요.",
  );

  return assertWeeklyClosetUsageAnalysisResultApi(
    unwrapApiEnvelope(envelope, response.status, "옷장 분석 조회 result가 비어 있어요."),
    "옷장 분석 조회 result 형식이 올바르지 않아요.",
  );
}

export async function fetchWeeklyWornClothes(): Promise<WeeklyWornClothesResultApi> {
  const response = await apiClient.get<ApiEnvelope<WeeklyWornClothesResultApi>>(
    WEEKLY_CLOSET_USAGE_WORN_CLOTHES_ENDPOINT,
  );
  const envelope = assertApiEnvelope<WeeklyWornClothesResultApi>(
    response.data,
    "이번 주 입은 옷 조회 응답 형식이 올바르지 않아요.",
  );

  return assertWeeklyWornClothesResultApi(
    unwrapApiEnvelope(envelope, response.status, "이번 주 입은 옷 조회 result가 비어 있어요."),
    "이번 주 입은 옷 조회 result 형식이 올바르지 않아요.",
  );
}

export async function fetchWeeklyLongUnwornClothes(): Promise<WeeklyLongUnwornClothesResult> {
  const response = await apiClient.get<ApiEnvelope<WeeklyLongUnwornClothesResultApi>>(
    WEEKLY_LONG_UNWORN_CLOTHES_ENDPOINT,
  );
  const envelope = assertApiEnvelope<WeeklyLongUnwornClothesResultApi>(
    response.data,
    "장기 미착용 옷 조회 응답 형식이 올바르지 않아요.",
  );

  const result = assertWeeklyLongUnwornClothesResultApi(
    unwrapApiEnvelope(envelope, response.status, "장기 미착용 옷 조회 result가 비어 있어요."),
    "장기 미착용 옷 조회 result 형식이 올바르지 않아요.",
  );

  return normalizeWeeklyLongUnwornClothesResult(result);
}

export function normalizeWeeklyLongUnwornClothesResult(
  result: WeeklyLongUnwornClothesResultApi,
): WeeklyLongUnwornClothesResult {
  const categories: WeeklyLongUnwornClothesCategory[] = result.categories.map((category) => ({
    category: category.category,
    unwornCount: category.unwornCount,
    clothes: category.clothes.map(
      (item): WeeklyLongUnwornClothesItem => ({
        clothesId: item.clothesId,
        imageUrl: item.imageUrl,
        color: item.color,
        category: category.category,
      }),
    ),
  }));

  return {
    periodStartDate: result.periodStartDate,
    periodEndDate: result.periodEndDate,
    longUnwornClothesCount: result.longUnwornClothesCount,
    categories,
    clothes: categories.flatMap((category) => category.clothes),
  };
}
