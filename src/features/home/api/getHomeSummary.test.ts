import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiClient } from "@/lib/api/client";
import { getHomeSummary } from "./getHomeSummary";

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

const homeSummary = {
  totalClothesCount: 8,
  weeklyExpenseAmount: 114_000,
  weeklyClosetUsageRate: 63,
  closetCount: 1,
  storageCount: 8,
};

const successResponse = {
  data: {
    isSuccess: true,
    code: "COMMON_200",
    message: "요청에 성공했습니다.",
    result: homeSummary,
  },
};

describe("getHomeSummary", () => {
  const getMock = vi.mocked(apiClient.get);

  beforeEach(() => {
    getMock.mockReset();
    getMock.mockResolvedValue(successResponse);
  });

  it("requests the first page with the API default page size", async () => {
    await expect(getHomeSummary()).resolves.toEqual(homeSummary);

    expect(getMock).toHaveBeenCalledWith("/api/home", {
      params: { page: 0, size: 10 },
    });
  });

  it("passes custom pagination parameters", async () => {
    await getHomeSummary({ page: 2, size: 20 });

    expect(getMock).toHaveBeenCalledWith("/api/home", {
      params: { page: 2, size: 20 },
    });
  });
});
