import { describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/errors";

process.env.EXPO_PUBLIC_API_BASE_URL = "http://localhost:3000";

const getMock = vi.fn();

vi.mock("@/lib/api/client", () => ({
  apiClient: {
    get: getMock,
  },
}));

describe("fetchClothesDetail", () => {
  it("throws INVALID_RESPONSE when envelope shape is invalid", async () => {
    getMock.mockResolvedValueOnce({ status: 200, data: { ok: true } });

    const { fetchClothesDetail } = await import("./clothes-detail-api");

    await expect(fetchClothesDetail(1)).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("throws INVALID_RESPONSE when result shape is malformed", async () => {
    getMock.mockResolvedValueOnce({
      status: 200,
      data: {
        isSuccess: true,
        code: "COMMON_200",
        message: "ok",
        result: {
          clothesId: "1",
          imageUrl: "/uploads/a.png",
          color: "white",
          category: "knit",
          price: 100,
          sectionId: 2,
          sectionName: "상의",
        },
      },
    });

    const { fetchClothesDetail } = await import("./clothes-detail-api");

    await expect(fetchClothesDetail(1)).rejects.toMatchObject({ code: "INVALID_RESPONSE" });
  });

  it("throws ApiError when API returns business failure", async () => {
    getMock.mockResolvedValueOnce({
      status: 404,
      data: {
        isSuccess: false,
        code: "ERR_002",
        message: "찾을 수 없습니다.",
        result: null,
      },
    });

    const { fetchClothesDetail } = await import("./clothes-detail-api");

    await expect(fetchClothesDetail(1)).rejects.toBeInstanceOf(ApiError);
  });
});
