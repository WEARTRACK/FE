import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api/errors";

import {
  assertApiEnvelope,
  assertDailyReviewTodayResultApi,
  assertWeeklyReviewResultApi,
  isApiEnvelope,
  isDailyReviewTodayResultApi,
  isWeeklyReviewResultApi,
  unwrapApiEnvelope,
  type ApiEnvelope,
} from "./weekly-review-api-types";

const validDailyReviewTodayResult = {
  reviewDate: "2026-06-29",
  weekStartDate: "2026-06-29",
  weekEndDate: "2026-07-05",
  completed: false,
  previousDayIncomplete: false,
  noRegisteredClothes: false,
  categories: [
    {
      category: "tshirt",
      selectedCount: 1,
      clothes: [
        {
          clothesId: 1,
          imageUrl: "https://example.com/a.png",
          color: "white",
          category: "tshirt",
          selected: true,
        },
      ],
    },
  ],
};

const validWeeklyReviewResult = {
  weekStartDate: "2026-06-22",
  weekEndDate: "2026-06-28",
  wornClothesCount: 1,
  totalClothesCount: 3,
  weeklyClosetUsageRate: 33,
  weeklyInsight: "좋아요.",
  categories: [
    {
      category: "tshirt",
      wornCount: 1,
      clothes: [
        {
          clothesId: 1,
          imageUrl: "https://example.com/a.png",
          color: "white",
        },
      ],
    },
  ],
};

describe("weekly-review-api-types", () => {
  it("validates API envelope shape", () => {
    expect(isApiEnvelope({ isSuccess: true, code: "COMMON_200", message: "ok" })).toBe(true);
    expect(isApiEnvelope({ isSuccess: true, code: "COMMON_200" })).toBe(false);
    expect(isApiEnvelope(null)).toBe(false);
  });

  it("throws INVALID_RESPONSE when envelope shape is invalid", () => {
    expect(() => assertApiEnvelope({ ok: true }, "invalid envelope")).toThrowError(ApiError);

    try {
      assertApiEnvelope({ ok: true }, "invalid envelope");
    } catch (error) {
      expect(error).toMatchObject({ code: "INVALID_RESPONSE", status: null });
    }
  });

  it("throws ApiError when envelope is a business failure", () => {
    const failedEnvelope: ApiEnvelope<unknown> = {
      isSuccess: false,
      code: "WEEKLY_REVIEW_404",
      message: "회고가 없습니다.",
      result: { reason: "missing" },
    };

    expect(() => unwrapApiEnvelope(failedEnvelope, 404, "empty result")).toThrowError(ApiError);

    try {
      unwrapApiEnvelope(failedEnvelope, 404, "empty result");
    } catch (error) {
      expect(error).toMatchObject({
        code: "WEEKLY_REVIEW_404",
        status: 404,
        details: { reason: "missing" },
      });
    }
  });

  it("throws INVALID_RESPONSE when successful envelope has empty result", () => {
    const emptyEnvelope: ApiEnvelope<unknown> = {
      isSuccess: true,
      code: "COMMON_200",
      message: "ok",
      result: null,
    };

    expect(() => unwrapApiEnvelope(emptyEnvelope, 200, "empty result")).toThrowError(ApiError);

    try {
      unwrapApiEnvelope(emptyEnvelope, 200, "empty result");
    } catch (error) {
      expect(error).toMatchObject({ code: "INVALID_RESPONSE", status: null });
    }
  });

  it("validates daily review today result shape", () => {
    expect(isDailyReviewTodayResultApi(validDailyReviewTodayResult)).toBe(true);
    expect(
      isDailyReviewTodayResultApi({
        ...validDailyReviewTodayResult,
        categories: [{ ...validDailyReviewTodayResult.categories[0], selectedCount: "1" }],
      }),
    ).toBe(false);
  });

  it("validates weekly review result shape", () => {
    expect(isWeeklyReviewResultApi(validWeeklyReviewResult)).toBe(true);
    expect(
      isWeeklyReviewResultApi({
        ...validWeeklyReviewResult,
        weeklyClosetUsageRate: "33",
      }),
    ).toBe(false);
  });

  it("throws INVALID_RESPONSE when result shape is malformed", () => {
    expect(() => assertDailyReviewTodayResultApi({}, "invalid daily result")).toThrowError(
      ApiError,
    );
    expect(() => assertWeeklyReviewResultApi({}, "invalid weekly result")).toThrowError(ApiError);
  });
});
