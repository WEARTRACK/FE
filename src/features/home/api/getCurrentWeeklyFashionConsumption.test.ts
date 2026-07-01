import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api/client";
import { getCurrentWeeklyFashionConsumption } from "./getCurrentWeeklyFashionConsumption";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const weeklyConsumptionResponse = {
  weekStartDate: "2026-06-21",
  weekEndDate: "2026-06-27",
  totalExpenseAmount: 114_000,
  expenseChangeRate: -23,
  categories: [
    { category: "T-SHIRT", expenseAmount: "89000" },
    { category: "SHIRT", expenseAmount: 25_000 },
  ],
};

const weeklyConsumption = {
  ...weeklyConsumptionResponse,
  categories: [
    { category: "T-SHIRT", expenseAmount: 89_000 },
    { category: "SHIRT", expenseAmount: 25_000 },
  ],
};

const successResponse = {
  data: {
    isSuccess: true,
    code: "COMMON_200",
    message: "요청에 성공했습니다.",
    result: weeklyConsumptionResponse,
  },
};

describe("getCurrentWeeklyFashionConsumption", () => {
  const getMock = vi.mocked(apiClient.get);

  beforeEach(() => {
    getMock.mockReset();
    getMock.mockResolvedValue(successResponse);
  });

  it("requests the current weekly report with default pagination", async () => {
    await expect(getCurrentWeeklyFashionConsumption()).resolves.toEqual(weeklyConsumption);

    expect(getMock).toHaveBeenCalledWith("/api/fashion-consumption/reports/weekly/current", {
      params: { page: 0, size: 10 },
    });
  });

  it("passes custom pagination parameters", async () => {
    await getCurrentWeeklyFashionConsumption({ page: 1, size: 13 });

    expect(getMock).toHaveBeenCalledWith("/api/fashion-consumption/reports/weekly/current", {
      params: { page: 1, size: 13 },
    });
  });

  it("accepts a null change rate when the previous week has no spending", async () => {
    getMock.mockResolvedValue({
      ...successResponse,
      data: {
        ...successResponse.data,
        result: {
          ...weeklyConsumptionResponse,
          expenseChangeRate: null,
        },
      },
    });

    await expect(getCurrentWeeklyFashionConsumption()).resolves.toMatchObject({
      totalExpenseAmount: 114_000,
      expenseChangeRate: null,
    });
  });
});
