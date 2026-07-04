import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

const getMock = vi.fn();
const postMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: getMock,
    post: postMock,
  },
}));

const weeklyReviewResult = {
  weekStartDate: "2026-06-22",
  weekEndDate: "2026-06-28",
  wornClothesCount: 2,
  weeklyClosetUsageRate: 50,
  weeklyInsight: "좋아요.",
  categories: [],
};

const dailyReviewTodayResult = {
  reviewDate: "2026-06-29",
  weekStartDate: "2026-06-29",
  weekEndDate: "2026-07-05",
  completed: false,
  previousDayIncomplete: false,
  noRegisteredClothes: false,
  categories: [],
};

const businessFailureEnvelope = {
  isSuccess: false,
  code: "WEEKLY_REVIEW_404",
  message: "회고가 없습니다.",
  result: null,
};

describe("weekly-review-api", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
  });

  it("fetches today's daily review from the today endpoint", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: dailyReviewTodayResult,
      },
    });

    const { fetchDailyReviewToday } = await import("./weekly-review-api");

    await expect(fetchDailyReviewToday()).resolves.toEqual(dailyReviewTodayResult);
    expect(getMock).toHaveBeenCalledWith("/api/daily-reviews/today");
  });

  it("fetches current weekly review from the current endpoint", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: weeklyReviewResult,
      },
    });

    const { fetchCurrentWeeklyReview } = await import("./weekly-review-api");

    await expect(fetchCurrentWeeklyReview()).resolves.toEqual(weeklyReviewResult);
    expect(getMock).toHaveBeenCalledWith("/api/weekly-reviews/current");
  });

  it("throws ApiError when current weekly review returns business failure", async () => {
    getMock.mockResolvedValueOnce({
      status: 404,
      data: businessFailureEnvelope,
    });

    const { fetchCurrentWeeklyReview } = await import("./weekly-review-api");

    const request = fetchCurrentWeeklyReview();

    await expect(request).rejects.toBeInstanceOf(ApiError);
    await expect(request).rejects.toMatchObject({ code: "WEEKLY_REVIEW_404" });
  });

  it("throws ApiError when today's daily review returns business failure", async () => {
    getMock.mockResolvedValueOnce({
      status: 404,
      data: businessFailureEnvelope,
    });

    const { fetchDailyReviewToday } = await import("./weekly-review-api");

    await expect(fetchDailyReviewToday()).rejects.toMatchObject({
      code: "WEEKLY_REVIEW_404",
    });
  });

  it("throws INVALID_RESPONSE when today's daily review result is empty", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: null,
      },
    });

    const { fetchDailyReviewToday } = await import("./weekly-review-api");

    await expect(fetchDailyReviewToday()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("throws INVALID_RESPONSE when today's daily review result is malformed", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {},
      },
    });

    const { fetchDailyReviewToday } = await import("./weekly-review-api");

    await expect(fetchDailyReviewToday()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("throws INVALID_RESPONSE when current weekly review envelope is malformed", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: { ok: true },
    });

    const { fetchCurrentWeeklyReview } = await import("./weekly-review-api");

    await expect(fetchCurrentWeeklyReview()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("throws INVALID_RESPONSE when current weekly review result is empty", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: null,
      },
    });

    const { fetchCurrentWeeklyReview } = await import("./weekly-review-api");

    await expect(fetchCurrentWeeklyReview()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("throws INVALID_RESPONSE when current weekly review result is malformed", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {},
      },
    });

    const { fetchCurrentWeeklyReview } = await import("./weekly-review-api");

    await expect(fetchCurrentWeeklyReview()).rejects.toMatchObject({
      code: "INVALID_RESPONSE",
    });
  });

  it("saves daily review clothes ids to the review date endpoint", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: weeklyReviewResult,
      },
    });

    const { saveDailyReview } = await import("./weekly-review-api");

    await expect(
      saveDailyReview({ reviewDate: "2026-06-29", clothesIds: [1, 2] }),
    ).resolves.toEqual(weeklyReviewResult);
    expect(postMock).toHaveBeenCalledWith("/api/daily-reviews/2026-06-29", {
      clothesIds: [1, 2],
    });
  });

  it("throws ApiError when saving daily review returns business failure", async () => {
    postMock.mockResolvedValueOnce({
      status: 400,
      data: businessFailureEnvelope,
    });

    const { saveDailyReview } = await import("./weekly-review-api");

    await expect(
      saveDailyReview({ reviewDate: "2026-06-29", clothesIds: [1] }),
    ).rejects.toMatchObject({
      code: "WEEKLY_REVIEW_404",
    });
  });

  it("falls back to current weekly review when save daily review result is empty", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: null,
      },
    });
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: weeklyReviewResult,
      },
    });

    const { saveDailyReview } = await import("./weekly-review-api");

    await expect(saveDailyReview({ reviewDate: "2026-06-29", clothesIds: [1] })).resolves.toEqual(
      weeklyReviewResult,
    );
    expect(getMock).toHaveBeenCalledWith("/api/weekly-reviews/current");
  });

  it("falls back to current weekly review when save daily review result is malformed", async () => {
    postMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {},
      },
    });
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: weeklyReviewResult,
      },
    });

    const { saveDailyReview } = await import("./weekly-review-api");

    await expect(saveDailyReview({ reviewDate: "2026-06-29", clothesIds: [1] })).resolves.toEqual(
      weeklyReviewResult,
    );
    expect(getMock).toHaveBeenCalledWith("/api/weekly-reviews/current");
  });
});
