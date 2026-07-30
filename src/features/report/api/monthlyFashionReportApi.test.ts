import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api/client";
import { getMonthlyFashionReport } from "./monthlyFashionReportApi";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const result = {
  yearMonth: "2026-06",
  monthStartDate: "2026-06-01",
  monthEndDate: "2026-06-30",
  totalExpenseAmount: 0,
  expenseChangeRate: -100,
  monthlyExpenses: [
    { yearMonth: "2026-03", expenseAmount: 0 },
    { yearMonth: "2026-04", expenseAmount: 0 },
    { yearMonth: "2026-05", expenseAmount: 924_300 },
    { yearMonth: "2026-06", expenseAmount: 0 },
  ],
  topCategories: [],
};

describe("getMonthlyFashionReport", () => {
  const getMock = vi.mocked(apiClient.get);

  beforeEach(() => {
    getMock.mockReset();
    getMock.mockResolvedValue({
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "요청에 성공했습니다.",
        result,
      },
    });
  });

  it("requests the current monthly report", async () => {
    await expect(getMonthlyFashionReport()).resolves.toEqual(result);
    expect(getMock).toHaveBeenCalledWith("/api/fashion-consumption/reports/monthly/current", {
      params: { page: 0, size: 10 },
    });
  });

  it("requests a report for the selected month", async () => {
    getMock.mockResolvedValue({
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "요청에 성공했습니다.",
        result: {
          ...result,
          yearMonth: "2026-05",
          totalExpenseAmount: 924_300,
          expenseChangeRate: null,
          topCategories: [{ category: "COAT", percentage: 17 }],
        },
      },
    });

    await expect(getMonthlyFashionReport({ yearMonth: "2026-05" })).resolves.toMatchObject({
      yearMonth: "2026-05",
      expenseChangeRate: null,
      topCategories: [{ category: "COAT", percentage: 17 }],
    });
    expect(getMock).toHaveBeenCalledWith("/api/fashion-consumption/reports/monthly/2026-05", {
      params: { page: 0, size: 10 },
    });
  });
});
