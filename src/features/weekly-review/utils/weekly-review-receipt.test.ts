import { describe, expect, it, vi } from "vitest";

import type { WeeklyWornClothesResultApi } from "@/features/weekly-review/api/weekly-review-api-types";
import type { ClosetUsageProfile } from "@/features/weekly-review/types/weekly-review";
import { ApiError } from "@/lib/api/errors";

const resolveClosetImageUrlMock = vi.fn((imageUrl: string) => imageUrl);

vi.mock("@/features/closet/api/closet-api-mappers", () => ({
  resolveClosetImageUrl: resolveClosetImageUrlMock,
}));

const profile: ClosetUsageProfile = {
  type: "master",
  title: "마스터형 옷장",
  shortTitle: "마스터형",
  range: { min: 76, max: 100 },
  colorToken: "blue",
};

const wornClothesResult: WeeklyWornClothesResultApi = {
  weeklyClosetUsageRate: 86,
  closetUsageType: "master",
  wornClothesCount: 1,
  totalWornClothesPrice: 327300,
  wornClothes: [
    {
      clothesId: 1,
      imageUrl: "https://cdn.example.com/clothes/shirt.png",
      price: 327300,
    },
  ],
};

describe("createWeeklyReceiptReport", () => {
  it("keeps external HTTPS images when the shared closet resolver rejects the domain", async () => {
    resolveClosetImageUrlMock.mockImplementationOnce(() => {
      throw new ApiError({
        code: "INVALID_IMAGE_URL_DOMAIN",
        message: "imageUrl 도메인이 API 도메인과 일치하지 않습니다.",
        status: 500,
      });
    });

    const { createWeeklyReceiptReport } = await import("./weekly-review-receipt");

    const report = createWeeklyReceiptReport({
      profile,
      usageRate: 86,
      wornClothesResult,
    });

    expect(report.wornItems[0]?.imageUrl).toBe("https://cdn.example.com/clothes/shirt.png");
  });

  it("uses the current weekly review image URL fallback when available", async () => {
    const { createWeeklyReceiptReport } = await import("./weekly-review-receipt");

    const report = createWeeklyReceiptReport({
      imageUrlByClothesId: new Map([[1, "https://cdn.example.com/fallback.png"]]),
      profile,
      usageRate: 86,
      wornClothesResult,
    });

    expect(report.wornItems[0]?.imageUrl).toBe("https://cdn.example.com/fallback.png");
  });
});
