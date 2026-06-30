import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api/client";
import { getWeeklyCategoryClothes, getWeeklyFashionReport } from "./weeklyFashionReportApi";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe("weeklyFashionReportApi", () => {
  const getMock = vi.mocked(apiClient.get);

  beforeEach(() => {
    getMock.mockReset();
  });

  it("requests and maps a report for the selected week", async () => {
    getMock.mockResolvedValue({
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "요청에 성공했습니다.",
        result: {
          weekStartDate: "2026-06-07",
          weekEndDate: "2026-06-13",
          totalExpenseAmount: 89_000,
          expenseChangeRate: null,
          categories: [{ category: "T-SHIRT", expenseAmount: "89000" }],
        },
      },
    });

    await expect(getWeeklyFashionReport({ weekStartDate: "2026-06-07" })).resolves.toMatchObject({
      totalExpenseAmount: 89_000,
      expenseChangeRate: null,
      categories: [{ category: "T-SHIRT", expenseAmount: 89_000 }],
    });
    expect(getMock).toHaveBeenCalledWith("/api/fashion-consumption/reports/weekly/2026-06-07", {
      params: { page: 0, size: 13 },
    });
  });

  it("requests category clothes with the selected week and category", async () => {
    getMock.mockResolvedValue({
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "요청에 성공했습니다.",
        result: {
          weekStartDate: "2026-06-14",
          weekEndDate: "2026-06-20",
          category: "PANTS",
          clothes: [
            {
              clothesId: 12,
              imageUrl: "https://example.com/pants.jpg",
              productName: "와이드 팬츠",
              sourceShopName: "무신사",
              price: 49_000,
            },
          ],
        },
      },
    });

    await expect(
      getWeeklyCategoryClothes({
        weekStartDate: "2026-06-14",
        category: "PANTS",
      }),
    ).resolves.toMatchObject({
      category: "PANTS",
      clothes: [{ clothesId: 12, productName: "와이드 팬츠", color: null }],
    });
    expect(getMock).toHaveBeenCalledWith(
      "/api/fashion-consumption/reports/weekly/2026-06-14/categories/PANTS/clothes",
      { params: { page: 0, size: 10 } },
    );
  });
});
